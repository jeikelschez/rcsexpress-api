const Joi = require('joi');

const id = Joi.number().integer();
const cod_agencia = Joi.number().integer();
const cod_cobranza = Joi.number().integer();
const cod_movimiento = Joi.number().integer();
const fecha_emision = Joi.date();
const monto_pagado = Joi.number().precision(2);
const iva_retenido = Joi.number().precision(2);
const islr_retenido = Joi.number().precision(2);
const cod_banco = Joi.number().integer();
const nro_cuenta = Joi.string().min(3).max(10);
const cod_cliente = Joi.number().integer();

const createDcobranzasSchema = Joi.object({
    cod_agencia: cod_agencia.required(),
    cod_cobranza: cod_cobranza.required(),
    cod_movimiento: cod_movimiento.required(),
    fecha_emision: fecha_emision.required(),
    monto_pagado: monto_pagado.allow(null, ''),
    iva_retenido: iva_retenido.allow(null, ''),
    islr_retenido: islr_retenido.allow(null, ''),
    cod_banco: cod_banco.allow(null, ''),
    nro_cuenta: nro_cuenta.allow(null, ''),
    cod_cliente: cod_cliente.allow(null, '')
});

const updateDcobranzasSchema = Joi.object({
    id: id,
    cod_agencia: cod_agencia,
    cod_cobranza: cod_cobranza,
    cod_movimiento: cod_movimiento,
    fecha_emision: fecha_emision,
    monto_pagado: monto_pagado.allow(null, ''),
    iva_retenido: iva_retenido.allow(null, ''),
    islr_retenido: islr_retenido.allow(null, ''),
    cod_banco: cod_banco.allow(null, ''),
    nro_cuenta: nro_cuenta.allow(null, ''),
    cod_cliente: cod_cliente.allow(null, '')
});

const getDcobranzasSchema = Joi.object({
    id: id.required(),
});

module.exports = { createDcobranzasSchema, updateDcobranzasSchema, getDcobranzasSchema }
