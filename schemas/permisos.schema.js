const Joi = require('joi');

const id = Joi.number().integer();
const codigo = Joi.string().min(3).max(25);
const cod_rol = Joi.number().integer();

const createPermisosSchema = Joi.object({
  codigo: codigo.required(),
  cod_rol: cod_rol.required()
});

const updatePermisosSchema = Joi.object({
  id: id,
  codigo: codigo,
  cod_rol: cod_rol
});

const getPermisosSchema = Joi.object({
  id: id.required(),
});

module.exports = { createPermisosSchema, updatePermisosSchema, getPermisosSchema }
