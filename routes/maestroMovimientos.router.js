const express = require('express');

const MmovimientosService = require('./../services/maestroMovimientos.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createMmovimientosSchema, updateMmovimientosSchema, getMmovimientosSchema } = require('./../schemas/maestroMovimientos.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new MmovimientosService();

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
