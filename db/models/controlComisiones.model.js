const { Model, DataTypes, Sequelize } = require('sequelize');

const { AGENCIAS_TABLE } = require('./agencias.model');
const { AGENTES_TABLE } = require('./agentes.model');
const { CUENTAS_TABLE } = require('./cuentas.model');
const { MMOVIMIENTOS_TABLE } = require('./maestroMovimientos.model');

const CCOMISIONES_TABLE = 'control_comisiones';

const CcomisionesSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  cod_agencia: {
    allowNull: false,
    unique: 'uniqueTag',
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
    unique: 'uniqueTag',
    type: DataTypes.INTEGER,
    references: {
      model: AGENTES_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  cod_movimiento: {
    allowNull: false,
    unique: 'uniqueTag',
    type: DataTypes.INTEGER,
    references: {
      model: MMOVIMIENTOS_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  fecha_emision: {
    allowNull: false,
    unique: 'uniqueTag',
    type: DataTypes.STRING,
  },
  tipo_comision: {
    allowNull: false,
    unique: 'uniqueTag',
    type: DataTypes.STRING,
  },
  monto_comision: {
    allowNull: false,
    type: DataTypes.DECIMAL,
  },
  estatus: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  cod_cuenta: {
    type: DataTypes.INTEGER,
    references: {
      model: CUENTAS_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  nro_cheque: {
    type: DataTypes.DECIMAL,
  }
}

class Ccomisiones extends Model {

  static associate(models) {
    this.belongsTo(models.Agencias, { foreignKey: 'cod_agencia', as: 'agencias' });
    this.belongsTo(models.Agentes, { foreignKey: 'cod_agencia', as: 'agentes' });
    this.belongsTo(models.Mmovimientos, { foreignKey: 'cod_movimiento', as: 'movimientos' });
    this.belongsTo(models.Cuentas, { foreignKey: 'cod_cuenta', as: 'cuentas' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CCOMISIONES_TABLE,
      modelName: 'Ccomisiones',
      timestamps: false
    }
  }
}

module.exports = { Ccomisiones, CcomisionesSchema, CCOMISIONES_TABLE };
