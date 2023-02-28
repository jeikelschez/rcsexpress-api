const { Model, DataTypes, Sequelize } = require('sequelize');

const { COSTOS_TABLE } = require('./costosTransporte.model');
const { COPERACION_TABLE } = require('./conceptosOperacion.model');

const DCOSTOS_TABLE = 'detalle_costos';

const DcostosSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  cod_costo: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: COSTOS_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
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
  monto_costo: {
    allowNull: false,
    type: DataTypes.DECIMAL,
  },
};

class Dcostos extends Model {
  static associate(models) {
    this.belongsTo(models.Costos, { foreignKey: 'cod_costo', as: 'costos' });
    this.belongsTo(models.Coperacion, {
      foreignKey: 'cod_concepto',
      as: 'conceptos',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: DCOSTOS_TABLE,
      modelName: 'Dcostos',
      timestamps: false,
    };
  }
}

module.exports = { Dcostos, DcostosSchema, DCOSTOS_TABLE };
