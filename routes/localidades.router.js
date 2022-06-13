const express = require('express');

const LocalidadesService = require('./../services/localidades.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { getLocalidadesSchema } = require('./../schemas/localidades.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new LocalidadesService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const estado = req.headers.estado;
    const localidades = await service.find(estado);
    res.json(localidades);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getLocalidadesSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const localidad = await service.findOne(id);
      res.json(localidad);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
