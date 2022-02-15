const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class PaisService {

  constructor() {}

  async create(data) {
    const newPais = await models.Pais.create(data);
    return newPais;
  }

  async find() {
    const paises = await models.Pais.findAll();
    return paises;
  }

  async findOne(id) {
    const pais = await models.Pais.findByPk(id);
    if (!pais) {
      throw boom.notFound('Pais no existe');
    }
    return pais;
  }

  async findOneEstados(id) {
    const pais = await models.Pais.findByPk(id, {
      include: ['estados']
    });
    if (!pais) {
      throw boom.notFound('Pais no existe');
    }
    return pais;
  }

  async update(id, changes) {
    const pais = await models.Pais.findByPk(id);
    if (!pais) {
      throw boom.notFound('Pais no existe');
    }
    const rta = await pais.update(changes);
    return rta;
  }

  async delete(id) {
    const pais = await models.Pais.findByPk(id);
    if (!pais) {
      throw boom.notFound('Pais no existe');
    }
    await pais.destroy();
    return { id };
  }
}

module.exports = PaisService;
