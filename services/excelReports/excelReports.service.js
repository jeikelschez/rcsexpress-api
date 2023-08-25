const ExcelDocument = require('exceljs');
const reportsPath = './services/excelReports/excel/';

const ReporteVentasService = require('./reporteVentas.service');
const reporteVentasService = new ReporteVentasService();

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
}

module.exports = ExcelReportsService;
