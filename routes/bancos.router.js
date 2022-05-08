const express = require('express');

const BancosService = require('./../services/bancos.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createBancosSchema, updateBancosSchema, getBancosSchema } = require('./../schemas/bancos.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new BancosService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const bancos = await service.find();
    res.json(bancos);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getBancosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const banco = await service.findOne(id);
      res.json(banco);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id/cuentas',
  authenticateJWT,
  validatorHandler(getBancosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const banco = await service.findOneCuentas(id);
      res.json(banco);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createBancosSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newBanco = await service.create(body);
      res.status(201).json(newBanco);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getBancosSchema, 'params'),
  validatorHandler(updateBancosSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const banco = await service.update(id, body);
      res.json(banco);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getBancosSchema, 'params'),
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
