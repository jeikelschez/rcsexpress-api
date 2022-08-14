const express = require('express');

const CguiasService = require('./../services/controlGuias.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createCguiasSchema, updateCguiasSchema, getCguiasSchema } = require('./../schemas/controlGuias.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new CguiasService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const agencia = req.headers.agencia;
    const agente = req.headers.agente;
    const cliente = req.headers.cliente;
    const desde = req.headers.desde;
    const hasta = req.headers.hasta;
    const disp = req.headers.disp;
    const tipo = req.headers.tipo;
    const cguias = await service.find(agencia, agente, cliente, desde, hasta, disp, tipo);
    res.json(cguias);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getCguiasSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const cguia = await service.findOne(id);
      res.json(cguia);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createCguiasSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newCguia = await service.create(body);
      res.status(201).json(newCguia);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getCguiasSchema, 'params'),
  validatorHandler(updateCguiasSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const cguia = await service.update(id, body);
      res.json(cguia);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getCguiasSchema, 'params'),
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