const Joi = require('joi');

const id = Joi.number().integer();
const cod_costo = Joi.number().integer();
const cod_concepto = Joi.number().integer();
const monto_costo = Joi.number().precision(2);

const createDcostosSchema = Joi.object({
  cod_costo: cod_costo.required(),
  cod_concepto: cod_concepto.required(),
  monto_costo: monto_costo.required(),
});

const updateDcostosSchema = Joi.object({
  id: id,
  cod_costo: cod_costo,
  cod_concepto: cod_concepto,
  monto_costo: monto_costo,
});

const getDcostosSchema = Joi.object({
  id: id.required(),
});

module.exports = {
  createDcostosSchema,
  updateDcostosSchema,
  getDcostosSchema,
};
