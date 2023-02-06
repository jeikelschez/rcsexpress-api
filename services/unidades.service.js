const boom = require('@hapi/boom');

const { models, Sequelize } = require('./../libs/sequelize');

const unidadDesc = "CONCAT(placas, ' - Vehículo: ', descripcion, ' - ', chofer)";

class UnidadesService {

  constructor() {}

  async create(data) {
    const newUnidad = await models.Unidades.create(data);
    return newUnidad;
  }

  async find() {
    const unidades = await models.Unidades.findAll({
      attributes: {
        include: [
          [Sequelize.literal(unidadDesc), 'unidad_desc']
        ]
      }
    });
    return unidades;
  }

  async findOne(id) {
    const unidad = await models.Unidades.findByPk(id);
    if (!unidad) {
      throw boom.notFound('Unidad no existe');
    }
    return unidad;
  }

  async update(id, changes) {
    const unidad = await models.Unidades.findByPk(id);
    if (!unidad) {
      throw boom.notFound('Unidad no existe');
    }
    const rta = await unidad.update(changes);
    return rta;
  }

  async delete(id) {
    const unidad = await models.Unidades.findByPk(id);
    if (!unidad) {
      throw boom.notFound('Unidad no existe');
    }
    await unidad.destroy();
    return { id };
  }
}

module.exports = UnidadesService;
