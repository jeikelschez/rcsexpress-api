const boom = require('@hapi/boom');

const { models, Sequelize } = require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class EstadosService {

  constructor() {}

  async create(data) {
    const newEstado = await models.Estados.create(data);
    return newEstado;
  }

  async find(page, limit, order_by, order_direction, pais) {    
    let params = {};
    let order = [];
    
    if(pais) params.cod_pais = pais;

    if(order_by && order_direction) {
      order.push([order_by, order_direction]);
    }

    let attributes = {};
    let include = ['paises'];

    return await utils.paginate(models.Estados, page, limit, params, order, attributes, include);
  }

  async findOne(id) {
    const estado = await models.Estados.findByPk(id, {
      include: ['paises']
    });
    if (!estado) {
      throw boom.notFound('Estado no existe');
    }
    return estado;
  }

  async findOneLocalidades(id) {
    const estado = await models.Estados.findByPk(id, {
      include: ['localidades']
    });
    if (!estado) {
      throw boom.notFound('Estado no existe');
    }
    return estado;
  }

  async update(id, changes) {
    const estado = await models.Estados.findByPk(id);
    if (!estado) {
      throw boom.notFound('Estado no existe');
    }
    const rta = await estado.update(changes);
    return rta;
  }

  async delete(id) {
    const estado = await models.Estados.findByPk(id);
    if (!estado) {
      throw boom.notFound('Estado no existe');
    }
    await estado.destroy();
    return { id };
  }
}

module.exports = EstadosService;
