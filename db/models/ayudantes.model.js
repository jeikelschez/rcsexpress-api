const { Model, DataTypes, Sequelize } = require('sequelize');

const AYUDANTES_TABLE = 'ayudantes';

const AyudantesSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  nb_ayudante: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dir_ayudante: {
    type: DataTypes.STRING,
  },
  tlf_ayudante: {
    type: DataTypes.STRING,
  },
  cel_ayudante: {
    type: DataTypes.STRING,
  },
  flag_activo: {
    type: DataTypes.STRING,
  }
}

class Ayudantes extends Model {

  static associate(models) {
    this.hasMany(models.Costos, { foreignKey: 'cod_ayudante', as: 'costos' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: AYUDANTES_TABLE,
      modelName: 'Ayudantes',
      timestamps: false
    }
  }
}

module.exports = { Ayudantes, AyudantesSchema, AYUDANTES_TABLE };
