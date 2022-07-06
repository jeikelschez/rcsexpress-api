const { Model, DataTypes, Sequelize } = require('sequelize');

const VCONTROL_TABLE = 'variable_control';

const VcontrolSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.INTEGER,
  },
  valor: {
    type: DataTypes.STRING,
  }
}

class Vcontrol extends Model {

  static associate(models) {
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: VCONTROL_TABLE,
      modelName: 'Vcontrol',
      timestamps: false
    }
  }
}

module.exports = { Vcontrol, VcontrolSchema, VCONTROL_TABLE };
