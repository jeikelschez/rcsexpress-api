const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

const clienteOrigDesc =
  '(CASE WHEN (ci_rif_cte_conta_org IS NULL || ci_rif_cte_conta_org = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `Mmovimientos`.cod_cliente_org = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `Mmovimientos`.cod_agencia = clientes_particulares.cod_agencia' +
  ' AND `Mmovimientos`.cod_cliente_org = clientes_particulares.cod_cliente' +
  ' AND `Mmovimientos`.ci_rif_cte_conta_org = clientes_particulares.rif_ci' +
  ' AND clientes_particulares.estatus = "A" LIMIT 1)' +
  ' END)';
const clienteDestDesc =
  '(CASE WHEN (ci_rif_cte_conta_dest IS NULL || ci_rif_cte_conta_dest = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `Mmovimientos`.cod_cliente_dest = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `Mmovimientos`.cod_agencia_dest = clientes_particulares.cod_agencia' +
  ' AND `Mmovimientos`.cod_cliente_dest = clientes_particulares.cod_cliente' +
  ' AND `Mmovimientos`.ci_rif_cte_conta_dest = clientes_particulares.rif_ci' +
  ' AND clientes_particulares.estatus = "A" LIMIT 1)' +
  ' END)';
const valorDolar =
  'IFNULL((SELECT valor FROM historico_dolar hd WHERE hd.fecha = fecha_emision),0)';
const yearFecha = 'YEAR(fecha_emision)';
const monthFecha =
  '(CASE WHEN MONTH(fecha_emision) = 1 THEN "Enero"' +
  ' WHEN MONTH(fecha_emision) = 2 THEN "Febrero"' +
  ' WHEN MONTH(fecha_emision) = 3 THEN "Marzo"' +
  ' WHEN MONTH(fecha_emision) = 4 THEN "Abril"' +
  ' WHEN MONTH(fecha_emision) = 5 THEN "Mayo"' +
  ' WHEN MONTH(fecha_emision) = 6 THEN "Junio"' +
  ' WHEN MONTH(fecha_emision) = 7 THEN "Julio"' +
  ' WHEN MONTH(fecha_emision) = 8 THEN "Agosto"' +
  ' WHEN MONTH(fecha_emision) = 9 THEN "Septiembre"' +
  ' WHEN MONTH(fecha_emision) = 10 THEN "Octubre"' +
  ' WHEN MONTH(fecha_emision) = 11 THEN "Noviembre"' +
  ' WHEN MONTH(fecha_emision) = 12 THEN "Diciembre" END)';
const clienteDesc =
  '(CASE WHEN pagado_en = "O"' +
  ' THEN (SELECT nb_cliente FROM clientes cl' +
  ' WHERE cl.id = cod_cliente_org)' +
  ' ELSE (SELECT nb_cliente FROM clientes cl' +
  ' WHERE cl.id = cod_cliente_dest) END)';

