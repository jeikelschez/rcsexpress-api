const Joi = require('joi');

const id = Joi.number().integer();
const cod_pais = Joi.number().integer();
const desc_estado = Joi.string().min(3).max(50);
const siglas = Joi.string().min(1).max(4);
const iso_3166 = Joi.string().min(1).max(4);

const createEstadoSchema = Joi.object({
  cod_pais: cod_pais.required(),
  desc_estado: desc_estado.required(),
  siglas: siglas.allow(null, ''),
  iso_3166: iso_3166.allow(null, '')
});

const updateEstadoSchema = Joi.object({
  cod_pais: cod_pais,
  desc_estado: desc_estado,
  siglas: siglas.allow(null, ''),
  iso_3166: iso_3166.allow(null, '')
});

const getEstadoSchema = Joi.object({
  id: id.required(),
});

module.exports = { createEstadoSchema, updateEstadoSchema, getEstadoSchema }
