const express = require('express');

const McobranzasService = require('./../services/maestroCobranzas.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createMcobranzasSchema, updateMcobranzasSchema, getMcobranzasSchema } = require('./../schemas/maestroCobranzas.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new McobranzasService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { page, limit, order_by, order_direction, filter, filter_value } = req.headers;
    const mCobranzas = await service.find(page, limit, order_by, order_direction, filter, filter_value);
    res.json(mCobranzas);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getMcobranzasSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const mCobranza = await service.findOne(id);
      res.json(mCobranza);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createMcobranzasSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newMcobranza = await service.create(body);
      res.status(201).json(newMcobranza);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getMcobranzasSchema, 'params'),
  validatorHandler(updateMcobranzasSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const mCobranza = await service.update(id, body);
      res.json(mCobranza);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getMcobranzasSchema, 'params'),
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
