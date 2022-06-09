const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');

const caseTipo = '(CASE tipo_cuenta WHEN "C" THEN "CORRIENTE" ELSE "AHORRO" END)';
const caseActiva = '(CASE flag_activa WHEN "A" THEN "ACTIVA" ELSE "INACTIVA" END)';

class BancosService {

  constructor() {}

  async create(data) {
    const newBanco = await models.Bancos.create(data);
    return newBanco;
  }

  async find() {
    const bancos = await models.Bancos.findAll();
    return bancos;
  }

  async findOne(id) {
    const banco = await models.Bancos.findByPk(id);
    if (!banco) {
      throw boom.notFound('Banco no existe');
    }
    return banco;
  }

  async findOneCuentas(id) {
    const banco = await models.Bancos.findByPk(id, {
      include: [
        {
          association: 'cuentas',
          attributes: {
            include: [
              [Sequelize.literal(caseTipo), 'tipo_desc'],
              [Sequelize.literal(caseActiva), 'activa_desc']
            ]
          }
        }
      ]
    });
    if (!banco) {
      throw boom.notFound('Banco no existe');
    }
    return banco;
  }

  async update(id, changes) {
    const banco = await models.Bancos.findByPk(id);
    if (!banco) {
      throw boom.notFound('Banco no existe');
    }
    const rta = await banco.update(changes);
    return rta;
  }

  async delete(id) {
    const banco = await models.Bancos.findByPk(id);
    if (!banco) {
      throw boom.notFound('Banco no existe');
    }
    await banco.destroy();
    return { id };
  }
}

module.exports = BancosService;
