const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('./../utils.service');
const utils = new UtilsService();

const montoIslr =
  '(SELECT a.monto_base * porc_retencion / 100 ' +
  'FROM control_islr_factura a, control_islr b ' +
  'WHERE a.cod_islr = b.id AND a.id_compra = `ctaspagar`.id)';
const porcRetencion =
  '(SELECT porc_retencion ' +
  'FROM control_islr_factura a, control_islr b ' +
  'WHERE a.cod_islr = b.id AND a.id_compra = `ctaspagar`.id)';

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
      attributes: [
        'nro_doc_pago',
        'monto_pagado',
        'fecha_pago',
        'monto_retenido',
        [Sequelize.literal(montoIslr), 'monto_islr'],
        [Sequelize.literal(porcRetencion), 'porc_retencion'],
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
    doc.lineJoin('miter').rect(35, 295, 540, 118).stroke();
    doc.lineCap('butt').moveTo(35, 318).lineTo(575, 318).stroke();
    doc.lineCap('butt').moveTo(380, 295).lineTo(380, 440).stroke();
    doc.lineCap('butt').moveTo(480, 295).lineTo(480, 440).stroke();
    doc.lineCap('butt').moveTo(575, 295).lineTo(575, 440).stroke();
    doc.lineCap('butt').moveTo(380, 440).lineTo(575, 440).stroke();

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

    doc.fontSize(11);
    doc.text('CONCEPTOS Y DETALLES', 147, 303);
    doc.text('DEBE', 415, 303);
    doc.text('HABER', 508, 303);

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

    doc.fontSize(11);
    doc.y = 276;
    doc.x = 45;
    doc.text(
      'Banco: ' +
        detalle['cuentas.bancos.nb_banco'] +
        ' - Cuenta Nº: ' +
        detalle['cuentas.nro_cuenta'],
      {
        align: 'left',
        columns: 1,
        width: 300,
      }
    );

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

    let impuesto =
      detalle['ctaspagar.monto_base_nacional'] > 0
        ? (detalle['ctaspagar.monto_imp_nacional'] /
            detalle['ctaspagar.monto_base_nacional']) *
          100
        : 0;

    doc.y = 350;
    doc.x = 50;
    doc.text('** Retención IVA ' + impuesto + '% **', {
      align: 'left',
      columns: 1,
      width: 180,
    });
    doc.y = 370;
    doc.x = 50;
    doc.text(
      '** Retención ISLR ' +
        parseFloat(detalle.porc_retencion).toFixed(0) +
        '% **',
      {
        align: 'left',
        columns: 1,
        width: 180,
      }
    );
    doc.y = 390;
    doc.x = 50;
    doc.text('Total Pago', {
      align: 'left',
      columns: 1,
      width: 100,
    });

    let retenido = 0;
    let islr = 0;
    if (
      detalle['ctaspagar.tipo_documento'] != 'NC' &&
      detalle['ctaspagar.tipo_documento'] != 'RE'
    ) {
      retenido = parseFloat(detalle.monto_retenido);
      islr = parseFloat(detalle.monto_islr);
    }
    doc.y = 350;
    doc.x = 495;
    doc.text(utils.formatNumber(retenido), {
      align: 'right',
      columns: 1,
      width: 70,
    });
    doc.y = 370;
    doc.x = 495;
    doc.text(utils.formatNumber(islr), {
      align: 'right',
      columns: 1,
      width: 70,
    });

    let pagado = debe - retenido - islr - haber;
    doc.y = 390;
    doc.x = 495;
    doc.text(utils.formatNumber(pagado), {
      align: 'right',
      columns: 1,
      width: 70,
    });

    doc.y = 423;
    doc.x = 400;
    doc.text(utils.formatNumber(debe), {
      align: 'right',
      columns: 1,
      width: 70,
    });

    doc.y = 423;
    doc.x = 495;
    doc.text(utils.formatNumber(haber + retenido + islr + pagado), {
      align: 'right',
      columns: 1,
      width: 70,
    });
  }
}

module.exports = ReportePagoService;
