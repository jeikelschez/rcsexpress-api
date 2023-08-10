const PDFDocument = require('pdfkit');
const fs = require('fs');
const reportsPath = './services/reports/pdf/';

const AsignacionGuiasService = require('./asignacionGuias.service');
const asignacionGuiasService = new AsignacionGuiasService();
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
const LibroComprasService = require('./libroCompras.service');
const libroComprasService = new LibroComprasService();
const LibroVentasService = require('./libroVentas.service');
const libroVentasService = new LibroVentasService();

class ReportsService {
  constructor() {}

  // REPORTE DE ASIGNACION DE GUIAS
  async asignacionGuias(id) {
    let resPath = 'guiasDisponibles.pdf';
    let doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    await asignacionGuiasService.mainReport(doc, id);
    doc.end();
    return { validDoc: true, resPath: resPath };
  }

  // REPORTE EMITIR CARTA CLIENTE
  async cartaCliente(data, cliente, contacto, cargo, ciudad, usuario) {
    let resPath = 'cartaCliente.pdf';
    let doc = new PDFDocument({
      margin: 50,
      bufferPages: true,
    });
    doc.pipe(fs.createWriteStream(reportsPath + resPath));
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
    return { validDoc: true, resPath: resPath };
  }

  // REPORTE FACTURACION
  async facturaPreimpreso(data) {
    let resPath = 'facturaPreimpreso.pdf';
    let doc = new PDFDocument({
      size: [500, 841],
      margin: 20,
    });
    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    await facturaPreimpresoService.mainReport(doc, data);
    doc.end();
    return { validDoc: true, resPath: resPath };
  }

  // REPORTE ANEXO FACTURACION
  async anexoFactura(data) {
    let resPath = 'anexoFactura.pdf';
    let doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    let validDoc = await anexoFacturaService.mainReport(doc, data);
    doc.end();
    return { validDoc: validDoc, resPath: resPath };
  }

  // REPORTE RELACION DESPACHO
  async relacionDespacho(data, detalle) {
    let resPath = 'relacionDespacho.pdf';
    let doc = new PDFDocument({
      margin: 10,
      bufferPages: true,
      layout: 'landscape',
    });
    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    let validDoc = await relacionDespachoService.mainReport(doc, data, detalle);
    doc.end();
    return { validDoc: validDoc, resPath: resPath };
  }

  // REPORTE COSTOS TRANSPORTE
  async costosTransporte(id, tipo, agencia, desde, hasta, neta, dolar) {
    let resPath = 'costosTransporte' + tipo + '.pdf';
    let doc = new PDFDocument({ margin: 50, bufferPages: true });
    if (tipo == 'DI' || tipo == 'CO') {
      doc = new PDFDocument({
        margin: 10,
        bufferPages: true,
        layout: 'landscape',
      });
    }

    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    let validDoc = await costosTransporteService.mainReport(
      doc,
      id,
      tipo,
      agencia,
      desde,
      hasta,
      neta,
      dolar
    );
    resPath = validDoc ? resPath : 'reporteBase.pdf';
    doc.end();
    return { validDoc: validDoc, resPath: resPath };
  }

  // REPORTE COSTOS
  async reporteCostos(tipo, data) {
    if (!tipo || tipo == 'undefined')
      return { validDoc: true, resPath: 'reporteBase.pdf' };

    let resPath = 'reporteCostos' + tipo + '.pdf';
    let doc = new PDFDocument({
      margin: 20,
      bufferPages: true,
    });
    if (tipo == 'CTA' || tipo == 'RVV') {
      doc = new PDFDocument({
        margin: 10,
        bufferPages: true,
        layout: 'landscape',
      });
    }

    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    let validDoc = await reporteCostosService.mainReport(doc, tipo, data);
    resPath = validDoc ? resPath : 'reporteBase.pdf';
    doc.end();
    return { validDoc: validDoc, resPath: resPath };
  }

  // REPORTE VENTAS
  async reporteVentas(tipo, data) {
    if (!tipo || tipo == 'undefined')
      return { validDoc: true, resPath: 'reporteBase.pdf' };

    let resPath = 'reporteVentas' + tipo + '.pdf';
    let doc = new PDFDocument({
      margin: 10,
      bufferPages: true,
      layout: 'landscape',
    });
    if (
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
    ) {
      doc = new PDFDocument({
        margin: 20,
        bufferPages: true,
      });
    }

    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    let validDoc = await reporteVentasService.mainReport(doc, tipo, data);
    resPath = validDoc ? resPath : 'reporteBase.pdf';
    doc.end();
    return { validDoc: validDoc, resPath: resPath };
  }

  // LIBRO COMPRAS
  async libroCompras(print, agencia, proveedor, desde, hasta, detalle) {
    if (!print) return { validDoc: true, resPath: 'reporteBase2.pdf' };

    let resPath = 'libroCompras.pdf';
    let doc = new PDFDocument({
      margin: 10,
      bufferPages: true,
      layout: 'landscape',
      size: 'LEGAL',
    });

    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    let validDoc = await libroComprasService.mainReport(
      doc,
      agencia,
      proveedor,
      desde,
      hasta,
      detalle
    );
    resPath = validDoc ? resPath : 'reporteBase2.pdf';
    doc.end();
    return { validDoc: validDoc, resPath: resPath };
  }

  // LIBRO VENTAS
  async libroVentas(print, agencia, cliente, desde, hasta, detalle, correlativo) {
    if (!print) return { validDoc: true, resPath: 'reporteBase2.pdf' };

    let resPath = 'libroVentas.pdf';
    let doc = new PDFDocument({
      margin: 10,
      bufferPages: true,
      layout: 'landscape',
      size: 'LEGAL',
    });

    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    let validDoc = await libroVentasService.mainReport(
      doc,
      agencia,
      cliente,
      desde,
      hasta,
      detalle,
      correlativo
    );
    resPath = validDoc ? resPath : 'reporteBase2.pdf';
    doc.end();
    return { validDoc: validDoc, resPath: resPath };
  }
}

module.exports = ReportsService;
