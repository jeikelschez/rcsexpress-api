const express = require('express');

const CcomisionesService = require('../services/controlComisiones.service');
const validatorHandler = require('../middlewares/validator.handler');
const { createCcomisionesSchema, updateCcomisionesSchema, getCcomisionesSchema } = require('../schemas/controlComisiones.schema');
const authenticateJWT  = require('../middlewares/authenticate.handler');

const router = express.Router();
const service = new CcomisionesService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { page, limit, order_by, order_direction, filter, filter_value, agencia, agente, cod_movimiento, tipo, mayor } = req.headers;
    const comisiones = await service.find(page, limit, order_by, order_direction, filter, filter_value, 
      agencia, agente, cod_movimiento, tipo, mayor);
    res.json(comisiones);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getCcomisionesSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const comision = await service.findOne(id);
      res.json(comision);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createCcomisionesSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newCcomision = await service.create(body);
      res.status(201).json(newCcomision);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getCcomisionesSchema, 'params'),
  validatorHandler(updateCcomisionesSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const comision = await service.update(id, body);
      res.json(comision);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getCcomisionesSchema, 'params'),
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
