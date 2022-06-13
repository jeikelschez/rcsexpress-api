const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class RolesService {

  constructor() {}

  async create(data) {
    const newRol = await models.Roles.create(data);
    return newRol;
  }

  async find(agencia) {
    let params = {};
    if(agencia) params.cod_agencia = agencia;
    const roles = await models.Roles.findAll({ where: params });
    return roles;
  }

  async findOne(id) {
    const rol = await models.Roles.findByPk(id);
    if (!rol) {
      throw boom.notFound('Rol no existe');
    }
    return rol;
  }

  async update(id, changes) {
    const rol = await models.Roles.findByPk(id);
    if (!rol) {
      throw boom.notFound('Rol no existe');
    }
    const rta = await rol.update(changes);
    return rta;
  }

  async delete(id) {
    const rol = await models.Roles.findByPk(id);
    if (!rol) {
      throw boom.notFound('Rol no existe');
    }
    await rol.destroy();
    return { id };
  }
}

module.exports = RolesService;
