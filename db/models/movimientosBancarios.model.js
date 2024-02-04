const { Model, DataTypes, Sequelize } = require('sequelize');
const moment = require('moment');

const { CUENTAS_TABLE } = require('./cuentas.model');

const MBANCARIOS_TABLE = 'movimientos_bancarios';

const MbancariosSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
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
  tipo_transaccion: {    
    type: DataTypes.STRING,
  },
  fecha_movimiento: {
    type: DataTypes.DATEONLY,
    get: function () {
      return moment(this.getDataValue('fecha_movimiento')).format('DD/MM/YYYY') != 'Invalid date'
        ? moment(this.getDataValue('fecha_movimiento')).format('DD/MM/YYYY')
        : '00/00/0000';
    },
  },  
  nro_documento: {
    type: DataTypes.DECIMAL,
  },
  tipo_documento: {
    type: DataTypes.STRING,
  },  
  monto_movimiento: {
    type: DataTypes.DECIMAL,
  },  
  observacion: {
    type: DataTypes.STRING,
  },  
  beneficiario: {
    type: DataTypes.STRING,
  },  
  tipo_pago: {
    type: DataTypes.STRING,
  }
}

class Mbancarios extends Model {

  static associate(models) {;
    this.belongsTo(models.Cuentas, { foreignKey: 'cod_cuenta', as: 'cuentas' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: MBANCARIOS_TABLE,
      modelName: 'Mbancarios',
      timestamps: false
    }
  }
}

module.exports = { Mbancarios, MbancariosSchema, MBANCARIOS_TABLE };
