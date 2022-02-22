const { Model, DataTypes, Sequelize } = require('sequelize');

const { PAISES_TABLE } = require('./paises.model');

const ESTADOS_TABLE = 'estados';

const EstadosSchema = {
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
      model: PAISES_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}

class Estados extends Model {

  static associate(models) {
    this.belongsTo(models.Paises, { foreignKey: 'cod_pais', as: 'paises' });
    this.hasMany(models.Ciudades, { foreignKey: 'cod_estado', as: 'ciudades' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: ESTADOS_TABLE,
      modelName: 'Estados',
      timestamps: false
    }
  }
}

module.exports = { Estados, EstadosSchema, ESTADOS_TABLE };
