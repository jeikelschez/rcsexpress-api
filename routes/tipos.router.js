const express = require('express');

const TiposService = require('./../services/tipos.service');
const validatorHandler = require('./../middlewares/validator.handler');
const authenticateJWT = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new TiposService();

router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const fuente = req.headers.fuente;
    const codigo = req.headers.codigo;
    const tipos = await service.find(fuente, codigo);
    res.json(tipos);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
