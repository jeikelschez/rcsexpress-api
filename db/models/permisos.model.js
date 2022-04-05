const { Model, DataTypes, Sequelize } = require('sequelize');

const { OBJETOS_TABLE } = require('./objetos.model');
const { ROLES_TABLE } = require('./roles.model');

const PERMISOS_TABLE = 'permisos';

const PermisosSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  codigo: {
    allowNull: false,
    type: DataTypes.STRING,
    references: {
      model: OBJETOS_TABLE,
      key: 'codigo'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
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
  }
}

class Permisos extends Model {

  static associate(models) {
    this.belongsTo(models.Objetos, { foreignKey: 'codigo', as: 'objetos' });
    this.belongsTo(models.Roles, { foreignKey: 'cod_rol', as: 'roles' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PERMISOS_TABLE,
      modelName: 'Permisos',
      timestamps: false
    }
  }
}

module.exports = { Permisos, PermisosSchema, PERMISOS_TABLE };
