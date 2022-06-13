const Joi = require('joi');

const id = Joi.number().integer();
const tipo = Joi.number().integer();
const control_inicio = Joi.number().integer();
const control_final = Joi.number().precision(0);
const ult_doc_referencia = Joi.number().precision(0);
const estatus_lote = Joi.string().max(1);
const serie_doc = Joi.string().max(1);
const cod_agencia = Joi.number().integer();

const createCorrelativoSchema = Joi.object({
  tipo: tipo.required(),
  control_inicio: control_inicio.required(),
  control_final: control_final.required(),
  ult_doc_referencia: ult_doc_referencia.allow(null, ''),
  estatus_lote: estatus_lote.allow(null, ''),
  serie_doc: serie_doc.allow(null, ''),
  cod_agencia: cod_agencia.required()
});

const updateCorrelativoSchema = Joi.object({
  id: id,
  tipo: tipo,
  control_inicio: control_inicio,
  control_final: control_final,
  ult_doc_referencia: ult_doc_referencia.allow(null, ''),
  estatus_lote: estatus_lote.allow(null, ''),
  serie_doc: serie_doc.allow(null, ''),
  cod_agencia: cod_agencia
});

const getCorrelativoSchema = Joi.object({
  id: id.required(),
});

module.exports = { createCorrelativoSchema, updateCorrelativoSchema, getCorrelativoSchema }
