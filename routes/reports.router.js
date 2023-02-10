const express = require('express');

const ReportsService = require('./../services/reports/reports.service');
const authenticateJWT = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new ReportsService();

router.get('/cartaCliente', authenticateJWT, async (req, res, next) => {
  try {
    const { data, cliente, contacto, cargo, ciudad, usuario } = req.headers;
    const pdfStream = await service.cartaCliente(
      data,
      cliente,
      contacto,
      cargo,
      ciudad,
      usuario
    );
    res.status(200).json({
      message: 'PDF Generado',
      base64: pdfStream,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/facturaPreimpreso', authenticateJWT, async (req, res, next) => {
  try {
    const { data } = req.headers;
    const pdfStream = await service.facturaPreimpreso(data);
    res.status(200).json({
      message: 'PDF Generado',
      base64: pdfStream,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/anexoFactura', authenticateJWT, async (req, res, next) => {
  try {
    const { data } = req.headers;
    const pdfStream = await service.anexoFactura(data);
    res.status(200).json({
      message: 'PDF Generado',
      base64: pdfStream,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/relacionDespacho', authenticateJWT, async (req, res, next) => {
  try {
    const { data } = req.headers;
    const pdfStream = await service.relacionDespacho(data);
    res.status(200).json({
      message: 'PDF Generado',
      base64: pdfStream,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
