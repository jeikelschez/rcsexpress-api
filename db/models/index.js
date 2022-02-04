const { Banco, BancoSchema } = require('./banco.model');

function setupModels(sequelize) {
  Banco.init(BancoSchema, Banco.config(sequelize));
}

module.exports = setupModels;
