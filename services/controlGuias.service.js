const boom = require('@hapi/boom');

const PDFDocument = require('pdfkit');
const getStream = require('get-stream');
const base64 = require('base64-stream');
const moment = require('moment');

const { models, Sequelize } = require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class CguiasService {
  constructor() {}

  async create(data) {
    // Valida que el lote no exista
    const cguias = await models.Cguias.count({
      where: {
        [Sequelize.Op.or]: [
          {
            tipo: data.tipo,
            control_inicio: {
              [Sequelize.Op.gte]: data.control_inicio,
            },
            control_final: {
              [Sequelize.Op.lte]: data.control_final,
            },
          },
          {
            tipo: data.tipo,
            control_inicio: {
              [Sequelize.Op.lte]: data.control_inicio,
            },
            control_final: {
              [Sequelize.Op.gte]: data.control_final,
            },
          },
        ],
      },
    });

    if (cguias > 0) {
      throw boom.badRequest(
        'El lote para este tipo de guía ya está registrado'
      );
    }

    const newCguia = await models.Cguias.create(data);
    return newCguia;
  }

  async find(
    page,
    limit,
    order_by,
    order_direction,
    filter,
    filter_value,
    agencia,
    agente,
    cliente,
    desde,
    desde_fact,
    hasta,
    hasta_fact,
    disp,
    tipo
  ) {
    let params2 = {};
    let filterArray = {};
    let order = [];

    if (agencia) params2.cod_agencia = agencia;
    if (agente) params2.cod_agente = agente;
    if (cliente) params2.cod_cliente = cliente;

    if (desde) {
      params2.control_inicio = {
        [Sequelize.Op.gte]: desde,
      };
    }
    if (hasta) {
      params2.control_final = {
        [Sequelize.Op.lte]: hasta,
      };
    }

    if (desde_fact) {
      params2.control_inicio = {
        [Sequelize.Op.lte]: desde_fact,
      };
    }
    if (hasta_fact) {
      params2.control_final = {
        [Sequelize.Op.gte]: hasta_fact,
      };
    }

    if (disp) params2.cant_disponible = disp;
    if (tipo) params2.tipo = tipo;

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

    let attributes = {};
    let include = ['tipos'];

    return await utils.paginate(
      models.Cguias,
      page,
      limit,
      params,
      order,
      attributes,
      include
    );
  }

  async findOne(id) {
    const cguia = await models.Cguias.findByPk(id, {
      include: ['tipos'],
    });
    if (!cguia) {
      throw boom.notFound('Numero de Control de Guía no existe');
    }
    return cguia;
  }

  async update(id, changes) {
    const cguia = await models.Cguias.findByPk(id);
    if (!cguia) {
      throw boom.notFound('Numero de Control de Guía no existe');
    }
    const rta = await cguia.update(changes);
    return rta;
  }

  async delete(id) {
    const cguia = await models.Cguias.findByPk(id);
    if (!cguia) {
      throw boom.notFound('Numero de Control de Guía no existe');
    }
    await cguia.destroy();
    return { id };
  }
}

module.exports = CguiasService;
