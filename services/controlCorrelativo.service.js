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

  async find(page, limit, order_by, order_direction, agencia, tipo) {    
    let params = {};
    let order = [];
    
    if(agencia) params.cod_agencia = agencia;
    if(tipo) params.tipo = tipo;

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
