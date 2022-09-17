const express = require('express');

const MunicipiosService = require('./../services/municipios.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { getMunicipiosSchema } = require('./../schemas/municipios.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new MunicipiosService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { page, limit, order_by, order_direction, filter, filter_value, estado } = req.headers;
    const municipios = await service.find(page, limit, order_by, order_direction, filter, filter_value, estado);
    res.json(municipios);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getMunicipiosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const municipio = await service.findOne(id);
      res.json(municipio);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
