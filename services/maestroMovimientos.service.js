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

  async find(
    page,
    limit,
    orderby,
    orderdirection,
    filter,
    filtervalue,
    agencia,
    agenciatransito,
    agenciadest,
    agenciadesttransito,
    nrodocumento,
    tipo,
    tipoin,
    desde,
    hasta,
    clienteorig,
    clientedest,
    clienteorigexist,
    clientepartexist,
    estatusoper,
    transito,
    estatusadminin,
    estatusadminex,
    noabono,
    tipodocppal,
    nrodocppal,
    seriedocppal,
    nroctrldocppal,
    nroctrldocppalnew,
    codagdocppal,
    orderpe,
    pagadoen,
    modalidad,
    prefixnro,
    includezona,
    nopagada,
    sisaldo
  ) {
    let params2 = {};
    let params3 = {};
    let filterArray = {};
    let order = [];
    let include = [];

    if (agencia) {
      if (agenciatransito) {
        params3 = {
          [Sequelize.Op.or]: [
            {
              cod_agencia: agencia,
            },
            {
              cod_agencia_transito: agencia,
            },
          ],
        };
      } else {
        params2.cod_agencia = agencia;
      }
    }

    if (agenciadest) {
      if (agenciadesttransito) {
        params3 = {
          [Sequelize.Op.or]: [
            {
              cod_agencia_dest: agenciadest.split(','),
            },
            {
              cod_agencia_transito: agenciadest.split(','),
            },
          ],
        };
      } else {
        params2.cod_agencia_dest = agenciadest.split(',');
      }
    }

    if (nrodocumento) params2.nro_documento = nrodocumento;
    if (tipo) params2.t_de_documento = tipo;

    if (tipoin) {
      params2.t_de_documento = {
        [Sequelize.Op.in]: tipoin.split(','),
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

    if (clienteorig) params2.cod_cliente_org = clientorig;
    if (clientedest) params2.cod_cliente_dest = clientedest;

    if (clienteorigexist) {
      params2.cod_cliente_org = {
        [Sequelize.Op.not]: null,
      };
    }

    if (clientepartexist) {
      params2.id_clte_part_orig = {
        [Sequelize.Op.not]: null,
      };
    }

    if (estatusoper) params2.estatus_operativo = estatusoper;
    if (transito) params2.check_transito = transito;

    if (estatusadminin) {
      params2.estatus_administra = {
        [Sequelize.Op.in]: estatusadminin.split(','),
      };
    }

    if (estatusadminex) {
      params2.estatus_administra = {
        [Sequelize.Op.notIn]: estatusadminex.split(','),
      };
    }
    if (noabono) {
      params2.monto_total = {
        [Sequelize.Op.col]: 'saldo',
      };
    }
    if (nopagada) {
      params2.monto_total = {
        [Sequelize.Op.ne]: {
          [Sequelize.Op.col]: 'saldo',
        },
      };
    }

    if (sisaldo) {
      params2.saldo = {
        [Sequelize.Op.gt]: 0,
      };
    }

    if (tipodocppal) params2.tipo_doc_principal = tipodocppal;
    if (nrodocppal) params2.nro_doc_principal = nrodocppal;
    if (seriedocppal) params2.serie_doc_principal = seriedocppal;
    if (nroctrldocppal) params2.nro_ctrl_doc_ppal = nroctrldocppal;
    if (nroctrldocppalnew) params2.nro_ctrl_doc_ppal_new = nroctrldocppalnew;
    if (codagdocppal) params2.cod_ag_doc_ppal = codagdocppal;
    if (pagadoen) params2.pagado_en = pagadoen;
    if (modalidad) params2.modalidad_pago = modalidad;
    if (prefixnro) {
      params2.nro_documento = {
        [Sequelize.Op.startsWith]: prefixnro,
      };
    }

    if (filter && filtervalue) {
      let filters = [];
      filter.split(',').forEach(function (item) {
        let itemArray = {};
        itemArray[item] = { [Sequelize.Op.substring]: filtervalue };
        filters.push(itemArray);
      });

      filterArray = {
        [Sequelize.Op.or]: filters,
      };
    }

    let params = { ...params3, ...params2, ...filterArray };

    logger.info(JSON.stringify(params));

    let attributes = {
      include: [
        [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
        [Sequelize.literal(clienteDestDesc), 'cliente_dest_desc'],
        [Sequelize.literal(siglasDest), 'siglas_dest'],
      ],
    };

    if (includezona) {
      include = ['zonas_dest'];
    }

    if (orderpe) {
      order.push(['cod_agencia', 'ASC']);
      order.push(['cod_agencia_dest', 'ASC']);
      order.push(['nro_documento', 'ASC']);
      order.push(['fecha_emision', 'ASC']);
    } else if (orderby) {
      if (orderby.includes(',')) {
        order = JSON.parse(orderby);
      } else if (orderby && orderdirection) {
        order.push([orderby, orderdirection]);
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
