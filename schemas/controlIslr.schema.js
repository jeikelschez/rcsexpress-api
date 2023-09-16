const Joi = require('joi');

const id = Joi.number().integer();
const ano_ejercicio = Joi.number().precision(0);
const cod_tipo_retencion = Joi.string().max(2);
const cod_seniat = Joi.string().max(3);
const descripcion_ret = Joi.string().min(3).max(100);
const porc_retencion = Joi.number().precision(2);
const monto_base = Joi.number().precision(2);
const monto_retener = Joi.number().precision(2);
const status = Joi.number().precision(0);
const fecha_reg_islr = Joi.date();
const t_comprobante = Joi.number().precision(0);
const monto_transferido = Joi.number().precision(2);
const nro_comprobante = Joi.string().min(3).max(16);
const fecha_comprobante = Joi.date();

const createCislrSchema = Joi.object({
  ano_ejercicio: ano_ejercicio.required(),
  cod_tipo_retencion: cod_tipo_retencion.required(),
  cod_seniat: cod_seniat.required(),
  descripcion_ret: descripcion_ret.required(),
  porc_retencion: porc_retencion.required(),
  monto_base: monto_base.required(),
  monto_retener: monto_retener.required(),
  status: status.required(),
  fecha_reg_islr: fecha_reg_islr.allow(null, ''),
  t_comprobante: t_comprobante.allow(null, ''),
  monto_transferido: monto_transferido.allow(null, ''),
  nro_comprobante: nro_comprobante.allow(null, ''),
  fecha_comprobante: fecha_comprobante.allow(null, '')
});

const updateCislrSchema = Joi.object({
  id: id,
  ano_ejercicio: ano_ejercicio,
  cod_tipo_retencion: cod_tipo_retencion,
  cod_seniat: cod_seniat,
  descripcion_ret: descripcion_ret,
  porc_retencion: porc_retencion,
  monto_base: monto_base,
  monto_retener: monto_retener,
  status: status,
  fecha_reg_islr: fecha_reg_islr.allow(null, ''),
  t_comprobante: t_comprobante.allow(null, ''),
  monto_transferido: monto_transferido.allow(null, ''),
  nro_comprobante: nro_comprobante.allow(null, ''),
  fecha_comprobante: fecha_comprobante.allow(null, '')
});

const getCislrSchema = Joi.object({
  id: id.required(),
});

module.exports = { createCislrSchema, updateCislrSchema, getCislrSchema }
