const express = require('express');

const TarifasService = require('./../services/tarifas.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createTarifasSchema, updateTarifasSchema, getTarifasSchema } = require('./../schemas/tarifas.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new TarifasService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const tarifas = await service.find();
    res.json(tarifas);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getTarifasSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const tarifa = await service.findOne(id);
      res.json(tarifa);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createTarifasSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newTarifa = await service.create(body);
      res.status(201).json(newTarifa);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getTarifasSchema, 'params'),
  validatorHandler(updateTarifasSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const tarifa = await service.update(id, body);
      res.json(tarifa);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getTarifasSchema, 'params'),
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
