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
      orderBy,
      orderDirection,
      filter,
      filterValue,
      agencia,
      agenciaTransito,
      agenciaDest,
      agenciaDestTransito,
      nroDocumento,
      tipo,
      tipoIn,
      desde,
      hasta,
      clienteOrig,
      clienteDest,
      clienteOrigExist,
      clientePartExist,
      estatusOper,
      transito,
      estatusAdminIn,
      estatusAdminEx,
      noAbono,
      tipoDocPpal,
      nroDocPpal,
      serieDocPpal,
      nroCtrlDocPpal,
      nroCtrlDocPpalNew,
      codAgDocPpal,
      orderPe,
      pagadoEn,
      modalidad,
      prefixNro,
      includeZona,
      noPagada,
      siSaldo
  ) {
    let params2 = {};
    let params3 = {};
    let filterArray = {};
    let order = [];
    let include = [];    

    if (agencia) {
      if (agenciaTransito) {
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

    if (agenciaDest) {
      if (agenciaDestTransito) {
        params3 = {
          [Sequelize.Op.or]: [
            {
              cod_agencia_dest: agenciaDest.split(','),
            },
            {
              cod_agencia_transito: agenciaDest.split(','),
            },
          ],
        };
      } else {
        params2.cod_agencia_dest = agenciaDest.split(',');
      }
    }

    if (nroDocumento) params2.nro_documento = nroDocumento;
    if (tipo) params2.t_de_documento = tipo;

    if (tipoIn) {
      params2.t_de_documento = {
        [Sequelize.Op.in]: tipoIn.split(','),
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

    if (clienteOrig) params2.cod_cliente_org = clientOrig;
    if (clienteDest) params2.cod_cliente_dest = clienteDest;

    if (clienteOrigExist) {
      params2.cod_cliente_org = {
        [Sequelize.Op.not]: null,
      };
    }

    if (clientePartExist) {
      params2.id_clte_part_orig = {
        [Sequelize.Op.not]: null,
      };
    }

    if (estatusOper) params2.estatus_operativo = estatusOper;
    if (transito) params2.check_transito = transito;

    if (estatusAdminIn) {
      params2.estatus_administra = {
        [Sequelize.Op.in]: estatusAdminIn.split(','),
      };
    }

    if (estatusAdminEx) {
      params2.estatus_administra = {
        [Sequelize.Op.notIn]: estatusAdminEx.split(','),
      };
    }
    if (noAbono) {
      params2.monto_total = {
        [Sequelize.Op.col]: 'saldo',
      };
    }
    if (noPagada) {
      params2.monto_total = {
        [Sequelize.Op.ne]: {
          [Sequelize.Op.col]: 'saldo',
        },
      };
    }

    if (siSaldo) {
      params2.saldo = {
        [Sequelize.Op.gt]: 0,
      };
    }

    if (tipoDocPpal) params2.tipo_doc_principal = tipoDocPpal;
    if (nroDocPpal) params2.nro_doc_principal = nroDocPpal;
    if (serieDocPpal) params2.serie_doc_principal = serieDocPpal;
    if (nroCtrlDocPpal) params2.nro_ctrl_doc_ppal = nroCtrlDocPpal;
    if (nroCtrlDocPpalNew)
      params2.nro_ctrl_doc_ppal_new = nroCtrlDocPpalNew;
    if (codAgDocPpal) params2.cod_ag_doc_ppal = codAgDocPpal; 
    if (pagadoEn) params2.pagado_en = pagadoEn;
    if (modalidad) params2.modalidad_pago = modalidad;
    if (prefixNro) {
      params2.nro_documento = {
        [Sequelize.Op.startsWith]: prefixNnro,
      };
    }

    if (filter && filterValue) {
      let filters = [];
      filter.split(',').forEach(function (item) {
        let itemArray = {};
        itemArray[item] = { [Sequelize.Op.substring]: filterValue };
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

    if (includeZona) {
      include = ['zonas_dest'];
    }

    if (orderPe) {
      order.push(['cod_agencia', 'ASC']);
      order.push(['cod_agencia_dest', 'ASC']);
      order.push(['nro_documento', 'ASC']);
      order.push(['fecha_emision', 'ASC']);
    } else if (orderBy) {
      if (orderBy.includes(',')) {
        order = JSON.parse(orderBy);
      } else if (orderBy && orderDirection) {
        order.push([orderBy, orderDirection]);
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
