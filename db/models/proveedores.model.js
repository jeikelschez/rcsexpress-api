const { Model, DataTypes, Sequelize } = require('sequelize');

const PROVEEDORES_TABLE = 'proveedores';

const ProveedoresSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  nb_proveedor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nb_beneficiario: {
    type: DataTypes.STRING,
  },
  rif_proveedor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nit_proveedor: {
    type: DataTypes.STRING,
  },
  direccion_fiscal: {
    type: DataTypes.STRING,
  },
  direccion_correo: {
    type: DataTypes.STRING,
  },
  tlf_proveedor: {
    type: DataTypes.STRING,
  },
  fax_proveedor: {
    type: DataTypes.STRING,
  },
  email_proveedor: {
    type: DataTypes.STRING,
  },
  condicion_pago: {
    type: DataTypes.INTEGER,
  },
  observacion: {
    type: DataTypes.STRING,
  },
  tipo_servicio: {
    type: DataTypes.STRING,
  },
  cod_tipo_retencion: {
    type: DataTypes.STRING,
  },
  tipo_persona: {
    type: DataTypes.STRING,
  },
  flag_activo: {
    type: DataTypes.STRING,
  }
}

class Proveedores extends Model {

  static associate(models) {
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PROVEEDORES_TABLE,
      modelName: 'Proveedores',
      timestamps: false
    }
  }
}

module.exports = { Proveedores, ProveedoresSchema, PROVEEDORES_TABLE };
