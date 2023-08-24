const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

class RelacionRetencionesService {
  async mainReport(doc, agencia, proveedor, desde, hasta) {
    let where = {
      fecha_pago: {
        [Sequelize.Op.between]: [
          moment(desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
          moment(hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
        ],
      },
    };

    let where2 = {
      pago_permanente: 'P',
      porcentaje_retencion: {
        [Sequelize.Op.ne]: 0,
      },
    };

    if (agencia) where2.cod_agencia = agencia;
    if (proveedor) where2.cod_proveedor = proveedor;

    let detalles = await models.Pgenerados.findAll({
      where: where,
      attributes: [
        'id',
        'fecha_pago',
        'nro_doc_pago',
        'monto_pagado',
        'monto_retenido',
      ],
      include: [
        {
          model: models.Mctapagar,
          as: 'ctaspagar',
          attributes: [
            'cod_agencia',
            'tipo_documento',
            'nro_documento',
            'saldo_documento',
            'porcentaje_retencion',
            'base_imponible_retencion',
            'total_documento',
          ],
          where: where2,
          include: [
            {
              model: models.Agencias,
              as: 'agencias',
              attributes: ['nb_agencia'],
            },
            {
              model: models.Proveedores,
              as: 'proveedores',
              attributes: ['nb_proveedor'],
            },
          ],
        },
        {
          model: models.Cuentas,
          as: 'cuentas',
          attributes: ['nro_cuenta'],
          include: [
            {
              model: models.Bancos,
              as: 'bancos',
              attributes: ['nb_banco'],
            },
          ],
        },
      ],
      order: [
        ['ctaspagar', 'cod_agencia', 'ASC'],
        ['nro_doc_pago', 'ASC'],
        ['ctaspagar', 'proveedores', 'nb_proveedor', 'ASC'],
      ],
      raw: true,
    });

    if (detalles.length == 0) return false;

    detalles.desde = desde;
    detalles.hasta = hasta;
    if (agencia) detalles.agencia = agencia;
    if (proveedor) detalles.proveedor = proveedor;
    await this.generateHeader(doc, detalles);
    await this.generateCustomerInformation(doc, detalles);
    return true;
  }

  async generateHeader(doc, detalles) {
    doc.image('./img/logo_rc.png', 35, 25, { width: 80 });
    doc.fontSize(9);
    doc.text('RCS EXPRESS, S.A', 35, 155);
    doc.text('RIF. J-31028463-6', 35, 170);
    doc.font('Helvetica-Bold');
    doc.fillColor('#444444');
    doc.fontSize(18);

    let tittle = 'Relación de Retenciones';
    doc.y = 100;
    doc.x = 140;
    doc.text(tittle, {
      align: 'center',
      columns: 1,
      width: 400,
    });

    doc.fontSize(12);
    doc.y = 125;
    doc.x = 230;
    doc.text('Desde: ' + detalles.desde, {
      align: 'left',
      columns: 1,
      width: 300,
    });
    doc.y = 125;
    doc.x = 347;
    doc.text('Hasta: ' + detalles.hasta, {
      align: 'left',
      columns: 1,
      width: 300,
    });

    if (detalles.agencia) {
      doc.y = 145;
      doc.x = 140;
      doc.text('Agencia: ' + detalles[0]['ctaspagar.agencias.nb_agencia'], {
        align: 'center',
        columns: 1,
        width: 400,
      });
    }

    if (detalles.proveedor) {
      doc.y = detalles.agencia ? 165 : 145;
      doc.x = 140;
      doc.text(
        'Proveedor: ' + detalles[0]['ctaspagar.proveedores.nb_proveedor'],
        {
          align: 'center',
          columns: 1,
          width: 400,
        }
      );
    }

    doc.fontSize(9);
    doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 510, 35);
    doc.text('Fecha Pago', 35, 200);
    doc.text('Banco', 190, 200);
    doc.text('Nro. Cheque', 300, 200);
    doc.text('Monto Parcial', 369, 190);
    doc.text('Cheque', 380, 200);
    doc.text('Monto Retenido', 440, 200);
    doc.text('Monto Pagado', 515, 200);

    doc.lineWidth(1);
    doc.lineCap('butt').moveTo(25, 213).lineTo(590, 213).stroke();
  }

  async generateCustomerInformation(doc, detalles) {
    let total_pagado = 0;
    let total_retenido = 0;
    let total_total = 0;
    let subtotal_pagado = 0;
    let subtotal_retenido = 0;
    let subtotal_total = 0;

    var i = 0;
    var page = 0;
    var ymin;
    ymin = 205;
    for (var item = 0; item < detalles.length; item++) {
      doc.fontSize(9);
      if (
        item == 0 ||
        detalles[item]['ctaspagar.proveedores.nb_proveedor'] !=
          detalles[item - 1]['ctaspagar.proveedores.nb_proveedor']
      ) {
        if (item > 0) i += 20;
        doc.font('Helvetica-Bold');
        doc.text(
          detalles[item]['ctaspagar.proveedores.nb_proveedor'],
          30,
          ymin + i + 15
        );
        doc.text(
          'Doc: ' +
            detalles[item]['ctaspagar.tipo_documento'] +
            '-' +
            detalles[item]['ctaspagar.nro_documento'],
          30,
          ymin + i + 30
        );
        doc.text(
          'Saldo: ' +
            utils.formatNumber(detalles[item]['ctaspagar.saldo_documento']),
          160,
          ymin + i + 30
        );
        doc.text(
          '% Ret.: ' +
            utils.formatNumber(
              detalles[item]['ctaspagar.porcentaje_retencion']
            ),
          300,
          ymin + i + 30
        );
        doc.text(
          'Ret.: ' +
            utils.formatNumber(
              detalles[item]['ctaspagar.base_imponible_retencion'] *
                (detalles[item]['ctaspagar.porcentaje_retencion'] / 100)
            ),
          400,
          ymin + i + 30
        );
        doc.text(
          'Total: ' +
            utils.formatNumber(detalles[item]['ctaspagar.total_documento']),
          500,
          ymin + i + 30
        );
        i += 50;
      }

      doc.font('Helvetica');
      doc.fillColor('#444444');

      doc.y = ymin + i;
      doc.x = 30;
      doc.text(moment(detalles[item].fecha_pago).format('DD/MM/YYYY'), {
        align: 'center',
        columns: 1,
        width: 60,
      });
      doc.y = ymin + i;
      doc.x = 50;
      doc.text(
        detalles[item]['cuentas.bancos.nb_banco'] +
          ' ' +
          detalles[item]['cuentas.nro_cuenta'],
        {
          align: 'center',
          columns: 1,
          width: 300,
        }
      );
      doc.y = ymin + i;
      doc.x = 295;
      doc.text(detalles[item].nro_doc_pago, {
        align: 'right',
        columns: 1,
        width: 60,
      });
      doc.y = ymin + i;
      doc.x = 365;
      doc.text(utils.formatNumber(detalles[item].monto_pagado), {
        align: 'right',
        columns: 1,
        width: 60,
      });
      doc.y = ymin + i;
      doc.x = 450;
      doc.text(utils.formatNumber(detalles[item].monto_retenido), {
        align: 'right',
        columns: 1,
        width: 60,
      });
      doc.y = ymin + i;
      doc.x = 515;
      doc.text(
        utils.formatNumber(
          utils.parseFloatN(detalles[item].monto_pagado) +
            utils.parseFloatN(detalles[item].monto_retenido)
        ),
        {
          align: 'right',
          columns: 1,
          width: 60,
        }
      );

      // Sub Totales por Agencia
      if (
        item > 0 &&
        detalles[item]['ctaspagar.proveedores.nb_proveedor'] !=
          detalles[item - 1]['ctaspagar.proveedores.nb_proveedor']
      ) {
        doc
          .lineCap('butt')
          .moveTo(300, ymin + i - 70)
          .lineTo(580, ymin + i - 70)
          .stroke();
        doc.font('Helvetica-Bold');
        doc.y = ymin + i - 60;
        doc.x = 250;
        doc.text('SubTotal:', {
          align: 'right',
          columns: 1,
          width: 100,
        });
        doc.y = ymin + i - 60;
        doc.x = 365;
        doc.text(utils.formatNumber(subtotal_pagado), {
          align: 'right',
          columns: 1,
          width: 60,
        });
        doc.y = ymin + i - 60;
        doc.x = 450;
        doc.text(utils.formatNumber(subtotal_retenido), {
          align: 'right',
          columns: 1,
          width: 60,
        });
        doc.y = ymin + i - 60;
        doc.x = 515;
        doc.text(utils.formatNumber(utils.parseFloatN(subtotal_total)), {
          align: 'right',
          columns: 1,
          width: 60,
        });

        doc.font('Helvetica');
        subtotal_pagado = 0;
        subtotal_retenido = 0;
        subtotal_total = 0;
      }

      subtotal_pagado += utils.parseFloatN(detalles[item].monto_pagado);
      subtotal_retenido += utils.parseFloatN(detalles[item].monto_retenido);
      subtotal_total += utils.parseFloatN(
        utils.parseFloatN(detalles[item].monto_pagado) +
          utils.parseFloatN(detalles[item].monto_retenido)
      );
      total_pagado += utils.parseFloatN(detalles[item].monto_pagado);
      total_retenido += utils.parseFloatN(detalles[item].monto_retenido);
      total_total += utils.parseFloatN(
        utils.parseFloatN(detalles[item].monto_pagado) +
          utils.parseFloatN(detalles[item].monto_retenido)
      );

      i += 16;
      if (i >= 450) {
        doc.fillColor('#BLACK');
        doc.addPage();
        page = page + 1;
        doc.switchToPage(page);
        i = 20;
        await this.generateHeader(doc, detalles);
      }
    }

    // Sub Totales por Agencia Finales
    i += 10;
    doc
      .lineCap('butt')
      .moveTo(300, ymin + i - 10)
      .lineTo(580, ymin + i - 10)
      .stroke();
    doc.font('Helvetica-Bold');
    doc.y = ymin + i;
    doc.x = 200;
    doc.text('SubTotal:', {
      align: 'right',
      columns: 1,
      width: 150,
    });
    doc.y = ymin + i;
    doc.x = 365;
    doc.text(utils.formatNumber(subtotal_pagado), {
      align: 'right',
      columns: 1,
      width: 60,
    });
    doc.y = ymin + i;
    doc.x = 450;
    doc.text(utils.formatNumber(subtotal_retenido), {
      align: 'right',
      columns: 1,
      width: 60,
    });
    doc.y = ymin + i;
    doc.x = 515;
    doc.text(utils.formatNumber(utils.parseFloatN(subtotal_total)), {
      align: 'right',
      columns: 1,
      width: 60,
    });

    i += 25;
    doc.lineWidth(1);
    doc
      .lineCap('butt')
      .moveTo(250, ymin + i - 10)
      .lineTo(580, ymin + i - 10)
      .stroke();
    doc.y = ymin + i;
    doc.x = 200;
    doc.text('Total General:', {
      align: 'right',
      columns: 1,
      width: 150,
    });
    doc.y = ymin + i;
    doc.x = 365;
    doc.text(utils.formatNumber(total_pagado), {
      align: 'right',
      columns: 1,
      width: 60,
    });
    doc.y = ymin + i;
    doc.x = 450;
    doc.text(utils.formatNumber(total_retenido), {
      align: 'right',
      columns: 1,
      width: 60,
    });
    doc.y = ymin + i;
    doc.x = 515;
    doc.text(utils.formatNumber(utils.parseFloatN(total_total)), {
      align: 'right',
      columns: 1,
      width: 60,
    });

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
      doc.x = 485;
      doc.y = 50;
      doc.text(`Pagina ${i + 1} de ${range.count}`, {
        align: 'right',
        columns: 1,
        width: 100,
      });
    }
  }
}

module.exports = RelacionRetencionesService;
