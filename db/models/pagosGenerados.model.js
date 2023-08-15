const { Model, DataTypes, Sequelize } = require('sequelize');
const moment = require('moment');

const { MCTAPAGAR_TABLE } = require('./maestroCtaPagar.model');
const { CUENTAS_TABLE } = require('./cuentas.model');

const PGENERADOS_TABLE = 'pagos_generados';

const PgeneradosSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  cod_cta_pagar: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: MCTAPAGAR_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  fecha_pago: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_pago')
        ? moment(this.getDataValue('fecha_pago')).format('DD/MM/YYYY')
        : null;
    },
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
  tipo_doc_pago: {
    type: DataTypes.STRING,
  },
  nro_doc_pago: {
    type: DataTypes.DECIMAL,
  },
  monto_pagado: {
    type: DataTypes.DECIMAL,
  },
  monto_base: {
    type: DataTypes.DECIMAL,
  },
  monto_retenido: {
    type: DataTypes.DECIMAL,
  },
  porc_retencion: {
    type: DataTypes.DECIMAL,
  },
  id_pago: {
    type: DataTypes.DECIMAL,
  },
};

class Pgenerados extends Model {
  static associate(models) {
    this.belongsTo(models.Mctapagar, {
      foreignKey: 'cod_cta_pagar',
      as: 'ctaspagar',
    });
    this.belongsTo(models.Cuentas, { foreignKey: 'cod_cuenta', as: 'cuentas' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PGENERADOS_TABLE,
      modelName: 'Pgenerados',
      timestamps: false,
    };
  }
}

module.exports = { Pgenerados, PgeneradosSchema, PGENERADOS_TABLE };
