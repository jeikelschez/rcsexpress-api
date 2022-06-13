const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');

const caseActivo = '(CASE flag_activo WHEN "1" THEN "ACTIVO" ELSE "INACTIVO" END)';
const caseTipo = '(CASE tipo_persona WHEN "N" THEN "NATURAL" ELSE "JURIDICA" END)';
const caseModalidad = '(CASE modalidad_pago WHEN "CO" THEN "CONTADO" ELSE "CREDITO" END)';

class ClientesService {

  constructor() {}

  async create(data) {
    const newCliente = await models.Clientes.create(data);
    return newCliente;
  }

  async find(agencia) {
    let params = {};
    if(agencia) params.cod_agencia = agencia;
    const clientes = await models.Clientes.findAll(
    {
      where: params,
      attributes: {
        include: [
          [Sequelize.literal(caseActivo), 'activo_desc'],
          [Sequelize.literal(caseTipo), 'tipo_desc'],
          [Sequelize.literal(caseModalidad), 'modalidad_desc']
        ]
      }
    });
    return clientes;
  }

  async findOne(id) {
    const cliente = await models.Clientes.findByPk(id,
    {
      attributes: {
        include: [
          [Sequelize.literal(caseActivo), 'activo_desc'],
          [Sequelize.literal(caseTipo), 'tipo_desc'],
          [Sequelize.literal(caseModalidad), 'modalidad_desc']
        ]
      }
    });
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
