const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');

class BancosService {

  constructor() {}

  async create(data) {
    const newBanco = await models.Bancos.create(data);
    return newBanco;
  }

  async find() {
    const bancos = await models.Bancos.findAll();
    return bancos;
  }

  async findOne(id) {
    const banco = await models.Bancos.findByPk(id);
    if (!banco) {
      throw boom.notFound('Banco no existe');
    }
    return banco;
  }

  async update(id, changes) {
    const banco = await models.Bancos.findByPk(id);
    if (!banco) {
      throw boom.notFound('Banco no existe');
    }
    const rta = await banco.update(changes);
    return rta;
  }

  async delete(id) {
    const banco = await models.Bancos.findByPk(id);
    if (!banco) {
      throw boom.notFound('Banco no existe');
    }
    await banco.destroy();
    return { id };
  }
}

module.exports = BancosService;
