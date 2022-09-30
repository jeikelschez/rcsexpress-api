const { Model, DataTypes, Sequelize } = require('sequelize');

const HDOLAR_TABLE = 'historico_dolar';

const HdolarSchema = {
  fecha: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING,
  },
  valor: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  }
}

class Hdolar extends Model {

  static associate(models) {
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: HDOLAR_TABLE,
      modelName: 'Hdolar',
      timestamps: false
    }
  }
}

module.exports = { Hdolar, HdolarSchema, HDOLAR_TABLE };
