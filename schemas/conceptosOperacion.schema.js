const Joi = require('joi');

const id = Joi.number().integer();
const desc_concepto = Joi.string().min(3).max(100);
const tipo = Joi.number().integer();
const afecta_estado = Joi.string().max(1);

const createCoperacionSchema = Joi.object({
  desc_concepto: desc_concepto.required(),
  tipo: tipo.required(),
  afecta_estado: afecta_estado.required()
});

const updateCoperacionSchema = Joi.object({
  id: id,
  desc_concepto: desc_concepto,
  tipo: tipo,
  afecta_estado: afecta_estado
});

const getCoperacionSchema = Joi.object({
  id: id.required(),
});

module.exports = { createCoperacionSchema, updateCoperacionSchema, getCoperacionSchema }
