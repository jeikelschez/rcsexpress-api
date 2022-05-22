const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');

const caseActivo = '(CASE flag_activo WHEN "1" THEN "ACTIVO" ELSE "INACTIVO" END)';
const caseTipo = '(CASE tipo_agente WHEN "RP" THEN "RESPONSABLE DE AGENCIA" WHEN "CR" THEN "COURIERS" ELSE "" END)';

class ObjetosService {

  constructor() {}

  async create(data) {
    const newAgente = await models.Agentes.create(data);
    return newAgente;
  }

  async find() {
    const agentes = await models.Agentes.findAll({
      attributes: {
        include: [
          [Sequelize.literal(caseActivo), 'activo_desc'],
          [Sequelize.literal(caseTipo), 'tipo_desc']
        ]
      }
    });
    return agentes;
  }

  async findOne(id) {
    const agente = await models.Agentes.findByPk(id,
      {
        attributes: {
          include: [
            [Sequelize.literal(caseActivo), 'activo_desc'],
            [Sequelize.literal(caseTipo), 'tipo_desc']
          ]
        }
      }
    );
    if (!agente) {
      throw boom.notFound('Agente no existe');
    }
    return agente;
  }

  async update(id, changes) {
    const agente = await models.Agentes.findByPk(id);
    if (!agente) {
      throw boom.notFound('Agente no existe');
    }
    const rta = await agente.update(changes);
    return rta;
  }

  async delete(id) {
    const agente = await models.Agentes.findByPk(id);
    if (!agente) {
      throw boom.notFound('Agente no existe');
    }
    await agente.destroy();
    return { id };
  }
}

module.exports = ObjetosService;