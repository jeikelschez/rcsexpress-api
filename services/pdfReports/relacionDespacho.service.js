const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

const clienteOrigDesc =
  '(CASE WHEN (ci_rif_cte_conta_org IS NULL || ci_rif_cte_conta_org = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `Mmovimientos`.cod_cliente_org = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `Mmovimientos`.cod_agencia = clientes_particulares.cod_agencia' +
  ' AND `Mmovimientos`.cod_cliente_org = clientes_particulares.cod_cliente' +
  ' AND `Mmovimientos`.ci_rif_cte_conta_org = clientes_particulares.rif_ci' +
  ' AND clientes_particulares.estatus = "A" LIMIT 1)' +
  ' END)';
const clienteDestDesc =
  '(CASE WHEN (ci_rif_cte_conta_dest IS NULL || ci_rif_cte_conta_dest = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `Mmovimientos`.cod_cliente_dest = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `Mmovimientos`.cod_agencia_dest = clientes_particulares.cod_agencia' +
  ' AND `Mmovimientos`.cod_cliente_dest = clientes_particulares.cod_cliente' +
  ' AND `Mmovimientos`.ci_rif_cte_conta_dest = clientes_particulares.rif_ci' +
  ' AND clientes_particulares.estatus = "A" LIMIT 1)' +
  ' END)';

