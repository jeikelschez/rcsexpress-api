const Joi = require('joi');

const id = Joi.number().integer();

const control_inicio = Joi.number().integer();
const control_final = Joi.number().precision(0);
const cant_asignada = Joi.number().precision(0);
const cant_disponible = Joi.number().precision(0);
const fecha_asignacion = Joi.date();
const cod_agencia = Joi.number().integer();
const cod_agente = Joi.number().integer();
const cod_cliente = Joi.number().integer();
const tipo = Joi.number().integer();

const createCguiasSchema = Joi.object({
  control_inicio: control_inicio.required(),
  control_final: control_final.required(),
  cant_asignada: cant_asignada.allow(null, ''),
  cant_disponible: cant_disponible.allow(null, ''),
  fecha_asignacion: fecha_asignacion.allow(null, ''),
  cod_agencia: cod_agencia.required(),
  cod_agente: cod_agente.required(),
  cod_cliente: cod_cliente.required(),
  tipo: tipo.required()
});

const updateCguiasSchema = Joi.object({
  id: id,
  control_inicio: control_inicio,
  control_final: control_final,
  cant_asignada: cant_asignada.allow(null, ''),
  cant_disponible: cant_disponible.allow(null, ''),
  fecha_asignacion: fecha_asignacion.allow(null, ''),
  cod_agencia: cod_agencia,
  cod_agente: cod_agente,
  cod_cliente: cod_cliente,
  tipo: tipo
});

const getCguiasSchema = Joi.object({
  id: id.required(),
});

module.exports = { createCguiasSchema, updateCguiasSchema, getCguiasSchema }
