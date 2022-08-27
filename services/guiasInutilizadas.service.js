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

  async find(page, limit, order_by, order_direction, agencia, tipo, nro_guia) {    
    let params = {};
    let order = [];
    let attributes = {};
    
    if(agencia) params.cod_agencia = agencia;
    if(tipo) params.tipo_guia = tipo;
    if(nro_guia) params.nro_guia = nro_guia;

    if(order_by && order_direction) {
      order.push([order_by, order_direction]);
    }

    return await utils.paginate(models.Ginutilizadas, page, limit, params, order, attributes);
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
