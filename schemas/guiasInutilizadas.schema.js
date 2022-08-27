const Joi = require('joi');

const id = Joi.number().integer();
const nro_guia = Joi.number().precision(0);
const cod_agencia = Joi.number().integer();
const tipo_guia = Joi.string().max(2);
const cod_control_guias = Joi.number().integer();
const observaciones = Joi.string().min(3).max(250);
const fecha_registro = Joi.date();
const cod_concepto = Joi.number().integer();
const estatus_guia = Joi.string().max(1);

const createGinutilizadasSchema = Joi.object({
  nro_guia: nro_guia.required(),
  cod_agencia: cod_agencia.required(),
  tipo_guia: tipo_guia.required(),
  cod_control_guias: cod_control_guias.required(),
  observaciones: observaciones.allow(null, ''),
  fecha_registro: fecha_registro.required(),
  cod_concepto: cod_concepto.required(),
  estatus_guia: estatus_guia.allow(null, '')
});

const updateGinutilizadasSchema = Joi.object({
  id: id,
  nro_guia: nro_guia,
  cod_agencia: cod_agencia,
  tipo_guia: tipo_guia,
  cod_control_guias: cod_control_guias,
  observaciones: observaciones.allow(null, ''),
  fecha_registro: fecha_registro,
  cod_concepto: cod_concepto,
  estatus_guia: estatus_guia.allow(null, '')
});

const getGinutilizadasSchema = Joi.object({
  id: id.required(),
});

module.exports = { createGinutilizadasSchema, updateGinutilizadasSchema, getGinutilizadasSchema }
