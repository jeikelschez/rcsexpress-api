const Joi = require('joi');

const id = Joi.number().integer();
const cod_cliente = Joi.number().integer();
const email = Joi.string().email();
const password = Joi.string().min(3).max(100);
const estatus = Joi.string().max(1);

const createCusuariosSchema = Joi.object({
  cod_cliente: cod_cliente.required(),
  email: email.required(),
  password: password.required(),
  estatus: estatus.required(),
});

const updateCusuariosSchema = Joi.object({
  id: id,
  cod_cliente: cod_cliente.required(),
  email: email.required(),
  password: password.required(),
  estatus: estatus.required()
});

const getCusuariosSchema = Joi.object({
  id: id.required(),
});

module.exports = { createCusuariosSchema, updateCusuariosSchema, getCusuariosSchema }
