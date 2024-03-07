const express = require('express');

const DcostosgService = require('../services/detalleCostosGuias.service');
const validatorHandler = require('../middlewares/validator.handler');
const {
  createDcostosgSchema,
  updateDcostosgSchema,
  getDcostosgSchema,
} = require('../schemas/detalleCostosGuias.schema');
const authenticateJWT = require('../middlewares/authenticate.handler');

const router = express.Router();
const service = new DcostosgService();

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
      cod_movimiento,
    } = req.headers;
    const dCostosg = await service.find(
      page,
      limit,
      order_by,
      order_direction,
      filter,
      filter_value,
      cod_costo,
      cod_movimiento
    );
    res.json(dCostosg);
  } catch (error) {
    next(error);
  }
});

router.get(
  '/:id',
  authenticateJWT,
  validatorHandler(getDcostosgSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const dCostog = await service.findOne(id);
      res.json(dCostog);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  authenticateJWT,
  validatorHandler(createDcostosgSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newDcostog = await service.create(body);
      res.status(201).json(newDcostog);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  authenticateJWT,
  validatorHandler(getDcostosgSchema, 'params'),
  validatorHandler(updateDcostosgSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const dCostog = await service.update(id, body);
      res.json(dCostog);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  authenticateJWT,
  validatorHandler(getDcostosgSchema, 'params'),
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
