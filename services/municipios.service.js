const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class MunicipiosService {

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
