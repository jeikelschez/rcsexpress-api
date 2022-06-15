const boom = require('@hapi/boom');

const { models, Sequelize } = require('./../libs/sequelize');

const caseUrbano = '(CASE check_urbano WHEN "u" THEN "URBANO" ELSE "EXTRAURBANO" END)';
const caseRegion = '(CASE cod_region WHEN "CE" THEN "CENTRAL" WHEN "OC" THEN "OCCIDENTAL" ELSE "ORIENTAL" END)';

class CiudadesService {

  constructor() {}

  async create(data) {
    const newCiudad = await models.Ciudades.create(data);
    return newCiudad;
  }

  async find(estado) {
    let params = {};
    if(estado) params.cod_estado = estado;
    const ciudades = await models.Ciudades.findAll({
      where: params,
      include: ['estados'],
      attributes: {
        include: [
          [Sequelize.literal(caseUrbano), 'check_urbano_desc'],
          [Sequelize.literal(caseRegion), 'cod_region_desc']
        ]
      }
    });
    return ciudades;
  }

  async findOne(id) {
    const ciudad = await models.Ciudades.findByPk(id, {
      include: ['estados'],
      attributes: {
        include: [
          [Sequelize.literal(caseUrbano), 'check_urbano_desc'],
          [Sequelize.literal(caseRegion), 'cod_region_desc']
        ]
      }
    });
    if (!ciudad) {
      throw boom.notFound('Ciudad no existe');
    }
    return ciudad;
  }

  async update(id, changes) {
    const ciudad = await models.Ciudades.findByPk(id);
    if (!ciudad) {
      throw boom.notFound('Ciudad no existe');
    }
    const rta = await ciudad.update(changes);
    return rta;
  }

  async delete(id) {
    const ciudad = await models.Ciudades.findByPk(id);
    if (!ciudad) {
      throw boom.notFound('Ciudad no existe');
    }
    await ciudad.destroy();
    return { id };
  }
}

module.exports = CiudadesService;
