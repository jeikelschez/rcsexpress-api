const express = require('express');

const GinutilizadasService = require('./../services/guiasInutilizadas.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createGinutilizadasSchema, updateGinutilizadasSchema, getGinutilizadasSchema } = require('./../schemas/guiasInutilizadas.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new GinutilizadasService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { page, limit, order_by, order_direction, filter, filter_value, agencia, tipo, nro_guia } = req.headers;
    const gInutilizadas = await service.find(page, limit, order_by, order_direction, filter, filter_value, agencia, tipo, nro_guia);
    res.json(gInutilizadas);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getGinutilizadasSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const gInutilizada = await service.findOne(id);
      res.json(gInutilizada);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createGinutilizadasSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newGinutilizada = await service.create(body);
      res.status(201).json(newGinutilizada);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getGinutilizadasSchema, 'params'),
  validatorHandler(updateGinutilizadasSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const gInutilizada = await service.update(id, body);
      res.json(gInutilizada);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getGinutilizadasSchema, 'params'),
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
