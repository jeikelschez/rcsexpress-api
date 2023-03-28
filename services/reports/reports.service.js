const { models, Sequelize } = require('./../../libs/sequelize');
const moment = require('moment');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

const PDFDocument = require('pdfkit');
const getStream = require('get-stream');
const base64 = require('base64-stream');

const CartaClienteService = require('./cartaCliente.service');
const cartaClienteService = new CartaClienteService();
const FacturaPreimpresoService = require('./facturaPreimpreso.service');
const facturaPreimpresoService = new FacturaPreimpresoService();
const AnexoFacturaService = require('./anexoFactura.service');
const anexoFacturaService = new AnexoFacturaService();
const RelacionDespachoService = require('./relacionDespacho.service');
const relacionDespachoService = new RelacionDespachoService();
const CostosTransporteService = require('./costosTransporte.service');
const costosTransporteService = new CostosTransporteService();

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
  ' WHERE `movimientos`.cod_cliente_org = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `movimientos`.cod_agencia = clientes_particulares.cod_agencia' +
  ' AND `movimientos`.cod_cliente_org = clientes_particulares.cod_cliente' +
  ' AND `movimientos`.ci_rif_cte_conta_org = clientes_particulares.rif_ci' +
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
const clienteDestDesc2 =
  '(CASE WHEN (ci_rif_cte_conta_dest IS NULL || ci_rif_cte_conta_dest = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `movimientos`.cod_cliente_dest = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `movimientos`.cod_agencia_dest = clientes_particulares.cod_agencia' +
  ' AND `movimientos`.cod_cliente_dest = clientes_particulares.cod_cliente' +
  ' AND `movimientos`.ci_rif_cte_conta_dest = clientes_particulares.rif_ci' +
  ' AND clientes_particulares.estatus = "A" LIMIT 1)' +
  ' END)';
const montoDolarDesc =
  'CASE WHEN ((SELECT valor FROM historico_dolar' +
  ' WHERE historico_dolar.fecha = movimientos.fecha_emision) = 0)' +
  ' THEN 0 ELSE ROUND(movimientos.monto_subtotal /' +
  ' (SELECT valor FROM historico_dolar' +
  ' WHERE historico_dolar.fecha = movimientos.fecha_emision), 2) END';
const totalDolarDesc =
  'SUM(CASE WHEN ((SELECT valor FROM historico_dolar' +
  ' WHERE historico_dolar.fecha = movimientos.fecha_emision) = 0)' +
  ' THEN 0 ELSE ROUND(movimientos.monto_subtotal /' +
  ' (SELECT valor FROM historico_dolar' +
  ' WHERE historico_dolar.fecha = movimientos.fecha_emision), 2) END)';
const totalDolarDesc2 =
  'SUM(CASE WHEN ((SELECT valor FROM historico_dolar' +
  ' WHERE historico_dolar.fecha = `detallesg->movimientos`.fecha_emision) = 0)' +
  ' THEN 0 ELSE ROUND(`detallesg->movimientos`.monto_subtotal /' +
  ' (SELECT valor FROM historico_dolar' +
  ' WHERE historico_dolar.fecha = `detallesg->movimientos`.fecha_emision), 2) END)';

class ReportsService {
  constructor() {}

  // REPORTE EMITIR CARTA CLIENTE
  async cartaCliente(data, cliente, contacto, cargo, ciudad, usuario) {
    let doc = new PDFDocument({ margin: 50, bufferPages: true });
    await cartaClienteService.generateHeader(doc);
    await cartaClienteService.generateCustomerInformation(
      doc,
      data,
      cliente,
      contacto,
      cargo,
      ciudad,
      usuario
    );
    doc.end();
    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }

  // REPORTE FACTURACION
  async facturaPreimpreso(data) {
    let doc = new PDFDocument({
      size: [500, 841],
      margin: 20,
    });
    await facturaPreimpresoService.generateData(doc, JSON.parse(data));
    doc.end();
    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }

