const express = require('express');

const CostosService = require('../services/costosTransporte.service');
const validatorHandler = require('../middlewares/validator.handler');
const {
  createCostosSchema,
  updateCostosSchema,
  getCostosSchema,
} = require('../schemas/costosTransporte.schema');
const authenticateJWT = require('../middlewares/authenticate.handler');

const router = express.Router();
const service = new CostosService();

router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const {
      page,
      limit,
      order_by,
      order_direction,
      filter,
      filter_value,
      agencia,
      desde,
      hasta,
      order_doc
    } = req.headers;
    const costos = await service.find(
      page,
      limit,
      order_by,
      order_direction,
      filter,
      filter_value,
      agencia,
      desde,
      hasta,
      order_doc
    );
    res.json(costos);
  } catch (error) {
    next(error);
  }
});

router.get(
  '/:id',
  authenticateJWT,
  validatorHandler(getCostosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const costo = await service.findOne(id);
      res.json(costo);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  authenticateJWT,
  validatorHandler(createCostosSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newCosto = await service.create(body);
      res.status(201).json(newCosto);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  authenticateJWT,
  validatorHandler(getCostosSchema, 'params'),
  validatorHandler(updateCostosSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const costo = await service.update(id, body);
      res.json(costo);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  authenticateJWT,
  validatorHandler(getCostosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.delete(id);
      res.status(201).json({ id });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
