const Joi = require('joi');

const id = Joi.number().integer();
const cod_agencia = Joi.number().integer();
const nro_documento = Joi.number().precision(0);
const t_de_documento = Joi.string().max(2);
const serie_documento = Joi.string().max(2);
const fecha_emision = Joi.date();
const cod_cliente_org = Joi.number().integer();
const cod_agencia_dest = Joi.number().integer();
const cod_cliente_dest = Joi.number().integer();
const tipo_servicio = Joi.string().max(1);
const tipo_ubicacion = Joi.string().max(1);
const tipo_urgencia = Joi.string().max(1);
const fecha_envio = Joi.date();
const modalidad_pago = Joi.string().max(2);
const pagado_en = Joi.string().max(1);
const check_pagado = Joi.number().precision(0);
const tipo_carga = Joi.string().max(2);
const nro_piezas = Joi.number().precision(0);
const peso_kgs = Joi.number().precision(2);
const dimensiones = Joi.string().min(2).max(1000);
const desc_contenido = Joi.string().min(2).max(1000);
const valor_declarado_cod = Joi.number().precision(2);
const valor_declarado_seg = Joi.number().precision(2);
const porc_impuesto = Joi.number().precision(2);
const monto_subtotal = Joi.number().precision(2);
const monto_base = Joi.number().precision(2);
const monto_impuesto = Joi.number().precision(2);
const monto_total = Joi.number().precision(2);
const saldo = Joi.number().precision(2);
const tipo_doc_principal = Joi.string().max(2);
const nro_doc_principal = Joi.number().precision(0);
const serie_doc_principal = Joi.string().max(2);
const estatus_operativo = Joi.string().max(2);
const estatus_administra = Joi.string().max(1);
const cod_concepto = Joi.number().integer();
const fecha_anulacion = Joi.date();
const observacion = Joi.string().min(2).max(1000);
const cod_proveedor = Joi.number().integer();
const cod_agente_venta = Joi.number().integer();
const comision_venta = Joi.number().precision(2);
const check_transito = Joi.number().precision(0);
const cod_agencia_transito = Joi.number().integer();
const fecha_llega_transito = Joi.date();
const fecha_sale_transito = Joi.date();
const cod_agente_entrega = Joi.number().integer();
const comision_entrega = Joi.number().precision(2);
const persona_recibio = Joi.string().min(2).max(50);
const ci_persona_recibio = Joi.string().min(2).max(12);
const fecha_recepcion = Joi.date();
const hora_recepcion = Joi.string().min(2).max(12);
const porc_descuento = Joi.number().precision(2);
const monto_descuento = Joi.number().precision(2);
const porc_apl_seguro = Joi.number().precision(2);
const base_comision_vta_rcl = Joi.number().precision(2);
const base_comision_seg = Joi.number().precision(2);
const comision_seg_vta = Joi.number().precision(2);
const comision_seg_entrega = Joi.number().precision(2);
const ci_rif_cte_conta_org = Joi.string().min(2).max(20);
const ci_rif_cte_conta_dest = Joi.string().min(2).max(20);
const observacion_entrega = Joi.string().min(2).max(2000);
const check_rep_vta_org = Joi.number().precision(0);
const check_rep_vta_des = Joi.number().precision(0);
const tipo_factura = Joi.string().max(2);
const nro_doc_referencia = Joi.string().min(1).max(10);
const fecha_aplicacion = Joi.date();
const id_clte_part_orig = Joi.number().precision(0);
const id_clte_part_dest = Joi.number().precision(0);
const check_pe = Joi.number().precision(0);
const check_pent = Joi.number().precision(0);
const check_entco = Joi.number().precision(0);
const check_entnoco = Joi.number().precision(0);
const check_elab = Joi.number().precision(0);
const check_pxfac = Joi.number().precision(0);
const check_cfacgen = Joi.number().precision(0);
const check_anulada = Joi.number().precision(0);
const check_pxcob = Joi.number().precision(0);
const check_pximp = Joi.number().precision(0);
const check_cancel = Joi.number().precision(0);
const fecha_pe = Joi.date();
const fecha_pent = Joi.date();
const fecha_entco = Joi.date();
const fecha_entnoco = Joi.date();
const fecha_elab = Joi.date();
const fecha_pxfac = Joi.date();
const fecha_cfacgen = Joi.date();
const fecha_anulada = Joi.date();
const fecha_pxcob = Joi.date();
const fecha_pximp = Joi.date();
const fecha_cancel = Joi.date();
const nro_doc_guia = Joi.number().precision(0);
const fecha_comp_ret_compra = Joi.date();
const nro_comp_ret_compra = Joi.string().min(1).max(20);
const iva_retenido_comprador = Joi.number().precision(2);
const nro_control = Joi.number().precision(0);
const nro_ctrl_doc_ppal = Joi.number().precision(0);
const cod_ag_doc_ppal = Joi.number().integer();
const nro_control_new = Joi.number().precision(0);
const nro_ctrl_doc_ppal_new = Joi.number().precision(0);
const cod_zona_dest = Joi.number().integer();
const cod_motivo_retraso = Joi.number().precision(0);
const monto_ref_cte_sin_imp = Joi.number().precision(2);
const fecha_emi_comp_ret_compra = Joi.date();
const monto_fpo = Joi.number().precision(2);
const ind_cobranza = Joi.number().precision(0);
const carga_neta = Joi.number().precision(2);
const porc_comision = Joi.number().precision(2);
const cod_fpo = Joi.string().min(1).max(5);
const fecha_comp_igtf = Joi.date();
const nro_comp_igtf = Joi.string().min(1).max(20);
const periodo_igtf = Joi.string().min(1).max(200);
const monto_divisas_igtf = Joi.number().precision(2);

