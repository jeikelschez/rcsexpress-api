const boom = require('@hapi/boom');

const { models, Sequelize }= require('./../libs/sequelize');

const caseUrgencia = '(CASE tipo_urgencia WHEN "N" THEN "NORMAL"' +
                                      ' WHEN "E" THEN "EMERGENCIA"' +
                                      ' ELSE "" END)';
const caseTarifa = '(CASE tipo_tarifa WHEN "BA" THEN "BASICA"' +
                                    ' WHEN "KR" THEN "KGRS. ADICIONALES"' +
                                    ' ELSE "" END)';
const caseUbicacion = '(CASE tipo_ubicacion WHEN "U" THEN "URBANA"' +
                                          ' WHEN "E" THEN "EXTRA-URBANA"' +
                                          ' ELSE "" END)';
const caseCarga = '(CASE tipo_carga WHEN "PM" THEN "PAQUETES"' +
                                  ' WHEN "SB" THEN "SOBRE-BULTOS"' +
                                  ' ELSE "" END)';
const caseModalidad = '(CASE modalidad_pago WHEN "CO" THEN "CONTADO"' +
                                  ' WHEN "CR" THEN "CREDITO"' +
                                  ' ELSE "" END)';
const casePagado = '(CASE pagado_en WHEN "O" THEN "ORIGEN"' +
                                  ' WHEN "D" THEN "DESTINO"' +
                                  ' ELSE "" END)';
const caseOrigen = '(CASE region_origen WHEN "CE" THEN "CENTRAL"' +
                                      ' WHEN "OC" THEN "OCCIDENTAL"' +
                                      ' WHEN "OR" THEN "ORIENTAL"' +
                                      ' ELSE "" END)';
const caseDestino = '(CASE region_destino WHEN "CE" THEN "CENTRAL"' +
                                      ' WHEN "OC" THEN "OCCIDENTAL"' +
                                      ' WHEN "OR" THEN "ORIENTAL"' +
                                      ' ELSE "" END)';

class TarifasService {

  constructor() {}

  async create(data) {
    const newTarifa = await models.Tarifas.create(data);
    return newTarifa;
  }

  async find(tipo_tarifa, tipo_urgencia, tipo_ubicacion, tipo_carga, modalidad_pago, pagado_en, region_origen, region_destino, mix_region) {
    let filterArray = {};
    let params2 = {};

    if(tipo_tarifa) params2.tipo_tarifa = tipo_tarifa;
    if(tipo_urgencia) params2.tipo_urgencia = tipo_urgencia;
    if(tipo_ubicacion) params2.tipo_ubicacion = tipo_ubicacion;
    if(tipo_carga) params2.tipo_carga = tipo_carga;
    if(modalidad_pago) params2.modalidad_pago = modalidad_pago;
    if(pagado_en) params2.pagado_en = pagado_en;

    if(mix_region && region_origen && region_destino) {
      filterArray = { 
        [Sequelize.Op.or]: [
          {
            region_origen: region_origen,
            region_destino: region_destino
          },
          {
            region_origen: region_destino,
            region_destino: region_origen
          }
        ]
      };
    } else {
      if(region_origen) params2.region_origen = region_origen;
      if(region_destino) params2.region_destino = region_destino;
    }

    let params = { ...params2, ...filterArray };

    const tarifas = await models.Tarifas.findAll({
      where: params,
      attributes: {
        include: [
          [Sequelize.literal(caseUrgencia), 'urgencia_desc'],
          [Sequelize.literal(caseTarifa), 'tarifa_desc'],
          [Sequelize.literal(caseUbicacion), 'ubicacion_desc'],
          [Sequelize.literal(caseCarga), 'carga_desc'],
          [Sequelize.literal(caseModalidad), 'modalidad_desc'],
          [Sequelize.literal(casePagado), 'pagado_desc'],
          [Sequelize.literal(caseOrigen), 'origen_desc'],
          [Sequelize.literal(caseDestino), 'destino_desc']
        ]
      }
    });
    return tarifas;
  }

  async findOne(id) {
    const tarifa = await models.Tarifas.findByPk(id, {
      attributes: {
        include: [
          [Sequelize.literal(caseUrgencia), 'urgencia_desc'],
          [Sequelize.literal(caseTarifa), 'tarifa_desc'],
          [Sequelize.literal(caseUbicacion), 'ubicacion_desc'],
          [Sequelize.literal(caseCarga), 'carga_desc'],
          [Sequelize.literal(caseModalidad), 'modalidad_desc'],
          [Sequelize.literal(casePagado), 'pagado_desc'],
          [Sequelize.literal(caseOrigen), 'origen_desc'],
          [Sequelize.literal(caseDestino), 'destino_desc']
        ]
      }
    });
    if (!tarifa) {
      throw boom.notFound('Tarifa no existe');
    }
    return tarifa;
  }

  async findOnePermisos(id) {
    const tarifa = await models.Tarifas.findByPk(id, {
      include: ['permisos']
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
