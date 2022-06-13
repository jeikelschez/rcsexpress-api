const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');

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

  async find(agencia, tipo) {
    let params = {};
    if(agencia) params.cod_agencia = agencia;
    if(tipo) params.tipo = tipo;
    const correlativos = await models.Correlativo.findAll({
      where: params,
      attributes: {
        include: [
          [Sequelize.literal(caseStatusLote), 'estatus_desc']
        ]
      }
    });
    return correlativos;
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
