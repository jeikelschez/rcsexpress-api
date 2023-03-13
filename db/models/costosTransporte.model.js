const { Model, DataTypes, Sequelize } = require('sequelize');
const moment = require('moment');

const { AGENCIAS_TABLE } = require('./agencias.model');
const { AGENTES_TABLE } = require('./agentes.model');
const { PROVEEDORES_TABLE } = require('./proveedores.model');
const { AYUDANTES_TABLE } = require('./ayudantes.model');
const { UNIDADES_TABLE } = require('./unidades.model');

const COSTOS_TABLE = 'costos_transporte';

const CostosSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  fecha_envio: {
    allowNull: false,
    type: DataTypes.DATEONLY,
    get: function () {
      return this.getDataValue('fecha_envio')
        ? moment(this.getDataValue('fecha_envio')).format('DD/MM/YYYY')
        : null;
    },
  },
  tipo_transporte: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  destino: {
    type: DataTypes.STRING,
  },
  observacion_gnral: {
    type: DataTypes.STRING,
  },
  monto_anticipo: {
    type: DataTypes.DECIMAL,
  },
  cod_agencia: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: AGENCIAS_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  cod_agente: {
    type: DataTypes.INTEGER,
    references: {
      model: AGENTES_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  cod_proveedor: {
    type: DataTypes.INTEGER,
    references: {
      model: PROVEEDORES_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  cod_ayudante: {
    type: DataTypes.INTEGER,
    references: {
      model: AYUDANTES_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  cod_transporte: {
    type: DataTypes.INTEGER,
    references: {
      model: UNIDADES_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
};

class Costos extends Model {
  static associate(models) {
    this.belongsTo(models.Agencias, {
      foreignKey: 'cod_agencia',
      as: 'agencias',
    });
    this.belongsTo(models.Agentes, { foreignKey: 'cod_agente', as: 'agentes' });
    this.belongsTo(models.Proveedores, {
      foreignKey: 'cod_proveedor',
      as: 'proveedores',
    });
    this.belongsTo(models.Ayudantes, {
      foreignKey: 'cod_ayudante',
      as: 'ayudantes',
    });
    this.belongsTo(models.Unidades, {
      foreignKey: 'cod_transporte',
      as: 'unidades',
    });
    this.hasMany(models.Dcostos, {
      foreignKey: 'cod_costo',
      as: 'detalles',
    });
    this.hasMany(models.Dcostosg, {
      foreignKey: 'cod_costo',
      as: 'detallesg',
    });
    this.belongsTo(models.Hdolar, {
      foreignKey: 'fecha_envio',
      as: 'dolar',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: COSTOS_TABLE,
      modelName: 'Costos',
      timestamps: false,
    };
  }
}

module.exports = { Costos, CostosSchema, COSTOS_TABLE };
