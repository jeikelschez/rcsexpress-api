const express = require('express');

const BancoService = require('./../services/banco.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createBancoSchema, updateBancoSchema, getBancoSchema } = require('./../schemas/banco.schema');

const router = express.Router();
const service = new BancoService();

router.get('/', async (req, res, next) => {
  try {
    const bancos = await service.find();
    res.json(bancos);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  validatorHandler(getBancoSchema, 'params'),
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
  validatorHandler(createBancoSchema, 'body'),
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
  validatorHandler(getBancoSchema, 'params'),
  validatorHandler(updateBancoSchema, 'body'),
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
  validatorHandler(getBancoSchema, 'params'),
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
