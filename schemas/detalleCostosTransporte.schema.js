const Joi = require('joi');

const id = Joi.number().integer();
const cod_costo = Joi.number().integer();
const cod_movimiento = Joi.number().integer();

const createDcostostSchema = Joi.object({
  cod_costo: cod_costo.required(),
  cod_movimiento: cod_movimiento.required(),
});

const updateDcostostSchema = Joi.object({
  id: id,
  cod_costo: cod_costo,
  cod_movimiento: cod_movimiento,
});

const getDcostostSchema = Joi.object({
  id: id.required(),
});

module.exports = {
  createDcostostSchema,
  updateDcostostSchema,
  getDcostostSchema,
};
