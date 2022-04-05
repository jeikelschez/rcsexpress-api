const { Model, DataTypes, Sequelize } = require('sequelize');

const BANCOS_TABLE = 'bancos';

const BancosSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.DECIMAL(2,0)
  },
  nb_banco: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  direccion_banco: {
    type: DataTypes.STRING,
  },
  tlf_banco: {
    type: DataTypes.STRING,
  },
  fax_banco: {
    type: DataTypes.STRING,
  },
  cod_postal: {
    type: DataTypes.STRING,
  },
  email_banco: {
    type: DataTypes.STRING,
  }
}

class Bancos extends Model {

  static associate(models) {
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: BANCOS_TABLE,
      modelName: 'Bancos',
      timestamps: false
    }
  }
}

module.exports = { Bancos, BancosSchema, BANCOS_TABLE };
