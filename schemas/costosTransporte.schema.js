const Joi = require('joi');

const id = Joi.number().integer();

const cod_agencia = Joi.number().integer();
const fecha_envio = Joi.date();
const tipo_transporte = Joi.string().max(2);
const cod_agente = Joi.number().integer();
const cod_proveedor = Joi.number().integer();
const guia_fact_transporte = Joi.string().max(10);
const destino = Joi.string().max(50);
const cod_transporte = Joi.number().integer();
const observacion_gnral = Joi.string().max(1000);
const monto_anticipo = Joi.number().precision(2);
const cod_ayudante = Joi.number().integer();

const createCostosSchema = Joi.object({
  cod_agencia: cod_agencia.required(),
  fecha_envio: fecha_envio.required(),
  tipo_transporte: tipo_transporte.required(),
  cod_agente: cod_agente.allow(null, ''),
  cod_proveedor: cod_proveedor.allow(null, ''),
  guia_fact_transporte: guia_fact_transporte.allow(null, ''),
  destino: destino.allow(null, ''),
  cod_transporte: cod_transporte.allow(null, ''),
  observacion_gnral: observacion_gnral.allow(null, ''),
  monto_anticipo: monto_anticipo.allow(null, ''),
  cod_ayudante: cod_ayudante.allow(null, ''),
});

const updateCostosSchema = Joi.object({
  id: id,
  cod_agencia: cod_agencia,
  fecha_envio: fecha_envio,
  tipo_transporte: tipo_transporte,
  cod_agente: cod_agente.allow(null, ''),
  cod_proveedor: cod_proveedor.allow(null, ''),
  guia_fact_transporte: guia_fact_transporte.allow(null, ''),
  destino: destino.allow(null, ''),
  cod_transporte: cod_transporte.allow(null, ''),
  observacion_gnral: observacion_gnral.allow(null, ''),
  monto_anticipo: monto_anticipo.allow(null, ''),
  cod_ayudante: cod_ayudante.allow(null, ''),
});

const getCostosSchema = Joi.object({
  id: id.required(),
});

module.exports = { createCostosSchema, updateCostosSchema, getCostosSchema }
