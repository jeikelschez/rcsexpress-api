const express = require('express');

const PaisesService = require('./../services/paises.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createPaisesSchema, updatePaisesSchema, getPaisesSchema } = require('./../schemas/paises.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new PaisesService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const paises = await service.find();
    res.json(paises);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getPaisesSchema, 'params'),
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
  authenticateJWT,
  validatorHandler(getPaisesSchema, 'params'),
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
  authenticateJWT,
  validatorHandler(createPaisesSchema, 'body'),
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
  authenticateJWT,
  validatorHandler(getPaisesSchema, 'params'),
  validatorHandler(updatePaisesSchema, 'body'),
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
  authenticateJWT,
  validatorHandler(getPaisesSchema, 'params'),
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
