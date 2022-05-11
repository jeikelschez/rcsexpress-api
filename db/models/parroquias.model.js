const { Model, DataTypes, Sequelize } = require('sequelize');

const { MUNICIPIOS_TABLE } = require('./municipios.model');

const PARROQUIAS_TABLE = 'parroquias';

const ParroquiasSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  desc_parroquia: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cod_municipio: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: MUNICIPIOS_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}

class Parroquias extends Model {

  static associate(models) {
    this.belongsTo(models.Municipios, { foreignKey: 'cod_municipio', as: 'municipios' });
    this.hasMany(models.Clientes, { foreignKey: 'cod_parroquia', as: 'clientes' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PARROQUIAS_TABLE,
      modelName: 'Parroquias',
      timestamps: false
    }
  }
}

module.exports = { Parroquias, ParroquiasSchema, PARROQUIAS_TABLE };
