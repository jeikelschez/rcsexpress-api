const boom = require('@hapi/boom');

const { models, Sequelize } = require('./../libs/sequelize');

const caseTipo =
  '(CASE tipo WHEN 1 THEN "STRING"' +
  ' WHEN 2 THEN "ENTERO"' +
  ' WHEN 3 THEN "DECIMAL"' +
  ' WHEN 4 THEN "FECHA"' +
  ' WHEN 5 THEN "ENTERO LARGO"' +
  ' ELSE "" END)';

class VcontrolService {
  constructor() {}

  async create(data) {
    const newVariable = await models.Vcontrol.create(data);
    return newVariable;
  }

  async find(name) {
    let where = {};

    if (name) where.nombre = name;

    const variables = await models.Vcontrol.findAll({
      where: where,
      attributes: {
        include: [[Sequelize.literal(caseTipo), 'tipo_desc']],
      },
    });
    return variables;
  }

  async findOne(id) {
    const variable = await models.Vcontrol.findByPk(id, {
      attributes: {
        include: [[Sequelize.literal(caseTipo), 'tipo_desc']],
      },
    });
    if (!variable) {
      throw boom.notFound('Variable no existe');
    }
    return variable;
  }

  async update(id, changes) {
    const variable = await models.Vcontrol.findByPk(id);
    if (!variable) {
      throw boom.notFound('Variable no existe');
    }
    const rta = await variable.update(changes);
    return rta;
  }

  async delete(id) {
    const variable = await models.Vcontrol.findByPk(id);
    if (!variable) {
      throw boom.notFound('Variable no existe');
    }
    await variable.destroy();
    return { id };
  }
}

module.exports = VcontrolService;
