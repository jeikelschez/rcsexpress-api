const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

const clienteOrigDesc =
  '(CASE WHEN (id_clte_part_orig IS NULL || id_clte_part_orig = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `detalles->movimientos`.cod_cliente_org = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `detalles->movimientos`.id_clte_part_orig = clientes_particulares.id)' +
  ' END)';

class CobranzasService {
  async mainReport(doc, id) {
    let detalles = await models.Mcobranzas.findAll({
      where: {
        id: id,
      },
      include: [
        {
          model: models.Dcobranzas,
          as: 'detalles',
          include: [
            {
              model: models.Mmovimientos,
              as: 'movimientos',
              attributes: [
                'nro_control',
                'fecha_emision',
                [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
              ],
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
        {
          model: models.Agencias,
          as: 'agencias',
          attributes: [],
          include: [
            {
              model: models.Ciudades,
              as: 'ciudades',
              attributes: ['siglas'],
            },
          ],
        },
      ],
      raw: true,
    });

    if (detalles.length == 0) return false;

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
    doc.fontSize(20);

    let tittle = 'Ingreso de Caja';
    doc.y = 100;
    doc.x = 130;
    doc.text(tittle, {
      align: 'center',
      columns: 1,
      width: 400,
    });

    doc.fontSize(14);
    doc.text('Nro:', 475, 170);
    doc.y = 170;
    doc.x = 515;
    doc.text(detalles[0].ingreso_caja, {
      align: 'center',
      columns: 1,
      width: 50,
    });

    doc.fontSize(10);
    doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 500, 35);
    doc.lineWidth(0.5);

    doc.lineJoin('miter').rect(30, 195, 80, 42).stroke();
    doc.text('Fecha', 55, 202);
    doc.y = 220;
    doc.x = 30;
    doc.text(moment(detalles[0].fecha_deposito).format('DD/MM/YYYY'), {
      align: 'center',
      columns: 1,
      width: 80,
    });
    doc.lineJoin('miter').rect(112, 195, 100, 42).stroke();
    doc.text('Banco', 147, 200);
    doc.y = detalles[0]['cuentas.bancos.nb_banco'].length < 11 ? 220 : 213;
    doc.x = 114;
    doc.text(detalles[0]['cuentas.bancos.nb_banco'], {
      align: 'center',
      columns: 1,
      width: 100,
    });
    doc.lineJoin('miter').rect(214, 195, 132, 42).stroke();
    doc.text('Cuenta', 265, 200);
    doc.y = 220;
    doc.x = 214;
    doc.text(detalles[0]['cuentas.nro_cuenta'], {
      align: 'center',
      columns: 1,
      width: 132,
    });
    doc.lineJoin('miter').rect(348, 195, 110, 42).stroke();
    doc.text('Ingresos', 382, 200);
    doc.y = 220;
    doc.x = 348;
    doc.text(
      new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        currencyDisplay: 'code',
      })
        .format(detalles[0].monto_cobrado)
        .replace('EUR', '')
        .trim(),
      {
        align: 'center',
        columns: 1,
        width: 110,
      }
    );
    doc.lineJoin('miter').rect(460, 195, 118, 42).stroke();
    doc.text('Total Depósito', 483, 200);
    doc.y = 220;
    doc.x = 460;
    doc.text(
      new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        currencyDisplay: 'code',
      })
        .format(detalles[0].monto_deposito)
        .replace('EUR', '')
        .trim(),
      {
        align: 'center',
        columns: 1,
        width: 118,
      }
    );

    doc.fontSize(9);
    doc.lineJoin('miter').rect(30, 239, 548, 20).stroke();
    doc.text('DETALLE DEL INGRESO', 263, 245);

