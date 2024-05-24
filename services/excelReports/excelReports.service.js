const ExcelDocument = require('exceljs');
const reportsPath = './services/excelReports/excel/';

const ReporteVentasService = require('./reporteVentas.service');
const reporteVentasService = new ReporteVentasService();
const ComisionesService = require('./comisiones.service');
const comisionesService = new ComisionesService();
const GuiasEmpresaService = require('./guiasEmpresa.service');
const guiasEmpresaService = new GuiasEmpresaService();

class ExcelReportsService {
  constructor() {}  

  // REPORTE VENTAS
  async reporteVentas(tipo, data) {  
    if (!tipo || tipo == 'undefined')
      return { validDoc: false, resPath: '' };

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

    let validDoc = await comisionesService.mainReport(worksheet, data, desde, hasta, dolar);
    workbook.xlsx.writeFile(reportsPath + resPath);

    return { validDoc: validDoc, resPath: resPath };
  }

  // COMISIONES
  async guiasEmpresa(client, desde, hasta, estatus, ciudad, guia) {
    let resPath = 'Consulta_RCS.xlsx';
    const workbook = new ExcelDocument.Workbook();
    const worksheet = workbook.addWorksheet('GUIAS_CARGA');

    let validDoc = await guiasEmpresaService.mainReport(worksheet, client, desde, hasta, estatus, ciudad, guia);
    workbook.xlsx.writeFile(reportsPath + resPath);

    return { validDoc: validDoc, resPath: resPath };
  }
}

module.exports = ExcelReportsService;
