const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

const caseActivo = '(CASE flag_activo WHEN "A" THEN "ACTIVO" ELSE "INACTIVO" END)';
const caseTipo = '(CASE tipo_persona WHEN "N" THEN "NATURAL" ELSE "JURIDICA" END)';
const caseTipoSvc = '(CASE tipo_servicio WHEN "TP" THEN "TRANSPORTE"' +
                                       ' WHEN "PP" THEN "PAPELERIA"' +
                                       ' WHEN "SC" THEN "SUMINISTROS DE COMPUTACION"' +
                                       ' WHEN "GE" THEN "GENERALES"' +
                                       ' ELSE "" END)';

class ProveedoresService {

  constructor() {}

  async create(data) {
    const newProveedor = await models.Proveedores.create(data);
    return newProveedor;
  }

  async find(page, limit, order_by, order_direction, filter, filter_value) {
    let params2 = {};
    let filterArray = {};
    let order = [];

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
        [Sequelize.literal(caseTipoSvc), 'tipo_svc']
      ]
    };

    let include = ['retenciones'];

    return await utils.paginate(models.Proveedores, page, limit, params, order, attributes, include);
  }

  async findOne(id) {
    const proveedor = await models.Proveedores.findByPk(id,
      {
        include: ['retenciones'],
        attributes: {
          include: [
            [Sequelize.literal(caseActivo), 'activo_desc'],
            [Sequelize.literal(caseTipo), 'tipo_desc'],
            [Sequelize.literal(caseTipoSvc), 'tipo_svc']
          ]
        }
      }
    );
    if (!proveedor) {
      throw boom.notFound('Proveedor no existe');
    }
    return proveedor;
  }

  async update(id, changes) {
    const proveedor = await models.Proveedores.findByPk(id);
    if (!proveedor) {
      throw boom.notFound('Proveedor no existe');
    }
    const rta = await proveedor.update(changes);
    return rta;
  }

  async delete(id) {
    const proveedor = await models.Proveedores.findByPk(id);
    if (!proveedor) {
      throw boom.notFound('Proveedor no existe');
    }
    await proveedor.destroy();
    return { id };
  }
}

module.exports = ProveedoresService;
