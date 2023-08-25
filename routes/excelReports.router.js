const express = require('express');

const ExcelReportsService = require('./../services/excelReports/excelReports.service');
const authenticateJWT = require('./../middlewares/authenticate.handler');
const fs = require('fs');

const router = express.Router();
const service = new ExcelReportsService();

router.get('/loadExcel/:report', (req, res) => {
  const { report } = req.params;
  const filePath = './services/excelReports/excel/' + report;
  fs.readFile(filePath, (err, file) => {
    if (err) return res.status(500).send('No se pudo descargar el archivo');
    res.setHeader('Content-Type', 'application/excel');
    res.setHeader('Content-Disposition', `inline; filename= ${report }`);
    res.send(file);
  });
});

router.get('/reporteVentas', authenticateJWT, async (req, res, next) => {
  try {
    const { tipo, data } = req.headers;
    const response = await service.reporteVentas(tipo, data);
    res.status(200).json({
      message: 'Excel Generado',
      excelPath: response.resPath,
      validDoc: response.validDoc,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
