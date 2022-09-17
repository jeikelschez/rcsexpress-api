const express = require('express');

const CiudadesService = require('./../services/ciudades.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createCiudadesSchema, updateCiudadesSchema, getCiudadesSchema } = require('./../schemas/ciudades.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new CiudadesService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { page, limit, order_by, order_direction, filter, filter_value, estado } = req.headers;
    const ciudades = await service.find(page, limit, order_by, order_direction, filter, filter_value, estado);
    res.json(ciudades);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getCiudadesSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const ciudad = await service.findOne(id);
      res.json(ciudad);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createCiudadesSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newCiudad = await service.create(body);
      res.status(201).json(newCiudad);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getCiudadesSchema, 'params'),
  validatorHandler(updateCiudadesSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const ciudad = await service.update(id, body);
      res.json(ciudad);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getCiudadesSchema, 'params'),
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
