const { Model, DataTypes, Sequelize } = require('sequelize');
const moment = require('moment');

const { CISLR_TABLE } = require('./controlIslr.model');
const { PROVEEDORES_TABLE } = require('./proveedores.model');
const { MCTAPAGAR_TABLE } = require('./maestroCtaPagar.model');

const CISLRFAC_TABLE = 'control_islr_factura';

const CislrfacSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  cod_islr: {
    unique: 'uniqueTag',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: CISLR_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  mes_compra: {
    unique: 'uniqueTag',
    allowNull: false,
    type: DataTypes.DECIMAL,
  },
  id_compra: {
    unique: 'uniqueTag',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: MCTAPAGAR_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  aplica: {
    allowNull: false,
    type: DataTypes.DECIMAL,
  },
  nro_factura: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  fecha_factura: {
    allowNull: false,
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_factura')
        ? moment(this.getDataValue('fecha_factura')).format('DD/MM/YYYY')
        : null;
    },
  },
  cod_proveedor: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: PROVEEDORES_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  monto_base: {
    type: DataTypes.DECIMAL,
  },
  nro_documento: {
    type: DataTypes.STRING,
  },
  nro_comprobante: {
    type: DataTypes.DECIMAL,
  },
  t_comprobante: {
    type: DataTypes.DECIMAL,
  },
  saldo_retenido: {
    type: DataTypes.DECIMAL,
  },
};

class Cislrfac extends Model {
  static associate(models) {
    this.belongsTo(models.Cislr, { foreignKey: 'cod_islr', as: 'retenciones' });
    this.belongsTo(models.Proveedores, {
      foreignKey: 'cod_proveedor',
      as: 'proveedores',
    });
    this.belongsTo(models.Mctapagar, {
      foreignKey: 'id_compra',
      as: 'compras',
      allowNull: false
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CISLRFAC_TABLE,
      modelName: 'Cislrfac',
      timestamps: false,
    };
  }
}

module.exports = { Cislrfac, CislrfacSchema, CISLRFAC_TABLE };
