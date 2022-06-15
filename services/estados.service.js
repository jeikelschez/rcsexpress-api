const boom = require('@hapi/boom');

const { models, Sequelize } = require('./../libs/sequelize');

class EstadosService {

  constructor() {}

  async create(data) {
    const newEstado = await models.Estados.create(data);
    return newEstado;
  }

  async find(pais) {
    let params = {};
    if(pais) params.cod_pais = pais;
    const estados = await models.Estados.findAll({
      where: params,
      include: ['paises']
    });
    return estados;
  }

  async findOne(id) {
    const estado = await models.Estados.findByPk(id, {
      include: ['paises']
    });
    if (!estado) {
      throw boom.notFound('Estado no existe');
    }
    return estado;
  }

  async findOneLocalidades(id) {
    const estado = await models.Estados.findByPk(id, {
      include: ['localidades']
    });
    if (!estado) {
      throw boom.notFound('Estado no existe');
    }
    return estado;
  }

  async update(id, changes) {
    const estado = await models.Estados.findByPk(id);
    if (!estado) {
      throw boom.notFound('Estado no existe');
    }
    const rta = await estado.update(changes);
    return rta;
  }

  async delete(id) {
    const estado = await models.Estados.findByPk(id);
    if (!estado) {
      throw boom.notFound('Estado no existe');
    }
    await estado.destroy();
    return { id };
  }
}

module.exports = EstadosService;
