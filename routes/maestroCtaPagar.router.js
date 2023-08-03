const express = require('express');

const MctapagarService = require('./../services/maestroCtaPagar.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createMctapagarSchema, updateMctapagarSchema, getMctapagarSchema } = require('./../schemas/maestroCtaPagar.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new MctapagarService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { page, limit, order_by, order_direction, filter, filter_value } = req.headers;
    const mCtapagar = await service.find(page, limit, order_by, order_direction, filter, filter_value);
    res.json(mCtapagar);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getMctapagarSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const mCtapagar = await service.findOne(id);
      res.json(mCtapagar);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createMctapagarSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newMctapagar = await service.create(body);
      res.status(201).json(newMctapagar);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getMctapagarSchema, 'params'),
  validatorHandler(updateMctapagarSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const mCtapagar = await service.update(id, body);
      res.json(mCtapagar);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getMctapagarSchema, 'params'),
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
