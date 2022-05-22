const { Model, DataTypes, Sequelize } = require('sequelize');

const TARIFAS_TABLE = 'tarifas';

const TarifasSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  monto_tarifa: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  tipo_urgencia: {
    type: DataTypes.STRING,
  },
  tipo_tarifa: {
    type: DataTypes.STRING,
  },
  tipo_ubicacion: {
    type: DataTypes.STRING,
  },
  kgr_hasta: {
    type: DataTypes.DECIMAL,
  },
  tipo_carga: {
    type: DataTypes.STRING,
  },
  modalidad_pago: {
    type: DataTypes.STRING,
  },
  pagado_en: {
    type: DataTypes.STRING,
  },
  region_origen: {
    type: DataTypes.STRING,
  },
  region_destino: {
    type: DataTypes.STRING,
  },
  tiempo_servicio: {
    type: DataTypes.INTEGER,
  }
}

class Tarifas extends Model {

  static associate(models) {
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: TARIFAS_TABLE,
      modelName: 'Tarifas',
      timestamps: false
    }
  }
}

module.exports = { Tarifas, TarifasSchema, TARIFAS_TABLE };
