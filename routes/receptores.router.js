const express = require('express');

const ReceptoresService = require('./../services/receptores.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createReceptoresSchema, updateReceptoresSchema, getReceptoresSchema } = require('./../schemas/receptores.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new ReceptoresService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { activo } = req.headers;
    const receptores = await service.find(activo);
    res.json(receptores);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getReceptoresSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const receptor = await service.findOne(id);
      res.json(receptor);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createReceptoresSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newReceptor = await service.create(body);
      res.status(201).json(newReceptor);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getReceptoresSchema, 'params'),
  validatorHandler(updateReceptoresSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const receptor = await service.update(id, body);
      res.json(receptor);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getReceptoresSchema, 'params'),
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
