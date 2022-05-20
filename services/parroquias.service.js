const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class ParroquiasService {

  constructor() {}

  async find() {
    const parroquias = await models.Parroquias.findAll();
    return parroquias;
  }

  async findOne(id) {
    const parroquia = await models.Parroquias.findByPk(id);
    if (!parroquia) {
      throw boom.notFound('Parroquia no existe');
    }
    return parroquia;
  }
}

module.exports = ParroquiasService;
