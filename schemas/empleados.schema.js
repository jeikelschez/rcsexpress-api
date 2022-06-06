const Joi = require('joi');

const id = Joi.number().integer();
const rif_empleado = Joi.string().min(3).max(10);
const nombre = Joi.string().min(3).max(30);
const aplica_retencion = Joi.string().max(1);
const porcentaje_retencion = Joi.number().precision(2);
const periodo = Joi.string().min(1).max(6);
const sueldo = Joi.number().precision(2);

const createEmpleadosSchema = Joi.object({
  rif_empleado: rif_empleado.required(),
  nombre: nombre.required(),
  aplica_retencion: aplica_retencion.required(),
  porcentaje_retencion: porcentaje_retencion.required(),
  periodo: periodo.required(),
  sueldo: sueldo.allow(null, '')
});

const updateEmpleadosSchema = Joi.object({
  id: id,
  rif_empleado: rif_empleado,
  nombre: nombre,
  aplica_retencion: aplica_retencion,
  porcentaje_retencion: porcentaje_retencion,
  periodo: periodo,
  sueldo: sueldo.allow(null, '')
});

const getEmpleadosSchema = Joi.object({
  id: id.required(),
});

module.exports = { createEmpleadosSchema, updateEmpleadosSchema, getEmpleadosSchema }
