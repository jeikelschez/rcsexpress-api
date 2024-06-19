const express = require('express');

const DgastosService = require('./../services/distribucionGastos.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createDgastosSchema, updateDgastosSchema, getDgastosSchema } = require('./../schemas/distribucionGastos.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new DgastosService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { page, limit, order_by, order_direction, filter, filter_value, cod_cta } = req.headers;
    const dGastos = await service.find(page, limit, order_by, order_direction, filter, filter_value, cod_cta);
    res.json(dGastos);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getDgastosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const dGasto = await service.findOne(id);
      res.json(dGasto);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createDgastosSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newdGasto = await service.create(body);
      res.status(201).json(newdGasto);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getDgastosSchema, 'params'),
  validatorHandler(updateDgastosSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const dGasto = await service.update(id, body);
      res.json(dGasto);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getDgastosSchema, 'params'),
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
