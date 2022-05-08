const { Model, DataTypes, Sequelize } = require('sequelize');

const OBJETOS_TABLE = 'objetos';

const ObjetosSchema = {
  codigo: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}

class Objetos extends Model {

  static associate(models) {
    this.hasMany(models.Permisos, { foreignKey: 'codigo', as: 'permisos' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: OBJETOS_TABLE,
      modelName: 'Objetos',
      timestamps: false
    }
  }
}

module.exports = { Objetos, ObjetosSchema, OBJETOS_TABLE };
