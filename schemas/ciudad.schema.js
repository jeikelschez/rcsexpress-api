const Joi = require('joi');

const id = Joi.number().integer();
const cod_estado = Joi.number().integer();
const desc_ciudad = Joi.string().min(3).max(50);
const siglas = Joi.string().min(1).max(4);
const check_urbano = Joi.string().max(1);
const cod_region = Joi.string().min(1).max(2);

const createCiudadSchema = Joi.object({
  cod_estado: cod_estado.required(),
  desc_ciudad: desc_ciudad.required(),
  siglas: siglas.allow(null, ''),
  check_urbano: check_urbano.allow(null, ''),
  cod_region: cod_region.allow(null, '')
});

const updateCiudadSchema = Joi.object({
  id: id,
  cod_estado: cod_estado,
  desc_ciudad: desc_ciudad,
  siglas: siglas.allow(null, ''),
  check_urbano: check_urbano.allow(null, ''),
  cod_region: cod_region.allow(null, '')
});

const getCiudadSchema = Joi.object({
  id: id.required(),
});

module.exports = { createCiudadSchema, updateCiudadSchema, getCiudadSchema }
