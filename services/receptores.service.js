const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');

class ReceptoresService {

  constructor() {}

  async create(data) {
    const newReceptor = await models.Receptores.create(data);
    return newReceptor;
  }

  async find() {
    const receptores = await models.Receptores.findAll();
    return receptores;
  }

  async findOne(id) {
    const receptor = await models.Receptores.findByPk(id);
    if (!receptor) {
      throw boom.notFound('Receptor no existe');
    }
    return receptor;
  }

  async update(id, changes) {
    const receptor = await models.Receptores.findByPk(id);
    if (!receptor) {
      throw boom.notFound('Receptor no existe');
    }
    const rta = await receptor.update(changes);
    return rta;
  }

  async delete(id) {
    const receptor = await models.Receptores.findByPk(id);
    if (!receptor) {
      throw boom.notFound('Receptor no existe');
    }
    await receptor.destroy();
    return { id };
  }
}

module.exports = ReceptoresService;
