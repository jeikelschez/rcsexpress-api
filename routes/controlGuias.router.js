const express = require('express');

const CguiasService = require('./../services/controlGuias.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createCguiasSchema, updateCguiasSchema, getCguiasSchema } = require('./../schemas/controlGuias.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new CguiasService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { page, limit, order_by, order_direction, filter, filter_value,
      agencia, agente, cliente, desde, desde_fact, hasta, hasta_fact,
      disp, tipo} = req.headers;
    const cguias = await service.find(page, limit, order_by, order_direction, filter,
      filter_value, agencia, agente, cliente, desde, desde_fact, hasta, hasta_fact,
      disp, tipo);
    res.json(cguias);
  } catch (error) {
    next(error);
  }
});

router.get('/generatePDF',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { id } = req.headers;
    const pdfStream = await service.generatePdf(id);
    res.status(200).json({ 
      message: "PDF Generado", 
      base64: pdfStream 
    });
  } catch (error) {
    next(error);
  }
});

router.get('/disp',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const lote = req.headers.lote;
    const dispLote = await service.guiasDispLote(lote);
    res.json(dispLote);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getCguiasSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const cguia = await service.findOne(id);
      res.json(cguia);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createCguiasSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newCguia = await service.create(body);
      res.status(201).json(newCguia);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getCguiasSchema, 'params'),
  validatorHandler(updateCguiasSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const cguia = await service.update(id, body);
      res.json(cguia);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getCguiasSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.delete(id);
      res.status(201).json({id});
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
