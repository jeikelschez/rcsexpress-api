const { Model, DataTypes, Sequelize } = require('sequelize');

const { MCTAPAGAR_TABLE } = require('./maestroCobranzas.model');
const { AGENCIAS_TABLE } = require('./agencias.model');
const { COPERACION_TABLE } = require('./conceptosOperacion.model');

const DGASTOS_TABLE = 'distribucion_gastos';

const DgastosSchema = {
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
  cod_concepto: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: COPERACION_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  tipo_concepto: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  monto_distribuido: {
    type: DataTypes.DECIMAL,
  },
};

class Dgastos extends Model {
  static associate(models) {
    this.belongsTo(models.Mctapagar, {
      foreignKey: 'cod_cta_pagar',
      as: 'ctaspagar',
    });
    this.belongsTo(models.Agencias, {
      foreignKey: 'cod_agencia',
      as: 'agencias',
    });
    this.belongsTo(models.Coperacion, {
      foreignKey: 'cod_concepto',
      as: 'conceptos',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: DGASTOS_TABLE,
      modelName: 'Dgastos',
      timestamps: false,
    };
  }
}

module.exports = { Dgastos, DgastosSchema, DGASTOS_TABLE };
