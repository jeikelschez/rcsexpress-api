const Joi = require('joi');

const id = Joi.number().integer();
const cod_cobranza = Joi.number().integer();
const cod_movimiento = Joi.number().integer();
const monto_pagado = Joi.number().precision(2);
const iva_retenido = Joi.number().precision(2);
const islr_retenido = Joi.number().precision(2);
const observacion = Joi.string().min(3).max(100);

const createDcobranzasSchema = Joi.object({
    cod_cobranza: cod_cobranza.required(),
    cod_movimiento: cod_movimiento.required(),
    monto_pagado: monto_pagado.allow(null, ''),
    iva_retenido: iva_retenido.allow(null, ''),
    islr_retenido: islr_retenido.allow(null, ''),
    observacion: observacion.allow(null, '')
});

const updateDcobranzasSchema = Joi.object({
    id: id,
    cod_cobranza: cod_cobranza,
    cod_movimiento: cod_movimiento,
    monto_pagado: monto_pagado.allow(null, ''),
    iva_retenido: iva_retenido.allow(null, ''),
    islr_retenido: islr_retenido.allow(null, ''),
    observacion: observacion.allow(null, '')
});

const getDcobranzasSchema = Joi.object({
    id: id.required(),
});

module.exports = { createDcobranzasSchema, updateDcobranzasSchema, getDcobranzasSchema }
