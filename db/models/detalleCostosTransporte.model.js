const { Model, DataTypes, Sequelize } = require('sequelize');

const { COSTOS_TABLE } = require('./costosTransporte.model');
const { MMOVIMIENTOS_TABLE } = require('./maestroMovimientos.model');

const DCOSTOST_TABLE = 'detalle_costos_transporte';

const DcostostSchema = {
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
  cod_movimiento: {
    type: DataTypes.INTEGER,
    references: {
      model: MMOVIMIENTOS_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
};

class Dcostost extends Model {
  static associate(models) {
    this.belongsTo(models.Costos, { foreignKey: 'cod_costo', as: 'costos' });
    this.belongsTo(models.Mmovimientos, {
      foreignKey: 'cod_movimiento',
      as: 'movimientos',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: DCOSTOST_TABLE,
      modelName: 'Dcostost',
      timestamps: false,
    };
  }
}

module.exports = { Dcostost, DcostostSchema, DCOSTOST_TABLE };
