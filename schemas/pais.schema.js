const Joi = require('joi');

const id = Joi.number().integer();
const desc_pais = Joi.string().min(3).max(50);
const tipo_pais = Joi.string().max(1);

const createPaisSchema = Joi.object({
  desc_pais: desc_pais.required(),
  tipo_pais: tipo_pais.required()
});

const updatePaisSchema = Joi.object({
  desc_pais: desc_pais.required(),
  tipo_pais: tipo_pais.required()
});

const getPaisSchema = Joi.object({
  id: id.required(),
});

module.exports = { createPaisSchema, updatePaisSchema, getPaisSchema }
