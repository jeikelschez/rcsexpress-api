const Joi = require('joi');

const id = Joi.number().integer();
const cod_agencia = Joi.number().integer();
const nro_deposito = Joi.number().precision(2);
const fecha_deposito = Joi.date();
const monto_cobrado = Joi.number().precision(2);
const cod_cuenta = Joi.number().integer();
const monto_retenido = Joi.number().precision(2);
const monto_deposito = Joi.number().precision(2);
const ingreso_caja = Joi.number().precision(0);
const id_cobranza = Joi.number().precision(0);

const createMcobranzasSchema = Joi.object({
  cod_agencia: cod_agencia.required(),
  nro_deposito: nro_deposito.allow(null, ''),
  fecha_deposito: fecha_deposito.required(),
  monto_cobrado: monto_cobrado.required(),
  cod_cuenta: cod_cuenta.allow(null, ''),
  monto_retenido: monto_retenido.allow(null, ''),
  monto_deposito: monto_deposito.allow(null, ''),
  ingreso_caja: ingreso_caja.allow(null, ''),
  id_cobranza: id_cobranza.allow(null, '')
});

const updateMcobranzasSchema = Joi.object({
  id: id,
  cod_agencia: cod_agencia,
  nro_deposito: nro_deposito.allow(null, ''),
  fecha_deposito: fecha_deposito,
  monto_cobrado: monto_cobrado,
  cod_cuenta: cod_cuenta.allow(null, ''),
  monto_retenido: monto_retenido.allow(null, ''),
  monto_deposito: monto_deposito.allow(null, ''),
  ingreso_caja: ingreso_caja.allow(null, ''),
  id_cobranza: id_cobranza.allow(null, '')
});

const getMcobranzasSchema = Joi.object({
  id: id.required(),
});

module.exports = { createMcobranzasSchema, updateMcobranzasSchema, getMcobranzasSchema }
