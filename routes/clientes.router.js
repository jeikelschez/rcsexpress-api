const express = require('express');

const ClientesService = require('./../services/clientes.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createClientesSchema, updateClientesSchema, getClientesSchema } = require('./../schemas/clientes.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new ClientesService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const agencia = req.headers.agencia;
    const clientes = await service.find(agencia);
    res.json(clientes);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getClientesSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const cliente = await service.findOne(id);
      res.json(cliente);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createClientesSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newCliente = await service.create(body);
      res.status(201).json(newCliente);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getClientesSchema, 'params'),
  validatorHandler(updateClientesSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const cliente = await service.update(id, body);
      res.json(cliente);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getClientesSchema, 'params'),
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
