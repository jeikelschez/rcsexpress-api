const express = require('express');

const MRetencionesService = require('./../services/maestroRetenciones.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createMRetencionesSchema, updateMRetencionesSchema, getMRetencionesSchema } = require('./../schemas/maestroRetenciones.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new MRetencionesService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const vigente = req.headers.vigente;
    const tipoPersona = req.headers.tipo_persona;
    const mRetenciones = await service.find(vigente, tipoPersona);
    res.json(mRetenciones);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getMRetencionesSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const mRetencion = await service.findOne(id);
      res.json(mRetencion);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createMRetencionesSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newMRetencion = await service.create(body);
      res.status(201).json(newMRetencion);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getMRetencionesSchema, 'params'),
  validatorHandler(updateMRetencionesSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const mRetencion = await service.update(id, body);
      res.json(mRetencion);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getMRetencionesSchema, 'params'),
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
