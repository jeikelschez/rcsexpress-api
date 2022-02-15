const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class EstadoService {

  constructor() {}

  async create(data) {
    const newEstado = await models.Estado.create(data);
    return newEstado;
  }

  async find() {
    const estados = await models.Estado.findAll({
      include: ['pais']
    });
    return estados;
  }

  async findOne(id) {
    const estado = await models.Estado.findByPk(id, {
      include: ['pais']
    });
    if (!estado) {
      throw boom.notFound('Estado no existe');
    }
    return estado;
  }

  async findOneCiudades(id) {
    const estado = await models.Estado.findByPk(id, {
      include: ['ciudades']
    });
    if (!estado) {
      throw boom.notFound('Estado no existe');
    }
    return estado;
  }

  async update(id, changes) {
    const estado = await models.Estado.findByPk(id);
    if (!estado) {
      throw boom.notFound('Estado no existe');
    }
    const rta = await estado.update(changes);
    return rta;
  }

  async delete(id) {
    const estado = await models.Estado.findByPk(id);
    if (!estado) {
      throw boom.notFound('Estado no existe');
    }
    await estado.destroy();
    return { id };
  }
}

module.exports = EstadoService;
