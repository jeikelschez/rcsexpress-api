const express = require('express');

const ReportsService = require('./../services/reports/reports.service');
const authenticateJWT = require('./../middlewares/authenticate.handler');
const fs = require('fs');

const router = express.Router();
const service = new ReportsService();

router.get('/loadPDF/:report', (req, res) => {
  const { report } = req.params;
  const filePath = './services/reports/pdf/' + report;
  fs.readFile(filePath, (err, file) => {
    if (err) return res.status(500).send('No se pudo descargar el archivo');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="js.pdf"');
    res.send(file);
  });
});

router.get('/asignacionGuias', authenticateJWT, async (req, res, next) => {
  try {
    const { id } = req.headers;
    const response = await service.asignacionGuias(id);
    res.status(200).json({
      message: 'PDF Generado',
      pdfPath: response.resPath,
      validDoc: response.validDoc,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/cartaCliente', authenticateJWT, async (req, res, next) => {
  try {
    const { data, cliente, contacto, cargo, ciudad, usuario } = req.headers;
    const response = await service.cartaCliente(
      data,
      cliente,
      contacto,
      cargo,
      ciudad,
      usuario
    );
    res.status(200).json({
      message: 'PDF Generado',
      pdfPath: response.resPath,
      validDoc: response.validDoc,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/facturaPreimpreso', authenticateJWT, async (req, res, next) => {
  try {
    const { data } = req.headers;
    const response = await service.facturaPreimpreso(data);
    res.status(200).json({
      message: 'PDF Generado',
      pdfPath: response.resPath,
      validDoc: response.validDoc,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/anexoFactura', authenticateJWT, async (req, res, next) => {
  try {
    const { data } = req.headers;
    const response = await service.anexoFactura(data);
    res.status(200).json({
      message: 'PDF Generado',
      pdfPath: response.resPath,
      validDoc: response.validDoc,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/relacionDespacho', authenticateJWT, async (req, res, next) => {
  try {
    const { data, detalle } = req.headers;
    const response = await service.relacionDespacho(data, detalle);
    res.status(200).json({
      message: 'PDF Generado',
      pdfPath: response.resPath,
      validDoc: response.validDoc,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/costosTransporte', authenticateJWT, async (req, res, next) => {
  try {
    const { id, tipo, agencia, desde, hasta, neta, dolar } = req.headers;
    const response = await service.costosTransporte(
      id,
      tipo,
      agencia,
      desde,
      hasta,
      neta,
      dolar
    );
    res.status(200).json({
      message: 'PDF Generado',
      pdfPath: response.resPath,
      validDoc: response.validDoc,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/reporteCostos', authenticateJWT, async (req, res, next) => {
  try {
    const { tipo, data } = req.headers;
    const response = await service.reporteCostos(tipo, data);
    res.status(200).json({
      message: 'PDF Generado',
      pdfPath: response.resPath,
      validDoc: response.validDoc,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/reporteVentas', authenticateJWT, async (req, res, next) => {
  try {
    const { tipo, data } = req.headers;
    const response = await service.reporteVentas(tipo, data);
    res.status(200).json({
      message: 'PDF Generado',
      pdfPath: response.resPath,
      validDoc: response.validDoc,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/libroCompras', authenticateJWT, async (req, res, next) => {
  try {
    const { print, agencia, proveedor, desde, hasta } = req.headers;
    const response = await service.libroCompras(
      print,
      agencia,
      proveedor,
      desde,
      hasta
    );
    res.status(200).json({
      message: 'PDF Generado',
      pdfPath: response.resPath,
      validDoc: response.validDoc,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
