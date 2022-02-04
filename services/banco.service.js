const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class BancoService {

  constructor() {}

  async create(data) {
    const newBanco = await models.Banco.create(data);
    return newBanco;
  }

  async find() {
    const bancos = await models.Banco.findAll();
    return bancos;
  }

  async findOne(cod_banco) {
    const banco = await models.Banco.findByPk(cod_banco);
    if (!banco) {
      throw boom.notFound('Banco no existe');
    }
    return banco;
  }

  async update(cod_banco, changes) {
    const banco = await models.Banco.findByPk(cod_banco);
    if (!banco) {
      throw boom.notFound('Banco no existe');
    }
    const rta = await banco.update(changes);
    return rta;
  }

  async delete(cod_banco) {
    const banco = await models.Banco.findByPk(cod_banco);
    if (!banco) {
      throw boom.notFound('Banco no existe');
    }
    await banco.destroy();
    return { cod_banco };
  }
}

module.exports = BancoService;
