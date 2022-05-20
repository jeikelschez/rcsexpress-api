const { Model, DataTypes, Sequelize } = require('sequelize');

const { ESTADOS_TABLE } = require('./estados.model');

const CIUDADES_TABLE = 'ciudades';

const CiudadesSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  desc_ciudad: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  siglas: {
    type: DataTypes.STRING,
  },
  check_urbano: {
    type: DataTypes.STRING,
  },
  cod_region: {
    type: DataTypes.STRING,
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

class Ciudades extends Model {

  static associate(models) {
    this.belongsTo(models.Estados, { foreignKey: 'cod_estado', as: 'estados' });
    this.hasMany(models.Agencias, { foreignKey: 'cod_ciudad', as: 'agencias' });
    this.hasMany(models.Clientes, { foreignKey: 'cod_ciudad', as: 'clientes' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CIUDADES_TABLE,
      modelName: 'Ciudades',
      timestamps: false
    }
  }
}

module.exports = { Ciudades, CiudadesSchema, CIUDADES_TABLE };
