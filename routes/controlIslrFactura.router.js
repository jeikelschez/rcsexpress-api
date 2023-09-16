const express = require('express');

const CislrfacService = require('./../services/controlIslrFactura.service');
const validatorHandler = require('./../middlewares/validator.handler');
const {
  createCislrfacSchema,
  updateCislrfacSchema,
  getCislrfacSchema,
} = require('./../schemas/controlIslrFactura.schema');
const authenticateJWT = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new CislrfacService();

router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const {
      page,
      limit,
      order_by,
      order_direction,
      filter,
      filter_value,
      cod_islr,
      desde,
      hasta,
      proveedor,
    } = req.headers;

    const cIslrfac = await service.find(
      page,
      limit,
      order_by,
      order_direction,
      filter,
      filter_value,
      cod_islr,
      desde,
      hasta,
      proveedor
    );
    res.json(cIslrfac);
  } catch (error) {
    next(error);
  }
});

router.get(
  '/:id',
  authenticateJWT,
  validatorHandler(getCislrfacSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const cIslrfac = await service.findOne(id);
      res.json(cIslrfac);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  authenticateJWT,
  validatorHandler(createCislrfacSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newCislrfac = await service.create(body);
      res.status(201).json(newCislrfac);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  authenticateJWT,
  validatorHandler(getCislrfacSchema, 'params'),
  validatorHandler(updateCislrfacSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const cIslrfac = await service.update(id, body);
      res.json(cIslrfac);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  authenticateJWT,
  validatorHandler(getCislrfacSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.delete(id);
      res.status(201).json({ id });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
