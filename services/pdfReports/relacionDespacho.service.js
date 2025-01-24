const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

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
      .image('./img/logo_rc.png', 45, 35, { width: 40 })
      .fillColor('#444444')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('RCS Express, S.A', 95, 55)
      .text('R.I.F. J-31028463-6', 95, 70)
      .text('Fecha: ' + moment().format('DD/MM/YYYY'), 647, 35)
      .fontSize(8);

    doc.y = 65;
    doc.x = 590;
    doc.text('Autorizado Por: ' + data.usuario, {
      align: 'right',
      columns: 1,
      width: 150,
    });
    doc.y = 75;
    doc.x = 590;
    doc.text('Impreso Por: ' + data.usuario, {
      align: 'right',
      columns: 1,
      width: 150,
    });
    doc.fontSize(16);
    doc.y = 40;
    doc.x = 150;
    doc.text(data.nombreReporte, {
      align: 'center',
      columns: 1,
      width: 490,
    });
    doc.fontSize(11);
    doc.y = 60;
    doc.x = 240;
    doc.text(data.agencia, {
      align: 'center',
      columns: 1,
      width: 300,
    });
    doc.text('Desde: ' + data.fecha_desde, 280, 75);
    doc.text('Hasta: ' + data.fecha_hasta, 400, 75);
    doc.moveDown();

    doc.fontSize(8);
    doc.y = 112;
    doc.x = 35;
    doc.text('DATOS DEL DOCUMENTO', {
      align: 'center',
      columns: 1,
      width: 217,
    });

    if (data.visibleGuia) {
      doc.y = 130;
      doc.x = 50;
      doc.text('Guía', {
        align: 'left',
        columns: 1,
        width: 40,
      });
    }

    doc.y = 130;
    doc.x = 82;
    doc.text('Emisión', {
      align: 'left',
      columns: 1,
      width: 40,
    });
    doc.y = 130;
    doc.x = 124;
    doc.text('O.', {
      align: 'left',
      columns: 1,
      width: 10,
    });
    doc.y = 130;
    doc.x = 144;
    doc.text('D.', {
      align: 'left',
      columns: 1,
      width: 10,
    });
    doc.y = 130;
    doc.x = 160;
    doc.text('Zona D.', {
      align: 'left',
      columns: 1,
      width: 30,
    });
    doc.y = 130;
    doc.x = 198;
    doc.text('Piezas', {
      align: 'left',
      columns: 1,
      width: 30,
    });
    doc.y = 130;
    doc.x = 229;
    doc.text(data.neta == 'N' ? 'Neto' : 'Kgs.', {
      align: 'left',
      columns: 1,
      width: 30,
    });

    if (data.visible == 'V' && data.dolar) {
      doc.y = 112;
      doc.x = 252;
      doc.text('CLIENTE', {
        align: 'center',
        columns: 1,
        width: 220,
      });
      doc.y = 112;
      doc.x = 472;
      doc.text('VALOR DECLARADO', {
        align: 'center',
        columns: 1,
        width: 97,
      });
      doc.y = 96;
      doc.x = 569;
      doc.text('MODALIDAD DE PAGO', {
        align: 'center',
        columns: 1,
        width: 155,
      });
      doc.y = 128;
      doc.x = 724;
      doc.text('$', {
        align: 'center',
        columns: 1,
        width: 30,
      });

      doc.y = 130;
      doc.x = 255;
      doc.text('Remitente');
      doc.y = 130;
      doc.x = 367;
      doc.text('Destinatario');
      doc.y = 130;
      doc.x = 484;
      doc.text('Bolivares');
      doc.y = 130;
      doc.x = 545;
      doc.text('$');

      doc.y = 112;
      doc.x = 569;
      doc.text('CRÉDITO', {
        align: 'center',
        columns: 1,
        width: 80,
      });
      doc.y = 130;
      doc.x = 577;
      doc.text('Origen');
      doc.y = 130;
      doc.x = 610;
      doc.text('Destino');

      doc.y = 112;
      doc.x = 649;
      doc.text('CONTADO', {
        align: 'center',
        columns: 1,
        width: 75,
      });
      doc.y = 130;
      doc.x = 656;
      doc.text('Origen');
      doc.y = 130;
      doc.x = 688;
      doc.text('Destino');

      doc.lineJoin('miter').rect(35, 107, 217, 17).stroke();
      doc.lineJoin('miter').rect(252, 107, 220, 17).stroke();
      doc.lineJoin('miter').rect(472, 107, 97, 17).stroke();
      doc.lineJoin('miter').rect(569, 90, 155, 17).stroke();
      doc.lineJoin('miter').rect(569, 107, 80, 17).stroke();
      doc.lineJoin('miter').rect(649, 107, 75, 17).stroke();
      doc.lineJoin('miter').rect(724, 107, 30, 34).stroke();
      doc.lineJoin('miter').rect(35, 124, 217, 17).stroke();
      doc.lineJoin('miter').rect(252, 124, 220, 17).stroke();
      doc.lineJoin('miter').rect(472, 124, 97, 17).stroke();
      doc.lineJoin('miter').rect(569, 124, 80, 17).stroke();
      doc.lineJoin('miter').rect(649, 124, 75, 17).stroke();
    } else {
      doc.y = 112;
      doc.x = 252;
      doc.text('CLIENTE', {
        align: 'center',
        columns: 1,
        width: 293,
      });

      if (data.tipo == 'C' && data.visible == 'N') {
        doc.y = 112;
        doc.x = 545;
        doc.text('DATOS DEL DOCUMENTO', {
          align: 'center',
          columns: 1,
          width: 209,
        });
        doc.y = 130;
        doc.x = 545;
        doc.text('Números Factura Cliente', {
          align: 'center',
          columns: 1,
          width: 209,
        });
        doc.y = 130;
        doc.x = 255;
        doc.text('Remitente');
        doc.y = 130;
        doc.x = 384;
        doc.text('Destinatario');
        doc.lineJoin('miter').rect(35, 107, 217, 17).stroke();
        doc.lineJoin('miter').rect(252, 107, 293, 17).stroke();
        doc.lineJoin('miter').rect(545, 107, 209, 17).stroke();
        doc.lineJoin('miter').rect(35, 124, 217, 17).stroke();
        doc.lineJoin('miter').rect(252, 124, 293, 17).stroke();
        doc.lineJoin('miter').rect(545, 124, 209, 17).stroke();
      } else {
        doc.y = 96;
        doc.x = 545;
        doc.text('MODALIDAD DE PAGO', {
          align: 'center',
          columns: 1,
          width: 209,
        });
        doc.y = 130;
        doc.x = 255;
        doc.text('Remitente');
        doc.y = 130;
        doc.x = 384;
        doc.text('Destinatario');

        doc.y = 112;
        doc.x = 545;
        doc.text('CRÉDITO', {
          align: 'center',
          columns: 1,
          width: 105,
        });
        doc.y = 130;
        doc.x = 555;
        doc.text('Origen');
        doc.y = 130;
        doc.x = 604;
        doc.text('Destino');

        doc.y = 112;
        doc.x = 650;
        doc.text('CONTADO', {
          align: 'center',
          columns: 1,
          width: 104,
        });
        doc.y = 130;
        doc.x = 660;
        doc.text('Origen');
        doc.y = 130;
        doc.x = 705;
        doc.text('Destino');
        doc.lineJoin('miter').rect(35, 107, 217, 17).stroke();
        doc.lineJoin('miter').rect(252, 107, 293, 17).stroke();
        doc.lineJoin('miter').rect(545, 107, 105, 17).stroke();
        doc.lineJoin('miter').rect(650, 107, 104, 17).stroke();
        doc.lineJoin('miter').rect(545, 90, 209, 17).stroke();
        doc.lineJoin('miter').rect(35, 124, 217, 17).stroke();
        doc.lineJoin('miter').rect(252, 124, 293, 17).stroke();
        doc.lineJoin('miter').rect(545, 124, 105, 17).stroke();
        doc.lineJoin('miter').rect(650, 124, 104, 17).stroke();
      }
    }
  }

  async generateCustomerInformation(doc, data, detalle) {
    var i = 0;
    var page = 0;
    var ymin = 150;

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
      doc.font('Helvetica');
      doc.fontSize(6);
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

      doc.font('Helvetica-Bold');

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

      doc.font('Helvetica');

      if (data.visibleGuia) {
        doc.y = ymin + i;
        doc.x = 33;
        doc.text(detalle[item].nro_documento, {
          align: 'center',
          columns: 1,
          width: 50,
        });
      }

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

      if (data.tipo == 'C' && data.visible == 'N') {
        doc.y = ymin + i;
        doc.x = 545;
        doc.text(detalle[item].dimensiones, {
          align: 'center',
          columns: 1,
          width: 209,
        });
      }

      i += 9;
      if (i >= 320 || item >= detalle.length - 1) {
        doc.lineJoin('square').rect(35, 510, 350, 60).stroke();
        doc.fontSize(12);
        doc.font('Helvetica-Bold');
        doc.y = 515;
        doc.x = 140;
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
          doc.lineJoin('square').rect(410, 510, 350, 60).stroke();
          doc.y = 515;
          doc.x = 510;
          doc.fontSize(12);
          doc.text('Agente Receptor Entrega');
          doc.y = 530;
          doc.x = 425;
          doc.fontSize(8);
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
          doc.y = 540;
          doc.x = 425;
          doc.text('Vehiculo: ' + data.receptor.vehiculo, {
            align: 'left',
            columns: 1,
            width: 300,
          });
          doc.y = 550;
          doc.x = 425;
          doc.text('Dirección: ' + data.receptor.dir_receptor, {
            align: 'left',
            columns: 1,
            width: 300,
          });
        }
        if(data.observacion && data.tipo == 'C') {
          doc.lineJoin('square').rect(35, 575, 725, 20).stroke();
          doc.font('Helvetica-Bold');
          doc.y = 581;
          doc.x = 50;
          doc.text('Observación:', {
            align: 'left',
            columns: 1,
            width: 80,
          });
          doc.font('Helvetica');
          doc.y = 581;
          doc.x = 112;
          doc.text(data.observacion, {
            align: 'left',
            columns: 1,
            width: 650,
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

    if (i >= 320) {
      doc.addPage();
      page = page + 1;
      doc.switchToPage(page);
      i = 0;
      await this.generateHeader(doc, data);
    }

    let y = ymin + i + 8;
    doc.fontSize(6);
    doc.font('Helvetica-Bold');

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
      doc.fontSize(10);
      doc.fillColor('#444444');
      doc.x = 640;
      doc.y = 50;
      doc.text(`Pagina ${i + 1} de ${range.count}`, {
        align: 'right',
        columns: 1,
        width: 100,
      });
    }
  }
}

module.exports = RelacionDespachoService;
