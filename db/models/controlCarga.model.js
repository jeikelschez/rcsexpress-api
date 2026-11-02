const { Model, DataTypes, Sequelize } = require('sequelize');
const moment = require('moment');

const { AGENCIAS_TABLE } = require('./agencias.model');

const CCARGA_TABLE = 'control_carga';

const CcargaSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
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
  // Chofer y vehículo del catálogo: misma llave (chofer + vehículo + fecha)
  // que usa Costos para ubicar el costo de un camión en el día.
  cod_agente: {
    type: DataTypes.INTEGER,
  },
  cod_unidad: {
    type: DataTypes.INTEGER,
  },
  // Placa y nombre se guardan también como texto para mostrarlos sin joins
  vehiculo: {
    type: DataTypes.STRING,
  },
  chofer: {
    type: DataTypes.STRING,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    get() {
      const v = this.getDataValue('fecha');
      return v ? moment(v).format('DD/MM/YYYY') : null;
    },
  },
  estado: {
    allowNull: false,
    type: DataTypes.STRING,
    defaultValue: 'ABIERTA',
  },
  via: {
    allowNull: false,
    type: DataTypes.STRING,
    defaultValue: 'ALMACEN',
  },
  cod_costo: {
    type: DataTypes.INTEGER,
  },
  usuario: {
    type: DataTypes.STRING,
  },
  observacion: {
    type: DataTypes.STRING,
  },
};

class Ccarga extends Model {
  static associate(models) {
    this.belongsTo(models.Agencias, { foreignKey: 'cod_agencia', as: 'agencias' });
    this.belongsTo(models.Agentes, { foreignKey: 'cod_agente', as: 'agentes' });
    this.belongsTo(models.Unidades, { foreignKey: 'cod_unidad', as: 'unidades' });
    this.hasMany(models.Ccargab, { foreignKey: 'cod_control_carga', as: 'bultos' });
    this.hasMany(models.Ccargag, { foreignKey: 'cod_control_carga', as: 'guias' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CCARGA_TABLE,
      modelName: 'Ccarga',
      timestamps: false,
    };
  }
}

module.exports = { Ccarga, CcargaSchema, CCARGA_TABLE };
