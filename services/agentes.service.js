const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class ObjetosService {

  constructor() {}

  async create(data) {
    const newAgente = await models.Agentes.create(data);
    return newAgente;
  }

  async find() {
    const agentes = await models.Agentes.findAll();
    return agentes;
  }

  async findOne(id) {
    const agente = await models.Agentes.findByPk(id);
    if (!agente) {
      throw boom.notFound('Agente no existe');
    }
    return agente;
  }

  async update(id, changes) {
    const agente = await models.Agentes.findByPk(id);
    if (!agente) {
      throw boom.notFound('Agente no existe');
    }
    const rta = await agente.update(changes);
    return rta;
  }

  async delete(id) {
    const agente = await models.Agentes.findByPk(id);
    if (!agente) {
      throw boom.notFound('Agente no existe');
    }
    await agente.destroy();
    return { id };
  }
}

module.exports = ObjetosService;
