const boom = require('@hapi/boom');

const { models, Sequelize } = require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

const clienteOrigDesc =
  '(CASE WHEN (ci_rif_cte_conta_org IS NULL || ci_rif_cte_conta_org = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `Mmovimientos`.cod_cliente_org = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `Mmovimientos`.cod_agencia = clientes_particulares.cod_agencia' +
  ' AND `Mmovimientos`.cod_cliente_org = clientes_particulares.cod_cliente' +
  ' AND `Mmovimientos`.ci_rif_cte_conta_org = clientes_particulares.rif_ci' +
  ' AND clientes_particulares.estatus = "A" LIMIT 1)' +
  ' END)';
const clienteDestDesc =
  '(CASE WHEN (ci_rif_cte_conta_dest IS NULL || ci_rif_cte_conta_dest = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `Mmovimientos`.cod_cliente_dest = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `Mmovimientos`.cod_agencia_dest = clientes_particulares.cod_agencia' +
  ' AND `Mmovimientos`.cod_cliente_dest = clientes_particulares.cod_cliente' +
  ' AND `Mmovimientos`.ci_rif_cte_conta_dest = clientes_particulares.rif_ci' +
  ' AND clientes_particulares.estatus = "A" LIMIT 1)' +
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

  async find(
    page,
    limit,
    order_by,
    order_direction,
    filter,
    filter_value,
    agencia,
    agencia_transito,
    agencia_dest,
    agencia_dest_transito,
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
    nro_ctrl_doc_ppal_new,
    cod_ag_doc_ppal,
    order_pe,
    pagado_en,
    modalidad,
    prefix_nro,
    include_zona
  ) {
    let params2 = {};
    let params3 = {};
    let filterArray = {};
    let order = [];
    let include = [];

    if (agencia) {
      params2.cod_agencia = agencia.split(',');
    }

    if (agencia) {
      if (agencia_transito) {
        params3 = {
          [Sequelize.Op.or]: [
            {
              cod_agencia: agencia.split(','),
            },
            {
              cod_agencia_transito: agencia.split(','),
            },
          ],
        };
      } else {
        params2.cod_agencia_dest = agencia_dest.split(',');
      }
    }

    if (agencia_dest) {
      if (agencia_dest_transito) {
        params3 = {
          [Sequelize.Op.or]: [
            {
              cod_agencia_dest: agencia_dest.split(','),
            },
            {
              cod_agencia_transito: agencia_dest.split(','),
            },
          ],
        };
      } else {
        params2.cod_agencia_dest = agencia_dest.split(',');
      }
    }

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
    if (nro_ctrl_doc_ppal_new)
      params2.nro_ctrl_doc_ppal_new = nro_ctrl_doc_ppal_new;
    if (cod_ag_doc_ppal) params2.cod_ag_doc_ppal = cod_ag_doc_ppal;
    if (pagado_en) params2.pagado_en = pagado_en;
    if (modalidad) params2.modalidad_pago = modalidad;
    if (prefix_nro) {
      params2.nro_documento = {
        [Sequelize.Op.startsWith]: prefix_nro,
      };
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

    let params = { ...params3, ...params2, ...filterArray };

    let attributes = {
      include: [
        [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
        [Sequelize.literal(clienteDestDesc), 'cliente_dest_desc'],
        [Sequelize.literal(siglasDest), 'siglas_dest'],

      ],
    };

    if (include_zona) {
      include = ['zonas_dest'];
    }

    if (order_pe) {
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
