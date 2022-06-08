const express = require('express');

const CfacturacionService = require('./../services/conceptosFacturacion.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createCfacturacionSchema, updateCfacturacionSchema, getCfacturacionSchema } = require('./../schemas/conceptosFacturacion.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new CfacturacionService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const cod_concepto = req.headers.cod_concepto;
    const conceptos = await service.find(cod_concepto);
    res.json(conceptos);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getCfacturacionSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const concepto = await service.findOne(id);
      res.json(concepto);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createCfacturacionSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newConcepto = await service.create(body);
      res.status(201).json(newConcepto);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getCfacturacionSchema, 'params'),
  validatorHandler(updateCfacturacionSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const concepto = await service.update(id, body);
      res.json(concepto);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getCfacturacionSchema, 'params'),
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
