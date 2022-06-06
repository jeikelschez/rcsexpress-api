const { Model, DataTypes, Sequelize } = require('sequelize');

const EMPLEADOS_TABLE = 'empleados';

const EmpleadosSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  rif_empleado: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  aplica_retencion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  porcentaje_retencion: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  periodo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sueldo: {
    type: DataTypes.DECIMAL,
  }
}

class Empleados extends Model {

  static associate(models) {
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: EMPLEADOS_TABLE,
      modelName: 'Empleados',
      timestamps: false
    }
  }
}

module.exports = { Empleados, EmpleadosSchema, EMPLEADOS_TABLE };
