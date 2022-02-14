const { Model, DataTypes, Sequelize } = require('sequelize');

const BANCO_TABLE = 'bancos';

const BancoSchema = {
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

class Banco extends Model {

  static associate(models) {
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: BANCO_TABLE,
      modelName: 'Banco',
      timestamps: false
    }
  }
}

module.exports = { Banco, BancoSchema, BANCO_TABLE };
