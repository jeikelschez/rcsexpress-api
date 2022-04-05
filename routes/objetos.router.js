const express = require('express');

const ObjetosService = require('./../services/objetos.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createObjetosSchema, updateObjetosSchema, getObjetosSchema } = require('./../schemas/objetos.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new ObjetosService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const objetos = await service.find();
    res.json(objetos);
  } catch (error) {
    next(error);
  }
});

router.get('/:codigo',
  authenticateJWT,
  validatorHandler(getObjetosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { codigo } = req.params;
      const objeto = await service.findOne(codigo);
      res.json(objeto);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createObjetosSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newObjeto = await service.create(body);
      res.status(201).json(newObjeto);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:codigo',
  authenticateJWT,
  validatorHandler(getObjetosSchema, 'params'),
  validatorHandler(updateObjetosSchema, 'body'),
  async (req, res, next) => {
    try {
      const { codigo } = req.params;
      const body = req.body;
      const objeto = await service.update(codigo, body);
      res.json(objeto);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:codigo',
  authenticateJWT,
  validatorHandler(getObjetosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { codigo } = req.params;
      await service.delete(codigo);
      res.status(201).json({codigo});
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
