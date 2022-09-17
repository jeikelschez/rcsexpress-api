const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

const caseActivo = '(CASE flag_activo WHEN "1" THEN "ACTIVO" ELSE "INACTIVO" END)';
const caseTipo = '(CASE tipo_persona WHEN "N" THEN "NATURAL" ELSE "JURIDICA" END)';
const caseModalidad = '(CASE modalidad_pago WHEN "CO" THEN "CONTADO" ELSE "CREDITO" END)';

class ClientesService {

  constructor() {}

  async create(data) {
    const newCliente = await models.Clientes.create(data);
    return newCliente;
  }

  async find(page, limit, order_by, order_direction, filter, filter_value, agencia) {
    let params2 = {};
    let filterArray = {};
    let order = [];    
    
    if(agencia) params2.cod_agencia = agencia;

    if(filter && filter_value) {
      let filters = [];
      filter.split(",").forEach(function(item) {
        let itemArray = {};
        itemArray[item] = { [Sequelize.Op.substring]: filter_value };
        filters.push(itemArray);
      })

      filterArray = { 
        [Sequelize.Op.or]: filters 
      };      
    }

    let params = { ...params2, ...filterArray };

    if(order_by && order_direction) {
      order.push([order_by, order_direction]);
    }

    let attributes = {
      include: [
        [Sequelize.literal(caseActivo), 'activo_desc'],
        [Sequelize.literal(caseTipo), 'tipo_desc'],
        [Sequelize.literal(caseModalidad), 'modalidad_desc']
      ]
    };

    return await utils.paginate(models.Clientes, page, limit, params, order, attributes);
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
