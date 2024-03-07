const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

const fechaEnvioCosto =
  '(SELECT max(costos_transporte.fecha_envio) ' +
  ' FROM detalle_costos_guias ' +
  ' JOIN costos_transporte ON detalle_costos_guias.cod_costo = costos_transporte.id ' +
  ' WHERE `Mmovimientos`.id = detalle_costos_guias.cod_movimiento)';
const comisionEnt =
  '(SELECT ROUND(`Mmovimientos`.base_comision_vta_rcl * (agentes.porc_comision_entrega / 100), 2) ' +
  ' FROM agentes ' +
  ' WHERE `Mmovimientos`.cod_agente_entrega = agentes.id)';
const comisionSeg =
  '(SELECT ROUND(`Mmovimientos`.base_comision_seg * (agentes.porc_comision_seguro / 100), 2) ' +
  ' FROM agentes ' +
  ' WHERE `Mmovimientos`.cod_agente_entrega = agentes.id)';
const valorDolar =
  '(SELECT valor FROM historico_dolar ' +
  ' WHERE historico_dolar.fecha = `Mmovimientos`.fecha_emision)';
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

const estatus_operativo = [
  { label: 'En Envío', value: 'PR' },
  { label: 'Por Entregar', value: 'PE' },
  { label: 'Conforme', value: 'CO' },
  { label: 'No Conforme', value: 'NC' },
];

