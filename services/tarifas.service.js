const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class TarifasService {

  constructor() {}

  async create(data) {
    const newTarifa = await models.Tarifas.create(data);
    return newTarifa;
  }

  async find() {
    const tarifas = await models.Tarifas.findAll();
    return tarifas;
  }

  async findOne(id) {
    const tarifa = await models.Tarifas.findByPk(id);
    if (!tarifa) {
      throw boom.notFound('Tarifa no existe');
    }
    return tarifa;
  }

  async findOnePermisos(id) {
    const tarifa = await models.Tarifas.findByPk(id, {
      include: ['permisos']
    });
    if (!tarifa) {
      throw boom.notFound('Tarifa no existe');
    }
    return tarifa;
  }

  async update(id, changes) {
    const tarifa = await models.Tarifas.findByPk(id);
    if (!tarifa) {
      throw boom.notFound('Tarifa no existe');
    }
    const rta = await tarifa.update(changes);
    return rta;
  }

  async delete(id) {
    const tarifa = await models.Tarifas.findByPk(id);
    if (!tarifa) {
      throw boom.notFound('Tarifa no existe');
    }
    await tarifa.destroy();
    return { id };
  }
}

module.exports = TarifasService;
