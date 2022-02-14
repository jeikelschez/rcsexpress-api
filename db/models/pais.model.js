const { Model, DataTypes, Sequelize } = require('sequelize');

const PAIS_TABLE = 'pais';

const PaisSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  desc_pais: {
    allowNull: false,
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo_pais: {
    type: DataTypes.STRING,
  }
}

class Pais extends Model {

  static associate(models) {
    this.hasMany(models.Estado, { foreignKey: 'cod_pais', as: 'estados' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PAIS_TABLE,
      modelName: 'Pais',
      timestamps: false
    }
  }
}

module.exports = { Pais, PaisSchema, PAIS_TABLE };
