const express = require('express');

const AgentesService = require('./../services/agentes.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createAgentesSchema, updateAgentesSchema, getAgentesSchema } = require('./../schemas/agentes.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new AgentesService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { page, limit, order_by, order_direction, filter, filter_value, agencia } = req.headers;
    const agentes = await service.find(page, limit, order_by, order_direction, filter, filter_value, agencia);
    res.json(agentes);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getAgentesSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const agente = await service.findOne(id);
      res.json(agente);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createAgentesSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newAgente = await service.create(body);
      res.status(201).json(newAgente);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getAgentesSchema, 'params'),
  validatorHandler(updateAgentesSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const agente = await service.update(id, body);
      res.json(agente);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getAgentesSchema, 'params'),
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
