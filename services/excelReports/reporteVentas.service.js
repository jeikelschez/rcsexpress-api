class ReporteVentasService {
  async mainReport(worksheet) {
    worksheet.columns = [
      { header: 'ID', key: 'id' },
      { header: 'NOMBRE', key: 'name' },
      { header: 'PROFESION', key: 'work' },
    ];
    for (var i = 1; i < 10; i++) {
      worksheet.addRow({ id: i, name: 'John Doe', work: 'testing' });
    }
    return true;
  }
}

module.exports = ReporteVentasService;
