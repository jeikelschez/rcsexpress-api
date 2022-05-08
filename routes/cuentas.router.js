const express = require('express');

const CuentasService = require('./../services/cuentas.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createCuentasSchema, updateCuentasSchema, getCuentasSchema } = require('./../schemas/cuentas.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new CuentasService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const cuentas = await service.find();
    res.json(cuentas);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getCuentasSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const cuenta = await service.findOne(id);
      res.json(cuenta);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createCuentasSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newCuenta = await service.create(body);
      res.status(201).json(newCuenta);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getCuentasSchema, 'params'),
  validatorHandler(updateCuentasSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const cuenta = await service.update(id, body);
      res.json(cuenta);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getCuentasSchema, 'params'),
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
