const { Model, DataTypes, Sequelize } = require('sequelize');

const { ROLES_TABLE } = require('./roles.model');
const { ACCIONES_TABLE } = require('./menusAcciones.model');

const RPERMISOS_TABLE = 'roles_permisos';

const RpermisosSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  cod_rol: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: ROLES_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  cod_menu_accion: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: ACCIONES_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}

class Rpermisos extends Model {

  static associate(models) {
    this.belongsTo(models.Roles, { foreignKey: 'cod_rol', as: 'roles' });
    this.belongsTo(models.Acciones, { foreignKey: 'cod_menu_accion', as: 'acciones' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: RPERMISOS_TABLE,
      modelName: 'Rpermisos',
      timestamps: false
    }
  }
}

module.exports = { Rpermisos, RpermisosSchema, RPERMISOS_TABLE };
