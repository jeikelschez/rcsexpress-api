const { Model, DataTypes, Sequelize } = require('sequelize');
const moment = require('moment');

const MRETENCIONES_TABLE = 'maestro_retenciones';

const MretencionesSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  cod_tipo_persona: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'uniqueTag',
  },
  cod_tipo_retencion: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'uniqueTag',
  },
  nb_tipo_retencion: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  porc_base: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  porc_retencion: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  pago_mayor: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  sustraendo: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  cod_seniat: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha_ini_val: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_ini_val')
        ? moment(this.getDataValue('fecha_ini_val')).format('DD/MM/YYYY')
        : null;
    },
    allowNull: false,
    unique: 'uniqueTag',
  },
  fecha_fin_val: {
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_fin_val')
        ? moment(this.getDataValue('fecha_fin_val')).format('DD/MM/YYYY')
        : null;
    },
    allowNull: false,
    unique: 'uniqueTag',
  }
}

class Mretenciones extends Model {

  static associate(models) {
    this.hasMany(models.Proveedores, { foreignKey: 'cod_tipo_retencion', as: 'proveedores' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: MRETENCIONES_TABLE,
      modelName: 'Mretenciones',
      timestamps: false
    }
  }
}

module.exports = { Mretenciones, MretencionesSchema, MRETENCIONES_TABLE };
