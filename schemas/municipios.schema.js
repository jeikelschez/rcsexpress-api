const Joi = require('joi');

const id = Joi.number().integer();

const getMunicipiosSchema = Joi.object({
  id: id.required()
});

module.exports = { getMunicipiosSchema }
