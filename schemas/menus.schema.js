const Joi = require('joi');

const name = Joi.string().min(3).max(100);

const getMenusSchema = Joi.object({
  name: name.required()
});

module.exports = { getMenusSchema }
