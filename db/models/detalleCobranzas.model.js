const { Model, DataTypes, Sequelize } = require('sequelize');
const moment = require('moment');

const { AGENCIAS_TABLE } = require('./agencias.model');
const { BANCOS_TABLE } = require('./bancos.model');
const { CLIENTES_TABLE } = require('./clientes.model');
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
  fecha_emision: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_emision')
        ? moment(this.getDataValue('fecha_emision')).format('DD/MM/YYYY')
        : null;
    },
    allowNull: false,
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
  cod_banco: {
    type: DataTypes.INTEGER,
    references: {
      model: BANCOS_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  nro_cuenta: {
    type: DataTypes.STRING,
  },  
  cod_cliente: {
    type: DataTypes.INTEGER,
    references: {
      model: CLIENTES_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
}

class Dcobranzas extends Model {

  static associate(models) {
    this.belongsTo(models.Agencias, { foreignKey: 'cod_agencia', as: 'agencias' });
    this.belongsTo(models.Bancos, { foreignKey: 'cod_banco', as: 'bancos' });
    this.belongsTo(models.Clientes, { foreignKey: 'cod_cliente', as: 'clientes' });
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
