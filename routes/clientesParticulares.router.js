const express = require('express');

const CparticularesService = require('./../services/clientesParticulares.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createCparticularesSchema, updateCparticularesSchema, getCparticularesSchema } = require('./../schemas/clientesParticulares.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new CparticularesService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { page, limit, order_by, order_direction, filter, filter_value, agencia, rif } = req.headers;
    const cParticulares = await service.find(page, limit, order_by, order_direction, filter, filter_value, agencia, rif);
    res.json(cParticulares);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getCparticularesSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const cParticular = await service.findOne(id);
      res.json(cParticular);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createCparticularesSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newCparticular = await service.create(body);
      res.status(201).json(newCparticular);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getCparticularesSchema, 'params'),
  validatorHandler(updateCparticularesSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const cParticular = await service.update(id, body);
      res.json(cParticular);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getCparticularesSchema, 'params'),
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
