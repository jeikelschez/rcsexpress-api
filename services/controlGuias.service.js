const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');

class CguiasService {

  constructor() {}

  async create(data) {
    const newCguia = await models.Cguias.create(data);
    return newCguia;
  }

  async find(agencia, tipo) {
    let params = {};
    if(agencia) params.cod_agencia = agencia;
    if(tipo) params.tipo = tipo;
    const cguias = await models.Cguias.findAll({
      where: params
    });
    return cguias;
  }

  async findOne(id) {
    const cguia = await models.Cguias.findByPk(id);
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
