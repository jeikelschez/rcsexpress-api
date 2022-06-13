const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class MunicipiosService {

  constructor() {}

  async find(estado) {
    let params = {};
    if(estado) params.cod_estado = estado;
    const municipios = await models.Municipios.findAll({
      where: params
    });
    return municipios;
  }

  async findOne(id) {
    const municipio = await models.Municipios.findByPk(id);
    if (!municipio) {
      throw boom.notFound('Municipio no existe');
    }
    return municipio;
  }
}

module.exports = MunicipiosService;
