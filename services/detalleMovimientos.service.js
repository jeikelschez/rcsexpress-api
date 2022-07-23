const boom = require('@hapi/boom');
const moment = require('moment');

const { models, Sequelize } = require('./../libs/sequelize');

class DmovimientosService {

  constructor() {}

  async create(data) {
    const newDmovimiento = await models.Dmovimientos.create(data);
    return newDmovimiento;
  }

  async findOne(id) {
    const dMovimiento = await models.Dmovimientos.findByPk(id);
    if (!dMovimiento) {
      throw boom.notFound('Detalle de Movimientos no existe');
    }
    return dMovimiento;
  }

  async update(id, changes) {
    const dMovimiento = await models.Dmovimientos.findByPk(id);
    if (!dMovimiento) {
      throw boom.notFound('Detalle de Movimientos no existe');
    }
    const rta = await dMovimiento.update(changes);
    return rta;
  }

  async delete(id) {
    const dMovimiento = await models.Dmovimientos.findByPk(id);
    if (!dMovimiento) {
      throw boom.notFound('Detalle de Movimientos no existe');
    }
    await dMovimiento.destroy();
    return { id };
  }
}

module.exports = DmovimientosService;
