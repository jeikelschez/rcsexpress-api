const { Model, DataTypes, Sequelize } = require('sequelize');

const { ESTADOS_TABLE } = require('./estados.model');

const MUNICIPIOS_TABLE = 'municipios';

const MunicipiosSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  desc_municipio: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cod_estado: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: ESTADOS_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}

class Municipios extends Model {

  static associate(models) {
    this.belongsTo(models.Estados, { foreignKey: 'cod_estado', as: 'estados' });
    this.hasMany(models.Clientes, { foreignKey: 'cod_municipio', as: 'clientes' });
    this.hasMany(models.Parroquias, { foreignKey: 'cod_parroquias', as: 'parroquias' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: MUNICIPIOS_TABLE,
      modelName: 'Municipios',
      timestamps: false
    }
  }
}

module.exports = { Municipios, MunicipiosSchema, MUNICIPIOS_TABLE };
