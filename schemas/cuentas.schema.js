const Joi = require('joi');

const id = Joi.number().integer();
const nro_cuenta = Joi.string().min(3).max(25);
const tipo_cuenta = Joi.string().max(1);
const firma_autorizada = Joi.string().min(3).max(50);
const flag_activa = Joi.string().max(1);
const cod_banco = Joi.number().integer();

const createCuentasSchema = Joi.object({
  cod_banco: cod_banco.required(),
  nro_cuenta: nro_cuenta.required(),
  tipo_cuenta: tipo_cuenta.allow(null, ''),
  firma_autorizada: firma_autorizada.allow(null, ''),
  flag_activa: flag_activa.allow(null, '')
});

const updateCuentasSchema = Joi.object({
  id: id,
  cod_banco: cod_banco,
  nro_cuenta: nro_cuenta,
  tipo_cuenta: tipo_cuenta.allow(null, ''),
  firma_autorizada: firma_autorizada.allow(null, ''),
  flag_activa: flag_activa.allow(null, '')
});

const getCuentasSchema = Joi.object({
  id: id.required(),
});

module.exports = { createCuentasSchema, updateCuentasSchema, getCuentasSchema }