class RelacionDespachoService {
  async mainReport(doc, data, detalle) {
    data = JSON.parse(data);
    let dataDetalle = await models.Mmovimientos.findAll({
      where: {
        nro_documento: {
          [Sequelize.Op.in]: detalle.split(','),
        },
      },
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
          model: models.Agencias,
          as: 'agencias_dest',
          include: {
            model: models.Ciudades,
            as: 'ciudades',
          },
        },
        {
          model: models.Zonas,
          as: 'zonas_dest',
        },
      ],
      attributes: {
        include: [
          [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
          [Sequelize.literal(clienteDestDesc), 'cliente_dest_desc'],
        ],
      },
      order: JSON.parse(data.sortBy),
      raw: true,
    });
    await this.generateHeader(doc, data);
    await this.generateCustomerInformation(doc, data, dataDetalle);
    return true;
  }

  async generateHeader(doc, data) {
    doc
      .image('./img/logo_rc.png', 50, 45, { width: 50 })
      .fillColor('#444444')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('RCS Express, S.A', 110, 95)
      .text('R.I.F. J-31028463-6', 110, 110)
      .text('Fecha: ' + moment().format('DD/MM/YYYY'), 640, 53)
      .fontSize(10);
    doc.y = 90;
    doc.x = 590;
    doc.text('Autorizado Por: ' + data.usuario, {
      align: 'right',
      columns: 1,
      width: 150,
    });
    doc.y = 105;
    doc.x = 590;
    doc.text('Impreso Por: ' + data.usuario, {
      align: 'right',
      columns: 1,
      width: 150,
    });
    doc.fontSize(19);
    doc.y = 60;
    doc.x = 150;
    doc.text(data.nombreReporte, {
      align: 'center',
      columns: 1,
      width: 490,
    });
    doc.fontSize(13);
    doc.y = 90;
    doc.x = 240;
    doc.text(data.agencia, {
      align: 'center',
      columns: 1,
      width: 300,
    });
    doc.text('Desde: ' + data.fecha_desde, 270, 110);
    doc.text('Hasta: ' + data.fecha_hasta, 400, 110);
    doc.moveDown();
    doc.fontSize(9);
    doc.y = 146;
    doc.x = 63;
    doc.fillColor('black');
    doc.text('DATOS DEL DOCUMENTO', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.fontSize(8);
    doc.y = 166;
    doc.x = 43;
    doc.fillColor('black');
    doc.text('Guia', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.y = 166;
    doc.x = 75;
    doc.fillColor('black');
    doc.text('Emision', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.y = 166;
    doc.x = 118;
    doc.fillColor('black');
    doc.text('O.', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.y = 166;
    doc.x = 138;
    doc.fillColor('black');
    doc.text('D.', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.y = 166;
    doc.x = 160;
    doc.fillColor('black');
    doc.text('Zona D.', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.y = 166;
    doc.x = 195;
    doc.fillColor('black');
    doc.text('Piezas.', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.y = 166;
    doc.x = 226;
    doc.fillColor('black');
    doc.text(data.neta == 'N' ? 'Neto' : 'Kgs.', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    if (data.dolar) {
      doc.fillColor('black');
      doc.y = 146;
      doc.x = 337;
      doc.fillColor('black');
      doc.text('CLIENTE', {
        paragraphGap: 5,
        indent: 5,
        align: 'justify',
        columns: 1,
      });
      doc.y = 146;
      doc.x = 590;
      doc.fillColor('black');
      doc.text('MODALIDAD DE PAGO', {
        paragraphGap: 5,
        indent: 5,
        align: 'justify',
        columns: 1,
      });
      doc.y = 146;
      doc.x = 475;
      doc.fillColor('black');
      doc.text('VALOR DECLARADO', {
        paragraphGap: 5,
        indent: 5,
        align: 'justify',
        columns: 1,
      });
      doc.y = 158;
      doc.x = 732;
      doc.fillColor('black');
      doc.text('$', {
        paragraphGap: 5,
        indent: 5,
        align: 'justify',
        columns: 1,
      });
      doc.y = 166;
      doc.x = 255;
      doc.text('Remitente', {
        paragraphGap: 5,
        indent: 5,
        align: 'justify',
        columns: 1,
      });
      doc.y = 166;
      doc.x = 367;
      doc.fillColor('black');
      doc.text('Destinatario', {
        paragraphGap: 5,
        indent: 5,
        align: 'justify',
        columns: 1,
      });
      doc.y = 166;
      doc.x = 484;
      doc.fillColor('black');
      doc.text('Bolivares');
      doc.y = 166;
      doc.x = 545;
      doc.fillColor('black');
      doc.text('$');
      doc.y = 166;
      doc.x = 577;
      doc.fillColor('black');
      doc.text('Origen');
      doc.y = 166;
      doc.x = 610;
      doc.fillColor('black');
      doc.text('Destino');
      doc.y = 166;
      doc.x = 656;
      doc.fillColor('black');
      doc.text('Origen');
      doc.y = 166;
      doc.x = 688;
      doc.fillColor('black');
      doc.text('Destino');
      doc.y = 189;
      doc.x = 50;
      doc.fillColor('black');
      doc.fontSize(6);
      doc.lineJoin('miter').rect(35, 140, 217, 20).stroke();
      doc.lineJoin('miter').rect(252, 140, 220, 20).stroke();
      doc.lineJoin('miter').rect(472, 140, 97, 20).stroke();
      doc.lineJoin('miter').rect(569, 140, 155, 20).stroke();
      doc.lineJoin('miter').rect(724, 140, 30, 40).stroke();
      doc.lineJoin('miter').rect(35, 160, 217, 20).stroke();
      doc.lineJoin('miter').rect(252, 160, 220, 20).stroke();
      doc.lineJoin('miter').rect(472, 160, 97, 20).stroke();
      doc.lineJoin('miter').rect(569, 160, 80, 20).stroke();
      doc.lineJoin('miter').rect(649, 160, 75, 20).stroke();
    } else {
      doc.fillColor('black');
      doc.y = 146;
      doc.x = 346;
      doc.fillColor('black');
      doc.text('CLIENTE', {
        paragraphGap: 5,
        indent: 5,
        align: 'justify',
        columns: 1,
      });
      doc.y = 146;
      doc.x = 590;
      doc.fillColor('black');
      doc.text('MODALIDAD DE PAGO', {
        paragraphGap: 5,
        indent: 5,
        align: 'justify',
        columns: 1,
      });
      doc.y = 166;
      doc.x = 255;
      doc.text('Remitente', {
        paragraphGap: 5,
        indent: 5,
        align: 'justify',
        columns: 1,
      });
      doc.y = 166;
      doc.x = 384;
      doc.fillColor('black');
      doc.text('Destinatario', {
        paragraphGap: 5,
        indent: 5,
        align: 'justify',
        columns: 1,
      });
      doc.y = 166;
      doc.x = 555;
      doc.fillColor('black');
      doc.text('Origen');
      doc.y = 166;
      doc.x = 604;
      doc.fillColor('black');
      doc.text('Destino');
      doc.y = 166;
      doc.x = 660;
      doc.fillColor('black');
      doc.text('Origen');
      doc.y = 166;
      doc.x = 705;
      doc.fillColor('black');
      doc.text('Destino');
      doc.y = 189;
      doc.x = 50;
      doc.fillColor('black');
      doc.fontSize(6);
      doc.lineJoin('miter').rect(35, 140, 217, 20).stroke();
      doc.lineJoin('miter').rect(252, 140, 293, 20).stroke();
      doc.lineJoin('miter').rect(545, 140, 209, 20).stroke();
      doc.lineJoin('miter').rect(35, 160, 217, 20).stroke();
      doc.lineJoin('miter').rect(252, 160, 293, 20).stroke();
      doc.lineJoin('miter').rect(545, 160, 105, 20).stroke();
      doc.lineJoin('miter').rect(649, 160, 105, 20).stroke();
    }
  }

  async generateCustomerInformation(doc, data, detalle) {
    var i = 0;
    var page = 0;
    var ymin = 190;

    let credito_orig = 0;
    let credito_dest = 0;
    let contado_orig = 0;
    let contado_dest = 0;
    let total_dolar = 0;
    let total_declarado = 0;
    let total_declarado_dolar = 0;
    let nro_piezas = 0;
    let peso_kgs = 0;
    let carga_neta = 0;

    let group_len = 0;
    let group_piezas = 0;
    let group_neta = 0;
    let group_kgs = 0;
    let credito_orig_group = 0;
    let credito_dest_group = 0;
    let contado_orig_group = 0;
    let contado_dest_group = 0;
    let total_dolar_group = 0;
    let total_declarado_group = 0;
    let total_declarado_dolar_group = 0;
    let total;

    let hDolar = await models.Hdolar.findAll({
      where: {
        fecha: {
          [Sequelize.Op.between]: [
            moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
          ],
        },
      },
      raw: true,
    });

    for (var item = 0; item < detalle.length; item++) {
      let monto_total = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        currencyDisplay: 'code',
      })
        .format(detalle[item].monto_total)
        .replace('EUR', '')
        .trim();

      nro_piezas += utils.parseFloatN(detalle[item].nro_piezas);
      peso_kgs += utils.parseFloatN(detalle[item].peso_kgs);
      carga_neta += utils.parseFloatN(detalle[item].carga_neta);

      if (detalle[item].modalidad_pago == 'CR') {
        if (detalle[item].pagado_en == 'O') {
          credito_orig += utils.parseFloatN(detalle[item].monto_total);
        } else {
          credito_dest += utils.parseFloatN(detalle[item].monto_total);
        }
      } else {
        if (detalle[item].pagado_en == 'O') {
          contado_orig += utils.parseFloatN(detalle[item].monto_total);
        } else {
          contado_dest += utils.parseFloatN(detalle[item].monto_total);
        }
      }

      let label;
      let field;
      let valor_dolar = 0;
      let monto_dolar = 0;
      let declarado_dolar = 0;

      let find_dolar = hDolar.findIndex(
        (arr) => arr.fecha == detalle[item].fecha_emision
      );
      if (find_dolar >= 0) valor_dolar = hDolar[find_dolar].valor;

      if (valor_dolar > 0) {
        monto_dolar = (
          utils.parseFloatN(detalle[item].monto_total) /
          utils.parseFloatN(valor_dolar)
        ).toFixed(2);
      }

      total_dolar += utils.parseFloatN(monto_dolar);
      total_declarado += utils.parseFloatN(detalle[item].monto_ref_cte_sin_imp);

      if (valor_dolar > 0) {
        declarado_dolar = (
          utils.parseFloatN(detalle[item].monto_ref_cte_sin_imp) /
          utils.parseFloatN(valor_dolar)
        ).toFixed(2);
      }
      total_declarado_dolar += utils.parseFloatN(declarado_dolar);

      if (data.tipoReporte == 'APZ') {
        label = 'Zona Destino: ';
        field = 'zonas_dest.nb_zona';
        total = 'Total por Zona: ';
      } else if (data.tipoReporte == 'MAD') {
        label = 'Agencia Destino: ';
        field = 'agencias_dest.nb_agencia';
        total = 'Total por Agencia: ';
      }

      if (data.tipoReporte == 'APZ' || data.tipoReporte == 'MAD') {
        if (item == 0) {
          // Aqui pinto el primer encabezado
          doc.fontSize(9);
          doc.y = ymin + i;
          doc.x = 42;
          doc.text(label + detalle[item][field], {
            align: 'left',
            columns: 1,
            width: 500,
          });
          i += 15;
        } else if (detalle[item][field] != detalle[item - 1][field]) {
          // Aqui pinto los totales del agrupado
          i += 5;
          doc.y = ymin + i;
          doc.x = 28;
          doc.text(total + group_len, {
            align: 'center',
            columns: 1,
            width: 70,
          });
          doc.y = ymin + i;
          doc.x = 161;
          doc.text('Total Piezas: ' + group_piezas, {
            align: 'center',
            columns: 1,
            width: 67,
          });
          doc.y = ymin + i;
          doc.x = 210;
          if (data.neta == 'N') {
            doc.text(
              'Total Neto: ' +
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(group_neta)
                  .replace('EUR', '')
                  .trim(),
              {
                align: 'center',
                columns: 1,
                width: 105,
              }
            );
          } else {
            doc.text(
              'Total Kgs: ' +
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(group_kgs)
                  .replace('EUR', '')
                  .trim(),
              {
                align: 'center',
                columns: 1,
                width: 105,
              }
            );
          }

          if (data.visible == 'V') {
            if (data.dolar) {
              doc.y = ymin + i;
              doc.x = 480;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(total_declarado_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 522;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(total_declarado_dolar_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 565;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(credito_orig_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 600;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(credito_dest_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 645;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(contado_orig_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 680;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(contado_dest_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 713;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(total_dolar_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
            } else {
              doc.y = ymin + i;
              doc.x = 552;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(credito_orig_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 596;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(credito_dest_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 657;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(contado_orig_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 705;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(contado_dest_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
            }
          }

          i += 15;
          group_len = 0;
          group_piezas = 0;
          group_neta = 0;
          group_kgs = 0;
          credito_orig_group = 0;
          credito_dest_group = 0;
          contado_orig_group = 0;
          contado_dest_group = 0;
          total_dolar_group = 0;
          total_declarado_group = 0;
          total_declarado_dolar_group = 0;

          // Aqui pinto el encabezado del agrupado
          doc.fontSize(9);
          doc.y = ymin + i;
          doc.x = 42;
          doc.text(label + detalle[item][field], {
            align: 'left',
            columns: 1,
            width: 500,
          });
          i += 15;
        }
        doc.fontSize(6);
      }
      group_len++;
      group_piezas += utils.parseFloatN(detalle[item].nro_piezas);
      group_neta += utils.parseFloatN(detalle[item].carga_neta);
      group_kgs += utils.parseFloatN(detalle[item].peso_kgs);

      if (detalle[item].modalidad_pago == 'CR') {
        if (detalle[item].pagado_en == 'O') {
          credito_orig_group += utils.parseFloatN(detalle[item].monto_total);
        } else {
          credito_dest_group += utils.parseFloatN(detalle[item].monto_total);
        }
      } else {
        if (detalle[item].pagado_en == 'O') {
          contado_orig_group += utils.parseFloatN(detalle[item].monto_total);
        } else {
          contado_dest_group += utils.parseFloatN(detalle[item].monto_total);
        }
      }

      let declarado_dolar_group = 0;
      total_dolar_group += utils.parseFloatN(monto_dolar);
      total_declarado_group += utils.parseFloatN(
        detalle[item].monto_ref_cte_sin_imp
      );
      if (valor_dolar > 0) {
        declarado_dolar_group = (
          utils.parseFloatN(detalle[item].monto_ref_cte_sin_imp) /
          utils.parseFloatN(valor_dolar)
        ).toFixed(2);
      }

      total_declarado_dolar_group += utils.parseFloatN(declarado_dolar_group);

      doc.y = ymin + i;
      doc.x = 33;
      doc.text(detalle[item].nro_documento, {
        align: 'center',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 75;
      doc.text(moment(detalle[item].fecha_emision).format('DD/MM/YYYY'), {
        align: 'center',
        columns: 1,
        width: 47,
      });
      doc.y = ymin + i;
      doc.x = 95;
      doc.text(detalle[item]['agencias.ciudades.siglas'], {
        align: 'center',
        columns: 1,
        width: 67,
      });
      doc.y = ymin + i;
      doc.x = 115;
      doc.text(detalle[item]['agencias_dest.ciudades.siglas'], {
        align: 'center',
        columns: 1,
        width: 67,
      });
      doc.y = ymin + i;
      doc.x = 160;
      doc.text(
        detalle[item]['zonas_dest.nb_zona']
          ? detalle[item]['zonas_dest.nb_zona'].substring(0, 14)
          : ''
      );
      doc.y = ymin + i;
      doc.x = 185;
      doc.text(detalle[item].nro_piezas, {
        align: 'right',
        columns: 1,
        width: 40,
      });

      if (data.neta == 'N') {
        doc.y = ymin + i;
        doc.x = 210;
        doc.text(detalle[item].carga_neta, {
          align: 'right',
          columns: 1,
          width: 40,
        });
      } else if (data.neta == 'K') {
        doc.y = ymin + i;
        doc.x = 210;
        doc.text(detalle[item].peso_kgs, {
          align: 'right',
          columns: 1,
          width: 40,
        });
      } else {
        doc.y = ymin + i;
        doc.x = 210;
        doc.text(detalle[item].peso_kgs, {
          align: 'right',
          columns: 1,
          width: 40,
        });
      }

      if (data.dolar) {
        doc.y = ymin + i;
        doc.x = 260;
        doc.text(
          detalle[item].cliente_orig_desc
            ? detalle[item].cliente_orig_desc.substring(0, 30)
            : '',
          {
            align: 'left',
            columns: 1,
            width: 150,
          }
        );
        doc.y = ymin + i;
        doc.x = 370;
        if (detalle[item].cliente_dest_desc) {
          doc.text(
            detalle[item].cliente_dest_desc
              ? detalle[item].cliente_dest_desc.substring(0, 27)
              : '',
            {
              align: 'left',
              columns: 1,
              width: 150,
            }
          );
        }

        if (data.visible == 'V') {
          doc.y = ymin + i;
          doc.x = 480;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(detalle[item].monto_ref_cte_sin_imp)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = ymin + i;
          doc.x = 522;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(declarado_dolar)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = ymin + i;
          doc.x = 565;
          doc.text(
            detalle[item].modalidad_pago == 'CR' &&
              detalle[item].pagado_en == 'O'
              ? monto_total
              : '0,00',
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = ymin + i;
          doc.x = 600;
          doc.text(
            detalle[item].modalidad_pago == 'CR' &&
              detalle[item].pagado_en == 'D'
              ? monto_total
              : '0,00',
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = ymin + i;
          doc.x = 645;
          doc.text(
            detalle[item].modalidad_pago == 'CO' &&
              detalle[item].pagado_en == 'O'
              ? monto_total
              : '0,00',
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = ymin + i;
          doc.x = 680;
          doc.text(
            detalle[item].modalidad_pago == 'CO' &&
              detalle[item].pagado_en == 'D'
              ? monto_total
              : '0,00',
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = ymin + i;
          doc.x = 712;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(monto_dolar)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
        }
      } else {
        doc.y = ymin + i;
        doc.x = 260;
        doc.text(
          detalle[item].cliente_orig_desc
            ? detalle[item].cliente_orig_desc.substring(0, 30)
            : '',
          {
            align: 'left',
            columns: 1,
            width: 150,
          }
        );
        doc.y = ymin + i;
        doc.x = 390;
        if (detalle[item].cliente_dest_desc) {
          doc.text(
            detalle[item].cliente_dest_desc
              ? detalle[item].cliente_dest_desc.substring(0, 30)
              : '',
            {
              align: 'left',
              columns: 1,
              width: 150,
            }
          );
        }

        if (data.visible == 'V') {
          doc.y = ymin + i;
          doc.x = 552;
          doc.text(
            detalle[item].modalidad_pago == 'CR' &&
              detalle[item].pagado_en == 'O'
              ? monto_total
              : '0,00',
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = ymin + i;
          doc.x = 596;
          doc.text(
            detalle[item].modalidad_pago == 'CR' &&
              detalle[item].pagado_en == 'D'
              ? monto_total
              : '0,00',
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = ymin + i;
          doc.x = 657;
          doc.text(
            detalle[item].modalidad_pago == 'CO' &&
              detalle[item].pagado_en == 'O'
              ? monto_total
              : '0,00',
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = ymin + i;
          doc.x = 705;
          doc.text(
            detalle[item].modalidad_pago == 'CO' &&
              detalle[item].pagado_en == 'D'
              ? monto_total
              : '0,00',
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
        }
      }

      i += 9;
      if (i >= 290 || item >= detalle.length - 1) {
        doc.lineJoin('square').rect(35, 500, 350, 75).stroke();
        doc.fontSize(12);
        doc.y = 510;
        doc.x = 140;
        doc.fillColor('black');
        doc.text('Autorizado para Traslado');
        doc.y = 530;
        doc.x = 50;
        doc.fontSize(8);
        doc.text('Chofer: ' + data.chofer, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 545;
        doc.x = 50;
        doc.text('Vehiculo: ' + data.vehiculo, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        if (data.receptor) {
          doc.lineJoin('square').rect(410, 500, 350, 75).stroke();
          doc.y = 510;
          doc.x = 510;
          doc.fillColor('black');
          doc.fontSize(12);
          doc.text('Agente Receptor Entrega');
          doc.y = 530;
          doc.x = 425;
          doc.fontSize(9);
          doc.text(
            'Chofer: ' +
              (data.receptor.nb_receptor
                ? data.receptor.nb_receptor.substring(0, 20)
                : ''),
            {
              align: 'left',
              columns: 1,
              width: 300,
            }
          );
          doc.y = 530;
          doc.x = 590;
          doc.text('CI: ' + data.receptor.cedula_receptor, {
            align: 'left',
            columns: 1,
            width: 300,
          });
          doc.y = 530;
          doc.x = 660;
          if (data.receptor.placa) {
            doc.text('Placas: ' + data.receptor.placa, {
              align: 'left',
              columns: 1,
              width: 300,
            });
          }
          doc.y = 542;
          doc.x = 425;
          doc.text('Vehiculo: ' + data.receptor.vehiculo, {
            align: 'left',
            columns: 1,
            width: 300,
          });
          doc.y = 554;
          doc.x = 425;
          doc.text('Dirección: ' + data.receptor.dir_receptor, {
            align: 'left',
            columns: 1,
            width: 300,
          });
        }
        if (!(item >= detalle.length - 1)) {
          doc.addPage();
          page = page + 1;
          doc.switchToPage(page);
          i = 0;
          await this.generateHeader(doc, data);
        }
      }
    }

    if (i >= 290) {
      doc.addPage();
      page = page + 1;
      doc.switchToPage(page);
      i = 0;
      await this.generateHeader(doc, data);
    }

    let y = ymin + i + 6;
    doc.fontSize(6);

    if (data.tipoReporte == 'APZ' || data.tipoReporte == 'MAD') {
      doc.y = y;
      doc.x = 28;
      doc.text(total + group_len, {
        align: 'center',
        columns: 1,
        width: 70,
      });
      doc.y = y;
      doc.x = 161;
      doc.text('Total Piezas: ' + group_piezas, {
        align: 'center',
        columns: 1,
        width: 67,
      });

      doc.y = y;
      doc.x = 210;
      if (data.neta == 'N') {
        doc.text(
          'Total Neto: ' +
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(group_neta)
              .replace('EUR', '')
              .trim(),
          {
            align: 'center',
            columns: 1,
            width: 105,
          }
        );
      } else {
        doc.text(
          'Total Kgs: ' +
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(group_kgs)
              .replace('EUR', '')
              .trim(),
          {
            align: 'center',
            columns: 1,
            width: 105,
          }
        );
      }

      if (data.visible == 'V') {
        if (data.dolar) {
          doc.y = y;
          doc.x = 480;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(total_declarado_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 522;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(total_declarado_dolar_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 565;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(credito_orig_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 600;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(credito_dest_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 645;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(contado_orig_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 680;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(contado_dest_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 713;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(total_dolar_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
        } else {
          doc.y = y;
          doc.x = 552;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(credito_orig_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 596;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(credito_dest_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 657;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(contado_orig_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 705;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(contado_dest_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
        }
      }
      y += 20;
    }

    doc
      .lineCap('butt')
      .moveTo(35, y - 5)
      .lineTo(755, y - 5)
      .stroke();
    doc
      .lineCap('butt')
      .moveTo(35, y + 9)
      .lineTo(755, y + 9)
      .stroke();

    doc.y = y;
    doc.x = 28;
    doc.text('Total Guías: ' + detalle.length, {
      align: 'center',
      columns: 1,
      width: 70,
    });
    doc.y = y;
    doc.x = 161;
    doc.text('Total Piezas: ' + nro_piezas, {
      align: 'center',
      columns: 1,
      width: 67,
    });

    doc.y = y;
    doc.x = 210;
    if (data.neta == 'N') {
      doc.text(
        'Total Neto: ' +
          new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            currencyDisplay: 'code',
          })
            .format(carga_neta)
            .replace('EUR', '')
            .trim(),
        {
          align: 'center',
          columns: 1,
          width: 105,
        }
      );
    } else {
      doc.text(
        'Total Kgs: ' +
          new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            currencyDisplay: 'code',
          })
            .format(peso_kgs)
            .replace('EUR', '')
            .trim(),
        {
          align: 'center',
          columns: 1,
          width: 105,
        }
      );
    }

    if (data.visible == 'V') {
      if (data.dolar) {
        doc.y = y;
        doc.x = 480;
        doc.text(
          new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            currencyDisplay: 'code',
          })
            .format(total_declarado)
            .replace('EUR', '')
            .trim(),
          {
            align: 'right',
            columns: 1,
            width: 40,
          }
        );
        doc.y = y;
        doc.x = 522;
        doc.text(
          new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            currencyDisplay: 'code',
          })
            .format(total_declarado_dolar)
            .replace('EUR', '')
            .trim(),
          {
            align: 'right',
            columns: 1,
            width: 40,
          }
        );
        doc.y = y;
        doc.x = 565;
        doc.text(
          new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            currencyDisplay: 'code',
          })
            .format(credito_orig)
            .replace('EUR', '')
            .trim(),
          {
            align: 'right',
            columns: 1,
            width: 40,
          }
        );
        doc.y = y;
        doc.x = 600;
        doc.text(
          new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            currencyDisplay: 'code',
          })
            .format(credito_dest)
            .replace('EUR', '')
            .trim(),
          {
            align: 'right',
            columns: 1,
            width: 40,
          }
        );
        doc.y = y;
        doc.x = 645;
        doc.text(
          new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            currencyDisplay: 'code',
          })
            .format(contado_orig)
            .replace('EUR', '')
            .trim(),
          {
            align: 'right',
            columns: 1,
            width: 40,
          }
        );
        doc.y = y;
        doc.x = 680;
        doc.text(
          new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            currencyDisplay: 'code',
          })
            .format(contado_dest)
            .replace('EUR', '')
            .trim(),
          {
            align: 'right',
            columns: 1,
            width: 40,
          }
        );
        doc.y = y;
        doc.x = 713;
        doc.text(
          new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            currencyDisplay: 'code',
          })
            .format(total_dolar)
            .replace('EUR', '')
            .trim(),
          {
            align: 'right',
            columns: 1,
            width: 40,
          }
        );
      } else {
        doc.y = y;
        doc.x = 552;
        doc.text(
          new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            currencyDisplay: 'code',
          })
            .format(credito_orig)
            .replace('EUR', '')
            .trim(),
          {
            align: 'right',
            columns: 1,
            width: 40,
          }
        );
        doc.y = y;
        doc.x = 596;
        doc.text(
          new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            currencyDisplay: 'code',
          })
            .format(credito_dest)
            .replace('EUR', '')
            .trim(),
          {
            align: 'right',
            columns: 1,
            width: 40,
          }
        );
        doc.y = y;
        doc.x = 657;
        doc.text(
          new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            currencyDisplay: 'code',
          })
            .format(contado_orig)
            .replace('EUR', '')
            .trim(),
          {
            align: 'right',
            columns: 1,
            width: 40,
          }
        );
        doc.y = y;
        doc.x = 705;
        doc.text(
          new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            currencyDisplay: 'code',
          })
            .format(contado_dest)
            .replace('EUR', '')
            .trim(),
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
      doc.fontSize(12);
      doc.fillColor('#444444');
      doc.x = 640;
      doc.y = 71;
      doc.text(`Pagina ${i + 1} de ${range.count}`, {
        align: 'right',
        columns: 1,
        width: 100,
      });
    }
  }
}

module.exports = RelacionDespachoService;
