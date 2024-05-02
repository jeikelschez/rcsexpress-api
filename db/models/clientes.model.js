const { Model, DataTypes, Sequelize } = require('sequelize');

const { AGENCIAS_TABLE } = require('./agencias.model');
const { AGENTES_TABLE } = require('./agentes.model');
const { CIUDADES_TABLE } = require('./ciudades.model');
const { MUNICIPIOS_TABLE } = require('./municipios.model');
const { PARROQUIAS_TABLE } = require('./parroquias.model');
const { LOCALIDADES_TABLE } = require('./localidades.model');

const CLIENTES_TABLE = 'clientes';

const ClientesSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  nb_cliente: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rif_cedula: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nit: {
    type: DataTypes.STRING,
  },
  dir_correo: {
    type: DataTypes.STRING,
  },
  dir_fiscal: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
  },
  tlf_cliente: {
    type: DataTypes.STRING,
  },
  fax: {
    type: DataTypes.STRING,
  },
  razon_social: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo_persona: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  modalidad_pago: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  persona_contacto: {
    type: DataTypes.STRING,
  },
  observacion: {
    type: DataTypes.STRING,
  },
  cte_decontado: {
    type: DataTypes.STRING,
  },
  tipo_persona_new: {
    type: DataTypes.STRING,
  },
  flag_activo: {
    type: DataTypes.STRING,
  },
  cod_agencia: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: AGENCIAS_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  cod_agente: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: AGENTES_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
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
  },
  cod_municipio: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: MUNICIPIOS_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  cod_parroquia: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: PARROQUIAS_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  cod_localidad: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: LOCALIDADES_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}

class Clientes extends Model {

  static associate(models) {
    this.belongsTo(models.Agencias, { foreignKey: 'cod_agencia', as: 'agencias' });
    this.belongsTo(models.Agentes, { foreignKey: 'cod_agente', as: 'agentes' });
    this.belongsTo(models.Ciudades, { foreignKey: 'cod_ciudad', as: 'ciudades' });
    this.belongsTo(models.Municipios, { foreignKey: 'cod_municipio', as: 'municipios' });
    this.belongsTo(models.Parroquias, { foreignKey: 'cod_parroquia', as: 'parroquias' });
    this.belongsTo(models.Localidades, { foreignKey: 'cod_localidad', as: 'localidades' });
    this.hasMany(models.Cguias, { foreignKey: 'cod_cliente', as: 'control_guias' });
    this.hasMany(models.Cusuarios, { foreignKey: 'cod_cliente', as: 'cusuarios' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CLIENTES_TABLE,
      modelName: 'Clientes',
      timestamps: false
    }
  }
}

module.exports = { Clientes, ClientesSchema, CLIENTES_TABLE };
