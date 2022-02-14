const { Banco, BancoSchema } = require('./banco.model');
const { Pais, PaisSchema } = require('./pais.model');
const { Estado, EstadoSchema } = require('./estado.model');
const { Ciudad, CiudadSchema } = require('./ciudad.model');

function setupModels(sequelize) {
  Banco.init(BancoSchema, Banco.config(sequelize));
  Pais.init(PaisSchema, Pais.config(sequelize));
  Estado.init(EstadoSchema, Estado.config(sequelize));
  Ciudad.init(CiudadSchema, Ciudad.config(sequelize));

  Pais.associate(sequelize.models);
  Estado.associate(sequelize.models);
  Ciudad.associate(sequelize.models);
}

module.exports = setupModels;
