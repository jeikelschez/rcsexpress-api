const boom = require('@hapi/boom');

const { models }= require('../libs/sequelize');

class MenusService {

  constructor() {}

  async find(direct) {
    let params = {};
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

    const menus = await models.Menus.findAll({
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
