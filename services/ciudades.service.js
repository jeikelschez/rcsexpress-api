const boom = require('@hapi/boom');

const { models, Sequelize } = require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class CiudadesService {

  constructor() {}

  async create(data) {
    const newCiudad = await models.Ciudades.create(data);
    return newCiudad;
  }

  async find(page, limit, order_by, order_direction, filter, filter_value, estado, desc) {
    let params2 = {};
    let filterArray = {};
    let order = [];    
    
    if(estado) params2.cod_estado = estado;
    if(desc) params2.desc_ciudad = desc;

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

    let include = ['estados'];

    return await utils.paginate(models.Ciudades, page, limit, params, order, attributes, include);
  }

  async findOne(id) {
    const ciudad = await models.Ciudades.findByPk(id, {
      include: ['estados']
    });
    if (!ciudad) {
      throw boom.notFound('Ciudad no existe');
    }
    return ciudad;
  }

  async update(id, changes) {
    const ciudad = await models.Ciudades.findByPk(id);
    if (!ciudad) {
      throw boom.notFound('Ciudad no existe');
    }
    const rta = await ciudad.update(changes);
    return rta;
  }

  async delete(id) {
    const ciudad = await models.Ciudades.findByPk(id);
    if (!ciudad) {
      throw boom.notFound('Ciudad no existe');
    }
    await ciudad.destroy();
    return { id };
  }
}

module.exports = CiudadesService;