const createMmovimientosSchema = Joi.object({
  cod_agencia: cod_agencia.required(),
  nro_documento: nro_documento.required(),
  t_de_documento: t_de_documento.required(),
  serie_documento: serie_documento.allow(null, ''),
  fecha_emision: fecha_emision.required(),
  cod_cliente_org: cod_cliente_org.required(),
  cod_agencia_dest: cod_agencia_dest.allow(null, ''),
  cod_cliente_dest: cod_cliente_dest.allow(null, ''),
  tipo_servicio: tipo_servicio.allow(null, ''),
  tipo_ubicacion: tipo_ubicacion.allow(null, ''),
  tipo_urgencia: tipo_urgencia.allow(null, ''),
  fecha_envio: fecha_envio.allow(null, ''),
  modalidad_pago: modalidad_pago.required(),
  pagado_en: pagado_en.allow(null, ''),
  check_pagado: check_pagado.allow(null, ''),
  tipo_carga: tipo_carga.allow(null, ''),
  nro_piezas: nro_piezas.allow(null, ''),
  peso_kgs: peso_kgs.allow(null, ''),
  dimensiones: dimensiones.allow(null, ''),
  desc_contenido: desc_contenido.allow(null, ''),
  valor_declarado_cod: valor_declarado_cod.allow(null, ''),
  valor_declarado_seg: valor_declarado_seg.allow(null, ''),
  porc_impuesto: porc_impuesto.allow(null, ''),
  monto_subtotal: monto_subtotal.allow(null, ''),
  monto_base: monto_base.allow(null, ''),
  monto_impuesto: monto_impuesto.allow(null, ''),
  monto_total: monto_total.allow(null, ''),
  saldo: saldo.required(),
  tipo_doc_principal: tipo_doc_principal.allow(null, ''),
  nro_doc_principal: nro_doc_principal.allow(null, ''),
  serie_doc_principal: serie_doc_principal.allow(null, ''),
  estatus_operativo: estatus_operativo.allow(null, ''),
  estatus_administra: estatus_administra.allow(null, ''),
  cod_concepto: cod_concepto.allow(null, ''),
  fecha_anulacion: fecha_anulacion.allow(null, ''),
  observacion: observacion.allow(null, ''),
  cod_proveedor: cod_proveedor.allow(null, ''),
  cod_agente_venta: cod_agente_venta.allow(null, ''),
  comision_venta: comision_venta.allow(null, ''),
  check_transito: check_transito.allow(null, ''),
  cod_agencia_transito: cod_agencia_transito.allow(null, ''),
  fecha_llega_transito: fecha_llega_transito.allow(null, ''),
  fecha_sale_transito: fecha_sale_transito.allow(null, ''),
  cod_agente_entrega: cod_agente_entrega.allow(null, ''),
  comision_entrega: comision_entrega.allow(null, ''),
  persona_recibio: persona_recibio.allow(null, ''),
  ci_persona_recibio: ci_persona_recibio.allow(null, ''),
  fecha_recepcion: fecha_recepcion.allow(null, ''),
  hora_recepcion: hora_recepcion.allow(null, ''),
  porc_descuento: porc_descuento.allow(null, ''),
  monto_descuento: monto_descuento.allow(null, ''),
  porc_apl_seguro: porc_apl_seguro.allow(null, ''),
  base_comision_vta_rcl: base_comision_vta_rcl.allow(null, ''),
  base_comision_seg: base_comision_seg.allow(null, ''),
  comision_seg_vta: comision_seg_vta.allow(null, ''),
  comision_seg_entrega: comision_seg_entrega.allow(null, ''),
  ci_rif_cte_conta_org: ci_rif_cte_conta_org.allow(null, ''),
  ci_rif_cte_conta_dest: ci_rif_cte_conta_dest.allow(null, ''),
  observacion_entrega: observacion_entrega.allow(null, ''),
  check_rep_vta_org: check_rep_vta_org.allow(null, ''),
  check_rep_vta_des: check_rep_vta_des.allow(null, ''),
  tipo_factura: tipo_factura.allow(null, ''),
  nro_doc_referencia: nro_doc_referencia.allow(null, ''),
  fecha_aplicacion: fecha_aplicacion.allow(null, ''),
  id_clte_part_orig: id_clte_part_orig.allow(null, ''),
  id_clte_part_dest: id_clte_part_dest.allow(null, ''),
  check_pe: check_pe.allow(null, ''),
  check_pent: check_pent.allow(null, ''),
  check_entco: check_entco.allow(null, ''),
  check_entnoco: check_entnoco.allow(null, ''),
  check_elab: check_elab.allow(null, ''),
  check_pxfac: check_pxfac.allow(null, ''),
  check_cfacgen: check_cfacgen.allow(null, ''),
  check_anulada: check_anulada.allow(null, ''),
  check_pxcob: check_pxcob.allow(null, ''),
  check_pximp: check_pximp.allow(null, ''),
  check_cancel: check_cancel.allow(null, ''),
  fecha_pe: fecha_pe.allow(null, ''),
  fecha_pent: fecha_pent.allow(null, ''),
  fecha_entco: fecha_entco.allow(null, ''),
  fecha_entnoco: fecha_entnoco.allow(null, ''),
  fecha_elab: fecha_elab.allow(null, ''),
  fecha_pxfac: fecha_pxfac.allow(null, ''),
  fecha_cfacgen: fecha_cfacgen.allow(null, ''),
  fecha_anulada: fecha_anulada.allow(null, ''),
  fecha_pxcob: fecha_pxcob.allow(null, ''),
  fecha_pximp: fecha_pximp.allow(null, ''),
  fecha_cancel: fecha_cancel.allow(null, ''),
  nro_doc_guia: nro_doc_guia.allow(null, ''),
  fecha_comp_ret_compra: fecha_comp_ret_compra.allow(null, ''),
  nro_comp_ret_compra: nro_comp_ret_compra.allow(null, ''),
  iva_retenido_comprador: iva_retenido_comprador.allow(null, ''),
  nro_control: nro_control.allow(null, ''),
  nro_ctrl_doc_ppal: nro_ctrl_doc_ppal.allow(null, ''),
  cod_ag_doc_ppal: cod_ag_doc_ppal.allow(null, ''),
  nro_control_new: nro_control_new.allow(null, ''),
  nro_ctrl_doc_ppal_new: nro_ctrl_doc_ppal_new.allow(null, ''),
  cod_zona_dest: cod_zona_dest.allow(null, ''),
  cod_motivo_retraso: cod_motivo_retraso.allow(null, ''),
  monto_ref_cte_sin_imp: monto_ref_cte_sin_imp.allow(null, ''),
  fecha_emi_comp_ret_compra: fecha_emi_comp_ret_compra.allow(null, ''),
  monto_fpo: monto_fpo.allow(null, ''),
  ind_cobranza: ind_cobranza.allow(null, ''),
  porc_comision: porc_comision.allow(null, ''),
  carga_neta: carga_neta.allow(null, ''),
  cod_fpo: cod_fpo.allow(null, ''),
  fecha_comp_igtf: fecha_comp_igtf.allow(null, ''),
  nro_comp_igtf: nro_comp_igtf.allow(null, ''),
  periodo_igtf: periodo_igtf.allow(null, ''),
  monto_divisas_igtf: monto_divisas_igtf.allow(null, '')
});

