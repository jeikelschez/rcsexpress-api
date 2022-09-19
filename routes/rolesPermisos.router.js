const express = require('express');

const RpermisosService = require('../services/rolesPermisos.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createRpermisosSchema, getRpermisosSchema } = require('./../schemas/rolesPermisos.schema');
const authenticateJWT  = require('../middlewares/authenticate.handler');

const router = express.Router();
const service = new RpermisosService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { rol, menu, accion } = req.headers;
    const rpermisos = await service.find(rol, menu, accion);
    res.json(rpermisos);
  } catch (error) {
    next(error);
  }
});

router.post('/',
  authenticateJWT,
  validatorHandler(createRpermisosSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newRpermisos = await service.create(body);
      res.status(201).json(newRpermisos);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getRpermisosSchema, 'params'),
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
