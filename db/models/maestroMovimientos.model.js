const { Model, DataTypes, Sequelize } = require('sequelize');
const moment = require('moment');

const { AGENCIAS_TABLE } = require('./agencias.model');
const { CLIENTES_TABLE } = require('./clientes.model');
const { COPERACION_TABLE } = require('./conceptosOperacion.model');
const { PROVEEDORES_TABLE } = require('./conceptosOperacion.model');
const { AGENTES_TABLE } = require('./agentes.model');
const { ZONAS_TABLE } = require('./zonas.model');
const { CPARTICULARES_TABLE } = require('./clientesParticulares.model');

const MMOVIMIENTOS_TABLE = 'maestro_de_movimientos';

const MmovimientosSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  cod_agencia: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: AGENCIAS_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  nro_documento: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  t_de_documento: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  serie_documento: {
    type: DataTypes.STRING,
  },
  fecha_emision: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_emision')
        ? moment(this.getDataValue('fecha_emision')).format('DD/MM/YYYY')
        : null;
    },
    allowNull: false,
  },
  cod_cliente_org: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: CLIENTES_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  cod_agencia_dest: {
    type: DataTypes.INTEGER,
    references: {
      model: AGENCIAS_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  cod_cliente_dest: {
    type: DataTypes.INTEGER,
    references: {
      model: CLIENTES_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  tipo_servicio: {
    type: DataTypes.STRING,
  },
  tipo_ubicacion: {
    type: DataTypes.STRING,
  },
  tipo_urgencia: {
    type: DataTypes.STRING,
  },
  fecha_envio: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_envio')
        ? moment(this.getDataValue('fecha_envio')).format('DD/MM/YYYY')
        : null;
    },
  },
  modalidad_pago: {
    type: DataTypes.STRING,
  },
  modalidad_pago: {
    type: DataTypes.STRING,
  },
  pagado_en: {
    type: DataTypes.STRING,
  },
  check_pagado: {
    type: DataTypes.INTEGER,
  },
  tipo_carga: {
    type: DataTypes.STRING,
  },
  nro_piezas: {
    type: DataTypes.DECIMAL,
  },
  peso_kgs: {
    type: DataTypes.DECIMAL,
  },
  dimensiones: {
    type: DataTypes.STRING,
  },
  desc_contenido: {
    type: DataTypes.STRING,
  },
  valor_declarado_cod: {
    type: DataTypes.DECIMAL,
  },
  valor_declarado_seg: {
    type: DataTypes.DECIMAL,
  },
  porc_impuesto: {
    type: DataTypes.DECIMAL,
  },
  monto_subtotal: {
    type: DataTypes.DECIMAL,
  },
  monto_base: {
    type: DataTypes.DECIMAL,
  },
  monto_impuesto: {
    type: DataTypes.DECIMAL,
  },
  monto_total: {
    type: DataTypes.DECIMAL,
  },
  saldo: {
    type: DataTypes.DECIMAL,
  },
  tipo_doc_principal: {
    type: DataTypes.STRING,
  },
  nro_doc_principal: {
    type: DataTypes.DECIMAL,
  },
  serie_doc_principal: {
    type: DataTypes.STRING,
  },
  estatus_operativo: {
    type: DataTypes.STRING,
  },
  estatus_administra: {
    type: DataTypes.STRING,
  },
  cod_concepto: {
    type: DataTypes.INTEGER,
    references: {
      model: COPERACION_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  fecha_anulacion: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_anulacion')
        ? moment(this.getDataValue('fecha_anulacion')).format('DD/MM/YYYY')
        : null;
    },
  },
  observacion: {
    type: DataTypes.STRING,
  },
  cod_proveedor: {
    type: DataTypes.INTEGER,
    references: {
      model: PROVEEDORES_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  cod_agente_venta: {
    type: DataTypes.INTEGER,
    references: {
      model: AGENTES_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  comision_venta: {
    type: DataTypes.DECIMAL,
  },
  check_transito: {
    type: DataTypes.DECIMAL,
  },
  cod_agencia_transito: {
    type: DataTypes.INTEGER,
    references: {
      model: AGENCIAS_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  fecha_llega_transito: {
    type: DataTypes.DATEONLY,
    get: function () {
      return moment(this.getDataValue('fecha_llega_transito')).format('DD/MM/YYYY') != 'Invalid date'
        ? moment(this.getDataValue('fecha_llega_transito')).format('DD/MM/YYYY')
        : '00/00/0000';
    },
  },
  fecha_sale_transito: {
    type: DataTypes.DATEONLY,
    get: function () {
      return moment(this.getDataValue('fecha_sale_transito')).format('DD/MM/YYYY') != 'Invalid date'
        ? moment(this.getDataValue('fecha_sale_transito')).format('DD/MM/YYYY')
        : null;
    },
  },
  cod_agente_entrega: {
    type: DataTypes.INTEGER,
    references: {
      model: AGENTES_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  comision_entrega: {
    type: DataTypes.DECIMAL,
  },
  persona_recibio: {
    type: DataTypes.STRING,
  },
  ci_persona_recibio: {
    type: DataTypes.STRING,
  },
  fecha_recepcion: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_recepcion')
        ? moment(this.getDataValue('fecha_recepcion')).format('DD/MM/YYYY')
        : null;
    },
  },
  hora_recepcion: {
    type: DataTypes.STRING,
  },
  porc_descuento: {
    type: DataTypes.DECIMAL,
  },
  monto_descuento: {
    type: DataTypes.DECIMAL,
  },
  porc_apl_seguro: {
    type: DataTypes.DECIMAL,
  },
  base_comision_vta_rcl: {
    type: DataTypes.DECIMAL,
  },
  base_comision_seg: {
    type: DataTypes.DECIMAL,
  },
  comision_seg_vta: {
    type: DataTypes.DECIMAL,
  },
  comision_seg_entrega: {
    type: DataTypes.DECIMAL,
  },
  ci_rif_cte_conta_org: {
    type: DataTypes.STRING,
  },
  ci_rif_cte_conta_dest: {
    type: DataTypes.STRING,
  },
  observacion_entrega: {
    type: DataTypes.STRING,
  },
  check_rep_vta_org: {
    type: DataTypes.DECIMAL,
  },
  check_rep_vta_des: {
    type: DataTypes.DECIMAL,
  },
  tipo_factura: {
    type: DataTypes.STRING,
  },
  nro_doc_referencia: {
    type: DataTypes.STRING,
  },
  fecha_aplicacion: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_aplicacion')
        ? moment(this.getDataValue('fecha_aplicacion')).format('DD/MM/YYYY')
        : null;
    },
  },
  id_clte_part_orig: {
    type: DataTypes.DECIMAL,
  },
  id_clte_part_dest: {
    type: DataTypes.INTEGER,
    references: {
      model: CPARTICULARES_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  check_pe: {
    type: DataTypes.DECIMAL,
  },
  check_pent: {
    type: DataTypes.DECIMAL,
  },
  check_entco: {
    type: DataTypes.DECIMAL,
  },
  check_entnoco: {
    type: DataTypes.DECIMAL,
  },
  check_elab: {
    type: DataTypes.DECIMAL,
  },
  check_pxfac: {
    type: DataTypes.DECIMAL,
  },
  check_cfacgen: {
    type: DataTypes.DECIMAL,
  },
  check_anulada: {
    type: DataTypes.DECIMAL,
  },
  check_pxcob: {
    type: DataTypes.DECIMAL,
  },
  check_pximp: {
    type: DataTypes.DECIMAL,
  },
  check_cancel: {
    type: DataTypes.DECIMAL,
  },
  fecha_pe: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_pe')
        ? moment(this.getDataValue('fecha_pe')).format('DD/MM/YYYY')
        : null;
    },
  },
  fecha_pent: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_pent')
        ? moment(this.getDataValue('fecha_pent')).format('DD/MM/YYYY')
        : null;
    },
  },
  fecha_entco: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_entco')
        ? moment(this.getDataValue('fecha_entco')).format('DD/MM/YYYY')
        : null;
    },
  },
  fecha_entnoco: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_entnoco')
        ? moment(this.getDataValue('fecha_entnoco')).format('DD/MM/YYYY')
        : null;
    },
  },
  fecha_elab: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_elab')
        ? moment(this.getDataValue('fecha_elab')).format('DD/MM/YYYY')
        : null;
    },
  },
  fecha_pxfac: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_pxfac')
        ? moment(this.getDataValue('fecha_pxfac')).format('DD/MM/YYYY')
        : null;
    },
  },
  fecha_cfacgen: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_cfacgen')
        ? moment(this.getDataValue('fecha_cfacgen')).format('DD/MM/YYYY')
        : null;
    },
  },
  fecha_anulada: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_anulada')
        ? moment(this.getDataValue('fecha_anulada')).format('DD/MM/YYYY')
        : null;
    },
  },
  fecha_pxcob: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_pxcob')
        ? moment(this.getDataValue('fecha_pxcob')).format('DD/MM/YYYY')
        : null;
    },
  },
  fecha_pximp: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_pximp')
        ? moment(this.getDataValue('fecha_pximp')).format('DD/MM/YYYY')
        : null;
    },
  },
  fecha_cancel: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_cancel')
        ? moment(this.getDataValue('fecha_cancel')).format('DD/MM/YYYY')
        : null;
    },
  },
  nro_doc_guia: {
    type: DataTypes.DECIMAL,
  },
  fecha_comp_ret_compra: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_comp_ret_compra')
        ? moment(this.getDataValue('fecha_comp_ret_compra')).format(
            'DD/MM/YYYY'
          )
        : null;
    },
  },
  nro_comp_ret_compra: {
    type: DataTypes.STRING,
  },
  iva_retenido_comprador: {
    type: DataTypes.DECIMAL,
  },
  nro_control: {
    type: DataTypes.DECIMAL,
  },
  nro_ctrl_doc_ppal: {
    type: DataTypes.DECIMAL,
  },
  cod_ag_doc_ppal: {
    type: DataTypes.INTEGER,
    references: {
      model: AGENCIAS_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  nro_control_new: {
    type: DataTypes.DECIMAL,
  },
  nro_ctrl_doc_ppal_new: {
    type: DataTypes.DECIMAL,
  },
  cod_zona_dest: {
    type: DataTypes.INTEGER,
    references: {
      model: ZONAS_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  cod_motivo_retraso: {
    type: DataTypes.DECIMAL,
  },
  monto_ref_cte_sin_imp: {
    type: DataTypes.DECIMAL,
  },
  fecha_emi_comp_ret_compra: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_emi_comp_ret_compra')
        ? moment(this.getDataValue('fecha_emi_comp_ret_compra')).format(
            'DD/MM/YYYY'
          )
        : null;
    },
  },
  monto_fpo: {
    type: DataTypes.DECIMAL,
  },
  ind_cobranza: {
    type: DataTypes.DECIMAL,
  },
  carga_neta: {
    type: DataTypes.DECIMAL,
  },
  porc_comision: {
    type: DataTypes.DECIMAL,
  },
  cod_fpo: {
    type: DataTypes.STRING,
  },
  fecha_comp_igtf: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_comp_igtf')
        ? moment(this.getDataValue('fecha_comp_igtf')).format('DD/MM/YYYY')
        : null;
    },
  },
  nro_comp_igtf: {
    type: DataTypes.STRING,
  },
  periodo_igtf: {
    type: DataTypes.STRING,
  },
  monto_divisas_igtf: {
    type: DataTypes.DECIMAL,
  },
};

