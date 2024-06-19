const express = require('express');

const CoperacionService = require('./../services/conceptosOperacion.service');
const validatorHandler = require('./../middlewares/validator.handler');
const {
  createCoperacionSchema,
  updateCoperacionSchema,
  getCoperacionSchema,
} = require('./../schemas/conceptosOperacion.schema');
const authenticateJWT = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new CoperacionService();

router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const { tipo, tipo_in } = req.headers;
    const conceptos = await service.find(tipo, tipo_in);
    res.json(conceptos);
  } catch (error) {
    next(error);
  }
});

router.get(
  '/:id',
  authenticateJWT,
  validatorHandler(getCoperacionSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const concepto = await service.findOne(id);
      res.json(concepto);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  authenticateJWT,
  validatorHandler(createCoperacionSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newConcepto = await service.create(body);
      res.status(201).json(newConcepto);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  authenticateJWT,
  validatorHandler(getCoperacionSchema, 'params'),
  validatorHandler(updateCoperacionSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const concepto = await service.update(id, body);
      res.json(concepto);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  authenticateJWT,
  validatorHandler(getCoperacionSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.delete(id);
      res.status(201).json({ id });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