class ReporteVentasService {
  async mainReport(doc, tipo, data) {
    data = JSON.parse(data);
    let ventas = [];
    let where = {};

    switch (tipo) {
      case 'VG':
        where = {
          fecha_emision: {
            [Sequelize.Op.between]: [
              moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            ],
          },
          estatus_administra: {
            [Sequelize.Op.ne]: 'A',
          },
          t_de_documento: 'GC',
        };

        if (data.agencia) where.cod_agencia = data.agencia;
        if (data.agente) where.cod_agente_venta = data.agente;

        ventas = await models.Mmovimientos.findAll({
          where: where,
          attributes: [
            'id',
            'cod_agencia',
            'fecha_emision',
            'nro_documento',
            'nro_piezas',
            'peso_kgs',
            'modalidad_pago',
            'pagado_en',
            'monto_subtotal',
            'monto_impuesto',
            'valor_declarado_seg',
            'porc_apl_seguro',
            [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
            [Sequelize.literal(clienteDestDesc), 'cliente_dest_desc'],
            [Sequelize.literal(valorDolar), 'valor_dolar'],
          ],
          include: [
            {
              model: models.Agencias,
              as: 'agencias',
              attributes: ['nb_agencia'],
            },
            {
              model: models.Agencias,
              as: 'agencias_dest',
              attributes: ['id'],
              include: [
                {
                  model: models.Ciudades,
                  as: 'ciudades',
                  attributes: ['siglas'],
                },
              ],
            },
            {
              model: models.Agentes,
              as: 'agentes_venta',
              attributes: ['persona_responsable'],
            },
          ],
          order: [
            ['cod_agencia', 'ASC'],
            ['fecha_emision', 'ASC'],
          ],
          raw: true,
        });
        if (ventas.length == 0) return false;
        break;
      case 'VC':
        where = {
          fecha_emision: {
            [Sequelize.Op.between]: [
              moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            ],
          },
          estatus_administra: {
            [Sequelize.Op.ne]: 'A',
          },
          t_de_documento: 'GC',
          [Sequelize.Op.or]: [
            {
              [Sequelize.Op.and]: [
                { cod_agencia: data.agencia },
                { cod_cliente_org: data.cliente },
                { pagado_en: 'O' },
              ],
            },
            {
              [Sequelize.Op.and]: [
                { cod_agencia_dest: data.agencia },
                { cod_cliente_dest: data.cliente },
                { pagado_en: 'D' },
              ],
            },
          ],
        };

        if (!data.serie.includes('44'))
          where.nro_documento = {
            [Sequelize.Op.gt]: 550000000,
          };

        if (!data.serie.includes('55'))
          where.nro_documento = {
            [Sequelize.Op.lte]: 550000000,
          };

        ventas = await models.Mmovimientos.findAll({
          where: where,
          attributes: [
            'id',
            'cod_agencia',
            'fecha_emision',
            'nro_documento',
            'nro_piezas',
            'peso_kgs',
            'carga_neta',
            'modalidad_pago',
            'pagado_en',
            'monto_subtotal',
            'monto_impuesto',
            'valor_declarado_seg',
            'porc_apl_seguro',
            'dimensiones',
            [Sequelize.literal(clienteDestDesc), 'cliente_dest_desc'],
            [Sequelize.literal(valorDolar), 'valor_dolar'],
          ],
          include: [
            {
              model: models.Agencias,
              as: 'agencias',
              attributes: ['nb_agencia'],
            },
            {
              model: models.Agencias,
              as: 'agencias_dest',
              attributes: ['id'],
              include: [
                {
                  model: models.Ciudades,
                  as: 'ciudades',
                  attributes: ['siglas'],
                },
              ],
            },
            {
              model: models.Clientes,
              as: 'clientes_org',
              attributes: ['nb_cliente'],
            },
          ],
          order: [
            ['fecha_emision', 'ASC'],
            ['nro_documento', 'ASC'],
          ],
          raw: true,
        });
        if (ventas.length == 0) return false;
        break;
      case 'VCM':
      case 'VCD':
      case 'TV':
      case 'TVC':
        case 'TVD':
        where = {
          fecha_emision: {
            [Sequelize.Op.between]: [
              moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            ],
          },
          estatus_administra: {
            [Sequelize.Op.ne]: 'A',
          },
          t_de_documento: 'GC',
        };

        let order = '';

        if (tipo == 'VCM' || tipo == 'VCD') {
          where[Sequelize.Op.or] = [
            {
              [Sequelize.Op.and]: [
                { cod_agencia: data.agencia },
                { cod_cliente_org: data.cliente },
                { pagado_en: 'O' },
              ],
            },
            {
              [Sequelize.Op.and]: [
                { cod_agencia_dest: data.agencia },
                { cod_cliente_dest: data.cliente },
                { pagado_en: 'D' },
              ],
            },
          ];
          order = [['fecha_emision', 'ASC']];
        } else if (tipo == 'TV') {
          if (data.agencia) where.cod_agencia = data.agencia;
          order = [
            ['cod_agencia', 'ASC'],
            ['fecha_emision', 'ASC'],
            ['nro_documento', 'ASC'],
          ];
        } else if (tipo == 'TVC') {
          if (data.agencia) where.cod_agencia = data.agencia;
          order = [['cliente_desc', 'ASC']];
        } else if (tipo == 'TVD') {
          if (data.agencia) where.cod_agencia = data.agencia;
          order = [['fecha_emision', 'ASC']];
        }

        if (!data.serie.includes('44'))
          where.nro_documento = {
            [Sequelize.Op.gt]: 550000000,
          };

        if (!data.serie.includes('55'))
          where.nro_documento = {
            [Sequelize.Op.lte]: 550000000,
          };

        ventas = await models.Mmovimientos.findAll({
          where: where,
          attributes: [
            'id',
            'cod_agencia',
            'fecha_emision',
            'nro_documento',
            'nro_piezas',
            'peso_kgs',
            'carga_neta',
            'modalidad_pago',
            'pagado_en',
            'monto_subtotal',
            'monto_impuesto',
            'valor_declarado_seg',
            'porc_apl_seguro',
            [Sequelize.literal(clienteDesc), 'cliente_desc'],
            [Sequelize.literal(valorDolar), 'valor_dolar'],
            [Sequelize.literal(yearFecha), 'year'],
            [Sequelize.literal(monthFecha), 'month'],
          ],
          include: [
            {
              model: models.Agencias,
              as: 'agencias',
              attributes: ['nb_agencia'],
            },
            {
              model: models.Agencias,
              as: 'agencias_dest',
              attributes: ['id'],
              include: [
                {
                  model: models.Ciudades,
                  as: 'ciudades',
                  attributes: ['siglas'],
                },
              ],
            },
            {
              model: models.Clientes,
              as: 'clientes_org',
              attributes: ['nb_cliente'],
            },
          ],
          order: order,
          raw: true,
        });

        if (ventas.length == 0) return false;

        // Agrupo los valores
        let guias = 0;
        let nroPiezas = 0;
        let pesoKgs = 0;
        let cargaNeta = 0;
        let montoContadoOrig = 0;
        let impContadoOrig = 0;
        let montoContadoDest = 0;
        let impContadoDest = 0;
        let montoCreditoOrig = 0;
        let impCreditoOrig = 0;
        let montoTotal = 0;
        let montoTotalDolar = 0;
        let montoOtros = 0;
        let montoOtrosDolar = 0;
        let ventasAgrArray = [];
        let ventasAgr = {};
        let groupFlag = false;

        for (var i = 0; i < ventas.length; i++) {
          if (i > 0) {
            if (
              tipo == 'VCM' &&
              (ventas[i].year != ventas[i - 1].year ||
                ventas[i].month != ventas[i - 1].month)
            ) {
              groupFlag = true;
              ventasAgr.mes = ventas[i - 1].month + '-' + ventas[i - 1].year;
            } else if (
              (tipo == 'VCD' || tipo == 'TVD') &&
              ventas[i].fecha_emision != ventas[i - 1].fecha_emision
            ) {
              groupFlag = true;
              ventasAgr.fecha_emision = moment(
                ventas[i - 1].fecha_emision
              ).format('DD/MM/YYYY');
            } else if (
              tipo == 'TV' &&
              ventas[i].cod_agencia != ventas[i - 1].cod_agencia
            ) {
              groupFlag = true;
              ventasAgr.agencia = ventas[i - 1]['agencias.nb_agencia'];
            } else if (
              tipo == 'TVC' &&
              ventas[i].cliente_desc != ventas[i - 1].cliente_desc
            ) {
              groupFlag = true;
              ventasAgr.cliente = ventas[i - 1].cliente_desc;
            }
          }

          if (groupFlag) {
            ventasAgr.nro_guias = guias;
            ventasAgr.nro_piezas = nroPiezas;
            ventasAgr.peso_kgs = pesoKgs.toFixed(2);
            ventasAgr.carga_neta = cargaNeta.toFixed(2);
            ventasAgr.monto_contado_orig = montoContadoOrig.toFixed(2);
            ventasAgr.monto_contado_dest = montoContadoDest.toFixed(2);
            ventasAgr.monto_credito_orig = montoCreditoOrig.toFixed(2);
            ventasAgr.imp_contado_orig = impContadoOrig.toFixed(2);
            ventasAgr.imp_contado_dest = impContadoDest.toFixed(2);
            ventasAgr.imp_credito_orig = impCreditoOrig.toFixed(2);
            ventasAgr.monto_total = montoTotal.toFixed(2);
            ventasAgr.monto_total_dolar = montoTotalDolar.toFixed(2);
            ventasAgr.monto_otros = montoOtros.toFixed(2);
            ventasAgr.monto_otros_dolar = montoOtrosDolar.toFixed(2);
            ventasAgrArray.push(ventasAgr);

            guias = 0;
            nroPiezas = 0;
            pesoKgs = 0;
            cargaNeta = 0;
            montoContadoOrig = 0;
            impContadoOrig = 0;
            montoContadoDest = 0;
            impContadoDest = 0;
            montoCreditoOrig = 0;
            impCreditoOrig = 0;
            montoTotal = 0;
            montoTotalDolar = 0;
            montoOtros = 0;
            montoOtrosDolar = 0;
            ventasAgr = {};
            groupFlag = false;
          }

          guias++;
          nroPiezas += utils.parseFloatN(ventas[i].nro_piezas);
          pesoKgs += utils.parseFloatN(ventas[i].peso_kgs);
          cargaNeta += utils.parseFloatN(ventas[i].carga_neta);
          if (ventas[i].modalidad_pago == 'CO') {
            if (ventas[i].pagado_en == 'O') {
              montoContadoOrig += utils.parseFloatN(ventas[i].monto_subtotal);
              impContadoOrig += utils.parseFloatN(ventas[i].monto_impuesto);
            } else {
              montoContadoDest += utils.parseFloatN(ventas[i].monto_subtotal);
              impContadoDest += utils.parseFloatN(ventas[i].monto_impuesto);
            }
          } else {
            montoCreditoOrig += utils.parseFloatN(ventas[i].monto_subtotal);
            impCreditoOrig += utils.parseFloatN(ventas[i].monto_impuesto);
          }
          montoTotal += utils.parseFloatN(ventas[i].monto_subtotal);
          montoOtros +=
            (utils.parseFloatN(ventas[i].valor_declarado_seg) *
              utils.parseFloatN(ventas[i].porc_apl_seguro)) /
            100;

          if (ventas[i].valor_dolar > 0) {
            montoTotalDolar +=
              utils.parseFloatN(ventas[i].monto_subtotal) /
              utils.parseFloatN(ventas[i].valor_dolar);
            montoOtrosDolar +=
              (utils.parseFloatN(ventas[i].valor_declarado_seg) *
                utils.parseFloatN(ventas[i].porc_apl_seguro)) /
              100 /
              utils.parseFloatN(ventas[i].valor_dolar);
          }
        }

        if (tipo == 'VCM') {
          ventasAgr.mes =
            ventas[ventas.length - 1].month +
            '-' +
            ventas[ventas.length - 1].year;
        } else if (tipo == 'VCD' || tipo == 'TVD') {
          ventasAgr.fecha_emision = moment(
            ventas[ventas.length - 1].fecha_emision
          ).format('DD/MM/YYYY');
        } else if (tipo == 'TV') {
          ventasAgr.agencia = ventas[ventas.length - 1]['agencias.nb_agencia'];
        } else if (tipo == 'TVC') {
          ventasAgr.cliente = ventas[ventas.length - 1].cliente_desc;
        }

        ventasAgr.nro_guias = guias;
        ventasAgr.nro_piezas = nroPiezas;
        ventasAgr.peso_kgs = pesoKgs.toFixed(2);
        ventasAgr.carga_neta = cargaNeta.toFixed(2);
        ventasAgr.monto_contado_orig = montoContadoOrig.toFixed(2);
        ventasAgr.monto_contado_dest = montoContadoDest.toFixed(2);
        ventasAgr.monto_credito_orig = montoCreditoOrig.toFixed(2);
        ventasAgr.imp_contado_orig = impContadoOrig.toFixed(2);
        ventasAgr.imp_contado_dest = impContadoDest.toFixed(2);
        ventasAgr.imp_credito_orig = impCreditoOrig.toFixed(2);
        ventasAgr.monto_total = montoTotal.toFixed(2);
        ventasAgr.monto_total_dolar = montoTotalDolar.toFixed(2);
        ventasAgr.monto_otros = montoOtros.toFixed(2);
        ventasAgr.monto_otros_dolar = montoOtrosDolar.toFixed(2);
        ventasAgrArray.push(ventasAgr);
        if (tipo == 'VCM' || tipo == 'VCD') {
          ventasAgrArray.agencia =
            ventas[ventas.length - 1]['agencias.nb_agencia'];
          ventasAgrArray.cliente =
            ventas[ventas.length - 1]['clientes_org.nb_cliente'];
        }
        ventas = ventasAgrArray;
        break;
      default:
        break;
    }

    data.ventas = ventas;    
    await this.generateHeader(doc, tipo, data);
    await this.generateCustomerInformation(doc, tipo, data);
    return true;
  }

  async generateHeader(doc, tipo, data) {
    switch (tipo) {
      case 'VG':
        doc.image('./img/logo_rc.png', 35, 25, { width: 80 });
        doc.fontSize(9);
        doc.text('RCS EXPRESS, S.A', 35, 155);
        doc.text('RIF. J-31028463-6', 35, 170);
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(18);
        doc.y = 100;
        doc.x = 285;
        doc.text('Ventas Generales', {
          align: 'center',
          columns: 1,
          width: 300,
        });
        doc.fontSize(12);
        doc.y = 130;
        doc.x = 320;
        doc.text('Desde: ' + data.fecha_desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 130;
        doc.x = 440;
        doc.text('Desde: ' + data.fecha_hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        if (data.agente && data.ventas.length > 0) {
          doc.y = 155;
          doc.x = 285;
          doc.text(
            'Agente: ' + data.ventas[0]['agentes_venta.persona_responsable'],
            {
              align: 'center',
              columns: 1,
              width: 300,
            }
          );
        }
        doc.fontSize(9);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 670, 35);
        doc.text('#', 35, 190);
        doc.text('Fecha', 47, 190);
        doc.text('Nro. Guía', 80, 190);
        doc.text('Remitente', 150, 190);
        doc.text('Destinatario', 280, 190);
        doc.text('Dest.', 380, 190);
        doc.text('Pzas', 410, 190);
        doc.text('Kgs.', 437, 190);
        doc.text('CONTADO', 495, 178);
        doc.text('Origen', 460, 190);
        doc.text('Imp.', 495, 190);
        doc.text('Destino', 520, 190);
        doc.text('Imp.', 560, 190);
        doc.text('CRÉDITO', 590, 178);
        doc.text('Monto', 585, 190);
        doc.text('Imp.', 620, 190);
        doc.text('Otros.', 645, 190);
        if (data.dolar == true) doc.text('Otr $.', 675, 190);
        doc.text('Total', 705, 183);
        doc.text('Venta', 705, 190);
        if (data.dolar == true) doc.text('Venta $.', 735, 190);
        break;
      case 'VC':
        doc.image('./img/logo_rc.png', 35, 25, { width: 80 });
        doc.fontSize(9);
        doc.text('RCS EXPRESS, S.A', 35, 155);
        doc.text('RIF. J-31028463-6', 35, 170);
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(18);
        doc.y = 90;
        doc.x = 285;
        doc.text('Ventas Generales por Cliente', {
          align: 'center',
          columns: 1,
          width: 300,
        });
        doc.fontSize(12);
        doc.y = 115;
        doc.x = 320;
        doc.text('Desde: ' + data.fecha_desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 115;
        doc.x = 440;
        doc.text('Desde: ' + data.fecha_hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 135;
        doc.x = 285;
        doc.text('Agencia: ' + data.ventas[0]['agencias.nb_agencia'], {
          align: 'center',
          columns: 1,
          width: 300,
        });
        doc.y = 150;
        doc.x = 285;
        doc.text('Cliente: ' + data.ventas[0]['clientes_org.nb_cliente'], {
          align: 'center',
          columns: 1,
          width: 300,
        });
        doc.fontSize(9);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 670, 35);
        doc.text('#', 35, 190);
        doc.text('Fecha', 47, 190);
        doc.text('Nro. Guía', 80, 190);
        doc.text('Nro. Fact. Cliente', 150, 190);
        doc.text('Destinatario', 280, 190);
        doc.text('Dest.', 380, 190);
        doc.text('Pzas', 410, 190);
        doc.text(data.neta ? 'Neta' : 'Kgs', 437, 190);
        doc.text('CONTADO', 495, 178);
        doc.text('Origen', 460, 190);
        doc.text('Imp.', 495, 190);
        doc.text('Destino', 520, 190);
        doc.text('Imp.', 560, 190);
        doc.text('CRÉDITO', 590, 178);
        doc.text('Monto', 585, 190);
        doc.text('Imp.', 620, 190);
        doc.text('Otros.', 645, 190);
        if (data.dolar == true) doc.text('Otr $.', 675, 190);
        doc.text('Total', 705, 183);
        doc.text('Venta', 705, 190);
        if (data.dolar == true) doc.text('Venta $.', 735, 190);
        break;
      case 'VCM':
      case 'VCD':
      case 'TV':
      case 'TVC':
        case 'TVD':
        let labelDoc = 'Ventas Generales';
        if (tipo == 'VCM') {
          labelDoc += ' por Cliente por Mes';
        } else if (tipo == 'VCD') {
          labelDoc += ' por Cliente por Día';
        } else if (tipo == 'TVC') {
          labelDoc += ' por Cliente';
        } else if (tipo == 'TVD') {
          labelDoc += ' por Día';
        }
        doc.image('./img/logo_rc.png', 35, 25, { width: 80 });
        doc.fontSize(9);
        doc.text('RCS EXPRESS, S.A', 35, 155);
        doc.text('RIF. J-31028463-6', 35, 170);
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(18);
        doc.y = 90;
        doc.x = 235;
        doc.text(labelDoc, {
          align: 'center',
          columns: 1,
          width: 400,
        });
        doc.fontSize(12);
        doc.y = 115;
        doc.x = 320;
        doc.text('Desde: ' + data.fecha_desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 115;
        doc.x = 440;
        doc.text('Desde: ' + data.fecha_hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });

        if (tipo == 'VCM' || tipo == 'VCD') {
          doc.y = 135;
          doc.x = 235;
          doc.text('Agencia: ' + data.ventas.agencia, {
            align: 'center',
            columns: 1,
            width: 400,
          });
          doc.y = 150;
          doc.x = 235;
          doc.text('Cliente: ' + data.ventas.cliente, {
            align: 'center',
            columns: 1,
            width: 400,
          });
        }

        let labelFirst;
        if (tipo == 'VCM') {
          labelFirst = ' MES';
        } else if (tipo == 'VCD' || tipo == 'TVD') {
          labelFirst = 'FECHA';
        } else if (tipo == 'TV') {
          labelFirst = 'Agencia';
        } else if (tipo == 'TVC') {
          labelFirst = 'Cliente';
        }

        doc.fontSize(9);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 670, 35);
        doc.text(labelFirst, tipo != 'TVC' ? 50 : 70, 190);
        doc.text('Guías', tipo != 'TVC' ? 120 : 150, 190);
        doc.text('Pzas', tipo != 'TVC' ? 180 : 190, 190);
        doc.text(data.neta ? 'Neta' : 'Kgs', 230, 190);
        doc.text('CONTADO', 330, 178);
        doc.text('Origen', 270, 190);
        doc.text('Imp.', 320, 190);
        doc.text('Destino', 370, 190);
        doc.text('Imp.', 420, 190);
        doc.text('CRÉDITO', 485, 178);
        doc.text('Monto', 470, 190);
        doc.text('Imp.', 520, 190);
        doc.text('Otros.', 560, 190);
        if (data.dolar == true) doc.text('Otr $.', 600, 190);
        doc.text('Total Venta', 645, 190);
        if (data.dolar == true) doc.text('Venta $.', 720, 190);
        break;
      default:
        break;
    }
  }

  async generateCustomerInformation(doc, tipo, data) {
    let totalNroGuias = 0;
    let totalNroPiezas = 0;
    let totalPesoKgs = 0;
    let totalContadoOrig = 0;
    let totalContadoDest = 0;
    let totalImpContadoOrig = 0;
    let totalImpContadoDest = 0;
    let totalCreditoOrig = 0;
    let totalImpCreditoOrig = 0;
    let totalMontoVenta = 0;
    let totalOtrosDolar = 0;
    let totalMontoOtros = 0;
    let totalVentaDolar = 0;
    let subTotalNroPiezas = 0;
    let subTotalPesoKgs = 0;
    let subTotalContadoOrig = 0;
    let subTotalContadoDest = 0;
    let subTotalImpContadoOrig = 0;
    let subTotalImpContadoDest = 0;
    let subTotalCreditoOrig = 0;
    let subTotalImpCreditoOrig = 0;
    let subTotalMontoVenta = 0;
    let subTotalOtrosDolar = 0;
    let subTotalMontoOtros = 0;
    let subTotalVentaDolar = 0;

    switch (tipo) {
      case 'VG':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 205;
        for (var item = 0; item < data.ventas.length; item++) {
          if (
            item == 0 ||
            data.ventas[item].cod_agencia != data.ventas[item - 1].cod_agencia
          ) {
            if (item > 0) i += 20;
            doc.fontSize(12);
            doc.font('Helvetica-Bold');
            doc.text(data.ventas[item]['agencias.nb_agencia'], 35, ymin + i);
            i += 17;
          }
          doc.fontSize(6);
          doc.font('Helvetica');
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 20;
          doc.text(item + 1, {
            align: 'right',
            columns: 1,
            width: 20,
          });
          doc.y = ymin + i;
          doc.x = 42;
          doc.text(
            moment(data.ventas[item].fecha_emision).format('DD/MM/YYYY'),
            {
              align: 'center',
              columns: 1,
              width: 40,
            }
          );
          doc.y = ymin + i;
          doc.x = 80;
          doc.text(data.ventas[item].nro_documento, {
            align: 'center',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 123;
          doc.text(utils.truncate(data.ventas[item].cliente_orig_desc, 29), {
            align: 'left',
            columns: 1,
            width: 120,
          });
          doc.y = ymin + i;
          doc.x = 233;
          doc.text(utils.truncate(data.ventas[item].cliente_dest_desc, 38), {
            align: 'left',
            columns: 1,
            width: 150,
          });
          doc.y = ymin + i;
          doc.x = 375;
          doc.text(data.ventas[item]['agencias_dest.ciudades.siglas'], {
            align: 'center',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 400;
          doc.text(data.ventas[item].nro_piezas, {
            align: 'right',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 430;
          doc.text(utils.formatNumber(data.ventas[item].peso_kgs), {
            align: 'right',
            columns: 1,
            width: 30,
          });

          let contadoOrig = 0;
          let contadoDest = 0;
          let impContadoOrig = 0;
          let impContadoDest = 0;
          let creditoOrig = 0;
          let impCreditoOrig = 0;
          let montoVenta = 0;
          let otrosDolar = 0;
          let montoOtros = 0;
          let ventaDolar = 0;

          if (data.visible == 'SI') {
            if (data.ventas[item].modalidad_pago == 'CO') {
              if (data.ventas[item].pagado_en == 'O') {
                contadoOrig = data.ventas[item].monto_subtotal;
                impContadoOrig = data.ventas[item].monto_impuesto;
              } else {
                contadoDest = data.ventas[item].monto_subtotal;
                impContadoDest = data.ventas[item].monto_impuesto;
              }
            } else {
              creditoOrig = data.ventas[item].monto_subtotal;
              impCreditoOrig = data.ventas[item].monto_impuesto;
            }

            montoVenta =
              utils.parseFloatN(contadoOrig) +
              utils.parseFloatN(contadoDest) +
              utils.parseFloatN(impContadoOrig) +
              utils.parseFloatN(impContadoDest) +
              utils.parseFloatN(creditoOrig) +
              utils.parseFloatN(impCreditoOrig);

            doc.y = ymin + i;
            doc.x = 450;
            doc.text(utils.formatNumber(contadoOrig), {
              align: 'right',
              columns: 1,
              width: 40,
            });
            doc.y = ymin + i;
            doc.x = 485;
            doc.text(utils.formatNumber(impContadoOrig), {
              align: 'right',
              columns: 1,
              width: 30,
            });
            doc.y = ymin + i;
            doc.x = 515;
            doc.text(utils.formatNumber(contadoDest), {
              align: 'right',
              columns: 1,
              width: 40,
            });
            doc.y = ymin + i;
            doc.x = 550;
            doc.text(utils.formatNumber(impContadoDest), {
              align: 'right',
              columns: 1,
              width: 30,
            });

            doc.y = ymin + i;
            doc.x = 575;
            doc.text(utils.formatNumber(creditoOrig), {
              align: 'right',
              columns: 1,
              width: 40,
            });
            doc.y = ymin + i;
            doc.x = 610;
            doc.text(utils.formatNumber(impCreditoOrig), {
              align: 'right',
              columns: 1,
              width: 30,
            });

            montoOtros =
              (data.ventas[item].valor_declarado_seg *
                data.ventas[item].porc_apl_seguro) /
              100;

            doc.y = ymin + i;
            doc.x = 640;
            doc.text(utils.formatNumber(montoOtros), {
              align: 'right',
              columns: 1,
              width: 30,
            });

            if (data.dolar == true) {
              if (data.ventas[item].valor_dolar > 0) {
                otrosDolar =
                  montoOtros / utils.parseFloatN(data.ventas[item].valor_dolar);
              }
              doc.y = ymin + i;
              doc.x = 655;
              doc.text(utils.formatNumber(otrosDolar.toFixed(2)), {
                align: 'right',
                columns: 1,
                width: 40,
              });
            }

            doc.y = ymin + i;
            doc.x = 685;
            doc.text(utils.formatNumber(montoVenta), {
              align: 'right',
              columns: 1,
              width: 50,
            });

            if (data.dolar == true) {
              if (data.ventas[item].valor_dolar > 0) {
                ventaDolar =
                  montoVenta / utils.parseFloatN(data.ventas[item].valor_dolar);
              }
              doc.y = ymin + i;
              doc.x = 725;
              doc.text(utils.formatNumber(ventaDolar.toFixed(2)), {
                align: 'right',
                columns: 1,
                width: 40,
              });
            }
          }

          // Sub Totales por Agencia
          if (
            item > 0 &&
            data.ventas[item].cod_agencia != data.ventas[item - 1].cod_agencia
          ) {
            doc.font('Helvetica-Bold');
            doc.y = ymin + i - 32;
            doc.x = 320;
            doc.fontSize(7);
            doc.text('Sub-Totales por Agencia:', {
              align: 'left',
              columns: 1,
              width: 100,
            });
            doc.fontSize(5);
            doc.y = ymin + i - 32;
            doc.x = 400;
            doc.text(subTotalNroPiezas, {
              align: 'right',
              columns: 1,
              width: 30,
            });
            doc.y = ymin + i - 32;
            doc.x = 430;
            doc.text(utils.formatNumber(subTotalPesoKgs), {
              align: 'right',
              columns: 1,
              width: 30,
            });
            if (data.visible == 'SI') {
              doc.y = ymin + i - 32;
              doc.x = 450;
              doc.text(utils.formatNumber(subTotalContadoOrig), {
                align: 'right',
                columns: 1,
                width: 40,
              });
              doc.y = ymin + i - 32;
              doc.x = 485;
              doc.text(utils.formatNumber(subTotalImpContadoOrig), {
                align: 'right',
                columns: 1,
                width: 30,
              });
              doc.y = ymin + i - 32;
              doc.x = 515;
              doc.text(utils.formatNumber(subTotalContadoDest), {
                align: 'right',
                columns: 1,
                width: 40,
              });
              doc.y = ymin + i - 32;
              doc.x = 550;
              doc.text(utils.formatNumber(subTotalImpContadoDest), {
                align: 'right',
                columns: 1,
                width: 30,
              });
              doc.y = ymin + i - 32;
              doc.x = 575;
              doc.text(utils.formatNumber(subTotalCreditoOrig), {
                align: 'right',
                columns: 1,
                width: 40,
              });
              doc.y = ymin + i - 32;
              doc.x = 610;
              doc.text(utils.formatNumber(subTotalImpCreditoOrig), {
                align: 'right',
                columns: 1,
                width: 30,
              });
              doc.y = ymin + i - 32;
              doc.x = 640;
              doc.text(utils.formatNumber(subTotalMontoOtros), {
                align: 'right',
                columns: 1,
                width: 30,
              });
              if (data.dolar == true) {
                doc.y = ymin + i - 32;
                doc.x = 655;
                doc.text(utils.formatNumber(subTotalOtrosDolar), {
                  align: 'right',
                  columns: 1,
                  width: 40,
                });
              }
              doc.y = ymin + i - 32;
              doc.x = 685;
              doc.text(utils.formatNumber(subTotalMontoVenta), {
                align: 'right',
                columns: 1,
                width: 50,
              });

              if (data.dolar == true) {
                doc.y = ymin + i - 32;
                doc.x = 725;
                doc.text(utils.formatNumber(subTotalVentaDolar), {
                  align: 'right',
                  columns: 1,
                  width: 40,
                });
              }
            }
            doc.fontSize(6);
            doc.font('Helvetica');
            i += 3;

            subTotalNroPiezas = 0;
            subTotalPesoKgs = 0;
            subTotalContadoOrig = 0;
            subTotalContadoDest = 0;
            subTotalImpContadoOrig = 0;
            subTotalImpContadoDest = 0;
            subTotalCreditoOrig = 0;
            subTotalImpCreditoOrig = 0;
            subTotalMontoVenta = 0;
            subTotalOtrosDolar = 0;
            subTotalMontoOtros = 0;
            subTotalVentaDolar = 0;
          }

          totalNroPiezas += utils.parseFloatN(data.ventas[item].nro_piezas);
          totalPesoKgs += utils.parseFloatN(data.ventas[item].peso_kgs);
          totalContadoOrig += utils.parseFloatN(contadoOrig);
          totalContadoDest += utils.parseFloatN(contadoDest);
          totalImpContadoOrig += utils.parseFloatN(impContadoOrig);
          totalImpContadoDest += utils.parseFloatN(impContadoDest);
          totalCreditoOrig += utils.parseFloatN(creditoOrig);
          totalImpCreditoOrig += utils.parseFloatN(impCreditoOrig);
          totalMontoVenta += utils.parseFloatN(montoVenta);
          totalOtrosDolar += utils.parseFloatN(otrosDolar);
          totalMontoOtros += utils.parseFloatN(montoOtros);
          totalVentaDolar += utils.parseFloatN(ventaDolar);

          subTotalNroPiezas += utils.parseFloatN(data.ventas[item].nro_piezas);
          subTotalPesoKgs += utils.parseFloatN(data.ventas[item].peso_kgs);
          subTotalContadoOrig += utils.parseFloatN(contadoOrig);
          subTotalContadoDest += utils.parseFloatN(contadoDest);
          subTotalImpContadoOrig += utils.parseFloatN(impContadoOrig);
          subTotalImpContadoDest += utils.parseFloatN(impContadoDest);
          subTotalCreditoOrig += utils.parseFloatN(creditoOrig);
          subTotalImpCreditoOrig += utils.parseFloatN(impCreditoOrig);
          subTotalMontoVenta += utils.parseFloatN(montoVenta);
          subTotalOtrosDolar += utils.parseFloatN(otrosDolar);
          subTotalMontoOtros += utils.parseFloatN(montoOtros);
          subTotalVentaDolar += utils.parseFloatN(ventaDolar);

          i += 8;
          if (i >= 370) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data);
          }
        }
        // Sub Totales por Agencia Finales
        i += 5;
        doc.font('Helvetica-Bold');
        doc.y = ymin + i;
        doc.x = 320;
        doc.fontSize(7);
        doc.text('Sub-Totales por Agencia:', {
          align: 'left',
          columns: 1,
          width: 100,
        });
        doc.fontSize(5);
        doc.y = ymin + i;
        doc.x = 400;
        doc.text(subTotalNroPiezas, {
          align: 'right',
          columns: 1,
          width: 30,
        });
        doc.y = ymin + i;
        doc.x = 430;
        doc.text(utils.formatNumber(subTotalPesoKgs), {
          align: 'right',
          columns: 1,
          width: 30,
        });
        if (data.visible == 'SI') {
          doc.y = ymin + i;
          doc.x = 450;
          doc.text(utils.formatNumber(subTotalContadoOrig), {
            align: 'right',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 485;
          doc.text(utils.formatNumber(subTotalImpContadoOrig), {
            align: 'right',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 515;
          doc.text(utils.formatNumber(subTotalContadoDest), {
            align: 'right',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 550;
          doc.text(utils.formatNumber(subTotalImpContadoDest), {
            align: 'right',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 575;
          doc.text(utils.formatNumber(subTotalCreditoOrig), {
            align: 'right',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 610;
          doc.text(utils.formatNumber(subTotalImpCreditoOrig), {
            align: 'right',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 640;
          doc.text(utils.formatNumber(subTotalMontoOtros), {
            align: 'right',
            columns: 1,
            width: 30,
          });
          if (data.dolar == true) {
            doc.y = ymin + i;
            doc.x = 655;
            doc.text(utils.formatNumber(subTotalOtrosDolar), {
              align: 'right',
              columns: 1,
              width: 40,
            });
          }
          doc.y = ymin + i;
          doc.x = 685;
          doc.text(utils.formatNumber(subTotalMontoVenta), {
            align: 'right',
            columns: 1,
            width: 50,
          });

          if (data.dolar == true) {
            doc.y = ymin + i;
            doc.x = 725;
            doc.text(utils.formatNumber(subTotalVentaDolar), {
              align: 'right',
              columns: 1,
              width: 40,
            });
          }
        }

        // Totales Finales
        i += 10;
        doc.font('Helvetica-Bold');
        doc.y = ymin + i;
        doc.x = 358;
        doc.fontSize(7);
        doc.text('Total General:', {
          align: 'left',
          columns: 1,
          width: 100,
        });
        doc.fontSize(5);
        doc.y = ymin + i;
        doc.x = 400;
        doc.text(totalNroPiezas, {
          align: 'right',
          columns: 1,
          width: 30,
        });
        doc.y = ymin + i;
        doc.x = 430;
        doc.text(utils.formatNumber(totalPesoKgs), {
          align: 'right',
          columns: 1,
          width: 30,
        });
        if (data.visible == 'SI') {
          doc.y = ymin + i;
          doc.x = 450;
          doc.text(utils.formatNumber(totalContadoOrig), {
            align: 'right',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 485;
          doc.text(utils.formatNumber(totalImpContadoOrig), {
            align: 'right',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 515;
          doc.text(utils.formatNumber(totalContadoDest), {
            align: 'right',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 550;
          doc.text(utils.formatNumber(totalImpContadoDest), {
            align: 'right',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 575;
          doc.text(utils.formatNumber(totalCreditoOrig), {
            align: 'right',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 610;
          doc.text(utils.formatNumber(totalImpCreditoOrig), {
            align: 'right',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 640;
          doc.text(utils.formatNumber(totalMontoOtros), {
            align: 'right',
            columns: 1,
            width: 30,
          });
          if (data.dolar == true) {
            doc.y = ymin + i;
            doc.x = 655;
            doc.text(utils.formatNumber(totalOtrosDolar), {
              align: 'right',
              columns: 1,
              width: 40,
            });
          }
          doc.y = ymin + i;
          doc.x = 685;
          doc.text(utils.formatNumber(totalMontoVenta), {
            align: 'right',
            columns: 1,
            width: 50,
          });

          if (data.dolar == true) {
            doc.y = ymin + i;
            doc.x = 725;
            doc.text(utils.formatNumber(totalVentaDolar), {
              align: 'right',
              columns: 1,
              width: 40,
            });
          }
        }
        break;
      case 'VC':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 205;
        for (var item = 0; item < data.ventas.length; item++) {
          doc.fontSize(6);
          doc.font('Helvetica');
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 20;
          doc.text(item + 1, {
            align: 'right',
            columns: 1,
            width: 20,
          });
          doc.y = ymin + i;
          doc.x = 42;
          doc.text(
            moment(data.ventas[item].fecha_emision).format('DD/MM/YYYY'),
            {
              align: 'center',
              columns: 1,
              width: 40,
            }
          );
          doc.y = ymin + i;
          doc.x = 80;
          doc.text(data.ventas[item].nro_documento, {
            align: 'center',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 123;
          doc.text(utils.truncate(data.ventas[item].dimensiones, 29), {
            align: 'left',
            columns: 1,
            width: 120,
          });
          doc.y = ymin + i;
          doc.x = 233;
          doc.text(utils.truncate(data.ventas[item].cliente_dest_desc, 38), {
            align: 'left',
            columns: 1,
            width: 150,
          });
          doc.y = ymin + i;
          doc.x = 375;
          doc.text(data.ventas[item]['agencias_dest.ciudades.siglas'], {
            align: 'center',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 400;
          doc.text(data.ventas[item].nro_piezas, {
            align: 'right',
            columns: 1,
            width: 30,
          });

          let monto_kgs = data.neta
            ? data.ventas[item].carga_neta
            : data.ventas[item].peso_kgs;

          doc.y = ymin + i;
          doc.x = 430;
          doc.text(utils.formatNumber(monto_kgs), {
            align: 'right',
            columns: 1,
            width: 30,
          });

          let contadoOrig = 0;
          let contadoDest = 0;
          let impContadoOrig = 0;
          let impContadoDest = 0;
          let creditoOrig = 0;
          let impCreditoOrig = 0;
          let montoVenta = 0;
          let otrosDolar = 0;
          let montoOtros = 0;
          let ventaDolar = 0;

          if (data.visible == 'SI') {
            if (data.ventas[item].modalidad_pago == 'CO') {
              if (data.ventas[item].pagado_en == 'O') {
                contadoOrig = data.ventas[item].monto_subtotal;
                impContadoOrig = data.ventas[item].monto_impuesto;
              } else {
                contadoDest = data.ventas[item].monto_subtotal;
                impContadoDest = data.ventas[item].monto_impuesto;
              }
            } else {
              creditoOrig = data.ventas[item].monto_subtotal;
              impCreditoOrig = data.ventas[item].monto_impuesto;
            }

            montoVenta =
              utils.parseFloatN(contadoOrig) +
              utils.parseFloatN(contadoDest) +
              utils.parseFloatN(impContadoOrig) +
              utils.parseFloatN(impContadoDest) +
              utils.parseFloatN(creditoOrig) +
              utils.parseFloatN(impCreditoOrig);

            doc.y = ymin + i;
            doc.x = 450;
            doc.text(utils.formatNumber(contadoOrig), {
              align: 'right',
              columns: 1,
              width: 40,
            });
            doc.y = ymin + i;
            doc.x = 485;
            doc.text(utils.formatNumber(impContadoOrig), {
              align: 'right',
              columns: 1,
              width: 30,
            });
            doc.y = ymin + i;
            doc.x = 515;
            doc.text(utils.formatNumber(contadoDest), {
              align: 'right',
              columns: 1,
              width: 40,
            });
            doc.y = ymin + i;
            doc.x = 550;
            doc.text(utils.formatNumber(impContadoDest), {
              align: 'right',
              columns: 1,
              width: 30,
            });

            doc.y = ymin + i;
            doc.x = 575;
            doc.text(utils.formatNumber(creditoOrig), {
              align: 'right',
              columns: 1,
              width: 40,
            });
            doc.y = ymin + i;
            doc.x = 610;
            doc.text(utils.formatNumber(impCreditoOrig), {
              align: 'right',
              columns: 1,
              width: 30,
            });

            montoOtros =
              (data.ventas[item].valor_declarado_seg *
                data.ventas[item].porc_apl_seguro) /
              100;

            doc.y = ymin + i;
            doc.x = 640;
            doc.text(utils.formatNumber(montoOtros), {
              align: 'right',
              columns: 1,
              width: 30,
            });

            if (data.dolar == true) {
              if (data.ventas[item].valor_dolar > 0) {
                otrosDolar =
                  montoOtros / utils.parseFloatN(data.ventas[item].valor_dolar);
              }
              doc.y = ymin + i;
              doc.x = 655;
              doc.text(utils.formatNumber(otrosDolar.toFixed(2)), {
                align: 'right',
                columns: 1,
                width: 40,
              });
            }

            doc.y = ymin + i;
            doc.x = 685;
            doc.text(utils.formatNumber(montoVenta), {
              align: 'right',
              columns: 1,
              width: 50,
            });

            if (data.dolar == true) {
              if (data.ventas[item].valor_dolar > 0) {
                ventaDolar =
                  montoVenta / utils.parseFloatN(data.ventas[item].valor_dolar);
              }
              doc.y = ymin + i;
              doc.x = 725;
              doc.text(utils.formatNumber(ventaDolar.toFixed(2)), {
                align: 'right',
                columns: 1,
                width: 40,
              });
            }
          }

          totalNroPiezas += utils.parseFloatN(data.ventas[item].nro_piezas);
          totalPesoKgs += utils.parseFloatN(monto_kgs);
          totalContadoOrig += utils.parseFloatN(contadoOrig);
          totalContadoDest += utils.parseFloatN(contadoDest);
          totalImpContadoOrig += utils.parseFloatN(impContadoOrig);
          totalImpContadoDest += utils.parseFloatN(impContadoDest);
          totalCreditoOrig += utils.parseFloatN(creditoOrig);
          totalImpCreditoOrig += utils.parseFloatN(impCreditoOrig);
          totalMontoVenta += utils.parseFloatN(montoVenta);
          totalOtrosDolar += utils.parseFloatN(otrosDolar);
          totalMontoOtros += utils.parseFloatN(montoOtros);
          totalVentaDolar += utils.parseFloatN(ventaDolar);

          i += 8;
          if (i >= 370) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data);
          }
        }

        // Totales Finales
        i += 10;
        doc.font('Helvetica-Bold');
        doc.y = ymin + i;
        doc.x = 358;
        doc.fontSize(7);
        doc.text('Total General:', {
          align: 'left',
          columns: 1,
          width: 100,
        });
        doc.fontSize(5);
        doc.y = ymin + i;
        doc.x = 400;
        doc.text(totalNroPiezas, {
          align: 'right',
          columns: 1,
          width: 30,
        });
        doc.y = ymin + i;
        doc.x = 430;
        doc.text(utils.formatNumber(totalPesoKgs), {
          align: 'right',
          columns: 1,
          width: 30,
        });
        if (data.visible == 'SI') {
          doc.y = ymin + i;
          doc.x = 450;
          doc.text(utils.formatNumber(totalContadoOrig), {
            align: 'right',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 485;
          doc.text(utils.formatNumber(totalImpContadoOrig), {
            align: 'right',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 515;
          doc.text(utils.formatNumber(totalContadoDest), {
            align: 'right',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 550;
          doc.text(utils.formatNumber(totalImpContadoDest), {
            align: 'right',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 575;
          doc.text(utils.formatNumber(totalCreditoOrig), {
            align: 'right',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 610;
          doc.text(utils.formatNumber(totalImpCreditoOrig), {
            align: 'right',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 640;
          doc.text(utils.formatNumber(totalMontoOtros), {
            align: 'right',
            columns: 1,
            width: 30,
          });
          if (data.dolar == true) {
            doc.y = ymin + i;
            doc.x = 655;
            doc.text(utils.formatNumber(totalOtrosDolar), {
              align: 'right',
              columns: 1,
              width: 40,
            });
          }
          doc.y = ymin + i;
          doc.x = 685;
          doc.text(utils.formatNumber(totalMontoVenta), {
            align: 'right',
            columns: 1,
            width: 50,
          });

          if (data.dolar == true) {
            doc.y = ymin + i;
            doc.x = 725;
            doc.text(utils.formatNumber(totalVentaDolar), {
              align: 'right',
              columns: 1,
              width: 40,
            });
          }
        }
        break;
      case 'VCM':
      case 'VCD':
      case 'TV':
      case 'TVC':
        case 'TVD':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 210;
        for (var item = 0; item < data.ventas.length; item++) {
          doc.font('Helvetica');
          doc.fillColor('#444444');

          if (tipo == 'VCM' || tipo == 'VCD' || tipo == 'TVD') {
            doc.fontSize(8);
            doc.y = ymin + i;
            doc.x = tipo == 'VCM' ? 35 : 47;
            doc.text(
              tipo == 'VCM'
                ? data.ventas[item].mes
                : data.ventas[item].fecha_emision,
              {
                align: 'left',
                columns: 1,
                width: 80,
              }
            );
            doc.y = ymin + i;
            doc.x = 90;
            doc.text(data.ventas[item].nro_guias, {
              align: 'right',
              columns: 1,
              width: 60,
            });
            doc.y = ymin + i;
            doc.x = 145;
            doc.text(data.ventas[item].nro_piezas, {
              align: 'right',
              columns: 1,
              width: 60,
            });
          } else if (tipo == 'TV' || tipo == 'TVC') {
            doc.fontSize(7);
            doc.y = ymin + i;
            doc.x = 30;
            doc.text(
              tipo == 'TV'
                ? data.ventas[item].agencia
                : data.ventas[item].cliente,
              {
                align: 'left',
                columns: 1,
                width: 130,
              }
            );
            doc.y = ymin + i;
            doc.x = 115;
            doc.text(data.ventas[item].nro_guias, {
              align: 'right',
              columns: 1,
              width: 60,
            });
            doc.y = ymin + i;
            doc.x = 150;
            doc.text(data.ventas[item].nro_piezas, {
              align: 'right',
              columns: 1,
              width: 60,
            });
          }

          let monto_kgs = data.neta
            ? data.ventas[item].carga_neta
            : data.ventas[item].peso_kgs;

          doc.y = ymin + i;
          doc.x = 195;
          doc.text(utils.formatNumber(monto_kgs), {
            align: 'right',
            columns: 1,
            width: 60,
          });

          if (data.visible == 'SI') {
            doc.y = ymin + i;
            doc.x = 250;
            doc.text(utils.formatNumber(data.ventas[item].monto_contado_orig), {
              align: 'right',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i;
            doc.x = 290;
            doc.text(utils.formatNumber(data.ventas[item].imp_contado_orig), {
              align: 'right',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i;
            doc.x = 355;
            doc.text(utils.formatNumber(data.ventas[item].monto_contado_dest), {
              align: 'right',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i;
            doc.x = 390;
            doc.text(utils.formatNumber(data.ventas[item].imp_contado_dest), {
              align: 'right',
              columns: 1,
              width: 50,
            });

            doc.y = ymin + i;
            doc.x = 450;
            doc.text(utils.formatNumber(data.ventas[item].monto_credito_orig), {
              align: 'right',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i;
            doc.x = 490;
            doc.text(utils.formatNumber(data.ventas[item].imp_credito_orig), {
              align: 'right',
              columns: 1,
              width: 50,
            });

            doc.y = ymin + i;
            doc.x = 540;
            doc.text(utils.formatNumber(data.ventas[item].monto_otros), {
              align: 'right',
              columns: 1,
              width: 50,
            });

            if (data.dolar == true) {
              doc.y = ymin + i;
              doc.x = 580;
              doc.text(
                utils.formatNumber(data.ventas[item].monto_otros_dolar),
                {
                  align: 'right',
                  columns: 1,
                  width: 50,
                }
              );
            }

            doc.y = ymin + i;
            doc.x = 650;
            doc.text(utils.formatNumber(data.ventas[item].monto_total), {
              align: 'right',
              columns: 1,
              width: 50,
            });

            if (data.dolar == true) {
              doc.y = ymin + i;
              doc.x = 710;
              doc.text(
                utils.formatNumber(data.ventas[item].monto_total_dolar),
                {
                  align: 'right',
                  columns: 1,
                  width: 50,
                }
              );
            }
          }

          totalNroGuias += utils.parseFloatN(data.ventas[item].nro_guias);
          totalNroPiezas += utils.parseFloatN(data.ventas[item].nro_piezas);
          totalPesoKgs += utils.parseFloatN(monto_kgs);
          totalContadoOrig += utils.parseFloatN(
            data.ventas[item].monto_contado_orig
          );
          totalContadoDest += utils.parseFloatN(
            data.ventas[item].monto_contado_dest
          );
          totalImpContadoOrig += utils.parseFloatN(
            data.ventas[item].imp_contado_orig
          );
          totalImpContadoDest += utils.parseFloatN(
            data.ventas[item].imp_contado_dest
          );
          totalCreditoOrig += utils.parseFloatN(
            data.ventas[item].monto_credito_orig
          );
          totalImpCreditoOrig += utils.parseFloatN(
            data.ventas[item].imp_credito_orig
          );
          totalMontoVenta += utils.parseFloatN(data.ventas[item].monto_total);
          totalOtrosDolar += utils.parseFloatN(
            data.ventas[item].monto_otros_dolar
          );
          totalMontoOtros += utils.parseFloatN(data.ventas[item].monto_otros);
          totalVentaDolar += utils.parseFloatN(
            data.ventas[item].monto_total_dolar
          );

          i += tipo == 'TVC' ? 20 : 15;
          if (i >= 370) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data);
          }
        }

        // Totales Finales
        i += 15;
        doc.font('Helvetica-Bold');
        doc.y = ymin + i;
        doc.x = tipo == 'VCM' || tipo == 'VCD' ? 70 : 90;
        doc.text('Total General:', {
          align: 'left',
          columns: 1,
          width: 100,
        });
        doc.y = ymin + i;
        doc.x = tipo == 'VCM' || tipo == 'VCD' ? 90 : 115;
        doc.text(totalNroGuias, {
          align: 'right',
          columns: 1,
          width: 60,
        });
        doc.y = ymin + i;
        doc.x = tipo == 'VCM' || tipo == 'VCD' ? 145 : 150;
        doc.text(totalNroPiezas, {
          align: 'right',
          columns: 1,
          width: 60,
        });

        doc.y = ymin + i;
        doc.x = 195;
        doc.text(utils.formatNumber(totalPesoKgs), {
          align: 'right',
          columns: 1,
          width: 60,
        });

        if (data.visible == 'SI') {
          doc.y = ymin + i;
          doc.x = 250;
          doc.text(utils.formatNumber(totalContadoOrig), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 290;
          doc.text(utils.formatNumber(totalImpContadoOrig), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 355;
          doc.text(utils.formatNumber(totalContadoDest), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 390;
          doc.text(utils.formatNumber(totalImpContadoDest), {
            align: 'right',
            columns: 1,
            width: 50,
          });

          doc.y = ymin + i;
          doc.x = 450;
          doc.text(utils.formatNumber(totalCreditoOrig), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 490;
          doc.text(utils.formatNumber(totalImpCreditoOrig), {
            align: 'right',
            columns: 1,
            width: 50,
          });

          doc.y = ymin + i;
          doc.x = 540;
          doc.text(utils.formatNumber(totalMontoOtros), {
            align: 'right',
            columns: 1,
            width: 50,
          });

          if (data.dolar == true) {
            doc.y = ymin + i;
            doc.x = 580;
            doc.text(utils.formatNumber(totalOtrosDolar), {
              align: 'right',
              columns: 1,
              width: 50,
            });
          }

          doc.y = ymin + i;
          doc.x = 650;
          doc.text(utils.formatNumber(totalMontoVenta), {
            align: 'right',
            columns: 1,
            width: 50,
          });

          if (data.dolar == true) {
            doc.y = ymin + i;
            doc.x = 710;
            doc.text(utils.formatNumber(totalVentaDolar), {
              align: 'right',
              columns: 1,
              width: 50,
            });
          }
        }
        break;
      default:
        break;
    }
    var end;
    const range = doc.bufferedPageRange();
    for (
      i = range.start, end = range.start + range.count, range.start <= end;
      i < end;
      i++
    ) {
      doc.switchToPage(i);
      doc.fontSize(8);
      doc.fillColor('#444444');
      doc.x = tipo == 'XX' ? 446 : 646;
      doc.y = 50;
      doc.text(`Pagina ${i + 1} de ${range.count}`, {
        align: 'right',
        columns: 1,
        width: 100,
      });
    }
  }
}

module.exports = ReporteVentasService;
