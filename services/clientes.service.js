const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');

class ClientesService {

  constructor() {}

  async create(data) {
    const newCliente = await models.Clientes.create(data);
    return newCliente;
  }

  async find() {
    const clientes = await models.Clientes.findAll();
    return clientes;
  }

  async findOne(id) {
    const cliente = await models.Clientes.findByPk(id);
    if (!cliente) {
      throw boom.notFound('Cliente no existe');
    }
    return cliente;
  }

  async update(id, changes) {
    const cliente = await models.Clientes.findByPk(id);
    if (!cliente) {
      throw boom.notFound('Cliente no existe');
    }
    const rta = await cliente.update(changes);
    return rta;
  }

  async delete(id) {
    const cliente = await models.Clientes.findByPk(id);
    if (!cliente) {
      throw boom.notFound('Cliente no existe');
    }
    await cliente.destroy();
    return { id };
  }
}

module.exports = ClientesService;
