const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class CuentasService {

  constructor() {}

  async create(data) {
    const newCuenta = await models.Cuentas.create(data);
    return newCuenta;
  }

  async find() {
    const cuentas = await models.Cuentas.findAll();
    return cuentas;
  }

  async findOne(id) {
    const cuenta = await models.Cuentas.findByPk(id);
    if (!cuenta) {
      throw boom.notFound('Cuenta no existe');
    }
    return cuenta;
  }

  async update(id, changes) {
    const cuenta = await models.Cuentas.findByPk(id);
    if (!cuenta) {
      throw boom.notFound('Cuenta no existe');
    }
    const rta = await cuenta.update(changes);
    return rta;
  }

  async delete(id) {
    const cuenta = await models.Cuentas.findByPk(id);
    if (!cuenta) {
      throw boom.notFound('Cuenta no existe');
    }
    await cuenta.destroy();
    return { id };
  }
}

module.exports = CuentasService;
