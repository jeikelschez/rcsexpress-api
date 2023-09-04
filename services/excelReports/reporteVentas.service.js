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
const clienteOrigDesc2 =
  '(CASE WHEN (ci_rif_cte_conta_org IS NULL || ci_rif_cte_conta_org = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `detalles->movimientos`.cod_cliente_org = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `detalles->movimientos`.cod_agencia = clientes_particulares.cod_agencia' +
  ' AND `detalles->movimientos`.cod_cliente_org = clientes_particulares.cod_cliente' +
  ' AND `detalles->movimientos`.ci_rif_cte_conta_org = clientes_particulares.rif_ci' +
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
const montoFpo =
  '(SELECT SUM(d.importe_renglon) FROM detalle_de_movimientos d' +
  ' WHERE `Mmovimientos`.id = d.cod_movimiento AND d.cod_concepto >= 15)';
const estatus_administrativo = [
  { label: 'En Elaboración', value: 'E' },
  { label: 'Por Facturar', value: 'F' },
  { label: 'Facturada', value: 'G' },
  { label: 'Anulada', value: 'A' },
  { label: 'Por Cobrar', value: 'P' },
  { label: 'Cancelada', value: 'C' },
  { label: 'Por Imprimir', value: 'I' },
  { label: 'Modificada', value: 'M' },
];
const estatus_operativo = [
  { label: 'En Envío', value: 'PR' },
  { label: 'Por Entregar', value: 'PE' },
  { label: 'Conforme', value: 'CO' },
  { label: 'No Conforme', value: 'NC' },
];
const tipo_factura = [
  { label: 'Fact. Guía', value: 'FG' },
  { label: 'Prepago', value: 'FP' },
  { label: 'Otros Ing.', value: 'FO' },
  { label: 'Fact. Guía', value: 'FC' },
  { label: '', value: null },
];

