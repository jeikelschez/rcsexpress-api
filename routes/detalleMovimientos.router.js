const express = require('express');

const DmovimientosService = require('./../services/detalleMovimientos.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createDmovimientosSchema, updateDmovimientosSchema, getDmovimientosSchema } = require('./../schemas/detalleMovimientos.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new DmovimientosService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { page, limit, order_by, order_direction, filter, filter_value, cod_movimiento } = req.headers;

    const dMovimientos = await service.find(page, limit, order_by, order_direction, filter, filter_value, cod_movimiento);
    res.json(dMovimientos);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getDmovimientosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const dMovimiento = await service.findOne(id);
      res.json(dMovimiento);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createDmovimientosSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newDmovimiento = await service.create(body);
      res.status(201).json(newDmovimiento);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getDmovimientosSchema, 'params'),
  validatorHandler(updateDmovimientosSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const dMovimiento = await service.update(id, body);
      res.json(dMovimiento);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getDmovimientosSchema, 'params'),
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
