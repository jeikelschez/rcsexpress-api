const { Model, DataTypes, Sequelize } = require('sequelize');
const moment = require('moment');

const CISLR_TABLE = 'control_islr';

const CislrSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  ano_ejercicio: {
    allowNull: false,
    type: DataTypes.DECIMAL,
  },
  cod_tipo_retencion: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  cod_seniat: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  descripcion_ret: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  porc_retencion: {
    allowNull: false,
    type: DataTypes.DECIMAL,
  },
  monto_base: {
    allowNull: false,
    type: DataTypes.DECIMAL,
  },
  monto_retener: {
    allowNull: false,
    type: DataTypes.DECIMAL,
  },
  status: {
    allowNull: false,
    type: DataTypes.DECIMAL,
  },
  fecha_reg_islr: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_reg_islr')
        ? moment(this.getDataValue('fecha_reg_islr')).format('DD/MM/YYYY')
        : null;
    },
  },
  t_comprobante: {
    type: DataTypes.DECIMAL,
  },
  monto_transferido: {
    type: DataTypes.DECIMAL,
  },
  nro_comprobante: {
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
};

class Cislr extends Model {
  static associate(models) {
    this.hasMany(models.Cislrfac, {
      foreignKey: 'cod_islr',
      as: 'retenciones',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CISLR_TABLE,
      modelName: 'Cislr',
      timestamps: false,
    };
  }
}

module.exports = { Cislr, CislrSchema, CISLR_TABLE };
