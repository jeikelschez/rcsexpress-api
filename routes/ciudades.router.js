const express = require('express');

const CiudadService = require('./../services/ciudad.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createCiudadSchema, updateCiudadSchema, getCiudadSchema } = require('./../schemas/ciudad.schema');

const router = express.Router();
const service = new CiudadService();

router.get('/', async (req, res, next) => {
  try {
    const ciudades = await service.find();
    res.json(ciudades);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  validatorHandler(getCiudadSchema, 'params'),
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
  validatorHandler(createCiudadSchema, 'body'),
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
  validatorHandler(getCiudadSchema, 'params'),
  validatorHandler(updateCiudadSchema, 'body'),
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
  validatorHandler(getCiudadSchema, 'params'),
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
