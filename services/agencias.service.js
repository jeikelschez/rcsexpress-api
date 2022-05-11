const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');

const caseStatus = '(CASE estatus WHEN "A" THEN "ACTIVO" ELSE "INACTIVO" END)';
const caseActivo = '(CASE flag_activo WHEN "1" THEN "ACTIVA" ELSE "INACTIVA" END)';

class AgenciasService {

  constructor() {}

  async create(data) {
    const newAgencia = await models.Agencias.create(data);
    return newAgencia;
  }

  async find() {
    const agencias = await models.Agencias.findAll(
    {
      include: ['ciudades'],
      attributes: {
        include: [
          [Sequelize.literal(caseStatus), 'activo_desc']
        ]
      }
    });
    return agencias;
  }

  async findOne(id) {
    const agencia = await models.Agencias.findByPk(id,
    {
      include: ['ciudades'],
      attributes: {
        include: [
          [Sequelize.literal(caseStatus), 'activo_desc']
        ]
      }
    });
    if (!agencia) {
      throw boom.notFound('Agencia no existe');
    }
    return agencia;
  }

  async findOneUsuarios(id) {
    const agencia = await models.Agencias.findByPk(id, {
      include: [
        {
          association: 'usuarios',
          include: ['roles'],
          attributes: {
            include: [
              [Sequelize.literal(caseStatus), 'estatus_desc']
            ]
          }
        }
      ]
    });
    if (!agencia) {
      throw boom.notFound('Agencia no existe');
    }
    return agencia;
  }

  async findOneRoles(id) {
    const agencia = await models.Agencias.findByPk(id, {
      include: ['roles'],
      attributes: {
        include: [
          [Sequelize.literal(caseStatus), 'estatus_desc']
        ]
      }
    });
    if (!agencia) {
      throw boom.notFound('Agencia no existe');
    }
    return agencia;
  }

  async findOneAgentes(id) {
    const agencia = await models.Agencias.findByPk(id, {
      include: [
        {
          association: 'agentes',
          attributes: {
            include: [
              [Sequelize.literal(caseActivo), 'activo_desc']
            ]
          }
        }
      ]
    });
    if (!agencia) {
      throw boom.notFound('Agencia no existe');
    }
    return agencia;
  }

  async update(id, changes) {
    const agencia = await models.Agencias.findByPk(id);
    if (!agencia) {
      throw boom.notFound('Agencia no existe');
    }
    const rta = await agencia.update(changes);
    return rta;
  }

  async delete(id) {
    const agencia = await models.Agencias.findByPk(id);
    if (!agencia) {
      throw boom.notFound('Agencia no existe');
    }
    await agencia.destroy();
    return { id };
  }
}

module.exports = AgenciasService;
