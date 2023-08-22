const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

const totalExterno =
  'SUM(CASE WHEN `Costos`.`tipo_transporte` = "E" THEN `monto_costo` ELSE 0 END)';
const totalInterno =
  'SUM(CASE WHEN `Costos`.`tipo_transporte` = "I" THEN `monto_costo` ELSE 0 END)';
const totalCosto =
  '(SELECT SUM(`detalles`.`monto_costo`) FROM `detalle_costos` AS `detalles`' +
  ' WHERE `Costos`.`id` = `detalles`.`cod_costo`)';
const valorDolar =
  '(select IFNULL(valor, 0) from historico_dolar hd where hd.fecha = `Costos`.`fecha_envio`)';
const clienteOrigDesc =
  '(CASE WHEN (id_clte_part_orig IS NULL || id_clte_part_orig = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `Mmovimientos`.cod_cliente_org = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `Mmovimientos`.id_clte_part_orig = clientes_particulares.id)' +
  ' END)';
const clienteDestDesc =
  '(CASE WHEN (id_clte_part_dest IS NULL || id_clte_part_dest = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `Mmovimientos`.cod_cliente_dest = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `Mmovimientos`.id_clte_part_dest = clientes_particulares.id)' +
  ' END)';
const agenteDesc =
  "CONCAT(TRIM(persona_responsable), ' - C.I.', TRIM(rif_ci_agente))";

