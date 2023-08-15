const { Model, DataTypes, Sequelize } = require('sequelize');
const moment = require('moment');

const { AGENCIAS_TABLE } = require('./agencias.model');
const { PROVEEDORES_TABLE } = require('./proveedores.model');

const MCTAPAGAR_TABLE = 'maestro_cta_pagar';

const MctapagarSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  cod_proveedor: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: PROVEEDORES_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
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
    type: DataTypes.STRING,
  },
  tipo_documento: {
    type: DataTypes.STRING,
  },
  fecha_documento: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_documento')
        ? moment(this.getDataValue('fecha_documento')).format('DD/MM/YYYY')
        : null;
    },
  },
  fecha_registro: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_registro')
        ? moment(this.getDataValue('fecha_registro')).format('DD/MM/YYYY')
        : null;
    },
  },
  concepto_documento: {
    type: DataTypes.STRING,
  },
  condicion_pago: {
    type: DataTypes.DECIMAL,
  },
  monto_exento: {
    type: DataTypes.DECIMAL,
  },
  monto_base_nacional: {
    type: DataTypes.DECIMAL,
  },
  monto_base_intern: {
    type: DataTypes.DECIMAL,
  },
  monto_imp_nacional: {
    type: DataTypes.DECIMAL,
  },
  monto_imp_intern: {
    type: DataTypes.DECIMAL,
  },
  total_documento: {
    type: DataTypes.DECIMAL,
  },
  porcentaje_retencion: {
    type: DataTypes.DECIMAL,
  },
  base_imponible_retencion: {
    type: DataTypes.DECIMAL,
  },
  saldo_documento: {
    type: DataTypes.DECIMAL,
  },
  saldo_retenido: {
    type: DataTypes.DECIMAL,
  },
  estatus_documento: {
    type: DataTypes.STRING,
  },
  fecha_vencimiento: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_vencimiento')
        ? moment(this.getDataValue('fecha_vencimiento')).format('DD/MM/YYYY')
        : null;
    },
  },
  saldo_base_retencion: {
    type: DataTypes.DECIMAL,
  },
  pago_decontado: {
    type: DataTypes.STRING,
  },
  pago_permanente: {
    type: DataTypes.STRING,
  },
  nro_doc_afectado: {
    type: DataTypes.STRING,
  },
  nro_ctrl_doc: {
    type: DataTypes.STRING,
  },
  islr: {
    type: DataTypes.DECIMAL,
  },
  cod_tipo_persona: {
    type: DataTypes.DECIMAL,
  },
  cod_tipo_retencion: {
    type: DataTypes.STRING,
  },
  nro_comprobante_iva: {
    type: DataTypes.STRING,
  },
  fecha_comprobante: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_comprobante')
        ? moment(this.getDataValue('fecha_comprobante')).format('DD/MM/YYYY')
        : null;
    },
  },
  fecha_entrega: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_entrega')
        ? moment(this.getDataValue('fecha_entrega')).format('DD/MM/YYYY')
        : null;
    },
  },
  iva: {
    type: DataTypes.DECIMAL,
  },
};

class Mctapagar extends Model {
  static associate(models) {
    this.belongsTo(models.Agencias, {
      foreignKey: 'cod_agencia',
      as: 'agencias',
    });
    this.belongsTo(models.Proveedores, {
      foreignKey: 'cod_proveedor',
      as: 'proveedores',
    });
    this.hasMany(models.Pgenerados, {
      foreignKey: 'cod_cta_pagar',
      as: 'ctaspagar',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: MCTAPAGAR_TABLE,
      modelName: 'Mctapagar',
      timestamps: false,
    };
  }
}

module.exports = { Mctapagar, MctapagarSchema, MCTAPAGAR_TABLE };
