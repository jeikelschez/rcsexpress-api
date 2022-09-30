const { Model, DataTypes, Sequelize } = require('sequelize');

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
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
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
    type: DataTypes.STRING,
    allowNull: false,
  },
  cod_cliente_org: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: CLIENTES_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  cod_agencia_dest: {
    type: DataTypes.INTEGER,
    references: {
      model: AGENCIAS_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  cod_cliente_dest: {
    type: DataTypes.INTEGER,
    references: {
      model: CLIENTES_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
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
    type: DataTypes.STRING,
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
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  fecha_anulacion: {
    type: DataTypes.STRING,
  },
  observacion: {
    type: DataTypes.STRING,
  },
  cod_proveedor: {
    type: DataTypes.INTEGER,
    references: {
      model: PROVEEDORES_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  cod_agente_venta: {
    type: DataTypes.INTEGER,
    references: {
      model: AGENTES_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
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
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  fecha_llega_transito: {
    type: DataTypes.STRING,
  },
  fecha_sale_transito: {
    type: DataTypes.STRING,
  },
  cod_agente_entrega: {
    type: DataTypes.INTEGER,
    references: {
      model: AGENTES_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
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
    type: DataTypes.STRING,
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
    type: DataTypes.STRING,
  },
  id_clte_part_orig: {
    type: DataTypes.DECIMAL,
  },
  id_clte_part_dest: {
    type: DataTypes.INTEGER,
    references: {
      model: CPARTICULARES_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
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
    type: DataTypes.STRING,
  },
  fecha_pent: {
    type: DataTypes.STRING,
  },
  fecha_entco: {
    type: DataTypes.STRING,
  },
  fecha_entnoco: {
    type: DataTypes.STRING,
  },
  fecha_elab: {
    type: DataTypes.STRING,
  },
  fecha_pxfac: {
    type: DataTypes.STRING,
  },
  fecha_cfacgen: {
    type: DataTypes.STRING,
  },
  fecha_anulada: {
    type: DataTypes.STRING,
  },
  fecha_pxcob: {
    type: DataTypes.STRING,
  },
  fecha_pximp: {
    type: DataTypes.STRING,
  },
  fecha_cancel: {
    type: DataTypes.STRING,
  },
  nro_doc_guia: {
    type: DataTypes.DECIMAL,
  },
  fecha_comp_ret_compra: {
    type: DataTypes.STRING,
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
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
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
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  cod_motivo_retraso: {
    type: DataTypes.DECIMAL,
  },
  monto_ref_cte_sin_imp: {
    type: DataTypes.DECIMAL,
  },
  fecha_emi_comp_ret_compra: {
    type: DataTypes.STRING,
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
  cod_fpo: {
    type: DataTypes.STRING,
  }
}

class Mmovimientos extends Model {

  static associate(models) {
    this.belongsTo(models.Agencias, { foreignKey: 'cod_agencia', as: 'agencias' });
    this.belongsTo(models.Clientes, { foreignKey: 'cod_cliente_org', as: 'clientes_org' });
    this.belongsTo(models.Agencias, { foreignKey: 'cod_agencia_dest', as: 'agencias_dest' });
    this.belongsTo(models.Clientes, { foreignKey: 'cod_cliente_dest', as: 'clientes_dest' });
    this.belongsTo(models.Coperacion, { foreignKey: 'cod_concepto', as: 'conceptos' });
    this.belongsTo(models.Proveedores, { foreignKey: 'cod_proveedor', as: 'proveedores' });
    this.belongsTo(models.Agentes, { foreignKey: 'cod_agente_venta', as: 'agentes_venta' });
    this.belongsTo(models.Agencias, { foreignKey: 'cod_agencia_transito', as: 'agencias_trans' });
    this.belongsTo(models.Agentes, { foreignKey: 'cod_agente_entrega', as: 'agentes_entrega' });
    this.belongsTo(models.Agencias, { foreignKey: 'cod_ag_doc_ppal', as: 'agencias_doc_ppal' });
    this.belongsTo(models.Zonas, { foreignKey: 'cod_zona_dest', as: 'zonas_dest' });
    this.hasMany(models.Ccomisiones, { foreignKey: 'cod_movimiento', as: 'comisiones' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: MMOVIMIENTOS_TABLE,
      modelName: 'Mmovimientos',
      timestamps: false
    }
  }
}

module.exports = { Mmovimientos, MmovimientosSchema, MMOVIMIENTOS_TABLE };
