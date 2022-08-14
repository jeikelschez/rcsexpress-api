const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');

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

  async find(agencia, agente, cliente, desde, hasta, disp, tipo) {
    
    let params = {};
    
    if(agencia) params.cod_agencia = agencia;
    if(agente) params.cod_agente = agente;
    if(cliente) params.cod_cliente = cliente;
    
    if(desde) {
      params.control_inicio = {
        [Sequelize.Op.gte]: desde
      }
    };
    if(hasta) {
      params.control_final = {
        [Sequelize.Op.lte]: hasta
      }
    };
    
    if(disp) params.cant_disponible = disp;
    if(tipo) params.tipo = tipo;
    
    const cguias = await models.Cguias.findAll({
      include: ['tipos'],
      where: params,
      order: [
        ['control_inicio', 'DESC']
      ]
    });
    
    return cguias;
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