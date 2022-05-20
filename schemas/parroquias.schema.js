const Joi = require('joi');

const id = Joi.number().integer();

const getParroquiasSchema = Joi.object({
  id: id.required()
});

module.exports = { getParroquiasSchema }
