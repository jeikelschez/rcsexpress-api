const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class ObjetosService {

  constructor() {}

  async create(data) {
    const newObjeto = await models.Objetos.create(data);
    return newObjeto;
  }

  async find() {
    const objetos = await models.Objetos.findAll();
    return objetos;
  }

  async findOne(codigo) {
    const objeto = await models.Objetos.findByPk(codigo);
    if (!objeto) {
      throw boom.notFound('Objeto no existe');
    }
    return objeto;
  }

  async update(codigo, changes) {
    const objeto = await models.Objetos.findByPk(codigo);
    if (!objeto) {
      throw boom.notFound('Objeto no existe');
    }
    const rta = await objeto.update(changes);
    return rta;
  }

  async delete(codigo) {
    const objeto = await models.Objetos.findByPk(codigo);
    if (!objeto) {
      throw boom.notFound('Objeto no existe');
    }
    await objeto.destroy();
    return { codigo };
  }
}

module.exports = ObjetosService;
