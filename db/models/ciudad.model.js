const { Model, DataTypes, Sequelize } = require('sequelize');

const { ESTADO_TABLE } = require('./estado.model');

const CIUDAD_TABLE = 'ciudad';

const CiudadSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  desc_ciudad: {
    allowNull: false,
    type: DataTypes.STRING,
    allowNull: false,
  },
  siglas: {
    type: DataTypes.STRING,
  },
  check_urbano: {
    type: DataTypes.STRING,
  },
  cod_region: {
    type: DataTypes.STRING,
  },
  cod_estado: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: ESTADO_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}

class Ciudad extends Model {

  static associate(models) {
    this.belongsTo(models.Estado, { foreignKey: 'cod_estado', as: 'estado' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CIUDAD_TABLE,
      modelName: 'Ciudad',
      timestamps: false
    }
  }
}

module.exports = { Ciudad, CiudadSchema, CIUDAD_TABLE };
