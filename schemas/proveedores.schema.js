const Joi = require('joi');

const id = Joi.number().integer();
const nb_proveedor = Joi.string().min(3).max(100);
const nb_beneficiario = Joi.string().min(3).max(50);
const rif_proveedor = Joi.string().min(3).max(20);
const nit_proveedor = Joi.string().min(3).max(20);
const direccion_fiscal = Joi.string().min(3).max(200);
const direccion_correo = Joi.string().min(3).max(200);
const tlf_proveedor = Joi.string().min(3).max(100);
const fax_proveedor = Joi.string().min(3).max(50);
const email_proveedor = Joi.string().email();
const condicion_pago = Joi.number().integer();
const observacion = Joi.string().min(3).max(500);
const tipo_servicio = Joi.string().max(2);
const cod_tipo_retencion = Joi.number().integer();
const tipo_persona = Joi.string().max(1);
const flag_activo = Joi.string().max(1);

const createProveedoresSchema = Joi.object({
  nb_proveedor: nb_proveedor.required(),
  nb_beneficiario: nb_beneficiario.allow(null, ''),
  rif_proveedor: rif_proveedor.required(),
  nit_proveedor: nit_proveedor.allow(null, ''),
  direccion_fiscal: direccion_fiscal.allow(null, ''),
  direccion_correo: direccion_correo.allow(null, ''),
  tlf_proveedor: tlf_proveedor.allow(null, ''),
  fax_proveedor: fax_proveedor.allow(null, ''),
  email_proveedor: email_proveedor.allow(null, ''),
  condicion_pago: condicion_pago.allow(null, ''),
  observacion: observacion.allow(null, ''),
  tipo_servicio: tipo_servicio.allow(null, ''),
  cod_tipo_retencion: cod_tipo_retencion.allow(null, ''),
  tipo_persona: tipo_persona.allow(null, ''),
  flag_activo: flag_activo.allow(null, '')
});

const updateProveedoresSchema = Joi.object({
  id: id,
  nb_proveedor: nb_proveedor,
  nb_beneficiario: nb_beneficiario.allow(null, ''),
  rif_proveedor: rif_proveedor,
  nit_proveedor: nit_proveedor.allow(null, ''),
  direccion_fiscal: direccion_fiscal.allow(null, ''),
  direccion_correo: direccion_correo.allow(null, ''),
  tlf_proveedor: tlf_proveedor.allow(null, ''),
  fax_proveedor: fax_proveedor.allow(null, ''),
  email_proveedor: email_proveedor.allow(null, ''),
  condicion_pago: condicion_pago.allow(null, ''),
  observacion: observacion.allow(null, ''),
  tipo_servicio: tipo_servicio.allow(null, ''),
  cod_tipo_retencion: cod_tipo_retencion.allow(null, ''),
  tipo_persona: tipo_persona.allow(null, ''),
  flag_activo: flag_activo.allow(null, '')
});

const getProveedoresSchema = Joi.object({
  id: id.required(),
});

module.exports = { createProveedoresSchema, updateProveedoresSchema, getProveedoresSchema }
