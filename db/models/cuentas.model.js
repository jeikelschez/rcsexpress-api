const { Model, DataTypes, Sequelize } = require('sequelize');

const { BANCOS_TABLE } = require('./bancos.model');

const CUENTAS_TABLE = 'cuentas_bancarias';

const CuentasSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  nro_cuenta: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  tipo_cuenta: {
    type: DataTypes.STRING,
  },
  firma_autorizada: {
    type: DataTypes.STRING,
  },
  flag_activa: {
    type: DataTypes.STRING,
  },
  cod_banco: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: BANCOS_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}

class Cuentas extends Model {

  static associate(models) {
    this.belongsTo(models.Bancos, { foreignKey: 'cod_banco', as: 'bancos' });
    this.hasMany(models.Ccomisiones, { foreignKey: 'cod_cuenta', as: 'comisiones' });
    this.hasMany(models.Mcobranzas, { foreignKey: 'cod_cuenta', as: 'cobranzas' });
    this.hasMany(models.Pgenerados, { foreignKey: 'cod_cuenta', as: 'ctaspagar' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CUENTAS_TABLE,
      modelName: 'Cuentas',
      timestamps: false
    }
  }
}

module.exports = { Cuentas, CuentasSchema, CUENTAS_TABLE };