class ReporteVentasService {
  async mainReport(worksheet, tipo, data) {
    data = JSON.parse(data);
    let ventas = [];
    let where = {};
    let order = '';

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
      case 'RD':
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
        } else if (tipo == 'RD') {
          if (data.agencia) where.cod_agencia = data.agencia;
          if (data.cliente) where.cod_cliente_org = data.cliente;
          order = [['cod_agencia_dest', 'ASC']];
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
              attributes: ['nb_agencia'],
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
            } else if (
              tipo == 'RD' &&
              ventas[i]['agencias_dest.nb_agencia'] !=
                ventas[i - 1]['agencias_dest.nb_agencia']
            ) {
              groupFlag = true;
              ventasAgr.agencia = ventas[i - 1]['agencias_dest.nb_agencia'];
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
        } else if (tipo == 'RD') {
          ventasAgr.agencia =
            ventas[ventas.length - 1]['agencias_dest.nb_agencia'];
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
        if (tipo == 'RD') {
          if (data.agencia)
            ventasAgrArray.agencia =
              ventas[ventas.length - 1]['agencias.nb_agencia'];
          if (data.cliente)
            ventasAgrArray.cliente =
              ventas[ventas.length - 1]['clientes_org.nb_cliente'];
        }
        ventas = ventasAgrArray;
        break;
      default:
        break;
    }
    data.ventas = ventas;
    await this.generateHeader(worksheet, tipo, data);
    await this.generateCustomerInformation(worksheet, tipo, data);
    return true;
  }

  async generateHeader(worksheet, tipo, data) {
    switch (tipo) {
      case 'VG':
        worksheet.columns = [
          { key: 1, width: 10 },
          { key: 2, width: 15 },
          { key: 3, width: 15 },
          { key: 4, width: 60 },
          { key: 5, width: 60 },
          { key: 6, width: 25 },
          { key: 7, width: 15 },
          { key: 8, width: 15, style: {numFmt: '#,##0.00'} },
          { key: 9, width: 15, style: {numFmt: '#,##0.00'} },
          { key: 10, width: 15, style: {numFmt: '#,##0.00'} },
          { key: 11, width: 15, style: {numFmt: '#,##0.00'} },
          { key: 12, width: 15, style: {numFmt: '#,##0.00'} },
          { key: 13, width: 15, style: {numFmt: '#,##0.00'} },
          { key: 14, width: 15, style: {numFmt: '#,##0.00'} },
          { key: 15, width: 15, style: {numFmt: '#,##0.00'} },
          { key: 16, width: 18, style: {numFmt: '#,##0.00'} },
          { key: 17, width: 15, style: {numFmt: '#,##0.00'} }
        ];
        worksheet.getColumn(16).hidden = true;
        worksheet.getColumn(18).hidden = true;
        worksheet.getCell('A1').value = 'DESDE:';
        worksheet.getCell('B1').value = data.fecha_desde;
        worksheet.getCell('A2').value = 'HASTA:';
        worksheet.getCell('B2').value = data.fecha_hasta;
        worksheet.getCell('A5').value = '#:';
        worksheet.getCell('B5').value = 'Fecha:';
        worksheet.getCell('C5').value = 'Nro de Guia:';
        worksheet.getCell('D5').value = 'Remitente';
        worksheet.getCell('E5').value = 'Destinatario';
        worksheet.getCell('F5').value = 'Dest.';
        worksheet.getCell('G5').value = 'Pzas';
        worksheet.getCell('H5').value = 'Kg.';
        worksheet.getCell('I4').value = 'CONTADO';
        worksheet.getCell('I5').value = 'Origen';
        worksheet.getCell('J5').value = 'Imp.';
        worksheet.getCell('K5').value = 'Destino';
        worksheet.getCell('L5').value = 'Imp.';
        worksheet.getCell('M4').value = 'CREDITO';
        worksheet.getCell('M5').value = 'Monto';
        worksheet.getCell('N5').value = 'Imp.';
        worksheet.getCell('O5').value = 'Otros';
        worksheet.getCell('Q5').value = 'TOTAL VENTAS';
        if (data.dolar == true) {
          worksheet.getColumn(16).hidden = false;
          worksheet.getColumn(18).hidden = false;
          worksheet.getCell('P5').value = 'Otros $';
          worksheet.getCell('R5').value = 'TOTAL $';
        }
        break;
      case 'VC':
        worksheet.getCell('F2').value = 'VENTAS GENERALES POR CLIENTE:';
        worksheet.getCell('F4').value = 'DESDE:';
        worksheet.getCell('G4').value = data.fecha_desde;
        worksheet.getCell('I4').value = 'HASTA:';
        worksheet.getCell('J4').value = data.fecha_hasta;
        worksheet.getCell('L4').value = 'FECHA:';
        worksheet.getCell('M4').value = moment().format('DD/MM/YYYY');
        worksheet.getCell('A6').value = 'RCS EXPRESS, S.A';
        worksheet.getCell('A7').value = 'RIF. J-31028463-6';
        worksheet.getCell('A8').value = 'Agencia:';
        worksheet.getCell('A9').value = 'Cliente:';
        worksheet.getCell('C8').value = data.ventas[0]['agencias.nb_agencia'];
        worksheet.getCell('C9').value =
          data.ventas[0]['clientes_org.nb_cliente'];
        worksheet.columns = [
          { key: 'A', width: 10 },
          { key: 'B', width: 14 },
          { key: 'C', width: 13 },
          { key: 'D', width: 60 },
          { key: 'E', width: 60 },
          { key: 'F', width: 25 },
          { key: 'G', width: 15 },
          { key: 'H', width: 15 },
          { key: 'I', width: 15 },
          { key: 'J', width: 15 },
          { key: 'K', width: 15 },
          { key: 'L', width: 15 },
          { key: 'M', width: 15 },
          { key: 'N', width: 15 },
          { key: 'O', width: 15 },
          { key: 'P', width: 1 },
          { key: 'Q', width: 15 },
          { key: 'R', width: 1 },
          { key: 'S', width: 1 },
          { key: 'T', width: 1 },
        ];
        worksheet.getCell('A11').value = '#:';
        worksheet.getCell('B11').value = 'Fecha:';
        worksheet.getCell('C11').value = 'Nro de Guia:';
        worksheet.getCell('D11').value = 'Nro Fact Cliente';
        worksheet.getCell('E11').value = 'Destinatario';
        worksheet.getCell('F11').value = 'Dest.';
        worksheet.getCell('G11').value = 'Pzas';
        worksheet.getCell('H11').value = 'Kg.';
        worksheet.getCell('I10').value = 'CONTADO';
        worksheet.getCell('I11').value = 'Origen';
        worksheet.getCell('J11').value = 'Imp.';
        worksheet.getCell('K11').value = 'Destino';
        worksheet.getCell('L11').value = 'Imp.';
        worksheet.getCell('M10').value = 'CREDITO';
        worksheet.getCell('M11').value = 'Monto';
        worksheet.getCell('N11').value = 'Imp.';
        worksheet.getCell('O11').value = 'Otros';
        worksheet.getCell('Q11').value = 'TOTAL VENTAS';
        if (data.dolar == true) {
          worksheet.columns = [
            { key: 'P', width: 30 },
            { key: 'R', width: 30 },
            { key: 'S', width: 30 },
            { key: 'T', width: 30 },
          ];
          worksheet.getCell('P11').value = 'Otros $';
          worksheet.getCell('R11').value = 'TOTAL $';
          worksheet.getCell('S11').value = 'VALOR DOLAR';
          worksheet.getCell('T11').value = 'VALOR DECLARADO $';
        }
        break;
      case 'VCM':
      case 'VCD':
      case 'TV':
      case 'TVC':
      case 'TVD':
      case 'RD':
        worksheet.columns = [
          { key: 'A', width: 7 },
          { key: 'B', width: 14 },
          { key: 'C', width: 13 },
          { key: 'D', width: 60 },
          { key: 'E', width: 60 },
          { key: 'F', width: 25 },
          { key: 'G', width: 15 },
          { key: 'H', width: 15 },
          { key: 'I', width: 15 },
          { key: 'J', width: 15 },
          { key: 'K', width: 15 },
          { key: 'L', width: 1 },
          { key: 'M', width: 15 },
          { key: 'N', width: 1 },
        ];
        var labelDoc = 'Ventas Generales';
        if (tipo == 'VCM') {
          labelDoc += ' por Cliente por Mes';
        } else if (tipo == 'VCD') {
          labelDoc += ' por Cliente por Día';
        } else if (tipo == 'TVC') {
          labelDoc += ' por Cliente';
        } else if (tipo == 'TVD') {
          labelDoc += ' por Día';
        } else if (tipo == 'RD') {
          labelDoc = ' Relación de Despacho para las Agencias';
        }
        worksheet.getCell('G2').value = labelDoc;
        worksheet.getCell('F4').value = 'Desde:';
        worksheet.getCell('G4').value = data.fecha_desde;
        worksheet.getCell('I4').value = 'Hasta:';
        worksheet.getCell('J4').value = data.fecha_hasta;
        worksheet.getCell('L4').value = 'FECHA:';
        worksheet.getCell('M4').value = moment().format('DD/MM/YYYY');
        worksheet.getCell('A6').value = 'RCS EXPRESS, S.A';
        worksheet.getCell('A7').value = 'RIF. J-31028463-6';

        if (tipo == 'VCM' || tipo == 'VCD') {
          worksheet.getCell('A8').value = 'Agencia:';
          worksheet.getCell('C8').value = data.ventas.agencia;
          worksheet.getCell('A9').value = 'Cliente:';
          worksheet.getCell('C9').value = data.ventas.cliente;
        }

        if (tipo == 'RD') {
          if (data.agencia) {
            worksheet.getCell('A8').value = 'Agencia:';
            worksheet.getCell('C8').value = data.ventas.agencia;
          }

          if (data.cliente) {
            worksheet.getCell('A9').value = 'Cliente:';
            worksheet.getCell('C9').value = data.ventas.cliente;
          }
        }

        var labelFirst;
        if (tipo == 'VCM') {
          labelFirst = ' MES';
        } else if (tipo == 'VCD' || tipo == 'TVD') {
          labelFirst = 'FECHA';
        } else if (tipo == 'TV' || tipo == 'RD') {
          labelFirst = 'Agencia';
        } else if (tipo == 'TVC') {
          labelFirst = 'Cliente';
        }
        (worksheet.getCell('A11').value = labelFirst), tipo != 'TVC';
        if (tipo == 'TVC' || tipo == 'TV' || tipo == 'RD')
          worksheet.getCell('B11').value = 'Guías';
        if (tipo == 'TVC' || tipo == 'TV' || tipo == 'RD')
          worksheet.getCell('C11').value = 'Pzas';
        worksheet.getCell('D11').value = data.neta ? 'Neta' : 'Kgs';
        worksheet.getCell('E11').value = 'Origen';
        worksheet.getCell('F11').value = 'Imp.';
        worksheet.getCell('F10').value = 'CONTADO';
        worksheet.getCell('G11').value = 'Destino';
        worksheet.getCell('H11').value = 'Imp.';
        worksheet.getCell('H10').value = 'CRÉDITO';
        worksheet.getCell('I11').value = 'Monto';
        worksheet.getCell('J11').value = 'Imp.';
        worksheet.getCell('K11').value = 'Otros.';
        worksheet.getCell('M11').value = 'Total Venta';
        if (data.dolar == true) {
          worksheet.columns = [
            { key: 'L', width: 30 },
            { key: 'N', width: 30 },
          ];
          worksheet.getCell('L11').value = 'Otr $.';
          worksheet.getCell('N11').value = 'Venta $.';
        }
        break;
      default:
        break;
    }
  }

  async generateCustomerInformation(worksheet, tipo, data) {
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
    let totalCobrado = 0;
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
    let totalSubtotal = 0;
    let totalImpuesto = 0;
    let totalSaldo = 0;
    let subTotalSubtotal = 0;
    let subTotalImpuesto = 0;
    let subTotalSaldo = 0;
    let subTotalCobrado = 0;

    switch (tipo) {
      case 'VG':
        var i = 4;
        for (var item = 0; item < data.ventas.length; item++) {
          if (
            item == 0 ||
            data.ventas[item].cod_agencia != data.ventas[item - 1].cod_agencia
          ) {
            i = i + 3;
            worksheet.getCell('A' + i).value =
              data.ventas[item]['agencias.nb_agencia'];
            i = i + 2;
          }
          worksheet.getCell('A' + i).value = item + 1;
          worksheet.getCell('B' + i).value = moment(
            data.ventas[item].fecha_emision
          ).format('DD/MM/YYYY');
          
          worksheet.getCell('C' + i).value = parseFloat(data.ventas[item].nro_documento);
          worksheet.getCell('D' + i).value = utils.truncate(
            data.ventas[item].cliente_orig_desc,
            29
          );
          worksheet.getCell('E' + i).value = utils.truncate(
            data.ventas[item].cliente_dest_desc,
            38
          );
          worksheet.getCell('F' + i).value =
            data.ventas[item]['agencias_dest.ciudades.siglas'];
          worksheet.getCell('G' + i).value = 
           parseFloat(data.ventas[item].nro_piezas)
          ;
          worksheet.getCell('H' + i).value = 
            parseFloat(data.ventas[item].peso_kgs)
          ;
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

            worksheet.getCell('I' + i).value = contadoOrig;
            worksheet.getCell('J' + i).value =
            parseFloat(impContadoOrig);
            worksheet.getCell('K' + i).value = parseFloat(contadoDest);
            worksheet.getCell('L' + i).value =
            parseFloat(impContadoDest);
            if (!isNaN(parseFloat(creditoOrig))) {
              worksheet.getCell('M' + i).value = parseFloat(creditoOrig);
            } 
            if (!isNaN(parseFloat(impCreditoOrig))) {
              worksheet.getCell('N' + i).value = parseFloat(impCreditoOrig);
            } 

            montoOtros =
              (data.ventas[item].valor_declarado_seg *
                data.ventas[item].porc_apl_seguro) /
              100;

            worksheet.getCell('O' + i).value = parseFloat(montoOtros);

            if (data.dolar == true) {
              if (data.ventas[item].valor_dolar > 0) {
                otrosDolar =
                  montoOtros / utils.parseFloatN(data.ventas[item].valor_dolar);
              }

              worksheet.getCell('P' + i).value = parseFloat(
                otrosDolar.toFixed(2)
              );
            }

            worksheet.getCell('Q' + i).value = parseFloat(montoVenta);

            if (data.dolar == true) {
              if (data.ventas[item].valor_dolar > 0) {
                ventaDolar =
                  montoVenta / utils.parseFloatN(data.ventas[item].valor_dolar);
              }

              worksheet.getCell('R' + i).value = parseFloat(
                ventaDolar.toFixed(2)
              );
            }
          }

          // Sub Totales por Agencia
          if (
            item > 0 &&
            data.ventas[item].cod_agencia != data.ventas[item - 1].cod_agencia
          ) {
            i = i - 3;
            worksheet.getCell('F' + i).value = 'Sub-Totales por Agencia:';

            worksheet.getCell('G' + i).value = subTotalNroPiezas;

            worksheet.getCell('H' + i).value =
            parseFloat(subTotalPesoKgs);

            if (data.visible == 'SI') {
              worksheet.getCell('I' + i).value =
              parseFloat(subTotalContadoOrig);

              worksheet.getCell('J' + i).value = parseFloat(
                subTotalImpContadoOrig
              );
              worksheet.getCell('K' + i).value =
              parseFloat(subTotalContadoDest);

              worksheet.getCell('L' + i).value = parseFloat(
                subTotalImpContadoDest
              );

              worksheet.getCell('M' + i).value =
              parseFloat(subTotalCreditoOrig);

              worksheet.getCell('N' + i).value = parseFloat(
                subTotalImpCreditoOrig
              );

              worksheet.getCell('O' + i).value =
              parseFloat(subTotalMontoOtros);

              if (data.dolar == true) {
                worksheet.getCell('P' + i).value =
                parseFloat(subTotalOtrosDolar);
              }

              worksheet.getCell('Q' + i).value =
              parseFloat(subTotalMontoVenta);

              if (data.dolar == true) {
                worksheet.getCell('R' + i).value =
                parseFloat(subTotalVentaDolar);
              }
            }
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
            i = i + 3;
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
          i++;
        }
        i++;

        // Sub Totales por Agencia Finales
        worksheet.getCell('F' + i).value = 'Sub-Totales por Agencia:'
        worksheet.getCell('G' + i).value = subTotalNroPiezas
        worksheet.getCell('H' + i).value = subTotalPesoKgs
        if (data.visible == 'SI') {
          worksheet.getCell('I' + i).value = subTotalContadoOrig
          worksheet.getCell('J' + i).value = subTotalImpContadoOrig
          worksheet.getCell('K' + i).value = subTotalContadoDest
          worksheet.getCell('L' + i).value = subTotalImpContadoDest
          worksheet.getCell('M' + i).value = subTotalCreditoOrig
          worksheet.getCell('N' + i).value = subTotalImpCreditoOrig
          worksheet.getCell('O' + i).value = subTotalMontoOtros
          if (data.dolar == true) 
            worksheet.getCell('P' + i).value = subTotalOtrosDolar
          }
          worksheet.getCell('Q' + i).value = subTotalMontoVenta
          if (data.dolar == true) {
            worksheet.getCell('R' + i).value = subTotalVentaDolar
          }

        i++;

        worksheet.getCell('F' + i).value = 'Total General:';

        worksheet.getCell('G' + i).value = totalNroPiezas;

        worksheet.getCell('H' + i).value = totalPesoKgs;

        if (data.visible == 'SI') {
          worksheet.getCell('I' + i).value =
          totalContadoOrig;
          worksheet.getCell('J' + i).value =
          totalImpContadoOrig;
          worksheet.getCell('K' + i).value =
          totalContadoDest;
          worksheet.getCell('L' + i).value =
          totalImpContadoDest;
          worksheet.getCell('M' + i).value =
          totalCreditoOrig;
          worksheet.getCell('N' + i).value =
          totalImpCreditoOrig;
          worksheet.getCell('O' + i).value =
          totalMontoOtros;
          worksheet.getCell('Q' + i).value =
          totalMontoVenta;

          if (data.dolar == true) {
            worksheet.getCell('P' + i).value =
            totalOtrosDolar;
            worksheet.getCell('R' + i).value =
            totalVentaDolar;
          }
        }
        break;
      case 'VC':
        var i = 13;
        for (var item = 0; item < data.ventas.length; item++) {
          worksheet.getCell('A' + i).value = item + 1;
          worksheet.getCell('B' + i).value = moment(
            data.ventas[item].fecha_emision
          ).format('DD/MM/YYYY');
          worksheet.getCell('C' + i).value = data.ventas[item].nro_documento;
          worksheet.getCell('D' + i).value = utils.truncate(
            data.ventas[item].dimensiones,
            29
          );
          worksheet.getCell('E' + i).value = utils.truncate(
            data.ventas[item].cliente_dest_desc,
            38
          );
          worksheet.getCell('F' + i).value =
            data.ventas[item]['agencias_dest.ciudades.siglas'];
          worksheet.getCell('G' + i).value = parseFloat(data.ventas[item].nro_piezas);

          let monto_kgs = data.neta
            ? data.ventas[item].carga_neta
            : data.ventas[item].peso_kgs;

          worksheet.getCell('H' + i).value = utils.formatNumber(monto_kgs);

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

            worksheet.getCell('I' + i).value = parseFloat(contadoOrig);
            worksheet.getCell('J' + i).value =
              parseFloat(impContadoOrig);
            worksheet.getCell('K' + i).value = parseFloat(contadoDest);
            worksheet.getCell('L' + i).value =
              parseFloat(impContadoDest);
            worksheet.getCell('M' + i).value = parseFloat(creditoOrig);
            worksheet.getCell('N' + i).value =
              parseFloat(impCreditoOrig);

            montoOtros =
              (data.ventas[item].valor_declarado_seg *
                data.ventas[item].porc_apl_seguro) /
              100;

            worksheet.getCell('O' + i).value = parseFloat(montoOtros);

            if (data.dolar == true) {
              if (data.ventas[item].valor_dolar > 0) {
                otrosDolar =
                  montoOtros / utils.parseFloatN(data.ventas[item].valor_dolar);
              }
              worksheet.getCell('P' + i).value = parseFloat(
                otrosDolar.toFixed(2)
              );
            }

            worksheet.getCell('Q' + i).value = parseFloat(montoVenta);

            if (data.dolar == true) {
              if (data.ventas[item].valor_dolar > 0) {
                ventaDolar =
                  montoVenta / utils.parseFloatN(data.ventas[item].valor_dolar);
              }
              worksheet.getCell('R' + i).value = parseFloat(
                ventaDolar.toFixed(2)
              );
              worksheet.getCell('S' + i).value = parseFloat(
                data.ventas[item].valor_dolar
              );
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

          i++;
        }

        // Totales Finales
        i += 2;
        worksheet.getCell('F' + i).value = 'Total General:';
        worksheet.getCell('G' + i).value = totalNroPiezas;
        worksheet.getCell('H' + i).value = parseFloat(totalPesoKgs);

        if (data.visible == 'SI') {
          worksheet.getCell('I' + i).value =
            parseFloat(totalContadoOrig);
          worksheet.getCell('J' + i).value =
            parseFloat(totalImpContadoOrig);
          worksheet.getCell('K' + i).value =
            parseFloat(totalContadoDest);
          worksheet.getCell('L' + i).value =
            parseFloat(totalImpContadoDest);
          worksheet.getCell('M' + i).value =
            parseFloat(totalCreditoOrig);
          worksheet.getCell('N' + i).value =
            parseFloat(totalImpCreditoOrig);
          worksheet.getCell('O' + i).value =
            parseFloat(totalMontoOtros);
          if (data.dolar == true) {
            worksheet.getCell('P' + i).value =
              parseFloat(totalOtrosDolar);
          }
          worksheet.getCell('Q' + i).value =
            parseFloat(totalMontoVenta);

          if (data.dolar == true) {
            worksheet.getCell('R' + i).value =
              parseFloat(totalVentaDolar);
          }
        }
        break;
      case 'VCM':
      case 'VCD':
      case 'TV':
      case 'TVC':
      case 'TVD':
      case 'RD':
        var i = 0;
        for (var item = 0; item < data.ventas.length; item++) {
          if (tipo == 'VCM' || tipo == 'VCD' || tipo == 'TVD') {
            worksheet.getCell('A' + i).value =
              tipo == 'VCM'
                ? data.ventas[item].mes
                : data.ventas[item].fecha_emision;
            worksheet.getCell('B' + i).value = data.ventas[item].nro_guias;
            worksheet.getCell('C' + i).value = data.ventas[item].nro_piezas;
          } else if (tipo == 'TV' || tipo == 'TVC' || tipo == 'RD') {
            worksheet.getCell('A' + i).value =
              tipo == 'TV' || tipo == 'RD'
                ? data.ventas[item].agencia
                : data.ventas[item].cliente;
            worksheet.getCell('B' + i).value = data.ventas[item].nro_guias;
            worksheet.getCell('C' + i).value = data.ventas[item].nro_piezas;
          }

          let monto_kgs = data.neta
            ? data.ventas[item].carga_neta
            : data.ventas[item].peso_kgs;

          worksheet.getCell('D' + i).value = parseFloat(monto_kgs);

          if (data.visible == 'SI') {
            worksheet.getCell('E' + i).value = parseFloat(
              data.ventas[item].monto_contado_orig
            );
            worksheet.getCell('F' + i).value = parseFloat(
              data.ventas[item].imp_contado_orig
            );
            worksheet.getCell('G' + i).value = parseFloat(
              data.ventas[item].monto_contado_dest
            );
            worksheet.getCell('H' + i).value = parseFloat(
              data.ventas[item].imp_contado_dest
            );

            worksheet.getCell('I' + i).value = parseFloat(
              data.ventas[item].monto_credito_orig
            );
            worksheet.getCell('J' + i).value = parseFloat(
              data.ventas[item].imp_credito_orig
            );

            worksheet.getCell('K' + i).value = parseFloat(
              data.ventas[item].monto_otros
            );

            if (data.dolar == true) {
              worksheet.getCell('L' + i).value = parseFloat(
                data.ventas[item].monto_otros_dolar
              );
            }

            worksheet.getCell('M' + i).value = parseFloat(
              data.ventas[item].monto_total
            );

            if (data.dolar == true) {
              worksheet.getCell('N' + i).value = parseFloat(
                data.ventas[item].monto_total_dolar
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

          i++;
        }

        // Totales Finales
        i += 3;
        worksheet.getCell('A' + i).value = 'Total General:';
        worksheet.getCell('B' + i).value = totalNroGuias;
        worksheet.getCell('C' + i).value = totalNroPiezas;
        worksheet.getCell('D' + i).value = parseFloat(totalPesoKgs);

        if (data.visible == 'SI') {
          worksheet.getCell('E' + i).value =
            parseFloat(totalContadoOrig);
          worksheet.getCell('F' + i).value =
            parseFloat(totalImpContadoOrig);
          worksheet.getCell('G' + i).value =
            parseFloat(totalContadoDest);
          worksheet.getCell('H' + i).value =
            parseFloat(totalImpContadoDest);
          worksheet.getCell('I' + i).value =
            parseFloat(totalCreditoOrig);
          worksheet.getCell('J' + i).value =
            parseFloat(totalImpCreditoOrig);
          worksheet.getCell('K' + i).value =
            parseFloat(totalMontoOtros);

          if (data.dolar == true) {
            worksheet.getCell('L' + i).value =
              parseFloat(totalOtrosDolar);
          }

          worksheet.getCell('M' + i).value =
            parseFloat(totalMontoVenta);

          if (data.dolar == true) {
            worksheet.getCell('N' + i).value =
              parseFloat(totalVentaDolar);
          }
        }
        break;
      default:
        break;
    }
  }
}

module.exports = ReporteVentasService;
