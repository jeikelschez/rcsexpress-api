const boom = require('@hapi/boom');
const moment = require('moment');

const { models, Sequelize } = require('./../libs/sequelize');

const caseTipo = '(CASE t_de_documento WHEN "GC" THEN "GUIA CARGA"' +
                                     ' WHEN "GF" THEN "GUIA FACTURA"' +
                                     ' WHEN "FA" THEN "FACTURA"' +
                                     ' WHEN "NC" THEN "NOTA DE CREDITO"' +
                                     ' ELSE "" END)';
const caseEstatusOper = '(CASE estatus_operativo WHEN "PR" THEN "En proceso de Envío"' +
                                               ' WHEN "PE" THEN "Pendiente por Entrega"' +
                                               ' WHEN "CO" THEN "Entrega Conforme"' +
                                               ' WHEN "NC" THEN "Entrega NO Conforme"' +
                                               ' ELSE "" END)';                                 

class MmovimientosService {

  constructor() {}

  async create(data) {
    const newMmovimiento = await models.Mmovimientos.create(data);
    return newMmovimiento;
  }

  async find(agencia, agencia_dest, nro_documento, tipo, desde, hasta, cliente_orig, cliente_dest, estatus_oper, transito) {
    
    let params = {};
    
    if(agencia) params.cod_agencia = agencia;
    if(agencia_dest) params.cod_agencia_dest = agencia_dest;
    if(nro_documento) params.nro_documento = nro_documento;
    if(tipo) params.t_de_documento = tipo;
    
    if(desde) {
      params.fecha_emision = {
        [Sequelize.Op.gte]: desde
      }
    };
    if(hasta) {
      params.fecha_emision = {
        [Sequelize.Op.lte]: hasta
      }
    };

    if(cliente_orig) params.cod_cliente_org = cliente_orig;
    if(cliente_dest) params.cod_cliente_dest = cliente_dest;
    if(estatus_oper) params.estatus_operativo = estatus_oper;
    if(transito) params.check_transito = transito;

    const mMovimientos = await models.Mmovimientos.findAll({
      where: params,
      attributes: {
        include: [
          [Sequelize.literal(caseTipo), 'tipo_desc'],
          [Sequelize.literal(caseEstatusOper), 'estatus_oper_desc']
        ]
      }
    });

    return mMovimientos;
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
