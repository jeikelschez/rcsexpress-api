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

  async find(page, limit, order_by, order_direction, agencia, rif) {    
    let params = {};
    let order = [];
    
    if(agencia) params.cod_agencia = agencia;
    if(rif) params.rif_ci = rif;    

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
