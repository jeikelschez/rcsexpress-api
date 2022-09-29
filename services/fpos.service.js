const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');

class FposService {

  constructor() {}

  async create(data) {
    const newFpo = await models.Fpos.create(data);
    return newFpo;
  }

  async find(fecha, peso) {
    let params = {};

    if(fecha) {
      params.f_val = {
        [Sequelize.Op.lte]: fecha
      }
      params.f_anul = {
        [Sequelize.Op.gt]: fecha
      }
    };
    if(peso) {
      params.peso_inicio = {
        [Sequelize.Op.lt]: peso
      }
      params.peso_fin = {
        [Sequelize.Op.gte]: peso
      }
    };

    const fpos = await models.Fpos.findAll({
      where: params
    });
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
