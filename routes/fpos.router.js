const express = require('express');

const FposService = require('./../services/fpos.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createFposSchema, updateFposSchema, getFposSchema } = require('./../schemas/fpos.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new FposService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { fecha, peso } = req.headers;
    const fpos = await service.find(fecha, peso);
    res.json(fpos);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getFposSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const fpo = await service.findOne(id);
      res.json(fpo);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createFposSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newFpo = await service.create(body);
      res.status(201).json(newFpo);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getFposSchema, 'params'),
  validatorHandler(updateFposSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const fpo = await service.update(id, body);
      res.json(fpo);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getFposSchema, 'params'),
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
