const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');

class PaisesService {

  constructor() {}

  async create(data) {
    const newPais = await models.Paises.create(data);
    return newPais;
  }

  async find() {
    const paises = await models.Paises.findAll();
    return paises;
  }

  async findOne(id) {
    const pais = await models.Paises.findByPk(id);
    if (!pais) {
      throw boom.notFound('Pais no existe');
    }
    return pais;
  }

  async update(id, changes) {
    const pais = await models.Paises.findByPk(id);
    if (!pais) {
      throw boom.notFound('Pais no existe');
    }
    const rta = await pais.update(changes);
    return rta;
  }

  async delete(id) {
    const pais = await models.Paises.findByPk(id);
    if (!pais) {
      throw boom.notFound('Pais no existe');
    }
    await pais.destroy();
    return { id };
  }
}

module.exports = PaisesService;
