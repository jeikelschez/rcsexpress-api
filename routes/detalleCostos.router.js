const express = require('express');

const DcostosService = require('../services/detalleCostos.service');
const validatorHandler = require('../middlewares/validator.handler');
const {
  createDcostosSchema,
  updateDcostosSchema,
  getDcostosSchema,
} = require('../schemas/detalleCostos.schema');
const authenticateJWT = require('../middlewares/authenticate.handler');

const router = express.Router();
const service = new DcostosService();

router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const {
      page,
      limit,
      order_by,
      order_direction,
      filter,
      filter_value,
      cod_costo,
    } = req.headers;
    const dCostos = await service.find(
      page,
      limit,
      order_by,
      order_direction,
      filter,
      filter_value,
      cod_costo
    );
    res.json(dCostos);
  } catch (error) {
    next(error);
  }
});

router.get(
  '/:id',
  authenticateJWT,
  validatorHandler(getDcostosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const dCosto = await service.findOne(id);
      res.json(dCosto);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  authenticateJWT,
  validatorHandler(createDcostosSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newDcosto = await service.create(body);
      res.status(201).json(newDcosto);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  authenticateJWT,
  validatorHandler(getDcostosSchema, 'params'),
  validatorHandler(updateDcostosSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const dCosto = await service.update(id, body);
      res.json(dCosto);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  authenticateJWT,
  validatorHandler(getDcostosSchema, 'params'),
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
