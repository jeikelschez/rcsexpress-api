const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class LocalidadesService {

  constructor() {}

  async find(page, limit, order_by, order_direction, filter, filter_value, estado) {    
    let params2 = {};
    let filterArray = {};
    let order = []; 
    
    if(estado) params2.cod_estado = estado;

    if(filter && filter_value) {
      let filters = [];
      filter.split(",").forEach(function(item) {
        let itemArray = {};
        itemArray[item] = { [Sequelize.Op.substring]: filter_value };
        filters.push(itemArray);
      })

      filterArray = { 
        [Sequelize.Op.or]: filters 
      };      
    }

    let params = { ...params2, ...filterArray };

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
