const Joi = require('joi');

const cod_banco = Joi.number().integer();
const nb_banco = Joi.string().min(3).max(50);
const direccion_banco = Joi.string().min(3).max(50);
const tlf_banco = Joi.string().min(3).max(25);
const fax_banco = Joi.string().min(3).max(25);
const cod_postal = Joi.string().min(1).max(10);
const email_banco = Joi.string().email();

const createBancoSchema = Joi.object({
  nb_banco: nb_banco.required(),
  direccion_banco: direccion_banco.allow(null, ''),
  tlf_banco: tlf_banco.allow(null, ''),
  fax_banco: fax_banco.allow(null, ''),
  cod_postal: cod_postal.allow(null, ''),
  email_banco: email_banco.allow(null, '')
});

const updateBancoSchema = Joi.object({
  cod_banco: cod_banco,
  nb_banco: nb_banco,
  direccion_banco: direccion_banco.allow(null, ''),
  tlf_banco: tlf_banco.allow(null, ''),
  fax_banco: fax_banco.allow(null, ''),
  cod_postal: cod_postal.allow(null, ''),
  email_banco: email_banco.allow(null, '')
});

const getBancoSchema = Joi.object({
  cod_banco: cod_banco.required(),
});

module.exports = { createBancoSchema, updateBancoSchema, getBancoSchema }
