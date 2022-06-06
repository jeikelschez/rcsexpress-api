const express = require('express');

const EmpleadosService = require('./../services/empleados.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createEmpleadosSchema, updateEmpleadosSchema, getEmpleadosSchema } = require('./../schemas/empleados.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new EmpleadosService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const empleados = await service.find();
    res.json(empleados);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getEmpleadosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const empleado = await service.findOne(id);
      res.json(empleado);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createEmpleadosSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newEmpleado = await service.create(body);
      res.status(201).json(newEmpleado);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getEmpleadosSchema, 'params'),
  validatorHandler(updateEmpleadosSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const empleado = await service.update(id, body);
      res.json(empleado);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getEmpleadosSchema, 'params'),
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
