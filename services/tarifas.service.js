const boom = require('@hapi/boom');

const { models, Sequelize } = require('./../libs/sequelize');

class TarifasService {
  constructor() {}

  async create(data) {
    const newTarifa = await models.Tarifas.create(data);
    return newTarifa;
  }

  async find(
    tipo_tarifa,
    tipo_urgencia,
    tipo_ubicacion,
    tipo_carga,
    modalidad_pago,
    pagado_en,
    region_origen,
    region_destino,
    mix_region
  ) {
    let filterArray = {};
    let params2 = {};

    if (tipo_tarifa) params2.tipo_tarifa = tipo_tarifa;
    if (tipo_urgencia) params2.tipo_urgencia = tipo_urgencia;
    if (tipo_ubicacion) params2.tipo_ubicacion = tipo_ubicacion;
    if (tipo_carga) params2.tipo_carga = tipo_carga;
    if (modalidad_pago) params2.modalidad_pago = modalidad_pago;
    if (pagado_en) params2.pagado_en = pagado_en;

    if (mix_region && region_origen && region_destino) {
      filterArray = {
        [Sequelize.Op.or]: [
          {
            region_origen: region_origen,
            region_destino: region_destino,
          },
          {
            region_origen: region_destino,
            region_destino: region_origen,
          },
        ],
      };
    } else {
      if (region_origen) params2.region_origen = region_origen;
      if (region_destino) params2.region_destino = region_destino;
    }

    let params = { ...params2, ...filterArray };

    const tarifas = await models.Tarifas.findAll({
      where: params,
    });
    return tarifas;
  }

  async findOne(id) {
    const tarifa = await models.Tarifas.findByPk(id);
    if (!tarifa) {
      throw boom.notFound('Tarifa no existe');
    }
    return tarifa;
  }

  async findOnePermisos(id) {
    const tarifa = await models.Tarifas.findByPk(id, {
      include: ['permisos'],
    });
    if (!tarifa) {
      throw boom.notFound('Tarifa no existe');
    }
    return tarifa;
  }

  async update(id, changes) {
    const tarifa = await models.Tarifas.findByPk(id);
    if (!tarifa) {
      throw boom.notFound('Tarifa no existe');
    }
    const rta = await tarifa.update(changes);
    return rta;
  }

  async delete(id) {
    const tarifa = await models.Tarifas.findByPk(id);
    if (!tarifa) {
      throw boom.notFound('Tarifa no existe');
    }
    await tarifa.destroy();
    return { id };
  }
}

module.exports = TarifasService;
