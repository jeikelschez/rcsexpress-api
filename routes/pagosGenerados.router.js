const express = require('express');

const PgeneradosService = require('./../services/pagosGenerados.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createPgeneradosSchema, updatePgeneradosSchema, getPgeneradosSchema } = require('./../schemas/pagosGenerados.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new PgeneradosService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { page, limit, order_by, order_direction, filter, filter_value, cod_cta_pagar } = req.headers;

    const pGenerados = await service.find(page, limit, order_by, order_direction, filter, filter_value, cod_cta_pagar);
    res.json(pGenerados);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getPgeneradosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const pGenerado = await service.findOne(id);
      res.json(pGenerado);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticateJWT,
  validatorHandler(createPgeneradosSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newPgenerado = await service.create(body);
      res.status(201).json(newPgenerado);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getPgeneradosSchema, 'params'),
  validatorHandler(updatePgeneradosSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const pGenerado = await service.update(id, body);
      res.json(pGenerado);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getPgeneradosSchema, 'params'),
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
