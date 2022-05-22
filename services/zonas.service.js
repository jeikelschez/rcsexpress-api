const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');

const caseTipo = '(CASE tipo_zona WHEN "U" THEN "URBANA" ELSE "EXTRAURBANA" END)';

class ZonasService {

  constructor() {}

  async create(data) {
    const newZona = await models.Zonas.create(data);
    return newZona;
  }

  async find() {
    const zonas = await models.Zonas.findAll({
      attributes: {
        include: [
          [Sequelize.literal(caseTipo), 'tipo_desc']
        ]
      }
    });
    return zonas;
  }

  async findOne(id) {
    const zona = await models.Zonas.findByPk(id,
      {
        attributes: {
          include: [
            [Sequelize.literal(caseTipo), 'tipo_desc']
          ]
        }
      }
    );
    if (!zona) {
      throw boom.notFound('Zona no existe');
    }
    return zona;
  }

  async update(id, changes) {
    const zona = await models.Zonas.findByPk(id);
    if (!zona) {
      throw boom.notFound('Zona no existe');
    }
    const rta = await zona.update(changes);
    return rta;
  }

  async delete(id) {
    const zona = await models.Zonas.findByPk(id);
    if (!zona) {
      throw boom.notFound('Zona no existe');
    }
    await zona.destroy();
    return { id };
  }
}

module.exports = ZonasService;