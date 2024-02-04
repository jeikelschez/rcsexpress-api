const boom = require('@hapi/boom');

const { models, Sequelize } = require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class MbancariosService {

  constructor() {}

  async create(data) {
    const newMbancario = await models.Mbancarios.create(data);
    return newMbancario;
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

    return await utils.paginate(models.Mbancarios, page, limit, params, order);
  }

  async findOne(id) {
    const Mbancario = await models.Mbancarios.findByPk(id);
    if (!Mbancario) {
      throw boom.notFound('Movimiento Bancario no existe');
    }
    return Mbancario;
  }

  async update(id, changes) {
    const Mbancario = await models.Mbancarios.findByPk(id);
    if (!Mbancario) {
      throw boom.notFound('Movimiento Bancario no existe');
    }
    const rta = await Mbancario.update(changes);
    return rta;
  }

  async delete(id) {
    const Mbancario = await models.Mbancarios.findByPk(id);
    if (!Mbancario) {
      throw boom.notFound('Movimiento Bancario no existe');
    }
    await Mbancario.destroy();
    return { id };
  }
}

module.exports = MbancariosService;
