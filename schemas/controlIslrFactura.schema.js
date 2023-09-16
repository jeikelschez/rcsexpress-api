const Joi = require('joi');

const id = Joi.number().integer();
const cod_islr = Joi.number().integer();
const mes_compra = Joi.number().precision(0);
const id_compra = Joi.number().integer();
const aplica = Joi.number().precision(0);
const nro_factura = Joi.string().min(3).max(20);
const fecha_factura = Joi.date();
const cod_proveedor = Joi.number().integer();
const monto_base = Joi.number().precision(2);
const nro_documento = Joi.string().min(3).max(20);
const nro_comprobante = Joi.number().precision(0);
const t_comprobante = Joi.number().precision(0);
const saldo_retenido = Joi.number().precision(2);

const createCislrfacSchema = Joi.object({
  cod_islr: cod_islr.required(),
  mes_compra: mes_compra.required(),
  id_compra: id_compra.required(),
  aplica: aplica.required(),
  nro_factura: nro_factura.required(),
  fecha_factura: fecha_factura.required(),
  cod_proveedor: cod_proveedor.required(),
  monto_base: monto_base.allow(null, ''),
  nro_documento: nro_documento.allow(null, ''),
  nro_comprobante: nro_comprobante.allow(null, ''),
  t_comprobante: t_comprobante.allow(null, ''),
  saldo_retenido: saldo_retenido.allow(null, '')
});

const updateCislrfacSchema = Joi.object({
  id: id,
  cod_islr: cod_islr,
  mes_compra: mes_compra,
  id_compra: id_compra,
  aplica: aplica,
  nro_factura: nro_factura,
  fecha_factura: fecha_factura,
  cod_proveedor: cod_proveedor,
  monto_base: monto_base.allow(null, ''),
  nro_documento: nro_documento.allow(null, ''),
  nro_comprobante: nro_comprobante.allow(null, ''),
  t_comprobante: t_comprobante.allow(null, ''),
  saldo_retenido: saldo_retenido.allow(null, '')
});

const getCislrfacSchema = Joi.object({
  id: id.required(),
});

module.exports = { createCislrfacSchema, updateCislrfacSchema, getCislrfacSchema }
