const { Model, DataTypes, Sequelize } = require('sequelize');

const { AGENCIAS_TABLE } = require('./agencias.model');

const ZONAS_TABLE = 'zonas';

const ZonasSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  nb_zona: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo_zona: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cod_agencia: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: AGENCIAS_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}

class Zonas extends Model {

  static associate(models) {
    this.belongsTo(models.Agencias, { foreignKey: 'cod_agencia', as: 'agencias' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: ZONAS_TABLE,
      modelName: 'Zonas',
      timestamps: false
    }
  }
}

module.exports = { Zonas, ZonasSchema, ZONAS_TABLE };
