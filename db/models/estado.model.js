const { Model, DataTypes, Sequelize } = require('sequelize');

const { PAIS_TABLE } = require('./pais.model');

const ESTADO_TABLE = 'estado';

const EstadoSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  desc_estado: {
    allowNull: false,
    type: DataTypes.STRING,
    allowNull: false,
  },
  siglas: {
    type: DataTypes.STRING,
  },
  iso_3166: {
    type: DataTypes.STRING,
  },
  cod_pais: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: PAIS_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}

class Estado extends Model {

  static associate(models) {
    this.belongsTo(models.Pais, { foreignKey: 'cod_pais', as: 'pais' });
    this.hasMany(models.Ciudad, { foreignKey: 'cod_estado', as: 'ciudades' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: ESTADO_TABLE,
      modelName: 'Estado',
      timestamps: false
    }
  }
}

module.exports = { Estado, EstadoSchema, ESTADO_TABLE };
