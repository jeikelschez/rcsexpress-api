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

router.get('/:cod_banco',
  validatorHandler(getBancoSchema, 'params'),
  async (req, res, next) => {
    try {
      const { cod_banco } = req.params;
      const banco = await service.findOne(cod_banco);
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

router.put('/:cod_banco',
  validatorHandler(getBancoSchema, 'params'),
  validatorHandler(updateBancoSchema, 'body'),
  async (req, res, next) => {
    try {
      const { cod_banco } = req.params;
      const body = req.body;
      const banco = await service.update(cod_banco, body);
      res.json(banco);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:cod_banco',
  validatorHandler(getBancoSchema, 'params'),
  async (req, res, next) => {
    try {
      const { cod_banco } = req.params;
      await service.delete(cod_banco);
      res.status(201).json({cod_banco});
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
