const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');

const caseAfecta = '(CASE afecta_estado WHEN "S" THEN "SI" ELSE "NO" END)';

class CoperacionService {

  constructor() {}

  async create(data) {
    const newConcepto = await models.Coperacion.create(data);
    return newConcepto;
  }

  async find() {
    const conceptos = await models.Coperacion.findAll({
      include: ['tipos'],
      attributes: {
        include: [
          [Sequelize.literal(caseAfecta), 'afecta_desc']
        ]
      }
    });
    return conceptos;
  }

  async findOne(id) {
    const concepto = await models.Coperacion.findByPk(id,
    {
      include: ['tipos'],
      attributes: {
        include: [
          [Sequelize.literal(caseAfecta), 'afecta_desc']
        ]
      }
    });
    if (!concepto) {
      throw boom.notFound('Concepto de Operación no existe');
    }
    return concepto;
  }

  async update(id, changes) {
    const concepto = await models.Coperacion.findByPk(id);
    if (!concepto) {
      throw boom.notFound('Concepto de Operación no existe');
    }
    const rta = await concepto.update(changes);
    return rta;
  }

  async delete(id) {
    const concepto = await models.Coperacion.findByPk(id);
    if (!concepto) {
      throw boom.notFound('Concepto de Operación no existe');
    }
    await concepto.destroy();
    return { id };
  }
}

module.exports = CoperacionService;
