const express = require('express');

const ProveedoresService = require('./../services/proveedores.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createProveedoresSchema, updateProveedoresSchema, getProveedoresSchema } = require('./../schemas/proveedores.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new ProveedoresService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { page, limit, order_by, order_direction, filter, filter_value, tipo_servicio } = req.headers;
    const proveedores = await service.find(page, limit, order_by, order_direction, filter, filter_value, tipo_servicio);
    res.json(proveedores);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getProveedoresSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const proveedor = await service.findOne(id);
      res.json(proveedor);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createProveedoresSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newProveedor = await service.create(body);
      res.status(201).json(newProveedor);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getProveedoresSchema, 'params'),
  validatorHandler(updateProveedoresSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const proveedor = await service.update(id, body);
      res.json(proveedor);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getProveedoresSchema, 'params'),
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
