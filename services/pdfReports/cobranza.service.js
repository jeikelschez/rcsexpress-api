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
    doc.fontSize(24);

    doc.y = 70;
    doc.x = 200;
    doc.text('Ingreso de Caja', {
      align: 'center',
      columns: 1,
      width: 400,
    });

    doc.fontSize(14);
    doc.text('Nro:', 660, 170);
    doc.y = 170;
    doc.x = 690;
    doc.text(detalles[0].ingreso_caja, {
      align: 'center',
      columns: 1,
      width: 70,
    });

    doc.fontSize(9);
    doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 680, 35);

    doc.fontSize(12);
    doc.lineWidth(0.5);

    doc.lineJoin('miter').rect(30, 195, 110, 44).stroke();
    doc.y = 205;
    doc.x = 30;
    doc.text('Fecha',
      {
        align: 'center',
        columns: 1,
        width: 110,
      }
    );
    doc.y = 220;
    doc.x = 30;
    doc.text(moment(detalles[0].fecha_deposito).format('DD/MM/YYYY'), {
      align: 'center',
      columns: 1,
      width: 110,
    });
    doc.lineJoin('miter').rect(140, 195, 140, 44).stroke();
    doc.y = 205;
    doc.x = 140;
    doc.text('Banco',
      {
        align: 'center',
        columns: 1,
        width: 140,
      }
    );
    doc.y = 220;
    doc.x = 140;
    doc.text(detalles[0]['cuentas.bancos.nb_banco'], {
      align: 'center',
      columns: 1,
      width: 140,
    });
    doc.lineJoin('miter').rect(280, 195, 170, 44).stroke();
    doc.y = 205;
    doc.x = 280;
    doc.text('Cuenta',
      {
        align: 'center',
        columns: 1,
        width: 170,
      }
    );
    doc.y = 220;
    doc.x = 280;
    doc.text(detalles[0]['cuentas.nro_cuenta'], {
      align: 'center',
      columns: 1,
      width: 170,
    });
    doc.lineJoin('miter').rect(450, 195, 150, 44).stroke();
    doc.y = 205;
    doc.x = 450;
    doc.text('Ingresos',
      {
        align: 'center',
        columns: 1,
        width: 150,
      }
    );
    doc.y = 220;
    doc.x = 450;
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
        width: 150,
      }
    );
    doc.lineJoin('miter').rect(600, 195, 153, 44).stroke();
    doc.y = 205;
    doc.x = 600;
    doc.text('Total Depósito',
      {
        align: 'center',
        columns: 1,
        width: 153,
      }
    );
    doc.y = 220;
    doc.x = 600;
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
        width: 153,
      }
    );

    doc.fontSize(12);
    doc.lineJoin('miter').rect(30, 239, 723, 25).stroke();
    doc.y = 248;
    doc.x = 30;
    doc.text('DETALLE DEL INGRESO', {
      align: 'center',
      columns: 1,
      width: 723,
    });

    doc.fontSize(10);
    doc.lineJoin('miter').rect(30, 266, 194, 26).stroke();
    doc.y = 270;
    doc.x = 30;
    doc.text('Cliente', {
      align: 'center',
      columns: 1,
      width: 194,
    });
    doc.lineJoin('miter').rect(226, 266, 50, 26).stroke();
    doc.y = 270;
    doc.x = 226;
    doc.text('Nº', {
      align: 'center',
      columns: 1,
      width: 50,
    });
    doc.y = 282;
    doc.x = 226;
    doc.text('Factura', {
      align: 'center',
      columns: 1,
      width: 50,
    });
    doc.lineJoin('miter').rect(278, 266, 55, 26).stroke();
    doc.y = 270;
    doc.x = 278;
    doc.text('Fecha', {
      align: 'center',
      columns: 1,
      width: 55,
    });
    doc.y = 282;
    doc.x = 278;
    doc.text('Factura', {
      align: 'center',
      columns: 1,
      width: 55,
    });
    doc.lineJoin('miter').rect(335, 266, 70, 26).stroke();
    doc.y = 270;
    doc.x = 335;
    doc.text('Monto', {
      align: 'center',
      columns: 1,
      width: 70,
    });
    doc.y = 282;
    doc.x = 335;
    doc.text('Factura', {
      align: 'center',
      columns: 1,
      width: 70,
    });
    doc.lineJoin('miter').rect(407, 266, 50, 26).stroke();
    doc.y = 270;
    doc.x = 407;
    doc.text('Ret. ISLR', {
      align: 'center',
      columns: 1,
      width: 50,
    });
    doc.y = 282;
    doc.x = 407;
    doc.text('3%', {
      align: 'center',
      columns: 1,
      width: 50,
    });
    doc.lineJoin('miter').rect(459, 266, 50, 26).stroke();
    doc.y = 270;
    doc.x = 459;
    doc.text('Ret. IVA', {
      align: 'center',
      columns: 1,
      width: 50,
    });
    doc.y = 282;
    doc.x = 459;
    doc.text('75%', {
      align: 'center',
      columns: 1,
      width: 50,
    });
    doc.lineJoin('miter').rect(511, 266, 50, 26).stroke();
    doc.y = 270;
    doc.x = 511;
    doc.text('Estación', {
      align: 'center',
      columns: 1,
      width: 50,
    });
    doc.lineJoin('miter').rect(563, 266, 190, 26).stroke();
    doc.y = 270;
    doc.x = 563;
    doc.text('Observación', {
      align: 'center',
      columns: 1,
      width: 190,
    });
  }

  async generateCustomerInformation(doc, detalles) {
    var i = 0;
    var page = 0;
    var ymin;
    ymin = 300;
    for (var item = 0; item < detalles.length; item++) {
      doc.fontSize(9);
      doc.font('Helvetica');
      doc.fillColor('#444444');

      doc
        .lineJoin('miter')
        .rect(30, ymin + i - 5, 194, 28)
        .stroke();
      doc.y = ymin + i;
      doc.x = 30;
      doc.text(detalles[item]['detalles.movimientos.cliente_orig_desc'], {
        align: 'center',
        columns: 1,
        width: 194,
      });
      doc
        .lineJoin('miter')
        .rect(226, ymin + i - 5, 50, 28)
        .stroke();
      doc.y = ymin + i;
      doc.x = 226;
      doc.text(detalles[item]['detalles.movimientos.nro_control'], {
        align: 'center',
        columns: 1,
        width: 50,
      });
      doc
        .lineJoin('miter')
        .rect(278, ymin + i - 5, 55, 28)
        .stroke();
      doc.y = ymin + i;
      doc.x = 278;
      doc.text(
        moment(detalles[item]['detalles.movimientos.fecha_emision']).format(
          'DD/MM/YYYY'
        ),
        {
          align: 'center',
          columns: 1,
          width: 55,
        }
      );
      doc
        .lineJoin('miter')
        .rect(335, ymin + i - 5, 70, 28)
        .stroke();
      doc.y = ymin + i;
      doc.x = 335;
      doc.text(utils.formatNumber(detalles[item]['detalles.monto_pagado']), {
        align: 'right',
        columns: 1,
        width: 67,
      });
      doc
        .lineJoin('miter')
        .rect(407, ymin + i - 5, 50, 28)
        .stroke();
      doc.y = ymin + i;
      doc.x = 407;
      doc.text(utils.formatNumber(detalles[item]['detalles.islr_retenido']), {
        align: 'right',
        columns: 1,
        width: 47,
      });
      doc
        .lineJoin('miter')
        .rect(459, ymin + i - 5, 50, 28)
        .stroke();
      doc.y = ymin + i;
      doc.x = 459;
      doc.text(utils.formatNumber(detalles[item]['detalles.iva_retenido']), {
        align: 'right',
        columns: 1,
        width: 47,
      });
      doc
        .lineJoin('miter')
        .rect(511, ymin + i - 5, 50, 28)
        .stroke();
      doc.y = ymin + i;
      doc.x = 511;
      doc.text(detalles[item]['agencias.ciudades.siglas'], {
        align: 'center',
        columns: 1,
        width: 50,
      });
      doc
        .lineJoin('miter')
        .rect(563, ymin + i - 5, 190, 28)
        .stroke();
      doc.y = ymin + i;
      doc.x = 563;
      doc.text(detalles[item]['detalles.observacion'], {
        align: 'center',
        columns: 1,
        width: 190,
      });

      i += 30;
      if (i >= 450) {
        doc.fillColor('#BLACK');
        doc.addPage();
        page = page + 1;
        doc.switchToPage(page);
        i = 20;
        await this.generateHeader(doc, detalles);
      }
    }
    
    doc.font('Helvetica-Bold');
    let y = ymin + i - 3;
    
    doc.fontSize(11);
    doc.lineJoin('miter').rect(600, y, 153, 25).stroke();
    doc.text('DETALLE DEL DEPÓSITO', 608, y + 7);

    doc.fontSize(10);
    doc.y = y + 33;
    doc.x = 585;
    doc.text('Total Ingreso:', {
      align: 'right',
      columns: 1,
      width: 100,
    });
    doc.y = y + 33;
    doc.x = 665;
    doc.text(utils.formatNumber(detalles[0].monto_cobrado), {
      align: 'right',
      columns: 1,
      width: 80,
    });
    doc.y = y + 53;
    doc.x = 585;
    doc.text('Impuesto Retenido:', {
      align: 'right',
      columns: 1,
      width: 100,
    });
    doc.y = y + 53;
    doc.x = 665;
    doc.text(utils.formatNumber(detalles[0].monto_retenido * -1), {
      align: 'right',
      columns: 1,
      width: 80,
    });
    doc.y = y + 73;
    doc.x = 585;
    doc.text('Total Depósito:', {
      align: 'right',
      columns: 1,
      width: 100,
    });
    doc.y = y + 73;
    doc.x = 665;
    doc.text(utils.formatNumber(detalles[0].monto_deposito), {
      align: 'right',
      columns: 1,
      width: 80,
    });

    var end;
    const range = doc.bufferedPageRange();
    for (
      i = range.start, end = range.start + range.count, range.start <= end;
      i < end;
      i++
    ) {
      doc.switchToPage(i);
      doc.fontSize(9);
      doc.fillColor('#444444');
      doc.x = 655;
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
