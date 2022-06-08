const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');

const caseActivo = '(CASE flag_activo WHEN "1" THEN "ACTIVO" ELSE "INACTIVO" END)';

class AyudantesService {

  constructor() {}

  async create(data) {
    const newAyudante = await models.Ayudantes.create(data);
    return newAyudante;
  }

  async find() {
    const ayudantes = await models.Ayudantes.findAll({
      attributes: {
        include: [
          [Sequelize.literal(caseActivo), 'activo_desc']
        ]
      }
    });
    return ayudantes;
  }

  async findOne(id) {
    const ayudante = await models.Ayudantes.findByPk(id,
      {
        attributes: {
          include: [
            [Sequelize.literal(caseActivo), 'activo_desc']
          ]
        }
      }
    );
    if (!ayudante) {
      throw boom.notFound('Ayudante no existe');
    }
    return ayudante;
  }

  async update(id, changes) {
    const ayudante = await models.Ayudantes.findByPk(id);
    if (!ayudante) {
      throw boom.notFound('Ayudante no existe');
    }
    const rta = await ayudante.update(changes);
    return rta;
  }

  async delete(id) {
    const ayudante = await models.Ayudantes.findByPk(id);
    if (!ayudante) {
      throw boom.notFound('Ayudante no existe');
    }
    await ayudante.destroy();
    return { id };
  }
}

module.exports = AyudantesService;
