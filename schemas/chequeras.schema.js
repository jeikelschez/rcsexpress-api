const Joi = require('joi');

const id = Joi.number().integer();
const cod_cuenta = Joi.number().integer();
const nro_chequera = Joi.number().precision(0);
const primer_cheque = Joi.number().precision(0);
const ultimo_cheque = Joi.number().precision(0);
const ultimo_cheque_asignado = Joi.number().precision(0);
const estatus_chequera = Joi.string().max(1);

const createChequerasSchema = Joi.object({
  cod_cuenta: cod_cuenta.required(),
  nro_chequera: nro_chequera.required(),
  primer_cheque: primer_cheque.allow(null, ''),
  ultimo_cheque: ultimo_cheque.allow(null, ''),
  ultimo_cheque_asignado: ultimo_cheque_asignado.allow(null, ''),
  estatus_chequera: estatus_chequera.allow(null, '')
});

const updateChequerasSchema = Joi.object({
  id: id,
  cod_cuenta: cod_cuenta,
  nro_chequera: nro_chequera,
  primer_cheque: primer_cheque.allow(null, ''),
  ultimo_cheque: ultimo_cheque.allow(null, ''),
  ultimo_cheque_asignado: ultimo_cheque_asignado.allow(null, ''),
  estatus_chequera: estatus_chequera.allow(null, '')
});

const getChequerasSchema = Joi.object({
  id: id.required()
});

module.exports = { createChequerasSchema, updateChequerasSchema, getChequerasSchema }
