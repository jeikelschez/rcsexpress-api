const Joi = require('joi');

const id = Joi.number().integer();
const nombre = Joi.string().min(3).max(50);
const tipo = Joi.number().integer();
const valor = Joi.string().min(3).max(100);

const createVcontrolSchema = Joi.object({
  nombre: nombre.required(),
  tipo: tipo.required(),
  valor: valor.required()
});

const updateVcontrolSchema = Joi.object({
  id: id,
  nombre: nombre.required(),
  tipo: tipo.required(),
  valor: valor.required()
});

const getVcontrolSchema = Joi.object({
  id: id.required(),
});

module.exports = { createVcontrolSchema, updateVcontrolSchema, getVcontrolSchema }
