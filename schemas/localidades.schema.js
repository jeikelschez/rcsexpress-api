const Joi = require('joi');

const id = Joi.number().integer();

const getLocalidadesSchema = Joi.object({
  id: id.required()
});

module.exports = { getLocalidadesSchema }
