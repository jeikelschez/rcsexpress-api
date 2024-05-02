const { Model, DataTypes, Sequelize } = require('sequelize');

const { CLIENTES_TABLE } = require('./clientes.model');

const CUSUARIOS_TABLE = 'clientes_usuarios';

const CusuariosSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  cod_cliente: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: CLIENTES_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  email: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  password: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  estatus: {
    allowNull: false,
    type: DataTypes.STRING,
  },
}

class Cusuarios extends Model {

  static associate(models) {
    this.belongsTo(models.Clientes, { foreignKey: 'cod_cliente', as: 'clientes' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CUSUARIOS_TABLE,
      modelName: 'Cusuarios',
      timestamps: false
    }
  }
}

module.exports = { Cusuarios, CusuariosSchema, CUSUARIOS_TABLE };
