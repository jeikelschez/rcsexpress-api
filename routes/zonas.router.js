const express = require('express');

const ZonasService = require('./../services/zonas.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createZonasSchema, updateZonasSchema, getZonasSchema } = require('./../schemas/zonas.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new ZonasService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const agencia = req.headers.agencia;
    const zonas = await service.find(agencia);
    res.json(zonas);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getZonasSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const zona = await service.findOne(id);
      res.json(zona);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createZonasSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newZona = await service.create(body);
      res.status(201).json(newZona);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getZonasSchema, 'params'),
  validatorHandler(updateZonasSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const zona = await service.update(id, body);
      res.json(zona);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getZonasSchema, 'params'),
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
