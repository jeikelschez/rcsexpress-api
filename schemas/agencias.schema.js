const Joi = require('joi');

const id = Joi.number().integer();
const nb_agencia = Joi.string().min(3).max(50);
const persona_contacto = Joi.string().min(3).max(50);
const dir_agencia = Joi.string().min(3).max(200);
const fax_agencia = Joi.string().min(3).max(50);
const email_agencia = Joi.string().email();
const tlf_agencia = Joi.string().min(3).max(50);
const rif_agencia = Joi.string().min(3).max(20);
const nit_agencia = Joi.string().min(3).max(20);
const estatus = Joi.string().max(1);
const cod_ciudad = Joi.number().integer();

const createAgenciasSchema = Joi.object({
  cod_ciudad: cod_ciudad.required(),
  nb_agencia: nb_agencia.required(),
  persona_contacto: persona_contacto.allow(null, ''),
  dir_agencia: dir_agencia.allow(null, ''),
  fax_agencia: fax_agencia.allow(null, ''),
  email_agencia: email_agencia.allow(null, ''),
  tlf_agencia: tlf_agencia.allow(null, ''),
  rif_agencia: rif_agencia.allow(null, ''),
  nit_agencia: nit_agencia.allow(null, ''),
  estatus: estatus.required()
});

const updateAgenciasSchema = Joi.object({
  id: id,
  cod_ciudad: cod_ciudad,
  nb_agencia: nb_agencia,
  persona_contacto: persona_contacto.allow(null, ''),
  dir_agencia: dir_agencia.allow(null, ''),
  fax_agencia: fax_agencia.allow(null, ''),
  email_agencia: email_agencia.allow(null, ''),
  tlf_agencia: tlf_agencia.allow(null, ''),
  rif_agencia: rif_agencia.allow(null, ''),
  nit_agencia: nit_agencia.allow(null, ''),
  estatus: estatus
});

const getAgenciasSchema = Joi.object({
  id: id.required(),
});

module.exports = { createAgenciasSchema, updateAgenciasSchema, getAgenciasSchema }
