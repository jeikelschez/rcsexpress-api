const { Model, DataTypes, Sequelize } = require('sequelize');

const { AGENCIAS_TABLE } = require('./agencias.model');
const { CGUIAS_TABLE } = require('./controlGuias.model');
const { COPERACION_TABLE } = require('./conceptosOperacion.model');

const GINUTILIZADAS_TABLE = 'guias_inutilizadas';

const GinutilizadasSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  nro_guia: {
    type: DataTypes.DECIMAL,
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
  tipo_guia: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cod_control_guias: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: CGUIAS_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  observaciones: {
    type: DataTypes.STRING,
  },
  fecha_registro: {
    type: DataTypes.STRING,
  },
  cod_concepto: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: COPERACION_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  estatus_guia: {
    type: DataTypes.STRING,
  }
}

class Ginutilizadas extends Model {

  static associate(models) {
    this.belongsTo(models.Agencias, { foreignKey: 'cod_agencia', as: 'agencias' });
    this.belongsTo(models.Cguias, { foreignKey: 'cod_control_guias', as: 'cguias' });
    this.belongsTo(models.Coperacion, { foreignKey: 'cod_concepto', as: 'conceptos' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: GINUTILIZADAS_TABLE,
      modelName: 'Ginutilizadas',
      timestamps: false
    }
  }
}

module.exports = { Ginutilizadas, GinutilizadasSchema, GINUTILIZADAS_TABLE };
