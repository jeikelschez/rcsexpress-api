const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class UsuariosService {

  constructor() {}

  async create(data) {
    const newUsuario = await models.Usuarios.create(data);
    return newUsuario;
  }

  async find() {
    const usuarios = await models.Usuarios.findAll();
    return usuarios;
  }

  async findOne(login) {
    const usuario = await models.Usuarios.findByPk(login);
    if (!usuario) {
      throw boom.notFound('Usuario no existe');
    }
    return usuario;
  }

  async update(login, changes) {
    const usuario = await models.Usuarios.findByPk(login);
    if (!usuario) {
      throw boom.notFound('Usuario no existe');
    }
    const rta = await usuario.update(changes);
    return rta;
  }

  async delete(login) {
    const usuario = await models.Usuarios.findByPk(login);
    if (!usuario) {
      throw boom.notFound('Usuario no existe');
    }
    await usuario.destroy();
    return { login };
  }
}

module.exports = UsuariosService;
