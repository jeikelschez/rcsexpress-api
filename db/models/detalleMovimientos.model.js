const { Model, DataTypes, Sequelize } = require('sequelize');

const { MMOVIMIENTOS_TABLE } = require('./maestroMovimientos.model');
const { COPERACION_TABLE } = require('./conceptosOperacion.model');
const { CFACTURACION_TABLE } = require('./conceptosFacturacion.model');

const DMOVIMIENTOS_TABLE = 'detalle_de_movimientos';

const DmovimientosSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  cod_movimiento: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: MMOVIMIENTOS_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  nro_item: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  cod_concepto: {
    type: DataTypes.INTEGER,
    references: {
      model: COPERACION_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  precio_unitario: {
    allowNull: false,
    type: DataTypes.DECIMAL,
  },
  cantidad: {
    type: DataTypes.DECIMAL,
  },
  importe_renglon: {
    type: DataTypes.DECIMAL,
  },
  descripcion: {
    type: DataTypes.STRING,
  },  
  porc_descuento: {
    type: DataTypes.DECIMAL,
  },
  monto_descuento: {
    type: DataTypes.DECIMAL,
  },
  cod_concepto_oper: {
    type: DataTypes.INTEGER,
    references: {
      model: CFACTURACION_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}

class Dmovimientos extends Model {

  static associate(models) {
    this.belongsTo(models.Mmovimientos, { foreignKey: 'cod_movimiento', as: 'movimientos' });
    this.belongsTo(models.Coperacion, { foreignKey: 'cod_concepto', as: 'conceptos' });
    this.belongsTo(models.Cfacturacion, { foreignKey: 'cod_concepto_oper', as: 'conceptos_operacion' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: DMOVIMIENTOS_TABLE,
      modelName: 'Dmovimientos',
      timestamps: false
    }
  }
}

module.exports = { Dmovimientos, DmovimientosSchema, DMOVIMIENTOS_TABLE };
