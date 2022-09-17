const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

const caseStatus = '(CASE estatus WHEN "A" THEN "ACTIVA" ELSE "INACTIVA" END)';

class AgenciasService {

  constructor() {}

  async create(data) {
    const newAgencia = await models.Agencias.create(data);
    return newAgencia;
  }

  async find(page, limit, order_by, order_direction, filter, filter_value, ciudad) {    
    let params2 = {};
    let filterArray = {};
    let order = [];
    
    if(ciudad) params2.cod_ciudad = ciudad;

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

    let attributes = {
      include: [
        [Sequelize.literal(caseStatus), 'activo_desc']
      ]
    };

    let include = ['ciudades'];

    return await utils.paginate(models.Agencias, page, limit, params, order, attributes, include);
  }

  async findOne(id) {
    const agencia = await models.Agencias.findByPk(id,
    {
      include: ['ciudades'],
      attributes: {
        include: [
          [Sequelize.literal(caseStatus), 'activo_desc']
        ]
      }
    });
    if (!agencia) {
      throw boom.notFound('Agencia no existe');
    }
    return agencia;
  }

  async update(id, changes) {
    const agencia = await models.Agencias.findByPk(id);
    if (!agencia) {
      throw boom.notFound('Agencia no existe');
    }
    const rta = await agencia.update(changes);
    return rta;
  }

  async delete(id) {
    const agencia = await models.Agencias.findByPk(id);
    if (!agencia) {
      throw boom.notFound('Agencia no existe');
    }
    await agencia.destroy();
    return { id };
  }
}

module.exports = AgenciasService;
