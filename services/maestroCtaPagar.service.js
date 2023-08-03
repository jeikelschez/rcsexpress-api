const boom = require('@hapi/boom');

const { models, Sequelize } = require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class MctapagarService {

  constructor() {}

  async create(data) {
    const newMCtapagar = await models.Mctapagar.create(data);
    return newMCtapagar;
  }

  async find(page, limit, order_by, order_direction, filter, filter_value) {    
    let params2 = {};
    let filterArray = {};
    let order = [];     

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

    return await utils.paginate(models.Mctapagar, page, limit, params, order);
  }

  async findOne(id) {
    const mCtapagar = await models.Mctapagar.findByPk(id);
    if (!mCtapagar) {
      throw boom.notFound('Maestro de Cuentas por Pagar no existe');
    }
    return mCtapagar;
  }

  async update(id, changes) {
    const mCtapagar = await models.Mctapagar.findByPk(id);
    if (!mCtapagar) {
      throw boom.notFound('Maestro de Cuentas por Pagar no existe');
    }
    const rta = await mCtapagar.update(changes);
    return rta;
  }

  async delete(id) {
    const mCtapagar = await models.Mctapagar.findByPk(id);
    if (!mCtapagar) {
      throw boom.notFound('Maestro de Cuentas por Pagar no existe');
    }
    await mCtapagar.destroy();
    return { id };
  }
}

module.exports = MctapagarService;
