const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

const caseStatusLote = '(CASE estatus_lote WHEN "A" THEN "ACTIVO"' +
                                         ' WHEN "I" THEN "INACTIVO"' +
                                         ' WHEN "C" THEN "CERRADO"' +
                                         ' ELSE "" END)';

class CorrelativoService {

  constructor() {}

  async create(data) {
    const newCorrelativo = await models.Correlativo.create(data);
    return newCorrelativo;
  }

  async find(page, limit, order_by, order_direction, filter, filter_value, agencia, tipo, estatus) { 
    let params2 = {};
    let filterArray = {};
    let order = [];    
    
    if(agencia) params2.cod_agencia = agencia;
    if(tipo) params2.tipo = tipo;
    if(estatus) params2.estatus_lote = estatus;

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
        [Sequelize.literal(caseStatusLote), 'estatus_desc']
      ]
    };

    return await utils.paginate(models.Correlativo, page, limit, params, order, attributes);
  }

  async findOne(id) {
    const correlativo = await models.Correlativo.findByPk(id,
      {
        attributes: {
          include: [
            [Sequelize.literal(caseStatusLote), 'estatus_desc']
          ]
        }
      }
    );
    if (!correlativo) {
      throw boom.notFound('Correlativo no existe');
    }
    return correlativo;
  }

  async update(id, changes) {
    const correlativo = await models.Correlativo.findByPk(id);
    if (!correlativo) {
      throw boom.notFound('Correlativo no existe');
    }
    const rta = await correlativo.update(changes);
    return rta;
  }

  async delete(id) {
    const correlativo = await models.Correlativo.findByPk(id);
    if (!correlativo) {
      throw boom.notFound('Correlativo no existe');
    }
    await correlativo.destroy();
    return { id };
  }
}

module.exports = CorrelativoService;