class ComisionesService {
  async mainReport(doc, data, desde, hasta, dolar, group) {
    data = JSON.parse(data);

    let detalles = await models.Mmovimientos.findAll({
      where: {
        id: {
          [Sequelize.Op.in]: data,
        },
      },
      attributes: [
        'nro_documento',
        'fecha_emision',
        'carga_neta',
        'nro_piezas',
        'fecha_envio',
        'fecha_recepcion',
        'monto_total',
        'estatus_operativo',
        'cod_agencia_dest',
        'cod_agente_entrega',
        [Sequelize.literal(fechaEnvioCosto), 'fecha_envio_costo'],
        [Sequelize.literal(comisionEnt), 'comision_entrega'],
        [Sequelize.literal(comisionSeg), 'comision_seguro'],
        [Sequelize.literal(valorDolar), 'valor_dolar'],
        [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
        [Sequelize.literal(clienteDestDesc), 'cliente_dest_desc'],
      ],
      include: [
        {
          model: models.Agencias,
          as: 'agencias',
          attributes: ['nb_agencia'],
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
          attributes: ['nb_agencia'],
        },
        {
          model: models.Agentes,
          as: 'agentes_entrega',
          attributes: [
            'nb_agente',
            'persona_responsable',
            'porc_comision_entrega',
            'porc_comision_seguro',
          ],
        },
      ],
      order: [
        ['cod_agencia_dest', 'ASC'],
        ['cod_agente_entrega', 'ASC'],
        ['nro_documento', 'ASC'],
        ['fecha_emision', 'ASC'],
      ],
      raw: true,
    });

    if (detalles.length == 0) return false;

    await this.generateHeader(doc, desde, hasta, dolar, group);
    await this.generateCustomerInformation(
      doc,
      detalles,
      desde,
      hasta,
      dolar,
      group
    );
    return true;
  }

  async generateHeader(doc, desde, hasta, dolar, group) {
    doc.image('./img/logo_rc.png', 35, 25, { width: 60 });
    doc.fontSize(8);
    doc.text('RCS EXPRESS, S.A', 35, 120);
    doc.text('RIF. J-31028463-6', 35, 130);
    doc.font('Helvetica-Bold');
    doc.fillColor('#444444');

    doc.fontSize(16);

    if (group == 'true') {
      doc.y = 70;
      doc.x = 120;
      doc.text('Comisiones de Entrega por Generar', {
        align: 'center',
        columns: 1,
        width: 400,
      });

      doc.fontSize(12);
      doc.y = 95;
      doc.x = 210;
      doc.text('Desde: ' + desde, {
        align: 'left',
        columns: 1,
        width: 300,
      });
      doc.y = 95;
      doc.x = 327;
      doc.text('Hasta: ' + hasta, {
        align: 'left',
        columns: 1,
        width: 300,
      });

      doc.fontSize(9);
      doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 510, 35);

      doc.text('Agente / Responsable', 45, 170);
      doc.text('% Com.', 160, 160);
      doc.text('Entrega', 160, 170);
      doc.text('% Com.', 200, 160);
      doc.text('Seguro', 200, 170);
      doc.text('Kilos', 245, 170);
      doc.text('Piezas', 280, 170);
      doc.text('Monto', 320, 160);
      doc.text('Total', 322, 170);
      doc.text('Comisión', 412, 160);
      doc.text('Entrega', 414, 170);
      doc.text('Comisión', 509, 160);
      doc.text('Seguro', 514, 170);

      if (dolar == 'true') {
        doc.text('Monto', 366, 160);
        doc.text('Total $', 365, 170);
        doc.text('Com', 470, 160);
        doc.text('Ent $', 469, 170);
        doc.text('Com', 567, 160);
        doc.text('Seg $', 565, 170);
      }
    } else {
      doc.y = 70;
      doc.x = 200;
      doc.text('Comisiones de Entrega por Generar', {
        align: 'center',
        columns: 1,
        width: 400,
      });

      doc.fontSize(12);
      doc.y = 95;
      doc.x = 290;
      doc.text('Desde: ' + desde, {
        align: 'left',
        columns: 1,
        width: 300,
      });
      doc.y = 95;
      doc.x = 407;
      doc.text('Hasta: ' + hasta, {
        align: 'left',
        columns: 1,
        width: 300,
      });

      doc.fontSize(10);
      doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 670, 35);

      doc.fontSize(8);
      doc.text('#', 28, 170);
      doc.text('Nro.', 60, 160);
      doc.text('Documento', 45, 170);
      doc.text('Fecha', 103, 160);
      doc.text('Emisión', 99, 170);
      doc.text('Kgs.', 138, 170);
      doc.text('Pzas.', 161, 170);
      doc.text('Fecha', 191, 160);
      doc.text('Envío', 192, 170);
      doc.text('Fecha', 235, 160);
      doc.text('Entrega', 233, 170);
      doc.text('Días', 273, 160);
      doc.text('Ent.', 274, 170);
      doc.text('Org.', 293, 170);
      doc.text('Cliente', 390, 170);
      doc.text('Estatus', 520, 160);
      doc.text('Operativo', 516, 170);
      doc.text('Monto', 565, 160);
      doc.text('Total', 568, 170);
      doc.text('Comisión', 632, 160);
      doc.text('Entrega', 636, 170);
      doc.text('Comisión', 700, 160);
      doc.text('Seguro', 706, 170);

      if (dolar == 'true') {
        doc.text('Monto', 600, 160);
        doc.text('Total $', 600, 170);
        doc.text('Com', 675, 160);
        doc.text('Ent $', 675, 170);
        doc.text('Com', 743, 160);
        doc.text('Seg $', 742, 170);
      }
    }
  }

  async generateCustomerInformation(doc, detalles, desde, hasta, dolar, group) {
    var i = 0;
    var page = 0;
    var ymin;
    ymin = 190;

    let monto_total_dolar = 0;
    let comision_entrega_dolar = 0;
    let comision_seguro_dolar = 0;
    let subTotalAgenteKgs = 0;
    let subTotalAgenciaKgs = 0;
    let totalGeneralKgs = 0;
    let subTotalAgentePzas = 0;
    let subTotalAgenciaPzas = 0;
    let totalGeneralPzas = 0;
    let subTotalAgenteTotal = 0;
    let subTotalAgenciaTotal = 0;
    let totalGeneralTotal = 0;
    let subTotalAgenteEntrega = 0;
    let subTotalAgenciaEntrega = 0;
    let totalGeneralEntrega = 0;
    let subTotalAgenteSeguro = 0;
    let subTotalAgenciaSeguro = 0;
    let totalGeneralSeguro = 0;
    let subTotalAgenciaTotalDolar = 0;
    let subTotalAgenciaEntregaDolar = 0;
    let subTotalAgenciaSeguroDolar = 0;
    let subTotalAgenteTotalDolar = 0;
    let subTotalAgenteEntregaDolar = 0;
    let subTotalAgenteSeguroDolar = 0;
    let totalGeneralTotalDolar = 0;
    let totalGeneralEntregaDolar = 0;
    let totalGeneralSeguroDolar = 0;
    let countAgencia = -1;
    let countAgente = -1;

    for (var item = 0; item < detalles.length; item++) {
      subTotalAgenteKgs += utils.parseFloatN(detalles[item].carga_neta);
      subTotalAgenciaKgs += utils.parseFloatN(detalles[item].carga_neta);
      totalGeneralKgs += utils.parseFloatN(detalles[item].carga_neta);
      subTotalAgentePzas += utils.parseFloatN(detalles[item].nro_piezas);
      subTotalAgenciaPzas += utils.parseFloatN(detalles[item].nro_piezas);
      totalGeneralPzas += utils.parseFloatN(detalles[item].nro_piezas);
      subTotalAgenteTotal += utils.parseFloatN(detalles[item].monto_total);
      subTotalAgenciaTotal += utils.parseFloatN(detalles[item].monto_total);
      totalGeneralTotal += utils.parseFloatN(detalles[item].monto_total);
      subTotalAgenteEntrega += utils.parseFloatN(
        detalles[item].comision_entrega
      );
      subTotalAgenciaEntrega += utils.parseFloatN(
        detalles[item].comision_entrega
      );
      totalGeneralEntrega += utils.parseFloatN(detalles[item].comision_entrega);
      subTotalAgenteSeguro += utils.parseFloatN(detalles[item].comision_seguro);
      subTotalAgenciaSeguro += utils.parseFloatN(
        detalles[item].comision_seguro
      );
      totalGeneralSeguro += utils.parseFloatN(detalles[item].comision_seguro);
      countAgencia++;
      countAgente++;

      if (dolar == 'true') {
        monto_total_dolar =
          detalles[item].valor_dolar == 0
            ? 0
            : detalles[item].monto_total / detalles[item].valor_dolar;
        comision_entrega_dolar =
          detalles[item].valor_dolar == 0
            ? 0
            : detalles[item].comision_entrega / detalles[item].valor_dolar;
        comision_seguro_dolar =
          detalles[item].valor_dolar == 0
            ? 0
            : detalles[item].comision_seguro / detalles[item].valor_dolar;

        subTotalAgenciaTotalDolar += monto_total_dolar;
        subTotalAgenciaEntregaDolar += comision_entrega_dolar;
        subTotalAgenciaSeguroDolar += comision_seguro_dolar;
        subTotalAgenteTotalDolar += monto_total_dolar;
        subTotalAgenteEntregaDolar += comision_entrega_dolar;
        subTotalAgenteSeguroDolar += comision_seguro_dolar;
        totalGeneralTotalDolar += monto_total_dolar;
        totalGeneralEntregaDolar += comision_entrega_dolar;
        totalGeneralSeguroDolar += comision_seguro_dolar;
      }

      if (group == 'true') {
        doc.fontSize(8);
        if (item == 0) {
          doc.font('Helvetica-Bold');
          doc.text(detalles[item]['agencias_dest.nb_agencia'], 28, ymin + i);
          i += 17;
        }

        if (
          item > 0 &&
          detalles[item].cod_agente_entrega !=
            detalles[item - 1].cod_agente_entrega
        ) {
          doc.font('Helvetica');
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 45;
          doc.text(detalles[item - 1]['agentes_entrega.persona_responsable'], {
            align: 'left',
            columns: 1,
            width: 150,
          });
          doc.y = ymin + i;
          doc.x = 166;
          doc.text(
            utils.formatNumber(
              detalles[item - 1]['agentes_entrega.porc_comision_entrega']
            ),
            {
              align: 'center',
              columns: 1,
              width: 30,
            }
          );
          doc.y = ymin + i;
          doc.x = 205;
          doc.text(
            utils.formatNumber(
              detalles[item - 1]['agentes_entrega.porc_comision_seguro']
            ),
            {
              align: 'center',
              columns: 1,
              width: 30,
            }
          );

          doc.y = ymin + i;
          doc.x = 237;
          doc.text(
            utils.formatNumber(
              subTotalAgenteKgs - utils.parseFloatN(detalles[item].carga_neta)
            ),
            {
              align: 'center',
              columns: 1,
              width: 40,
            }
          );
          doc.y = ymin + i;
          doc.x = 275;
          doc.text(
            subTotalAgentePzas - utils.parseFloatN(detalles[item].nro_piezas),
            {
              align: 'center',
              columns: 1,
              width: 40,
            }
          );
          doc.y = ymin + i;
          doc.x = 310;
          doc.text(
            utils.formatNumber(
              subTotalAgenteTotal -
                utils.parseFloatN(detalles[item].monto_total)
            ),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = ymin + i;
          doc.x = 410;
          doc.text(
            utils.formatNumber(
              subTotalAgenteEntrega -
                utils.parseFloatN(detalles[item].comision_entrega)
            ),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = ymin + i;
          doc.x = 506;
          doc.text(
            utils.formatNumber(
              subTotalAgenteSeguro -
                utils.parseFloatN(detalles[item].comision_seguro)
            ),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );

          if (dolar == 'true') {
            doc.y = ymin + i;
            doc.x = 353;
            doc.text(
              utils.formatNumber(subTotalAgenteTotalDolar - monto_total_dolar),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 456;
            doc.text(
              utils.formatNumber(
                subTotalAgenteEntregaDolar - comision_entrega_dolar
              ),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 550;
            doc.text(
              utils.formatNumber(
                subTotalAgenteSeguroDolar - comision_seguro_dolar
              ),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );

            subTotalAgenteTotalDolar = monto_total_dolar;
            subTotalAgenteEntregaDolar = comision_entrega_dolar;
            subTotalAgenteSeguroDolar = comision_seguro_dolar;
          }

          subTotalAgenteKgs = utils.parseFloatN(detalles[item].carga_neta);
          subTotalAgentePzas = utils.parseFloatN(detalles[item].nro_piezas);
          subTotalAgenteTotal = utils.parseFloatN(detalles[item].monto_total);
          subTotalAgenteEntrega = utils.parseFloatN(
            detalles[item].comision_entrega
          );
          subTotalAgenteSeguro = utils.parseFloatN(
            detalles[item].comision_seguro
          );

          i += 17;

          // Subtotales por Agencia
          if (
            detalles[item].cod_agencia_dest !=
            detalles[item - 1].cod_agencia_dest
          ) {
            doc.font('Helvetica-Bold');
            doc.text('Totales por Agencia', 140, ymin + i);

            doc.y = ymin + i;
            doc.x = 237;
            doc.text(
              utils.formatNumber(
                subTotalAgenciaKgs -
                  utils.parseFloatN(detalles[item].carga_neta)
              ),
              {
                align: 'center',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 275;
            doc.text(
              subTotalAgenciaPzas -
                utils.parseFloatN(detalles[item].nro_piezas),
              {
                align: 'center',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 310;
            doc.text(
              utils.formatNumber(
                subTotalAgenciaTotal -
                  utils.parseFloatN(detalles[item].monto_total)
              ),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 410;
            doc.text(
              utils.formatNumber(
                subTotalAgenciaEntrega -
                  utils.parseFloatN(detalles[item].comision_entrega)
              ),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 506;
            doc.text(
              utils.formatNumber(
                subTotalAgenciaSeguro -
                  utils.parseFloatN(detalles[item].comision_seguro)
              ),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );

            if (dolar == 'true') {
              doc.y = ymin + i;
              doc.x = 353;
              doc.text(
                utils.formatNumber(
                  subTotalAgenciaTotalDolar - monto_total_dolar
                ),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 456;
              doc.text(
                utils.formatNumber(
                  subTotalAgenciaEntregaDolar - comision_entrega_dolar
                ),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 550;
              doc.text(
                utils.formatNumber(
                  subTotalAgenciaSeguroDolar - comision_seguro_dolar
                ),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );

              subTotalAgenciaTotalDolar = monto_total_dolar;
              subTotalAgenciaEntregaDolar = comision_entrega_dolar;
              subTotalAgenciaSeguroDolar = comision_seguro_dolar;
            }

            subTotalAgenciaKgs = utils.parseFloatN(detalles[item].carga_neta);
            subTotalAgenciaPzas = utils.parseFloatN(detalles[item].nro_piezas);
            subTotalAgenciaTotal = utils.parseFloatN(
              detalles[item].monto_total
            );
            subTotalAgenciaEntrega = utils.parseFloatN(
              detalles[item].comision_entrega
            );
            subTotalAgenciaSeguro = utils.parseFloatN(
              detalles[item].comision_seguro
            );

            i += 17;

            if (i >= 480) {
              doc.fillColor('#BLACK');
              doc.addPage();
              page = page + 1;
              doc.switchToPage(page);
              i = 0;
              await this.generateHeader(doc, desde, hasta, dolar, group);
            }

            doc.text(detalles[item]['agencias_dest.nb_agencia'], 28, ymin + i);
            i += 17;
          }
        }

        if (i >= 520) {
          doc.fillColor('#BLACK');
          doc.addPage();
          page = page + 1;
          doc.switchToPage(page);
          i = 0;
          await this.generateHeader(doc, desde, hasta, dolar, group);
        }
      } else {
        //Subtotales por agencia
        if (
          item == 0 ||
          detalles[item].cod_agencia_dest != detalles[item - 1].cod_agencia_dest
        ) {
          if (item > 0) {
            doc.font('Helvetica-Bold');
            doc.fontSize(7);
            i += 15;
            doc.y = ymin + i;
            doc.x = 25;
            doc.text('Sub-Totales por Agencia:', {
              align: 'right',
              columns: 1,
              width: 100,
            });
            doc.y = ymin + i;
            doc.x = 120;
            doc.text(
              utils.formatNumber(
                subTotalAgenciaKgs -
                  utils.parseFloatN(detalles[item].carga_neta)
              ),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 155;
            doc.text(
              subTotalAgenciaPzas -
                utils.parseFloatN(detalles[item].nro_piezas),
              {
                align: 'right',
                columns: 1,
                width: 20,
              }
            );

            doc.y = ymin + i;
            doc.x = 200;
            doc.text('P/Guia:', {
              align: 'left',
              columns: 1,
              width: 30,
            });
            doc.y = ymin + i;
            doc.x = 220;
            doc.text(
              utils.formatNumber(
                (subTotalAgenciaEntrega -
                  utils.parseFloatN(detalles[item].comision_entrega)) /
                  countAgencia
              ),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );

            doc.y = ymin + i;
            doc.x = 340;
            doc.text('P/Bulto:', {
              align: 'left',
              columns: 1,
              width: 30,
            });
            doc.y = ymin + i;
            doc.x = 360;
            doc.text(
              utils.formatNumber(
                (subTotalAgenciaEntrega -
                  utils.parseFloatN(detalles[item].comision_entrega)) /
                  (subTotalAgenciaPzas -
                    utils.parseFloatN(detalles[item].nro_piezas))
              ),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );

            doc.y = ymin + i;
            doc.x = 555;
            doc.text(
              utils.formatNumber(
                subTotalAgenciaTotal -
                  utils.parseFloatN(detalles[item].monto_total)
              ),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 627;
            doc.text(
              utils.formatNumber(
                subTotalAgenciaEntrega -
                  utils.parseFloatN(detalles[item].comision_entrega)
              ),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 690;
            doc.text(
              utils.formatNumber(
                subTotalAgenciaSeguro -
                  utils.parseFloatN(detalles[item].comision_seguro)
              ),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );

            if (dolar == 'true') {
              doc.y = ymin + i;
              doc.x = 590;
              doc.text(
                utils.formatNumber(
                  subTotalAgenciaTotalDolar - monto_total_dolar
                ),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 658;
              doc.text(
                utils.formatNumber(
                  subTotalAgenciaEntregaDolar - comision_entrega_dolar
                ),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 720;
              doc.text(
                utils.formatNumber(
                  subTotalAgenciaSeguroDolar - comision_seguro_dolar
                ),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );

              doc.y = ymin + i;
              doc.x = 260;
              doc.text(
                utils.formatNumber(
                  (subTotalAgenciaEntregaDolar - comision_entrega_dolar) /
                    countAgencia
                ) + '$',
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 400;
              doc.text(
                utils.formatNumber(
                  (subTotalAgenciaEntregaDolar - comision_entrega_dolar) /
                    (subTotalAgenciaPzas -
                      utils.parseFloatN(detalles[item].nro_piezas))
                ) + '$',
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );

              subTotalAgenciaTotalDolar = monto_total_dolar;
              subTotalAgenciaEntregaDolar = comision_entrega_dolar;
              subTotalAgenciaSeguroDolar = comision_seguro_dolar;
            }

            subTotalAgenciaKgs = utils.parseFloatN(detalles[item].carga_neta);
            subTotalAgenciaPzas = utils.parseFloatN(detalles[item].nro_piezas);
            subTotalAgenciaTotal = utils.parseFloatN(
              detalles[item].monto_total
            );
            subTotalAgenciaEntrega = utils.parseFloatN(
              detalles[item].comision_entrega
            );
            subTotalAgenciaSeguro = utils.parseFloatN(
              detalles[item].comision_seguro
            );
            countAgencia = 0;

            //Subtotales por agente
            if (
              detalles[item].cod_agente_entrega !=
              detalles[item - 1].cod_agente_entrega
            ) {
              doc.y = ymin + i - 15;
              doc.x = 25;
              doc.text('Sub-Totales por Agente:', {
                align: 'right',
                columns: 1,
                width: 100,
              });
              doc.y = ymin + i - 15;
              doc.x = 120;
              doc.text(
                utils.formatNumber(
                  subTotalAgenteKgs -
                    utils.parseFloatN(detalles[item].carga_neta)
                ),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i - 15;
              doc.x = 155;
              doc.text(
                subTotalAgentePzas -
                  utils.parseFloatN(detalles[item].nro_piezas),
                {
                  align: 'right',
                  columns: 1,
                  width: 20,
                }
              );

              doc.y = ymin + i - 15;
              doc.x = 200;
              doc.text('P/Guia:', {
                align: 'left',
                columns: 1,
                width: 30,
              });
              doc.y = ymin + i - 15;
              doc.x = 220;
              doc.text(
                utils.formatNumber(
                  (subTotalAgenteEntrega -
                    utils.parseFloatN(detalles[item].comision_entrega)) /
                    countAgente
                ),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );

              doc.y = ymin + i - 15;
              doc.x = 340;
              doc.text('P/Bulto:', {
                align: 'left',
                columns: 1,
                width: 30,
              });
              doc.y = ymin + i - 15;
              doc.x = 360;
              doc.text(
                utils.formatNumber(
                  (subTotalAgenteEntrega -
                    utils.parseFloatN(detalles[item].comision_entrega)) /
                    (subTotalAgentePzas -
                      utils.parseFloatN(detalles[item].nro_piezas))
                ),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );

              doc.y = ymin + i - 15;
              doc.x = 555;
              doc.text(
                utils.formatNumber(
                  subTotalAgenteTotal -
                    utils.parseFloatN(detalles[item].monto_total)
                ),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i - 15;
              doc.x = 627;
              doc.text(
                utils.formatNumber(
                  subTotalAgenteEntrega -
                    utils.parseFloatN(detalles[item].comision_entrega)
                ),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i - 15;
              doc.x = 690;
              doc.text(
                utils.formatNumber(
                  subTotalAgenteSeguro -
                    utils.parseFloatN(detalles[item].comision_seguro)
                ),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );

              if (dolar == 'true') {
                doc.y = ymin + i - 15;
                doc.x = 590;
                doc.text(
                  utils.formatNumber(
                    subTotalAgenteTotalDolar - monto_total_dolar
                  ),
                  {
                    align: 'right',
                    columns: 1,
                    width: 40,
                  }
                );
                doc.y = ymin + i - 15;
                doc.x = 658;
                doc.text(
                  utils.formatNumber(
                    subTotalAgenteEntregaDolar - comision_entrega_dolar
                  ),
                  {
                    align: 'right',
                    columns: 1,
                    width: 40,
                  }
                );
                doc.y = ymin + i - 15;
                doc.x = 720;
                doc.text(
                  utils.formatNumber(
                    subTotalAgenteSeguroDolar - comision_seguro_dolar
                  ),
                  {
                    align: 'right',
                    columns: 1,
                    width: 40,
                  }
                );

                doc.y = ymin + i - 15;
                doc.x = 260;
                doc.text(
                  utils.formatNumber(
                    (subTotalAgenteEntregaDolar - comision_entrega_dolar) /
                      countAgente
                  ) + '$',
                  {
                    align: 'right',
                    columns: 1,
                    width: 40,
                  }
                );
                doc.y = ymin + i - 15;
                doc.x = 400;
                doc.text(
                  utils.formatNumber(
                    (subTotalAgenteEntregaDolar - comision_entrega_dolar) /
                      (subTotalAgentePzas -
                        utils.parseFloatN(detalles[item].nro_piezas))
                  ) + '$',
                  {
                    align: 'right',
                    columns: 1,
                    width: 40,
                  }
                );

                subTotalAgenteTotalDolar = monto_total_dolar;
                subTotalAgenteEntregaDolar = comision_entrega_dolar;
                subTotalAgenteSeguroDolar = comision_seguro_dolar;
              }

              subTotalAgenteKgs = utils.parseFloatN(detalles[item].carga_neta);
              subTotalAgentePzas = utils.parseFloatN(detalles[item].nro_piezas);
              subTotalAgenteTotal = utils.parseFloatN(
                detalles[item].monto_total
              );
              subTotalAgenteEntrega = utils.parseFloatN(
                detalles[item].comision_entrega
              );
              subTotalAgenteSeguro = utils.parseFloatN(
                detalles[item].comision_seguro
              );
              countAgente = 0;
            }

            i += 17;
            if (i >= 340) {
              doc.fontSize(8);
              doc.fillColor('#BLACK');
              doc.addPage();
              page = page + 1;
              doc.switchToPage(page);
              i = 0;
              await this.generateHeader(doc, desde, hasta, dolar, group);
            }
          }
          doc.fontSize(10);
          doc.font('Helvetica-Bold');
          doc.text(detalles[item]['agencias_dest.nb_agencia'], 28, ymin + i);
          i += 17;
        } else {
          //Subtotales por agente
          if (
            item == 0 ||
            detalles[item].cod_agente_entrega !=
              detalles[item - 1].cod_agente_entrega
          ) {
            doc.font('Helvetica-Bold');
            doc.fontSize(7);
            doc.y = ymin + i;
            doc.x = 25;
            doc.text('Sub-Totales por Agente:', {
              align: 'right',
              columns: 1,
              width: 100,
            });
            doc.y = ymin + i;
            doc.x = 120;
            doc.text(
              utils.formatNumber(
                subTotalAgenteKgs - utils.parseFloatN(detalles[item].carga_neta)
              ),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 155;
            doc.text(
              subTotalAgentePzas - utils.parseFloatN(detalles[item].nro_piezas),
              {
                align: 'right',
                columns: 1,
                width: 20,
              }
            );

            doc.y = ymin + i;
            doc.x = 200;
            doc.text('P/Guia:', {
              align: 'left',
              columns: 1,
              width: 30,
            });
            doc.y = ymin + i;
            doc.x = 220;
            doc.text(
              utils.formatNumber(
                (subTotalAgenteEntrega -
                  utils.parseFloatN(detalles[item].comision_entrega)) /
                  countAgente
              ),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );

            doc.y = ymin + i;
            doc.x = 340;
            doc.text('P/Bulto:', {
              align: 'left',
              columns: 1,
              width: 30,
            });
            doc.y = ymin + i;
            doc.x = 360;
            doc.text(
              utils.formatNumber(
                (subTotalAgenteEntrega -
                  utils.parseFloatN(detalles[item].comision_entrega)) /
                  (subTotalAgentePzas -
                    utils.parseFloatN(detalles[item].nro_piezas))
              ),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );

            doc.y = ymin + i;
            doc.x = 555;
            doc.text(
              utils.formatNumber(
                subTotalAgenteTotal -
                  utils.parseFloatN(detalles[item].monto_total)
              ),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 627;
            doc.text(
              utils.formatNumber(
                subTotalAgenteEntrega -
                  utils.parseFloatN(detalles[item].comision_entrega)
              ),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 690;
            doc.text(
              utils.formatNumber(
                subTotalAgenteSeguro -
                  utils.parseFloatN(detalles[item].comision_seguro)
              ),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );

            if (dolar == 'true') {
              doc.y = ymin + i;
              doc.x = 590;
              doc.text(
                utils.formatNumber(
                  subTotalAgenteTotalDolar - monto_total_dolar
                ),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 658;
              doc.text(
                utils.formatNumber(
                  subTotalAgenteEntregaDolar - comision_entrega_dolar
                ),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 720;
              doc.text(
                utils.formatNumber(
                  subTotalAgenteSeguroDolar - comision_seguro_dolar
                ),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );

              doc.y = ymin + i;
              doc.x = 260;
              doc.text(
                utils.formatNumber(
                  (subTotalAgenteEntregaDolar - comision_entrega_dolar) /
                    countAgente
                ) + '$',
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 400;
              doc.text(
                utils.formatNumber(
                  (subTotalAgenteEntregaDolar - comision_entrega_dolar) /
                    (subTotalAgentePzas -
                      utils.parseFloatN(detalles[item].nro_piezas))
                ) + '$',
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );

              subTotalAgenteTotalDolar = monto_total_dolar;
              subTotalAgenteEntregaDolar = comision_entrega_dolar;
              subTotalAgenteSeguroDolar = comision_seguro_dolar;
            }

            subTotalAgenteKgs = utils.parseFloatN(detalles[item].carga_neta);
            subTotalAgentePzas = utils.parseFloatN(detalles[item].nro_piezas);
            subTotalAgenteTotal = utils.parseFloatN(detalles[item].monto_total);
            subTotalAgenteEntrega = utils.parseFloatN(
              detalles[item].comision_entrega
            );
            subTotalAgenteSeguro = utils.parseFloatN(
              detalles[item].comision_seguro
            );
            countAgente = 0;

            i += 17;
          }
        }

        if (
          item == 0 ||
          detalles[item].cod_agente_entrega !=
            detalles[item - 1].cod_agente_entrega
        ) {
          doc.fontSize(10);
          doc.font('Helvetica');
          doc.fillColor('#444444');
          doc.text(
            'Agente de Entrega: ' +
              detalles[item]['agentes_entrega.persona_responsable'],
            28,
            ymin + i
          );
          doc.text(
            '% Com. Entrega: ' +
              utils.formatNumber(
                detalles[item]['agentes_entrega.porc_comision_entrega']
              ),
            280,
            ymin + i
          );
          doc.text(
            '% Com. Seguro: ' +
              utils.formatNumber(
                detalles[item]['agentes_entrega.porc_comision_seguro']
              ),
            450,
            ymin + i
          );
          i += 17;
        }

        doc.font('Helvetica');
        doc.fillColor('#444444');
        doc.fontSize(8);

        doc.y = ymin + i;
        doc.x = 26;
        doc.text(item + 1, {
          align: 'left',
          columns: 1,
          width: 20,
        });
        doc.y = ymin + i;
        doc.x = 42;
        doc.text(detalles[item].nro_documento, {
          align: 'center',
          columns: 1,
          width: 45,
        });
        doc.y = ymin + i;
        doc.x = 90;
        doc.text(moment(detalles[item].fecha_emision).format('DD/MM/YYYY'), {
          align: 'center',
          columns: 1,
          width: 45,
        });
        doc.y = ymin + i;
        doc.x = 120;
        doc.text(utils.formatNumber(detalles[item].carga_neta), {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i;
        doc.x = 155;
        doc.text(detalles[item].nro_piezas, {
          align: 'right',
          columns: 1,
          width: 20,
        });

        let fecha_envio = moment(detalles[item].fecha_envio);
        if (detalles[item].fecha_envio_costo) {
          fecha_envio = moment(detalles[item].fecha_envio_costo, 'YYYY-MM-DD');
        }
        doc.y = ymin + i;
        doc.x = 179;
        doc.text(fecha_envio.format('DD/MM/YYYY'), {
          align: 'center',
          columns: 1,
          width: 45,
        });

        let fecha_recepcion = moment(detalles[item].fecha_recepcion);
        doc.y = ymin + i;
        doc.x = 226;
        doc.text(fecha_recepcion.format('DD/MM/YYYY'), {
          align: 'center',
          columns: 1,
          width: 45,
        });
        doc.y = ymin + i;
        doc.x = 258;
        doc.text(fecha_recepcion.diff(fecha_envio, 'days'), {
          align: 'center',
          columns: 1,
          width: 45,
        });
        doc.y = ymin + i;
        doc.x = 278;
        doc.text(detalles[item]['agencias.ciudades.siglas'], {
          align: 'center',
          columns: 1,
          width: 45,
        });

        let cliente_desc = detalles[item].cliente_dest_desc;
        if (detalles[item].pagado_en == 'O') {
          cliente_desc = detalles[item].cliente_orig_desc;
        }

        doc.y = ymin + i;
        doc.x = 315;
        doc.text(utils.truncate(cliente_desc, 41), {
          align: 'left',
          columns: 1,
          width: 200,
        });

        doc.y = ymin + i;
        doc.x = 505;
        doc.text(
          estatus_operativo.find(
            (estatus) => estatus.value == detalles[item].estatus_operativo
          ).label,
          {
            align: 'center',
            columns: 1,
            width: 60,
          }
        );
        doc.y = ymin + i;
        doc.x = 555;
        doc.text(utils.formatNumber(detalles[item].monto_total), {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i;
        doc.x = 627;
        doc.text(utils.formatNumber(detalles[item].comision_entrega), {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i;
        doc.x = 690;
        doc.text(utils.formatNumber(detalles[item].comision_seguro), {
          align: 'right',
          columns: 1,
          width: 40,
        });

        if (dolar == 'true') {
          doc.y = ymin + i;
          doc.x = 590;
          doc.text(utils.formatNumber(monto_total_dolar), {
            align: 'right',
            columns: 1,
            width: 40,
          });

          doc.y = ymin + i;
          doc.x = 658;
          doc.text(utils.formatNumber(comision_entrega_dolar), {
            align: 'right',
            columns: 1,
            width: 40,
          });

          doc.y = ymin + i;
          doc.x = 720;
          doc.text(utils.formatNumber(comision_seguro_dolar), {
            align: 'right',
            columns: 1,
            width: 40,
          });
        }

        i += 15;
        if (i >= 380) {
          doc.fillColor('#BLACK');
          doc.addPage();
          page = page + 1;
          doc.switchToPage(page);
          i = 0;
          await this.generateHeader(doc, desde, hasta, dolar, group);
        }
      }
    }

    if (group == 'true') {
      doc.font('Helvetica');
      doc.fillColor('#444444');
      doc.y = ymin + i;
      doc.x = 45;
      doc.text(
        detalles[detalles.length - 1]['agentes_entrega.persona_responsable'],
        {
          align: 'left',
          columns: 1,
          width: 150,
        }
      );
      doc.y = ymin + i;
      doc.x = 166;
      doc.text(
        utils.formatNumber(
          detalles[detalles.length - 1]['agentes_entrega.porc_comision_entrega']
        ),
        {
          align: 'center',
          columns: 1,
          width: 30,
        }
      );
      doc.y = ymin + i;
      doc.x = 205;
      doc.text(
        utils.formatNumber(
          detalles[detalles.length - 1]['agentes_entrega.porc_comision_seguro']
        ),
        {
          align: 'center',
          columns: 1,
          width: 30,
        }
      );

      doc.y = ymin + i;
      doc.x = 237;
      doc.text(utils.formatNumber(subTotalAgenteKgs), {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 275;
      doc.text(subTotalAgentePzas, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 310;
      doc.text(utils.formatNumber(subTotalAgenteTotal), {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 410;
      doc.text(utils.formatNumber(subTotalAgenteEntrega), {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 506;
      doc.text(utils.formatNumber(subTotalAgenteSeguro), {
        align: 'right',
        columns: 1,
        width: 40,
      });

      if (dolar == 'true') {
        doc.y = ymin + i;
        doc.x = 353;
        doc.text(utils.formatNumber(subTotalAgenteTotalDolar), {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i;
        doc.x = 456;
        doc.text(utils.formatNumber(subTotalAgenteEntregaDolar), {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i;
        doc.x = 550;
        doc.text(utils.formatNumber(subTotalAgenteSeguroDolar), {
          align: 'right',
          columns: 1,
          width: 40,
        });
      }

      i += 17;

      // Subtotales por Agencia Finales
      doc.font('Helvetica-Bold');
      doc.text('Totales por Agencia', 140, ymin + i);

      doc.y = ymin + i;
      doc.x = 237;
      doc.text(utils.formatNumber(subTotalAgenciaKgs), {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 275;
      doc.text(subTotalAgenciaPzas, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 310;
      doc.text(utils.formatNumber(subTotalAgenciaTotal), {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 410;
      doc.text(utils.formatNumber(subTotalAgenciaEntrega), {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 506;
      doc.text(utils.formatNumber(subTotalAgenciaSeguro), {
        align: 'right',
        columns: 1,
        width: 40,
      });

      if (dolar == 'true') {
        doc.y = ymin + i;
        doc.x = 353;
        doc.text(utils.formatNumber(subTotalAgenciaTotalDolar), {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i;
        doc.x = 456;
        doc.text(utils.formatNumber(subTotalAgenciaEntregaDolar), {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i;
        doc.x = 550;
        doc.text(utils.formatNumber(subTotalAgenciaSeguroDolar), {
          align: 'right',
          columns: 1,
          width: 40,
        });
      }

      i += 17;

      // Totales Generales
      doc.font('Helvetica-Bold');
      doc.text('Total General', 140, ymin + i);

      doc.y = ymin + i;
      doc.x = 237;
      doc.text(utils.formatNumber(totalGeneralKgs), {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 275;
      doc.text(totalGeneralPzas, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 310;
      doc.text(utils.formatNumber(totalGeneralTotal), {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 410;
      doc.text(utils.formatNumber(totalGeneralEntrega), {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 506;
      doc.text(utils.formatNumber(totalGeneralSeguro), {
        align: 'right',
        columns: 1,
        width: 40,
      });

      if (dolar == 'true') {
        doc.y = ymin + i;
        doc.x = 353;
        doc.text(utils.formatNumber(totalGeneralTotalDolar), {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i;
        doc.x = 456;
        doc.text(utils.formatNumber(totalGeneralEntregaDolar), {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i;
        doc.x = 550;
        doc.text(utils.formatNumber(totalGeneralSeguroDolar), {
          align: 'right',
          columns: 1,
          width: 40,
        });
      }
    } else {
      doc.font('Helvetica-Bold');
      doc.fontSize(7);

      //Subtotales por agente Finales
      doc.y = ymin + i;
      doc.x = 25;
      doc.text('Sub-Totales por Agente:', {
        align: 'right',
        columns: 1,
        width: 100,
      });
      doc.y = ymin + i;
      doc.x = 120;
      doc.text(utils.formatNumber(subTotalAgenteKgs), {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 155;
      doc.text(subTotalAgentePzas, {
        align: 'right',
        columns: 1,
        width: 20,
      });

      doc.y = ymin + i;
      doc.x = 200;
      doc.text('P/Guia:', {
        align: 'left',
        columns: 1,
        width: 30,
      });
      doc.y = ymin + i;
      doc.x = 220;
      doc.text(utils.formatNumber(subTotalAgenteEntrega / (countAgente + 1)), {
        align: 'right',
        columns: 1,
        width: 40,
      });

      doc.y = ymin + i;
      doc.x = 340;
      doc.text('P/Bulto:', {
        align: 'left',
        columns: 1,
        width: 30,
      });
      doc.y = ymin + i;
      doc.x = 360;
      doc.text(utils.formatNumber(subTotalAgenteEntrega / subTotalAgentePzas), {
        align: 'right',
        columns: 1,
        width: 40,
      });

      doc.y = ymin + i;
      doc.x = 555;
      doc.text(utils.formatNumber(subTotalAgenteTotal), {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 627;
      doc.text(utils.formatNumber(subTotalAgenteEntrega), {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 690;
      doc.text(utils.formatNumber(subTotalAgenteSeguro), {
        align: 'right',
        columns: 1,
        width: 40,
      });

      if (dolar == 'true') {
        doc.y = ymin + i;
        doc.x = 590;
        doc.text(utils.formatNumber(subTotalAgenteTotalDolar), {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i;
        doc.x = 658;
        doc.text(utils.formatNumber(subTotalAgenteEntregaDolar), {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i;
        doc.x = 720;
        doc.text(utils.formatNumber(subTotalAgenteSeguroDolar), {
          align: 'right',
          columns: 1,
          width: 40,
        });

        doc.y = ymin + i;
        doc.x = 260;
        doc.text(
          utils.formatNumber(subTotalAgenteEntregaDolar / (countAgente + 1)) +
            '$',
          {
            align: 'right',
            columns: 1,
            width: 40,
          }
        );
        doc.y = ymin + i;
        doc.x = 400;
        doc.text(
          utils.formatNumber(subTotalAgenteEntregaDolar / subTotalAgentePzas) +
            '$',
          {
            align: 'right',
            columns: 1,
            width: 40,
          }
        );
      }

      //Subtotales por agencia Finales
      i += 15;
      doc.y = ymin + i;
      doc.x = 25;
      doc.text('Sub-Totales por Agencia:', {
        align: 'right',
        columns: 1,
        width: 100,
      });
      doc.y = ymin + i;
      doc.x = 120;
      doc.text(utils.formatNumber(subTotalAgenciaKgs), {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 155;
      doc.text(subTotalAgenciaPzas, {
        align: 'right',
        columns: 1,
        width: 20,
      });

      doc.y = ymin + i;
      doc.x = 200;
      doc.text('P/Guia:', {
        align: 'left',
        columns: 1,
        width: 30,
      });
      doc.y = ymin + i;
      doc.x = 220;
      doc.text(
        utils.formatNumber(subTotalAgenciaEntrega / (countAgencia + 1)),
        {
          align: 'right',
          columns: 1,
          width: 40,
        }
      );

      doc.y = ymin + i;
      doc.x = 340;
      doc.text('P/Bulto:', {
        align: 'left',
        columns: 1,
        width: 30,
      });
      doc.y = ymin + i;
      doc.x = 360;
      doc.text(
        utils.formatNumber(subTotalAgenciaEntrega / subTotalAgenciaPzas),
        {
          align: 'right',
          columns: 1,
          width: 40,
        }
      );

      doc.y = ymin + i;
      doc.x = 555;
      doc.text(utils.formatNumber(subTotalAgenciaTotal), {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 627;
      doc.text(utils.formatNumber(subTotalAgenciaEntrega), {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 690;
      doc.text(utils.formatNumber(subTotalAgenciaSeguro), {
        align: 'right',
        columns: 1,
        width: 40,
      });

      if (dolar == 'true') {
        doc.y = ymin + i;
        doc.x = 590;
        doc.text(utils.formatNumber(subTotalAgenciaTotalDolar), {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i;
        doc.x = 658;
        doc.text(utils.formatNumber(subTotalAgenciaEntregaDolar), {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i;
        doc.x = 720;
        doc.text(utils.formatNumber(subTotalAgenciaSeguroDolar), {
          align: 'right',
          columns: 1,
          width: 40,
        });

        doc.y = ymin + i;
        doc.x = 260;
        doc.text(
          utils.formatNumber(subTotalAgenciaEntregaDolar / (countAgencia + 1)) +
            '$',
          {
            align: 'right',
            columns: 1,
            width: 40,
          }
        );
        doc.y = ymin + i;
        doc.x = 400;
        doc.text(
          utils.formatNumber(
            subTotalAgenciaEntregaDolar / subTotalAgenciaPzas
          ) + '$',
          {
            align: 'right',
            columns: 1,
            width: 40,
          }
        );
      }

      //Totales Generales
      i += 15;
      doc.y = ymin + i;
      doc.x = 25;
      doc.text('Total General:', {
        align: 'right',
        columns: 1,
        width: 100,
      });
      doc.y = ymin + i;
      doc.x = 120;
      doc.text(utils.formatNumber(totalGeneralKgs), {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 155;
      doc.text(totalGeneralPzas, {
        align: 'right',
        columns: 1,
        width: 20,
      });

      doc.y = ymin + i;
      doc.x = 200;
      doc.text('P/Guia:', {
        align: 'left',
        columns: 1,
        width: 30,
      });
      doc.y = ymin + i;
      doc.x = 220;
      doc.text(utils.formatNumber(totalGeneralEntrega / detalles.length), {
        align: 'right',
        columns: 1,
        width: 40,
      });

      doc.y = ymin + i;
      doc.x = 340;
      doc.text('P/Bulto:', {
        align: 'left',
        columns: 1,
        width: 30,
      });
      doc.y = ymin + i;
      doc.x = 360;
      doc.text(utils.formatNumber(totalGeneralEntrega / totalGeneralPzas), {
        align: 'right',
        columns: 1,
        width: 40,
      });

      doc.y = ymin + i;
      doc.x = 555;
      doc.text(utils.formatNumber(totalGeneralTotal), {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 627;
      doc.text(utils.formatNumber(totalGeneralEntrega), {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 690;
      doc.text(utils.formatNumber(totalGeneralSeguro), {
        align: 'right',
        columns: 1,
        width: 40,
      });

      if (dolar == 'true') {
        doc.y = ymin + i;
        doc.x = 590;
        doc.text(utils.formatNumber(totalGeneralTotalDolar), {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i;
        doc.x = 658;
        doc.text(utils.formatNumber(totalGeneralEntregaDolar), {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i;
        doc.x = 720;
        doc.text(utils.formatNumber(totalGeneralSeguroDolar), {
          align: 'right',
          columns: 1,
          width: 40,
        });

        doc.y = ymin + i;
        doc.x = 260;
        doc.text(
          utils.formatNumber(totalGeneralEntregaDolar / detalles.length) + '$',
          {
            align: 'right',
            columns: 1,
            width: 40,
          }
        );
        doc.y = ymin + i;
        doc.x = 400;
        doc.text(
          utils.formatNumber(totalGeneralEntregaDolar / totalGeneralPzas) + '$',
          {
            align: 'right',
            columns: 1,
            width: 40,
          }
        );
      }
    }

    var end;
    const range = doc.bufferedPageRange();
    for (
      i = range.start, end = range.start + range.count, range.start <= end;
      i < end;
      i++
    ) {
      doc.switchToPage(i);
      doc.fontSize(group == 'true' ? 8 : 9);
      doc.fillColor('#444444');
      doc.x = group == 'true' ? 485 : 655;
      doc.y = 50;
      doc.text(`Pagina ${i + 1} de ${range.count}`, {
        align: 'right',
        columns: 1,
        width: 100,
      });
    }
  }
}

module.exports = ComisionesService;
