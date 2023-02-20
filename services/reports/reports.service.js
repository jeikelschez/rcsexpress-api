const { models, Sequelize } = require('./../../libs/sequelize');

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
        cod_ag_doc_ppal: data.cod_agencia
      },
      include: [
        {
          model: models.Agencias,
          as: 'agencias',
          include: {
            model: models.Ciudades,
            as: 'ciudades'
          },
        },
        {
          model: models.Agencias,
          as: 'agencias_dest',
          include: {
            model: models.Ciudades,
            as: 'ciudades'
          }        
        }
      ],
      raw: true,
    });
    await anexoFacturaService.generateHeader(doc, data, detalle);
    await anexoFacturaService.generateCustomerInformation(
      doc,
      data,
      detalle
    );
    doc.end();
    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }

  // REPORTE RELACION DESPACHO
  async relacionDespacho(data, detalle) {
    data = JSON.parse(data);
    let doc = new PDFDocument({ margin: 50, bufferPages: true, layout: 'landscape'});
    let dataDetalle = await models.Mmovimientos.findAll({
      where: {
        nro_documento: {
          [Sequelize.Op.in]: detalle.split(','),
        }
      },
      include: [
        {
          model: models.Agencias,
          as: 'agencias',
          include: {
            model: models.Ciudades,
            as: 'ciudades'
          },
        },
        {
          model: models.Agencias,
          as: 'agencias_dest',
          include: {
            model: models.Ciudades,
            as: 'ciudades'
          }        
        }
      ],
      attributes: {
        include: [
          [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
          [Sequelize.literal(clienteDestDesc), 'cliente_dest_desc'],
        ],
      },
      order: [
        ['nro_documento', 'ASC']
      ],
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
}

module.exports = ReportsService;
