const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class TiposService {

  constructor() {}

  async find(fuente) {
    let params = {};
    if(fuente) params.fuente = fuente;
    const tipos = await models.Tipos.findAll({
      where: params
    });
    return tipos;
  }
}

module.exports = TiposService;
