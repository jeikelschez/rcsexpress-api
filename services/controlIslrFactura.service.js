const boom = require('@hapi/boom');

const { models, Sequelize } = require('../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class CislrfacService {
  constructor() {}

  async create(data) {
    const newCislrfac = await models.Cislrfac.create(data);
    return newCislrfac;
  }

  async find(
    page,
    limit,
    order_by,
    order_direction,
    filter,
    filter_value,
    cod_islr,
    desde,
    hasta,
    proveedor
  ) {
    let params2 = {};
    let filterArray = {};
    let order = [];

    if (desde) {
      params2.fecha_factura = {
        [Sequelize.Op.gte]: desde,
      };
    }

    if (hasta) {
      if (desde) {
        params2.fecha_factura = {
          [Sequelize.Op.between]: [desde, hasta],
        };
      } else {
        params2.fecha_factura = {
          [Sequelize.Op.lte]: hasta,
        };
      }
    }

    if (proveedor) params2.cod_proveedor = proveedor;
    if (cod_islr) params2.cod_islr = cod_islr;

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

    let include = ['retenciones'];

    return await utils.paginate(
      models.Cislrfac,
      page,
      limit,
      params,
      order,
      attributes,
      include
    );
  }

  async findOne(id) {
    const cIslrfac = await models.Cislrfac.findByPk(id);
    if (!cIslrfac) {
      throw boom.notFound('Control de ISLR Factura no existe');
    }
    return cIslrfac;
  }

  async update(id, changes) {
    const cIslrfac = await models.Cislrfac.findByPk(id);
    if (!cIslrfac) {
      throw boom.notFound('Control de ISLR Factura no existe');
    }
    const rta = await cIslrfac.update(changes);
    return rta;
  }

  async delete(id) {
    const cIslrfac = await models.Cislrfac.findByPk(id);
    if (!cIslrfac) {
      throw boom.notFound('Control de ISLR Factura no existe');
    }
    await cIslrfac.destroy();
    return { id };
  }
}

module.exports = CislrfacService;
