const boom = require('@hapi/boom');

const { models, Sequelize } = require('../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class DcostosService {
  constructor() {}

  async create(data) {
    const newDcosto = await models.Dcostos.create(data);
    return newDcosto;
  }

  async find(
    page,
    limit,
    order_by,
    order_direction,
    filter,
    filter_value,
    cod_costo
  ) {
    let params2 = {};
    let filterArray = {};
    let order = [];

    if (cod_costo) params2.cod_costo = cod_costo;

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

    let include = ['conceptos'];

    return await utils.paginate(
      models.Dcostos,
      page,
      limit,
      params,
      order,
      attributes,
      include
    );
  }

  async findOne(id) {
    const dCosto = await models.Dcostos.findByPk(id);
    if (!dCosto) {
      throw boom.notFound('Detalle de Costos no existe');
    }
    return dCosto;
  }

  async update(id, changes) {
    const dCosto = await models.Dcostos.findByPk(id);
    if (!dCosto) {
      throw boom.notFound('Detalle de Costos no existe');
    }
    const rta = await dCosto.update(changes);
    return rta;
  }

  async delete(id) {
    const dCosto = await models.Dcostos.findByPk(id);
    if (!dCosto) {
      throw boom.notFound('Detalle de Costos no existe');
    }
    await dCosto.destroy();
    return { id };
  }
}

module.exports = DcostosService;
