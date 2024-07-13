const PDFDocument = require('pdfkit');
const ExcelDocument = require('exceljs');
const fs = require('fs');
const reportsPath = './services/pdfReports/pdf/';

const AsignacionGuiasService = require('./asignacionGuias.service');
const asignacionGuiasService = new AsignacionGuiasService();
const CartaClienteService = require('./cartaCliente.service');
const cartaClienteService = new CartaClienteService();
const FacturaPreimpresoService = require('./facturaPreimpreso.service');
const facturaPreimpresoService = new FacturaPreimpresoService();
const NotaPreimpresoService = require('./notaPreimpreso.service');
const notaPreimpresoService = new NotaPreimpresoService();
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
const PagosPendProvService = require('./pagosPendProv.service');
const pagosPendProvService = new PagosPendProvService();
const PagosProvService = require('./pagosProv.service');
const pagosProvService = new PagosProvService();
const RelacionRetencionesService = require('./relacionRetenciones.service');
const relacionRetencionesService = new RelacionRetencionesService();
const RetencionesIslrService = require('./retencionesIslr.service');
const retencionesIslrService = new RetencionesIslrService();
const RetencionesIvaService = require('./retencionesIva.service');
const retencionesIvaService = new RetencionesIvaService();
const RelacionFpoService = require('./relacionFpo.service');
const relacionFpoService = new RelacionFpoService();
const CobranzaService = require('./cobranza.service');
const cobranzaService = new CobranzaService();
const ComisionesService = require('./comisiones.service');
const comisionesService = new ComisionesService();
const ComprobanteIgtfService = require('./comprobanteIgtf.service');
const comprobanteIgtfService = new ComprobanteIgtfService();
const ReporteIgtfService = require('./reporteIgtf.service');
const reporteIgtfService = new ReporteIgtfService();
const GuiasEmpresaService = require('./guiasEmpresa.service');
const guiasEmpresaService = new GuiasEmpresaService();
const GuiasLoteService = require('./guiasLote.service');
const guiasLoteService = new GuiasLoteService();
const ReportePagoService = require('./reportePago.service');
const reportePagoService = new ReportePagoService();

class PdfReportsService {
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

