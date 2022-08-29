const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class CguiasService {

  constructor() {}

  async create(data) {    
    // Valida que el lote no exista
    const cguias = await models.Cguias.count({
      where: {
        [Sequelize.Op.or]: [
          {
            tipo: data.tipo,
            control_inicio : {
              [Sequelize.Op.gte]: data.control_inicio
            },
            control_final : {
              [Sequelize.Op.lte]: data.control_final
            }                    
          },
          {
            tipo: data.tipo,
            control_inicio : {
              [Sequelize.Op.lte]: data.control_inicio
            },
            control_final : {
              [Sequelize.Op.gte]: data.control_final
            }                    
          },
        ]
      }  
    });

    if (cguias > 0) {
      throw boom.badRequest('El lote para este tipo de guía ya está registrado');
    }

    const newCguia = await models.Cguias.create(data);
    return newCguia;
  }  

  async find(page, limit, order_by, order_direction, agencia, agente, cliente, desde, hasta, disp, tipo) {    
    let params = {};
    let order = [];
    
    if(agencia) params.cod_agencia = agencia;
    if(agente) params.cod_agente = agente;
    if(cliente) params.cod_cliente = cliente;
    
    if(desde) {
      params.control_inicio = {
        [Sequelize.Op.lte]: desde
      }
    };
    if(hasta) {
      params.control_final = {
        [Sequelize.Op.gte]: hasta
      }
    };
    
    if(disp) params.cant_disponible = disp;
    if(tipo) params.tipo = tipo;

    if(order_by && order_direction) {
      order.push([order_by, order_direction]);
    }

    let attributes = {};
    let include = ['tipos'];

    return await utils.paginate(models.Cguias, page, limit, params, order, attributes, include);
  }

  async findOne(id) {
    const cguia = await models.Cguias.findByPk(id, {
      include: ['tipos']
    });
    if (!cguia) {
      throw boom.notFound('Numero de Control de Guía no existe');
    }
    return cguia;
  }

  async update(id, changes) {
    const cguia = await models.Cguias.findByPk(id);
    if (!cguia) {
      throw boom.notFound('Numero de Control de Guía no existe');
    }
    const rta = await cguia.update(changes);
    return rta;
  }

  async delete(id) {
    const cguia = await models.Cguias.findByPk(id);
    if (!cguia) {
      throw boom.notFound('Numero de Control de Guía no existe');
    }
    await cguia.destroy();
    return { id };
  }
}

module.exports = CguiasService;
