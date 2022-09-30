const Joi = require('joi');

const fecha = Joi.date();
const valor = Joi.number().precision(2);

const createHdolarSchema = Joi.object({
  fecha: fecha.required(),
  valor: valor.required()
});

const updateHdolarSchema = Joi.object({
  fecha: fecha,
  valor: valor
});

const getHdolarSchema = Joi.object({
  fecha: fecha.required(),
});

module.exports = { createHdolarSchema, updateHdolarSchema, getHdolarSchema }
