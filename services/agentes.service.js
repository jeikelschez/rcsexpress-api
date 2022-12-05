const boom = require('@hapi/boom');

const { models, Sequelize } = require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class AgentesService {
  constructor() {}

  async create(data) {
    const newAgente = await models.Agentes.create(data);
    return newAgente;
  }

  async find(
    page,
    limit,
    order_by,
    order_direction,
    filter,
    filter_value,
    agencia,
    activo,
    group_ag
  ) {
    let params2 = {};
    let filterArray = {};
    let order = [];

    if (agencia) params2.cod_agencia = agencia;
    if (activo) params2.flag_activo = 1;

    if (filter && filter_value) {
      let filters = [];
      filter.split(',').forEach(function (item) {
        let itemArray = {};
        itemArray[item] = { [Sequelize.Op.substring]: filter_value };
        filters.push(itemArray);
      });

      filterArray = {
        [Sequelize.Op.or]: filters,
      };
    }

    let params = { ...params2, ...filterArray };

    if (order_by && order_direction) {
      order.push([order_by, order_direction]);
    }

    if (group_ag) {
      let agencias = await models.Agencias.findAll();
      let agentesArray = [];
      for (var i = 0; i <= agencias[agencias.length - 1].id - 1; i++) {
        let cod_agencia = agencias[i] ? agencias[i].id : i;
        let agentes = await models.Agentes.findAll({
          where: {
            cod_agencia: cod_agencia,
            flag_activo: 1,
          },
          raw: true,
        });
        agentesArray.splice(cod_agencia, 0, agentes);
      }
      return agentesArray;
    }

    return await utils.paginate(models.Agentes, page, limit, params, order);
  }

  async findOne(id) {
    const agente = await models.Agentes.findByPk(id);
    if (!agente) {
      throw boom.notFound('Agente no existe');
    }
    return agente;
  }

  async update(id, changes) {
    const agente = await models.Agentes.findByPk(id);
    if (!agente) {
      throw boom.notFound('Agente no existe');
    }
    const rta = await agente.update(changes);
    return rta;
  }

  async delete(id) {
    const agente = await models.Agentes.findByPk(id);
    if (!agente) {
      throw boom.notFound('Agente no existe');
    }
    await agente.destroy();
    return { id };
  }
}

module.exports = AgentesService;
