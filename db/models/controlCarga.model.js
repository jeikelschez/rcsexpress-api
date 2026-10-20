const { Model, DataTypes, Sequelize } = require('sequelize');

const { AGENCIAS_TABLE } = require('./agencias.model');

const CCARGA_TABLE = 'control_carga';

const CcargaSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  cod_agencia: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: AGENCIAS_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  vehiculo: {
    type: DataTypes.STRING,
  },
  chofer: {
    type: DataTypes.STRING,
  },
  fecha: {
    type: DataTypes.STRING,
  },
  estado: {
    allowNull: false,
    type: DataTypes.STRING,
    defaultValue: 'ABIERTA',
  },
  via: {
    allowNull: false,
    type: DataTypes.STRING,
    defaultValue: 'ALMACEN',
  },
  cod_costo: {
    type: DataTypes.INTEGER,
  },
  usuario: {
    type: DataTypes.STRING,
  },
  observacion: {
    type: DataTypes.STRING,
  },
};

class Ccarga extends Model {
  static associate(models) {
    this.belongsTo(models.Agencias, { foreignKey: 'cod_agencia', as: 'agencias' });
    this.hasMany(models.Ccargab, { foreignKey: 'cod_control_carga', as: 'bultos' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CCARGA_TABLE,
      modelName: 'Ccarga',
      timestamps: false,
    };
  }
}

module.exports = { Ccarga, CcargaSchema, CCARGA_TABLE };
