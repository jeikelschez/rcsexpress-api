const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class MunicipiosService {

  constructor() {}

  async find(page, limit, order_by, order_direction, estado) {    
    let params = {};
    let order = [];
    
    if(estado) params.cod_estado = estado;

    if(order_by && order_direction) {
      order.push([order_by, order_direction]);
    }

    return await utils.paginate(models.Municipios, page, limit, params, order);
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
