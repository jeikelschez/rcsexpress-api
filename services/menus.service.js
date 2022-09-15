const boom = require('@hapi/boom');

const { models }= require('../libs/sequelize');

class MenusService {

  constructor() {}

  async find(direct, rol) {
    let params = {};
    let params2 = {};
    let order = [];
    let menusLv2 = [];
    let menusLv1 = [];

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

    let menus = await models.Menus.findAll({
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

    // Filta solo los que tienen permisos y sus padres
    let menusAllow = menus.filter(menu => (menu.qitem && menu.acciones[0].rpermisos.length) > 0 || !menu.qitem);
    
    // Filta solo padres que tienen hijos con permisos
    menusAllow.forEach(function(menu) {
      if (menu.padre != "") {
        menusAllow.forEach(function(menu2) {
          if (menu2.name == menu.padre && !menusLv2.find(menu3 => menu3.name == menu2.name)) 
            menusLv2.push(menu2);
        });  
      }
    });

    // Agrega los hijos que tienen permisos
    menusAllow.forEach(function(menu) {
      if (menu.qitem && menu.acciones[0].rpermisos.length > 0) 
        menusLv2.push(menu);
    });

    return menusLv2.sort((a, b) => { return a.order - b.order });
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
