const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class PermisosService {

  constructor() {}

  async create(data) {
    const newPermiso = await models.Permisos.create(data);
    return newPermiso;
  }

  async find() {
    const permisos = await models.Permisos.findAll();
    return permisos;
  }

  async findOne(id) {
    const permiso = await models.Permisos.findByPk(id);
    if (!permiso) {
      throw boom.notFound('Permiso no existe');
    }
    return permiso;
  }

  async update(id, changes) {
    const permiso = await models.Permisos.findByPk(id);
    if (!permiso) {
      throw boom.notFound('Permiso no existe');
    }
    const rta = await permiso.update(changes);
    return rta;
  }

  async delete(id) {
    const permiso = await models.Permisos.findByPk(id);
    if (!permiso) {
      throw boom.notFound('Permiso no existe');
    }
    await permiso.destroy();
    return { id };
  }
}

module.exports = PermisosService;
