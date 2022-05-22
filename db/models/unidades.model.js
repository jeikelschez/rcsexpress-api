const { Model, DataTypes, Sequelize } = require('sequelize');

const UNIDADES_TABLE = 'unidades_transporte';

const UnidadesSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  placas: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  chofer: {
    type: DataTypes.STRING,
  }
}

class Unidades extends Model {

  static associate(models) {
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: UNIDADES_TABLE,
      modelName: 'Unidades',
      timestamps: false
    }
  }
}

module.exports = { Unidades, UnidadesSchema, UNIDADES_TABLE };
