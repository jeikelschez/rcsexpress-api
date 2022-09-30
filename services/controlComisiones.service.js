const boom = require('@hapi/boom');

const { models, Sequelize }= require('../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class CcomisionesService {

  constructor() {}

  async create(data) {
    const newConcepto = await models.Ccomisiones.create(data);
    return newConcepto;
  }  

  async find(page, limit, order_by, order_direction, filter, filter_value, 
    agencia, agente, cod_movimiento, tipo, mayor) {
    
    let params2 = {};
    let filterArray = {};
    let order = [];    
    
    if(agencia) params2.cod_agencia = agencia;
    if(agente) params2.cod_agente = agente;
    if(cod_movimiento) params2.cod_movimiento = cod_movimiento;
    if(tipo) params2.tipo_comision = tipo;
    if(mayor) {
      params2.monto_comision = {
        [Sequelize.Op.gt]: 0
      }
    };

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

    return await utils.paginate(models.Ccomisiones, page, limit, params, order);
  }

  async findOne(id) {
    const comision = await models.Ccomisiones.findByPk(id);
    if (!comision) {
      throw boom.notFound('Numero de Control de Comision no existe');
    }
    return comision;
  }

  async update(id, changes) {
    const comision = await models.Ccomisiones.findByPk(id);
    if (!comision) {
      throw boom.notFound('Numero de Control de Comision no existe');
    }
    const rta = await comision.update(changes);
    return rta;
  }

  async delete(id) {
    const comision = await models.Ccomisiones.findByPk(id);
    if (!comision) {
      throw boom.notFound('Numero de Control de Comision no existe');
    }
    await comision.destroy();
    return { id };
  }
}

module.exports = CcomisionesService;
