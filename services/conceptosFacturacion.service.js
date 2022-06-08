const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class CfacturacionService {

  constructor() {}

  async create(data) {
    const newConcepto = await models.Cfacturacion.create(data);
    return newConcepto;
  }

  async find(cod_concepto) {
    let params = {};

    if(cod_concepto) params.cod_concepto = cod_concepto;

    const conceptos = await models.Cfacturacion.findAll({
      where: params,
      include: ['conceptos']
    });
    return conceptos;
  }

  async findOne(id) {
    const concepto = await models.Cfacturacion.findByPk(id,
    {
      include: ['conceptos']
    });
    if (!concepto) {
      throw boom.notFound('Concepto de Facturación no existe');
    }
    return concepto;
  }

  async update(id, changes) {
    const concepto = await models.Cfacturacion.findByPk(id);
    if (!concepto) {
      throw boom.notFound('Concepto de Facturación no existe');
    }
    const rta = await concepto.update(changes);
    return rta;
  }

  async delete(id) {
    const concepto = await models.Cfacturacion.findByPk(id);
    if (!concepto) {
      throw boom.notFound('Concepto de Facturación no existe');
    }
    await concepto.destroy();
    return { id };
  }
}

module.exports = CfacturacionService;
