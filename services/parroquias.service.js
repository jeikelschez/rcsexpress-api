const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class ParroquiasService {

  constructor() {}

  async find(page, limit, order_by, order_direction, filter, filter_value, municipio) {    
    let params2 = {};
    let filterArray = {};
    let order = []; 
    
    if(municipio) params2.cod_municipio = municipio;

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
