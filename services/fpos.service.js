const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class FposService {

  constructor() {}

  async create(data) {
    const newFpo = await models.Fpos.create(data);
    return newFpo;
  }

  async find() {
    const fpos = await models.Fpos.findAll();
    return fpos;
  }

  async findOne(id) {
    const fpo = await models.Fpos.findByPk(id);
    if (!fpo) {
      throw boom.notFound('Fpo no existe');
    }
    return fpo;
  }

  async update(id, changes) {
    const fpo = await models.Fpos.findByPk(id);
    if (!fpo) {
      throw boom.notFound('Fpo no existe');
    }
    const rta = await fpo.update(changes);
    return rta;
  }

  async delete(id) {
    const fpo = await models.Fpos.findByPk(id);
    if (!fpo) {
      throw boom.notFound('Fpo no existe');
    }
    await fpo.destroy();
    return { id };
  }
}

module.exports = FposService;
