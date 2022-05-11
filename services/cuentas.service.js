const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');

const caseTipo = '(CASE tipo_cuenta WHEN "C" THEN "CORRIENTE" ELSE "AHORRO" END)';
const caseActiva = '(CASE flag_activa WHEN "1" THEN "ACTIVA" ELSE "INACTIVA" END)';

class CuentasService {

  constructor() {}

  async create(data) {
    const newCuenta = await models.Cuentas.create(data);
    return newCuenta;
  }

  async find() {
    const cuentas = await models.Cuentas.findAll({
      attributes: {
        include: [
          [Sequelize.literal(caseTipo), 'tipo_desc'],
          [Sequelize.literal(caseActiva), 'activa_desc']
        ]
      }
    });
    return cuentas;
  }

  async findOne(id) {
    const cuenta = await models.Cuentas.findByPk(id,
      {
        attributes: {
          include: [
            [Sequelize.literal(caseTipo), 'tipo_desc'],
            [Sequelize.literal(caseActiva), 'activa_desc']
          ]
        }
      }
    );
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
