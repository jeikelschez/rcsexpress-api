const { Model, DataTypes, Sequelize } = require('sequelize');

const { TIPOS_TABLE } = require('./tipos.model');

const COPERACION_TABLE = 'conceptos_operacion';

const CoperacionSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  desc_concepto: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  afecta_estado: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  tipo: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: TIPOS_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}

class Coperacion extends Model {

  static associate(models) {
    this.belongsTo(models.Tipos, { foreignKey: 'tipo', as: 'tipos' });
    this.hasMany(models.Cfacturacion, { foreignKey: 'cod_concepto', as: 'conceptos' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: COPERACION_TABLE,
      modelName: 'Coperacion',
      timestamps: false
    }
  }
}

module.exports = { Coperacion, CoperacionSchema, COPERACION_TABLE };
