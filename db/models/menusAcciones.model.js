const { Model, DataTypes, Sequelize } = require('sequelize');

const { MENUS_TABLE } = require('./menus.model');

const ACCIONES_TABLE = 'menus_acciones';

const AccionesSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  cod_menu: {
    allowNull: false,
    type: DataTypes.STRING,
    references: {
      model: MENUS_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  accion: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  descripcion: {
    allowNull: false,
    type: DataTypes.STRING,
  }
}

class Acciones extends Model {

  static associate(models) {
    this.belongsTo(models.Menus, { foreignKey: 'cod_menu', as: 'menus' });
    this.hasMany(models.Rpermisos, { foreignKey: 'cod_menu_accion', as: 'rpermisos' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: ACCIONES_TABLE,
      modelName: 'Acciones',
      timestamps: false
    }
  }
}

module.exports = { Acciones, AccionesSchema, ACCIONES_TABLE };
