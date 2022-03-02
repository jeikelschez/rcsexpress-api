const express = require('express');

const UsuariosService = require('./../services/usuarios.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createUsuariosSchema, updateUsuariosSchema, getUsuariosSchema } = require('./../schemas/usuarios.schema');

const router = express.Router();
const service = new UsuariosService();

router.get('/', async (req, res, next) => {
  try {
    const usuarios = await service.find();
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
});

router.get('/:login',
  validatorHandler(getUsuariosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { login } = req.params;
      const usuario = await service.findOne(login);
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  validatorHandler(createUsuariosSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newUsuario = await service.create(body);
      res.status(201).json(newUsuario);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:login',
  validatorHandler(getUsuariosSchema, 'params'),
  validatorHandler(updateUsuariosSchema, 'body'),
  async (req, res, next) => {
    try {
      const { login } = req.params;
      const body = req.body;
      const usuario = await service.update(login, body);
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:login',
  validatorHandler(getUsuariosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { login } = req.params;
      await service.delete(login);
      res.status(201).json({login});
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
