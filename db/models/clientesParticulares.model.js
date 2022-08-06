const { Model, DataTypes, Sequelize } = require('sequelize');

const { AGENCIAS_TABLE } = require('./agencias.model');
const { CLIENTES_TABLE } = require('./clientes.model');
const { CIUDADES_TABLE } = require('./ciudades.model');
const { MUNICIPIOS_TABLE } = require('./municipios.model');
const { PARROQUIAS_TABLE } = require('./parroquias.model');
const { LOCALIDADES_TABLE } = require('./localidades.model');

const CPARTICULARES_TABLE = 'clientes_particulares';

const CparticularesSchema = {
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
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  cod_cliente: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: CLIENTES_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  rif_ci: {
    type: DataTypes.STRING,
  },
  nb_cliente: {
    type: DataTypes.STRING,
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
  direccion: {
    type: DataTypes.STRING,
  },
  telefonos: {
    type: DataTypes.STRING,
  },
  fax: {
    type: DataTypes.STRING,
  },
  estatus: {
    type: DataTypes.STRING,
  },
  cod_municipio: {
    type: DataTypes.INTEGER,
    references: {
      model: MUNICIPIOS_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  cod_parroquia: {
    type: DataTypes.INTEGER,
    references: {
      model: PARROQUIAS_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  cod_localidad: {
    type: DataTypes.INTEGER,
    references: {
      model: LOCALIDADES_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}

class Cparticulares extends Model {

  static associate(models) {
    this.belongsTo(models.Agencias, { foreignKey: 'cod_agencia', as: 'agencias' });
    this.belongsTo(models.Clientes, { foreignKey: 'cod_clientes', as: 'clientes' });
    this.belongsTo(models.Ciudades, { foreignKey: 'cod_ciudad', as: 'ciudades' });
    this.belongsTo(models.Municipios, { foreignKey: 'cod_municipio', as: 'municipios' });
    this.belongsTo(models.Parroquias, { foreignKey: 'cod_parroquia', as: 'parroquias' });
    this.belongsTo(models.Localidades, { foreignKey: 'cod_localidad', as: 'localidades' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CPARTICULARES_TABLE,
      modelName: 'Cparticulares',
      timestamps: false
    }
  }
}

module.exports = { Cparticulares, CparticularesSchema, CPARTICULARES_TABLE };
