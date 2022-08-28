const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class ParroquiasService {

  constructor() {}

  async find(page, limit, order_by, order_direction, municipio) {    
    let params = {};
    let order = [];
    
    if(municipio) params.cod_municipio = municipio;

    if(order_by && order_direction) {
      order.push([order_by, order_direction]);
    }

    return await utils.paginate(models.Parroquias, page, limit, params, order);
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
