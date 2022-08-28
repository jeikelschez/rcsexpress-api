const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class LocalidadesService {

  constructor() {}

  async find(page, limit, order_by, order_direction, estado) {    
    let params = {};
    let order = [];
    
    if(estado) params.cod_estado = estado;

    if(order_by && order_direction) {
      order.push([order_by, order_direction]);
    }

    return await utils.paginate(models.Localidades, page, limit, params, order);
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
