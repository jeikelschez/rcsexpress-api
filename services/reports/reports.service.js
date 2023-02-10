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
  async relacionDespacho(data) {
    let doc = new PDFDocument({ margin: 50 });
    let detalle = await models.Mmovimientos.findAll({
      where: {
        nro_documento: {
          [Sequelize.Op.in]: data.split(','),
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
      raw: true,
    });
    await relacionDespachoService.generateHeader(doc, data, detalle);
    await relacionDespachoService.generateCustomerInformation(
      doc,
      data,
      detalle
    );
    doc.end();
    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }
}

module.exports = ReportsService;
