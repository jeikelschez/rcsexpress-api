const { Model, DataTypes, Sequelize } = require('sequelize');

const { COPERACION_TABLE } = require('./conceptosOperacion.model');

const CFACTURACION_TABLE = 'conceptos_facturacion';

const CfacturacionSchema = {
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
  check_comision: {
    allowNull: false,
    type: DataTypes.DECIMAL,
  },
  check_impuesto: {
    allowNull: false,
    type: DataTypes.DECIMAL,
  },
  cod_concepto: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: COPERACION_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}

class Cfacturacion extends Model {

  static associate(models) {
    this.belongsTo(models.Coperacion, { foreignKey: 'cod_concepto', as: 'conceptos' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CFACTURACION_TABLE,
      modelName: 'Cfacturacion',
      timestamps: false
    }
  }
}

module.exports = { Cfacturacion, CfacturacionSchema, CFACTURACION_TABLE };
