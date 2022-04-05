const Joi = require('joi');

const codigo = Joi.string().min(3).max(25);
const descripcion = Joi.string().min(3).max(50);

const createObjetosSchema = Joi.object({
  codigo: codigo.required(),
  descripcion: descripcion.required()
});

const updateObjetosSchema = Joi.object({
  codigo: codigo,
  descripcion: descripcion
});

const getObjetosSchema = Joi.object({
  codigo: codigo.required(),
});

module.exports = { createObjetosSchema, updateObjetosSchema, getObjetosSchema }
