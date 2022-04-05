const express = require('express');

const PermisosService = require('./../services/permisos.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createPermisosSchema, updatePermisosSchema, getPermisosSchema } = require('./../schemas/permisos.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new PermisosService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const permisos = await service.find();
    res.json(permisos);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getPermisosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const permiso = await service.findOne(id);
      res.json(permiso);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createPermisosSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newPermiso = await service.create(body);
      res.status(201).json(newPermiso);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getPermisosSchema, 'params'),
  validatorHandler(updatePermisosSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const permiso = await service.update(id, body);
      res.json(permiso);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getPermisosSchema, 'params'),
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
