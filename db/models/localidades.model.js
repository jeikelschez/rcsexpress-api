const { Model, DataTypes, Sequelize } = require('sequelize');

const { ESTADOS_TABLE } = require('./estados.model');

const LOCALIDADES_TABLE = 'localidades';

const LocalidadesSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  desc_localidad: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cod_postal: {
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

class Localidades extends Model {

  static associate(models) {
    this.belongsTo(models.Estados, { foreignKey: 'cod_estado', as: 'estados' });
    this.hasMany(models.Clientes, { foreignKey: 'cod_localidad', as: 'clientes' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: LOCALIDADES_TABLE,
      modelName: 'Localidades',
      timestamps: false
    }
  }
}

module.exports = { Localidades, LocalidadesSchema, LOCALIDADES_TABLE };
