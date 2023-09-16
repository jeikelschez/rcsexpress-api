const boom = require('@hapi/boom');

const { models, Sequelize } = require('../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class CislrService {
  constructor() {}

  async create(data) {
    const newCislr = await models.Cislr.create(data);
    return newCislr;
  }

  async find(
    page,
    limit,
    order_by,
    order_direction,
    filter,
    filter_value
  ) {
    let params2 = {};
    let filterArray = {};
    let order = [];

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

    let include = [];

    return await utils.paginate(
      models.Cislr,
      page,
      limit,
      params,
      order,
      attributes,
      include
    );
  }

  async findOne(id) {
    const cIslr = await models.Cislr.findByPk(id);
    if (!cIslr) {
      throw boom.notFound('Control de ISLR no existe');
    }
    return cIslr;
  }

  async update(id, changes) {
    const cIslr = await models.Cislr.findByPk(id);
    if (!cIslr) {
      throw boom.notFound('Control de ISLR no existe');
    }
    const rta = await cIslr.update(changes);
    return rta;
  }

  async delete(id) {
    const cIslr = await models.Cislr.findByPk(id);
    if (!cIslr) {
      throw boom.notFound('Control de ISLR no existe');
    }
    await cIslr.destroy();
    return { id };
  }
}

module.exports = CislrService;
