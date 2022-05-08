const { Model, DataTypes, Sequelize } = require('sequelize');

const PAISES_TABLE = 'paises';

const PaisesSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  desc_pais: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo_pais: {
    type: DataTypes.STRING,
  }
}

class Paises extends Model {

  static associate(models) {
    this.hasMany(models.Estados, { foreignKey: 'cod_pais', as: 'estados' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PAISES_TABLE,
      modelName: 'Paises',
      timestamps: false
    }
  }
}

module.exports = { Paises, PaisesSchema, PAISES_TABLE };
