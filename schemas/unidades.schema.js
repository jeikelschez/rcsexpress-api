const Joi = require('joi');

const id = Joi.number().integer();
const placas = Joi.string().min(3).max(10);
const descripcion = Joi.string().min(3).max(100);
const chofer = Joi.string().min(3).max(30);

const createUnidadesSchema = Joi.object({
  placas: placas.required(),
  descripcion: descripcion.required(),
  chofer: chofer.allow(null, '')
});

const updateUnidadesSchema = Joi.object({
  id: id,
  placas: placas,
  descripcion: descripcion,
  chofer: chofer.allow(null, '')
});

const getUnidadesSchema = Joi.object({
  id: id.required(),
});

module.exports = { createUnidadesSchema, updateUnidadesSchema, getUnidadesSchema }
