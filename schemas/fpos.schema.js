const Joi = require('joi');

const id = Joi.number().integer();
const cod_fpo = Joi.string().min(2).max(5);
const desc_tipo = Joi.string().min(3).max(40);
const valor = Joi.number().precision(2);
const f_val = Joi.date();
const f_anul = Joi.date();
const peso_inicio = Joi.number().precision(2);
const peso_fin = Joi.number().precision(2);

const createFposSchema = Joi.object({
  cod_fpo: cod_fpo.required(),
  desc_tipo: desc_tipo.required(),
  valor: valor.required(),
  f_val: f_val.required(),
  f_anul: f_anul.required(),
  peso_inicio: peso_inicio.allow(null, ''),
  peso_fin: peso_fin.allow(null, '')
});

const updateFposSchema = Joi.object({
  id: id,
  cod_fpo: cod_fpo,
  desc_tipo: desc_tipo,
  valor: valor,
  f_val: f_val,
  f_anul: f_anul,
  peso_inicio: peso_inicio.allow(null, ''),
  peso_fin: peso_fin.allow(null, '')
});

const getFposSchema = Joi.object({
  id: id.required(),
});

module.exports = { createFposSchema, updateFposSchema, getFposSchema }
