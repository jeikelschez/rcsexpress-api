const { Model, DataTypes, Sequelize } = require('sequelize');

const { CCARGA_TABLE } = require('./controlCarga.model');
const { MMOVIMIENTOS_TABLE } = require('./maestroMovimientos.model');

// Candado de guías: una fila por guía y control de carga. `activa` vale 1
// mientras el control está abierto o en proceso y NULL al cerrarlo; el índice
// único (cod_movimiento, activa) impide tener la guía en dos controles activos.
const CCARGAG_TABLE = 'control_carga_guias';

const CcargagSchema = {
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
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: MMOVIMIENTOS_TABLE,
      key: 'id',
    },
  },
  nro_documento: {
    type: DataTypes.STRING,
  },
  activa: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
};

class Ccargag extends Model {
  static associate(models) {
    this.belongsTo(models.Ccarga, {
      foreignKey: 'cod_control_carga',
      as: 'carga',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CCARGAG_TABLE,
      modelName: 'Ccargag',
      timestamps: false,
    };
  }
}

module.exports = { Ccargag, CcargagSchema, CCARGAG_TABLE };
