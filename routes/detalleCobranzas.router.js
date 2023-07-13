const express = require('express');

const DcobranzasService = require('./../services/detalleCobranzas.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createDcobranzasSchema, updateDcobranzasSchema, getDcobranzasSchema } = require('./../schemas/detalleCobranzas.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new DcobranzasService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { page, limit, order_by, order_direction, filter, filter_value, cod_cobranza } = req.headers;

    const dCobranzas = await service.find(page, limit, order_by, order_direction, filter, filter_value, cod_cobranza);
    res.json(dCobranzas);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getDcobranzasSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const dCobranza = await service.findOne(id);
      res.json(dCobranza);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createDcobranzasSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newDcobranza = await service.create(body);
      res.status(201).json(newDcobranza);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getDcobranzasSchema, 'params'),
  validatorHandler(updateDcobranzasSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const dCobranza = await service.update(id, body);
      res.json(dCobranza);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getDcobranzasSchema, 'params'),
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
