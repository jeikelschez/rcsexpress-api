const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class TiposService {

  constructor() {}

  async find(fuente, codigo) {
    let params = {};
    if(fuente) params.fuente = fuente;
    if(codigo) params.codigo = codigo;
    const tipos = await models.Tipos.findAll({
      where: params
    });
    return tipos;
  }
}

module.exports = TiposService;
