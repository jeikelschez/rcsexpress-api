const express = require('express');

const AyudantesService = require('./../services/ayudantes.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createAyudantesSchema, updateAyudantesSchema, getAyudantesSchema } = require('./../schemas/ayudantes.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new AyudantesService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const ayudantes = await service.find();
    res.json(ayudantes);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getAyudantesSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const ayudante = await service.findOne(id);
      res.json(ayudante);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createAyudantesSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newAyudante = await service.create(body);
      res.status(201).json(newAyudante);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getAyudantesSchema, 'params'),
  validatorHandler(updateAyudantesSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const ayudante = await service.update(id, body);
      res.json(ayudante);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getAyudantesSchema, 'params'),
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
