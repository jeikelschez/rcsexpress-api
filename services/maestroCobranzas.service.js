const boom = require('@hapi/boom');

const { models, Sequelize } = require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class McobranzasService {

  constructor() {}

  async create(data) {
    const newMCobranza = await models.Mcobranzas.create(data);
    return newMCobranza;
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

    return await utils.paginate(models.Mcobranzas, page, limit, params, order);
  }

  async findOne(id) {
    const mCobranza = await models.Mcobranzas.findByPk(id);
    if (!mCobranza) {
      throw boom.notFound('Maestro de Cobranza no existe');
    }
    return mCobranza;
  }

  async update(id, changes) {
    const mCobranza = await models.Mcobranzas.findByPk(id);
    if (!mCobranza) {
      throw boom.notFound('Maestro de Cobranza no existe');
    }
    const rta = await mCobranza.update(changes);
    return rta;
  }

  async delete(id) {
    const mCobranza = await models.Mcobranzas.findByPk(id);
    if (!mCobranza) {
      throw boom.notFound('Maestro de Cobranza no existe');
    }
    await mCobranza.destroy();
    return { id };
  }
}

module.exports = McobranzasService;
