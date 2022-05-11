const { Model, DataTypes, Sequelize } = require('sequelize');

const { CIUDADES_TABLE } = require('./ciudades.model');

const AGENCIAS_TABLE = 'agencias';

const AgenciasSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  nb_agencia: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  persona_contacto: {
    type: DataTypes.STRING,
  },
  dir_agencia: {
    type: DataTypes.STRING,
  },
  fax_agencia: {
    type: DataTypes.STRING,
  },
  email_agencia: {
    type: DataTypes.STRING,
  },
  tlf_agencia: {
    type: DataTypes.STRING,
  },
  rif_agencia: {
    type: DataTypes.STRING,
  },
  nit_agencia: {
    type: DataTypes.STRING,
  },
  estatus: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cod_ciudad: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: CIUDADES_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}

class Agencias extends Model {

  static associate(models) {
    this.belongsTo(models.Ciudades, { foreignKey: 'cod_ciudad', as: 'ciudades' });
    this.hasMany(models.Roles, { foreignKey: 'cod_agencia', as: 'roles' });
    this.hasMany(models.Usuarios, { foreignKey: 'cod_agencia', as: 'usuarios' });
    this.hasMany(models.Agentes, { foreignKey: 'cod_agencia', as: 'agentes' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: AGENCIAS_TABLE,
      modelName: 'Agencias',
      timestamps: false
    }
  }
}

module.exports = { Agencias, AgenciasSchema, AGENCIAS_TABLE };
