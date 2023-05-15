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
      default:
        break;
    }
    data.detallesg = detallesg;
    await this.generateHeader(doc, tipo, data);
    await this.generateCustomerInformation(doc, tipo, data);
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
      case '6':
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
        doc.fontSize(12);
        doc.y = 115;
        doc.x = 215;
        doc.text('Desde: 01/01/2022', {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 115;
        doc.x = 330;
        doc.text('Hasta: 01/01/2022', {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 140;
        doc.x = 220;
        doc.text('Ayudante: Mario Sanchez', {
          align: 'center',
          columns: 1,
          width: 200,
        });
        doc.fontSize(10);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 470, 35);
        doc.text('Fecha', 40, 170);
        doc.text('Anticipo (Bs.)', 85, 170);
        doc.text('Fletes', 170, 170);
        doc.text('Chofer', 230, 170);
        doc.text('Vehiculo', 340, 170);
        doc.text('Dest.', 460, 170);
        doc.text('Ventas (Bs.)', 515, 170);
        break;
      case '7':
        doc.image('./img/logo_rc.png', 35, 42, { width: 70 });
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(16);
        doc.y = 90;
        doc.x = 140;
        doc.text('Guias Pendientes por Asociar a Costos de Transporte', {
          align: 'left',
          columns: 1,
          width: 500,
        });
        doc.fontSize(12);
        doc.y = 115;
        doc.x = 180;
        doc.text('Emitidas Desde: 01/01/2022', {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 115;
        doc.x = 350;
        doc.text('Hasta: 01/01/2022', {
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
        doc.text('Destinatario', 270, 170);
        doc.text('Origen', 370, 170);
        doc.text('Dest.', 410, 170);
        doc.text('Piezas', 440, 170);
        doc.text('Kgs', 480, 170);
        doc.text('Venta sin IVA', 510, 170);
        break;
      case '8':
        doc.image('./img/logo_rc.png', 35, 42, { width: 70 });
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(16);
        doc.y = 90;
        doc.x = 146;
        doc.text('Costo de Transporte Interno por Vehiculo', {
          align: 'center',
          columns: 1,
          width: 350,
        });
        doc.fontSize(12);
        doc.y = 115;
        doc.x = 215;
        doc.text('Desde: 01/01/2022', {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 115;
        doc.x = 330;
        doc.text('Hasta: 01/01/2022', {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 140;
        doc.x = 220;
        doc.text('Vehiculo: ASDGQWESD', {
          align: 'center',
          columns: 1,
          width: 200,
        });
        doc.fontSize(10);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 470, 35);
        doc.text('Fecha', 40, 170);
        doc.text('Anticipo (Bs.)', 85, 170);
        doc.text('Fletes', 170, 170);
        doc.text('Agente', 230, 170);
        doc.text('Origen', 350, 170);
        doc.text('Dest.', 395, 170);
        doc.text('Ventas (Bs.)', 430, 170);
        doc.text('Utilidad (Bs.)', 500, 170);
        break;
      case '9':
        doc.image('./img/logo_rc.png', 35, 42, { width: 70 });
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(16);
        doc.y = 90;
        doc.x = 130;
        doc.text('Costo de Transporte Interno por Vehiculo Y Agente', {
          align: 'center',
          columns: 1,
          width: 400,
        });
        doc.fontSize(12);
        doc.y = 120;
        doc.x = 215;
        doc.text('Desde: 01/01/2022', {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 120;
        doc.x = 330;
        doc.text('Hasta: 01/01/2022', {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.fontSize(10);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 470, 35);
        doc.text('Fecha', 40, 170);
        doc.text('Anticipo (Bs.)', 85, 170);
        doc.text('Fletes', 170, 170);
        doc.text('Origen', 210, 170);
        doc.text('Dest.', 255, 170);
        doc.text('Ventas (Bs.)', 295, 170);
        doc.text('Utilidad (Bs.)', 370, 170);
        doc.text('% Costo', 450, 170);
        doc.text('% Utilidad', 510, 170);
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
          if (i >= 440 || item >= 100) {
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
          if (i >= 440 || item >= 100) {
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

          totalPzas += utils.parseFloatN(data.detallesg[item]['detallesg.movimientos.total_pzas']);
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

          let montoVenta = data.detallesg[item]['detallesg.movimientos.total_monto'];
          totalGuias += utils.parseFloatN(montoVenta);
          doc.y = ymin + i;
          doc.x = 345;
          doc.text(
            utils.formatNumber(montoVenta),
            {
              align: 'right',
              columns: 1,
              width: 50,
            }
          );

          if (data.dolar == true) {
            let guiasDolar = montoVenta /
              utils.parseFloatN(data.detallesg[item].valor_dolar);
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
          if (i >= 440 || item >= 100) {
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

        let totalPorcCosto = 0;
        let totalPorcUtilidad = 0;
        let totalUtilidadBs =
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
      case '6':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 200;
        for (var item = 0; item < 10; item++) {
          doc.fontSize(9);
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 40;
          doc.text('12/10/2022', {
            align: 'left',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 85;
          doc.text('123112313133', {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 150;
          doc.text('121231231', {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 200;
          doc.text('1231231312', {
            align: 'right',
            columns: 1,
            width: 65,
          });
          doc.y = ymin + i;
          doc.x = 270;
          doc.text('1231231312', {
            align: 'right',
            columns: 1,
            width: 110,
          });
          doc.y = ymin + i;
          doc.x = 385;
          doc.text('234234234232', {
            align: 'right',
            columns: 1,
            width: 100,
          });
          doc.y = ymin + i;
          doc.x = 500;
          doc.text('1112312231233', {
            align: 'right',
            columns: 1,
            width: 70,
          });
          i += 15;
          if (i >= 440 || item >= 100) {
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
        doc.x = 85;
        doc.text('12311231', {
          align: 'right',
          columns: 1,
          width: 60,
        });
        doc.y = ymin + i + 15;
        doc.x = 150;
        doc.text('12123123123', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 15;
        doc.x = 200;
        doc.text('12312313', {
          align: 'right',
          columns: 1,
          width: 65,
        });
        doc.y = ymin + i + 15;
        doc.x = 270;
        doc.text('12312313', {
          align: 'right',
          columns: 1,
          width: 110,
        });
        doc.y = ymin + i + 15;
        doc.x = 385;
        doc.text('23423434234', {
          align: 'right',
          columns: 1,
          width: 100,
        });
        doc.y = ymin + i + 15;
        doc.x = 500;
        doc.text('11123123112123132312323', {
          align: 'right',
          columns: 1,
          width: 70,
        });
        break;
      case '7':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 200;
        for (var item = 0; item < 10; item++) {
          doc.fontSize(9);
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 40;
          doc.text(item, {
            align: 'left',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 70;
          doc.text('123112', {
            align: 'left',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 120;
          doc.text('1231123', {
            align: 'left',
            columns: 1,
            width: 45,
          });
          doc.y = ymin + i;
          doc.x = 165;
          doc.text('12312123131312331', {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.y = ymin + i;
          doc.x = 270;
          doc.text('123121231231233123', {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.y = ymin + i;
          doc.x = 373;
          doc.text('23423', {
            align: 'left',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 410;
          doc.text('23423', {
            align: 'left',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 440;
          doc.text('111', {
            align: 'right',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 470;
          doc.text('11', {
            align: 'right',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 510;
          doc.text('11123123123', {
            align: 'right',
            columns: 1,
            width: 60,
          });
          i += 15;
          if (i >= 440 || item >= 100) {
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
        doc.text('111', {
          align: 'right',
          columns: 1,
          width: 30,
        });
        doc.y = ymin + i + 10;
        doc.x = 470;
        doc.text('11', {
          align: 'right',
          columns: 1,
          width: 30,
        });
        doc.y = ymin + i + 10;
        doc.x = 510;
        doc.text('11123123123', {
          align: 'right',
          columns: 1,
          width: 60,
        });
        break;
      case '8':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 200;
        for (var item = 0; item < 10; item++) {
          doc.fontSize(9);
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 40;
          doc.text('12/10/2022', {
            align: 'left',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 85;
          doc.text('123112313133', {
            align: 'right',
            columns: 1,
            width: 65,
          });
          doc.y = ymin + i;
          doc.x = 160;
          doc.text('12123131', {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 230;
          doc.text('12311231313123212313', {
            align: 'left',
            columns: 1,
            width: 110,
          });
          doc.y = ymin + i;
          doc.x = 350;
          doc.text('123', {
            align: 'center',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 390;
          doc.text('123', {
            align: 'center',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 420;
          doc.text('1112312233', {
            align: 'right',
            columns: 1,
            width: 70,
          });
          doc.y = ymin + i;
          doc.x = 490;
          doc.text('1112312233', {
            align: 'right',
            columns: 1,
            width: 70,
          });
          i += 15;
          if (i >= 440 || item >= 100) {
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data);
          }
        }
        doc.fillColor('#BLACK');
        doc.y = ymin + i + 10;
        doc.x = 40;
        doc.text('TOTAL:', {
          align: 'left',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 25;
        doc.x = 40;
        doc.text('NOTA: Los montos expresados sin IVA', {
          align: 'left',
          columns: 1,
          width: 200,
        });
        doc.y = ymin + i + 10;
        doc.x = 85;
        doc.text('123112313133', {
          align: 'right',
          columns: 1,
          width: 65,
        });
        doc.y = ymin + i + 10;
        doc.x = 160;
        doc.text('12123131', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 10;
        doc.x = 230;
        doc.text('12311231313123212313', {
          align: 'left',
          columns: 1,
          width: 110,
        });
        doc.y = ymin + i + 10;
        doc.x = 350;
        doc.text('123', {
          align: 'center',
          columns: 1,
          width: 30,
        });
        doc.y = ymin + i + 10;
        doc.x = 390;
        doc.text('123', {
          align: 'center',
          columns: 1,
          width: 30,
        });
        doc.y = ymin + i + 10;
        doc.x = 420;
        doc.text('1112312233', {
          align: 'right',
          columns: 1,
          width: 70,
        });
        doc.y = ymin + i + 10;
        doc.x = 490;
        doc.text('1112312233', {
          align: 'right',
          columns: 1,
          width: 70,
        });
        break;
      case '9':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 200;
        for (var item = 0; item < 10; item++) {
          doc.fontSize(9);
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 40;
          doc.text('12/10/2022', {
            align: 'left',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 85;
          doc.text('123112313133', {
            align: 'right',
            columns: 1,
            width: 65,
          });
          doc.y = ymin + i;
          doc.x = 150;
          doc.text('12123131', {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 210;
          doc.text('123', {
            align: 'center',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 252;
          doc.text('123', {
            align: 'center',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 290;
          doc.text('121231313', {
            align: 'right',
            columns: 1,
            width: 70,
          });
          doc.y = ymin + i;
          doc.x = 370;
          doc.text('121231312312312312312313', {
            align: 'right',
            columns: 1,
            width: 70,
          });
          doc.y = ymin + i;
          doc.x = 450;
          doc.text('1112312233', {
            align: 'right',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 515;
          doc.text('1112312233', {
            align: 'right',
            columns: 1,
            width: 40,
          });
          i += 15;
          if (i >= 440 || item >= 100) {
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data);
          }
        }
        doc.fillColor('#BLACK');
        doc.y = ymin + i + 10;
        doc.x = 40;
        doc.text('TOTALES:', {
          align: 'left',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 10;
        doc.x = 85;
        doc.text('123112313133', {
          align: 'right',
          columns: 1,
          width: 65,
        });
        doc.y = ymin + i + 10;
        doc.x = 150;
        doc.text('12123131', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 10;
        doc.x = 290;
        doc.text('121231313', {
          align: 'right',
          columns: 1,
          width: 70,
        });
        doc.y = ymin + i + 10;
        doc.x = 370;
        doc.text('121231312312312312312313', {
          align: 'right',
          columns: 1,
          width: 70,
        });
        break;
      default:
        break;
    }
    if (tipo) {
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
        doc.x = 446;
        doc.y = 50;
        doc.text(`Pagina ${i + 1} de ${range.count}`, {
          align: 'right',
          columns: 1,
          width: 100,
        });
      }
    }
  }
}

module.exports = ReporteCostosService;
