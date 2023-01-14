const PDFDocument = require('pdfkit');
const getStream = require('get-stream');
const base64 = require('base64-stream');

const CartaClienteService = require('./cartaCliente.service');
const cartaClienteService = new CartaClienteService();
const FacturaPreimpresoService = require('./facturaPreimpreso.service');
const facturaPreimpresoService = new FacturaPreimpresoService();
const AnexoFacturaService = require('./anexoFactura.service');
const anexoFacturaService = new AnexoFacturaService();

class ReportsService {
  constructor() {}

  // REPORTE EMITIR CARTA CLIENTE
  async cartaCliente(data, cliente, contacto, cargo, ciudad) {
    let doc = new PDFDocument({ margin: 50, bufferPages: true });
    await cartaClienteService.generateHeader(
      doc,
      cliente,
      contacto,
      cargo,
      ciudad
    );
    await cartaClienteService.generateCustomerInformation(
      doc,
      data,
      cliente,
      contacto,
      cargo,
      ciudad
    );
    doc.end();
    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }

  // REPORTE FACTURACION
  async facturaPreimpreso(data) {
    data = JSON.parse(data)    
    let doc = new PDFDocument({
      size: [500, 841],
      layout: 'landscape',
      margin: 20,
    });
    await facturaPreimpresoService.generateData(doc, data);
    doc.end();
    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }

  // REPORTE ANEXO FACTURACION
  async anexoFactura() {
    let doc = new PDFDocument({ margin: 50 });
    await anexoFacturaService.generateHeader(doc);
    await anexoFacturaService.generateCustomerInformation(doc);
    doc.end();
    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }  
}

module.exports = ReportsService;
