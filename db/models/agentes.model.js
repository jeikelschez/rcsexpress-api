const { Model, DataTypes, Sequelize } = require('sequelize');

const { AGENCIAS_TABLE } = require('./agencias.model');

const AGENTES_TABLE = 'agentes';

const AgentesSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  nb_agente: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  persona_responsable: {
    type: DataTypes.STRING,
  },
  dir_agente: {
    type: DataTypes.STRING,
  },
  tlf_agente: {
    type: DataTypes.STRING,
  },
  fax_agente: {
    type: DataTypes.STRING,
  },
  cel_agente: {
    type: DataTypes.STRING,
  },
  email_web: {
    type: DataTypes.STRING,
  },
  tipo_agente: {
    type: DataTypes.STRING,
  },
  porc_comision_venta: {
    type: DataTypes.DECIMAL,
  },
  porc_comision_entrega: {
    type: DataTypes.DECIMAL,
  },
  porc_comision_seguro: {
    type: DataTypes.DECIMAL,
  },
  rif_ci_agente: {
    type: DataTypes.STRING,
  },
  flag_activo: {
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
  }
}

class Agentes extends Model {

  static associate(models) {
    this.belongsTo(models.Agencias, { foreignKey: 'cod_agencia', as: 'agencias' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: AGENTES_TABLE,
      modelName: 'Agentes',
      timestamps: false
    }
  }
}

module.exports = { Agentes, AgentesSchema, AGENTES_TABLE };
