const Joi = require('joi');

const id = Joi.number().integer();
const nb_cliente = Joi.string().min(3).max(100);
const rif_cedula = Joi.string().min(1).max(20);
const nit = Joi.string().min(3).max(20);
const dir_correo = Joi.string().min(3).max(100);
const dir_fiscal = Joi.string().min(3).max(200);
const email = Joi.string().email();
const tlf_cliente = Joi.string().min(3).max(100);
const fax = Joi.string().min(3).max(65);
const razon_social = Joi.string().min(3).max(100);
const tipo_persona = Joi.string().min(1);
const modalidad_pago = Joi.string().min(2);
const persona_contacto = Joi.string().min(3).max(100);
const observacion = Joi.string().min(3).max(1000);
const cte_decontado = Joi.string().min(1);
const tipo_persona_new = Joi.string().min(1).max(2);
const flag_activo = Joi.string().min(1);
const cod_agencia = Joi.number().integer();
const cod_agente = Joi.number().integer();
const cod_ciudad = Joi.number().integer();
const cod_municipio = Joi.number().integer();
const cod_parroquia = Joi.number().integer();
const cod_localidad = Joi.number().integer();

const createClientesSchema = Joi.object({
  cod_agencia: cod_agencia.required(),
  cod_ciudad: cod_ciudad.required(),
  nb_cliente: nb_cliente.required(),
  rif_cedula: rif_cedula.required(),
  nit: nit.allow(null, ''),
  dir_correo: dir_correo.allow(null, ''),
  dir_fiscal: dir_fiscal.required(),
  tlf_cliente: tlf_cliente.allow(null, ''),
  fax: fax.allow(null, ''),
  razon_social: razon_social.required(),
  tipo_persona: tipo_persona.required(),
  modalidad_pago: modalidad_pago.required(),
  persona_contacto: persona_contacto.allow(null, ''),
  observacion: observacion.allow(null, ''),
  cte_decontado: cte_decontado.allow(null, ''),
  tipo_persona_new: tipo_persona_new.allow(null, ''),
  flag_activo: flag_activo.allow(null, ''),
  cod_agente: cod_agente.allow(null, ''),
  cod_municipio: cod_municipio.allow(null, ''),
  cod_parroquia: cod_parroquia.allow(null, ''),
  cod_localidad: cod_localidad.allow(null, ''),
  email: email.allow(null, '')
});

const updateClientesSchema = Joi.object({
  id: id,
  cod_agencia: cod_agencia,
  cod_ciudad: cod_ciudad,
  nb_cliente: nb_cliente,
  rif_cedula: rif_cedula,
  nit: nit.allow(null, ''),
  dir_correo: dir_correo.allow(null, ''),
  dir_fiscal: dir_fiscal,
  email: email.allow(null, ''),
  tlf_cliente: tlf_cliente.allow(null, ''),
  fax: fax.allow(null, ''),
  razon_social: razon_social,
  tipo_persona: tipo_persona,
  modalidad_pago: modalidad_pago.allow(null, ''),
  persona_contacto: persona_contacto.allow(null, ''),
  observacion: observacion.allow(null, ''),
  cte_decontado: cte_decontado.allow(null, ''),
  tipo_persona_new: tipo_persona_new.allow(null, ''),
  flag_activo: flag_activo.allow(null, ''),
  cod_agente: cod_agente.allow(null, ''),
  cod_municipio: cod_municipio.allow(null, ''),
  cod_parroquia: cod_parroquia.allow(null, ''),
  cod_localidad: cod_localidad.allow(null, '')
});

const getClientesSchema = Joi.object({
  id: id.required(),
});

module.exports = { createClientesSchema, updateClientesSchema, getClientesSchema }
