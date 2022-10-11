const boom = require('@hapi/boom');
const moment = require('moment');

const { models, Sequelize } = require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

const caseTipo = '(CASE cod_tipo_persona WHEN "N" THEN "NATURAL" ELSE "JURIDICA" END)';

class MretencionesService {

  constructor() {}

  async create(data) {
    const newMRetencion = await models.Mretenciones.create(data);
    return newMRetencion;
  }

  async find(page, limit, order_by, order_direction, filter, filter_value, vigente, tipo_persona) {    
    let params2 = {};
    let filterArray = {};
    let order = []; 
    
    if(vigente) {
      let date = moment().format('YYYY-MM-DD');
      params2 = {
        fecha_ini_val: {
          [Sequelize.Op.lte]: date
        },
        fecha_fin_val: {
          [Sequelize.Op.gt]: date
        }
      }
    }

    if(tipo_persona) params2.cod_tipo_persona = tipo_persona;

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
        [Sequelize.literal(caseTipo), 'tipo_persona_desc']
      ]
    };

    return await utils.paginate(models.Mretenciones, page, limit, params, order, attributes);
  }

  async findOne(id) {
    const mRetencion = await models.Mretenciones.findByPk(id,
      {
        attributes: {
          include: [
            [Sequelize.literal(caseTipo), 'tipo_persona_desc']
          ]
        }
      }
    );
    if (!mRetencion) {
      throw boom.notFound('Maestro de Retenciones no existe');
    }
    return mRetencion;
  }

  async update(id, changes) {
    const mRetencion = await models.Mretenciones.findByPk(id);
    if (!mRetencion) {
      throw boom.notFound('Maestro de Retenciones no existe');
    }
    const rta = await mRetencion.update(changes);
    return rta;
  }

  async delete(id) {
    const mRetencion = await models.Mretenciones.findByPk(id);
    if (!mRetencion) {
      throw boom.notFound('Maestro de Retenciones no existe');
    }
    await mRetencion.destroy();
    return { id };
  }
}

module.exports = MretencionesService;
