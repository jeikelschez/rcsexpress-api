const Joi = require('joi');

const id = Joi.number().integer();
const descripcion = Joi.string().min(3).max(30);
const cod_agencia = Joi.number().integer();

const createRolesSchema = Joi.object({
  cod_agencia: cod_agencia.required(),
  descripcion: descripcion.required()
});

const updateRolesSchema = Joi.object({
  id: id,
  cod_agencia: cod_agencia,
  descripcion: descripcion
});

const getRolesSchema = Joi.object({
  id: id.required(),
});

module.exports = { createRolesSchema, updateRolesSchema, getRolesSchema }
