const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class CiudadService {

  constructor() {}

  async create(data) {
    const newCiudad = await models.Ciudad.create(data);
    return newCiudad;
  }

  async find() {
    const ciudades = await models.Ciudad.findAll({
      include: [
        {
          association: 'estado',
          include: ['pais']
        }
      ]
    });
    return ciudades;
  }

  async findOne(id) {
    const ciudad = await models.Ciudad.findByPk(id, {
      include: [
        {
          association: 'estado',
          include: ['pais']
        }
      ]
    });
    if (!ciudad) {
      throw boom.notFound('Ciudad no existe');
    }
    return ciudad;
  }

  async update(id, changes) {
    const ciudad = await models.Ciudad.findByPk(id);
    if (!ciudad) {
      throw boom.notFound('Ciudad no existe');
    }
    const rta = await ciudad.update(changes);
    return rta;
  }

  async delete(id) {
    const ciudad = await models.Ciudad.findByPk(id);
    if (!ciudad) {
      throw boom.notFound('Ciudad no existe');
    }
    await ciudad.destroy();
    return { id };
  }
}

module.exports = CiudadService;
