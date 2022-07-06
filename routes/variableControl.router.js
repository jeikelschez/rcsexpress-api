const express = require('express');

const VcontrolService = require('./../services/variableControl.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createVcontrolSchema, updateVcontrolSchema, getVcontrolSchema } = require('./../schemas/variableControl.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new VcontrolService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const variables = await service.find();
    res.json(variables);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getVcontrolSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const variable = await service.findOne(id);
      res.json(variable);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createVcontrolSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newVariable = await service.create(body);
      res.status(201).json(newVariable);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getVcontrolSchema, 'params'),
  validatorHandler(updateVcontrolSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const variable = await service.update(id, body);
      res.json(variable);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getVcontrolSchema, 'params'),
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
