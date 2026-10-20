const { Model, DataTypes, Sequelize } = require('sequelize');

const { CCARGA_TABLE } = require('./controlCarga.model');
const { MMOVIMIENTOS_TABLE } = require('./maestroMovimientos.model');

const CCARGAB_TABLE = 'control_carga_bultos';

const CcargabSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  cod_control_carga: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: CCARGA_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  cod_movimiento: {
    type: DataTypes.INTEGER,
    references: {
      model: MMOVIMIENTOS_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  nro_documento: {
    type: DataTypes.STRING,
  },
  nro_bulto: {
    type: DataTypes.INTEGER,
  },
  codigo: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  destino: {
    type: DataTypes.STRING,
  },
  escaneado: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  estado_bulto: {
    allowNull: false,
    type: DataTypes.STRING,
    defaultValue: 'OK',
  },
  fecha_hora: {
    type: DataTypes.STRING,
  },
  usuario: {
    type: DataTypes.STRING,
  },
};

class Ccargab extends Model {
  static associate(models) {
    this.belongsTo(models.Ccarga, {
      foreignKey: 'cod_control_carga',
      as: 'carga',
    });
    this.belongsTo(models.Mmovimientos, {
      foreignKey: 'cod_movimiento',
      as: 'movimientos',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CCARGAB_TABLE,
      modelName: 'Ccargab',
      timestamps: false,
    };
  }
}

module.exports = { Ccargab, CcargabSchema, CCARGAB_TABLE };
