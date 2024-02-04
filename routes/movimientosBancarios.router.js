const express = require('express');

const MbancariosService = require('./../services/movimientosBancarios.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createMbancariosSchema, updateMbancariosSchema, getMbancariosSchema } = require('./../schemas/movimientosBancarios.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new MbancariosService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { page, limit, order_by, order_direction, filter, filter_value } = req.headers;
    const Mbancarios = await service.find(page, limit, order_by, order_direction, filter, filter_value);
    res.json(Mbancarios);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getMbancariosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const Mbancario = await service.findOne(id);
      res.json(Mbancario);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createMbancariosSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newMbancario = await service.create(body);
      res.status(201).json(newMbancario);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getMbancariosSchema, 'params'),
  validatorHandler(updateMbancariosSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const Mbancario = await service.update(id, body);
      res.json(Mbancario);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getMbancariosSchema, 'params'),
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
