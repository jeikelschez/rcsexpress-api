const Joi = require('joi');

const id = Joi.number().integer();
const cod_proveedor = Joi.number().integer();
const cod_agencia = Joi.number().integer();
const nro_documento = Joi.string().min(3).max(20);
const tipo_documento = Joi.string().max(2);
const fecha_documento = Joi.date();
const fecha_registro = Joi.date();
const concepto_documento = Joi.string().max(2000);
const condicion_pago = Joi.number().precision(0);
const monto_exento = Joi.number().precision(2);
const monto_base_nacional = Joi.number().precision(2);
const monto_base_intern = Joi.number().precision(2);
const monto_imp_nacional = Joi.number().precision(2);
const monto_imp_intern = Joi.number().precision(2);
const total_documento = Joi.number().precision(2);
const porcentaje_retencion = Joi.number().precision(2);
const base_imponible_retencion = Joi.number().precision(2);
const saldo_documento = Joi.number().precision(2);
const saldo_retenido = Joi.number().precision(2);
const estatus_documento = Joi.string().max(2);
const fecha_vencimiento = Joi.date();
const saldo_base_retencion = Joi.number().precision(2);
const pago_decontado = Joi.string().max(2);
const pago_permanente = Joi.string().max(1);
const nro_doc_afectado = Joi.string().min(3).max(20);
const nro_ctrl_doc = Joi.string().min(3).max(20);
const islr = Joi.number().precision(0);
const cod_tipo_persona = Joi.number().precision(0);
const cod_tipo_retencion = Joi.string().max(2);
const nro_comprobante_iva = Joi.string().min(3).max(20);
const fecha_comprobante = Joi.date();
const fecha_entrega = Joi.date();
const iva = Joi.number().precision(0);
const id_cta_pagar = Joi.number().precision(0);

const createMctapagarSchema = Joi.object({
  cod_proveedor: cod_proveedor.required(),
  cod_agencia: cod_agencia.required(),
  nro_documento: nro_documento.allow(null, ''),
  tipo_documento: tipo_documento.allow(null, ''),
  fecha_documento: fecha_documento.allow(null, ''),
  fecha_registro: fecha_registro.allow(null, ''),
  concepto_documento: concepto_documento.allow(null, ''),
  condicion_pago: condicion_pago.allow(null, ''),
  monto_exento: monto_exento.allow(null, ''),
  monto_base_nacional: monto_base_nacional.allow(null, ''),
  monto_base_intern: monto_base_intern.allow(null, ''),
  monto_imp_nacional: monto_imp_nacional.allow(null, ''),
  monto_imp_intern: monto_imp_intern.allow(null, ''),
  total_documento: total_documento.allow(null, ''),
  porcentaje_retencion: porcentaje_retencion.allow(null, ''),
  base_imponible_retencion: base_imponible_retencion.allow(null, ''),
  saldo_documento: saldo_documento.allow(null, ''),
  saldo_retenido: saldo_retenido.allow(null, ''),
  estatus_documento: estatus_documento.allow(null, ''),
  fecha_vencimiento: fecha_vencimiento.allow(null, ''),
  saldo_base_retencion: saldo_base_retencion.allow(null, ''),
  pago_decontado: pago_decontado.allow(null, ''),
  pago_permanente: pago_permanente.allow(null, ''),
  nro_doc_afectado: nro_doc_afectado.allow(null, ''),
  nro_ctrl_doc: nro_ctrl_doc.allow(null, ''),
  islr: islr.allow(null, ''),
  cod_tipo_persona: cod_tipo_persona.allow(null, ''),
  cod_tipo_retencion: cod_tipo_retencion.allow(null, ''),
  nro_comprobante_iva: nro_comprobante_iva.allow(null, ''),
  fecha_comprobante: fecha_comprobante.allow(null, ''),
  fecha_entrega: fecha_entrega.allow(null, ''),
  iva: iva.allow(null, ''),
  id_cta_pagar: id_cta_pagar.allow(null, ''),
});

const updateMctapagarSchema = Joi.object({
  id: id,
  cod_proveedor: cod_proveedor,
  cod_agencia: cod_agencia,
  nro_documento: nro_documento.allow(null, ''),
  tipo_documento: tipo_documento.allow(null, ''),
  fecha_documento: fecha_documento.allow(null, ''),
  fecha_registro: fecha_registro.allow(null, ''),
  concepto_documento: concepto_documento.allow(null, ''),
  condicion_pago: condicion_pago.allow(null, ''),
  monto_exento: monto_exento.allow(null, ''),
  monto_base_nacional: monto_base_nacional.allow(null, ''),
  monto_base_intern: monto_base_intern.allow(null, ''),
  monto_imp_nacional: monto_imp_nacional.allow(null, ''),
  monto_imp_intern: monto_imp_intern.allow(null, ''),
  total_documento: total_documento.allow(null, ''),
  porcentaje_retencion: porcentaje_retencion.allow(null, ''),
  base_imponible_retencion: base_imponible_retencion.allow(null, ''),
  saldo_documento: saldo_documento.allow(null, ''),
  saldo_retenido: saldo_retenido.allow(null, ''),
  estatus_documento: estatus_documento.allow(null, ''),
  fecha_vencimiento: fecha_vencimiento.allow(null, ''),
  saldo_base_retencion: saldo_base_retencion.allow(null, ''),
  pago_decontado: pago_decontado.allow(null, ''),
  pago_permanente: pago_permanente.allow(null, ''),
  nro_doc_afectado: nro_doc_afectado.allow(null, ''),
  nro_ctrl_doc: nro_ctrl_doc.allow(null, ''),
  islr: islr.allow(null, ''),
  cod_tipo_persona: cod_tipo_persona.allow(null, ''),
  cod_tipo_retencion: cod_tipo_retencion.allow(null, ''),
  nro_comprobante_iva: nro_comprobante_iva.allow(null, ''),
  fecha_comprobante: fecha_comprobante.allow(null, ''),
  fecha_entrega: fecha_entrega.allow(null, ''),
  iva: iva.allow(null, ''),
  id_cta_pagar: id_cta_pagar.allow(null, ''),
});

const getMctapagarSchema = Joi.object({
  id: id.required(),
});

module.exports = {
  createMctapagarSchema,
  updateMctapagarSchema,
  getMctapagarSchema,
};
