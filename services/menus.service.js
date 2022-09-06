const boom = require('@hapi/boom');

const { models }= require('../libs/sequelize');

class MenusService {

  constructor() {}

  async find() {
    const menus = await models.Menus.findAll({order: [
      ['level', 'ASC'],
      ['order', 'ASC']
    ]});
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
