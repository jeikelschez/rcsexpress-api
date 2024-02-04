const { Model, DataTypes, Sequelize } = require('sequelize');

const { MCOBRANZAS_TABLE } = require('./maestroCobranzas.model');
const { MMOVIMIENTOS_TABLE } = require('./maestroMovimientos.model');

const DCOBRANZAS_TABLE = 'detalle_cobranza';

const DcobranzasSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  cod_cobranza: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: MCOBRANZAS_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  cod_movimiento: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: MMOVIMIENTOS_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  monto_pagado: {
    type: DataTypes.DECIMAL,
  },
  iva_retenido: {
    type: DataTypes.DECIMAL,
  },
  islr_retenido: {
    type: DataTypes.DECIMAL,
  },
  observacion: {
    type: DataTypes.STRING,
  },
}

class Dcobranzas extends Model {

  static associate(models) {
    this.belongsTo(models.Mmovimientos, { foreignKey: 'cod_movimiento', as: 'movimientos' });
    this.belongsTo(models.Mcobranzas, { foreignKey: 'cod_cobranza', as: 'cobranzas' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: DCOBRANZAS_TABLE,
      modelName: 'Dcobranzas',
      timestamps: false
    }
  }
}

module.exports = { Dcobranzas, DcobranzasSchema, DCOBRANZAS_TABLE };
