const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class LocalidadesService {

  constructor() {}

  async find() {
    const localidades = await models.Localidades.findAll();
    return localidades;
  }

  async findOne(id) {
    const localidad = await models.Localidades.findByPk(id);
    if (!localidad) {
      throw boom.notFound('Localidad no existe');
    }
    return localidad;
  }
}

module.exports = LocalidadesService;
