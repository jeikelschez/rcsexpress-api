const express = require('express');

const EstadoService = require('./../services/estado.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createEstadoSchema, updateEstadoSchema, getEstadoSchema } = require('./../schemas/estado.schema');

const router = express.Router();
const service = new EstadoService();

router.get('/', async (req, res, next) => {
  try {
    const estados = await service.find();
    res.json(estados);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  validatorHandler(getEstadoSchema, 'params'),
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

router.get('/:id/ciudades',
  validatorHandler(getEstadoSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const estado = await service.findOneCiudades(id);
      res.json(estado);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  validatorHandler(createEstadoSchema, 'body'),
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
  validatorHandler(getEstadoSchema, 'params'),
  validatorHandler(updateEstadoSchema, 'body'),
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
  validatorHandler(getEstadoSchema, 'params'),
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
