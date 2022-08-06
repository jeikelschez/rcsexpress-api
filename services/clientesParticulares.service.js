const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class CparticularesService {

  constructor() {}

  async create(data) {
    const newCparticular = await models.Cparticulares.create(data);
    return newCparticular;
  }

  async findOne(id) {
    const cParticular = await models.Cparticulares.findByPk(id);
    if (!cParticular) {
      throw boom.notFound('Cliente Particular no existe');
    }
    return cParticular;
  }

  async update(id, changes) {
    const cParticular = await models.Cparticulares.findByPk(id);
    if (!cParticular) {
      throw boom.notFound('Cliente Particular no existe');
    }
    const rta = await cParticular.update(changes);
    return rta;
  }

  async delete(id) {
    const cParticular = await models.Cparticulares.findByPk(id);
    if (!cParticular) {
      throw boom.notFound('Cliente Particular no existe');
    }
    await cParticular.destroy();
    return { id };
  }
}

module.exports = CparticularesService;