const updateMmovimientosSchema = Joi.object({
  id: id,
  cod_agencia: cod_agencia,
  nro_documento: nro_documento,
  t_de_documento: t_de_documento,
  serie_documento: serie_documento.allow(null, ''),
  fecha_emision: fecha_emision,
  cod_cliente_org: cod_cliente_org,
  cod_agencia_dest: cod_agencia_dest.allow(null, ''),
  cod_cliente_dest: cod_cliente_dest.allow(null, ''),
  tipo_servicio: tipo_servicio.allow(null, ''),
  tipo_ubicacion: tipo_ubicacion.allow(null, ''),
  tipo_urgencia: tipo_urgencia.allow(null, ''),
  fecha_envio: fecha_envio.allow(null, ''),
  modalidad_pago: modalidad_pago,
  pagado_en: pagado_en.allow(null, ''),
  check_pagado: check_pagado.allow(null, ''),
  tipo_carga: tipo_carga.allow(null, ''),
  nro_piezas: nro_piezas.allow(null, ''),
  peso_kgs: peso_kgs.allow(null, ''),
  dimensiones: dimensiones.allow(null, ''),
  desc_contenido: desc_contenido.allow(null, ''),
  valor_declarado_cod: valor_declarado_cod.allow(null, ''),
  valor_declarado_seg: valor_declarado_seg.allow(null, ''),
  porc_impuesto: porc_impuesto.allow(null, ''),
  monto_subtotal: monto_subtotal.allow(null, ''),
  monto_base: monto_base.allow(null, ''),
  monto_impuesto: monto_impuesto.allow(null, ''),
  monto_total: monto_total.allow(null, ''),
  saldo: saldo,
  tipo_doc_principal: tipo_doc_principal.allow(null, ''),
  nro_doc_principal: nro_doc_principal.allow(null, ''),
  serie_doc_principal: serie_doc_principal.allow(null, ''),
  estatus_operativo: estatus_operativo.allow(null, ''),
  estatus_administra: estatus_administra.allow(null, ''),
  cod_concepto: cod_concepto.allow(null, ''),
  fecha_anulacion: fecha_anulacion.allow(null, ''),
  observacion: observacion.allow(null, ''),
  cod_proveedor: cod_proveedor.allow(null, ''),
  cod_agente_venta: cod_agente_venta.allow(null, ''),
  comision_venta: comision_venta.allow(null, ''),
  check_transito: check_transito.allow(null, ''),
  cod_agencia_transito: cod_agencia_transito.allow(null, ''),
  fecha_llega_transito: fecha_llega_transito.allow(null, ''),
  fecha_sale_transito: fecha_sale_transito.allow(null, ''),
  cod_agente_entrega: cod_agente_entrega.allow(null, ''),
  comision_entrega: comision_entrega.allow(null, ''),
  persona_recibio: persona_recibio.allow(null, ''),
  ci_persona_recibio: ci_persona_recibio.allow(null, ''),
  fecha_recepcion: fecha_recepcion.allow(null, ''),
  hora_recepcion: hora_recepcion.allow(null, ''),
  porc_descuento: porc_descuento.allow(null, ''),
  monto_descuento: monto_descuento.allow(null, ''),
  porc_apl_seguro: porc_apl_seguro.allow(null, ''),
  base_comision_vta_rcl: base_comision_vta_rcl.allow(null, ''),
  base_comision_seg: base_comision_seg.allow(null, ''),
  comision_seg_vta: comision_seg_vta.allow(null, ''),
  comision_seg_entrega: comision_seg_entrega.allow(null, ''),
  ci_rif_cte_conta_org: ci_rif_cte_conta_org.allow(null, ''),
  ci_rif_cte_conta_dest: ci_rif_cte_conta_dest.allow(null, ''),
  observacion_entrega: observacion_entrega.allow(null, ''),
  check_rep_vta_org: check_rep_vta_org.allow(null, ''),
  check_rep_vta_des: check_rep_vta_des.allow(null, ''),
  tipo_factura: tipo_factura.allow(null, ''),
  nro_doc_referencia: nro_doc_referencia.allow(null, ''),
  fecha_aplicacion: fecha_aplicacion.allow(null, ''),
  id_clte_part_orig: id_clte_part_orig.allow(null, ''),
  id_clte_part_dest: id_clte_part_dest.allow(null, ''),
  check_pe: check_pe.allow(null, ''),
  check_pent: check_pent.allow(null, ''),
  check_entco: check_entco.allow(null, ''),
  check_entnoco: check_entnoco.allow(null, ''),
  check_elab: check_elab.allow(null, ''),
  check_pxfac: check_pxfac.allow(null, ''),
  check_cfacgen: check_cfacgen.allow(null, ''),
  check_anulada: check_anulada.allow(null, ''),
  check_pxcob: check_pxcob.allow(null, ''),
  check_pximp: check_pximp.allow(null, ''),
  check_cancel: check_cancel.allow(null, ''),
  fecha_pe: fecha_pe.allow(null, ''),
  fecha_pent: fecha_pent.allow(null, ''),
  fecha_entco: fecha_entco.allow(null, ''),
  fecha_entnoco: fecha_entnoco.allow(null, ''),
  fecha_elab: fecha_elab.allow(null, ''),
  fecha_pxfac: fecha_pxfac.allow(null, ''),
  fecha_cfacgen: fecha_cfacgen.allow(null, ''),
  fecha_anulada: fecha_anulada.allow(null, ''),
  fecha_pxcob: fecha_pxcob.allow(null, ''),
  fecha_pximp: fecha_pximp.allow(null, ''),
  fecha_cancel: fecha_cancel.allow(null, ''),
  nro_doc_guia: nro_doc_guia.allow(null, ''),
  fecha_comp_ret_compra: fecha_comp_ret_compra.allow(null, ''),
  nro_comp_ret_compra: nro_comp_ret_compra.allow(null, ''),
  iva_retenido_comprador: iva_retenido_comprador.allow(null, ''),
  nro_control: nro_control.allow(null, ''),
  nro_ctrl_doc_ppal: nro_ctrl_doc_ppal.allow(null, ''),
  cod_ag_doc_ppal: cod_ag_doc_ppal.allow(null, ''),
  nro_control_new: nro_control_new.allow(null, ''),
  nro_ctrl_doc_ppal_new: nro_ctrl_doc_ppal_new.allow(null, ''),
  cod_zona_dest: cod_zona_dest.allow(null, ''),
  cod_motivo_retraso: cod_motivo_retraso.allow(null, ''),
  monto_ref_cte_sin_imp: monto_ref_cte_sin_imp.allow(null, ''),
  fecha_emi_comp_ret_compra: fecha_emi_comp_ret_compra.allow(null, ''),
  monto_fpo: monto_fpo.allow(null, ''),
  ind_cobranza: ind_cobranza.allow(null, ''),
  porc_comision: porc_comision.allow(null, ''),
  carga_neta: carga_neta.allow(null, ''),
  cod_fpo: cod_fpo.allow(null, ''),
  fecha_comp_igtf: fecha_comp_igtf.allow(null, ''),
  nro_comp_igtf: nro_comp_igtf.allow(null, ''),
  periodo_igtf: periodo_igtf.allow(null, ''),
  monto_divisas_igtf: monto_divisas_igtf.allow(null, '')
});

const getMmovimientosSchema = Joi.object({
  id: id.required(),
});

module.exports = { createMmovimientosSchema, updateMmovimientosSchema, getMmovimientosSchema }
