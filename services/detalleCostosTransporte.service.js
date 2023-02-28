const boom = require('@hapi/boom');

const { models, Sequelize } = require('../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class DcostostService {
  constructor() {}

  async create(data) {
    const newDcostot = await models.Dcostost.create(data);
    return newDcostot;
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

    let include = [
      {
        model: models.Mmovimientos,
        as: 'movimientos',
        attributes: ['id', 'monto_subtotal'],
      },
    ];

    return await utils.paginate(
      models.Dcostost,
      page,
      limit,
      params,
      order,
      attributes,
      include
    );
  }

  async findOne(id) {
    const dCostot = await models.Dcostost.findByPk(id);
    if (!dCostot) {
      throw boom.notFound('Detalle de Costos Transporte no existe');
    }
    return dCosto;
  }

  async update(id, changes) {
    const dCostot = await models.Dcostost.findByPk(id);
    if (!dCostot) {
      throw boom.notFound('Detalle de Costos Transporte no existe');
    }
    const rta = await dCostot.update(changes);
    return rta;
  }

  async delete(id) {
    const dCostot = await models.Dcostost.findByPk(id);
    if (!dCostot) {
      throw boom.notFound('Detalle de Costos Transporte no existe');
    }
    await dCostot.destroy();
    return { id };
  }
}

module.exports = DcostostService;
