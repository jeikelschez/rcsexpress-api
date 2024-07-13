const { Model, DataTypes, Sequelize } = require('sequelize');

const { CUENTAS_TABLE } = require('./cuentas.model');

const CHEQUERAS_TABLE = 'chequeras';

const ChequerasSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  cod_cuenta: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: CUENTAS_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  nro_chequera: {
    allowNull: false,
    type: DataTypes.DECIMAL,
  },
  primer_cheque: {
    type: DataTypes.DECIMAL,
  },
  ultimo_cheque: {
    type: DataTypes.DECIMAL,
  },
  ultimo_cheque_asignado: {
    type: DataTypes.DECIMAL,
  },
  estatus_chequera: {
    type: DataTypes.STRING,
  },
};

class Chequeras extends Model {
  static associate(models) {
    this.belongsTo(models.Cuentas, { foreignKey: 'cod_cuenta', as: 'cuentas' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CHEQUERAS_TABLE,
      modelName: 'Chequeras',
      timestamps: false,
    };
  }
}

module.exports = { Chequeras, ChequerasSchema, CHEQUERAS_TABLE };
