const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');

const caseActivo = '(CASE flag_activo WHEN "1" THEN "ACTIVO" ELSE "INACTIVO" END)';

class ReceptoresService {

  constructor() {}

  async create(data) {
    const newReceptor = await models.Receptores.create(data);
    return newReceptor;
  }

  async find() {
    const receptores = await models.Receptores.findAll({
      attributes: {
        include: [
          [Sequelize.literal(caseActivo), 'activo_desc']
        ]
      }
    });
    return receptores;
  }

  async findOne(id) {
    const receptor = await models.Receptores.findByPk(id,
      {
        attributes: {
          include: [
            [Sequelize.literal(caseActivo), 'activo_desc']
          ]
        }
      }
    );
    if (!receptor) {
      throw boom.notFound('Receptor no existe');
    }
    return receptor;
  }

  async update(id, changes) {
    const receptor = await models.Receptores.findByPk(id);
    if (!receptor) {
      throw boom.notFound('Receptor no existe');
    }
    const rta = await receptor.update(changes);
    return rta;
  }

  async delete(id) {
    const receptor = await models.Receptores.findByPk(id);
    if (!receptor) {
      throw boom.notFound('Receptor no existe');
    }
    await receptor.destroy();
    return { id };
  }
}

module.exports = ReceptoresService;
