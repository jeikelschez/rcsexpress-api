const express = require('express');

const UnidadesService = require('./../services/unidades.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createUnidadesSchema, updateUnidadesSchema, getUnidadesSchema } = require('./../schemas/unidades.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new UnidadesService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const unidades = await service.find();
    res.json(unidades);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getUnidadesSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const unidad = await service.findOne(id);
      res.json(unidad);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createUnidadesSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newUnidad = await service.create(body);
      res.status(201).json(newUnidad);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getUnidadesSchema, 'params'),
  validatorHandler(updateUnidadesSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const unidad = await service.update(id, body);
      res.json(unidad);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getUnidadesSchema, 'params'),
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
