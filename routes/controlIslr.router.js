const express = require('express');

const CislrService = require('./../services/controlIslr.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createCislrSchema, updateCislrSchema, getCislrSchema } = require('./../schemas/controlIslr.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new CislrService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { page, limit, order_by, order_direction, filter, filter_value } = req.headers;

    const cIslr = await service.find(page, limit, order_by, order_direction, filter, filter_value);
    res.json(cIslr);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getCislrSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const cIslr = await service.findOne(id);
      res.json(cIslr);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createCislrSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newCislr = await service.create(body);
      res.status(201).json(newCislr);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getCislrSchema, 'params'),
  validatorHandler(updateCislrSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const cIslr = await service.update(id, body);
      res.json(cIslr);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getCislrSchema, 'params'),
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
