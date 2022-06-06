const boom = require('@hapi/boom');

const { models }= require('./../libs/sequelize');

class EmpleadosService {

  constructor() {}

  async create(data) {
    const newEmpleado = await models.Empleados.create(data);
    return newEmpleado;
  }

  async find() {
    const empleados = await models.Empleados.findAll();
    return empleados;
  }

  async findOne(id) {
    const empleado = await models.Empleados.findByPk(id);
    if (!empleado) {
      throw boom.notFound('Empleado no existe');
    }
    return empleado;
  }

  async update(id, changes) {
    const empleado = await models.Empleados.findByPk(id);
    if (!empleado) {
      throw boom.notFound('Empleado no existe');
    }
    const rta = await empleado.update(changes);
    return rta;
  }

  async delete(id) {
    const empleado = await models.Empleados.findByPk(id);
    if (!empleado) {
      throw boom.notFound('Empleado no existe');
    }
    await empleado.destroy();
    return { id };
  }
}

module.exports = EmpleadosService;
