const Joi = require('joi');

const id = Joi.number().integer();
const desc_pais = Joi.string().min(3).max(50);
const tipo_pais = Joi.string().max(1);

const createPaisesSchema = Joi.object({
  desc_pais: desc_pais.required(),
  tipo_pais: tipo_pais.required()
});

const updatePaisesSchema = Joi.object({
  id: id,
  desc_pais: desc_pais,
  tipo_pais: tipo_pais
});

const getPaisesSchema = Joi.object({
  id: id.required()
});

module.exports = { createPaisesSchema, updatePaisesSchema, getPaisesSchema }
