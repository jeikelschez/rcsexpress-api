const { Bancos, BancosSchema } = require('./bancos.model');
const { Paises, PaisesSchema } = require('./paises.model');
const { Estados, EstadosSchema } = require('./estados.model');
const { Ciudades, CiudadesSchema } = require('./ciudades.model');
const { Agencias, AgenciasSchema } = require('./agencias.model');

function setupModels(sequelize) {
  Bancos.init(BancosSchema, Bancos.config(sequelize));
  Paises.init(PaisesSchema, Paises.config(sequelize));
  Estados.init(EstadosSchema, Estados.config(sequelize));
  Ciudades.init(CiudadesSchema, Ciudades.config(sequelize));
  Agencias.init(AgenciasSchema, Agencias.config(sequelize));

  Paises.associate(sequelize.models);
  Estados.associate(sequelize.models);
  Ciudades.associate(sequelize.models);
  Agencias.associate(sequelize.models);
}

module.exports = setupModels;
