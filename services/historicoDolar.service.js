const boom = require('@hapi/boom');

const { models, Sequelize }= require('../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class HdolarService {

  constructor() {}

  async create(data) {
    const newHdolar = await models.Hdolar.create(data);
    return newHdolar;
  }

  async find(page, limit, order_by, order_direction, filter, filter_value, fecha) {
    let params2 = {};
    let filterArray = {};
    let order = [];
    
    if(fecha) params2.fecha = fecha;

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

    return await utils.paginate(models.Hdolar, page, limit, params, order);
  }

  async findOne(fecha) {
    const hdolar = await models.Hdolar.findByPk(fecha);
    if (!hdolar) {
      throw boom.notFound('Fecha no existe');
    }
    return hdolar;
  }

  async update(fecha, changes) {
    const hdolar = await models.Hdolar.findByPk(fecha);
    if (!hdolar) {
      throw boom.notFound('Fecha no existe');
    }
    const rta = await hdolar.update(changes);
    return rta;
  }

  async delete(fecha) {
    const hdolar = await models.Hdolar.findByPk(fecha);
    if (!hdolar) {
      throw boom.notFound('Fecha no existe');
    }
    await hdolar.destroy();
    return { fecha };
  }
}

module.exports = HdolarService;