  // REPORTE ANEXO FACTURACION
  async anexoFactura(data) {
    let doc = new PDFDocument({ margin: 50 });
    data = JSON.parse(data);
    let detalle = await models.Mmovimientos.findAll({
      where: {
        tipo_doc_principal: 'FA',
        nro_doc_principal: data.nro_documento,
        nro_ctrl_doc_ppal: data.nro_control,
        cod_ag_doc_ppal: data.cod_agencia,
      },
      include: [
        {
          model: models.Agencias,
          as: 'agencias',
          include: {
            model: models.Ciudades,
            as: 'ciudades',
          },
        },
        {
          model: models.Agencias,
          as: 'agencias_dest',
          include: {
            model: models.Ciudades,
            as: 'ciudades',
          },
        },
      ],
      raw: true,
    });
    await anexoFacturaService.generateHeader(doc, data, detalle);
    await anexoFacturaService.generateCustomerInformation(doc, data, detalle);
    doc.end();
    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }

  // REPORTE RELACION DESPACHO
  async relacionDespacho(data, detalle) {
    data = JSON.parse(data);
    let doc = new PDFDocument({
      margin: 10,
      bufferPages: true,
      layout: 'landscape',
    });
    let dataDetalle = await models.Mmovimientos.findAll({
      where: {
        nro_documento: {
          [Sequelize.Op.in]: detalle.split(','),
        },
      },
      include: [
        {
          model: models.Agencias,
          as: 'agencias',
          include: {
            model: models.Ciudades,
            as: 'ciudades',
          },
        },
        {
          model: models.Agencias,
          as: 'agencias_dest',
          include: {
            model: models.Ciudades,
            as: 'ciudades',
          },
        },
        {
          model: models.Zonas,
          as: 'zonas_dest',
        },
      ],
      attributes: {
        include: [
          [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
          [Sequelize.literal(clienteDestDesc), 'cliente_dest_desc'],
        ],
      },
      order: JSON.parse(data.sortBy),
      raw: true,
    });
    await relacionDespachoService.generateHeader(doc, data);
    await relacionDespachoService.generateCustomerInformation(
      doc,
      data,
      dataDetalle
    );
    doc.end();
    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }

  // REPORTE COSTOS TRANSPORTE DETALLE
  async costosTransporteDetalle(id, tipo, agencia, neta, dolar) {
    let doc;
    let order = [];
    let group = '';
    let costos = await models.Costos.findByPk(id, {
      include: [
        {
          model: models.Agentes,
          as: 'agentes',
        },
        {
          model: models.Proveedores,
          as: 'proveedores',
        },
        {
          model: models.Ayudantes,
          as: 'ayudantes',
        },
        {
          model: models.Unidades,
          as: 'unidades',
        },
      ],
      raw: true,
    });

    let detalles = await models.Dcostos.findAll({
      where: {
        cod_costo: costos.id,
      },
      raw: true,
    });

    let attributes = [
      'id',
      'nro_documento',
      'fecha_emision',
      'monto_subtotal',
      'nro_piezas',
      'peso_kgs',
      'carga_neta',
      'cod_cliente_org',
      [Sequelize.literal(clienteOrigDesc2), 'cliente_orig_desc'],
      [Sequelize.literal(clienteDestDesc2), 'cliente_dest_desc'],
    ];

    if (tipo == 'DE') {
      order = [['movimientos', 'nro_documento', 'ASC']];
      attributes.push([Sequelize.literal(montoDolarDesc), 'monto_dolar']);
    } else {
      group = 'movimientos.cod_cliente_dest';
      order = [['movimientos', 'cod_cliente_dest', 'ASC']];
      attributes.push([
        Sequelize.fn('count', Sequelize.col('nro_documento')),
        'total_guias',
      ]);
      attributes.push([
        Sequelize.fn('sum', Sequelize.col('nro_piezas')),
        'total_pzas',
      ]);
      attributes.push([
        Sequelize.fn('sum', Sequelize.col('peso_kgs')),
        'total_kgs',
      ]);
      attributes.push([
        Sequelize.fn('sum', Sequelize.col('carga_neta')),
        'total_neta',
      ]);
      attributes.push([
        Sequelize.fn('sum', Sequelize.col('monto_subtotal')),
        'total_monto',
      ]);
      attributes.push([Sequelize.literal(totalDolarDesc), 'total_dolar']);
    }

    let detallesg = await models.Dcostosg.findAll({
      where: {
        cod_costo: costos.id,
      },
      include: [
        {
          model: models.Mmovimientos,
          as: 'movimientos',
          attributes: attributes,
          include: {
            model: models.Agencias,
            as: 'agencias_dest',
            include: {
              model: models.Ciudades,
              as: 'ciudades',
            },
          },
        },
      ],
      order: order,
      group: group,
      raw: true,
    });

    let totalGuias = 0;
    let totalCostos = 0;
    let porcCosto = 0;
    let porcUtilidad = 0;
    for (var i = 0; i < detalles.length; i++)
      totalCostos += utils.parseFloatN(detalles[i].monto_costo);
    for (var i = 0; i < detallesg.length; i++) {
      if (tipo == 'DE') {
        totalGuias += utils.parseFloatN(
          detallesg[i]['movimientos.monto_subtotal']
        );
      } else {
        totalGuias += utils.parseFloatN(
          detallesg[i]['movimientos.total_monto']
        );
      }
    }

    if (totalGuias > 0) {
      porcCosto = (totalCostos / totalGuias) * 100;
      porcUtilidad = ((totalGuias - totalCostos) / totalGuias) * 100;
    }

    let data = [];
    data.costos = costos;
    data.tipo = tipo;
    data.agencia = agencia;
    data.neta = neta;
    data.dolar = dolar;
    data.totalCostos = totalCostos.toFixed(2);
    data.totalGuias = totalGuias.toFixed(2);
    data.utilidad = (totalGuias - totalCostos).toFixed(2);
    data.porcCosto = porcCosto.toFixed(2);
    data.porcUtilidad = porcUtilidad.toFixed(2);

    doc = new PDFDocument({ margin: 50, bufferPages: true });

    await costosTransporteService.generateHeader(doc, data);
    await costosTransporteService.generateCustomerInformation(
      doc,
      data,
      detallesg
    );
    doc.end();
    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }

  // REPORTE COSTOS TRANSPORTE GENERAL
  async costosTransporteGeneral(id, tipo, agencia, desde, hasta, neta, dolar) {
    let doc;

    let costos = await models.Costos.findAll({
      where: {
        fecha_envio: {
          [Sequelize.Op.between]: [
            moment(desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            moment(hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
          ],
        },
      },
      include: [
        {
          model: models.Dcostosg,
          as: 'detallesg',
          required: true,
          include: [
            {
              model: models.Mmovimientos,
              as: 'movimientos',
              attributes: [
                [
                  Sequelize.fn('count', Sequelize.col('nro_documento')),
                  'total_guias',
                ],
                [
                  Sequelize.fn('sum', Sequelize.col('nro_piezas')),
                  'total_pzas',
                ],
                [Sequelize.fn('sum', Sequelize.col('peso_kgs')), 'total_kgs'],
                [
                  Sequelize.fn('sum', Sequelize.col('carga_neta')),
                  'total_neta',
                ],
                [
                  Sequelize.fn('sum', Sequelize.col('monto_subtotal')),
                  'total_monto',
                ],
                [Sequelize.literal(totalDolarDesc2), 'total_dolar'],
              ],
              include: {
                model: models.Agencias,
                as: 'agencias_dest',
                include: {
                  model: models.Ciudades,
                  as: 'ciudades',
                },
              },
            },
          ],
        },
      ],
      group: 'detallesg.movimientos.cod_agencia_dest',
      order: [['detallesg', 'movimientos', 'cod_agencia_dest', 'ASC']],
      raw: true,
    });

    let detalle = await models.Costos.findAll({
      where: {
        fecha_envio: {
          [Sequelize.Op.between]: [
            moment(desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            moment(hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
          ],
        },
      },
      include: [
        {
          model: models.Dcostos,
          as: 'detalles',
        },
      ],
      raw: true,
    });

    let totalGuias = 0;
    let totalCostos = 0;
    let porcCosto = 0;
    let porcUtilidad = 0;
    for (var i = 0; i < detalle.length; i++) {
      totalCostos += utils.parseFloatN(detalle[i]['detalles.monto_costo']);
    }

    for (var i = 0; i < costos.length; i++) {
      totalGuias += utils.parseFloatN(
        costos[i]['detallesg.movimientos.total_monto']
      );
    }

    if (totalGuias > 0) {
      porcCosto = (totalCostos / totalGuias) * 100;
      porcUtilidad = ((totalGuias - totalCostos) / totalGuias) * 100;
    }

    let data = [];
    data.costos = costos;
    data.tipo = tipo;
    data.agencia = agencia;
    data.neta = neta;
    data.dolar = dolar;
    data.totalCostos = totalCostos.toFixed(2);
    data.totalGuias = totalGuias.toFixed(2);
    data.utilidad = (totalGuias - totalCostos).toFixed(2);
    data.porcCosto = porcCosto.toFixed(2);
    data.porcUtilidad = porcUtilidad.toFixed(2);

    doc = new PDFDocument({ margin: 50, bufferPages: true });
    await costosTransporteService.generateHeader(doc, data);
    await costosTransporteService.generateCustomerInformation(doc, data);
    doc.end();
    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }

  // REPORTE COSTOS TRANSPORTE GENERAL
  async costosTransporteDiario(id, tipo, agencia, desde, neta, dolar) {
    let doc;

    let costos = await models.Costos.findAll({
      where: {
        fecha_envio: moment(desde, 'DD/MM/YYYY').format('YYYY-MM-DD')
      },
      include: [
        {
          model: models.Agentes,
          as: 'agentes',
        },
        {
          model: models.Proveedores,
          as: 'proveedores',
        },
        {
          model: models.Ayudantes,
          as: 'ayudantes',
        },
        {
          model: models.Unidades,
          as: 'unidades',
        },
      ],
      raw: true,
    });

    console.log(costos)



    /*let detalle = await models.Costos.findAll({
      where: {
        fecha_envio: {
          [Sequelize.Op.between]: [
            moment(desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            moment(hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
          ],
        },
      },
      include: [
        {
          model: models.Dcostos,
          as: 'detalles',
        },
      ],
      raw: true,
    });*/

    let totalGuias = 0;
    let totalCostos = 0;
    let porcCosto = 0;
    let porcUtilidad = 0;
    /*for (var i = 0; i < detalle.length; i++) {
      totalCostos += utils.parseFloatN(detalle[i]['detalles.monto_costo']);
    }*/

    for (var i = 0; i < costos.length; i++) {
      totalGuias += utils.parseFloatN(
        costos[i]['detallesg.movimientos.total_monto']
      );
    }

    if (totalGuias > 0) {
      porcCosto = (totalCostos / totalGuias) * 100;
      porcUtilidad = ((totalGuias - totalCostos) / totalGuias) * 100;
    }

    let data = [];
    data.costos = costos;
    data.tipo = tipo;
    data.desde = desde;
    data.agencia = agencia;
    data.neta = neta;
    data.dolar = dolar;
    data.totalCostos = totalCostos.toFixed(2);
    data.totalGuias = totalGuias.toFixed(2);
    data.utilidad = (totalGuias - totalCostos).toFixed(2);
    data.porcCosto = porcCosto.toFixed(2);
    data.porcUtilidad = porcUtilidad.toFixed(2);

    doc = new PDFDocument({
        margin: 10,
        bufferPages: true,
        layout: 'landscape',
      });
    await costosTransporteService.generateHeader(doc, data);
    await costosTransporteService.generateCustomerInformation(doc, data);
    doc.end();
    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }
}

module.exports = ReportsService;
