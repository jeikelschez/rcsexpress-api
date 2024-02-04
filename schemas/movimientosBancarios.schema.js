const Joi = require('joi');

const id = Joi.number().integer();
const cod_cuenta = Joi.number().integer();
const tipo_transaccion = Joi.string().max(1);
const fecha_movimiento = Joi.date();
const nro_documento = Joi.number().precision(0);
const tipo_documento = Joi.string().max(2);
const monto_movimiento = Joi.number().precision(2);
const observacion = Joi.string().min(3).max(1000);
const beneficiario = Joi.string().min(3).max(50);
const tipo_pago = Joi.string().max(3);

const createMbancariosSchema = Joi.object({
  cod_cuenta: cod_cuenta.required(),
  tipo_transaccion: tipo_transaccion.allow(null, ''),
  fecha_movimiento: fecha_movimiento.allow(null, ''),
  nro_documento: nro_documento.allow(null, ''),
  tipo_documento: tipo_documento.allow(null, ''),
  monto_movimiento: monto_movimiento.allow(null, ''),
  observacion: observacion.allow(null, ''),
  beneficiario: beneficiario.allow(null, ''),
  tipo_pago: tipo_pago.allow(null, '')
});

const updateMbancariosSchema = Joi.object({
  id: id,
  cod_cuenta: cod_cuenta,
  tipo_transaccion: tipo_transaccion.allow(null, ''),
  fecha_movimiento: fecha_movimiento.allow(null, ''),
  nro_documento: nro_documento.allow(null, ''),
  tipo_documento: tipo_documento.allow(null, ''),
  monto_movimiento: monto_movimiento.allow(null, ''),
  observacion: observacion.allow(null, ''),
  beneficiario: beneficiario.allow(null, ''),
  tipo_pago: tipo_pago.allow(null, '')
});

const getMbancariosSchema = Joi.object({
  id: id.required(),
});

module.exports = { createMbancariosSchema, updateMbancariosSchema, getMbancariosSchema }
