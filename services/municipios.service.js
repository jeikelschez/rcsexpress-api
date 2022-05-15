const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class MunicipiosService {

  constructor() {}

  async find() {
    const municipios = await models.Municipios.findAll();
    return municipios;
  }

  async findOne(id) {
    const municipio = await models.Municipios.findByPk(id);
    if (!municipio) {
      throw boom.notFound('Municipio no existe');
    }
    return municipio;
  }

  async findOneParroquias(id) {
    const municipio = await models.Municipios.findByPk(id, {
      include: ['parroquias']
    });
    if (!municipio) {
      throw boom.notFound('Municipio no existe');
    }
    return municipio;
  }
}

module.exports = MunicipiosService;
