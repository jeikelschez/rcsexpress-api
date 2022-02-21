const boom = require('@hapi/boom');

const { models, Sequelize } = require('./../libs/sequelize');

const caseUrbano = '(CASE check_urbano WHEN "u" THEN "URBANO" ELSE "EXTRAURBANO" END)';
const caseRegion = '(CASE cod_region WHEN "CE" THEN "CENTRAL" WHEN "OC" THEN "OCCIDENTAL" ELSE "ORIENTAL" END)';

class EstadoService {

  constructor() {}

  async create(data) {
    const newEstado = await models.Estado.create(data);
    return newEstado;
  }

  async find() {
    const estados = await models.Estado.findAll();
    return estados;
  }

  async findOne(id) {
    const estado = await models.Estado.findByPk(id, {
      include: ['pais']
    });
    if (!estado) {
      throw boom.notFound('Estado no existe');
    }
    return estado;
  }

  async findOneCiudades(id) {
    const estado = await models.Estado.findByPk(id, {
      include: [
        {
          association: 'ciudades',
          attributes: {
            include: [
              [Sequelize.literal(caseUrbano), 'check_urbano_desc'],
              [Sequelize.literal(caseRegion), 'cod_region_desc']
            ]
          }
        }
      ]
    });
    if (!estado) {
      throw boom.notFound('Estado no existe');
    }
    return estado;
  }

  async update(id, changes) {
    const estado = await models.Estado.findByPk(id);
    if (!estado) {
      throw boom.notFound('Estado no existe');
    }
    const rta = await estado.update(changes);
    return rta;
  }

  async delete(id) {
    const estado = await models.Estado.findByPk(id);
    if (!estado) {
      throw boom.notFound('Estado no existe');
    }
    await estado.destroy();
    return { id };
  }
}

module.exports = EstadoService;