class ReporteCostosService {
  async mainReport(doc, tipo, data) {
    data = JSON.parse(data);
    let detallesg = [];
    let costos = [];
    let totalGuias = 0;

    switch (tipo) {
      case 'RCT':
        detallesg = await models.Costos.findAll({
          where: {
            fecha_envio: {
              [Sequelize.Op.between]: [
                moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              ],
            },
          },
          include: [
            {
              model: models.Dcostosg,
              as: 'detallesg',
              required: true,
              include: [
                {
                  model: models.Mmovimientos,
                  as: 'movimientos',
                  attributes: [
                    [
                      Sequelize.fn('sum', Sequelize.col('monto_subtotal')),
                      'total_monto',
                    ],
                  ],
                },
              ],
            },
          ],
          group: '`Costos`.fecha_envio',
          order: [['fecha_envio', 'ASC']],
          raw: true,
        });

        if (detallesg.length == 0) return false;

        for (var i = 0; i < detallesg.length; i++) {
          let costos = await models.Costos.findAll({
            where: {
              fecha_envio: detallesg[i].fecha_envio,
            },
            include: [
              {
                model: models.Dcostos,
                as: 'detalles',
                attributes: [
                  [
                    Sequelize.fn('sum', Sequelize.col('monto_costo')),
                    'total_costo',
                  ],
                  [Sequelize.literal(totalExterno), 'total_externo'],
                  [Sequelize.literal(totalInterno), 'total_interno'],
                ],
              },
            ],
            group: '`Costos`.fecha_envio',
            order: [['fecha_envio', 'ASC']],
            raw: true,
          });
          detallesg[i].total_costo =
            costos[0]['detalles.total_costo'] == null
              ? 0
              : costos[0]['detalles.total_costo'];
          detallesg[i].total_externo =
            costos[0]['detalles.total_externo'] == null
              ? 0
              : costos[0]['detalles.total_externo'];
          detallesg[i].total_interno =
            costos[0]['detalles.total_interno'] == null
              ? 0
              : costos[0]['detalles.total_interno'];
        }
        break;
      case 'CTR':
        let where = {
          fecha_envio: {
            [Sequelize.Op.between]: [
              moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            ],
          },
        };
        if (data.agencia) where.cod_agencia = data.agencia;
        detallesg = await models.Costos.findAll({
          where: where,
          include: [
            {
              model: models.Agencias,
              as: 'agencias',
              include: {
                model: models.Ciudades,
                as: 'ciudades',
              },
            },
            {
              model: models.Agentes,
              as: 'agentes',
            },
            {
              model: models.Proveedores,
              as: 'proveedores',
            },
            {
              model: models.Unidades,
              as: 'unidades',
            },
            {
              model: models.Dcostosg,
              as: 'detallesg',
              required: true,
              include: [
                {
                  model: models.Mmovimientos,
                  as: 'movimientos',
                  attributes: [
                    [
                      Sequelize.fn('sum', Sequelize.col('monto_subtotal')),
                      'total_monto',
                    ],
                  ],
                },
              ],
            },
          ],
          attributes: [
            'tipo_transporte',
            'destino',
            [Sequelize.literal(totalCosto), 'total_costo'],
          ],
          group: '`Costos`.id',
          order: [
            ['cod_agencia', 'asc'],
            ['fecha_envio', 'asc'],
          ],
          raw: true,
        });
        if (detallesg.length == 0) return false;
        break;
      case 'DTC':
        detallesg = await models.Costos.findAll({
          where: {
            fecha_envio: {
              [Sequelize.Op.between]: [
                moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              ],
            },
          },
          include: [
            {
              model: models.Dcostosg,
              as: 'detallesg',
              required: true,
              include: [
                {
                  model: models.Mmovimientos,
                  as: 'movimientos',
                  attributes: [
                    'cod_agencia_dest',
                    [
                      Sequelize.fn('count', Sequelize.col('nro_documento')),
                      'total_guias',
                    ],
                    [
                      Sequelize.fn('sum', Sequelize.col('nro_piezas')),
                      'total_pzas',
                    ],
                    [
                      Sequelize.fn('sum', Sequelize.col('peso_kgs')),
                      'total_kgs',
                    ],
                    [
                      Sequelize.fn('sum', Sequelize.col('carga_neta')),
                      'total_neta',
                    ],
                    [
                      Sequelize.fn('sum', Sequelize.col('monto_subtotal')),
                      'total_monto',
                    ],
                  ],
                  include: [
                    {
                      model: models.Agencias,
                      as: 'agencias_dest',
                      include: [
                        {
                          model: models.Ciudades,
                          as: 'ciudades',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
          group: 'detallesg.movimientos.cod_agencia_dest',
          order: [['detallesg', 'movimientos', 'cod_agencia_dest', 'ASC']],
          raw: true,
        });

        if (detallesg.length == 0) return false;

        costos = await models.Costos.findAll({
          where: {
            fecha_envio: {
              [Sequelize.Op.between]: [
                moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              ],
            },
          },
          include: [
            {
              model: models.Dcostos,
              as: 'detalles',
              required: true,
              attributes: [
                [
                  Sequelize.fn('sum', Sequelize.col('monto_costo')),
                  'total_costo',
                ],
              ],
            },
          ],
          raw: true,
        });

        totalGuias = 0;
        for (var i = 0; i < detallesg.length; i++) {
          totalGuias += utils.parseFloatN(
            detallesg[i]['detallesg.movimientos.total_monto']
          );
        }

        data.costos = costos;
        data.totalGuias = totalGuias.toFixed(2);
        break;
      case 'DRC':
        detallesg = await models.Costos.findAll({
          where: {
            fecha_envio: {
              [Sequelize.Op.between]: [
                moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              ],
            },
          },
          attributes: [],
          include: [
            {
              model: models.Dcostosg,
              as: 'detallesg',
              required: true,
              attributes: [],
              include: [
                {
                  model: models.Mmovimientos,
                  as: 'movimientos',
                  attributes: [
                    'cod_agencia_dest',
                    [
                      Sequelize.fn('count', Sequelize.col('nro_documento')),
                      'total_guias',
                    ],
                    [
                      Sequelize.fn('sum', Sequelize.col('nro_piezas')),
                      'total_pzas',
                    ],
                    [
                      Sequelize.fn('sum', Sequelize.col('peso_kgs')),
                      'total_kgs',
                    ],
                    [
                      Sequelize.fn('sum', Sequelize.col('carga_neta')),
                      'total_neta',
                    ],
                    [
                      Sequelize.fn('sum', Sequelize.col('monto_subtotal')),
                      'total_monto',
                    ],
                  ],
                  include: [
                    {
                      model: models.Agencias,
                      as: 'agencias_dest',
                      attributes: ['id'],
                      include: [
                        {
                          model: models.Ciudades,
                          as: 'ciudades',
                          attributes: ['siglas'],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
          group: 'detallesg.movimientos.cod_agencia_dest',
          order: [['detallesg', 'movimientos', 'cod_agencia_dest', 'ASC']],
          raw: true,
        });

        if (detallesg.length == 0) return false;

        costos = await models.Costos.findAll({
          where: {
            fecha_envio: {
              [Sequelize.Op.between]: [
                moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              ],
            },
          },
          include: [
            {
              model: models.Dcostos,
              as: 'detalles',
              attributes: [
                'id',
                [
                  Sequelize.fn('sum', Sequelize.col('monto_costo')),
                  'total_costo',
                ],
              ],
            },
          ],
          group: 'id',
          order: [['id', 'ASC']],
          raw: true,
        });

        let costosGroup = await models.Costos.findAll({
          where: {
            fecha_envio: {
              [Sequelize.Op.between]: [
                moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              ],
            },
          },
          attributes: ['id'],
          include: [
            {
              model: models.Dcostosg,
              as: 'detallesg',
              required: true,
              attributes: [],
              include: [
                {
                  model: models.Mmovimientos,
                  as: 'movimientos',
                  attributes: [
                    [
                      Sequelize.fn('sum', Sequelize.col('monto_subtotal')),
                      'total_monto_all',
                    ],
                  ],
                },
              ],
            },
          ],
          group: 'id',
          order: [['id', 'ASC']],
          raw: true,
        });

        let guiasCosto = await models.Costos.findAll({
          where: {
            fecha_envio: {
              [Sequelize.Op.between]: [
                moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              ],
            },
          },
          attributes: ['id'],
          include: [
            {
              model: models.Dcostosg,
              as: 'detallesg',
              required: true,
              include: [
                {
                  model: models.Mmovimientos,
                  as: 'movimientos',
                  attributes: [
                    'cod_agencia_dest',
                    [
                      Sequelize.fn('sum', Sequelize.col('monto_subtotal')),
                      'total_monto',
                    ],
                  ],
                  include: [
                    {
                      model: models.Agencias,
                      as: 'agencias_dest',
                    },
                  ],
                },
              ],
            },
          ],
          group: ['id', 'detallesg.movimientos.cod_agencia_dest'],
          order: [
            ['id', 'ASC'],
            ['detallesg', 'movimientos', 'cod_agencia_dest', 'ASC'],
          ],
          raw: true,
        });

        let costoTotal = 0;
        for (var i = 0; i < detallesg.length; i++) {
          let costo_cdad = 0;
          for (var j = 0; j < costos.length; j++) {
            let findCosto = costosGroup.findIndex(
              (item) => item.id == costos[j].id
            );

            let find = guiasCosto.findIndex(
              (item) =>
                item.id == costos[j].id &&
                item['detallesg.movimientos.agencias_dest.id'] ==
                  detallesg[i]['detallesg.movimientos.agencias_dest.id']
            );

            let monto_pcdad = 0;
            if (
              find >= 0 &&
              costosGroup[findCosto]['detallesg.movimientos.total_monto_all'] >
                0 &&
              costos[j]['detalles.total_costo'] > 0
            ) {
              monto_pcdad =
                (guiasCosto[[find]]['detallesg.movimientos.total_monto'] /
                  costosGroup[findCosto][
                    'detallesg.movimientos.total_monto_all'
                  ]) *
                costos[j]['detalles.total_costo'];
              costo_cdad += monto_pcdad;
            }
          }
          detallesg[i].costoCiudad = costo_cdad.toFixed(2);
          costoTotal += costo_cdad;
        }

        totalGuias = 0;
        for (var i = 0; i < detallesg.length; i++) {
          totalGuias += utils.parseFloatN(
            detallesg[i]['detallesg.movimientos.total_monto']
          );
        }

        data.costos = costos;
        data.costoTotal = costoTotal.toFixed(2);
        data.totalGuias = totalGuias.toFixed(2);
        break;
      case 'CTP':
        detallesg = await models.Costos.findAll({
          where: {
            fecha_envio: {
              [Sequelize.Op.between]: [
                moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              ],
            },
            cod_agente: data.agente,
          },
          attributes: [
            'fecha_envio',
            'monto_anticipo',
            'destino',
            [Sequelize.literal(valorDolar), 'valor_dolar'],
          ],
          include: [
            {
              model: models.Dcostosg,
              as: 'detallesg',
              required: true,
              attributes: [],
              include: [
                {
                  model: models.Mmovimientos,
                  as: 'movimientos',
                  attributes: [
                    [
                      Sequelize.fn('count', Sequelize.col('nro_documento')),
                      'total_guias',
                    ],
                    [
                      Sequelize.fn('sum', Sequelize.col('nro_piezas')),
                      'total_pzas',
                    ],
                    [
                      Sequelize.fn('sum', Sequelize.col('peso_kgs')),
                      'total_kgs',
                    ],
                    [
                      Sequelize.fn('sum', Sequelize.col('carga_neta')),
                      'total_neta',
                    ],
                    [
                      Sequelize.fn('sum', Sequelize.col('monto_subtotal')),
                      'total_monto',
                    ],
                  ],
                },
              ],
            },
            {
              model: models.Agencias,
              as: 'agencias',
              attributes: ['id'],
              include: [
                {
                  model: models.Ciudades,
                  as: 'ciudades',
                  attributes: ['siglas'],
                },
              ],
            },
            {
              model: models.Unidades,
              as: 'unidades',
              attributes: ['placas'],
            },
          ],
          group: ['Costos.id', 'cod_agente'],
          order: [
            ['id', 'ASC'],
            ['cod_agente', 'ASC'],
          ],
          raw: true,
        });

        if (detallesg.length == 0) return false;

        for (var i = 0; i < detallesg.length; i++) {
          let costos = await models.Costos.findAll({
            where: {
              fecha_envio: detallesg[i].fecha_envio,
              cod_agente: data.agente,
            },
            attributes: ['id'],
            include: [
              {
                model: models.Dcostos,
                as: 'detalles',
                attributes: [
                  'id',
                  [
                    Sequelize.fn('sum', Sequelize.col('monto_costo')),
                    'total_costo',
                  ],
                ],
              },
            ],
            group: ['Costos.id', 'cod_agente'],
            order: [
              ['id', 'ASC'],
              ['cod_agente', 'ASC'],
            ],
            raw: true,
          });
          detallesg[i].total_costo =
            costos[0]['detalles.total_costo'] == null
              ? 0
              : costos[0]['detalles.total_costo'];
        }
        break;
      case 'CTA':
        detallesg = await models.Costos.findAll({
          where: {
            fecha_envio: {
              [Sequelize.Op.between]: [
                moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              ],
            },
            cod_ayudante: data.ayudante,
          },
          attributes: [
            'fecha_envio',
            'monto_anticipo',
            'destino',
            [Sequelize.literal(valorDolar), 'valor_dolar'],
          ],
          include: [
            {
              model: models.Dcostosg,
              as: 'detallesg',
              required: true,
              attributes: [],
              include: [
                {
                  model: models.Mmovimientos,
                  as: 'movimientos',
                  attributes: [
                    [
                      Sequelize.fn('count', Sequelize.col('nro_documento')),
                      'total_guias',
                    ],
                    [
                      Sequelize.fn('sum', Sequelize.col('nro_piezas')),
                      'total_pzas',
                    ],
                    [
                      Sequelize.fn('sum', Sequelize.col('peso_kgs')),
                      'total_kgs',
                    ],
                    [
                      Sequelize.fn('sum', Sequelize.col('carga_neta')),
                      'total_neta',
                    ],
                    [
                      Sequelize.fn('sum', Sequelize.col('monto_subtotal')),
                      'total_monto',
                    ],
                  ],
                },
              ],
            },
            {
              model: models.Agencias,
              as: 'agencias',
              attributes: ['id'],
              include: [
                {
                  model: models.Ciudades,
                  as: 'ciudades',
                  attributes: ['siglas'],
                },
              ],
            },
            {
              model: models.Unidades,
              as: 'unidades',
              attributes: ['placas', 'descripcion'],
            },
            {
              model: models.Agentes,
              as: 'agentes',
              attributes: ['persona_responsable'],
            },
          ],
          group: ['Costos.id', 'cod_ayudante'],
          order: [
            ['id', 'ASC'],
            ['cod_ayudante', 'ASC'],
          ],
          raw: true,
        });

        if (detallesg.length == 0) return false;

        for (var i = 0; i < detallesg.length; i++) {
          let costos = await models.Costos.findAll({
            where: {
              fecha_envio: detallesg[i].fecha_envio,
              cod_ayudante: data.ayudante,
            },
            attributes: ['id'],
            include: [
              {
                model: models.Dcostos,
                as: 'detalles',
                attributes: [
                  'id',
                  [
                    Sequelize.fn('sum', Sequelize.col('monto_costo')),
                    'total_costo',
                  ],
                ],
              },
            ],
            group: ['Costos.id', 'cod_ayudante'],
            order: [
              ['id', 'ASC'],
              ['cod_ayudante', 'ASC'],
            ],
            raw: true,
          });
          detallesg[i].total_costo =
            costos[0]['detalles.total_costo'] == null
              ? 0
              : costos[0]['detalles.total_costo'];
        }
        break;
      case 'GPC':
        detallesg = await models.Mmovimientos.findAll({
          where: {
            fecha_emision: {
              [Sequelize.Op.between]: [
                moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              ],
            },
            estatus_administra: {
              [Sequelize.Op.ne]: 'A',
            },
            t_de_documento: 'GC',
            '$detalles_costo.id$': null,
          },
          attributes: [
            'id',
            'nro_documento',
            'fecha_emision',
            'nro_piezas',
            'peso_kgs',
            'monto_subtotal',
            [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
            [Sequelize.literal(clienteDestDesc), 'cliente_dest_desc'],
          ],
          include: [
            {
              model: models.Dcostosg,
              as: 'detalles_costo',
              attributes: [],
            },
            {
              model: models.Agencias,
              as: 'agencias',
              attributes: ['id'],
              include: [
                {
                  model: models.Ciudades,
                  as: 'ciudades',
                  attributes: ['siglas'],
                },
              ],
            },
            {
              model: models.Agencias,
              as: 'agencias_dest',
              attributes: ['id'],
              include: [
                {
                  model: models.Ciudades,
                  as: 'ciudades',
                  attributes: ['siglas'],
                },
              ],
            },
          ],
          order: [
            ['fecha_emision', 'ASC'],
            ['nro_documento', 'ASC'],
          ],
          raw: true,
        });
        if (detallesg.length == 0) return false;
        break;
      case 'RVV':
        detallesg = await models.Costos.findAll({
          where: {
            fecha_envio: {
              [Sequelize.Op.between]: [
                moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              ],
            },
            cod_transporte: data.transporte,
          },
          attributes: [
            'fecha_envio',
            'monto_anticipo',
            'destino',
            [Sequelize.literal(valorDolar), 'valor_dolar'],
          ],
          include: [
            {
              model: models.Dcostosg,
              as: 'detallesg',
              required: true,
              attributes: [],
              include: [
                {
                  model: models.Mmovimientos,
                  as: 'movimientos',
                  attributes: [
                    [
                      Sequelize.fn('sum', Sequelize.col('monto_subtotal')),
                      'total_monto',
                    ],
                  ],
                },
              ],
            },
            {
              model: models.Agencias,
              as: 'agencias',
              attributes: ['id'],
              include: [
                {
                  model: models.Ciudades,
                  as: 'ciudades',
                  attributes: ['siglas'],
                },
              ],
            },
            {
              model: models.Unidades,
              as: 'unidades',
              attributes: ['placas', 'descripcion'],
            },
            {
              model: models.Agentes,
              as: 'agentes',
              attributes: ['persona_responsable'],
            },
          ],
          group: ['Costos.id', 'cod_transporte'],
          order: [
            ['id', 'ASC'],
            ['cod_transporte', 'ASC'],
          ],
          raw: true,
        });

        if (detallesg.length == 0) return false;

        for (var i = 0; i < detallesg.length; i++) {
          let costos = await models.Costos.findAll({
            where: {
              fecha_envio: detallesg[i].fecha_envio,
              cod_transporte: data.transporte,
            },
            attributes: ['id'],
            include: [
              {
                model: models.Dcostos,
                as: 'detalles',
                attributes: [
                  'id',
                  [
                    Sequelize.fn('sum', Sequelize.col('monto_costo')),
                    'total_costo',
                  ],
                ],
              },
            ],
            group: ['Costos.id', 'cod_transporte'],
            order: [
              ['id', 'ASC'],
              ['cod_transporte', 'ASC'],
            ],
            raw: true,
          });
          detallesg[i].total_costo =
            costos[0]['detalles.total_costo'] == null
              ? 0
              : costos[0]['detalles.total_costo'];
        }
        if (detallesg.length == 0) return false;
        break;
      default:
        break;
    }
    
    data.detallesg = detallesg;
    await this.generateHeader(doc, tipo, data);
    await this.generateCustomerInformation(doc, tipo, data);
    return true;
  }

  async generateHeader(doc, tipo, data) {
    let totalCostos = 0;
    let totalGuias = 0;
    let utilidad = 0;
    let porcCosto = 0;
    let porcUtilidad = 0;
    switch (tipo) {
      case 'RCT':
        doc.image('./img/logo_rc.png', 35, 42, { width: 80 });
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(18);
        doc.y = 90;
        doc.x = 180;
        doc.text('Resumen de Costos de Transporte', {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.fontSize(12);
        doc.y = 130;
        doc.x = 210;
        doc.text('Desde: ' + data.fecha_desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 130;
        doc.x = 330;
        doc.text('Hasta: ' + data.fecha_hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.fontSize(9);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 480, 35);
        doc.text('Fecha Envió', 35, 185);
        doc.text('Transp. Exter. (Bs.)', 92, 185);
        doc.text('Viáticos (Bs.)', 177, 185);
        doc.text('Total Costos (Bs.)', 238, 185);
        doc.text('Ingresos (Bs.)', 319, 185);
        doc.text('Utilidad Oper. (Bs.)', 385, 185);
        doc.text('% Costo', 485, 185);
        doc.text('% Utilidad', 540, 185);
        break;
      case 'CTR':
        doc.image('./img/logo_rc.png', 35, 42, { width: 80 });
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(18);
        doc.y = 90;
        doc.x = 205;
        doc.text('Costos de Transporte Diario', {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.fontSize(12);
        doc.y = 130;
        doc.x = 210;
        doc.text('Desde: ' + data.fecha_desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 130;
        doc.x = 330;
        doc.text('Hasta: ' + data.fecha_hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.fontSize(9);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 480, 35);
        doc.text('Fecha', 32, 185);
        doc.text('Transporte', 120, 185);
        doc.text('Costos (Bs.)', 195, 185);
        doc.text('Vehiculo', 252, 185);
        doc.text('Origen', 295, 185);
        doc.text('Destino', 345, 185);
        doc.text('Ventas (Bs.)', 387, 185);
        doc.text('Utilidad (Bs.)', 445, 185);
        doc.text('% Costo', 505, 185);
        doc.text('% Utilidad', 545, 185);
        break;
      case 'DTC':
        doc.image('./img/logo_rc.png', 35, 42, { width: 70 });
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(14);
        doc.y = 100;
        doc.x = 145;
        doc.text(
          'Distribución Prorrateada del Costo de Transporte por Ciudad',
          {
            align: 'left',
            columns: 1,
            width: 500,
          }
        );
        doc.fontSize(12);
        doc.y = 130;
        doc.x = 215;
        doc.text('Desde: ' + data.fecha_desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 130;
        doc.x = 330;
        doc.text('Desde: ' + data.fecha_hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.lineJoin('miter').rect(35, 160, 530, 50).stroke();
        doc.fontSize(10);
        doc.text('Flete O Viatico sin IVA (Bs.)', 50, 172);
        doc.text('Ventas sin IVA (Bs.)', 190, 172);
        doc.text('Utilidad Operativa (Bs.)', 295, 172);
        doc.text('% Costo', 430, 172);
        doc.text('% Utilidad', 495, 172);
        doc.text('Distribución del Costo de Transporte Segun Destino', 35, 223);
        doc.fontSize(8);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 480, 35);

        totalCostos = data.costos[0]['detalles.total_costo'];
        totalGuias = data.totalGuias;
        utilidad = data.totalGuias - data.costos[0]['detalles.total_costo'];
        if (totalGuias > 0) {
          porcCosto = (totalCostos / totalGuias) * 100;
          porcUtilidad = ((totalGuias - totalCostos) / totalGuias) * 100;
        }

        doc.y = 190;
        doc.x = 60;
        doc.text(utils.formatNumber(totalCostos), {
          align: 'center',
          columns: 1,
          width: 100,
        });
        doc.y = 190;
        doc.x = 185;
        doc.text(utils.formatNumber(totalGuias), {
          align: 'center',
          columns: 1,
          width: 100,
        });
        doc.y = 190;
        doc.x = 300;
        doc.text(utils.formatNumber(utilidad), {
          align: 'center',
          columns: 1,
          width: 100,
        });
        doc.y = 190;
        doc.x = 425;
        doc.text(utils.formatNumber(porcCosto) + '%', {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.y = 190;
        doc.x = 495;
        doc.text(utils.formatNumber(porcUtilidad) + '%', {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.fontSize(9);
        doc.text('Destino', 40, 245);
        doc.text('Cant. Guías', 90, 245);
        doc.text('Nro. Piezas', 150, 245);
        doc.text('Kgs', 220, 245);
        doc.text('Ventas sin IVA', 260, 245);
        doc.text('% Costo p/Dest.', 340, 245);
        doc.text('Costo Distrib.p/Dest. (Bs.)', 430, 245);
        break;
      case 'DRC':
        doc.image('./img/logo_rc.png', 35, 42, { width: 70 });
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(14);
        doc.y = 100;
        doc.x = 145;
        doc.text('Distribución Real del Costo de Transporte por Ciudad', {
          align: 'left',
          columns: 1,
          width: 500,
        });
        doc.fontSize(12);
        doc.y = 130;
        doc.x = 215;
        doc.text('Desde: ' + data.fecha_desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 130;
        doc.x = 330;
        doc.text('Desde: ' + data.fecha_hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.lineJoin('miter').rect(35, 160, 530, 50).stroke();
        doc.fontSize(10);
        doc.text('Flete O Viatico sin IVA (Bs.)', 50, 172);
        doc.text('Ventas sin IVA (Bs.)', 190, 172);
        doc.text('Utilidad Operativa (Bs.)', 295, 172);
        doc.text('% Costo', 430, 172);
        doc.text('% Utilidad', 495, 172);
        doc.text('Distribución del Costo de Transporte Segun Destino', 35, 223);
        doc.fontSize(8);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 480, 35);

        totalCostos = data.costoTotal;
        totalGuias = data.totalGuias;
        utilidad = data.totalGuias - totalCostos;
        if (totalGuias > 0) {
          porcCosto = (totalCostos / totalGuias) * 100;
          porcUtilidad = ((totalGuias - totalCostos) / totalGuias) * 100;
        }

        doc.y = 190;
        doc.x = 60;
        doc.text(utils.formatNumber(totalCostos), {
          align: 'center',
          columns: 1,
          width: 100,
        });
        doc.y = 190;
        doc.x = 185;
        doc.text(utils.formatNumber(totalGuias), {
          align: 'center',
          columns: 1,
          width: 100,
        });
        doc.y = 190;
        doc.x = 300;
        doc.text(utils.formatNumber(utilidad), {
          align: 'center',
          columns: 1,
          width: 100,
        });
        doc.y = 190;
        doc.x = 425;
        doc.text(utils.formatNumber(porcCosto) + '%', {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.y = 190;
        doc.x = 495;
        doc.text(utils.formatNumber(porcUtilidad) + '%', {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.fontSize(9);
        doc.text('Destino', 40, 245);
        doc.text('Cant. Guías', 90, 245);
        doc.text('Nro. Piezas', 150, 245);
        doc.text('Kgs', 220, 245);
        doc.text('Ventas sin IVA', 260, 245);
        doc.text('% Costo p/Dest.', 340, 245);
        doc.text('Costo Distrib.p/Dest. (Bs.)', 430, 245);
        break;
      case 'CTP':
        doc.image('./img/logo_rc.png', 35, 42, { width: 70 });
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(16);
        doc.y = 90;
        doc.x = 146;
        doc.text('Costo de Transporte Interno', {
          align: 'center',
          columns: 1,
          width: 350,
        });
        doc.fontSize(10);
        doc.y = 115;
        doc.x = 225;
        doc.text('Desde: ' + data.fecha_desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 115;
        doc.x = 340;
        doc.text('Hasta: ' + data.fecha_hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 137;
        doc.x = 120;
        doc.text(
          'Transporte: ' +
            (data.nombreAgente ? data.nombreAgente : data.nombreProveedor),
          {
            align: 'center',
            columns: 1,
            width: 400,
          }
        );

        doc.fontSize(7);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 470, 35);
        doc.text('Fecha', 40, 170);
        doc.text('Antic. (Bs.)', 75, 170);
        if (data.dolar == true) doc.text('Antic. ($)', 120, 170);
        doc.text('Fletes', 160, 170);
        doc.text(data.neta == 'N' ? 'Neta' : 'Kgs', 195, 170);
        doc.text('Pzas', 220, 170);
        doc.text('Vehiculo', 247, 170);
        doc.text('Origen', 283, 170);
        doc.text('Destino', 315, 170);
        doc.text('Ventas (Bs.)', 350, 170);
        if (data.dolar == true) doc.text('Ventas ($)', 400, 170);
        doc.text('Utilidad', 445, 170);
        doc.text('% Costo', 490, 170);
        doc.text('% Utilidad', 525, 170);
        break;
      case 'CTA':
        doc.image('./img/logo_rc.png', 35, 42, { width: 70 });
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(16);
        doc.y = 90;
        doc.x = 260;
        doc.text('Costo de Transporte por Ayudante', {
          align: 'center',
          columns: 1,
          width: 320,
        });
        doc.fontSize(12);
        doc.y = 115;
        doc.x = 310;
        doc.text('Desde: ' + data.fecha_desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 115;
        doc.x = 440;
        doc.text('Hasta: ' + data.fecha_hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 140;
        doc.x = 225;
        doc.text('Ayudante: ' + data.nombreAyudante, {
          align: 'center',
          columns: 1,
          width: 400,
        });
        doc.fontSize(8);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 680, 35);
        doc.text('Fecha', 40, 170);
        doc.text('Fletes (Bs.)', 80, 170);
        if (data.dolar == true) doc.text('Fletes ($)', 140, 170);
        doc.text('Chofer', 225, 170);
        doc.text('Vehiculo', 355, 170);
        doc.text('Destino', 462, 170);
        doc.text('Ventas (Bs.)', 540, 170);
        if (data.dolar == true) doc.text('Ventas ($)', 600, 170);
        doc.text('Utilidad', 650, 170);
        doc.text('% Costo', 690, 170);
        doc.text('% Utilidad', 730, 170);
        break;
      case 'GPC':
        doc.image('./img/logo_rc.png', 35, 42, { width: 70 });
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(14);
        doc.y = 90;
        doc.x = 170;
        doc.text('Guias Pendientes por Asociar a Costos de Transporte', {
          align: 'left',
          columns: 1,
          width: 500,
        });
        doc.fontSize(12);
        doc.y = 115;
        doc.x = 200;
        doc.text('Emitidas Desde: ' + data.fecha_desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 115;
        doc.x = 380;
        doc.text('Hasta: ' + data.fecha_hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.fontSize(10);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 470, 35);
        doc.text('Item', 40, 170);
        doc.text('Nro. Guía', 70, 170);
        doc.text('Emisión', 120, 170);
        doc.text('Remitente', 165, 170);
        doc.text('Destinatario', 265, 170);
        doc.text('Origen', 370, 170);
        doc.text('Dest.', 410, 170);
        doc.text('Pzas', 440, 170);
        doc.text('Kgs', 480, 170);
        doc.text('Ventas', 530, 170);
        break;
      case 'RVV':
        doc.image('./img/logo_rc.png', 35, 42, { width: 70 });
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(16);
        doc.y = 80;
        doc.x = 270;
        doc.text('Costo de Transporte Interno por Vehiculo', {
          align: 'center',
          columns: 1,
          width: 350,
        });
        doc.fontSize(12);
        doc.y = 105;
        doc.x = 330;
        doc.text('Desde: ' + data.fecha_desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 105;
        doc.x = 450;
        doc.text('Hasta: ' + data.fecha_hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 125;
        doc.x = 180;
        doc.text('Vehiculo: ' + data.nombreTransporte, {
          align: 'center',
          columns: 1,
          width: 500,
        });
        doc.fontSize(10);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 680, 35);
        doc.text('Fecha', 40, 170);
        doc.text('Antic. (Bs.)', 80, 170);
        if (data.dolar == true) doc.text('Antic. ($)', 140, 170);
        doc.text('Fletes', 200, 170);
        doc.text('Agente', 270, 170);
        doc.text('Origen', 355, 170);
        doc.text('Destino', 410, 170);
        doc.text('Ventas (Bs.)', 460, 170);
        if (data.dolar == true) doc.text('Ventas ($)', 525, 170);
        doc.text('Util (Bs.)', 580, 170);
        if (data.dolar == true) doc.text('Util ($)', 630, 170);
        doc.text('% Costo', 670, 170);
        doc.text('% Utilidad', 720, 170);
        break;
      default:
        doc.image('./img/logo_rc.png', 155, 170, { width: 300 });
        break;
    }
  }

  async generateCustomerInformation(doc, tipo, data) {
    let totalVenta = 0;
    let totalCosto = 0;
    let totalExterno = 0;
    let totalInterno = 0;
    let totalPorcCosto = 0;
    let totalPorcUtilidad = 0;
    let totalGuias = 0;
    let totalPzas = 0;
    let totalKgs = 0;
    let totalAnticipo = 0;
    let totalAnticipoDolar = 0;
    let totalGuiasDolar = 0;
    let totalCostoDolar = 0;
    let totalUtilidadBs = 0;
    let totalUtilidadDolar = 0;

    switch (tipo) {
      case 'RCT':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 210;
        for (var item = 0; item < data.detallesg.length; item++) {
          doc.fontSize(8);
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 35;
          doc.text(
            moment(data.detallesg[item].fecha_envio).format('DD/MM/YYYY'),
            {
              align: 'center',
              columns: 1,
              width: 50,
            }
          );
          doc.y = ymin + i;
          doc.x = 100;
          doc.text(utils.formatNumber(data.detallesg[item].total_externo), {
            align: 'right',
            columns: 1,
            width: 70,
          });
          doc.y = ymin + i;
          doc.x = 180;
          doc.text(utils.formatNumber(data.detallesg[item].total_interno), {
            align: 'right',
            columns: 1,
            width: 50,
          });

          let porcCosto = 0;
          let porcUtilidad = 0;
          let montoVenta =
            data.detallesg[item]['detallesg.movimientos.total_monto'];
          let montoCosto = data.detallesg[item].total_costo;
          let utilidadBs =
            utils.parseFloatN(montoVenta) - utils.parseFloatN(montoCosto);
          if (montoVenta > 0) {
            porcCosto = (montoCosto / montoVenta) * 100;
            porcUtilidad = ((montoVenta - montoCosto) / montoVenta) * 100;
          }

          totalVenta += utils.parseFloatN(montoVenta);
          totalCosto += utils.parseFloatN(montoCosto);
          totalInterno += utils.parseFloatN(data.detallesg[item].total_interno);
          totalExterno += utils.parseFloatN(data.detallesg[item].total_externo);

          doc.y = ymin + i;
          doc.x = 240;
          doc.text(utils.formatNumber(montoCosto), {
            align: 'right',
            columns: 1,
            width: 70,
          });
          doc.y = ymin + i;
          doc.x = 325;
          doc.text(utils.formatNumber(montoVenta), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 390;
          doc.text(utils.formatNumber(utilidadBs), {
            align: 'right',
            columns: 1,
            width: 70,
          });
          doc.y = ymin + i;
          doc.x = 485;
          doc.text(utils.formatNumber(porcCosto) + '%', {
            align: 'right',
            columns: 1,
            width: 35,
          });
          doc.y = ymin + i;
          doc.x = 545;
          doc.text(utils.formatNumber(porcUtilidad) + '%', {
            align: 'right',
            columns: 1,
            width: 35,
          });
          i += 20;
          if (i >= 480) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data);
          }
        }
        doc.fillColor('#BLACK');
        doc.y = ymin + i + 5;
        doc.x = 35;
        doc.text('TOTALES:', {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 100;
        doc.text(utils.formatNumber(totalExterno), {
          align: 'right',
          columns: 1,
          width: 70,
        });
        doc.y = ymin + i + 5;
        doc.x = 180;
        doc.text(utils.formatNumber(totalInterno), {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 240;
        doc.text(utils.formatNumber(totalCosto), {
          align: 'right',
          columns: 1,
          width: 70,
        });
        doc.y = ymin + i + 5;
        doc.x = 325;
        doc.text(utils.formatNumber(totalVenta), {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 390;
        doc.text(utils.formatNumber(totalVenta - totalCosto), {
          align: 'right',
          columns: 1,
          width: 70,
        });

        if (totalVenta > 0) {
          totalPorcCosto = (totalCosto / totalVenta) * 100;
          totalPorcUtilidad = ((totalVenta - totalCosto) / totalVenta) * 100;
        }

        doc.y = ymin + i + 5;
        doc.x = 485;
        doc.text(utils.formatNumber(totalPorcCosto) + '%', {
          align: 'right',
          columns: 1,
          width: 35,
        });
        doc.y = ymin + i + 5;
        doc.x = 545;
        doc.text(utils.formatNumber(totalPorcUtilidad) + '%', {
          align: 'right',
          columns: 1,
          width: 35,
        });
        doc.text('NOTA: Los montos expresados son sin IVA.', 35, ymin + i + 25);
        break;
      case 'CTR':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 210;
        for (var item = 0; item < data.detallesg.length; item++) {
          doc.fontSize(8);
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 35;
          doc.text(
            moment(data.detallesg[item].fecha_envio).format('DD/MM/YYYY'),
            {
              align: 'left',
              columns: 1,
              width: 50,
            }
          );

          let agente =
            data.detallesg[item].tipo_transporte == 'I'
              ? data.detallesg[item]['agentes.nb_agente'] +
                ' - ' +
                data.detallesg[item]['agentes.persona_responsable']
              : data.detallesg[item]['proveedores.nb_proveedor'];

          doc.y = ymin + i;
          doc.x = 85;
          doc.text(agente, {
            align: 'left',
            columns: 1,
            width: 125,
          });

          let porcCosto = 0;
          let porcUtilidad = 0;
          let montoVenta =
            data.detallesg[item]['detallesg.movimientos.total_monto'];
          let montoCosto =
            data.detallesg[item].total_costo == null
              ? 0
              : data.detallesg[item].total_costo;
          let utilidadBs =
            utils.parseFloatN(montoVenta) - utils.parseFloatN(montoCosto);
          if (montoVenta > 0) {
            porcCosto = (montoCosto / montoVenta) * 100;
            porcUtilidad = ((montoVenta - montoCosto) / montoVenta) * 100;
          }

          totalVenta += utils.parseFloatN(montoVenta);
          totalCosto += utils.parseFloatN(montoCosto);

          doc.y = ymin + i;
          doc.x = 195;
          doc.text(utils.formatNumber(montoCosto), {
            align: 'right',
            columns: 1,
            width: 55,
          });
          doc.y = ymin + i;
          doc.x = 255;
          doc.text(data.detallesg[item]['unidades.placas'], {
            align: 'center',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 296;
          doc.text(data.detallesg[item]['agencias.ciudades.siglas'], {
            align: 'center',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 324;
          doc.text(data.detallesg[item].destino, {
            align: 'center',
            columns: 1,
            width: 75,
          });
          doc.y = ymin + i;
          doc.x = 390;
          doc.text(utils.formatNumber(montoVenta), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 445;
          doc.text(utils.formatNumber(utilidadBs), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 510;
          doc.text(utils.formatNumber(porcCosto) + '%', {
            align: 'right',
            columns: 1,
            width: 35,
          });
          doc.y = ymin + i;
          doc.x = 555;
          doc.text(utils.formatNumber(porcUtilidad) + '%', {
            align: 'right',
            columns: 1,
            width: 35,
          });
          i += 25;
          if (i >= 480) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data);
          }
        }
        doc.fillColor('#BLACK');
        doc.y = ymin + i + 5;
        doc.x = 30;
        doc.text('TOTALES:', {
          align: 'center',
          columns: 1,
          width: 50,
        });

        doc.y = ymin + i + 5;
        doc.x = 195;
        doc.text(utils.formatNumber(totalCosto), {
          align: 'right',
          columns: 1,
          width: 55,
        });

        doc.y = ymin + i + 5;
        doc.x = 390;
        doc.text(utils.formatNumber(totalVenta), {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 445;
        doc.text(utils.formatNumber(totalVenta - totalCosto), {
          align: 'right',
          columns: 1,
          width: 50,
        });

        if (totalVenta > 0) {
          totalPorcCosto = (totalCosto / totalVenta) * 100;
          totalPorcUtilidad = ((totalVenta - totalCosto) / totalVenta) * 100;
        }

        doc.y = ymin + i + 5;
        doc.x = 510;
        doc.text(utils.formatNumber(totalPorcCosto) + '%', {
          align: 'right',
          columns: 1,
          width: 35,
        });
        doc.y = ymin + i + 5;
        doc.x = 555;
        doc.text(utils.formatNumber(totalPorcUtilidad) + '%', {
          align: 'right',
          columns: 1,
          width: 35,
        });
        doc.text('NOTA: Los montos expresados son sin IVA.', 35, ymin + i + 25);
        break;
      case 'DTC':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 270;
        for (var item = 0; item < data.detallesg.length; item++) {
          doc.fontSize(9);
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 40;
          doc.text(
            data.detallesg[item][
              'detallesg.movimientos.agencias_dest.ciudades.siglas'
            ],
            {
              align: 'center',
              columns: 1,
              width: 35,
            }
          );
          doc.y = ymin + i;
          doc.x = 90;
          doc.text(data.detallesg[item]['detallesg.movimientos.total_guias'], {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 150;
          doc.text(data.detallesg[item]['detallesg.movimientos.total_pzas'], {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 208;
          doc.text(
            utils.formatNumber(
              data.detallesg[item]['detallesg.movimientos.total_kgs']
            ),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = ymin + i;
          doc.x = 265;
          doc.text(
            utils.formatNumber(
              data.detallesg[item]['detallesg.movimientos.total_monto']
            ),
            {
              align: 'right',
              columns: 1,
              width: 60,
            }
          );

          totalGuias += utils.parseFloatN(
            data.detallesg[item]['detallesg.movimientos.total_guias']
          );
          totalPzas += utils.parseFloatN(
            data.detallesg[item]['detallesg.movimientos.total_pzas']
          );
          totalKgs += utils.parseFloatN(
            data.detallesg[item]['detallesg.movimientos.total_kgs']
          );
          totalVenta += utils.parseFloatN(
            data.detallesg[item]['detallesg.movimientos.total_monto']
          );

          let porcCosto = 0;
          if (data.totalGuias > 0) {
            porcCosto =
              (data.detallesg[item]['detallesg.movimientos.total_monto'] /
                data.totalGuias) *
              100;
          }

          totalPorcCosto += porcCosto;
          totalCosto +=
            (porcCosto / 100) * data.costos[0]['detalles.total_costo'];

          doc.y = ymin + i;
          doc.x = 330;
          doc.text(utils.formatNumber(porcCosto) + '%', {
            align: 'right',
            columns: 1,
            width: 80,
          });
          doc.y = ymin + i;
          doc.x = 430;
          doc.text(
            utils.formatNumber(
              (porcCosto / 100) * data.costos[0]['detalles.total_costo']
            ),
            {
              align: 'right',
              columns: 1,
              width: 110,
            }
          );
          i += 13;
          if (i >= 440) {
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data);
          }
        }
        doc.fillColor('#BLACK');
        doc.y = ymin + i + 15;
        doc.x = 35;
        doc.text('TOTAL GENERAL:', {
          align: 'left',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 15;
        doc.x = 90;
        doc.text(totalGuias, {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 15;
        doc.x = 150;
        doc.text(totalPzas, {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 15;
        doc.x = 198;
        doc.text(utils.formatNumber(totalKgs), {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 15;
        doc.x = 265;
        doc.text(utils.formatNumber(totalVenta), {
          align: 'right',
          columns: 1,
          width: 60,
        });
        doc.y = ymin + i + 15;
        doc.x = 330;
        doc.text(utils.formatNumber(totalPorcCosto) + '%', {
          align: 'right',
          columns: 1,
          width: 80,
        });
        doc.y = ymin + i + 15;
        doc.x = 430;
        doc.text(utils.formatNumber(totalCosto), {
          align: 'right',
          columns: 1,
          width: 110,
        });
        doc.y = ymin + i + 47;
        doc.x = 35;
        doc.text(
          'NOTA: Los costos reflejados es un prorrateo de acuerdo a los ingresos totales y a los costos totales de transporte'
        );
        break;
      case 'DRC':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 270;
        for (var item = 0; item < data.detallesg.length; item++) {
          doc.fontSize(9);
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 40;
          doc.text(
            data.detallesg[item][
              'detallesg.movimientos.agencias_dest.ciudades.siglas'
            ],
            {
              align: 'center',
              columns: 1,
              width: 35,
            }
          );
          doc.y = ymin + i;
          doc.x = 90;
          doc.text(data.detallesg[item]['detallesg.movimientos.total_guias'], {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 150;
          doc.text(data.detallesg[item]['detallesg.movimientos.total_pzas'], {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 208;
          doc.text(
            utils.formatNumber(
              data.detallesg[item]['detallesg.movimientos.total_kgs']
            ),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = ymin + i;
          doc.x = 265;
          doc.text(
            utils.formatNumber(
              data.detallesg[item]['detallesg.movimientos.total_monto']
            ),
            {
              align: 'right',
              columns: 1,
              width: 60,
            }
          );

          totalGuias += utils.parseFloatN(
            data.detallesg[item]['detallesg.movimientos.total_guias']
          );
          totalPzas += utils.parseFloatN(
            data.detallesg[item]['detallesg.movimientos.total_pzas']
          );
          totalKgs += utils.parseFloatN(
            data.detallesg[item]['detallesg.movimientos.total_kgs']
          );
          totalVenta += utils.parseFloatN(
            data.detallesg[item]['detallesg.movimientos.total_monto']
          );

          let porcCosto = 0;
          if (data.costoTotal > 0) {
            porcCosto =
              (data.detallesg[item].costoCiudad / data.costoTotal) * 100;
          }

          totalPorcCosto += porcCosto;
          totalCosto += (porcCosto / 100) * data.costoTotal;

          doc.y = ymin + i;
          doc.x = 330;
          doc.text(utils.formatNumber(porcCosto) + '%', {
            align: 'right',
            columns: 1,
            width: 80,
          });
          doc.y = ymin + i;
          doc.x = 430;
          doc.text(utils.formatNumber((porcCosto / 100) * data.costoTotal), {
            align: 'right',
            columns: 1,
            width: 110,
          });
          i += 13;
          if (i >= 440) {
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data);
          }
        }
        doc.fillColor('#BLACK');
        doc.y = ymin + i + 15;
        doc.x = 35;
        doc.text('TOTAL GENERAL:', {
          align: 'left',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 15;
        doc.x = 90;
        doc.text(totalGuias, {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 15;
        doc.x = 150;
        doc.text(totalPzas, {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 15;
        doc.x = 198;
        doc.text(utils.formatNumber(totalKgs), {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 15;
        doc.x = 265;
        doc.text(utils.formatNumber(totalVenta), {
          align: 'right',
          columns: 1,
          width: 60,
        });
        doc.y = ymin + i + 15;
        doc.x = 330;
        doc.text(utils.formatNumber(totalPorcCosto) + '%', {
          align: 'right',
          columns: 1,
          width: 80,
        });
        doc.y = ymin + i + 15;
        doc.x = 430;
        doc.text(utils.formatNumber(data.costoTotal), {
          align: 'right',
          columns: 1,
          width: 110,
        });
        doc.y = ymin + i + 47;
        doc.x = 35;
        doc.text(
          'NOTA: Los costos reflejados se originan del prorrateo del costo por viaje según ingresos por ciudad.'
        );
        break;
      case 'CTP':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 195;
        for (var item = 0; item < data.detallesg.length; item++) {
          doc.fontSize(7);
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 35;
          doc.text(
            moment(data.detallesg[item].fecha_envio).format('DD/MM/YYYY'),
            {
              align: 'left',
              columns: 1,
              width: 50,
            }
          );

          totalAnticipo += utils.parseFloatN(
            data.detallesg[item].monto_anticipo
          );

          doc.y = ymin + i;
          doc.x = 75;
          doc.text(utils.formatNumber(data.detallesg[item].monto_anticipo), {
            align: 'right',
            columns: 1,
            width: 40,
          });

          if (data.dolar == true) {
            let anticipoDolar =
              utils.parseFloatN(data.detallesg[item].monto_anticipo) /
              utils.parseFloatN(data.detallesg[item].valor_dolar);
            totalAnticipoDolar += utils.parseFloatN(anticipoDolar);
            doc.y = ymin + i;
            doc.x = 107;
            doc.text(utils.formatNumber(anticipoDolar.toFixed(2)), {
              align: 'right',
              columns: 1,
              width: 40,
            });
          }

          let montoCosto = data.detallesg[item].total_costo;
          totalCosto += utils.parseFloatN(montoCosto);
          doc.y = ymin + i;
          doc.x = 150;
          doc.text(utils.formatNumber(montoCosto), {
            align: 'right',
            columns: 1,
            width: 30,
          });

          let monto_kgs =
            data.neta == 'N'
              ? data.detallesg[item]['detallesg.movimientos.total_neta']
              : data.detallesg[item]['detallesg.movimientos.total_kgs'];
          totalKgs += utils.parseFloatN(monto_kgs);
          doc.y = ymin + i;
          doc.x = 185;
          doc.text(utils.formatNumber(monto_kgs), {
            align: 'right',
            columns: 1,
            width: 30,
          });

          totalPzas += utils.parseFloatN(
            data.detallesg[item]['detallesg.movimientos.total_pzas']
          );
          doc.y = ymin + i;
          doc.x = 210;
          doc.text(data.detallesg[item]['detallesg.movimientos.total_pzas'], {
            align: 'right',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 245;
          doc.text(data.detallesg[item]['unidades.placas'], {
            align: 'center',
            columns: 1,
            width: 35,
          });
          doc.y = ymin + i;
          doc.x = 280;
          doc.text(data.detallesg[item]['agencias.ciudades.siglas'], {
            align: 'center',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 305;
          doc.text(data.detallesg[item].destino, {
            align: 'center',
            columns: 1,
            width: 50,
          });

          let montoVenta =
            data.detallesg[item]['detallesg.movimientos.total_monto'];
          totalGuias += utils.parseFloatN(montoVenta);
          doc.y = ymin + i;
          doc.x = 345;
          doc.text(utils.formatNumber(montoVenta), {
            align: 'right',
            columns: 1,
            width: 50,
          });

          if (data.dolar == true) {
            let guiasDolar =
              montoVenta / utils.parseFloatN(data.detallesg[item].valor_dolar);
            totalGuiasDolar += utils.parseFloatN(guiasDolar);
            doc.y = ymin + i;
            doc.x = 395;
            doc.text(utils.formatNumber(guiasDolar), {
              align: 'right',
              columns: 1,
              width: 40,
            });
          }

          let porcCosto = 0;
          let porcUtilidad = 0;
          let utilidadBs =
            utils.parseFloatN(montoVenta) - utils.parseFloatN(montoCosto);
          if (montoVenta > 0) {
            porcCosto = (montoCosto / montoVenta) * 100;
            porcUtilidad = ((montoVenta - montoCosto) / montoVenta) * 100;
          }

          doc.y = ymin + i;
          doc.x = 440;
          doc.text(utils.formatNumber(utilidadBs), {
            align: 'right',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 485;
          doc.text(utils.formatNumber(porcCosto) + '%', {
            align: 'right',
            columns: 1,
            width: 35,
          });
          doc.y = ymin + i;
          doc.x = 525;
          doc.text(utils.formatNumber(porcUtilidad) + '%', {
            align: 'right',
            columns: 1,
            width: 35,
          });
          i += 20;
          if (i >= 440) {
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data);
          }
        }
        doc.fillColor('#BLACK');
        doc.y = ymin + i + 15;
        doc.x = 40;
        doc.text('TOTAL:', {
          align: 'left',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 15;
        doc.x = 75;
        doc.text(utils.formatNumber(totalAnticipo), {
          align: 'right',
          columns: 1,
          width: 40,
        });

        if (data.dolar == true) {
          doc.y = ymin + i + 15;
          doc.x = 107;
          doc.text(utils.formatNumber(totalAnticipoDolar), {
            align: 'right',
            columns: 1,
            width: 40,
          });
        }

        doc.y = ymin + i + 15;
        doc.x = 150;
        doc.text(utils.formatNumber(totalCosto), {
          align: 'right',
          columns: 1,
          width: 30,
        });
        doc.y = ymin + i + 15;
        doc.x = 185;
        doc.text(utils.formatNumber(totalKgs), {
          align: 'right',
          columns: 1,
          width: 30,
        });
        doc.y = ymin + i + 15;
        doc.x = 210;
        doc.text(totalPzas, {
          align: 'right',
          columns: 1,
          width: 30,
        });
        doc.y = ymin + i + 15;
        doc.x = 345;
        doc.text(utils.formatNumber(totalGuias), {
          align: 'right',
          columns: 1,
          width: 50,
        });

        if (data.dolar == true) {
          doc.y = ymin + i + 15;
          doc.x = 395;
          doc.text(utils.formatNumber(totalGuiasDolar), {
            align: 'right',
            columns: 1,
            width: 40,
          });
        }

        totalUtilidadBs =
          utils.parseFloatN(totalGuias) - utils.parseFloatN(totalCosto);
        if (totalGuias > 0) {
          totalPorcCosto = (totalCosto / totalGuias) * 100;
          totalPorcUtilidad = ((totalGuias - totalCosto) / totalGuias) * 100;
        }

        doc.y = ymin + i + 15;
        doc.x = 440;
        doc.text(utils.formatNumber(totalUtilidadBs), {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i + 15;
        doc.x = 485;
        doc.text(utils.formatNumber(totalPorcCosto) + '%', {
          align: 'right',
          columns: 1,
          width: 35,
        });
        doc.y = ymin + i + 15;
        doc.x = 525;
        doc.text(utils.formatNumber(totalPorcUtilidad) + '%', {
          align: 'right',
          columns: 1,
          width: 35,
        });
        break;
      case 'CTA':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 200;
        for (var item = 0; item < data.detallesg.length; item++) {
          doc.fontSize(8);
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 35;
          doc.text(
            moment(data.detallesg[item].fecha_envio).format('DD/MM/YYYY'),
            {
              align: 'left',
              columns: 1,
              width: 50,
            }
          );

          let montoCosto = data.detallesg[item].total_costo;
          totalCosto += utils.parseFloatN(montoCosto);
          doc.y = ymin + i;
          doc.x = 75;
          doc.text(utils.formatNumber(montoCosto), {
            align: 'right',
            columns: 1,
            width: 60,
          });

          if (data.dolar == true) {
            let costoDolar =
              utils.parseFloatN(montoCosto) /
              utils.parseFloatN(data.detallesg[item].valor_dolar);
            totalCostoDolar += utils.parseFloatN(costoDolar);
            doc.y = ymin + i;
            doc.x = 140;
            doc.text(utils.formatNumber(costoDolar.toFixed(2)), {
              align: 'right',
              columns: 1,
              width: 40,
            });
          }

          doc.y = ymin + i;
          doc.x = 180;
          doc.text(data.detallesg[item]['agentes.persona_responsable'], {
            align: 'center',
            columns: 1,
            width: 120,
          });
          doc.y = ymin + i;
          doc.x = 300;
          doc.text(
            data.detallesg[item]['unidades.placas'] +
              ' - ' +
              data.detallesg[item]['unidades.descripcion'],
            {
              align: 'center',
              columns: 1,
              width: 140,
            }
          );
          doc.y = ymin + i;
          doc.x = 440;
          doc.text(data.detallesg[item].destino, {
            align: 'center',
            columns: 1,
            width: 80,
          });

          let montoVenta =
            data.detallesg[item]['detallesg.movimientos.total_monto'];
          totalGuias += utils.parseFloatN(montoVenta);
          doc.y = ymin + i;
          doc.x = 540;
          doc.text(utils.formatNumber(montoVenta), {
            align: 'right',
            columns: 1,
            width: 50,
          });

          if (data.dolar == true) {
            let guiasDolar =
              montoVenta / utils.parseFloatN(data.detallesg[item].valor_dolar);
            totalGuiasDolar += utils.parseFloatN(guiasDolar);
            doc.y = ymin + i;
            doc.x = 600;
            doc.text(utils.formatNumber(guiasDolar), {
              align: 'right',
              columns: 1,
              width: 40,
            });
          }

          let porcCosto = 0;
          let porcUtilidad = 0;
          let utilidadBs =
            utils.parseFloatN(montoVenta) - utils.parseFloatN(montoCosto);
          if (montoVenta > 0) {
            porcCosto = (montoCosto / montoVenta) * 100;
            porcUtilidad = ((montoVenta - montoCosto) / montoVenta) * 100;
          }

          doc.y = ymin + i;
          doc.x = 645;
          doc.text(utils.formatNumber(utilidadBs), {
            align: 'right',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 687;
          doc.text(utils.formatNumber(porcCosto) + '%', {
            align: 'right',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 730;
          doc.text(utils.formatNumber(porcUtilidad) + '%', {
            align: 'right',
            columns: 1,
            width: 40,
          });

          i += 25;
          if (i >= 440) {
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data);
          }
        }
        doc.fillColor('#BLACK');
        doc.y = ymin + i + 15;
        doc.x = 40;
        doc.text('TOTAL:', {
          align: 'left',
          columns: 1,
          width: 50,
        });

        doc.y = ymin + i + 15;
        doc.x = 75;
        doc.text(utils.formatNumber(totalCosto), {
          align: 'right',
          columns: 1,
          width: 60,
        });

        if (data.dolar == true) {
          doc.y = ymin + i + 15;
          doc.x = 140;
          doc.text(utils.formatNumber(totalCostoDolar), {
            align: 'right',
            columns: 1,
            width: 40,
          });
        }

        doc.y = ymin + i + 15;
        doc.x = 540;
        doc.text(utils.formatNumber(totalGuias), {
          align: 'right',
          columns: 1,
          width: 50,
        });

        if (data.dolar == true) {
          doc.y = ymin + i + 15;
          doc.x = 600;
          doc.text(utils.formatNumber(totalGuiasDolar), {
            align: 'right',
            columns: 1,
            width: 40,
          });
        }

        totalUtilidadBs =
          utils.parseFloatN(totalGuias) - utils.parseFloatN(totalCosto);
        if (totalGuias > 0) {
          totalPorcCosto = (totalCosto / totalGuias) * 100;
          totalPorcUtilidad = ((totalGuias - totalCosto) / totalGuias) * 100;
        }

        doc.y = ymin + i + 15;
        doc.x = 645;
        doc.text(utils.formatNumber(totalUtilidadBs), {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i + 15;
        doc.x = 687;
        doc.text(utils.formatNumber(totalPorcCosto) + '%', {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i + 15;
        doc.x = 730;
        doc.text(utils.formatNumber(totalPorcUtilidad) + '%', {
          align: 'right',
          columns: 1,
          width: 40,
        });
        break;
      case 'GPC':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 200;
        for (var item = 0; item < data.detallesg.length; item++) {
          doc.fontSize(7);
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 25;
          doc.text(item + 1, {
            align: 'right',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 70;
          doc.text(data.detallesg[item].nro_documento, {
            align: 'left',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 120;
          doc.text(
            moment(data.detallesg[item].fecha_emision).format('DD/MM/YYYY'),
            {
              align: 'left',
              columns: 1,
              width: 45,
            }
          );
          doc.y = ymin + i;
          doc.x = 165;
          doc.text(utils.truncate(data.detallesg[item].cliente_orig_desc, 30), {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.y = ymin + i;
          doc.x = 265;
          doc.text(utils.truncate(data.detallesg[item].cliente_dest_desc, 30), {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.y = ymin + i;
          doc.x = 373;
          doc.text(data.detallesg[item]['agencias.ciudades.siglas'], {
            align: 'center',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 410;
          doc.text(data.detallesg[item]['agencias_dest.ciudades.siglas'], {
            align: 'center',
            columns: 1,
            width: 30,
          });

          totalPzas += utils.parseFloatN(data.detallesg[item].nro_piezas);
          totalKgs += utils.parseFloatN(data.detallesg[item].peso_kgs);
          totalVenta += utils.parseFloatN(data.detallesg[item].monto_subtotal);

          doc.y = ymin + i;
          doc.x = 440;
          doc.text(data.detallesg[item].nro_piezas, {
            align: 'right',
            columns: 1,
            width: 20,
          });
          doc.y = ymin + i;
          doc.x = 480;
          doc.text(utils.formatNumber(data.detallesg[item].peso_kgs), {
            align: 'right',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 510;
          doc.text(utils.formatNumber(data.detallesg[item].monto_subtotal), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          i += 22;
          if (i >= 520) {
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data);
          }
        }
        doc.fillColor('#BLACK');
        doc.y = ymin + i + 10;
        doc.x = 360;
        doc.text('TOTAL GENERAL:', {
          align: 'left',
          columns: 1,
          width: 100,
        });
        doc.y = ymin + i + 10;
        doc.x = 440;
        doc.text(totalPzas, {
          align: 'right',
          columns: 1,
          width: 20,
        });
        doc.y = ymin + i + 10;
        doc.x = 480;
        doc.text(utils.formatNumber(totalKgs), {
          align: 'right',
          columns: 1,
          width: 30,
        });
        doc.y = ymin + i + 10;
        doc.x = 510;
        doc.text(utils.formatNumber(totalVenta), {
          align: 'right',
          columns: 1,
          width: 60,
        });
        break;
      case 'RVV':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 195;
        for (var item = 0; item < data.detallesg.length; item++) {
          doc.fontSize(8);
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 30;
          doc.text(
            moment(data.detallesg[item].fecha_envio).format('DD/MM/YYYY'),
            {
              align: 'center',
              columns: 1,
              width: 50,
            }
          );

          totalAnticipo += utils.parseFloatN(
            data.detallesg[item].monto_anticipo
          );

          doc.y = ymin + i;
          doc.x = 70;
          doc.text(utils.formatNumber(data.detallesg[item].monto_anticipo), {
            align: 'right',
            columns: 1,
            width: 60,
          });

          if (data.dolar == true) {
            let anticipoDolar =
              utils.parseFloatN(data.detallesg[item].monto_anticipo) /
              utils.parseFloatN(data.detallesg[item].valor_dolar);
            totalAnticipoDolar += utils.parseFloatN(anticipoDolar);
            doc.y = ymin + i;
            doc.x = 140;
            doc.text(utils.formatNumber(anticipoDolar.toFixed(2)), {
              align: 'right',
              columns: 1,
              width: 40,
            });
          }

          let montoCosto = data.detallesg[item].total_costo;
          totalCosto += utils.parseFloatN(montoCosto);
          doc.y = ymin + i;
          doc.x = 145;
          doc.text(utils.formatNumber(montoCosto), {
            align: 'right',
            columns: 1,
            width: 80,
          });

          doc.y = ymin + i;
          doc.x = 240;
          doc.text(data.detallesg[item]['agentes.persona_responsable'], {
            align: 'center',
            columns: 1,
            width: 100,
          });
          doc.y = ymin + i;
          doc.x = 360;
          doc.text(data.detallesg[item]['agencias.ciudades.siglas'], {
            align: 'center',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 400;
          doc.text(data.detallesg[item].destino, {
            align: 'center',
            columns: 1,
            width: 60,
          });

          let montoVenta =
            data.detallesg[item]['detallesg.movimientos.total_monto'];
          totalGuias += utils.parseFloatN(montoVenta);
          doc.y = ymin + i;
          doc.x = 455;
          doc.text(utils.formatNumber(montoVenta), {
            align: 'right',
            columns: 1,
            width: 50,
          });

          if (data.dolar == true) {
            let guiasDolar =
              montoVenta / utils.parseFloatN(data.detallesg[item].valor_dolar);
            totalGuiasDolar += utils.parseFloatN(guiasDolar);
            doc.y = ymin + i;
            doc.x = 525;
            doc.text(utils.formatNumber(guiasDolar), {
              align: 'right',
              columns: 1,
              width: 40,
            });
          }

          let porcCosto = 0;
          let porcUtilidad = 0;
          let utilidadBs =
            utils.parseFloatN(montoVenta) - utils.parseFloatN(montoCosto);
          if (montoVenta > 0) {
            porcCosto = (montoCosto / montoVenta) * 100;
            porcUtilidad = ((montoVenta - montoCosto) / montoVenta) * 100;
          }

          doc.y = ymin + i;
          doc.x = 570;
          doc.text(utils.formatNumber(utilidadBs), {
            align: 'right',
            columns: 1,
            width: 50,
          });

          if (data.dolar == true) {
            let utilidadDolar =
              utilidadBs / utils.parseFloatN(data.detallesg[item].valor_dolar);
            totalUtilidadDolar += utils.parseFloatN(utilidadDolar);
            doc.y = ymin + i;
            doc.x = 620;
            doc.text(utils.formatNumber(utilidadDolar), {
              align: 'right',
              columns: 1,
              width: 40,
            });
          }

          doc.y = ymin + i;
          doc.x = 670;
          doc.text(utils.formatNumber(porcCosto) + '%', {
            align: 'right',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 725;
          doc.text(utils.formatNumber(porcUtilidad) + '%', {
            align: 'right',
            columns: 1,
            width: 40,
          });

          i += 20;
          if (i >= 440) {
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data);
          }
        }
        doc.fillColor('#BLACK');
        doc.y = ymin + i + 15;
        doc.x = 40;
        doc.text('TOTAL:', {
          align: 'left',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 35;
        doc.x = 40;
        doc.text('NOTA: Los montos expresados sin IVA', {
          align: 'left',
          columns: 1,
          width: 200,
        });

        doc.y = ymin + i + 15;
        doc.x = 70;
        doc.text(utils.formatNumber(totalAnticipo), {
          align: 'right',
          columns: 1,
          width: 60,
        });

        if (data.dolar == true) {
          doc.y = ymin + i + 15;
          doc.x = 140
          doc.text(utils.formatNumber(totalAnticipoDolar), {
            align: 'right',
            columns: 1,
            width: 40,
          });
        }

        doc.y = ymin + i + 15;
        doc.x = 145;
        doc.text(utils.formatNumber(totalCosto), {
          align: 'right',
          columns: 1,
          width: 80,
        });

        doc.y = ymin + i + 15;
        doc.x = 455;
        doc.text(utils.formatNumber(totalGuias), {
          align: 'right',
          columns: 1,
          width: 50,
        });

        if (data.dolar == true) {
          doc.y = ymin + i + 15;
          doc.x = 525
          doc.text(utils.formatNumber(totalGuiasDolar), {
            align: 'right',
            columns: 1,
            width: 40,
          });
        }

        totalUtilidadBs =
          utils.parseFloatN(totalGuias) - utils.parseFloatN(totalCosto);
        if (totalGuias > 0) {
          totalPorcCosto = (totalCosto / totalGuias) * 100;
          totalPorcUtilidad = ((totalGuias - totalCosto) / totalGuias) * 100;
        }

        doc.y = ymin + i + 15;
        doc.x = 570;
        doc.text(utils.formatNumber(totalUtilidadBs), {
          align: 'right',
          columns: 1,
          width: 50,
        });
        if (data.dolar == true) {
          doc.y = ymin + i + 15;
          doc.x = 620
          doc.text(utils.formatNumber(totalUtilidadDolar), {
            align: 'right',
            columns: 1,
            width: 40,
          });
        }

        doc.y = ymin + i + 15;
        doc.x = 670;
        doc.text(utils.formatNumber(totalPorcCosto) + '%', {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i + 15;
        doc.x = 725;
        doc.text(utils.formatNumber(totalPorcUtilidad) + '%', {
          align: 'right',
          columns: 1,
          width: 40,
        });
        break;
      default:
        break;
    }
    var end;
    const range = doc.bufferedPageRange();
    for (
      i = range.start, end = range.start + range.count, range.start <= end;
      i < end;
      i++
    ) {
      doc.switchToPage(i);
      doc.fontSize(8);
      doc.fillColor('#444444');
      doc.x = tipo == 'CTA' || tipo == 'RVV' ? 646 : 446;
      doc.y = 50;
      doc.text(`Pagina ${i + 1} de ${range.count}`, {
        align: 'right',
        columns: 1,
        width: 100,
      });
    }
  }
}

module.exports = ReporteCostosService;
