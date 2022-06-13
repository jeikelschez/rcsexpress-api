const { Model, DataTypes, Sequelize } = require('sequelize');

const { AGENCIAS_TABLE } = require('./agencias.model');
const { AGENTES_TABLE } = require('./agentes.model');
const { CLIENTES_TABLE } = require('./clientes.model');
const { TIPOS_TABLE } = require('./tipos.model');

const CGUIAS_TABLE = 'control_guias';

const CguiasSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  control_inicio: {
    allowNull: false,
    type: DataTypes.DECIMAL,
  },
  control_final: {
    allowNull: false,
    type: DataTypes.DECIMAL,
  },
  cant_asignada: {
    type: DataTypes.DECIMAL,
  },
  cant_disponible: {
    type: DataTypes.DECIMAL,
  },
  fecha_asignacion: {
    type: DataTypes.STRING,
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
  cod_agente: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: AGENTES_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
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
  tipo: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: TIPOS_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}

class Cguias extends Model {

  static associate(models) {
    this.belongsTo(models.Agencias, { foreignKey: 'cod_agencia', as: 'agencias' });
    this.belongsTo(models.Agentes, { foreignKey: 'cod_agencia', as: 'agentes' });
    this.belongsTo(models.Clientes, { foreignKey: 'cod_agencia', as: 'clientes' });
    this.belongsTo(models.Tipos, { foreignKey: 'tipo', as: 'tipos' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CGUIAS_TABLE,
      modelName: 'Cguias',
      timestamps: false
    }
  }
}

module.exports = { Cguias, CguiasSchema, CGUIAS_TABLE };