    doc.fontSize(8);
    doc.lineJoin('miter').rect(30, 261, 141, 26).stroke();
    doc.text('Cliente', 95, 266);
    doc.lineJoin('miter').rect(173, 261, 40, 26).stroke();
    doc.text('Nº', 190, 266);
    doc.text('Factura', 178, 275);
    doc.lineJoin('miter').rect(215, 261, 50, 26).stroke();
    doc.text('Fecha', 229, 266);
    doc.text('Factura', 226, 275);
    doc.lineJoin('miter').rect(267, 261, 55, 26).stroke();
    doc.text('Monto', 285, 266);
    doc.text('Factura', 282, 275);
    doc.lineJoin('miter').rect(324, 261, 50, 26).stroke();
    doc.text('Ret. ISLR', 331, 266);
    doc.text('3%', 343, 275);
    doc.lineJoin('miter').rect(376, 261, 40, 26).stroke();
    doc.text('Ret. IVA', 381, 266);
    doc.text('75%', 389, 275);
    doc.lineJoin('miter').rect(418, 261, 40, 26).stroke();
    doc.text('Estación', 421, 266);
    doc.lineJoin('miter').rect(460, 261, 118, 26).stroke();
    doc.text('Observación', 495, 266);
  }

  async generateCustomerInformation(doc, detalles) {
    var i = 0;
    var page = 0;
    var ymin;
    ymin = 294;
    for (var item = 0; item < detalles.length; item++) {
      doc.font('Helvetica');
      doc.fillColor('#444444');

      doc
        .lineJoin('miter')
        .rect(30, ymin + i - 5, 141, 23)
        .stroke();
      doc.y = ymin + i;
      doc.x = 30;
      doc.text(detalles[item]['detalles.movimientos.cliente_orig_desc'], {
        align: 'center',
        columns: 1,
        width: 141,
      });
      doc
        .lineJoin('miter')
        .rect(173, ymin + i - 5, 40, 23)
        .stroke();
      doc.y = ymin + i;
      doc.x = 173;
      doc.text(detalles[item]['detalles.movimientos.nro_control'], {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc
        .lineJoin('miter')
        .rect(215, ymin + i - 5, 50, 23)
        .stroke();
      doc.y = ymin + i;
      doc.x = 215;
      doc.text(
        moment(detalles[item]['detalles.movimientos.fecha_emision']).format(
          'DD/MM/YYYY'
        ),
        {
          align: 'center',
          columns: 1,
          width: 50,
        }
      );
      doc
        .lineJoin('miter')
        .rect(267, ymin + i - 5, 55, 23)
        .stroke();
      doc.y = ymin + i;
      doc.x = 265;
      doc.text(utils.formatNumber(detalles[item]['detalles.monto_pagado']), {
        align: 'right',
        columns: 1,
        width: 55,
      });
      doc
        .lineJoin('miter')
        .rect(324, ymin + i - 5, 50, 23)
        .stroke();
      doc.y = ymin + i;
      doc.x = 322;
      doc.text(utils.formatNumber(detalles[item]['detalles.islr_retenido']), {
        align: 'right',
        columns: 1,
        width: 50,
      });
      doc
        .lineJoin('miter')
        .rect(376, ymin + i - 5, 40, 23)
        .stroke();
      doc.y = ymin + i;
      doc.x = 374;
      doc.text(utils.formatNumber(detalles[item]['detalles.iva_retenido']), {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc
        .lineJoin('miter')
        .rect(418, ymin + i - 5, 40, 23)
        .stroke();
      doc.y = ymin + i;
      doc.x = 418;
      doc.text(detalles[item]['agencias.ciudades.siglas'], {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc
        .lineJoin('miter')
        .rect(460, ymin + i - 5, 118, 23)
        .stroke();
      doc.y = ymin + i;
      doc.x = 460;
      doc.text(detalles[item]['detalles.observacion'], {
        align: 'center',
        columns: 1,
        width: 118,
      });

      i += 25;
      if (i >= 450) {
        doc.fillColor('#BLACK');
        doc.addPage();
        page = page + 1;
        doc.switchToPage(page);
        i = 20;
        await this.generateHeader(doc, detalles);
      }
    }

    let y = ymin + i;
    doc.font('Helvetica-Bold');
    doc.text('DETALLE DEL DEPÓSITO', 470, y + 5);
    doc.y = y + 22;
    doc.x = 445;
    doc.text('Total Ingreso:', {
      align: 'right',
      columns: 1,
      width: 80,
    });
    doc.y = y + 22;
    doc.x = 515;
    doc.text(utils.formatNumber(detalles[0].monto_cobrado), {
      align: 'right',
      columns: 1,
      width: 60,
    });
    doc.y = y + 35;
    doc.x = 445;
    doc.text('Impuesto Retenido:', {
      align: 'right',
      columns: 1,
      width: 80,
    });
    doc.y = y + 35;
    doc.x = 515;
    doc.text(utils.formatNumber(detalles[0].monto_retenido * -1), {
      align: 'right',
      columns: 1,
      width: 60,
    });
    doc.y = y + 48;
    doc.x = 445;
    doc.text('Total Depósito:', {
      align: 'right',
      columns: 1,
      width: 80,
    });
    doc.y = y + 48;
    doc.x = 515;
    doc.text(utils.formatNumber(detalles[0].monto_deposito), {
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

module.exports = CobranzasService;