  // REPORTE NOTAS DE DEBITO O CREDITO
  async notaPreimpreso(data) {
    let resPath = 'notaPreimpreso.pdf';
    let doc = new PDFDocument({
      margin: 20,
    });
    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    await notaPreimpresoService.mainReport(doc, data);
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
  async libroVentas(
    print,
    agencia,
    cliente,
    desde,
    hasta,
    detalle,
    correlativo
  ) {
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

  // PAGOS PENDIENTES PROVEEDORES
  async pagosPendProv(print, agencia, proveedor, desde, hasta) {
    if (!print) return { validDoc: true, resPath: 'reporteBase.pdf' };

    let resPath = 'pagosPendProv.pdf';
    let doc = new PDFDocument({
      margin: 20,
      bufferPages: true,
    });

    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    let validDoc = await pagosPendProvService.mainReport(
      doc,
      agencia,
      proveedor,
      desde,
      hasta
    );
    resPath = validDoc ? resPath : 'reporteBase.pdf';
    doc.end();
    return { validDoc: validDoc, resPath: resPath };
  }

  // PAGOS PROVEEDORES
  async pagosProv(print, agencia, proveedor, desde, hasta) {
    if (!print) return { validDoc: true, resPath: 'reporteBase.pdf' };

    let resPath = 'pagosProv.pdf';
    let doc = new PDFDocument({
      margin: 20,
      bufferPages: true,
    });

    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    let validDoc = await pagosProvService.mainReport(
      doc,
      agencia,
      proveedor,
      desde,
      hasta
    );
    resPath = validDoc ? resPath : 'reporteBase.pdf';
    doc.end();
    return { validDoc: validDoc, resPath: resPath };
  }

  // RELACION DE RETENCIONES
  async relacionRetenciones(print, agencia, proveedor, desde, hasta) {
    if (!print) return { validDoc: true, resPath: 'reporteBase.pdf' };

    let resPath = 'relacionRetenciones.pdf';
    let doc = new PDFDocument({
      margin: 20,
      bufferPages: true,
    });

    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    let validDoc = await relacionRetencionesService.mainReport(
      doc,
      agencia,
      proveedor,
      desde,
      hasta
    );
    resPath = validDoc ? resPath : 'reporteBase.pdf';
    doc.end();
    return { validDoc: validDoc, resPath: resPath };
  }

  // RETENCIONES ISLR
  async retencionesIslr(print, tipo, data) {
    if (!print) return { validDoc: true, resPath: 'reporteBase.pdf' };

    let resPath = 'retencionesIslr' + tipo + '.pdf';
    let doc = new PDFDocument({
      margin: 10,
      bufferPages: true,
      layout: 'landscape',
    });

    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    let validDoc = await retencionesIslrService.mainReport(doc, tipo, data);
    resPath = validDoc ? resPath : 'reporteBase.pdf';
    doc.end();
    return { validDoc: validDoc, resPath: resPath };
  }

  // RETENCIONES IVA
  async retencionesIva(print, tipo, data) {
    if (!print) return { validDoc: true, resPath: 'reporteBase.pdf' };

    let resPath = 'retencionesIva' + tipo + '.pdf';
    let doc = new PDFDocument({
      margin: 10,
      bufferPages: true,
      layout: 'landscape',
    });

    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    let validDoc = await retencionesIvaService.mainReport(doc, tipo, data);
    resPath = validDoc ? resPath : 'reporteBase.pdf';
    doc.end();
    return { validDoc: validDoc, resPath: resPath };
  }

  // RELACION FPO
  async relacionFpo(print, tipo, data) {
    if (!print) return { validDoc: true, resPath: 'reporteBase.pdf' };

    let resPath = 'relacionFpo' + tipo + '.pdf';
    let doc = new PDFDocument({
      margin: 20,
      bufferPages: true,
    });

    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    let validDoc = await relacionFpoService.mainReport(doc, tipo, data);
    resPath = validDoc ? resPath : 'reporteBase.pdf';
    doc.end();
    return { validDoc: validDoc, resPath: resPath };
  }

  // COBRANZA
  async cobranza(id) {
    let resPath = 'cobranza.pdf';
    let doc = new PDFDocument({
      margin: 20,
      bufferPages: true,
    });

    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    let validDoc = await cobranzaService.mainReport(doc, id);
    resPath = validDoc ? resPath : 'reporteBase.pdf';
    doc.end();
    return { validDoc: validDoc, resPath: resPath };
  }

  // COMISIONES
  async comisiones(data, desde, hasta, dolar, group) {
    let resPath = 'comisiones.pdf';
    let doc = new PDFDocument({
      margin: 10,
      bufferPages: true,
      layout: 'landscape',
    });

    if (group == 'true') {
      doc = new PDFDocument({
        margin: 20,
        bufferPages: true,
      });
    }

    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    let validDoc = await comisionesService.mainReport(
      doc,
      data,
      desde,
      hasta,
      dolar,
      group
    );
    resPath = validDoc ? resPath : 'reporteBase.pdf';
    doc.end();
    return { validDoc: validDoc, resPath: resPath };
  }

  // COMPROBANTE IGTF
  async comprobanteIgtf(id) {
    let resPath = 'comprobanteIgtf.pdf';
    let doc = new PDFDocument({
      margin: 10,
      bufferPages: true,
      layout: 'landscape',
    });

    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    let validDoc = await comprobanteIgtfService.mainReport(doc, id);
    resPath = validDoc ? resPath : 'reporteBase.pdf';
    doc.end();
    return { validDoc: validDoc, resPath: resPath };
  }

  // REPORTE IGTF
  async reporteIgtf(print, data) {
    if (!print) return { validDoc: true, resPath: 'reporteBase.pdf' };
    let resPath = 'reporteIgtf.pdf';
    let doc = new PDFDocument({
      margin: 10,
      bufferPages: true,
      layout: 'landscape',
    });

    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    let validDoc = await reporteIgtfService.mainReport(doc, data);
    resPath = validDoc ? resPath : 'reporteBase.pdf';
    doc.end();
    return { validDoc: validDoc, resPath: resPath };
  }

  // GUIAS EMPRESA
  async guiasEmpresa(client, desde, hasta, estatus, ciudad, guia) {
    let resPath = 'Consulta_RCS.pdf';
    let doc = new PDFDocument({
      margin: 10,
      bufferPages: true,
      layout: 'landscape',
    });

    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    let validDoc = await guiasEmpresaService.mainReport(
      doc,
      client,
      desde,
      hasta,
      estatus,
      ciudad,
      guia
    );
    resPath = validDoc ? resPath : 'reporteBase.pdf';
    doc.end();
    return { validDoc: validDoc, resPath: resPath };
  }

  // GUIAS LOTE
  async guiasLote(tipo, data) {
    let resPath = 'guiasLote.pdf';
    let doc = new PDFDocument({
      margin: 20,
    });
    if(tipo == 1) {
      doc = new PDFDocument({
        size: [612, 396],
        margin: 20,
      });
    }
    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    await guiasLoteService.mainReport(doc, tipo, data);
    doc.end();
    return { validDoc: true, resPath: resPath };
  }

  // REPORTE COMPROBANTE PAGO
  async reportePago(id, beneficiario) {
    let resPath = 'reportePago.pdf';
    let doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(reportsPath + resPath));
    let validDoc = await reportePagoService.mainReport(doc, id, beneficiario);
    doc.end();
    return { validDoc: validDoc, resPath: resPath };
  }
}

module.exports = PdfReportsService;
