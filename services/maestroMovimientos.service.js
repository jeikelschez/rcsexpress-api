const boom = require('@hapi/boom');
const logger = require('./../config/logger');

const { models, Sequelize } = require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

const clienteOrigDesc =
  '(CASE WHEN (id_clte_part_orig IS NULL || id_clte_part_orig = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `Mmovimientos`.cod_cliente_org = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `Mmovimientos`.id_clte_part_orig = clientes_particulares.id)' +
  ' END)';
const clienteDestDesc =
  '(CASE WHEN (id_clte_part_dest IS NULL || id_clte_part_dest = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `Mmovimientos`.cod_cliente_dest = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `Mmovimientos`.id_clte_part_dest = clientes_particulares.id)' +
  ' END)';
const siglasDest =
  '(SELECT siglas' +
  ' FROM agencias ' +
  ' JOIN ciudades ON agencias.cod_ciudad = ciudades.id ' +
  ' WHERE `Mmovimientos`.cod_agencia_dest = agencias.id)';

class MmovimientosService {
  constructor() {}

  async create(data) {
    const newMmovimiento = await models.Mmovimientos.create(data);
    return newMmovimiento;
  }

  async find(page, limit, order_by, order_direction, filters = {}) {
    let params2 = {};
    let params3 = {};
    let order = [];
    let include = [];
    filters = JSON.parse(filters);    

    if (filters.agencia) {
      if (filters.agencia_transito) {
        params3 = {
          [Sequelize.Op.or]: [
            {
              cod_agencia: filters.agencia,
            },
            {
              cod_agencia_transito: filters.agencia,
            },
          ],
        };
      } else {
        params2.cod_agencia = filters.agencia;
      }
    }

    if (filters.agencia_dest) {
      if (filters.agencia_dest_transito) {
        params3 = {
          [Sequelize.Op.or]: [
            {
              cod_agencia_dest: filters.agencia_dest.split(','),
            },
            {
              cod_agencia_transito: filters.agencia_dest.split(','),
            },
          ],
        };
      } else {
        params2.cod_agencia_dest = filters.agencia_dest.split(',');
      }
    }

    if (filters.nro_documento) params2.nro_documento = filters.nro_documento;
    if (filters.tipo) params2.t_de_documento = filters.tipo;

    if (filters.tipo_in) {
      params2.t_de_documento = {
        [Sequelize.Op.in]: filters.tipo_in.split(','),
      };
    }

    if (filters.desde) {
      params2.fecha_emision = {
        [Sequelize.Op.gte]: filters.desde,
      };
    }

    if (filters.hasta) {
      if (filters.desde) {
        params2.fecha_emision = {
          [Sequelize.Op.between]: [filters.desde, filters.hasta],
        };
      } else {
        params2.fecha_emision = {
          [Sequelize.Op.lte]: filters.hasta,
        };
      }
    }

    if (filters.cliente_orig) params2.cod_cliente_org = filters.cliente_orig;
    if (filters.cliente_dest) params2.cod_cliente_dest = filters.cliente_dest;

    if (filters.cliente_orig_exist) {
      params2.cod_cliente_org = {
        [Sequelize.Op.not]: null,
      };
    }

    if (filters.cliente_part_exist) {
      params2.id_clte_part_orig = {
        [Sequelize.Op.not]: null,
      };
    }

    if (filters.estatus_oper) params2.estatus_operativo = filters.estatus_oper;
    if (filters.transito) params2.check_transito = filters.transito;

    if (filters.estatus_admin_in) {
      params2.estatus_administra = {
        [Sequelize.Op.in]: filters.estatus_admin_in.split(','),
      };
    }

    if (filters.estatus_admin_ex) {
      params2.estatus_administra = {
        [Sequelize.Op.notIn]: filters.estatus_admin_ex.split(','),
      };
    }
    if (filters.no_abono) {
      params2.monto_total = {
        [Sequelize.Op.col]: 'saldo',
      };
    }
    if (filters.no_pagada) {
      params2.monto_total = {
        [Sequelize.Op.ne]: {
          [Sequelize.Op.col]: 'saldo',
        },
      };
    }

    if (filters.si_saldo) {
      params2.saldo = {
        [Sequelize.Op.gt]: 0,
      };
    }

    if (filters.tipo_doc_ppal) params2.tipo_doc_principal = filters.tipo_doc_ppal;
    if (filters.nro_doc_ppal) params2.nro_doc_principal = filters.nro_doc_ppal;
    if (filters.serie_doc_ppal) params2.serie_doc_principal = filters.serie_doc_ppal;
    if (filters.nro_ctrl_doc_ppal) params2.nro_ctrl_doc_ppal = filters.nro_ctrl_doc_ppal;
    if (filters.nro_ctrl_doc_ppal_new)
      params2.nro_ctrl_doc_ppal_new = filters.nro_ctrl_doc_ppal_new;
    if (filters.cod_ag_doc_ppal) params2.cod_ag_doc_ppal = filters.cod_ag_doc_ppal;
    if (filters.pagado_en) params2.pagado_en = filters.pagado_en;
    if (filters.modalidad) params2.modalidad_pago = filters.modalidad;
    if (filters.prefix_nro) {
      params2.nro_documento = {
        [Sequelize.Op.startsWith]: filters.prefix_nro,
      };
    }

    let params = { ...params3, ...params2 };    

    let attributes = {
      include: [
        [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
        [Sequelize.literal(clienteDestDesc), 'cliente_dest_desc'],
        [Sequelize.literal(siglasDest), 'siglas_dest'],
      ],
    };

    if (filters.include_zona) {
      include = ['zonas_dest'];
    }

    if (filters.order_pe) {
      order.push(['cod_agencia', 'ASC']);
      order.push(['cod_agencia_dest', 'ASC']);
      order.push(['nro_documento', 'ASC']);
      order.push(['fecha_emision', 'ASC']);
    } else if (order_by) {
      if (order_by.includes(',')) {
        order = JSON.parse(order_by);
      } else if (order_by && order_direction) {
        order.push([order_by, order_direction]);
      }
    }

    return await utils.paginate(
      models.Mmovimientos,
      page,
      limit,
      params,
      order,
      attributes,
      include
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

  async guiasDispLote(lote) {
    let arrayDisp = [];
    let arrayLote = await models.Cguias.findByPk(lote, {
      include: ['agencias', 'clientes', 'agentes'],
      raw: true,
    });
    let movimientos = await models.Mmovimientos.findAll({
      where: {
        t_de_documento: 'GC',
        nro_documento: {
          [Sequelize.Op.gte]: arrayLote.control_inicio,
          [Sequelize.Op.lte]: arrayLote.control_final,
        },
      },
      raw: true,
    });
    for (var i = arrayLote.control_inicio; i <= arrayLote.control_final; i++) {
      if (movimientos.findIndex((item) => item.nro_documento == i) < 0) {
        arrayDisp.push({ nro_documento: i });
      }
    }
    arrayLote['data'] = arrayDisp;
    return arrayLote;
  }
}

module.exports = MmovimientosService;
