const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

class PagosPendProvService {
  async mainReport(doc, agencia, proveedor, desde, hasta) {
    let where = {
      fecha_registro: {
        [Sequelize.Op.between]: [
          moment(desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
          moment(hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
        ],
      },
      estatus_documento: 'P',
      pago_permanente: 'P',
    };

    if (agencia) where.cod_agencia = agencia;
    if (proveedor) where.cod_proveedor = proveedor;

    let detalles = await models.Mctapagar.findAll({
      where: where,
      attributes: [
        'id',
        'nro_documento',
        'cod_agencia',
        'cod_proveedor',
        'tipo_documento',
        'fecha_documento',
        'fecha_registro',
        'total_documento',
        'saldo_documento',
        'estatus_documento',
        'condicion_pago',
        'fecha_vencimiento',
        'porcentaje_retencion',
        'base_imponible_retencion',
        'saldo_retenido',
        'saldo_base_retencion',
      ],
      include: [
        {
          model: models.Agencias,
          as: 'agencias',
          attributes: ['nb_agencia'],
        },
        {
          model: models.Proveedores,
          as: 'proveedores',
          attributes: ['nb_proveedor', 'nb_beneficiario'],
        },
      ],
      order: [
        ['cod_agencia', 'ASC'],
        ['cod_proveedor', 'ASC'],
        ['nro_documento', 'ASC'],
      ],
      raw: true,
    });

    if (detalles.length == 0) return false;

    detalles.desde = desde;
    detalles.hasta = hasta;
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

    let tittle = 'Pagos Pendientes a Proveedores';
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

    doc.fontSize(9);
    doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 510, 35);
    doc.text('N°', 55, 190);
    doc.text('Documento', 35, 200);
    doc.text('Fecha', 110, 190);
    doc.text('Documento', 100, 200);
    doc.text('Fecha', 178, 190);
    doc.text('Vencimiento', 165, 200);
    doc.text('Monto', 236, 190);
    doc.text('Documento', 225, 200);
    doc.text('%', 293, 190);
    doc.text('Ret.', 290, 200);
    doc.text('Monto', 327, 190);
    doc.text('Base Ret.', 320, 200);
    doc.text('Monto', 381, 190);
    doc.text('Retención', 373, 200);
    doc.text('Monto', 440, 190);
    doc.text('a Cancelar', 430, 200);
    doc.text('Saldo', 497, 190);
    doc.text('Documento', 485, 200);
    doc.text('Saldo por', 540, 190);
    doc.text('Retener', 545, 200);

    doc.lineWidth(1);
    doc.lineCap('butt').moveTo(25, 213).lineTo(590, 213).stroke();
    doc.lineCap('butt').moveTo(25, 216).lineTo(590, 216).stroke();
  }

  async generateCustomerInformation(doc, detalles) {
    let total_cancelar = 0;
    let subtotal_cancelar = 0;
    var i = 0;
    var page = 0;
    var ymin;
    ymin = 225;
    for (var item = 0; item < detalles.length; item++) {
      doc.fontSize(9);
      if (
        item == 0 ||
        detalles[item].cod_agencia != detalles[item - 1].cod_agencia ||
        detalles[item].cod_proveedor != detalles[item - 1].cod_proveedor
      ) {
        if (item > 0) i += 20;
        doc.font('Helvetica-Bold');
        doc.text(detalles[item]['agencias.nb_agencia'], 30, ymin + i);
        doc.text(
          'Proveedor: ' + detalles[item]['proveedores.nb_proveedor'],
          30,
          ymin + i + 15
        );
        i += 32;
      }

      doc.font('Helvetica');
      doc.fillColor('#444444');

      doc.y = ymin + i;
      doc.x = 30;
      doc.text(
        detalles[item].tipo_documento + ' ' + detalles[item].nro_documento,
        {
          align: 'center',
          columns: 1,
          width: 60,
        }
      );
      doc.y = ymin + i;
      doc.x = 100;
      doc.text(moment(detalles[item].fecha_documento).format('DD/MM/YYYY'), {
        align: 'center',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 165;
      doc.text(
        detalles[item].fecha_vencimiento == null
          ? '00/00/0000'
          : moment(detalles[item].fecha_vencimiento).format('DD/MM/YYYY'),
        {
          align: 'center',
          columns: 1,
          width: 50,
        }
      );
      doc.y = ymin + i;
      doc.x = 215;
      doc.text(utils.formatNumber(detalles[item].total_documento), {
        align: 'right',
        columns: 1,
        width: 60,
      });
      doc.y = ymin + i;
      doc.x = 280;
      doc.text(utils.formatNumber(detalles[item].porcentaje_retencion), {
        align: 'right',
        columns: 1,
        width: 30,
      });
      doc.y = ymin + i;
      doc.x = 303;
      doc.text(utils.formatNumber(detalles[item].base_imponible_retencion), {
        align: 'right',
        columns: 1,
        width: 60,
      });
      doc.y = ymin + i;
      doc.x = 358;
      doc.text(
        utils.formatNumber(
          detalles[item].base_imponible_retencion *
            (detalles[item].porcentaje_retencion / 100)
        ),
        {
          align: 'right',
          columns: 1,
          width: 60,
        }
      );

      let monto_cancelar =
        detalles[item].tipo_documento == 'RE'
          ? detalles[item].saldo_documento
          : detalles[item].saldo_documento - detalles[item].saldo_retenido;

      doc.y = ymin + i;
      doc.x = 414;
      doc.text(utils.formatNumber(monto_cancelar), {
        align: 'right',
        columns: 1,
        width: 60,
      });
      doc.y = ymin + i;
      doc.x = 470;
      doc.text(utils.formatNumber(detalles[item].saldo_documento), {
        align: 'right',
        columns: 1,
        width: 60,
      });
      doc.y = ymin + i;
      doc.x = 524;
      doc.text(utils.formatNumber(detalles[item].saldo_retenido), {
        align: 'right',
        columns: 1,
        width: 60,
      });

      // Sub Totales por Agencia
      if (
        item > 0 &&
        (detalles[item].cod_agencia != detalles[item - 1].cod_agencia ||
          detalles[item].cod_proveedor != detalles[item - 1].cod_proveedor)
      ) {
        doc.font('Helvetica-Bold');
        doc.y = ymin + i - 50;
        doc.x = 270;
        doc.text('Total Proveedor:', {
          align: 'right',
          columns: 1,
          width: 150,
        });
        doc.y = ymin + i - 50;
        doc.x = 414;
        doc.text(utils.formatNumber(subtotal_cancelar), {
          align: 'right',
          columns: 1,
          width: 60,
        });

        doc.font('Helvetica');
        subtotal_cancelar = 0;
      }

      subtotal_cancelar += utils.parseFloatN(monto_cancelar);
      total_cancelar += utils.parseFloatN(monto_cancelar);

      i += 16;
      if (i >= 480) {
        doc.fillColor('#BLACK');
        doc.addPage();
        page = page + 1;
        doc.switchToPage(page);
        i = 0;
        await this.generateHeader(doc, detalles);
      }
    }

    // Sub Totales por Agencia Finales
    i += 3;
    doc.font('Helvetica-Bold');
    doc.y = ymin + i;
    doc.x = 270;
    doc.text('Total Proveedor:', {
      align: 'right',
      columns: 1,
      width: 150,
    });
    doc.y = ymin + i;
    doc.x = 414;
    doc.text(utils.formatNumber(subtotal_cancelar), {
      align: 'right',
      columns: 1,
      width: 60,
    });

    i += 15;
    doc.lineWidth(1);
    doc
      .lineCap('butt')
      .moveTo(240, ymin + i)
      .lineTo(490, ymin + i)
      .stroke();

    i += 8;
    doc.y = ymin + i;
    doc.x = 270;
    doc.text('Total General de las Agencias:', {
      align: 'right',
      columns: 1,
      width: 150,
    });
    doc.y = ymin + i;
    doc.x = 414;
    doc.text(utils.formatNumber(total_cancelar), {
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

module.exports = PagosPendProvService;
