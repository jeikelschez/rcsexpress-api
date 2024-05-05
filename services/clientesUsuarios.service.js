const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');

class ClientesUsuariosService {

  constructor() {}

  async create(data) {
    const newCusuario = await models.Cusuarios.create(data);
    return newCusuario;
  }

  async find(activo, cliente, email) {
    let params = {};
    if(activo) params.estatus = 1;
    if(cliente) params.cod_cliente = cliente;
    if(email) params.email = email;
    const cUsuarios = await models.Cusuarios.findAll({
      where: params
    });
    return cUsuarios;
  }

  async findOne(id) {
    const cUsuario = await models.Cusuarios.findByPk(id);
    if (!cUsuario) {
      throw boom.notFound('Usuario de Cliente no existe');
    }
    return cUsuario;
  }

  async update(id, changes) {
    const cUsuario = await models.Cusuarios.findByPk(id);
    if (!cUsuario) {
      throw boom.notFound('Usuario de Cliente no existe');
    }
    const rta = await cUsuario.update(changes);
    return rta;
  }

  async delete(id) {
    const cUsuario = await models.Cusuarios.findByPk(id);
    if (!cUsuario) {
      throw boom.notFound('Usuario de Cliente no existe');
    }
    await cUsuario.destroy();
    return { id };
  }

  async login(email, password) {
    const usuario = await models.Cusuarios.findOne({
      where: {
        email: email
      },
    });

    if (usuario) {
      if(password == usuario.password) {        
        return usuario.cod_cliente;
      } else {
        throw boom.notFound('Password Incorrecto');
      }
    } else {
      throw boom.notFound('Usuario No existe');
    }
  }
}

module.exports = ClientesUsuariosService;
