const boom = require('@hapi/boom');
const moment = require('moment');

const { models, Sequelize } = require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class DmovimientosService {

  constructor() {}

  async create(data) {
    const newDmovimiento = await models.Dmovimientos.create(data);
    return newDmovimiento;
  }

  async find(page, limit, order_by, order_direction, filter, filter_value, cod_movimiento) {    
    let params2 = {};
    let filterArray = {};
    let order = [];    
    
    if(cod_movimiento) params2.cod_movimiento = cod_movimiento;

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

    let attributes = {};

    let include = ['conceptos'];

    return await utils.paginate(models.Dmovimientos, page, limit, params, order, attributes, include);
  }

  async findOne(id) {
    const dMovimiento = await models.Dmovimientos.findByPk(id);
    if (!dMovimiento) {
      throw boom.notFound('Detalle de Movimientos no existe');
    }
    return dMovimiento;
  }

  async update(id, changes) {
    const dMovimiento = await models.Dmovimientos.findByPk(id);
    if (!dMovimiento) {
      throw boom.notFound('Detalle de Movimientos no existe');
    }
    const rta = await dMovimiento.update(changes);
    return rta;
  }

  async delete(id) {
    const dMovimiento = await models.Dmovimientos.findByPk(id);
    if (!dMovimiento) {
      throw boom.notFound('Detalle de Movimientos no existe');
    }
    await dMovimiento.destroy();
    return { id };
  }
}

module.exports = DmovimientosService;
