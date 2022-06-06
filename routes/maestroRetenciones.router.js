const express = require('express');

const MretencionesService = require('./../services/maestroRetenciones.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createMretencionesSchema, updateMretencionesSchema, getMretencionesSchema } = require('./../schemas/maestroRetenciones.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new MretencionesService();

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
  validatorHandler(getMretencionesSchema, 'params'),
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
  validatorHandler(createMretencionesSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newMretencion = await service.create(body);
      res.status(201).json(newMretencion);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getMretencionesSchema, 'params'),
  validatorHandler(updateMretencionesSchema, 'body'),
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
  validatorHandler(getMretencionesSchema, 'params'),
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