const boom = require('@hapi/boom');

const { models, Sequelize } = require('../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class CostosTransporteService {
  constructor() {}

  async create(data) {
    const newCosto = await models.Costos.create(data);
    return newCosto;
  }

  async find(
    page,
    limit,
    order_by,
    order_direction,
    filter,
    filter_value,
    agencia,
    desde,
    hasta,
    order_doc
  ) {
    let params2 = {};
    let filterArray = {};
    let order = [];

    if (agencia) params2.cod_agencia = agencia;

    if (desde) {
      params2.fecha_envio = {
        [Sequelize.Op.gte]: desde,
      };
    }

    if (hasta) {
      if (desde) {
        params2.fecha_envio = {
          [Sequelize.Op.between]: [desde, hasta],
        };
      } else {
        params2.fecha_envio = {
          [Sequelize.Op.lte]: hasta,
        };
      }
    }

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

    if (order_doc) {
      order = [
        [
          'fecha_envio',
          'ASC',
        ],
        [
          { model: models.Dcostosg, as: 'detallesg' },
          { model: models.Mmovimientos, as: 'movimientos' },
          'fecha_emision',
          'ASC',
        ],
      ];
    } else if (order_by && order_direction) {
      order.push([order_by, order_direction]);
    }

    let attributes = {};

    let include = [
      {
        model: models.Dcostos,
        as: 'detalles',
      },
      {
        model: models.Dcostosg,
        as: 'detallesg',
        include: {
          model: models.Mmovimientos,
          as: 'movimientos',
          attributes: [
            'id',
            'nro_documento',
            'fecha_emision',
            'monto_subtotal',
          ],
        },
      },
      {
        model: models.Hdolar,
        as: 'dolar',
      },
    ];

    return await utils.paginate(
      models.Costos,
      page,
      limit,
      params,
      order,
      attributes,
      include
    );
  }

  async findOne(id) {
    const costo = await models.Costos.findByPk(id, {
      include: [
        {
          model: models.Dcostos,
          as: 'detalles',
        },
        {
          model: models.Dcostosg,
          as: 'detallesg',
        },
      ],
    });
    if (!costo) {
      throw boom.notFound('Costo no existe');
    }
    return costo;
  }

  async update(id, changes) {
    const costo = await models.Costos.findByPk(id);
    if (!costo) {
      throw boom.notFound('Costo no existe');
    }
    const rta = await costo.update(changes);
    return rta;
  }

  async delete(id) {
    const costo = await models.Costos.findByPk(id);
    if (!costo) {
      throw boom.notFound('Costo no existe');
    }
    await costo.destroy();
    return { id };
  }
}

module.exports = CostosTransporteService;
