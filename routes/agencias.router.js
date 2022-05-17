const express = require('express');

const AgenciasService = require('./../services/agencias.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createAgenciasSchema, updateAgenciasSchema, getAgenciasSchema } = require('./../schemas/agencias.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new AgenciasService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const agencias = await service.find();
    res.json(agencias);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getAgenciasSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const agencia = await service.findOne(id);
      res.json(agencia);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id/usuarios',
  authenticateJWT,
  validatorHandler(getAgenciasSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const agencia = await service.findOneUsuarios(id);
      res.json(agencia);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id/roles',
  authenticateJWT,
  validatorHandler(getAgenciasSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const agencia = await service.findOneRoles(id);
      res.json(agencia);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id/agentes',
  authenticateJWT,
  validatorHandler(getAgenciasSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const agencia = await service.findOneAgentes(id);
      res.json(agencia);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id/zonas',
  authenticateJWT,
  validatorHandler(getAgenciasSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const agencia = await service.findOneZonas(id);
      res.json(agencia);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id/clientes',
  authenticateJWT,
  validatorHandler(getAgenciasSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const agencia = await service.findOneClientes(id);
      res.json(agencia);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createAgenciasSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newAgencia = await service.create(body);
      res.status(201).json(newAgencia);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getAgenciasSchema, 'params'),
  validatorHandler(updateAgenciasSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const agencia = await service.update(id, body);
      res.json(agencia);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getAgenciasSchema, 'params'),
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
