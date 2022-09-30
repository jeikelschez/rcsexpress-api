const Joi = require('joi');

const id = Joi.number().integer();

const cod_agencia = Joi.number().integer();
const cod_agente = Joi.number().integer();
const cod_movimiento = Joi.number().integer();
const fecha_emision = Joi.date();
const tipo_comision = Joi.string().max(1);
const monto_comision = Joi.number().precision(2);
const estatus = Joi.number().integer();
const cod_cuenta = Joi.number().integer();
const nro_cheque = Joi.number().precision(0);

const createCcomisionesSchema = Joi.object({
  cod_agencia: cod_agencia.required(),
  cod_agente: cod_agente.required(),
  cod_movimiento: cod_movimiento.required(),
  fecha_emision: fecha_emision.required(),
  tipo_comision: tipo_comision.required(),
  monto_comision: monto_comision.required(),
  estatus: estatus.required(),
  cod_cuenta: cod_cuenta.allow(null, ''),
  nro_cheque: nro_cheque.allow(null, '')
});

const updateCcomisionesSchema = Joi.object({
  id: id,
  cod_agencia: cod_agencia,
  cod_agente: cod_agente,
  cod_movimiento: cod_movimiento,
  fecha_emision: fecha_emision,
  tipo_comision: tipo_comision,
  monto_comision: monto_comision,
  estatus: estatus,
  cod_cuenta: cod_cuenta.allow(null, ''),
  nro_cheque: nro_cheque.allow(null, '')
});

const getCcomisionesSchema = Joi.object({
  id: id.required(),
});

module.exports = { createCcomisionesSchema, updateCcomisionesSchema, getCcomisionesSchema }
