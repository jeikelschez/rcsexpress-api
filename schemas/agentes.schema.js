const Joi = require('joi');

const id = Joi.number().integer();
const nb_agente = Joi.string().min(3).max(100);
const persona_responsable = Joi.string().min(3).max(50);
const dir_agente = Joi.string().min(3).max(100);
const tlf_agente = Joi.string().min(3).max(50);
const fax_agente = Joi.string().min(3).max(50);
const cel_agente = Joi.string().min(3).max(50);
const email_web = Joi.string().email();
const tipo_agente = Joi.string().max(2);
const porc_comision_venta = Joi.number().precision(2);
const porc_comision_entrega = Joi.number().precision(2);
const porc_comision_seguro = Joi.number().precision(2);
const rif_ci_agente = Joi.string().min(3).max(20);
const flag_activo = Joi.string().max(1);
const cod_agencia = Joi.number().integer();

const createAgentesSchema = Joi.object({
  cod_agencia: cod_agencia.required(),
  nb_agente: nb_agente.required(),
  persona_responsable: persona_responsable.allow(null, ''),
  dir_agente: dir_agente.allow(null, ''),
  tlf_agente: tlf_agente.allow(null, ''),
  fax_agente: fax_agente.allow(null, ''),
  cel_agente: cel_agente.allow(null, ''),
  email_web: email_web.allow(null, ''),
  tipo_agente: tipo_agente.allow(null, ''),
  porc_comision_venta: porc_comision_venta.allow(null, ''),
  porc_comision_entrega: porc_comision_entrega.allow(null, ''),
  porc_comision_seguro: porc_comision_seguro.allow(null, ''),
  rif_ci_agente: rif_ci_agente.allow(null, ''),
  flag_activo: flag_activo.allow(null, '')
});

const updateAgentesSchema = Joi.object({
  id: id,
  cod_agencia: cod_agencia,
  nb_agente: nb_agente,
  persona_responsable: persona_responsable.allow(null, ''),
  dir_agente: dir_agente.allow(null, ''),
  tlf_agente: tlf_agente.allow(null, ''),
  fax_agente: fax_agente.allow(null, ''),
  cel_agente: cel_agente.allow(null, ''),
  email_web: email_web.allow(null, ''),
  tipo_agente: tipo_agente.allow(null, ''),
  porc_comision_venta: porc_comision_venta.allow(null, ''),
  porc_comision_entrega: porc_comision_entrega.allow(null, ''),
  porc_comision_seguro: porc_comision_seguro.allow(null, ''),
  rif_ci_agente: rif_ci_agente.allow(null, ''),
  flag_activo: flag_activo.allow(null, '')
});

const getAgentesSchema = Joi.object({
  id: id.required(),
});

module.exports = { createAgentesSchema, updateAgentesSchema, getAgentesSchema }
