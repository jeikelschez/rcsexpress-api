const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');

const caseActivo = '(CASE flag_activo WHEN "1" THEN "ACTIVO" ELSE "INACTIVO" END)';
const caseTipo = '(CASE tipo_persona WHEN "N" THEN "NATURAL" ELSE "JURIDICA" END)';

class ProveedoresService {

  constructor() {}

  async create(data) {
    const newProveedor = await models.Proveedores.create(data);
    return newProveedor;
  }

  async find() {
    const proveedores = await models.Proveedores.findAll({
      attributes: {
        include: [
          [Sequelize.literal(caseActivo), 'activo_desc'],
          [Sequelize.literal(caseTipo), 'tipo_desc']
        ]
      }
    });
    return proveedores;
  }

  async findOne(id) {
    const proveedor = await models.Proveedores.findByPk(id,
      {
        attributes: {
          include: [
            [Sequelize.literal(caseActivo), 'activo_desc'],
            [Sequelize.literal(caseTipo), 'tipo_desc'],
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
