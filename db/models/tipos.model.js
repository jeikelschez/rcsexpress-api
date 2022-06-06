const { Model, DataTypes, Sequelize } = require('sequelize');

const TIPOS_TABLE = 'tipos';

const TiposSchema = {
  codigo: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fuente: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}

class Tipos extends Model {

  static associate(models) {
    this.hasMany(models.Coperacion, { foreignKey: 'tipo', as: 'operaciones' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: TIPOS_TABLE,
      modelName: 'Tipos',
      timestamps: false
    }
  }
}

module.exports = { Tipos, TiposSchema, TIPOS_TABLE };
