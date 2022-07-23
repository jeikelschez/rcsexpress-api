const Joi = require('joi');

const id = Joi.number().integer();
const cod_movimiento = Joi.number().integer();
const nro_item = Joi.number().precision(0);
const cod_concepto = Joi.number().integer();
const precio_unitario = Joi.number().precision(2);
const cantidad = Joi.number().precision(2);
const importe_renglon = Joi.number().precision(2);
const descripcion = Joi.string().min(2).max(1000);
const porc_descuento = Joi.number().precision(2);
const monto_descuento = Joi.number().precision(2);
const cod_concepto_oper = Joi.number().integer();

const createDmovimientosSchema = Joi.object({
    cod_movimiento: cod_movimiento.required(),
    nro_item: nro_item.required(),
    cod_concepto: cod_concepto.allow(null, ''),
    precio_unitario: precio_unitario.required(),
    cantidad: cantidad.allow(null, ''),
    importe_renglon: importe_renglon.allow(null, ''),
    descripcion: descripcion.allow(null, ''),
    porc_descuento: porc_descuento.allow(null, ''),
    monto_descuento: monto_descuento.allow(null, ''),
    cod_concepto_oper: cod_concepto_oper.allow(null, '')
});

const updateDmovimientosSchema = Joi.object({
    id: id,
    cod_movimiento: cod_movimiento,
    nro_item: nro_item,
    cod_concepto: cod_concepto.allow(null, ''),
    precio_unitario: precio_unitario,
    cantidad: cantidad.allow(null, ''),
    importe_renglon: importe_renglon.allow(null, ''),
    descripcion: descripcion.allow(null, ''),
    porc_descuento: porc_descuento.allow(null, ''),
    monto_descuento: monto_descuento.allow(null, ''),
    cod_concepto_oper: cod_concepto_oper.allow(null, '')
});

const getDmovimientosSchema = Joi.object({
    id: id.required(),
});

module.exports = { createDmovimientosSchema, updateDmovimientosSchema, getDmovimientosSchema }
