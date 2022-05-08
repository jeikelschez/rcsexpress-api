const { Model, DataTypes, Sequelize } = require('sequelize');

const { AGENCIAS_TABLE } = require('./agencias.model');

const ROLES_TABLE = 'roles';

const RolesSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  descripcion: {
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

class Roles extends Model {

  static associate(models) {
    this.belongsTo(models.Agencias, { foreignKey: 'cod_agencia', as: 'agencias' });
    this.hasMany(models.Permisos, { foreignKey: 'cod_rol', as: 'permisos' });
    this.hasMany(models.Usuarios, { foreignKey: 'cod_rol', as: 'usuarios' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: ROLES_TABLE,
      modelName: 'Roles',
      timestamps: false
    }
  }
}

module.exports = { Roles, RolesSchema, ROLES_TABLE };
