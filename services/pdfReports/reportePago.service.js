const moment = require('moment');
const { models } = require('./../../libs/sequelize');

const UtilsService = require('./../utils.service');
const utils = new UtilsService();

class ReportePagoService {
  async mainReport(doc, id, beneficiario) {
    let detalle = await models.Pgenerados.findByPk(id, {
      include: [
        {
          model: models.Cuentas,
          as: 'cuentas',
          include: {
            model: models.Bancos,
            as: 'bancos',
          },
        },
        {
          model: models.Mctapagar,
          as: 'ctaspagar',
        },
      ],
      raw: true,
    });

    if (detalle.length == 0) return false;
    await this.generateHeader(doc, detalle, beneficiario);
    return true;
  }

  async generateHeader(doc, detalle, beneficiario) {
    let x = 10;
    doc.lineJoin('miter').rect(35, 35, 540, 220).stroke();
    doc.lineJoin('miter').rect(35, 270, 540, 20).stroke();
    doc.lineJoin('miter').rect(35, 295, 540, 100).stroke();
    doc.lineCap('butt').moveTo(35, 318).lineTo(575, 318).stroke();
    doc.lineCap('butt').moveTo(380, 295).lineTo(380, 420).stroke();
    doc.lineCap('butt').moveTo(480, 295).lineTo(480, 420).stroke();
    doc.lineCap('butt').moveTo(575, 295).lineTo(575, 420).stroke();
    doc.lineCap('butt').moveTo(380, 420).lineTo(575, 420).stroke();

    doc.lineWidth(0.5);
    doc.lineJoin('round').rect(430, 45, 120, 25).stroke();
    doc.lineCap('butt').moveTo(330, 200).lineTo(540, 200).stroke();

    doc.fontSize(11);
    doc.font('Helvetica-Bold');
    doc.text('SON:', 400, 55);
    doc.font('Helvetica');
    doc.text('Cheque Número:', 135, 55);

    doc.fontSize(8);
    doc.text('PAGUESE A LA', 60, 85);
    doc.text('ORDEN DE:', 73, 95);
    doc.text('LA CANTIDAD DE:', 50, 120);
    doc.text('FIRMA AUTORIZADA', 400, 210);

    doc.font('Helvetica-Bold');
    doc.text('DE', 250, 150);
    doc.text('VALENCIA,', 70, 150);
    doc.text('Fecha de Pago:', 60, 240);
    doc.text('NO ENDOSABLE', 406, 230);
    doc.text('CONCEPTOS Y DETALLES', 170, 305);
    doc.text('DEBE', 420, 305);
    doc.text('HABER', 515, 305);

    doc.fontSize(13);
    doc.y = 54;
    doc.x = 210;
    doc.text(detalle.nro_doc_pago, {
      align: 'center',
      columns: 1,
      width: 100,
    });
    doc.y = 54;
    doc.x = 440;
    doc.text('*' + utils.formatNumber(detalle.monto_pagado) + '*', {
      align: 'center',
      columns: 1,
      width: 100,
    });

    doc.fontSize(9);
    doc.y = 95;
    doc.x = 135;
    doc.text('** ' + beneficiario + ' **', {
      align: 'left',
      columns: 1,
      width: 300,
    });

    let total = detalle.monto_pagado.split('.');
    total =
      utils.numeroALetras(total[0]) +
      (utils.numeroALetras(total[1]) != ' '
        ? ' CON ' + utils.numeroALetras(total[1]) + ' CENTIMOS'
        : ' EXACTOS');
    doc.y = 120;
    doc.x = 135;
    doc.text('** ' + total + ' **', {
      align: 'left',
      columns: 1,
      width: 400,
    });

    doc.y = 150;
    doc.x = 120;
    doc.text(moment(detalle.fecha_pago).format('DD'), {
      align: 'left',
      columns: 1,
      width: 20,
    });
    doc.y = 150;
    doc.x = 140;
    doc.text(
      'DE   ' +
        utils.numerosAMeses(parseInt(moment(detalle.fecha_pago).format('MM'))),
      {
        align: 'left',
        columns: 1,
        width: 100,
      }
    );
    doc.y = 150;
    doc.x = 270;
    doc.text(moment(detalle.fecha_pago).format('YYYY'), {
      align: 'left',
      columns: 1,
      width: 50,
    });
    doc.y = 240;
    doc.x = 130;
    doc.text(moment(detalle.fecha_pago).format('DD/MM/YYYY'), {
      align: 'left',
      columns: 1,
      width: 100,
    });

    doc.y = 200;
    doc.x = 70;
    doc.text(detalle['cuentas.nro_cuenta'], {
      align: 'left',
      columns: 1,
      width: 200,
    });

    doc.fontSize(14);
    doc.y = 180;
    doc.x = 70;
    doc.text(detalle['cuentas.bancos.nb_banco'], {
      align: 'left',
      columns: 1,
      width: 200,
    });

    let item1 = '';
    if (
      detalle['ctaspagar.saldo_retenido'] <= 0 ||
      detalle['ctaspagar.saldo_retenido'] == null
    ) {
      item1 =
        'Pago Total del Doc. ' +
        detalle['ctaspagar.tipo_documento'] +
        ' ' +
        detalle['ctaspagar.nro_documento'];
    } else {
      item1 =
        'Abono al Doc. ' +
        detalle['ctaspagar.tipo_documento'] +
        ' ' +
        detalle['ctaspagar.nro_documento'];
    }
    doc.fontSize(11);
    doc.y = 330;
    doc.x = 50;
    doc.text(item1, {
      align: 'left',
      columns: 1,
      width: 300,
    });

    let debe = 0;
    if (
      detalle['ctaspagar.tipo_documento'] == 'FA' ||
      detalle['ctaspagar.tipo_documento'] == 'ND'
    ) {
      debe =
        parseFloat(detalle.monto_pagado) + parseFloat(detalle.monto_retenido);
    } else if (detalle['ctaspagar.tipo_documento'] == 'RE') {
      debe = parseFloat(detalle.monto_pagado);
    }
    doc.y = 330;
    doc.x = 400;
    doc.text(utils.formatNumber(debe), {
      align: 'right',
      columns: 1,
      width: 70,
    });

    let haber =
      detalle['ctaspagar.tipo_documento'] == 'NC'
        ? parseFloat(detalle.monto_pagado) * -1
        : 0;
    doc.y = 330;
    doc.x = 495;
    doc.text(utils.formatNumber(haber), {
      align: 'right',
      columns: 1,
      width: 70,
    });

    doc.y = 350;
    doc.x = 50;
    doc.text('** Retención **', {
      align: 'left',
      columns: 1,
      width: 100,
    });

    doc.y = 370;
    doc.x = 50;
    doc.text('Total Pago', {
      align: 'left',
      columns: 1,
      width: 100,
    });

    let retenido = 0;
    if (
      detalle['ctaspagar.tipo_documento'] != 'NC' &&
      detalle['ctaspagar.tipo_documento'] != 'RE'
    ) {
      retenido = parseFloat(detalle.monto_retenido);
    }
    doc.y = 350;
    doc.x = 495;
    doc.text(utils.formatNumber(retenido), {
      align: 'right',
      columns: 1,
      width: 70,
    });

    let pagado = debe - retenido - haber;
    doc.y = 370;
    doc.x = 495;
    doc.text(utils.formatNumber(pagado), {
      align: 'right',
      columns: 1,
      width: 70,
    });

    doc.y = 403;
    doc.x = 400;
    doc.text(utils.formatNumber(debe), {
      align: 'right',
      columns: 1,
      width: 70,
    });

    doc.y = 403;
    doc.x = 495;
    doc.text(utils.formatNumber(haber + retenido + pagado), {
      align: 'right',
      columns: 1,
      width: 70,
    });
  }
}

module.exports = ReportePagoService;
