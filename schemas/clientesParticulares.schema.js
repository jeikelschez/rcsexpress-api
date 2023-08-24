const Joi = require('joi');

const id = Joi.number().integer();
const cod_agencia = Joi.number().integer();
const cod_cliente = Joi.number().integer();
const rif_ci = Joi.string().min(3).max(20);
const nb_cliente = Joi.string().min(3).max(80);
const cod_ciudad = Joi.number().integer();
const direccion = Joi.string().min(3).max(200);
const telefonos = Joi.string().min(3).max(100);
const fax = Joi.string().min(3).max(25);
const estatus = Joi.string().max(1);
const cod_municipio = Joi.number().integer();
const cod_parroquia = Joi.number().integer();
const cod_localidad = Joi.number().integer();

const createCparticularesSchema = Joi.object({
  cod_agencia: cod_agencia.required(),
  cod_ciudad: cod_ciudad.required(),
  cod_cliente: cod_cliente.required(),
  rif_ci: rif_ci.allow(null, ''),
  nb_cliente: nb_cliente.allow(null, ''),
  cod_ciudad: cod_ciudad.required(),
  direccion: direccion.allow(null, ''),
  telefonos: telefonos.allow(null, ''),
  fax: fax.allow(null, ''),
  estatus: estatus.allow(null, ''),
  cod_municipio: cod_municipio.allow(null, ''),
  cod_parroquia: cod_parroquia.allow(null, ''),
  cod_localidad: cod_localidad.allow(null, '')
});

const updateCparticularesSchema = Joi.object({
  id: id,
  cod_agencia: cod_agencia,
  cod_ciudad: cod_ciudad,
  cod_cliente: cod_cliente,
  rif_ci: rif_ci.allow(null, ''),
  nb_cliente: nb_cliente.allow(null, ''),
  cod_ciudad: cod_ciudad.required(),
  direccion: direccion.allow(null, ''),
  telefonos: telefonos.allow(null, ''),
  fax: fax.allow(null, ''),
  estatus: estatus.allow(null, ''),
  cod_municipio: cod_municipio.allow(null, ''),
  cod_parroquia: cod_parroquia.allow(null, ''),
  cod_localidad: cod_localidad.allow(null, '')
});

const getCparticularesSchema = Joi.object({
  id: id.required(),
});

module.exports = { createCparticularesSchema, updateCparticularesSchema, getCparticularesSchema }
