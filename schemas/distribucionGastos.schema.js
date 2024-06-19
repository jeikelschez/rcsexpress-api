const Joi = require('joi');

const id = Joi.number().integer();
const cod_cta_pagar = Joi.number().integer();
const cod_agencia = Joi.number().integer();
const cod_concepto = Joi.number().integer();
const tipo_concepto = Joi.string().min(1).max(3);
const monto_distribuido = Joi.number().precision(2);

const createDgastosSchema = Joi.object({
  cod_cta_pagar: cod_cta_pagar.required(),
  cod_agencia: cod_agencia.required(),
  cod_concepto: cod_concepto.required(),
  tipo_concepto: tipo_concepto.required(),
  monto_distribuido: monto_distribuido.allow(null, ''),
});

const updateDgastosSchema = Joi.object({
  id: id,
  cod_cta_pagar: cod_cta_pagar,
  cod_agencia: cod_agencia,
  cod_concepto: cod_concepto,
  tipo_concepto: tipo_concepto,
  monto_distribuido: monto_distribuido.allow(null, ''),
});

const getDgastosSchema = Joi.object({
  id: id.required(),
});

module.exports = { createDgastosSchema, updateDgastosSchema, getDgastosSchema }
