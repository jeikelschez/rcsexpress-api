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
const fechaEnvioCosto =
  '(SELECT max(costos_transporte.fecha_envio) ' +
  ' FROM detalle_costos_guias ' +
  ' JOIN costos_transporte ON detalle_costos_guias.cod_costo = costos_transporte.id ' +
  ' WHERE `Mmovimientos`.id = detalle_costos_guias.cod_movimiento)';
const comisionEnt =
  '(SELECT ROUND(`Mmovimientos`.base_comision_vta_rcl * (agentes.porc_comision_entrega / 100), 2) ' +
  ' FROM agentes ' +
  ' WHERE `Mmovimientos`.cod_agente_entrega = agentes.id)';
const comisionSeg =
  '(SELECT ROUND(`Mmovimientos`.base_comision_seg * (agentes.porc_comision_seguro / 100), 2) ' +
  ' FROM agentes ' +
  ' WHERE `Mmovimientos`.cod_agente_entrega = agentes.id)';
const siglasOrg =
  '(SELECT siglas' +
  ' FROM agencias ' +
  ' JOIN ciudades ON agencias.cod_ciudad = ciudades.id ' +
  ' WHERE `Mmovimientos`.cod_agencia = agencias.id)';
const siglasDest =
  '(SELECT siglas' +
  ' FROM agencias ' +
  ' JOIN ciudades ON agencias.cod_ciudad = ciudades.id ' +
  ' WHERE `Mmovimientos`.cod_agencia_dest = agencias.id)';
const motivoRetraso =
  '(SELECT desc_concepto' +
  ' FROM conceptos_operacion' +
  ' WHERE `Mmovimientos`.cod_motivo_retraso = conceptos_operacion.cod_concepto)';

class MmovimientosService {
  constructor() {}

  async create(data) {
    const newMmovimiento = await models.Mmovimientos.create(data);
    return newMmovimiento;
  }

  async findGuias(client, desde, hasta, estatus, ciudad, guia, serie) {
    let params = {};
    let params2 = {};

    params.cod_cliente_org = client;
    params.fecha_emision = {
      [Sequelize.Op.between]: [desde, hasta],
    };
    params.t_de_documento = 'GC';

    if (guia) {
      params.nro_documento = guia;
    } else if (!serie) {
      params.nro_documento = {
        [Sequelize.Op.lte]: 550000000,
      };
    }

    if (estatus) {
      params.estatus_operativo = estatus;
    }

    if (ciudad) {
      params2.id = ciudad;
    }    

    const guias = await models.Mmovimientos.findAll({
      where: params,
      attributes: [
        'cod_cliente_org',
        'nro_documento',
        'dimensiones',
        'nro_piezas',
        'peso_kgs',
        'persona_recibio',
        'ci_persona_recibio',
        'fecha_emision',
        'fecha_envio',
        'fecha_recepcion',
        'hora_recepcion',
        'estatus_operativo',
        'observacion_entrega',
        'modalidad_pago',
        'cod_agencia_transito',
        [Sequelize.literal(clienteDestDesc), 'cliente_dest_desc'],
        [Sequelize.literal(motivoRetraso), 'motivo_retraso'],
      ],
      include: [
        {
          model: models.Agencias,
          as: 'agencias_dest',
          attributes: ['id'],
          required: true,
          include: [
            {
              model: models.Ciudades,
              as: 'ciudades',
              required: true,
              where: params2,
            },
          ],
        },
        {
          model: models.Agencias,
          as: 'agencias_trans',
          attributes: ['id', 'nb_agencia'],
          required: false,
        },
      ],
      order: [['nro_documento', 'DESC']],
    });
    return guias;
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
              cod_agencia_dest: filters.agencia_dest.toString().split(','),
            },
            {
              cod_agencia_transito: filters.agencia_dest.toString().split(','),
            },
          ],
        };
      } else {
        params2.cod_agencia_dest = filters.agencia_dest.toString().split(',');
      }
    }

    if (filters.agente) {
      params2.cod_agente_entrega = {
        [Sequelize.Op.in]: filters.agente.toString().split(','),
      };
    }

    if (filters.nro_documento) params2.nro_documento = filters.nro_documento;
    if (filters.tipo) params2.t_de_documento = filters.tipo;

    if (filters.tipo_in) {
      params2.t_de_documento = {
        [Sequelize.Op.in]: filters.tipo_in.toString().split(','),
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

    if (filters.estatus_oper_in) {
      params2.estatus_operativo = {
        [Sequelize.Op.in]: filters.estatus_oper_in.toString().split(','),
      };
    }

    if (filters.transito) params2.check_transito = filters.transito;

    if (filters.estatus_admin_in) {
      params2.estatus_administra = {
        [Sequelize.Op.in]: filters.estatus_admin_in.toString().split(','),
      };
    }

    if (filters.estatus_admin_ex) {
      params2.estatus_administra = {
        [Sequelize.Op.notIn]: filters.estatus_admin_ex.toString().split(','),
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

    if (filters.tipo_doc_ppal)
      params2.tipo_doc_principal = filters.tipo_doc_ppal;
    if (filters.nro_doc_ppal) params2.nro_doc_principal = filters.nro_doc_ppal;
    if (filters.serie_doc_ppal)
      params2.serie_doc_principal = filters.serie_doc_ppal;
    if (filters.nro_ctrl_doc_ppal)
      params2.nro_ctrl_doc_ppal = filters.nro_ctrl_doc_ppal;
    if (filters.nro_ctrl_doc_ppal_new)
      params2.nro_ctrl_doc_ppal_new = filters.nro_ctrl_doc_ppal_new;
    if (filters.cod_ag_doc_ppal)
      params2.cod_ag_doc_ppal = filters.cod_ag_doc_ppal;
    if (filters.pagado_en) params2.pagado_en = filters.pagado_en;
    if (filters.modalidad) params2.modalidad_pago = filters.modalidad;
    if (filters.prefix_nro) {
      params2.nro_documento = {
        [Sequelize.Op.startsWith]: filters.prefix_nro,
      };
    }

    if (filters.serie) {
      if (!filters.serie.includes('44'))
        params2.nro_documento = {
          [Sequelize.Op.gt]: 550000000,
        };

      if (!filters.serie.includes('55'))
        params2.nro_documento = {
          [Sequelize.Op.lte]: 550000000,
        };
    }

    let params = { ...params3, ...params2 };

    let attributes = {
      include: [
        [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
        [Sequelize.literal(clienteDestDesc), 'cliente_dest_desc'],
        [Sequelize.literal(siglasOrg), 'siglas_org'],
        [Sequelize.literal(siglasDest), 'siglas_dest'],
      ],
    };

    if (filters.include_fc) {
      attributes.include.push([
        Sequelize.literal(fechaEnvioCosto),
        'fecha_envio_costo',
      ]);
      attributes.include.push([
        Sequelize.literal(comisionEnt),
        'comision_entrega',
      ]);
      attributes.include.push([
        Sequelize.literal(comisionSeg),
        'comision_seguro',
      ]);
    }

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
