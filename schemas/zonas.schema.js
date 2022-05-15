const Joi = require('joi');

const id = Joi.number().integer();
const nb_zona = Joi.string().min(3).max(250);
const tipo_zona = Joi.string().max(1);
const cod_agencia = Joi.number().integer();

const createZonasSchema = Joi.object({
  cod_agencia: cod_agencia.required(),
  nb_zona: nb_zona.required(),
  tipo_zona: tipo_zona.required()
});

const updateZonasSchema = Joi.object({
  id: id,
  cod_agencia: cod_agencia,
  nb_zona: nb_zona,
  tipo_zona: tipo_zona
});

const getZonasSchema = Joi.object({
  id: id.required(),
});

module.exports = { createZonasSchema, updateZonasSchema, getZonasSchema }
