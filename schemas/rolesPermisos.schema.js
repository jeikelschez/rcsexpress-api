const Joi = require('joi');

const id = Joi.number().integer();
const cod_rol = Joi.number().integer();
const cod_menu_accion = Joi.number().integer();

const createRpermisosSchema = Joi.object({
  cod_rol: cod_rol.required(),
  cod_menu_accion: cod_menu_accion.required()
});

const getRpermisosSchema = Joi.object({
  id: id.required(),
});

module.exports = { createRpermisosSchema, getRpermisosSchema }
