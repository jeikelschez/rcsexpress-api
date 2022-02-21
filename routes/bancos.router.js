const express = require('express');

const BancosService = require('./../services/bancos.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createBancosSchema, updateBancosSchema, getBancosSchema } = require('./../schemas/bancos.schema');

const router = express.Router();
const service = new BancosService();

router.get('/', async (req, res, next) => {
  try {
    const bancos = await service.find();
    res.json(bancos);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  validatorHandler(getBancosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const banco = await service.findOne(id);
      res.json(banco);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  validatorHandler(createBancosSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newBanco = await service.create(body);
      res.status(201).json(newBanco);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  validatorHandler(getBancosSchema, 'params'),
  validatorHandler(updateBancosSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const banco = await service.update(id, body);
      res.json(banco);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  validatorHandler(getBancosSchema, 'params'),
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
