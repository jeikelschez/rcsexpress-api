const Joi = require('joi');

const id = Joi.number().integer();
const monto_tarifa = Joi.number().precision(2);
const tipo_urgencia = Joi.string().max(1);
const tipo_tarifa = Joi.string().max(2);
const tipo_ubicacion = Joi.string().max(1);
const kgr_hasta = Joi.number().precision(2);
const tipo_carga = Joi.string().max(2);
const modalidad_pago = Joi.string().max(2);
const pagado_en = Joi.string().max(1);
const region_origen = Joi.string().max(2);
const region_destino = Joi.string().max(2);
const tiempo_servicio = Joi.number().integer();

const createTarifasSchema = Joi.object({
  monto_tarifa: monto_tarifa.required(),
  tipo_urgencia: tipo_urgencia.allow(null, ''),
  tipo_tarifa: tipo_tarifa.allow(null, ''),
  tipo_ubicacion: tipo_ubicacion.allow(null, ''),
  kgr_hasta: kgr_hasta.allow(null, ''),
  tipo_carga: tipo_carga.allow(null, ''),
  modalidad_pago: modalidad_pago.allow(null, ''),
  pagado_en: pagado_en.allow(null, ''),
  region_origen: region_origen.allow(null, ''),
  region_destino: region_destino.allow(null, ''),
  tiempo_servicio: tiempo_servicio.allow(null, '')
});

const updateTarifasSchema = Joi.object({
  id: id,
  monto_tarifa: monto_tarifa,
  tipo_urgencia: tipo_urgencia.allow(null, ''),
  tipo_tarifa: tipo_tarifa.allow(null, ''),
  tipo_ubicacion: tipo_ubicacion.allow(null, ''),
  kgr_hasta: kgr_hasta.allow(null, ''),
  tipo_carga: tipo_carga.allow(null, ''),
  modalidad_pago: modalidad_pago.allow(null, ''),
  pagado_en: pagado_en.allow(null, ''),
  region_origen: region_origen.allow(null, ''),
  region_destino: region_destino.allow(null, ''),
  tiempo_servicio: tiempo_servicio.allow(null, '')
});

const getTarifasSchema = Joi.object({
  id: id.required(),
});

module.exports = { createTarifasSchema, updateTarifasSchema, getTarifasSchema }
