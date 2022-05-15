const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class AyudantesService {

  constructor() {}

  async create(data) {
    const newAyudante = await models.Ayudantes.create(data);
    return newAyudante;
  }

  async find() {
    const ayudantes = await models.Ayudantes.findAll();
    return ayudantes;
  }

  async findOne(id) {
    const ayudante = await models.Ayudantes.findByPk(id);
    if (!ayudante) {
      throw boom.notFound('Ayudante no existe');
    }
    return ayudante;
  }

  async update(id, changes) {
    const ayudante = await models.Ayudantes.findByPk(id);
    if (!ayudante) {
      throw boom.notFound('Ayudante no existe');
    }
    const rta = await ayudante.update(changes);
    return rta;
  }

  async delete(id) {
    const ayudante = await models.Ayudantes.findByPk(id);
    if (!ayudante) {
      throw boom.notFound('Ayudante no existe');
    }
    await ayudante.destroy();
    return { id };
  }
}

module.exports = AyudantesService;
