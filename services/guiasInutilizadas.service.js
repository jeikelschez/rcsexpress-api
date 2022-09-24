const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class GinutilizadasService {

  constructor() {}

  async create(data) {
    const newGinutilizada = await models.Ginutilizadas.create(data);
    return newGinutilizada;
  }

  async find(page, limit, order_by, order_direction, filter, filter_value, agencia, tipo, nro_guia) {    
    let params2 = {};
    let filterArray = {};
    let order = []; 
    
    if(agencia) params2.cod_agencia = agencia;
    if(tipo) params2.tipo_guia = tipo;
    if(nro_guia) params2.nro_guia = nro_guia;

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

    return await utils.paginate(models.Ginutilizadas, page, limit, params, order); 
  }

  async findOne(id) {
    const gInutilizada = await models.Ginutilizadas.findByPk(id);
    if (!gInutilizada) {
      throw boom.notFound('Guia no existe');
    }
    return gInutilizada;
  }

  async update(id, changes) {
    const gInutilizada = await models.Ginutilizadas.findByPk(id);
    if (!gInutilizada) {
      throw boom.notFound('Guia no existe');
    }
    const rta = await gInutilizada.update(changes);
    return rta;
  }

  async delete(id) {
    const gInutilizada = await models.Ginutilizadas.findByPk(id);
    if (!gInutilizada) {
      throw boom.notFound('Guia no existe');
    }
    await gInutilizada.destroy();
    return { id };
  }
}

module.exports = GinutilizadasService;
