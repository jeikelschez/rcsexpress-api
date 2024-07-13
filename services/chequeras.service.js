const boom = require('@hapi/boom');

const { models } = require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

class ChequerasService {
  constructor() {}

  async create(data) {
    const newChequera = await models.Chequeras.create(data);
    return newChequera;
  }

  async find(cuenta, estatus) {
    let params = {};
    if (cuenta) params.cod_cuenta = cuenta;
    if (estatus) params.estatus_chequera = estatus;
    const chequeras = await models.Chequeras.findAll({
      where: params,
    });
    return chequeras;
  }

  async findOne(id) {
    const chequera = await models.Chequeras.findByPk(id);
    if (!chequera) {
      throw boom.notFound('Chequera no existe');
    }
    return chequera;
  }

  async update(id, changes) {
    const chequera = await models.Chequeras.findByPk(id);
    if (!chequera) {
      throw boom.notFound('Chequera no existe');
    }
    const rta = await chequera.update(changes);
    return rta;
  }

  async delete(id) {
    const chequera = await models.Chequeras.findByPk(id);
    if (!chequera) {
      throw boom.notFound('Chequera no existe');
    }
    await chequera.destroy();
    return { id };
  }
}

module.exports = ChequerasService;
