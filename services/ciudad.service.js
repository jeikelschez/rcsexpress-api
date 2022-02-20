const boom = require('@hapi/boom');

const { models, Sequelize } = require('./../libs/sequelize');

const caseUrbano = '(CASE check_urbano WHEN "u" THEN "URBANO" ELSE "EXTRAURBANO" END)';
const caseRegion = '(CASE cod_region WHEN "CE" THEN "CENTRAL" WHEN "OC" THEN "OCCIDENTAL" ELSE "ORIENTAL" END)';

class CiudadService {

  constructor() {}

  async create(data) {
    const newCiudad = await models.Ciudad.create(data);
    return newCiudad;
  }

  async find() {
    const ciudades = await models.Ciudad.findAll({
      attributes: {
        include: [
          [Sequelize.literal(caseUrbano), 'chech_urbano_desc'],
          [Sequelize.literal(caseRegion), 'cod_region_desc']
        ]
      },
      include: [
        {
          association: 'estado',
          include: ['pais']
        }
      ]
    });
    return ciudades;
  }

  async findOne(id) {
    const ciudad = await models.Ciudad.findByPk(id, {
      attributes: {
        include: [
          [Sequelize.literal(caseUrbano), 'chech_urbano_desc'],
          [Sequelize.literal(caseRegion), 'cod_region_desc']
        ]
      },
      include: [
        {
          association: 'estado',
          include: ['pais']
        }
      ]
    });
    if (!ciudad) {
      throw boom.notFound('Ciudad no existe');
    }
    return ciudad;
  }

  async update(id, changes) {
    const ciudad = await models.Ciudad.findByPk(id);
    if (!ciudad) {
      throw boom.notFound('Ciudad no existe');
    }
    const rta = await ciudad.update(changes);
    return rta;
  }

  async delete(id) {
    const ciudad = await models.Ciudad.findByPk(id);
    if (!ciudad) {
      throw boom.notFound('Ciudad no existe');
    }
    await ciudad.destroy();
    return { id };
  }
}

module.exports = CiudadService;
