const Joi = require('joi');

const id = Joi.number().integer();
const cod_tipo_persona = Joi.string().max(2);
const cod_tipo_retencion = Joi.string().max(2);
const nb_tipo_retencion = Joi.string().min(3).max(50);
const porc_base = Joi.number().precision(2);
const porc_retencion = Joi.number().precision(2);
const pago_mayor = Joi.number().precision(2);
const sustraendo = Joi.number().precision(2);
const cod_seniat = Joi.string().max(3);
const fecha_ini_val = Joi.date();
const fecha_fin_val = Joi.date();

const createMRetencionesSchema = Joi.object({
  cod_tipo_persona: cod_tipo_persona.required(),
  cod_tipo_retencion: cod_tipo_retencion.required(),
  nb_tipo_retencion: nb_tipo_retencion.required(),
  porc_base: porc_base.required(),
  porc_retencion: porc_retencion.required(),
  pago_mayor: pago_mayor.required(),
  sustraendo: sustraendo.required(),
  cod_seniat: cod_seniat.required(),
  fecha_ini_val: fecha_ini_val.required(),
  fecha_fin_val: fecha_fin_val.required()
});

const updateMRetencionesSchema = Joi.object({
  id: id,
  cod_tipo_persona: cod_tipo_persona,
  cod_tipo_retencion: cod_tipo_retencion,
  nb_tipo_retencion: nb_tipo_retencion,
  porc_base: porc_base,
  porc_retencion: porc_retencion,
  pago_mayor: pago_mayor,
  sustraendo: sustraendo,
  cod_seniat: cod_seniat,
  fecha_ini_val: fecha_ini_val,
  fecha_fin_val: fecha_fin_val
});

const getMRetencionesSchema = Joi.object({
  id: id.required(),
});

module.exports = { createMRetencionesSchema, updateMRetencionesSchema, getMRetencionesSchema }
