const boom = require('@hapi/boom');

const { models, Sequelize }= require('../libs/sequelize');

class RpermisosService {

  constructor() {}

  async find(rol, menu, accion) {
    let params = {};
    let params2 = {};

    if(rol) {      
      params.cod_rol = rol;
    }

    if(menu) {      
      params2.cod_menu = menu;
    }

    if(accion) {      
      params2.accion = accion;
    }

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
}

module.exports = RpermisosService;
