const express = require('express');

const ChequerasService = require('./../services/chequeras.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createChequerasSchema, updateChequerasSchema, getChequerasSchema } = require('./../schemas/chequeras.schema');
const authenticateJWT = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new ChequerasService();

router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const { cuenta, estatus } = req.headers;
    const chequeras = await service.find(cuenta, estatus);
    res.json(chequeras);
  } catch (error) {
    next(error);
  }
});

router.get(
  '/:id',
  authenticateJWT,
  validatorHandler(getChequerasSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const chequera = await service.findOne(id);
      res.json(chequera);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createChequerasSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newChequera = await service.create(body);
      res.status(201).json(newChequera);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getChequerasSchema, 'params'),
  validatorHandler(updateChequerasSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const chequera = await service.update(id, body);
      res.json(chequera);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getChequerasSchema, 'params'),
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
