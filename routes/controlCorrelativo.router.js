const express = require('express');

const CorrelativoService = require('./../services/controlCorrelativo.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createCorrelativoSchema, updateCorrelativoSchema, getCorrelativoSchema } = require('./../schemas/controlCorrelativo.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new CorrelativoService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { page, limit, order_by, order_direction, filter, filter_value, agencia, tipo } = req.headers;
    const correlativos = await service.find(page, limit, order_by, order_direction, filter, filter_value, agencia, tipo);
    res.json(correlativos);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getCorrelativoSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const correlativo = await service.findOne(id);
      res.json(correlativo);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createCorrelativoSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newCorrelativo = await service.create(body);
      res.status(201).json(newCorrelativo);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getCorrelativoSchema, 'params'),
  validatorHandler(updateCorrelativoSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const correlativo = await service.update(id, body);
      res.json(correlativo);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getCorrelativoSchema, 'params'),
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
