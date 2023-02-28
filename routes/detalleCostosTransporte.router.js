const express = require('express');

const DcostostService = require('../services/detalleCostosTransporte.service');
const validatorHandler = require('../middlewares/validator.handler');
const {
  createDcostostSchema,
  updateDcostostSchema,
  getDcostostSchema,
} = require('../schemas/detalleCostosTransporte.schema');
const authenticateJWT = require('../middlewares/authenticate.handler');

const router = express.Router();
const service = new DcostostService();

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
    const dCostost = await service.find(
      page,
      limit,
      order_by,
      order_direction,
      filter,
      filter_value,
      cod_costo
    );
    res.json(dCostost);
  } catch (error) {
    next(error);
  }
});

router.get(
  '/:id',
  authenticateJWT,
  validatorHandler(getDcostostSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const dCostot = await service.findOne(id);
      res.json(dCostot);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  authenticateJWT,
  validatorHandler(createDcostostSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newDcostot = await service.create(body);
      res.status(201).json(newDcostot);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  authenticateJWT,
  validatorHandler(getDcostostSchema, 'params'),
  validatorHandler(updateDcostostSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const dCostot = await service.update(id, body);
      res.json(dCostot);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  authenticateJWT,
  validatorHandler(getDcostostSchema, 'params'),
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
