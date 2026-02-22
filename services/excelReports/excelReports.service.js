const ExcelDocument = require('exceljs');
const reportsPath = './services/excelReports/excel/';

const ReporteVentasService = require('./reporteVentas.service');
const reporteVentasService = new ReporteVentasService();
const ComisionesService = require('./comisiones.service');
const comisionesService = new ComisionesService();
const GuiasEmpresaService = require('./guiasEmpresa.service');
const guiasEmpresaService = new GuiasEmpresaService();
const LibroComprasService = require('./libroCompras.service');
const libroComprasService = new LibroComprasService();
const LibroVentasService = require('./libroVentas.service');
const libroVentasService = new LibroVentasService();
const RelacionFpoService = require('./relacionFpo.service');
const relacionFpoService = new RelacionFpoService();
const CostosTransporteService = require('./costosTransporte.service');
const costosTransporteService = new CostosTransporteService();
const RelacionDespachoService = require('./relacionDespacho.service');
const relacionDespachoService = new RelacionDespachoService();
const RetencionesIslrService = require('./retencionesIslr.service');
const retencionesIslrService = new RetencionesIslrService();
const RetencionesIvaService = require('./retencionesIva.service');
const retencionesIvaService = new RetencionesIvaService();

class ExcelReportsService {
  constructor() {}

  // REPORTE VENTAS
  async reporteVentas(tipo, data) {
    if (!tipo || tipo == 'undefined') return { validDoc: false, resPath: '' };

    let resPath = 'reporteVentas' + tipo + '.xlsx';
    const workbook = new ExcelDocument.Workbook();
    const worksheet = workbook.addWorksheet('reporteVentas');

    let validDoc = await reporteVentasService.mainReport(worksheet, tipo, data);
    workbook.xlsx.writeFile(reportsPath + resPath);

    return { validDoc: validDoc, resPath: resPath };
  }

  // COMISIONES
  async comisiones(data, desde, hasta, dolar) {
    let resPath = 'comisiones.xlsx';
    const workbook = new ExcelDocument.Workbook();
    const worksheet = workbook.addWorksheet('comisiones');

    let validDoc = await comisionesService.mainReport(
      worksheet,
      data,
      desde,
      hasta,
      dolar
    );
    workbook.xlsx.writeFile(reportsPath + resPath);

    return { validDoc: validDoc, resPath: resPath };
  }

  // COMISIONES
  async guiasEmpresa(client, desde, hasta, estatus, ciudad, guia) {
    let resPath = 'Consulta_RCS.xlsx';
    const workbook = new ExcelDocument.Workbook();
    const worksheet = workbook.addWorksheet('GUIAS_CARGA');

    let validDoc = await guiasEmpresaService.mainReport(
      worksheet,
      client,
      desde,
      hasta,
      estatus,
      ciudad,
      guia
    );
    workbook.xlsx.writeFile(reportsPath + resPath);

    return { validDoc: validDoc, resPath: resPath };
  }

  // LIBRO COMPRAS
  async libroCompras(agencia, proveedor, desde, hasta, detalle) {
    let resPath = 'LibroCompras.xlsx';
    const workbook = new ExcelDocument.Workbook();
    const worksheet = workbook.addWorksheet('libro_compras');

    let validDoc = await libroComprasService.mainReport(
      worksheet,
      agencia,
      proveedor,
      desde,
      hasta,
      detalle
    );
    workbook.xlsx.writeFile(reportsPath + resPath);

    return { validDoc: validDoc, resPath: resPath };
  }

  // LIBRO VENTAS
  async libroVentas(agencia, cliente, desde, hasta, detalle, correlativo) {
    let resPath = 'LibroVentas.xlsx';
    const workbook = new ExcelDocument.Workbook();
    const worksheet = workbook.addWorksheet('libro_ventas');

    let validDoc = await libroVentasService.mainReport(
      worksheet,
      agencia,
      cliente,
      desde,
      hasta,
      detalle,
      correlativo
    );
    workbook.xlsx.writeFile(reportsPath + resPath);

    return { validDoc: validDoc, resPath: resPath };
  }

  // RELACION FPO
  async relacionFpo(tipo, data) {
    let resPath = 'relacionFpo' + tipo + '.xlsx';
    const workbook = new ExcelDocument.Workbook();
    const worksheet = workbook.addWorksheet('relacion_fpo');

    let validDoc = await relacionFpoService.mainReport(worksheet, tipo, data);
    workbook.xlsx.writeFile(reportsPath + resPath);

    return { validDoc: validDoc, resPath: resPath };
  }

  // COSTOS TRANSPORTE
  async costosTransporte(desde, hasta, neta, dolar) {
    let resPath = 'comisionesCostos.xlsx';
    const workbook = new ExcelDocument.Workbook();
    const worksheet = workbook.addWorksheet('comisiones');

    let validDoc = await costosTransporteService.mainReport(
      worksheet,
      desde,
      hasta,
      neta,
      dolar
    );
    workbook.xlsx.writeFile(reportsPath + resPath);

    return { validDoc: validDoc, resPath: resPath };
  }

  // REPORTE RELACION DESPACHO
  async relacionDespacho(data, detalle) {
    data = JSON.parse(data);
    let resPath = 'relacionDespacho.xlsx';
    const workbook = new ExcelDocument.Workbook();
    const worksheet = workbook.addWorksheet('relacion_despacho');

    let validDoc = await relacionDespachoService.mainReport(
      worksheet,
      data,
      detalle
    );
    workbook.xlsx.writeFile(reportsPath + resPath);

    return { validDoc: validDoc, resPath: resPath };
  }

  // RETENCIONES ISLR
  async retencionesIslr(data) {

    let resPath = 'Retenciones Islr.xlsx';
    const workbook = new ExcelDocument.Workbook();
    const worksheet = workbook.addWorksheet('retenciones islr');

    let validDoc = await retencionesIslrService.mainReport(
      worksheet,
      data
    );
    workbook.xlsx.writeFile(reportsPath + resPath);

    return { validDoc: validDoc, resPath: resPath };
  }

  // RETENCIONES IVA
  async retencionesIva(data) {

    let resPath = 'Retenciones Iva.xlsx';
    const workbook = new ExcelDocument.Workbook();
    const worksheet = workbook.addWorksheet('retenciones iva');

    let validDoc = await retencionesIvaService.mainReport(
      worksheet,
      data
    );
    workbook.xlsx.writeFile(reportsPath + resPath);

    return { validDoc: validDoc, resPath: resPath };
  }
}

module.exports = ExcelReportsService;
