const Joi = require('joi');

const id = Joi.number().integer();
const cod_cta_pagar = Joi.number().integer();
const fecha_pago = Joi.date();
const cod_cuenta = Joi.number().integer();
const tipo_doc_pago = Joi.string().max(2);
const nro_doc_pago = Joi.number().precision(0);
const monto_pagado = Joi.number().precision(2);
const monto_base = Joi.number().precision(2);
const monto_retenido = Joi.number().precision(2);
const porc_retencion = Joi.number().precision(2);
const id_pago = Joi.number().precision(0);

const createPgeneradosSchema = Joi.object({
    cod_cta_pagar: cod_cta_pagar.required(),
    fecha_pago: fecha_pago.allow(null, ''),
    cod_cuenta: cod_cuenta.allow(null, ''),
    tipo_doc_pago: tipo_doc_pago.allow(null, ''),
    nro_doc_pago: nro_doc_pago.allow(null, ''),
    monto_pagado: monto_pagado.allow(null, ''),
    monto_base: monto_base.allow(null, ''),
    monto_retenido: monto_retenido.allow(null, ''),
    porc_retencion: porc_retencion.allow(null, ''),
    id_pago: id_pago.allow(null, '')
});

const updatePgeneradosSchema = Joi.object({
    id: id,
    cod_cta_pagar: cod_cta_pagar,
    fecha_pago: fecha_pago.allow(null, ''),
    cod_cuenta: cod_cuenta.allow(null, ''),
    tipo_doc_pago: tipo_doc_pago.allow(null, ''),
    nro_doc_pago: nro_doc_pago.allow(null, ''),
    monto_pagado: monto_pagado.allow(null, ''),
    monto_base: monto_base.allow(null, ''),
    monto_retenido: monto_retenido.allow(null, ''),
    porc_retencion: porc_retencion.allow(null, ''),
    id_pago: id_pago.allow(null, '')
});

const getPgeneradosSchema = Joi.object({
    id: id.required(),
});

module.exports = { createPgeneradosSchema, updatePgeneradosSchema, getPgeneradosSchema }
