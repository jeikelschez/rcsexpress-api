const express = require('express');

const RpermisosService = require('../services/rolesPermisos.service');
const authenticateJWT  = require('../middlewares/authenticate.handler');

const router = express.Router();
const service = new RpermisosService();

router.get('/',
  authenticateJWT,
  async (req, res, next) => {
  try {
    const { rol, menu, accion } = req.headers;
    const rpermisos = await service.find(rol, menu, accion);
    res.json(rpermisos);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
