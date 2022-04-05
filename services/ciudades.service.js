const boom = require('@hapi/boom');

const { models, Sequelize } = require('./../libs/sequelize');

const caseUrbano = '(CASE check_urbano WHEN "u" THEN "URBANO" ELSE "EXTRAURBANO" END)';
const caseRegion = '(CASE cod_region WHEN "CE" THEN "CENTRAL" WHEN "OC" THEN "OCCIDENTAL" ELSE "ORIENTAL" END)';
const caseStatus = '(CASE estatus WHEN "A" THEN "ACTIVO" ELSE "INACTIVO" END)';

class CiudadesService {

  constructor() {}

  async create(data) {
    const newCiudad = await models.Ciudades.create(data);
    return newCiudad;
  }

  async find() {
    const ciudades = await models.Ciudades.findAll({
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

  async findOneAgencias(id) {
    const ciudad = await models.Ciudades.findByPk(id, {
      include: [
        {
          association: 'agencias',
          attributes: {
            include: [
              [Sequelize.literal(caseStatus), 'estatus_desc']
            ]
          }
        }
      ]
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
