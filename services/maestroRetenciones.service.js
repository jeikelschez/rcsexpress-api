const boom = require('@hapi/boom');
const moment = require('moment');

const { models, Sequelize } = require('./../libs/sequelize');

const caseTipo = '(CASE cod_tipo_persona WHEN "N" THEN "NATURAL" ELSE "JURIDICA" END)';

class MretencionesService {

  constructor() {}

  async create(data) {
    const newMRetencion = await models.Mretenciones.create(data);
    return newMRetencion;
  }

  async find(vigente, tipoPersona) {
    let params = {};

    if(vigente) {
      let date = moment().format('YYYY-MM-DD');
      params = {
        fecha_ini_val: {
          [Sequelize.Op.lte]: date
        },
        fecha_fin_val: {
          [Sequelize.Op.gt]: date
        }
      }
    }

    if(tipoPersona) params.cod_tipo_persona = tipoPersona;

    const mRetenciones = await models.Mretenciones.findAll({
      where: params,
      attributes: {
        include: [
          [Sequelize.literal(caseTipo), 'tipo_persona_desc']
        ]
      }
    });
    return mRetenciones;
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
