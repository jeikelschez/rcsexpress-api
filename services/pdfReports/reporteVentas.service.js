const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

const clienteOrigDesc =
  '(CASE WHEN (id_clte_part_orig IS NULL || id_clte_part_orig = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `Mmovimientos`.cod_cliente_org = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `Mmovimientos`.id_clte_part_orig = clientes_particulares.id)' +
  ' END)';
const clienteOrigDesc2 =
  '(CASE WHEN (id_clte_part_orig IS NULL || id_clte_part_orig = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `detalles->movimientos`.cod_cliente_org = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `detalles->movimientos`.id_clte_part_orig = clientes_particulares.id)' +
  ' END)';
const clienteDestDesc =
  '(CASE WHEN (id_clte_part_dest IS NULL || id_clte_part_dest = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `Mmovimientos`.cod_cliente_dest = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `Mmovimientos`.id_clte_part_dest = clientes_particulares.id)' +
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
  async mainReport(doc, tipo, data) {
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
      case 'GC':
      case 'FA':
      case 'DE':
        where = {
          fecha_emision: {
            [Sequelize.Op.between]: [
              moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            ],
          },
        };

        if (tipo == 'GC') {
          where.t_de_documento = 'GC';
        } else if (tipo == 'FA') {
          where.t_de_documento = 'FA';
        } else if (tipo == 'DE') {
          where.t_de_documento = {
            [Sequelize.Op.in]: ['FA', 'NC', 'ND'],
          };
        }

        if (data.cliente) {
          if (tipo == 'GC') {
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
          } else if (tipo == 'FA') {
            where.cod_cliente_org = data.cliente;
          }
        } else if (data.agencia) {
          where.cod_agencia = data.agencia;
        }

        if (data.estatus_admin) where.estatus_administra = data.estatus_admin;
        if (data.pagado_en) where.pagado_en = data.pagado_en;
        if (data.modalidad) where.modalidad_pago = data.modalidad;

        order = [
          ['cod_agencia', 'ASC'],
          ['fecha_emision', 'ASC'],
        ];
        if (data.correlativo) order = [['nro_documento', 'ASC']];

        ventas = await models.Mmovimientos.findAll({
          where: where,
          attributes: [
            'id',
            'cod_agencia',
            'fecha_emision',
            'nro_documento',
            'modalidad_pago',
            'pagado_en',
            'monto_subtotal',
            'monto_impuesto',
            'monto_total',
            'saldo',
            'tipo_doc_principal',
            'serie_doc_principal',
            'nro_doc_principal',
            'estatus_administra',
            'estatus_operativo',
            'fecha_anulacion',
            'nro_control',
            'serie_documento',
            'nro_control_new',
            'tipo_factura',
            [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
            [Sequelize.literal(clienteDestDesc), 'cliente_dest_desc'],
            [Sequelize.literal(valorDolar), 'valor_dolar'],
          ],
          include: [
            {
              model: models.Agencias,
              as: 'agencias',
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
            {
              model: models.Coperacion,
              as: 'conceptos',
              attributes: ['desc_concepto'],
            },
          ],
          order: order,
          raw: true,
        });
        if (ventas.length == 0) return false;
        break;
      case 'FPO':
        where = {
          fecha_emision: {
            [Sequelize.Op.between]: [
              moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            ],
          },
          t_de_documento: 'FA',
        };

        if (data.agencia) where.cod_agencia = data.agencia;

        ventas = await models.Mmovimientos.findAll({
          where: where,
          attributes: [
            'id',
            'cod_agencia',
            'fecha_emision',
            'nro_documento',
            'modalidad_pago',
            'pagado_en',
            'monto_subtotal',
            'monto_impuesto',
            'monto_total',
            'saldo',
            'tipo_doc_principal',
            'serie_doc_principal',
            'nro_doc_principal',
            'estatus_administra',
            'estatus_operativo',
            'fecha_anulacion',
            'nro_control',
            'serie_documento',
            'nro_control_new',
            'tipo_factura',
            [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
            [Sequelize.literal(montoFpo), 'monto_fpo'],
          ],
          order: [
            ['fecha_emision', 'ASC'],
            ['serie_documento', 'ASC'],
            ['nro_control', 'ASC'],
          ],
          raw: true,
        });
        ventas = ventas.filter((venta) => venta.monto_fpo > 0);
        if (ventas.length == 0) return false;
        break;
      case 'NC':
      case 'ND':
        where = {
          fecha_emision: {
            [Sequelize.Op.between]: [
              moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            ],
          },
          t_de_documento: tipo,
        };

        if (data.agencia) where.cod_agencia = data.agencia;

        ventas = await models.Mmovimientos.findAll({
          where: where,
          attributes: [
            'id',
            'cod_agencia',
            'fecha_emision',
            'nro_documento',
            'modalidad_pago',
            'pagado_en',
            'monto_subtotal',
            'monto_impuesto',
            'monto_total',
            'saldo',
            'tipo_doc_principal',
            'serie_doc_principal',
            'nro_doc_principal',
            'nro_ctrl_doc_ppal_new',
            'nro_ctrl_doc_ppal',
            'estatus_administra',
            'estatus_operativo',
            'fecha_anulacion',
            'nro_control',
            'serie_documento',
            'nro_control_new',
            'tipo_factura',
            [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
          ],
          include: [
            {
              model: models.Agencias,
              as: 'agencias',
              attributes: ['nb_agencia'],
            },
          ],
          order: [
            ['cod_agencia', 'ASC'],
            ['fecha_emision', 'ASC'],
            ['nro_documento', 'ASC'],
          ],
          raw: true,
        });
        if (ventas.length == 0) return false;
        break;
      case 'CG':
        where = {
          fecha_deposito: {
            [Sequelize.Op.between]: [
              moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            ],
          },
        };

        if (data.agencia) where.cod_agencia = data.agencia;

        ventas = await models.Mcobranzas.findAll({
          where: where,
          attributes: [
            'id',
            'cod_agencia',
            'nro_deposito',
            'fecha_deposito',
            'monto_cobrado',
            'cod_cuenta',
            'monto_retenido',
            'monto_deposito',
            'ingreso_caja',
            [Sequelize.literal(clienteOrigDesc2), 'cliente_orig_desc'],
          ],
          include: [
            {
              model: models.Agencias,
              as: 'agencias',
              attributes: ['nb_agencia'],
            },
            {
              model: models.Cuentas,
              as: 'cuentas',
              attributes: ['nro_cuenta'],
              include: [
                {
                  model: models.Bancos,
                  as: 'bancos',
                  attributes: ['nb_banco'],
                },
              ],
            },
            {
              model: models.Dcobranzas,
              as: 'detalles',
              attributes: ['monto_pagado'],
              include: [
                {
                  model: models.Mmovimientos,
                  as: 'movimientos',
                  attributes: [
                    't_de_documento',
                    'nro_documento',
                    'monto_total',
                    'saldo',
                    'serie_doc_principal',
                    'nro_ctrl_doc_ppal_new',
                    'nro_ctrl_doc_ppal',
                    'modalidad_pago',
                    'pagado_en',
                  ],
                  include: [
                    {
                      model: models.Agencias,
                      as: 'agencias',
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
                  ],
                },
              ],
            },
          ],
          order: [
            ['cod_agencia', 'ASC'],
            ['id', 'ASC'],
          ],
          raw: true,
        });
        if (ventas.length == 0) return false;
        break;
      case 'CD':
        where = {
          fecha_emision: {
            [Sequelize.Op.between]: [
              moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            ],
          },
          t_de_documento: {
            [Sequelize.Op.in]: ['FA', 'GC'],
          },
          estatus_administra: {
            [Sequelize.Op.ne]: 'A',
          },
          pagado_en: 'D',
        };

        if (data.agencia) where.cod_agencia_dest = data.agencia;
        if (data.cliente) where.cod_cliente_dest = data.cliente;
        if (data.estatus_admin) where.estatus_administra = data.estatus_admin;
        if (data.tipo_doc) where.t_de_documento = data.tipo_doc;

        ventas = await models.Mmovimientos.findAll({
          where: where,
          attributes: [
            'id',
            'cod_agencia',
            'cod_agencia_dest',
            'fecha_emision',
            't_de_documento',
            'nro_documento',
            'modalidad_pago',
            'pagado_en',
            'monto_subtotal',
            'monto_impuesto',
            'monto_total',
            'saldo',
            'tipo_doc_principal',
            'serie_doc_principal',
            'nro_doc_principal',
            'nro_ctrl_doc_ppal_new',
            'nro_ctrl_doc_ppal',
            'estatus_administra',
            [Sequelize.literal(clienteDestDesc), 'cliente_dest_desc'],
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
            },
          ],
          order: [
            ['cod_agencia_dest', 'ASC'],
            ['cod_agencia', 'ASC'],
            ['cod_cliente_org', 'ASC'],
            ['fecha_emision', 'ASC'],
          ],
          raw: true,
        });
        if (ventas.length == 0) return false;
        break;
      case 'CC':
        where = {
          fecha_emision: {
            [Sequelize.Op.between]: [
              moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            ],
          },
          t_de_documento: 'FA',
          estatus_administra: 'P',
        };

        if (data.agencia) where.cod_agencia = data.agencia;

        ventas = await models.Mmovimientos.findAll({
          where: where,
          attributes: [
            'id',
            'cod_agencia',
            'fecha_emision',
            't_de_documento',
            'nro_documento',
            'monto_subtotal',
            'monto_impuesto',
            'monto_total',
            'saldo',
            'serie_documento',
            'nro_control',
            'nro_control_new',
            [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
          ],
          order: [
            ['fecha_emision', 'ASC'],
            ['nro_documento', 'ASC'],
          ],
          raw: true,
        });
        if (ventas.length == 0) return false;
        break;
      case 'CCC':
        where = {
          fecha_emision: {
            [Sequelize.Op.between]: [
              moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            ],
          },
          t_de_documento: 'FA',
          estatus_administra: 'P',
          cod_agencia: data.agencia,
          cod_cliente_org: data.cliente,
        };

        ventas = await models.Mmovimientos.findAll({
          where: where,
          attributes: [
            'id',
            'cod_agencia',
            'fecha_emision',
            't_de_documento',
            'nro_documento',
            'monto_subtotal',
            'monto_impuesto',
            'monto_total',
            'saldo',
            'serie_documento',
            'nro_control',
            'nro_control_new',
            [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
          ],
          order: [
            ['fecha_emision', 'ASC'],
            ['nro_documento', 'ASC'],
          ],
          raw: true,
        });
        if (ventas.length == 0) return false;
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
        doc.text('Hasta: ' + data.fecha_hasta, {
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
        doc.text('Hasta: ' + data.fecha_hasta, {
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
      case 'RD':
        let labelDoc = 'Ventas Generales';
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
        doc.text('Hasta: ' + data.fecha_hasta, {
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

        if (tipo == 'RD') {
          if (data.agencia) {
            doc.y = 135;
            doc.x = 235;
            doc.text('Agencia: ' + data.ventas.agencia, {
              align: 'center',
              columns: 1,
              width: 400,
            });
          }

          if (data.cliente) {
            doc.y = 150;
            doc.x = 235;
            doc.text('Cliente: ' + data.ventas.cliente, {
              align: 'center',
              columns: 1,
              width: 400,
            });
          }
        }

        let labelFirst;
        if (tipo == 'VCM') {
          labelFirst = ' MES';
        } else if (tipo == 'VCD' || tipo == 'TVD') {
          labelFirst = 'FECHA';
        } else if (tipo == 'TV' || tipo == 'RD') {
          labelFirst = 'Agencia';
        } else if (tipo == 'TVC') {
          labelFirst = 'Cliente';
        }

        doc.fontSize(9);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 670, 35);
        doc.text(labelFirst, tipo != 'TVC' ? 50 : 70, 190);
        doc.text(
          'Guías',
          tipo == 'TVC' || tipo == 'TV' || tipo == 'RD' ? 150 : 120,
          190
        );
        doc.text(
          'Pzas',
          tipo == 'TVC' || tipo == 'TV' || tipo == 'RD' ? 190 : 180,
          190
        );
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
      case 'GC':
      case 'FA':
      case 'DE':
        doc.image('./img/logo_rc.png', 35, 25, { width: 80 });
        doc.fontSize(9);
        doc.text('RCS EXPRESS, S.A', 35, 155);
        doc.text('RIF. J-31028463-6', 35, 170);
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(18);

        let tittle = 'Guías Cargas';
        if (tipo == 'FA') tittle = 'Facturas';
        if (data.estatus_admin != 'A') tittle += ' Emitidas';
        else tittle += ' Anuladas';
        if (tipo == 'DE') tittle = 'Documentos Emitidos';
        doc.y = 100;
        doc.x = 140;
        doc.text(tittle, {
          align: 'center',
          columns: 1,
          width: 400,
        });

        doc.fontSize(12);
        doc.y = 125;
        doc.x = 230;
        doc.text('Desde: ' + data.fecha_desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 125;
        doc.x = 347;
        doc.text('Hasta: ' + data.fecha_hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });

        if (data.agencia) {
          doc.y = 145;
          doc.x = 140;
          doc.text('Agencia: ' + data.ventas[0]['agencias.nb_agencia'], {
            align: 'center',
            columns: 1,
            width: 400,
          });
        }
        if (data.cliente) {
          doc.y = 160;
          doc.x = 140;
          doc.text('Cliente: ' + data.ventas[0].cliente_orig_desc, {
            align: 'center',
            columns: 1,
            width: 400,
          });
        }

        doc.fontSize(9);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 510, 35);
        if (data.estatus_admin != 'A') {
          if (tipo == 'GC') {
            doc.text('Fecha', 30, 190);
            doc.text('Nro Guía', 70, 190);
            doc.text('Remitente/Destinatario', 145, 190);
            doc.text('Org / Dest', 270, 190);
            doc.text('Forma Pago', 327, 190);
            doc.text('Sub-Total', 390, 190);
            doc.text('Impuesto', 440, 190);
            doc.text('Total / Saldo', 490, 190);
            doc.text('Estatus', 558, 190);
          } else {
            doc.text('Fecha', 30, 190);
            doc.text('Nro Ctrl.', 65, 190);
            doc.text(tipo == 'FA' ? 'Nro Fact.' : 'Nro Doc.', 108, 190);
            doc.text('Cliente', 195, 190);
            doc.text(tipo == 'FA' ? 'Tipo Fact.' : 'Tipo Doc.', 275, 190);
            doc.text('F. Pago', 325, 190);
            doc.text('Sub-Total', 365, 190);
            doc.text('Impuesto', 415, 190);
            doc.text(tipo == 'FA' ? 'Total Fact.' : 'Total Doc.', 465, 190);
            doc.text('Saldo', 520, 190);
            doc.text('Estatus', 558, 190);
          }
        } else {
          doc.text('Fecha', 30, 190);
          if (tipo == 'GC') {
            doc.text('Nro Documento', 70, 190);
            doc.text('Org / Dest', 260, 190);
          } else {
            doc.text('Nro Ctrl.', 65, 190);
            doc.text('Nro Doc.', 105, 190);
            doc.text('Origen', 270, 190);
          }
          doc.text('Cliente', 190, 190);
          doc.text('Forma Pago', 310, 190);
          doc.text('Monto Doc.', 370, 190);
          doc.text('F. Anulación', 430, 190);
          doc.text('Motivo Anulación', 500, 190);
        }
        break;
      case 'FPO':
        doc.image('./img/logo_rc.png', 35, 25, { width: 80 });
        doc.fontSize(9);
        doc.text('RCS EXPRESS, S.A', 35, 155);
        doc.text('RIF. J-31028463-6', 35, 170);
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(18);

        doc.y = 100;
        doc.x = 140;
        doc.text('Facturas Emitidas FPO', {
          align: 'center',
          columns: 1,
          width: 400,
        });

        doc.fontSize(12);
        doc.y = 125;
        doc.x = 230;
        doc.text('Desde: ' + data.fecha_desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 125;
        doc.x = 347;
        doc.text('Hasta: ' + data.fecha_hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });

        if (data.agencia) {
          doc.y = 145;
          doc.x = 140;
          doc.text('Agencia: ' + data.ventas[0]['agencias.nb_agencia'], {
            align: 'center',
            columns: 1,
            width: 400,
          });
        }

        doc.fontSize(9);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 510, 35);
        doc.text('Fecha', 30, 190);
        doc.text('Nro Ctrl.', 65, 190);
        doc.text('Nro Fact.', 108, 190);
        doc.text('Cliente', 195, 190);
        doc.text('Tipo Fact.', 275, 190);
        doc.text('F. Pago', 325, 190);
        doc.text('Sub-Total', 365, 190);
        doc.text('Impuesto', 415, 190);
        doc.text('Total Fact.', 465, 190);
        doc.text('Saldo', 520, 190);
        doc.text('Estatus', 558, 190);
        break;
      case 'NC':
      case 'ND':
        doc.image('./img/logo_rc.png', 35, 25, { width: 80 });
        doc.fontSize(9);
        doc.text('RCS EXPRESS, S.A', 35, 155);
        doc.text('RIF. J-31028463-6', 35, 170);
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(18);

        doc.y = 100;
        doc.x = 140;
        doc.text(
          tipo == 'NC'
            ? 'Notas de Crédito Emitidas'
            : 'Notas de Débito Emitidas',
          {
            align: 'center',
            columns: 1,
            width: 400,
          }
        );

        doc.fontSize(12);
        doc.y = 125;
        doc.x = 230;
        doc.text('Desde: ' + data.fecha_desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 125;
        doc.x = 347;
        doc.text('Hasta: ' + data.fecha_hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });

        if (data.agencia) {
          doc.y = 145;
          doc.x = 140;
          doc.text('Agencia: ' + data.ventas[0]['agencias.nb_agencia'], {
            align: 'center',
            columns: 1,
            width: 400,
          });
        }

        doc.fontSize(9);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 510, 35);
        doc.text('Fecha', 30, 190);
        doc.text('Nro Ctrl.', 70, 190);
        doc.text('Nro Nota', 120, 190);
        doc.text('Cliente', 220, 190);
        doc.text('Documento Principal', 324, 175);
        doc.text('Nro Ctrl.', 325, 190);
        doc.text('Nro Doc.', 380, 190);
        doc.text('Sub-Total', 435, 190);
        doc.text('Impuesto', 490, 190);
        doc.text('Total Nota', 545, 190);
        break;
      case 'CG':
        doc.image('./img/logo_rc.png', 35, 25, { width: 80 });
        doc.fontSize(9);
        doc.text('RCS EXPRESS, S.A', 35, 155);
        doc.text('RIF. J-31028463-6', 35, 170);
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(18);

        doc.y = 100;
        doc.x = 140;
        doc.text('Cobranza Efectuada', {
          align: 'center',
          columns: 1,
          width: 400,
        });

        doc.fontSize(12);
        doc.y = 125;
        doc.x = 230;
        doc.text('Desde: ' + data.fecha_desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 125;
        doc.x = 347;
        doc.text('Hasta: ' + data.fecha_hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });

        if (data.agencia) {
          doc.y = 145;
          doc.x = 140;
          doc.text('Agencia: ' + data.ventas[0]['agencias.nb_agencia'], {
            align: 'center',
            columns: 1,
            width: 400,
          });
        }

        doc.fontSize(9);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 510, 35);
        doc.text('F. Emision', 30, 190);
        doc.text('Nro Doc.', 82, 190);
        doc.text('Doc. Ppal.', 125, 190);
        doc.text('Cliente', 230, 190);
        doc.text('Org / Dest', 320, 190);
        doc.text('Forma Pago', 375, 190);
        doc.text('Total Doc.', 440, 190);
        doc.text('Cobrado', 500, 190);
        doc.text('Saldo', 560, 190);
        break;
      case 'CD':
        doc.image('./img/logo_rc.png', 35, 25, { width: 80 });
        doc.fontSize(9);
        doc.text('RCS EXPRESS, S.A', 35, 155);
        doc.text('RIF. J-31028463-6', 35, 170);
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(18);

        doc.y = 100;
        doc.x = 140;
        doc.text('Cobro en Destino', {
          align: 'center',
          columns: 1,
          width: 400,
        });

        doc.fontSize(12);
        doc.y = 125;
        doc.x = 230;
        doc.text('Desde: ' + data.fecha_desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 125;
        doc.x = 347;
        doc.text('Hasta: ' + data.fecha_hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });

        if (data.agencia) {
          doc.y = 145;
          doc.x = 140;
          doc.text('Agencia: ' + data.ventas[0]['agencias.nb_agencia'], {
            align: 'center',
            columns: 1,
            width: 400,
          });
        }

        doc.fontSize(9);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 510, 35);
        doc.text('Fecha', 30, 190);
        doc.text('Nro Doc.', 68, 190);
        doc.text('Nro Doc. P.', 118, 190);
        doc.text('Cliente Destinatario', 205, 190);
        doc.text('F. Pago', 325, 190);
        doc.text('Sub-Total', 365, 190);
        doc.text('Impuesto', 415, 190);
        doc.text('Total Doc.', 465, 190);
        doc.text('Saldo', 520, 190);
        doc.text('Estatus', 558, 190);
        break;
      case 'CC':
        doc.image('./img/logo_rc.png', 35, 25, { width: 80 });
        doc.fontSize(9);
        doc.text('RCS EXPRESS, S.A', 35, 155);
        doc.text('RIF. J-31028463-6', 35, 170);
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(18);

        doc.y = 100;
        doc.x = 140;
        doc.text('Facturas Pendientes de Cobro', {
          align: 'center',
          columns: 1,
          width: 400,
        });

        doc.fontSize(12);
        doc.y = 125;
        doc.x = 230;
        doc.text('Desde: ' + data.fecha_desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 125;
        doc.x = 347;
        doc.text('Hasta: ' + data.fecha_hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });

        doc.fontSize(9);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 510, 35);
        doc.text('Cliente', 100, 190);
        doc.text('Nro. Documento', 185, 190);
        doc.text('Fecha', 282, 190);
        doc.text('Monto Subtotal', 335, 190);
        doc.text('Impuesto', 420, 190);
        doc.text('Monto Total', 480, 190);
        doc.text('Saldo', 550, 190);
        break;
      case 'CCC':
        doc.image('./img/logo_rc.png', 35, 25, { width: 80 });
        doc.fontSize(9);
        doc.text('RCS EXPRESS, S.A', 35, 155);
        doc.text('RIF. J-31028463-6', 35, 170);
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(18);

        doc.y = 100;
        doc.x = 140;
        doc.text('Facturas Pendientes de Cobro', {
          align: 'center',
          columns: 1,
          width: 400,
        });

        doc.fontSize(12);
        doc.y = 125;
        doc.x = 230;
        doc.text('Desde: ' + data.fecha_desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 125;
        doc.x = 347;
        doc.text('Hasta: ' + data.fecha_hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 145;
        doc.x = 140;
        doc.text(data.ventas[0].cliente_orig_desc, {
          align: 'center',
          columns: 1,
          width: 400,
        });

        doc.fontSize(9);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 510, 35);
        doc.text('Nro. Documento', 70, 190);
        doc.text('Fecha Emision', 170, 190);
        doc.text('Monto Subtotal', 260, 190);
        doc.text('Impuesto', 360, 190);
        doc.text('Monto Total', 440, 190);
        doc.text('Saldo', 520, 190);
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
      case 'RD':
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
          } else if (tipo == 'TV' || tipo == 'TVC' || tipo == 'RD') {
            doc.fontSize(7);
            doc.y = ymin + i;
            doc.x = 30;
            doc.text(
              tipo == 'TV' || tipo == 'RD'
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

          i += tipo == 'TVC' || tipo == 'RD' ? 20 : 15;
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
      case 'GC':
      case 'FA':
      case 'DE':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 205;
        if (data.estatus_admin != 'A') {
          if (tipo == 'GC') {
            for (var item = 0; item < data.ventas.length; item++) {
              if (
                !data.correlativo &&
                (item == 0 ||
                  data.ventas[item].cod_agencia !=
                    data.ventas[item - 1].cod_agencia)
              ) {
                if (item > 0) i += 20;
                doc.fontSize(12);
                doc.font('Helvetica-Bold');
                doc.text(
                  data.ventas[item]['agencias.nb_agencia'],
                  35,
                  ymin + i
                );
                i += 20;
              }

              doc.fontSize(7);
              doc.font('Helvetica');
              doc.fillColor('#444444');
              doc.y = ymin + i;
              doc.x = 25;
              doc.text(
                moment(data.ventas[item].fecha_emision).format('DD/MM/YYYY'),
                {
                  align: 'center',
                  columns: 1,
                  width: 40,
                }
              );

              doc.y = ymin + i;
              doc.x = 70;
              doc.text(data.ventas[item].nro_documento, {
                align: 'center',
                columns: 1,
                width: 40,
              });
              let nroFact = '';
              if (data.ventas[item].tipo_doc_principal) {
                nroFact = data.ventas[item].tipo_doc_principal + '-';
                if (data.ventas[item].serie_doc_principal)
                  nroFact += data.ventas[item].serie_doc_principal;
                if (data.ventas[item].nro_doc_principal)
                  nroFact += data.ventas[item].nro_doc_principal;
              }
              doc.y = ymin + i + 8;
              doc.x = 70;
              doc.text(nroFact, {
                align: 'center',
                columns: 1,
                width: 40,
              });
              doc.y = ymin + i;
              doc.x = 120;
              doc.text(
                utils.truncate(data.ventas[item].cliente_orig_desc, 34),
                {
                  align: 'left',
                  columns: 1,
                  width: 150,
                }
              );
              doc.y = ymin + i + 8;
              doc.x = 120;
              doc.text(
                utils.truncate(data.ventas[item].cliente_dest_desc, 34),
                {
                  align: 'left',
                  columns: 1,
                  width: 150,
                }
              );
              doc.y = ymin + i;
              doc.x = 268;
              doc.text(
                data.ventas[item]['agencias.ciudades.siglas'] +
                  ' / ' +
                  data.ventas[item]['agencias_dest.ciudades.siglas'],
                {
                  align: 'center',
                  columns: 1,
                  width: 50,
                }
              );
              let modalidad = 'Contado';
              if (data.ventas[item].modalidad_pago == 'CR')
                modalidad = 'Crédito';
              if (data.ventas[item].pagado_en == 'O') modalidad += '/Origen';
              else modalidad += '/Destino';
              doc.y = ymin + i;
              doc.x = 329;
              doc.text(modalidad, {
                align: 'left',
                columns: 1,
                width: 50,
              });

              let montoSubtotal = 0;
              let montoImpuesto = 0;
              let montoTotal = 0;
              let montoSaldo = 0;

              if (data.visible == 'SI') {
                if (data.ventas[item].estatus_administra != 'A') {
                  montoSubtotal = data.ventas[item].monto_subtotal;
                  montoImpuesto = data.ventas[item].monto_impuesto;
                  montoTotal = data.ventas[item].monto_total;
                  montoSaldo = data.ventas[item].saldo;
                }
                doc.y = ymin + i;
                doc.x = 380;
                doc.text(utils.formatNumber(montoSubtotal), {
                  align: 'right',
                  columns: 1,
                  width: 50,
                });
                doc.y = ymin + i;
                doc.x = 430;
                doc.text(utils.formatNumber(montoImpuesto), {
                  align: 'right',
                  columns: 1,
                  width: 50,
                });
                doc.y = ymin + i;
                doc.x = 480;
                doc.text(utils.formatNumber(montoTotal), {
                  align: 'right',
                  columns: 1,
                  width: 60,
                });
                doc.y = ymin + i + 8;
                doc.x = 480;
                doc.text(utils.formatNumber(montoSaldo), {
                  align: 'right',
                  columns: 1,
                  width: 60,
                });
              }

              doc.y = ymin + i;
              doc.x = 545;
              doc.text(
                estatus_administrativo.find(
                  (estatus) =>
                    estatus.value == data.ventas[item].estatus_administra
                ).label,
                {
                  align: 'center',
                  columns: 1,
                  width: 60,
                }
              );
              doc.y = ymin + i + 8;
              doc.x = 545;
              doc.text(
                estatus_operativo.find(
                  (estatus) =>
                    estatus.value == data.ventas[item].estatus_operativo
                ).label,
                {
                  align: 'center',
                  columns: 1,
                  width: 60,
                }
              );

              // Sub Totales por Agencia
              if (
                !data.correlativo &&
                item > 0 &&
                data.ventas[item].cod_agencia !=
                  data.ventas[item - 1].cod_agencia &&
                data.visible == 'SI'
              ) {
                doc.font('Helvetica-Bold');
                doc.y = ymin + i - 36;
                doc.x = 300;
                doc.text('Sub-Totales por Agencia:', {
                  align: 'left',
                  columns: 1,
                  width: 100,
                });
                doc.y = ymin + i - 36;
                doc.x = 380;
                doc.text(utils.formatNumber(subTotalSubtotal), {
                  align: 'right',
                  columns: 1,
                  width: 50,
                });
                doc.y = ymin + i - 36;
                doc.x = 430;
                doc.text(utils.formatNumber(subTotalImpuesto), {
                  align: 'right',
                  columns: 1,
                  width: 50,
                });
                doc.y = ymin + i - 36;
                doc.x = 480;
                doc.text(utils.formatNumber(subTotalMontoVenta), {
                  align: 'right',
                  columns: 1,
                  width: 60,
                });

                doc.font('Helvetica');
                i += 3;

                subTotalSubtotal = 0;
                subTotalImpuesto = 0;
                subTotalMontoVenta = 0;
              }

              totalSubtotal += utils.parseFloatN(montoSubtotal);
              totalImpuesto += utils.parseFloatN(montoImpuesto);
              totalMontoVenta += utils.parseFloatN(montoTotal);
              totalSaldo += utils.parseFloatN(montoSaldo);

              subTotalSubtotal += utils.parseFloatN(montoSubtotal);
              subTotalImpuesto += utils.parseFloatN(montoImpuesto);
              subTotalMontoVenta += utils.parseFloatN(montoTotal);

              i += 20;
              if (i >= 520) {
                doc.fillColor('#BLACK');
                doc.addPage();
                page = page + 1;
                doc.switchToPage(page);
                i = 0;
                await this.generateHeader(doc, tipo, data);
              }
            }

            // Sub Totales por Agencia Finales
            if (!data.correlativo && data.visible == 'SI') {
              i += 10;
              doc.font('Helvetica-Bold');
              doc.y = ymin + i;
              doc.x = 300;
              doc.text('Sub-Totales por Agencia:', {
                align: 'left',
                columns: 1,
                width: 100,
              });
              doc.y = ymin + i;
              doc.x = 380;
              doc.text(utils.formatNumber(subTotalSubtotal), {
                align: 'right',
                columns: 1,
                width: 50,
              });
              doc.y = ymin + i;
              doc.x = 430;
              doc.text(utils.formatNumber(subTotalImpuesto), {
                align: 'right',
                columns: 1,
                width: 50,
              });
              doc.y = ymin + i;
              doc.x = 480;
              doc.text(utils.formatNumber(subTotalMontoVenta), {
                align: 'right',
                columns: 1,
                width: 60,
              });
            }

            // Totales Finales
            if (data.visible == 'SI') {
              i += 10;
              doc.font('Helvetica-Bold');
              doc.y = ymin + i;
              doc.x = 338;
              doc.text('Total General:', {
                align: 'left',
                columns: 1,
                width: 100,
              });
              doc.y = ymin + i;
              doc.x = 380;
              doc.text(utils.formatNumber(totalSubtotal), {
                align: 'right',
                columns: 1,
                width: 50,
              });
              doc.y = ymin + i;
              doc.x = 430;
              doc.text(utils.formatNumber(totalImpuesto), {
                align: 'right',
                columns: 1,
                width: 50,
              });
              doc.y = ymin + i;
              doc.x = 480;
              doc.text(utils.formatNumber(totalMontoVenta), {
                align: 'right',
                columns: 1,
                width: 60,
              });
            }
          } else {
            for (var item = 0; item < data.ventas.length; item++) {
              if (
                !data.correlativo &&
                (item == 0 ||
                  data.ventas[item].cod_agencia !=
                    data.ventas[item - 1].cod_agencia)
              ) {
                if (item > 0) i += 20;
                doc.fontSize(12);
                doc.font('Helvetica-Bold');
                doc.text(
                  data.ventas[item]['agencias.nb_agencia'],
                  35,
                  ymin + i
                );
                i += 20;
              }

              doc.fontSize(7);
              doc.font('Helvetica');
              doc.fillColor('#444444');
              doc.y = ymin + i;
              doc.x = 25;
              doc.text(
                moment(data.ventas[item].fecha_emision).format('DD/MM/YYYY'),
                {
                  align: 'center',
                  columns: 1,
                  width: 40,
                }
              );

              let nro_control = '';
              if (!data.ventas[item].nro_control) {
                nro_control =
                  data.ventas[item].serie_documento +
                  ' - ' +
                  data.ventas[item].nro_documento;
              } else if (!data.ventas[item].nro_control_new) {
                nro_control = data.ventas[item].nro_control.padStart(4, '0000');
              } else if (!data.ventas[item].serie_documento) {
                nro_control = data.ventas[item].nro_control_new.padStart(
                  9,
                  '00-000000'
                );
              } else {
                nro_control =
                  data.ventas[item].serie_documento +
                  ' - ' +
                  data.ventas[item].nro_control_new.padStart(9, '00-000000');
              }
              doc.y = ymin + i;
              doc.x = 65;
              doc.text(nro_control, {
                align: 'center',
                columns: 1,
                width: 40,
              });

              let nro_fact = 'FA-';
              if (!data.ventas[item].nro_control) {
                nro_fact +=
                  data.ventas[item].serie_documento +
                  ' - ' +
                  data.ventas[item].nro_documento;
              } else {
                nro_fact += data.ventas[item].nro_control.padStart(4, '0000');
              }
              doc.y = ymin + i;
              doc.x = 105;
              doc.text(nro_fact, {
                align: 'center',
                columns: 1,
                width: 40,
              });

              doc.y = ymin + i;
              doc.x = 150;
              doc.text(
                utils.truncate(data.ventas[item].cliente_orig_desc, 29),
                {
                  align: 'left',
                  columns: 1,
                  width: 125,
                }
              );

              doc.y = ymin + i;
              doc.x = 265;
              doc.text(
                tipo_factura.find(
                  (tipo) => tipo.value == data.ventas[item].tipo_factura
                ).label,
                {
                  align: 'center',
                  columns: 1,
                  width: 60,
                }
              );

              let modalidad = 'Contado';
              if (data.ventas[item].modalidad_pago == 'CR')
                modalidad = 'Crédito';
              doc.y = ymin + i;
              doc.x = 327;
              doc.text(modalidad, {
                align: 'left',
                columns: 1,
                width: 50,
              });

              let montoSubtotal = 0;
              let montoImpuesto = 0;
              let montoTotal = 0;
              let montoSaldo = 0;

              if (data.visible == 'SI') {
                if (data.ventas[item].estatus_administra != 'A') {
                  montoSubtotal = data.ventas[item].monto_subtotal;
                  montoImpuesto = data.ventas[item].monto_impuesto;
                  montoTotal = data.ventas[item].monto_total;
                  montoSaldo = data.ventas[item].saldo;
                }
                doc.y = ymin + i;
                doc.x = 355;
                doc.text(utils.formatNumber(montoSubtotal), {
                  align: 'right',
                  columns: 1,
                  width: 50,
                });
                doc.y = ymin + i;
                doc.x = 400;
                doc.text(utils.formatNumber(montoImpuesto), {
                  align: 'right',
                  columns: 1,
                  width: 50,
                });
                doc.y = ymin + i;
                doc.x = 445;
                doc.text(utils.formatNumber(montoTotal), {
                  align: 'right',
                  columns: 1,
                  width: 60,
                });
                doc.y = ymin + i;
                doc.x = 485;
                doc.text(utils.formatNumber(montoSaldo), {
                  align: 'right',
                  columns: 1,
                  width: 60,
                });
              }

              doc.y = ymin + i;
              doc.x = 545;
              doc.text(
                estatus_administrativo.find(
                  (estatus) =>
                    estatus.value == data.ventas[item].estatus_administra
                ).label,
                {
                  align: 'center',
                  columns: 1,
                  width: 60,
                }
              );

              // Sub Totales por Agencia
              if (
                !data.correlativo &&
                item > 0 &&
                data.ventas[item].cod_agencia !=
                  data.ventas[item - 1].cod_agencia &&
                data.visible == 'SI'
              ) {
                doc.font('Helvetica-Bold');
                doc.y = ymin + i - 36;
                doc.x = 270;
                doc.text('Sub-Totales por Agencia:', {
                  align: 'left',
                  columns: 1,
                  width: 100,
                });
                doc.y = ymin + i - 36;
                doc.x = 355;
                doc.text(utils.formatNumber(subTotalSubtotal), {
                  align: 'right',
                  columns: 1,
                  width: 50,
                });
                doc.y = ymin + i - 36;
                doc.x = 400;
                doc.text(utils.formatNumber(subTotalImpuesto), {
                  align: 'right',
                  columns: 1,
                  width: 50,
                });
                doc.y = ymin + i - 36;
                doc.x = 445;
                doc.text(utils.formatNumber(subTotalMontoVenta), {
                  align: 'right',
                  columns: 1,
                  width: 60,
                });
                doc.y = ymin + i - 36;
                doc.x = 485;
                doc.text(utils.formatNumber(subTotalSaldo), {
                  align: 'right',
                  columns: 1,
                  width: 60,
                });

                doc.font('Helvetica');
                i += 3;

                subTotalSubtotal = 0;
                subTotalImpuesto = 0;
                subTotalMontoVenta = 0;
                subTotalSaldo = 0;
              }

              totalSubtotal += utils.parseFloatN(montoSubtotal);
              totalImpuesto += utils.parseFloatN(montoImpuesto);
              totalMontoVenta += utils.parseFloatN(montoTotal);
              totalSaldo += utils.parseFloatN(montoSaldo);

              subTotalSubtotal += utils.parseFloatN(montoSubtotal);
              subTotalImpuesto += utils.parseFloatN(montoImpuesto);
              subTotalMontoVenta += utils.parseFloatN(montoTotal);
              subTotalSaldo += utils.parseFloatN(montoSaldo);

              i += 15;
              if (i >= 520) {
                doc.fillColor('#BLACK');
                doc.addPage();
                page = page + 1;
                doc.switchToPage(page);
                i = 0;
                await this.generateHeader(doc, tipo, data);
              }
            }

            // Sub Totales por Agencia Finales
            if (!data.correlativo && data.visible == 'SI') {
              i += 10;
              doc.font('Helvetica-Bold');
              doc.y = ymin + i;
              doc.x = 270;
              doc.text('Sub-Totales por Agencia:', {
                align: 'left',
                columns: 1,
                width: 100,
              });
              doc.y = ymin + i;
              doc.x = 355;
              doc.text(utils.formatNumber(subTotalSubtotal), {
                align: 'right',
                columns: 1,
                width: 50,
              });
              doc.y = ymin + i;
              doc.x = 400;
              doc.text(utils.formatNumber(subTotalImpuesto), {
                align: 'right',
                columns: 1,
                width: 50,
              });
              doc.y = ymin + i;
              doc.x = 445;
              doc.text(utils.formatNumber(subTotalMontoVenta), {
                align: 'right',
                columns: 1,
                width: 60,
              });
              doc.y = ymin + i;
              doc.x = 485;
              doc.text(utils.formatNumber(subTotalSaldo), {
                align: 'right',
                columns: 1,
                width: 60,
              });
            }

            // Totales Finales
            if (data.visible == 'SI') {
              i += 10;
              doc.font('Helvetica-Bold');
              doc.y = ymin + i;
              doc.x = 308;
              doc.text('Total General:', {
                align: 'left',
                columns: 1,
                width: 100,
              });
              doc.y = ymin + i;
              doc.x = 355;
              doc.text(utils.formatNumber(totalSubtotal), {
                align: 'right',
                columns: 1,
                width: 50,
              });
              doc.y = ymin + i;
              doc.x = 400;
              doc.text(utils.formatNumber(totalImpuesto), {
                align: 'right',
                columns: 1,
                width: 50,
              });
              doc.y = ymin + i;
              doc.x = 445;
              doc.text(utils.formatNumber(totalMontoVenta), {
                align: 'right',
                columns: 1,
                width: 60,
              });
              doc.y = ymin + i;
              doc.x = 485;
              doc.text(utils.formatNumber(totalSaldo), {
                align: 'right',
                columns: 1,
                width: 60,
              });
            }
          }
        } else {
          for (var item = 0; item < data.ventas.length; item++) {
            if (
              !data.correlativo &&
              (item == 0 ||
                data.ventas[item].cod_agencia !=
                  data.ventas[item - 1].cod_agencia)
            ) {
              if (item > 0) i += 20;
              doc.fontSize(12);
              doc.font('Helvetica-Bold');
              doc.text(data.ventas[item]['agencias.nb_agencia'], 35, ymin + i);
              i += 20;
            }

            doc.fontSize(7);
            doc.font('Helvetica');
            doc.fillColor('#444444');
            doc.y = ymin + i;
            doc.x = 25;
            doc.text(
              moment(data.ventas[item].fecha_emision).format('DD/MM/YYYY'),
              {
                align: 'center',
                columns: 1,
                width: 40,
              }
            );

            if (tipo == 'GC') {
              doc.y = ymin + i;
              doc.x = 85;
              doc.text(data.ventas[item].nro_documento, {
                align: 'center',
                columns: 1,
                width: 40,
              });
              doc.y = ymin + i;
              doc.x = 140;
              doc.text(
                utils.truncate(data.ventas[item].cliente_orig_desc, 27),
                {
                  align: 'left',
                  columns: 1,
                  width: 150,
                }
              );
              doc.y = ymin + i;
              doc.x = 255;
              doc.text(
                data.ventas[item]['agencias.ciudades.siglas'] +
                  ' / ' +
                  data.ventas[item]['agencias_dest.ciudades.siglas'],
                {
                  align: 'center',
                  columns: 1,
                  width: 50,
                }
              );
            } else {
              let nro_control = '';
              if (!data.ventas[item].nro_control) {
                nro_control =
                  data.ventas[item].serie_documento +
                  ' - ' +
                  data.ventas[item].nro_documento;
              } else if (!data.ventas[item].nro_control_new) {
                nro_control = data.ventas[item].nro_control.padStart(4, '0000');
              } else if (!data.ventas[item].serie_documento) {
                nro_control = data.ventas[item].nro_control_new.padStart(
                  9,
                  '00-000000'
                );
              } else {
                nro_control =
                  data.ventas[item].serie_documento +
                  ' - ' +
                  data.ventas[item].nro_control_new.padStart(9, '00-000000');
              }
              doc.y = ymin + i;
              doc.x = 65;
              doc.text(nro_control, {
                align: 'center',
                columns: 1,
                width: 40,
              });

              let nro_fact = 'FA-';
              if (!data.ventas[item].nro_control) {
                nro_fact +=
                  data.ventas[item].serie_documento +
                  ' - ' +
                  data.ventas[item].nro_documento;
              } else {
                nro_fact += data.ventas[item].nro_control.padStart(4, '0000');
              }
              doc.y = ymin + i;
              doc.x = 103;
              doc.text(nro_fact, {
                align: 'center',
                columns: 1,
                width: 40,
              });
              doc.y = ymin + i;
              doc.x = 147;
              doc.text(
                utils.truncate(data.ventas[item].cliente_orig_desc, 28),
                {
                  align: 'left',
                  columns: 1,
                  width: 150,
                }
              );
              doc.y = ymin + i;
              doc.x = 262;
              doc.text(data.ventas[item]['agencias.ciudades.siglas'], {
                align: 'center',
                columns: 1,
                width: 50,
              });
            }

            let modalidad = 'Contado';
            if (data.ventas[item].modalidad_pago == 'CR') modalidad = 'Crédito';
            if (data.ventas[item].pagado_en == 'O') modalidad += '/Origen';
            else modalidad += '/Destino';
            doc.y = ymin + i;
            doc.x = 312;
            doc.text(modalidad, {
              align: 'left',
              columns: 1,
              width: 50,
            });

            if (data.visible == 'SI') {
              doc.y = ymin + i;
              doc.x = 370;
              doc.text(utils.formatNumber(data.ventas[item].monto_total), {
                align: 'right',
                columns: 1,
                width: 50,
              });
            }

            doc.y = ymin + i;
            doc.x = 435;
            doc.text(
              moment(data.ventas[item].fecha_anulacion).format('DD/MM/YYYY'),
              {
                align: 'center',
                columns: 1,
                width: 40,
              }
            );

            doc.y = ymin + i;
            doc.x = 485;
            doc.text(data.ventas[item]['conceptos.desc_concepto'], {
              align: 'center',
              columns: 1,
              width: 100,
            });

            // Sub Totales por Agencia
            if (
              !data.correlativo &&
              item > 0 &&
              data.ventas[item].cod_agencia !=
                data.ventas[item - 1].cod_agencia &&
              data.visible == 'SI'
            ) {
              doc.font('Helvetica-Bold');
              doc.y = ymin + i - 36;
              doc.x = 300;
              doc.text('Sub-Totales por Agencia:', {
                align: 'left',
                columns: 1,
                width: 100,
              });
              doc.y = ymin + i - 36;
              doc.x = 370;
              doc.text(utils.formatNumber(subTotalMontoVenta), {
                align: 'right',
                columns: 1,
                width: 50,
              });

              doc.font('Helvetica');
              i += 3;
              subTotalMontoVenta = 0;
            }

            subTotalMontoVenta += utils.parseFloatN(
              data.ventas[item].monto_total
            );
            totalMontoVenta += utils.parseFloatN(data.ventas[item].monto_total);

            i += 15;
            if (i >= 520) {
              doc.fillColor('#BLACK');
              doc.addPage();
              page = page + 1;
              doc.switchToPage(page);
              i = 0;
              await this.generateHeader(doc, tipo, data);
            }
          }

          // Sub Totales por Agencia Finales
          if (!data.correlativo && data.visible == 'SI') {
            i += 10;
            doc.font('Helvetica-Bold');
            doc.y = ymin + i;
            doc.x = 300;
            doc.text('Sub-Totales por Agencia:', {
              align: 'left',
              columns: 1,
              width: 100,
            });
            doc.y = ymin + i;
            doc.x = 370;
            doc.text(utils.formatNumber(subTotalMontoVenta), {
              align: 'right',
              columns: 1,
              width: 50,
            });
          }

          // Totales Finales
          if (data.visible == 'SI') {
            i += 10;
            doc.font('Helvetica-Bold');
            doc.y = ymin + i;
            doc.x = 338;
            doc.text('Total General:', {
              align: 'left',
              columns: 1,
              width: 100,
            });
            doc.y = ymin + i;
            doc.x = 370;
            doc.text(utils.formatNumber(totalMontoVenta), {
              align: 'right',
              columns: 1,
              width: 50,
            });
          }
        }
        break;
      case 'FPO':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 205;
        for (var item = 0; item < data.ventas.length; item++) {
          doc.fontSize(7);
          doc.font('Helvetica');
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 25;
          doc.text(
            moment(data.ventas[item].fecha_emision).format('DD/MM/YYYY'),
            {
              align: 'center',
              columns: 1,
              width: 40,
            }
          );

          let nro_control = '';
          if (!data.ventas[item].nro_control) {
            nro_control =
              data.ventas[item].serie_documento +
              ' - ' +
              data.ventas[item].nro_documento;
          } else if (!data.ventas[item].nro_control_new) {
            nro_control = data.ventas[item].nro_control.padStart(4, '0000');
          } else if (!data.ventas[item].serie_documento) {
            nro_control = data.ventas[item].nro_control_new.padStart(
              9,
              '00-000000'
            );
          } else {
            nro_control =
              data.ventas[item].serie_documento +
              ' - ' +
              data.ventas[item].nro_control_new.padStart(9, '00-000000');
          }
          doc.y = ymin + i;
          doc.x = 65;
          doc.text(nro_control, {
            align: 'center',
            columns: 1,
            width: 40,
          });

          let nro_fact = 'FA-';
          if (!data.ventas[item].nro_control) {
            nro_fact +=
              data.ventas[item].serie_documento +
              ' - ' +
              data.ventas[item].nro_documento;
          } else {
            nro_fact += data.ventas[item].nro_control.padStart(4, '0000');
          }
          doc.y = ymin + i;
          doc.x = 105;
          doc.text(nro_fact, {
            align: 'center',
            columns: 1,
            width: 40,
          });

          doc.y = ymin + i;
          doc.x = 150;
          doc.text(utils.truncate(data.ventas[item].cliente_orig_desc, 29), {
            align: 'left',
            columns: 1,
            width: 125,
          });

          doc.y = ymin + i;
          doc.x = 265;
          doc.text(
            tipo_factura.find(
              (tipo) => tipo.value == data.ventas[item].tipo_factura
            ).label,
            {
              align: 'center',
              columns: 1,
              width: 60,
            }
          );

          let modalidad = 'Contado';
          if (data.ventas[item].modalidad_pago == 'CR') modalidad = 'Crédito';
          doc.y = ymin + i;
          doc.x = 327;
          doc.text(modalidad, {
            align: 'left',
            columns: 1,
            width: 50,
          });

          let montoSubtotal = 0;
          let montoImpuesto = 0;
          let montoTotal = 0;
          let montoSaldo = 0;

          if (data.visible == 'SI') {
            if (data.ventas[item].estatus_administra != 'A') {
              montoSubtotal = data.ventas[item].monto_subtotal;
              montoImpuesto = data.ventas[item].monto_impuesto;
              montoTotal = data.ventas[item].monto_total;
              montoSaldo = data.ventas[item].saldo;
            }
            doc.y = ymin + i;
            doc.x = 355;
            doc.text(utils.formatNumber(montoSubtotal), {
              align: 'right',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i;
            doc.x = 400;
            doc.text(utils.formatNumber(montoImpuesto), {
              align: 'right',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i;
            doc.x = 445;
            doc.text(utils.formatNumber(montoTotal), {
              align: 'right',
              columns: 1,
              width: 60,
            });
            doc.y = ymin + i;
            doc.x = 485;
            doc.text(utils.formatNumber(montoSaldo), {
              align: 'right',
              columns: 1,
              width: 60,
            });
          }

          doc.y = ymin + i;
          doc.x = 545;
          doc.text(
            estatus_administrativo.find(
              (estatus) => estatus.value == data.ventas[item].estatus_administra
            ).label,
            {
              align: 'center',
              columns: 1,
              width: 60,
            }
          );

          totalSubtotal += utils.parseFloatN(montoSubtotal);
          totalImpuesto += utils.parseFloatN(montoImpuesto);
          totalMontoVenta += utils.parseFloatN(montoTotal);
          totalSaldo += utils.parseFloatN(montoSaldo);

          i += 15;
          if (i >= 520) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data);
          }
        }

        // Totales Finales
        if (data.visible == 'SI') {
          i += 10;
          doc.font('Helvetica-Bold');
          doc.y = ymin + i;
          doc.x = 308;
          doc.text('Total General:', {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.y = ymin + i;
          doc.x = 355;
          doc.text(utils.formatNumber(totalSubtotal), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 400;
          doc.text(utils.formatNumber(totalImpuesto), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 445;
          doc.text(utils.formatNumber(totalMontoVenta), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 485;
          doc.text(utils.formatNumber(totalSaldo), {
            align: 'right',
            columns: 1,
            width: 60,
          });
        }
        break;
      case 'NC':
      case 'ND':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 205;
        for (var item = 0; item < data.ventas.length; item++) {
          if (
            !data.correlativo &&
            (item == 0 ||
              data.ventas[item].cod_agencia !=
                data.ventas[item - 1].cod_agencia)
          ) {
            if (item > 0) i += 20;
            doc.fontSize(12);
            doc.font('Helvetica-Bold');
            doc.text(data.ventas[item]['agencias.nb_agencia'], 35, ymin + i);
            i += 20;
          }

          doc.fontSize(7);
          doc.font('Helvetica');
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 25;
          doc.text(
            moment(data.ventas[item].fecha_emision).format('DD/MM/YYYY'),
            {
              align: 'center',
              columns: 1,
              width: 40,
            }
          );

          let nro_control = '';
          if (!data.ventas[item].nro_control) {
            nro_control =
              data.ventas[item].serie_documento +
              ' - ' +
              data.ventas[item].nro_documento;
          } else if (!data.ventas[item].nro_control_new) {
            nro_control = data.ventas[item].nro_control.padStart(4, '0000');
          } else if (!data.ventas[item].serie_documento) {
            nro_control = data.ventas[item].nro_control_new.padStart(
              9,
              '00-000000'
            );
          } else {
            nro_control =
              data.ventas[item].serie_documento +
              ' - ' +
              data.ventas[item].nro_control_new.padStart(9, '00-000000');
          }
          doc.y = ymin + i;
          doc.x = 70;
          doc.text(nro_control, {
            align: 'center',
            columns: 1,
            width: 40,
          });

          let nro_fact = 'FA-';
          if (!data.ventas[item].nro_control) {
            nro_fact +=
              data.ventas[item].serie_documento +
              ' - ' +
              data.ventas[item].nro_documento;
          } else {
            nro_fact += data.ventas[item].nro_control.padStart(4, '0000');
          }
          doc.y = ymin + i;
          doc.x = 120;
          doc.text(nro_fact, {
            align: 'center',
            columns: 1,
            width: 40,
          });

          doc.y = ymin + i;
          doc.x = 170;
          doc.text(utils.truncate(data.ventas[item].cliente_orig_desc, 34), {
            align: 'left',
            columns: 1,
            width: 150,
          });

          let nroFactOrig = '';
          if (data.ventas[item].estatus_administra != 'A') {
            if (data.ventas[item].serie_doc_principal)
              nroFactOrig += data.ventas[item].serie_doc_principal + '-';
            if (data.ventas[item].nro_ctrl_doc_ppal_new) {
              nroFactOrig += data.ventas[item].nro_ctrl_doc_ppal_new.padStart(
                9,
                '00-000000'
              );
            } else if (!data.ventas[item].nro_ctrl_doc_ppal) {
              nroFactOrig += data.ventas[item].nro_ctrl_doc_ppal_new.padStart(
                4,
                '0000'
              );
            } else {
              nroFactOrig += data.ventas[item].nro_doc_principal;
            }
          }

          let nroDocOrig = '';
          if (data.ventas[item].estatus_administra != 'A') {
            nroDocOrig += data.ventas[item].tipo_doc_principal + ' ';
            if (data.ventas[item].serie_doc_principal)
              nroDocOrig += data.ventas[item].serie_doc_principal + '-';
            if (data.ventas[item].nro_ctrl_doc_ppal) {
              nroDocOrig += data.ventas[item].nro_ctrl_doc_ppal.padStart(
                4,
                '0000'
              );
            } else {
              nroDocOrig += data.ventas[item].nro_doc_principal;
            }
          }

          doc.y = ymin + i;
          doc.x = 325;
          doc.text(nroFactOrig, {
            align: 'left',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 382;
          doc.text(nroDocOrig, {
            align: 'left',
            columns: 1,
            width: 50,
          });

          let montoSubtotal = 0;
          let montoImpuesto = 0;
          let montoTotal = 0;

          if (data.visible == 'SI') {
            if (data.ventas[item].estatus_administra != 'A') {
              montoSubtotal = data.ventas[item].monto_subtotal;
              montoImpuesto = data.ventas[item].monto_impuesto;
              montoTotal = data.ventas[item].monto_total;
            }
            doc.y = ymin + i;
            doc.x = 420;
            doc.text(utils.formatNumber(montoSubtotal), {
              align: 'right',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i;
            doc.x = 475;
            doc.text(utils.formatNumber(montoImpuesto), {
              align: 'right',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i;
            doc.x = 524;
            doc.text(utils.formatNumber(montoTotal), {
              align: 'right',
              columns: 1,
              width: 60,
            });
          }

          // Sub Totales por Agencia
          if (
            !data.correlativo &&
            item > 0 &&
            data.ventas[item].cod_agencia !=
              data.ventas[item - 1].cod_agencia &&
            data.visible == 'SI'
          ) {
            doc.font('Helvetica-Bold');
            doc.y = ymin + i - 36;
            doc.x = 340;
            doc.text('Sub-Totales por Agencia:', {
              align: 'left',
              columns: 1,
              width: 100,
            });
            doc.y = ymin + i - 36;
            doc.x = 420;
            doc.text(utils.formatNumber(subTotalSubtotal), {
              align: 'right',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i - 36;
            doc.x = 475;
            doc.text(utils.formatNumber(subTotalImpuesto), {
              align: 'right',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i - 36;
            doc.x = 524;
            doc.text(utils.formatNumber(subTotalMontoVenta), {
              align: 'right',
              columns: 1,
              width: 60,
            });

            doc.font('Helvetica');
            i += 3;

            subTotalSubtotal = 0;
            subTotalImpuesto = 0;
            subTotalMontoVenta = 0;
          }

          totalSubtotal += utils.parseFloatN(montoSubtotal);
          totalImpuesto += utils.parseFloatN(montoImpuesto);
          totalMontoVenta += utils.parseFloatN(montoTotal);

          subTotalSubtotal += utils.parseFloatN(montoSubtotal);
          subTotalImpuesto += utils.parseFloatN(montoImpuesto);
          subTotalMontoVenta += utils.parseFloatN(montoTotal);

          i += 15;
          if (i >= 520) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data);
          }
        }

        // Sub Totales por Agencia Finales
        if (!data.correlativo && data.visible == 'SI') {
          i += 10;
          doc.font('Helvetica-Bold');
          doc.y = ymin + i;
          doc.x = 340;
          doc.text('Sub-Totales por Agencia:', {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.y = ymin + i;
          doc.x = 420;
          doc.text(utils.formatNumber(subTotalSubtotal), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 475;
          doc.text(utils.formatNumber(subTotalImpuesto), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 524;
          doc.text(utils.formatNumber(subTotalMontoVenta), {
            align: 'right',
            columns: 1,
            width: 60,
          });
        }

        // Totales Finales
        if (data.visible == 'SI') {
          i += 10;
          doc.font('Helvetica-Bold');
          doc.y = ymin + i;
          doc.x = 378;
          doc.text('Total General:', {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.y = ymin + i;
          doc.x = 420;
          doc.text(utils.formatNumber(totalSubtotal), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 475;
          doc.text(utils.formatNumber(totalImpuesto), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 524;
          doc.text(utils.formatNumber(totalMontoVenta), {
            align: 'right',
            columns: 1,
            width: 60,
          });
        }
        break;
      case 'CG':
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
            doc.fontSize(10);
            doc.font('Helvetica-Bold');
            doc.text(data.ventas[item]['agencias.nb_agencia'], 35, ymin + i);
            i += 18;
          }

          if (item == 0 || data.ventas[item].id != data.ventas[item - 1].id) {
            doc.fontSize(9);
            doc.font('Helvetica-Bold');
            doc.text(
              'Nro. Deposito: ' +
                (data.ventas[item].nro_deposito
                  ? data.ventas[item].nro_deposito
                  : ''),
              35,
              ymin + i
            );
            doc.text(
              'Fecha: ' +
                moment(data.ventas[item].fecha_deposito).format('DD/MM/YYYY'),
              170,
              ymin + i
            );
            doc.text(
              'Monto: ' + utils.formatNumber(data.ventas[item].monto_cobrado),
              265,
              ymin + i
            );
            doc.y = ymin + i;
            doc.x = 330;
            doc.text(data.ventas[item]['cuentas.bancos.nb_banco'], {
              align: 'center',
              columns: 1,
              width: 150,
            });
            doc.y = ymin + i;
            doc.x = 460;
            doc.text(data.ventas[item]['cuentas.nro_cuenta'], {
              align: 'center',
              columns: 1,
              width: 150,
            });
            i += 17;
          }

          doc.fontSize(8);
          doc.font('Helvetica');
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 25;
          doc.text(
            moment(data.ventas[item].fecha_emision).format('DD/MM/YYYY'),
            {
              align: 'center',
              columns: 1,
              width: 50,
            }
          );

          doc.y = ymin + i;
          doc.x = 74;
          doc.text(
            data.ventas[item]['detalles.movimientos.t_de_documento'] +
              '-' +
              data.ventas[item]['detalles.movimientos.nro_documento'],
            {
              align: 'center',
              columns: 1,
              width: 50,
            }
          );

          let nroFactOrig = '';
          if (data.ventas[item].serie_doc_principal)
            nroFactOrig += data.ventas[item].serie_doc_principal + '-';
          if (data.ventas[item].nro_ctrl_doc_ppal_new) {
            nroFactOrig += data.ventas[item].nro_ctrl_doc_ppal_new.padStart(
              9,
              '00-000000'
            );
          } else if (data.ventas[item].nro_ctrl_doc_ppal) {
            nroFactOrig += data.ventas[item].nro_ctrl_doc_ppal.padStart(
              4,
              '0000'
            );
          }

          doc.y = ymin + i;
          doc.x = 120;
          doc.text(nroFactOrig, {
            align: 'center',
            columns: 1,
            width: 50,
          });

          doc.y = ymin + i;
          doc.x = 177;
          doc.text(utils.truncate(data.ventas[item].cliente_orig_desc, 29), {
            align: 'left',
            columns: 1,
            width: 160,
          });

          doc.y = ymin + i;
          doc.x = 315;
          doc.text(
            data.ventas[item]['detalles.movimientos.agencias.ciudades.siglas'] +
              ' / ' +
              (data.ventas[item][
                'detalles.movimientos.agencias_dest.ciudades.siglas'
              ]
                ? data.ventas[item][
                    'detalles.movimientos.agencias_dest.ciudades.siglas'
                  ]
                : ''),
            {
              align: 'center',
              columns: 1,
              width: 50,
            }
          );
          let modalidad = 'Contado';
          if (data.ventas[item]['detalles.movimientos.modalidad_pago'] == 'CR')
            modalidad = 'Crédito';
          if (data.ventas[item]['detalles.movimientos.pagado_en'] == 'O')
            modalidad += '/Origen';
          else modalidad += '/Destino';
          doc.y = ymin + i;
          doc.x = 360;
          doc.text(modalidad, {
            align: 'center',
            columns: 1,
            width: 80,
          });

          let montoTotal =
            data.ventas[item]['detalles.movimientos.monto_total'];
          let montoCobrado = data.ventas[item]['detalles.monto_pagado'];
          let montoSaldo = data.ventas[item]['detalles.movimientos.saldo'];

          doc.y = ymin + i;
          doc.x = 430;
          doc.text(utils.formatNumber(montoTotal), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 488;
          doc.text(utils.formatNumber(montoCobrado), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 524;
          doc.text(utils.formatNumber(montoSaldo), {
            align: 'right',
            columns: 1,
            width: 60,
          });

          // Sub Totales por Agencia
          if (
            item > 0 &&
            data.ventas[item].cod_agencia != data.ventas[item - 1].cod_agencia
          ) {
            doc.font('Helvetica-Bold');
            doc.y = ymin + i - 50;
            doc.x = 300;
            doc.text('Sub-Totales por Agencia:', {
              align: 'left',
              columns: 1,
              width: 100,
            });
            doc.y = ymin + i - 50;
            doc.x = 430;
            doc.text(utils.formatNumber(subTotalMontoVenta), {
              align: 'right',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i - 50;
            doc.x = 488;
            doc.text(utils.formatNumber(subTotalCobrado), {
              align: 'right',
              columns: 1,
              width: 50,
            });

            doc.font('Helvetica');
            i += 3;
            subTotalMontoVenta = 0;
            subTotalCobrado = 0;
          }

          totalMontoVenta += utils.parseFloatN(montoTotal);
          totalCobrado += utils.parseFloatN(montoCobrado);

          subTotalMontoVenta += utils.parseFloatN(montoTotal);
          subTotalCobrado += utils.parseFloatN(montoCobrado);

          i += 15;
          if (i >= 520) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data);
          }
        }

        // Sub Totales por Agencia Finales
        i += 10;
        doc.font('Helvetica-Bold');
        doc.y = ymin + i;
        doc.x = 300;
        doc.text('Sub-Totales por Agencia:', {
          align: 'left',
          columns: 1,
          width: 100,
        });
        doc.y = ymin + i;
        doc.x = 430;
        doc.text(utils.formatNumber(subTotalMontoVenta), {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i;
        doc.x = 488;
        doc.text(utils.formatNumber(subTotalCobrado), {
          align: 'right',
          columns: 1,
          width: 50,
        });

        // Totales Finales
        i += 10;
        doc.font('Helvetica-Bold');
        doc.y = ymin + i;
        doc.x = 343;
        doc.text('Total General:', {
          align: 'left',
          columns: 1,
          width: 100,
        });
        doc.y = ymin + i;
        doc.x = 430;
        doc.text(utils.formatNumber(totalMontoVenta), {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i;
        doc.x = 488;
        doc.text(utils.formatNumber(totalCobrado), {
          align: 'right',
          columns: 1,
          width: 50,
        });
        break;
      case 'CD':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 205;
        for (var item = 0; item < data.ventas.length; item++) {
          if (
            item == 0 ||
            data.ventas[item].cod_agencia !=
              data.ventas[item - 1].cod_agencia ||
            data.ventas[item].cod_agencia_dest !=
              data.ventas[item - 1].cod_agencia_dest
          ) {
            if (item > 0) i += 10;
            doc.fontSize(9);
            doc.font('Helvetica-Bold');
            doc.text(
              'Cobro en: ' + data.ventas[item]['agencias_dest.nb_agencia'],
              35,
              ymin + i
            );
            doc.text(
              'Venta Realizada por: ' +
                data.ventas[item]['agencias.nb_agencia'],
              300,
              ymin + i
            );
            i += 17;
          }

          doc.fontSize(7);
          doc.font('Helvetica');
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 20;
          doc.text(
            moment(data.ventas[item].fecha_emision).format('DD/MM/YYYY'),
            {
              align: 'center',
              columns: 1,
              width: 40,
            }
          );

          doc.y = ymin + i;
          doc.x = 62;
          doc.text(
            data.ventas[item].t_de_documento +
              '-' +
              data.ventas[item].nro_documento,
            {
              align: 'center',
              columns: 1,
              width: 50,
            }
          );

          let nroDocPpal = '';
          if (data.ventas[item].tipo_doc_principal)
            nroDocPpal += data.ventas[item].tipo_doc_principal + '-';
          if (data.ventas[item].serie_doc_principal)
            nroDocPpal += data.ventas[item].serie_doc_principal + '- ';
          if (data.ventas[item].nro_ctrl_doc_ppal_new) {
            nroDocPpal += data.ventas[item].nro_ctrl_doc_ppal_new.padStart(
              9,
              '00-000000'
            );
          } else if (data.ventas[item].nro_ctrl_doc_ppal) {
            nroDocPpal += data.ventas[item].nro_ctrl_doc_ppal.padStart(
              4,
              '0000'
            );
          }

          doc.y = ymin + i;
          doc.x = 115;
          doc.text(nroDocPpal, {
            align: 'center',
            columns: 1,
            width: 50,
          });

          doc.y = ymin + i;
          doc.x = 170;
          doc.text(utils.truncate(data.ventas[item].cliente_dest_desc, 36), {
            align: 'left',
            columns: 1,
            width: 160,
          });

          doc.y = ymin + i;
          doc.x = 265;
          doc.text(
            tipo_factura.find(
              (tipo) => tipo.value == data.ventas[item].tipo_factura
            ).label,
            {
              align: 'center',
              columns: 1,
              width: 60,
            }
          );

          let modalidad = 'Contado';
          if (data.ventas[item].modalidad_pago == 'CR') modalidad = 'Crédito';
          doc.y = ymin + i;
          doc.x = 329;
          doc.text(modalidad, {
            align: 'left',
            columns: 1,
            width: 50,
          });

          let montoSubtotal = 0;
          let montoImpuesto = 0;
          let montoTotal = 0;
          let montoSaldo = 0;

          if (data.visible == 'SI') {
            if (data.ventas[item].estatus_administra != 'A') {
              montoSubtotal = data.ventas[item].monto_subtotal;
              montoImpuesto = data.ventas[item].monto_impuesto;
              montoTotal = data.ventas[item].monto_total;
              montoSaldo = data.ventas[item].saldo;
            }
            doc.y = ymin + i;
            doc.x = 355;
            doc.text(utils.formatNumber(montoSubtotal), {
              align: 'right',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i;
            doc.x = 400;
            doc.text(utils.formatNumber(montoImpuesto), {
              align: 'right',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i;
            doc.x = 445;
            doc.text(utils.formatNumber(montoTotal), {
              align: 'right',
              columns: 1,
              width: 60,
            });
            doc.y = ymin + i;
            doc.x = 485;
            doc.text(utils.formatNumber(montoSaldo), {
              align: 'right',
              columns: 1,
              width: 60,
            });
          }

          doc.y = ymin + i;
          doc.x = 545;
          doc.text(
            estatus_administrativo.find(
              (estatus) => estatus.value == data.ventas[item].estatus_administra
            ).label,
            {
              align: 'center',
              columns: 1,
              width: 60,
            }
          );

          totalSubtotal += utils.parseFloatN(montoSubtotal);
          totalImpuesto += utils.parseFloatN(montoImpuesto);
          totalMontoVenta += utils.parseFloatN(montoTotal);
          totalSaldo += utils.parseFloatN(montoSaldo);

          i += 15;
          if (i >= 520) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data);
          }
        }

        // Totales Finales
        if (data.visible == 'SI') {
          i += 10;
          doc.font('Helvetica-Bold');
          doc.y = ymin + i;
          doc.x = 308;
          doc.text('Total General:', {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.y = ymin + i;
          doc.x = 355;
          doc.text(utils.formatNumber(totalSubtotal), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 400;
          doc.text(utils.formatNumber(totalImpuesto), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 445;
          doc.text(utils.formatNumber(totalMontoVenta), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 485;
          doc.text(utils.formatNumber(totalSaldo), {
            align: 'right',
            columns: 1,
            width: 60,
          });
        }
        break;
      case 'CC':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 210;
        for (var item = 0; item < data.ventas.length; item++) { 
          doc.fontSize(8);
          doc.font('Helvetica');
          doc.fillColor('#444444');

          doc.y = ymin + i;
          doc.x = 35;
          doc.text(utils.truncate(data.ventas[item].cliente_orig_desc, 70), {
            align: 'left',
            columns: 1,
            width: 160,
          });

          let nroDocumento = data.ventas[item].t_de_documento + ' ';
          if (!data.ventas[item].nro_control) {
            nroDocumento +=
              data.ventas[item].serie_documento +
              ' - ' +
              data.ventas[item].nro_documento;
          } else if (!data.ventas[item].nro_control_new) {
            nroDocumento += data.ventas[item].nro_control.padStart(4, '0000');
          } else if (!data.ventas[item].serie_documento) {
            nroDocumento += data.ventas[item].nro_control_new.padStart(
              9,
              '00-000000'
            );
          } else {
            nroDocumento +=
              data.ventas[item].serie_documento +
              ' - ' +
              data.ventas[item].nro_control_new.padStart(9, '00-000000');
          }

          doc.y = ymin + i;
          doc.x = 190;
          doc.text(nroDocumento, {
            align: 'center',
            columns: 1,
            width: 60,
          });

          doc.y = ymin + i;
          doc.x = 270;
          doc.text(
            moment(data.ventas[item].fecha_emision).format('DD/MM/YYYY'),
            {
              align: 'center',
              columns: 1,
              width: 50,
            }
          );

          let montoSubtotal = 0;
          let montoImpuesto = 0;
          let montoTotal = 0;
          let montoSaldo = 0;

          montoSubtotal = data.ventas[item].monto_subtotal;
          montoImpuesto = data.ventas[item].monto_impuesto;
          montoTotal = data.ventas[item].monto_total;
          montoSaldo = data.ventas[item].saldo;

          doc.y = ymin + i;
          doc.x = 338;
          doc.text(utils.formatNumber(montoSubtotal), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 395;
          doc.text(utils.formatNumber(montoImpuesto), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 465;
          doc.text(utils.formatNumber(montoTotal), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 520;
          doc.text(utils.formatNumber(montoSaldo), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          
          totalSubtotal += utils.parseFloatN(montoSubtotal);
          totalImpuesto += utils.parseFloatN(montoImpuesto);
          totalMontoVenta += utils.parseFloatN(montoTotal);
          totalSaldo += utils.parseFloatN(montoSaldo);

          i += 23;
          if (i >= 520) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data);
          }
        }

        // Totales Finales
        if (data.visible == 'SI') {
          doc.font('Helvetica-Bold');
          doc.y = ymin + i;
          doc.x = 280;
          doc.text('Total General:', {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.y = ymin + i;
          doc.x = 338;
          doc.text(utils.formatNumber(totalSubtotal), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 395;
          doc.text(utils.formatNumber(totalImpuesto), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 465;
          doc.text(utils.formatNumber(totalMontoVenta), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 520;
          doc.text(utils.formatNumber(totalSaldo), {
            align: 'right',
            columns: 1,
            width: 60,
          });
        }
        break;
      case 'CCC':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 210;
        for (var item = 0; item < data.ventas.length; item++) { 
          doc.fontSize(9);
          doc.font('Helvetica');
          doc.fillColor('#444444');          

          let nroDocumento = data.ventas[item].t_de_documento + ' ';
          if (!data.ventas[item].nro_control) {
            nroDocumento +=
              data.ventas[item].serie_documento +
              ' - ' +
              data.ventas[item].nro_documento;
          } else if (!data.ventas[item].nro_control_new) {
            nroDocumento += data.ventas[item].nro_control.padStart(4, '0000');
          } else if (!data.ventas[item].serie_documento) {
            nroDocumento += data.ventas[item].nro_control_new.padStart(
              9,
              '00-000000'
            );
          } else {
            nroDocumento +=
              data.ventas[item].serie_documento +
              ' - ' +
              data.ventas[item].nro_control_new.padStart(9, '00-000000');
          }

          doc.y = ymin + i;
          doc.x = 75;
          doc.text(nroDocumento, {
            align: 'center',
            columns: 1,
            width: 60,
          });

          doc.y = ymin + i;
          doc.x = 176;
          doc.text(
            moment(data.ventas[item].fecha_emision).format('DD/MM/YYYY'),
            {
              align: 'center',
              columns: 1,
              width: 50,
            }
          );

          let montoSubtotal = 0;
          let montoImpuesto = 0;
          let montoTotal = 0;
          let montoSaldo = 0;

          montoSubtotal = data.ventas[item].monto_subtotal;
          montoImpuesto = data.ventas[item].monto_impuesto;
          montoTotal = data.ventas[item].monto_total;
          montoSaldo = data.ventas[item].saldo;

          doc.y = ymin + i;
          doc.x = 260;
          doc.text(utils.formatNumber(montoSubtotal), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 335;
          doc.text(utils.formatNumber(montoImpuesto), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 425;
          doc.text(utils.formatNumber(montoTotal), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 495;
          doc.text(utils.formatNumber(montoSaldo), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          
          totalSubtotal += utils.parseFloatN(montoSubtotal);
          totalImpuesto += utils.parseFloatN(montoImpuesto);
          totalMontoVenta += utils.parseFloatN(montoTotal);
          totalSaldo += utils.parseFloatN(montoSaldo);

          i += 18;
          if (i >= 520) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data);
          }
        }

        // Totales Finales
        if (data.visible == 'SI') {
          doc.font('Helvetica-Bold');
          doc.y = ymin + i;
          doc.x = 170;
          doc.text('Total General:', {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.y = ymin + i;
          doc.x = 260;
          doc.text(utils.formatNumber(totalSubtotal), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 335;
          doc.text(utils.formatNumber(totalImpuesto), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 425;
          doc.text(utils.formatNumber(totalMontoVenta), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 495;
          doc.text(utils.formatNumber(totalSaldo), {
            align: 'right',
            columns: 1,
            width: 60,
          });
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
      doc.x =
        tipo == 'GC' ||
        tipo == 'FA' ||
        tipo == 'FPO' ||
        tipo == 'NC' ||
        tipo == 'ND' ||
        tipo == 'DE' ||
        tipo == 'CG' ||
        tipo == 'CD' ||
        tipo == 'CC' ||
        tipo == 'CCC'
          ? 485
          : 646;
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
