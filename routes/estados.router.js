const express = require('express');

const EstadosService = require('./../services/estados.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createEstadosSchema, updateEstadosSchema, getEstadosSchema } = require('./../schemas/estados.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new EstadosService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { page, limit, order_by, order_direction, filter, filter_value, pais, desc } = req.headers;
    const estados = await service.find(page, limit, order_by, order_direction, filter, filter_value, pais, desc);
    res.json(estados);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getEstadosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const estado = await service.findOne(id);
      res.json(estado);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createEstadosSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newEstado = await service.create(body);
      res.status(201).json(newEstado);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getEstadosSchema, 'params'),
  validatorHandler(updateEstadosSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const estado = await service.update(id, body);
      res.json(estado);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getEstadosSchema, 'params'),
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
