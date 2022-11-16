const boom = require('@hapi/boom');

const { models, Sequelize } = require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

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
const caseEstatusAdmin = '(CASE estatus_administra WHEN "E" THEN "En Elaboración"' +
                                                 ' WHEN "F" THEN "Pendiente por Facturar"' +
                                                 ' WHEN "G" THEN "Con Factura Generada"' +
                                                 ' WHEN "A" THEN "Anulada"' +
                                                 ' WHEN "P" THEN "Pendiente por Cobrar"' +
                                                 ' WHEN "C" THEN "Cancelada"' +
                                                 ' WHEN "I" THEN "Pendiente por Imprimir"' +
                                                 ' ELSE "" END)';
const casePagadoEn = '(CASE pagado_en WHEN "O" THEN "Origen"' +
                                    ' WHEN "D" THEN "Destino"' +
                                    ' ELSE "" END)';
const caseModalidad = '(CASE modalidad_pago WHEN "CR" THEN "Crédito"' +
                                          ' WHEN "CO" THEN "Contado"' +
                                          ' WHEN "PP" THEN "Prepagada"' +
                                          ' ELSE "" END)';

class MmovimientosService {

  constructor() {}  
  
  async create(data) {
    const newMmovimiento = await models.Mmovimientos.create(data);
    return newMmovimiento;
  }

  async find(page, limit, order_by, order_direction, filter, filter_value, agencia, agencia_dest, 
    nro_documento, tipo, desde, hasta, cliente_orig, cliente_dest, estatus_oper, transito, 
    estatus_admin_ex, no_abono) {    

    let params2 = {};
    let filterArray = {};
    let order = []; 
    
    if(agencia) params2.cod_agencia = agencia;
    if(agencia_dest) params2.cod_agencia_dest = agencia_dest;
    if(nro_documento) params2.nro_documento = nro_documento;
    if(tipo) params2.t_de_documento = tipo;
    
    if(desde) {
      params2.fecha_emision = {
        [Sequelize.Op.gte]: desde
      }
    };
    if(hasta) {
      params2.fecha_emision = {
        [Sequelize.Op.lte]: hasta
      }
    };

    if(cliente_orig) params2.cod_cliente_org = cliente_orig;
    if(cliente_dest) params2.cod_cliente_dest = cliente_dest;
    if(estatus_oper) params2.estatus_operativo = estatus_oper;
    if(transito) params2.check_transito = transito;
    if(estatus_admin_ex) {
      params2.estatus_administra = {
        [Sequelize.Op.notIn]: estatus_admin_ex.split(",")
      }
    };
    if(no_abono) {
      params2.monto_total = {
        [Sequelize.Op.col]: 'saldo'
      }
    };

    if(filter && filter_value) {
      let filters = [];
      filter.split(",").forEach(function(item) {
        let itemArray = {};
        itemArray[item] = { [Sequelize.Op.substring]: filter_value };
        filters.push(itemArray);
      })

      filterArray = { 
        [Sequelize.Op.or]: filters 
      };      
    }

    let params = { ...params2, ...filterArray };

    let attributes = {
      include: [
        [Sequelize.literal(caseTipo), 'tipo_desc'],
        [Sequelize.literal(caseEstatusOper), 'estatus_oper_desc'],
        [Sequelize.literal(caseEstatusAdmin), 'estatus_admin_desc'],        
        [Sequelize.literal(casePagadoEn), 'pagado_en_desc'],
        [Sequelize.literal(caseModalidad), 'modalidad_desc']
      ]
    };

    if(order_by && order_direction) {
      order.push([order_by, order_direction]);
    }

    return await utils.paginate(models.Mmovimientos, page, limit, params, order, attributes);
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
