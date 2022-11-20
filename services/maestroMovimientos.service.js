const boom = require('@hapi/boom');

const { models, Sequelize } = require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class MmovimientosService {
  constructor() {}

  async create(data) {
    const newMmovimiento = await models.Mmovimientos.create(data);
    return newMmovimiento;
  }

  async find(
    page,
    limit,
    order_by,
    order_direction,
    filter,
    filter_value,
    agencia,
    agencia_dest,
    nro_documento,
    tipo,
    tipo_in,
    desde,
    hasta,
    cliente_orig,
    cliente_dest,
    cliente_orig_exist,
    cliente_part_exist,
    estatus_oper,
    transito,
    estatus_admin_in,
    estatus_admin_ex,
    no_abono,
    tipo_doc_ppal,
    nro_doc_ppal,
    serie_doc_ppal,
    nro_ctrl_doc_ppal,
    cod_ag_doc_ppal
  ) {
    let params2 = {};
    let filterArray = {};
    let order = [];

    if (agencia) params2.cod_agencia = agencia;
    if (agencia_dest) params2.cod_agencia_dest = agencia_dest;
    if (nro_documento) params2.nro_documento = nro_documento;
    if (tipo) params2.t_de_documento = tipo;

    if (tipo_in) {
      params2.t_de_documento = {
        [Sequelize.Op.in]: tipo_in.split(','),
      };
    }

    if (desde) {
      params2.fecha_emision = {
        [Sequelize.Op.gte]: desde,
      };
    }

    if (hasta) {
      if (desde) {
        params2.fecha_emision = {
          [Sequelize.Op.between]: [desde, hasta],
        };
      } else {
        params2.fecha_emision = {
          [Sequelize.Op.lte]: hasta,
        };
      }
    }

    if (cliente_orig) params2.cod_cliente_org = cliente_orig;
    if (cliente_dest) params2.cod_cliente_dest = cliente_dest;

    if (cliente_orig_exist) {
      params2.cod_cliente_org = {
        [Sequelize.Op.not]: null,
      };
    }
    
    if (cliente_part_exist) {
      params2.id_clte_part_orig = {
        [Sequelize.Op.not]: null,
      };
    }

    if (estatus_oper) params2.estatus_operativo = estatus_oper;
    if (transito) params2.check_transito = transito;

    if (estatus_admin_in) {
      params2.estatus_administra = {
        [Sequelize.Op.in]: estatus_admin_in.split(','),
      };
    }

    if (estatus_admin_ex) {
      params2.estatus_administra = {
        [Sequelize.Op.notIn]: estatus_admin_ex.split(','),
      };
    }
    if (no_abono) {
      params2.monto_total = {
        [Sequelize.Op.col]: 'saldo',
      };
    }

    if (tipo_doc_ppal) params2.tipo_doc_principal = tipo_doc_ppal;
    if (nro_doc_ppal) params2.nro_doc_principal = nro_doc_ppal;
    if (serie_doc_ppal) params2.serie_doc_principal = serie_doc_ppal;
    if (nro_ctrl_doc_ppal) params2.nro_ctrl_doc_ppal = nro_ctrl_doc_ppal;
    if (cod_ag_doc_ppal) params2.cod_ag_doc_ppal = cod_ag_doc_ppal;

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

    let attributes = {};

    if (order_by && order_direction) {
      order.push([order_by, order_direction]);
    }

    return await utils.paginate(
      models.Mmovimientos,
      page,
      limit,
      params,
      order,
      attributes
    );
  }

  async findOne(id) {
    const mMovimiento = await models.Mmovimientos.findByPk(id);
    if (!mMovimiento) {
      throw boom.notFound('Maestro de Movimientos no existe');
    }
    return mMovimiento;
  }

  async update(id, changes) {
    const mMovimiento = await models.Mmovimientos.findByPk(id);
    if (!mMovimiento) {
      throw boom.notFound('Maestro de Movimientos no existe');
    }
    const rta = await mMovimiento.update(changes);
    return rta;
  }

  async delete(id) {
    const mMovimiento = await models.Mmovimientos.findByPk(id);
    if (!mMovimiento) {
      throw boom.notFound('Maestro de Movimientos no existe');
    }
    await mMovimiento.destroy();
    return { id };
  }
}

module.exports = MmovimientosService;
