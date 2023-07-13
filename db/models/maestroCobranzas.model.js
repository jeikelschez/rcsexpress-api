const { Model, DataTypes, Sequelize } = require('sequelize');
const moment = require('moment');

const { AGENCIAS_TABLE } = require('./agencias.model');
const { CUENTAS_TABLE } = require('./cuentas.model');

const MCOBRANZAS_TABLE = 'maestro_cobranza';

const McobranzasSchema = {
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
  nro_deposito: {
    type: DataTypes.DECIMAL,
  },
  fecha_deposito: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_deposito')
        ? moment(this.getDataValue('fecha_deposito')).format('DD/MM/YYYY')
        : null;
    },
    allowNull: false,
  },
  monto_cobrado: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  cod_cuenta: {
    type: DataTypes.INTEGER,
    references: {
      model: CUENTAS_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  monto_retenido: {
    type: DataTypes.DECIMAL,
  },
  monto_deposito: {
    type: DataTypes.DECIMAL,
  },
  ingreso_caja: {
    type: DataTypes.DECIMAL,
  },
};

class Mcobranzas extends Model {
  static associate(models) {
    this.belongsTo(models.Agencias, {
      foreignKey: 'cod_agencia',
      as: 'agencias',
    });
    this.belongsTo(models.Cuentas, {
      foreignKey: 'cod_cuenta',
      as: 'cuentas',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: MCOBRANZAS_TABLE,
      modelName: 'Mcobranzas',
      timestamps: false,
    };
  }
}

module.exports = { Mcobranzas, McobranzasSchema, MCOBRANZAS_TABLE };
