const { Model, DataTypes, Sequelize } = require('sequelize');

const RECEPTORES_TABLE = 'receptores';

const ReceptoresSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  nb_receptor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dir_receptor: {
    type: DataTypes.STRING,
  },
  tlf_receptor: {
    type: DataTypes.STRING,
  },
  cel_receptor: {
    type: DataTypes.STRING,
  },
  cedula_receptor: {
    type: DataTypes.STRING,
  },
  placa: {
    type: DataTypes.STRING,
  },
  vehiculo: {
    type: DataTypes.STRING,
  },
  flag_activo: {
    type: DataTypes.STRING,
  }
}

class Receptores extends Model {

  static associate(models) {
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: RECEPTORES_TABLE,
      modelName: 'Receptores',
      timestamps: false
    }
  }
}

module.exports = { Receptores, ReceptoresSchema, RECEPTORES_TABLE };
