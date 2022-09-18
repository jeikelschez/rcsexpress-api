const boom = require('@hapi/boom');

const { models, Sequelize }= require('../libs/sequelize');

class MenusService {

  constructor() {}

  async find(direct, rol, read) {
    let params = {};
    let params2 = {};
    let params3 = {};
    let order = [];
    let menusLv = [];

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
      params3.cod_rol = rol;
    }

    if(read) {
      params2.accion = 1      
    } else {
      params.url = {
        [Sequelize.Op.notLike]: ''  
      }
    }

    let menus = await models.Menus.findAll({
      include : [
        {
          model: models.Acciones,       
          as: "acciones",
          required: false,
          where: params2,
          include : [
            {
              model: models.Rpermisos,
              as: "rpermisos",
              required: false,
              where: params3
            }
          ]      
        }
      ],
      where: params,
      order: order
    });

    // Filta solo los que tienen permisos y sus padres
    let menusAllow = menus.filter(menu => (menu.qitem && menu.acciones[0].rpermisos.length) > 0 || !menu.qitem);
    
    // Filta solo padres que tienen hijos con permisos
    menusAllow.forEach(function(menu) {
      if (menu.padre != "") {
        menusAllow.forEach(function(menu2) {
          if (menu2.name == menu.padre && !menusLv.find(menu3 => menu3.name == menu2.name)) 
          menusLv.push(menu2);
        });  
      }
    });

    // Agrega los hijos que tienen permisos
    menusAllow.forEach(function(menu) {
      if (menu.qitem && menu.acciones[0].rpermisos.length > 0) 
      menusLv.push(menu);
    });

    if(read) {
      return menusLv.sort((a, b) => { return a.order - b.order });      
    } else {
      return menus;
    }    
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
