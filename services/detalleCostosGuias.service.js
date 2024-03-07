const boom = require('@hapi/boom');

const { models, Sequelize } = require('../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class DcostosgService {
  constructor() {}

  async create(data) {
    const newDcostog = await models.Dcostosg.create(data);
    return newDcostog;
  }

  async find(
    page,
    limit,
    order_by,
    order_direction,
    filter,
    filter_value,
    cod_costo,
    cod_movimiento
  ) {
    let params2 = {};
    let filterArray = {};
    let order = [];

    if (cod_costo) params2.cod_costo = cod_costo;
    if (cod_movimiento) params2.cod_movimiento = cod_movimiento;

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
      models.Dcostosg,
      page,
      limit,
      params,
      order,
      attributes,
      include
    );
  }

  async findOne(id) {
    const dCostog = await models.Dcostosg.findByPk(id);
    if (!dCostog) {
      throw boom.notFound('Detalle de Costos Guias no existe');
    }
    return dCostog;
  }

  async update(id, changes) {
    const dCostog = await models.Dcostosg.findByPk(id);
    if (!dCostog) {
      throw boom.notFound('Detalle de Costos Guias no existe');
    }
    const rta = await dCostog.update(changes);
    return rta;
  }

  async delete(id) {
    const dCostog = await models.Dcostosg.findByPk(id);
    if (!dCostog) {
      throw boom.notFound('Detalle de Costos Guias no existe');
    }
    await dCostog.destroy();
    return { id };
  }
}

module.exports = DcostosgService;
