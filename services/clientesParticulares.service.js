const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class CparticularesService {

  constructor() {}

  async create(data) {
    const newCparticular = await models.Cparticulares.create(data);
    return newCparticular;
  }

  async find(page, limit, order_by, order_direction, filter, filter_value, agencia, rif, cod_cliente, activo) {
    let params2 = {};
    let filterArray = {};
    let order = [];    
    
    if(agencia) params2.cod_agencia = agencia;
    if(rif) params2.rif_ci = rif; 
    if(cod_cliente) params2.cod_cliente = cod_cliente; 
    if(activo) params2.estatus = "A";    

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

    return await utils.paginate(models.Cparticulares, page, limit, params, order);
  }

  async findOne(id) {
    const cParticular = await models.Cparticulares.findByPk(id);
    if (!cParticular) {
      throw boom.notFound('Cliente Particular no existe');
    }
    return cParticular;
  }

  async update(id, changes) {
    const cParticular = await models.Cparticulares.findByPk(id);
    if (!cParticular) {
      throw boom.notFound('Cliente Particular no existe');
    }
    const rta = await cParticular.update(changes);
    return rta;
  }

  async delete(id) {
    const cParticular = await models.Cparticulares.findByPk(id);
    if (!cParticular) {
      throw boom.notFound('Cliente Particular no existe');
    }
    await cParticular.destroy();
    return { id };
  }
}

module.exports = CparticularesService;
