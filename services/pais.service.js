const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');

const caseTipo = '(CASE tipo_pais WHEN "N" THEN "NACIONAL" ELSE "INTERNACIONAL" END)';

class PaisService {

  constructor() {}

  async create(data) {
    const newPais = await models.Pais.create(data);
    return newPais;
  }

  async find() {
    const paises = await models.Pais.findAll({
      attributes: {
        include: [
          [Sequelize.literal(caseTipo), 'tipo_pais_desc']
        ]
      }
    });
    return paises;
  }

  async findOne(id) {
    const pais = await models.Pais.findByPk(id, {
      attributes: {
        include: [
          [Sequelize.literal(caseTipo), 'tipo_pais_desc']
        ]
      }
    });
    if (!pais) {
      throw boom.notFound('Pais no existe');
    }
    return pais;
  }

  async findOneEstados(id) {
    const pais = await models.Pais.findByPk(id, {
      include: ['estados']
    });
    if (!pais) {
      throw boom.notFound('Pais no existe');
    }
    return pais;
  }

  async update(id, changes) {
    const pais = await models.Pais.findByPk(id);
    if (!pais) {
      throw boom.notFound('Pais no existe');
    }
    const rta = await pais.update(changes);
    return rta;
  }

  async delete(id) {
    const pais = await models.Pais.findByPk(id);
    if (!pais) {
      throw boom.notFound('Pais no existe');
    }
    await pais.destroy();
    return { id };
  }
}

module.exports = PaisService;
