const Joi = require('joi');

const id = Joi.number().integer();
const desc_concepto = Joi.string().min(3).max(100);
const cod_concepto = Joi.number().integer();
const check_comision = Joi.number().precision(0);
const check_impuesto = Joi.number().precision(0);

const createCfacturacionSchema = Joi.object({
  desc_concepto: desc_concepto.required(),
  cod_concepto: cod_concepto.required(),
  check_comision: check_comision.required(),
  check_impuesto: check_impuesto.required()
});

const updateCfacturacionSchema = Joi.object({
  id: id,
  desc_concepto: desc_concepto,
  cod_concepto: cod_concepto,
  check_comision: check_comision,
  check_impuesto: check_impuesto
});

const getCfacturacionSchema = Joi.object({
  id: id.required(),
});

module.exports = { createCfacturacionSchema, updateCfacturacionSchema, getCfacturacionSchema }
