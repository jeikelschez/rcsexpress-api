const express = require('express');

const CiudadesService = require('./../services/ciudades.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createCiudadesSchema, updateCiudadesSchema, getCiudadesSchema } = require('./../schemas/ciudades.schema');

const router = express.Router();
const service = new CiudadesService();

router.get('/', async (req, res, next) => {
  try {
    const ciudades = await service.find();
    res.json(ciudades);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
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

router.get('/:id/agencias',
  validatorHandler(getCiudadesSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const ciudad = await service.findOneAgencias(id);
      res.json(ciudad);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
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
