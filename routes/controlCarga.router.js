const express = require('express');

const ControlCargaService = require('./../services/controlCarga.service');
const authenticateJWT = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new ControlCargaService();

const getUsuario = (req) => {
  try {
    return req.user && req.user.usuario ? req.user.usuario.nombre : null;
  } catch (e) {
    return null;
  }
};

router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const { agencia, estado } = req.headers;
    const cargas = await service.find(agencia, estado);
    res.json(cargas);
  } catch (error) {
    next(error);
  }
});

router.get('/resolver/:codigo', authenticateJWT, async (req, res, next) => {
  try {
    const { codigo } = req.params;
    const data = await service.resolver(codigo);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateJWT, async (req, res, next) => {
  try {
    const { id } = req.params;
    const carga = await service.findOne(id);
    res.json(carga);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateJWT, async (req, res, next) => {
  try {
    const body = { ...req.body, usuario: req.body.usuario || getUsuario(req) };
    const nueva = await service.create(body);
    res.status(201).json(nueva);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/bulto', authenticateJWT, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { codigo } = req.body;
    const data = await service.addBulto(id, codigo, getUsuario(req));
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/esperado', authenticateJWT, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nroGuia } = req.body;
    const data = await service.addEsperado(id, nroGuia);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/bulto/:bultoId', authenticateJWT, async (req, res, next) => {
  try {
    const { id, bultoId } = req.params;
    const data = await service.deleteBulto(id, bultoId, getUsuario(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/cerrar', authenticateJWT, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const carga = await service.cerrar(id, estado, getUsuario(req));
    res.json(carga);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateJWT, async (req, res, next) => {
  try {
    const { id } = req.params;
    const carga = await service.update(id, req.body);
    res.json(carga);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateJWT, async (req, res, next) => {
  try {
    const { id } = req.params;
    await service.delete(id, getUsuario(req));
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
