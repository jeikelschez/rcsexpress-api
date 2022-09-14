const express = require('express');

const AccionesService = require('../services/menusAcciones.service');
const authenticateJWT  = require('../middlewares/authenticate.handler');

const router = express.Router();
const service = new AccionesService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const menu = req.headers.menu;
    const acciones = await service.find(menu);
    res.json(acciones);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
