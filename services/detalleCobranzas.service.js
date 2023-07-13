const boom = require('@hapi/boom');

const { models, Sequelize } = require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class DcobranzasService {

  constructor() {}

  async create(data) {
    const newDcobranza = await models.Dcobranzas.create(data);
    return newDcobranza;
  }

  async find(page, limit, order_by, order_direction, filter, filter_value, cod_cobranza) {    
    let params2 = {};
    let filterArray = {};
    let order = [];    
    
    if(cod_cobranza) params2.cod_cobranza = cod_cobranza;

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

    return await utils.paginate(models.Dcobranzas, page, limit, params, order);
  }

  async findOne(id) {
    const dCobranza = await models.Dcobranzas.findByPk(id);
    if (!dCobranza) {
      throw boom.notFound('Detalle de Cobranzas no existe');
    }
    return dCobranza;
  }

  async update(id, changes) {
    const dCobranza = await models.Dcobranzas.findByPk(id);
    if (!dCobranza) {
      throw boom.notFound('Detalle de Cobranzas no existe');
    }
    const rta = await dCobranza.update(changes);
    return rta;
  }

  async delete(id) {
    const dCobranza = await models.Dcobranzas.findByPk(id);
    if (!dCobranza) {
      throw boom.notFound('Detalle de Cobranzas no existe');
    }
    await dCobranza.destroy();
    return { id };
  }
}

module.exports = DcobranzasService;
