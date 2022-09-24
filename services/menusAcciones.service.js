const boom = require('@hapi/boom');

const { models, Sequelize }= require('../libs/sequelize');

class AccionesService {

  constructor() {}

  async find(menu) {
    let params = {};

    if(menu) params.cod_menu = menu;

    const acciones = await models.Acciones.findAll({
      where: params
    });
    return acciones;
  }
}

module.exports = AccionesService;
