const Joi = require('joi');

const id = Joi.number().integer();
const cod_costo = Joi.number().integer();
const cod_movimiento = Joi.number().integer();

const createDcostosgSchema = Joi.object({
  cod_costo: cod_costo.required(),
  cod_movimiento: cod_movimiento.required(),
});

const updateDcostosgSchema = Joi.object({
  id: id,
  cod_costo: cod_costo,
  cod_movimiento: cod_movimiento,
});

const getDcostosgSchema = Joi.object({
  id: id.required(),
});

module.exports = {
  createDcostosgSchema,
  updateDcostosgSchema,
  getDcostosgSchema,
};
