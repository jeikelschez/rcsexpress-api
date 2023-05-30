const PDFDocument = require('pdfkit');
const getStream = require('get-stream');
const base64 = require('base64-stream');
const fs = require('fs');

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
const ReporteCostosService = require('./reporteCostos.service');
const reporteCostosService = new ReporteCostosService();
const ReporteVentasService = require('./reporteVentas.service');
const reporteVentasService = new ReporteVentasService();

class ReportsService {
  constructor() {}

  // REPORTE EMITIR CARTA CLIENTE
  async cartaCliente(data, cliente, contacto, cargo, ciudad, usuario) {
    let doc = new PDFDocument({
      margin: 50,
      bufferPages: true,
    });
    await cartaClienteService.mainReport(
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
    await facturaPreimpresoService.mainReport(doc, data);
    doc.end();
    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }

  // REPORTE ANEXO FACTURACION
  async anexoFactura(data) {
    let doc = new PDFDocument({ margin: 50 });
    await anexoFacturaService.mainReport(doc, data);
    doc.end();
    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }

  // REPORTE RELACION DESPACHO
  async relacionDespacho(data, detalle) {
    let doc = new PDFDocument({
      margin: 10,
      bufferPages: true,
      layout: 'landscape',
    });
    await relacionDespachoService.mainReport(doc, data, detalle);
    doc.end();
    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }

  // REPORTE COSTOS TRANSPORTE
  async costosTransporte(id, tipo, agencia, desde, hasta, neta, dolar) {
    let doc = new PDFDocument({ margin: 50, bufferPages: true });
    if (tipo == 'DI' || tipo == 'CO') {
      doc = new PDFDocument({
        margin: 10,
        bufferPages: true,
        layout: 'landscape',
      });
    }
    await costosTransporteService.mainReport(
      doc,
      id,
      tipo,
      agencia,
      desde,
      hasta,
      neta,
      dolar
    );
    doc.end();
    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }

  // REPORTE COSTOS
  async reporteCostos(tipo, data) {
    let doc = new PDFDocument({
      margin: 20,
      bufferPages: true,
    });
    doc.pipe(fs.createWriteStream('./services/reports/pdf/documento.pdf'))
    if (tipo == 'CTA') {
      doc = new PDFDocument({
        margin: 10,
        bufferPages: true,
        layout: 'landscape',
      });
    }
    await reporteCostosService.mainReport(doc, tipo, data);
    doc.end();
  }

  // REPORTE VENTAS
  async reporteVentas(tipo, data) {
    let doc = new PDFDocument({
      margin: 20,
      bufferPages: true,
    });
    doc.pipe(fs.createWriteStream('./services/reports/pdf/documento.pdf'))
    if (tipo == 'CTA') {
      doc = new PDFDocument({
        margin: 10,
        bufferPages: true,
        layout: 'landscape',
      });
    }
    await reporteVentasService.mainReport(doc, tipo, data);
    doc.end();
  }
}

module.exports = ReportsService;
