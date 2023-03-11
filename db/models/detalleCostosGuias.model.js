const { Model, DataTypes, Sequelize } = require('sequelize');

const { COSTOS_TABLE } = require('./costosTransporte.model');
const { MMOVIMIENTOS_TABLE } = require('./maestroMovimientos.model');

const DCOSTOSG_TABLE = 'detalle_costos_guias';

const DcostosgSchema = {
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

class Dcostosg extends Model {
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
      tableName: DCOSTOSG_TABLE,
      modelName: 'Dcostosg',
      timestamps: false,
    };
  }
}

module.exports = { Dcostosg, DcostosgSchema, DCOSTOSG_TABLE };
