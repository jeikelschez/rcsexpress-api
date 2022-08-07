const express = require('express');

const MmovimientosService = require('./../services/maestroMovimientos.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createMmovimientosSchema, updateMmovimientosSchema, getMmovimientosSchema } = require('./../schemas/maestroMovimientos.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new MmovimientosService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const agencia = req.headers.agencia;
    const agencia_dest = req.headers.agencia_dest;
    const nro_documento = req.headers.nro_documento;
    const tipo = req.headers.tipo;
    const desde = req.headers.f_desde;
    const hasta = req.headers.f_hasta;
    const cliente_orig = req.headers.cliente_orig;
    const cliente_dest = req.headers.cliente_dest;
    const estatus_oper = req.headers.estatus_oper;
    const transito = req.headers.transito;
    const cguias = await service.find(agencia, agencia_dest, nro_documento, tipo, desde, hasta, cliente_orig, cliente_dest, estatus_oper, transito);
    res.json(cguias);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getMmovimientosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const mMovimiento = await service.findOne(id);
      res.json(mMovimiento);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createMmovimientosSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newMmovimiento = await service.create(body);
      res.status(201).json(newMmovimiento);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getMmovimientosSchema, 'params'),
  validatorHandler(updateMmovimientosSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const mMovimiento = await service.update(id, body);
      res.json(mMovimiento);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getMmovimientosSchema, 'params'),
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
