const boom = require('@hapi/boom');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { config } = require('./../config/config');

const accessTokenSecret = config.accessToken;
const refreshTokenSecret = config.refreshToken;
refreshTokens = [];

const { models, Sequelize }= require('./../libs/sequelize');

const caseActivo = '(CASE activo WHEN "1" THEN "ACTIVO" ELSE "INACTIVO" END)';

class UsuariosService {

  constructor() {}

  async create(data) {
    const newUsuario = await models.Usuarios.create(data);
    return newUsuario;
  }

  async find() {
    const usuarios = await models.Usuarios.findAll({
      include: ['roles'],
      attributes: {
        include: [
          [Sequelize.literal(caseActivo), 'activo_desc']
        ]
      }
    });
    return usuarios;
  }

  async findOne(login) {
    const usuario = await models.Usuarios.findByPk(login,
      {
        include: ['roles'],
        attributes: {
          include: [
            [Sequelize.literal(caseActivo), 'activo_desc']
          ]
        }
      }
    );
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

  async login(username, password) {
    const usuario = await models.Usuarios.findOne({
      where: {
        login: username,
        password: password
      },
      include: [
        {
          association: 'roles',
          include: ['permisos']
        }
      ]
    });

    if (usuario) {
      const accessToken = jwt.sign({ "usuario": usuario }, accessTokenSecret, { expiresIn: '20m' });
      const refreshToken = jwt.sign({ }, refreshTokenSecret);
      refreshTokens.push(refreshToken);

      return { accessToken, refreshToken };
    } else {
      throw boom.notFound('Usuario y Password Incorrecto');
    }
  }

  async refresh(username, token) {
    if (!token) {
      throw boom.unauthorized('Token Vacio');
    }

    if (!refreshTokens.includes(token)) {
      throw boom.forbidden('Token Invalido')
    }

    jwt.verify(token, refreshTokenSecret, (err, user) => {
      if (err) {
        throw boom.unauthorized(err);
      }
    });

    const usuario = await models.Usuarios.findOne({
      where: {
        login: username
      },
      include: [
        {
          association: 'roles',
          include: ['permisos']
        }
      ]
    });

    const accessToken = jwt.sign({ "usuario": usuario }, accessTokenSecret, { expiresIn: '20m' });

    return { accessToken };
  }

  async logout(token) {
    refreshTokens = refreshTokens.filter(t => t !== token);
    return "Logout exitoso";
  }
}

module.exports = UsuariosService;
