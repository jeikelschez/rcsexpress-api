const { Model, DataTypes, Sequelize } = require('sequelize');

const MENUS_TABLE = 'menus';

const MenusSchema = {
  name: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  qitem: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: false,
  },
  direct: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  padre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dorder: {
    type: DataTypes.INTEGER,
  },  
}

class Menus extends Model {

  static associate(models) {
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: MENUS_TABLE,
      modelName: 'Menus',
      timestamps: false
    }
  }
}

module.exports = { Menus, MenusSchema, MENUS_TABLE };
