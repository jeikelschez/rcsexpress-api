const boom = require('@hapi/boom');
const moment = require('moment');

const { models, Sequelize } = require('./../libs/sequelize');

class MmovimientosService {

  constructor() {}

  async create(data) {
    const newMmovimiento = await models.Mmovimientos.create(data);
    return newMmovimiento;
  }

  async findOne(id) {
    const mMovimiento = await models.Mmovimientos.findByPk(id);
    if (!mMovimiento) {
      throw boom.notFound('Maestro de Movimientos no existe');
    }
    return mMovimiento;
  }

  async update(id, changes) {
    const mMovimiento = await models.Mmovimientos.findByPk(id);
    if (!mMovimiento) {
      throw boom.notFound('Maestro de Movimientos no existe');
    }
    const rta = await mMovimiento.update(changes);
    return rta;
  }

  async delete(id) {
    const mMovimiento = await models.Mmovimientos.findByPk(id);
    if (!mMovimiento) {
      throw boom.notFound('Maestro de Movimientos no existe');
    }
    await mMovimiento.destroy();
    return { id };
  }
}

module.exports = MmovimientosService;
