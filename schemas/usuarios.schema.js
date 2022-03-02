const Joi = require('joi');

const login = Joi.string().min(3).max(12);
const password = Joi.string().min(3).max(10);
const cod_agencia = Joi.number().integer();
const cod_rol = Joi.number().integer();
const nombre = Joi.string().min(3).max(50);
const activo = Joi.string().max(1);

const createUsuariosSchema = Joi.object({
  login: login.required(),
  password: password.required(),
  cod_agencia: cod_agencia.required(),
  cod_rol: cod_rol.required(),
  nombre: nombre.required(),
  activo: activo.required()
});

const updateUsuariosSchema = Joi.object({
  login: login,
  password: password,
  cod_agencia: cod_agencia,
  cod_rol: cod_rol,
  nombre: nombre,
  activo: activo
});

const getUsuariosSchema = Joi.object({
  login: login.required(),
});

module.exports = { createUsuariosSchema, updateUsuariosSchema, getUsuariosSchema }
