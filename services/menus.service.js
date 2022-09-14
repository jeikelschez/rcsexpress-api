const boom = require('@hapi/boom');

const { models }= require('../libs/sequelize');

class MenusService {

  constructor() {}

  async find(direct, rol) {
    let params = {};
    let params2 = {};
    let order = [];

    if(direct) {      
      params.direct = direct;
      order = [
        ['dorder', 'ASC']
      ];
    } else {      
      order = [
        ['level', 'ASC'],
        ['order', 'ASC']
      ];
    }

    if(rol) {      
      params2.cod_rol = rol;
    }

    const menus = await models.Menus.findAll({
      include : [
        {
          model: models.Acciones,       
          as: "acciones",
          required: false,
          where: {
            accion: 1
          },
          include : [
            {
              model: models.Rpermisos,
              as: "rpermisos",
              required: false,
              where: params2
            }
          ]      
        }
      ],
      where: params,
      order: order
    });
    return menus;
  }

  async findOne(id) {
    const menu = await models.Menus.findByPk(id);
    if (!menu) {
      throw boom.notFound('Menu no existe');
    }
    return menu;
  }
}

module.exports = MenusService;
