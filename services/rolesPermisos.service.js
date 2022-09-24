const boom = require('@hapi/boom');

const { models, Sequelize }= require('../libs/sequelize');

class RpermisosService {

  constructor() {}

  async create(data) {
    const newRpermiso = await models.Rpermisos.create(data);
    return newRpermiso;
  }

  async find(rol, menu, accion) {
    let params = {};
    let params2 = {};

    if(rol) params.cod_rol = rol;
    if(menu) params2.cod_menu = menu;
    if(accion) params2.accion = accion;

    const rpermisos = await models.Rpermisos.findAll({
      where: params,
      include: {
        model: models.Acciones, 
        as: 'acciones',
        where: params2
      }
    });
    return rpermisos;
  }

  async delete(id) {
    const rpermiso = await models.Rpermisos.findByPk(id);
    if (!rpermiso) {
      throw boom.notFound('Permisos del Rol no existe');
    }
    await rpermiso.destroy();
    return { id };
  }
}

module.exports = RpermisosService;
