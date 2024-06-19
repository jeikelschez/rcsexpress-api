const boom = require('@hapi/boom');

const { models, Sequelize } = require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class DgastosService {

  constructor() {}

  async create(data) {
    const newDgasto = await models.Dgastos.create(data);
    return newDgasto;
  }

  async find(page, limit, order_by, order_direction, filter, filter_value, cod_cta) {    
    let params2 = {};
    let filterArray = {};
    let order = []; 
    
    if (cod_cta) params2.cod_cta_pagar = cod_cta;

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

    return await utils.paginate(models.Dgastos, page, limit, params, order);
  }

  async findOne(id) {
    const dGasto = await models.Dgastos.findByPk(id);
    if (!dGasto) {
      throw boom.notFound('Distribución de Gastos no existe');
    }
    return dGasto;
  }

  async update(id, changes) {
    const dGasto = await models.Dgastos.findByPk(id);
    if (!dGasto) {
      throw boom.notFound('Distribución de Gastos no existe');
    }
    const rta = await dGasto.update(changes);
    return rta;
  }

  async delete(id) {
    const dGasto = await models.Dgastos.findByPk(id);
    if (!dGasto) {
      throw boom.notFound('Distribución de Gastos no existe');
    }
    await dGasto.destroy();
    return { id };
  }
}

module.exports = DgastosService;
