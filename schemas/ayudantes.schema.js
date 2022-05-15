const Joi = require('joi');

const id = Joi.number().integer();
const nb_ayudante = Joi.string().min(3).max(50);
const dir_ayudante = Joi.string().min(3).max(100);
const tlf_ayudante = Joi.string().min(3).max(50);
const cel_ayudante = Joi.string().min(3).max(50);
const flag_activo = Joi.string().max(1);

const createAyudantesSchema = Joi.object({
  nb_ayudante: nb_ayudante.required(),
  dir_ayudante: dir_ayudante.allow(null, ''),
  tlf_ayudante: tlf_ayudante.allow(null, ''),
  cel_ayudante: cel_ayudante.allow(null, ''),
  flag_activo: flag_activo.allow(null, '')
});

const updateAyudantesSchema = Joi.object({
  id: id,
  nb_ayudante: nb_ayudante,
  dir_ayudante: dir_ayudante.allow(null, ''),
  tlf_ayudante: tlf_ayudante.allow(null, ''),
  cel_ayudante: cel_ayudante.allow(null, ''),
  flag_activo: flag_activo.allow(null, '')
});

const getAyudantesSchema = Joi.object({
  id: id.required(),
});

module.exports = { createAyudantesSchema, updateAyudantesSchema, getAyudantesSchema }
