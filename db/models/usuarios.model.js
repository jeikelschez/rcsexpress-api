const bcrypt = require('bcrypt');

const { Model, DataTypes, Sequelize } = require('sequelize');

const { AGENCIAS_TABLE } = require('./agencias.model');
const { ROLES_TABLE } = require('./roles.model');

const USUARIOS_TABLE = 'usuarios';

const UsuariosSchema = {
  login: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.STRING,
  },
  password: {
    allowNull: false,
    type: DataTypes.STRING,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activo: {
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

class Usuarios extends Model {

  static associate(models) {
    this.belongsTo(models.Agencias, { foreignKey: 'cod_agencia', as: 'agencias' });
    this.belongsTo(models.Roles, { foreignKey: 'cod_rol', as: 'roles' });
  }

  static hooks(models) {
    this.beforeCreate(async (usuarios) => {
      if (usuarios.password) {
        const salt = await bcrypt.genSaltSync(10, 'a');
        usuarios.password = bcrypt.hashSync(usuarios.password, salt);
      }
    });
    /*this.beforeUpdate(async (usuarios) => {
      if (usuarios.password != null) {
        const salt = await bcrypt.genSaltSync(10, 'a');
        usuarios.password = bcrypt.hashSync(usuarios.password, salt);
      }
    });*/
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: USUARIOS_TABLE,
      modelName: 'Usuarios',
      timestamps: false
    }
  }
}

module.exports = { Usuarios, UsuariosSchema, USUARIOS_TABLE };
