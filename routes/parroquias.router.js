const express = require('express');

const ParroquiasService = require('./../services/parroquias.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { getParroquiasSchema } = require('./../schemas/parroquias.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new ParroquiasService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const parroquias = await service.find();
    res.json(parroquias);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getParroquiasSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const parroquia = await service.findOne(id);
      res.json(parroquia);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;