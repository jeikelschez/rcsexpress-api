const boom = require('@hapi/boom');

const { models, Sequelize } = require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class PgeneradosService {

  constructor() {}

  async create(data) {
    const newPgenerado = await models.Pgenerados.create(data);
    return newPgenerado;
  }

  async find(page, limit, order_by, order_direction, filter, filter_value, cod_cta_pagar) {    
    let params2 = {};
    let filterArray = {};
    let order = [];    
    
    if(cod_cta_pagar) params2.cod_cta_pagar = cod_cta_pagar;

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

    return await utils.paginate(models.Pgenerados, page, limit, params, order);
  }

  async findOne(id) {
    const pGenerado = await models.Pgenerados.findByPk(id);
    if (!pGenerado) {
      throw boom.notFound('Pago Generado no existe');
    }
    return pGenerado;
  }

  async update(id, changes) {
    const pGenerado = await models.Pgenerados.findByPk(id);
    if (!pGenerado) {
      throw boom.notFound('Pago Generado no existe');
    }
    const rta = await pGenerado.update(changes);
    return rta;
  }

  async delete(id) {
    const pGenerado = await models.Pgenerados.findByPk(id);
    if (!pGenerado) {
      throw boom.notFound('Pago Generado no existe');
    }
    await pGenerado.destroy();
    return { id };
  }
}

module.exports = PgeneradosService;
