const Joi = require('joi');

const id = Joi.number().integer();
const nb_receptor = Joi.string().min(3).max(50);
const dir_receptor = Joi.string().min(3).max(100);
const tlf_receptor = Joi.string().min(3).max(50);
const cel_receptor = Joi.string().min(3).max(50);
const cedula_receptor = Joi.string().min(3).max(20);
const placa = Joi.string().min(3).max(10);
const vehiculo = Joi.string().min(3).max(100);
const flag_activo = Joi.string().max(1);

const createReceptoresSchema = Joi.object({
  nb_receptor: nb_receptor.required(),
  dir_receptor: dir_receptor.allow(null, ''),
  tlf_receptor: tlf_receptor.allow(null, ''),
  cel_receptor: cel_receptor.allow(null, ''),
  cedula_receptor: cedula_receptor.allow(null, ''),
  placa: placa.allow(null, ''),
  vehiculo: vehiculo.allow(null, ''),
  flag_activo: flag_activo.allow(null, '')
});

const updateReceptoresSchema = Joi.object({
  id: id,
  nb_receptor: nb_receptor,
  dir_receptor: dir_receptor.allow(null, ''),
  tlf_receptor: tlf_receptor.allow(null, ''),
  cel_receptor: cel_receptor.allow(null, ''),
  cedula_receptor: cedula_receptor.allow(null, ''),
  placa: placa.allow(null, ''),
  vehiculo: vehiculo.allow(null, ''),
  flag_activo: flag_activo.allow(null, '')
});

const getReceptoresSchema = Joi.object({
  id: id.required(),
});

module.exports = { createReceptoresSchema, updateReceptoresSchema, getReceptoresSchema }
