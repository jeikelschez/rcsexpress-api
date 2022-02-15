const express = require('express');

const PaisService = require('./../services/pais.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createPaisSchema, updatePaisSchema, getPaisSchema } = require('./../schemas/pais.schema');

const router = express.Router();
const service = new PaisService();

router.get('/', async (req, res, next) => {
  try {
    const paises = await service.find();
    res.json(paises);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  validatorHandler(getPaisSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const pais = await service.findOne(id);
      res.json(pais);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id/estados',
  validatorHandler(getPaisSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const estado = await service.findOneEstados(id);
      res.json(estado);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  validatorHandler(createPaisSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newPais = await service.create(body);
      res.status(201).json(newPais);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  validatorHandler(getPaisSchema, 'params'),
  validatorHandler(updatePaisSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const pais = await service.update(id, body);
      res.json(pais);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  validatorHandler(getPaisSchema, 'params'),
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
