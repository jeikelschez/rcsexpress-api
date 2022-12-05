const { Model, DataTypes, Sequelize } = require('sequelize');
const moment = require('moment');

const FPOS_TABLE = 'fpos';

const FposSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  cod_fpo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'uniqueTag',
  },
  desc_tipo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  valor: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  f_val: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('f_val')
        ? moment(this.getDataValue('f_val')).format('DD/MM/YYYY')
        : null;
    },
    allowNull: false,
    unique: 'uniqueTag',
  },
  f_anul: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('f_anul')
        ? moment(this.getDataValue('f_anul')).format('DD/MM/YYYY')
        : null;
    },
    allowNull: false,
    unique: 'uniqueTag',
  },
  peso_inicio: {
    type: DataTypes.STRING,
  },
  peso_fin: {
    type: DataTypes.STRING,
  }
}

class Fpos extends Model {

  static associate(models) {
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: FPOS_TABLE,
      modelName: 'Fpos',
      timestamps: false
    }
  }
}

module.exports = { Fpos, FposSchema, FPOS_TABLE };