class Mmovimientos extends Model {
  static associate(models) {
    this.belongsTo(models.Agencias, {
      foreignKey: 'cod_agencia',
      as: 'agencias',
    });
    this.belongsTo(models.Clientes, {
      foreignKey: 'cod_cliente_org',
      as: 'clientes_org',
    });
    this.belongsTo(models.Agencias, {
      foreignKey: 'cod_agencia_dest',
      as: 'agencias_dest',
    });
    this.belongsTo(models.Clientes, {
      foreignKey: 'cod_cliente_dest',
      as: 'clientes_dest',
    });
    this.belongsTo(models.Coperacion, {
      foreignKey: 'cod_concepto',
      as: 'conceptos',
    });
    this.belongsTo(models.Proveedores, {
      foreignKey: 'cod_proveedor',
      as: 'proveedores',
    });
    this.belongsTo(models.Agentes, {
      foreignKey: 'cod_agente_venta',
      as: 'agentes_venta',
    });
    this.belongsTo(models.Agencias, {
      foreignKey: 'cod_agencia_transito',
      as: 'agencias_trans',
    });
    this.belongsTo(models.Agentes, {
      foreignKey: 'cod_agente_entrega',
      as: 'agentes_entrega',
    });
    this.belongsTo(models.Agencias, {
      foreignKey: 'cod_ag_doc_ppal',
      as: 'agencias_doc_ppal',
    });
    this.belongsTo(models.Zonas, {
      foreignKey: 'cod_zona_dest',
      as: 'zonas_dest',
    });
    this.hasMany(models.Ccomisiones, {
      foreignKey: 'cod_movimiento',
      as: 'comisiones',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: MMOVIMIENTOS_TABLE,
      modelName: 'Mmovimientos',
      timestamps: false,
    };
  }
}

module.exports = { Mmovimientos, MmovimientosSchema, MMOVIMIENTOS_TABLE };
