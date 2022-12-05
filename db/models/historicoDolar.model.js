const { Model, DataTypes, Sequelize } = require('sequelize');
const moment = require('moment');

const HDOLAR_TABLE = 'historico_dolar';

const HdolarSchema = {
  fecha: {    
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha')
        ? moment(this.getDataValue('fecha')).format('DD/MM/YYYY')
        : null;
    },
    allowNull: false,
    primaryKey: true,
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
