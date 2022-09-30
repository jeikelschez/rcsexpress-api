const express = require('express');

const HdolarService = require('../services/historicoDolar.service');
const validatorHandler = require('../middlewares/validator.handler');
const { createHdolarSchema, updateHdolarSchema, getHdolarSchema } = require('../schemas/historicoDolar.schema');
const authenticateJWT  = require('../middlewares/authenticate.handler');

const router = express.Router();
const service = new HdolarService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { page, limit, order_by, order_direction, filter, filter_value, fecha } = req.headers;
    const hdolar = await service.find(page, limit, order_by, order_direction, filter, filter_value, fecha);
    res.json(hdolar);
  } catch (error) {
    next(error);
  }
});

router.get('/:fecha',
  authenticateJWT,
  validatorHandler(getHdolarSchema, 'params'),
  async (req, res, next) => {
    try {
      const { fecha } = req.params;
      const hdolar = await service.findOne(fecha);
      res.json(hdolar);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createHdolarSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newHdolar = await service.create(body);
      res.status(201).json(newHdolar);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:fecha',
  authenticateJWT,
  validatorHandler(getHdolarSchema, 'params'),
  validatorHandler(updateHdolarSchema, 'body'),
  async (req, res, next) => {
    try {
      const { fecha } = req.params;
      const body = req.body;
      const hdolar = await service.update(fecha, body);
      res.json(hdolar);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:fecha',
  authenticateJWT,
  validatorHandler(getHdolarSchema, 'params'),
  async (req, res, next) => {
    try {
      const { fecha } = req.params;
      await service.delete(fecha);
      res.status(201).json({fecha});
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
