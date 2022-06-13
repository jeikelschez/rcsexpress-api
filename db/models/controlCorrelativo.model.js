const { Model, DataTypes, Sequelize } = require('sequelize');

const { AGENCIAS_TABLE } = require('./agencias.model');
const { TIPOS_TABLE } = require('./tipos.model');

const CORRELATIVO_TABLE = 'control_correlativo';

const CorrelativoSchema = {
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
  ult_doc_referencia: {
    type: DataTypes.DECIMAL,
  },
  estatus_lote: {
    type: DataTypes.STRING,
  },
  serie_doc: {
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

class Correlativo extends Model {

  static associate(models) {
    this.belongsTo(models.Agencias, { foreignKey: 'cod_agencia', as: 'agencias' });
    this.belongsTo(models.Tipos, { foreignKey: 'tipo', as: 'tipos' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CORRELATIVO_TABLE,
      modelName: 'Correlativo',
      timestamps: false
    }
  }
}

module.exports = { Correlativo, CorrelativoSchema, CORRELATIVO_TABLE };
