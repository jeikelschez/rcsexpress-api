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

class ReporteVentasService {
  async mainReport(doc, tipo, data) {
    await this.generateHeader(doc, tipo, data);
    await this.generateCustomerInformation(doc, tipo, data);
  }

  async generateHeader(doc, tipo, data) {
    switch (tipo) {
      case 'RCT':
        doc.image('./img/logo_rc.png', 35, 25, { width: 80 });
        doc.fontSize(9);
        doc.text('RCS EXPRESS, S.A', 35, 155);
        doc.text('RIF. J-31028463-6', 35, 170);
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(18);
        doc.y = 90;
        doc.x = 175;
        doc.text('Ventas Generales', {
          align: 'center',
          columns: 1,
          width: 300,
        });
        doc.fontSize(12);
        doc.y = 130;
        doc.x = 210;
        doc.text('Desde: 10/10/2022', {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 130;
        doc.x = 330;
        doc.text('Hasta: 10/10/2022', {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.fontSize(9);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 480, 35);
        doc.text('Fecha Emision', 35, 190);
        doc.text('Nro. Guia', 110, 190);
        doc.text('Remitente', 165, 190);
        doc.text('Destinatario', 240, 190);
        doc.text('Dest.', 325, 190);
        doc.text('Pzas', 355, 190);
        doc.text('Kg.', 383, 190);
        doc.text('Origen', 405, 190);
        doc.text('Imp.', 440, 190);
        doc.text('Destino', 462, 190);
        doc.text('Imp.', 500, 190);
        doc.text('Monto', 525, 190);
        doc.text('Imp.', 560, 190);
        break;
      default:
        break;
    }
  }

  async generateCustomerInformation(doc, tipo, data) {
    switch (tipo) {
      case 'RCT':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 205;
        for (var item = 0; item < 10; item++) {
          doc.fontSize(7);
          doc.fillColor('#444444');
          doc.text('VALENCIA, RCS EXPRESS', 35, ymin + i);
          doc.text('10/10/2022', 35, ymin + i + 15);
          doc.y = ymin + i + 15;
          doc.x = 105;
          doc.text('AS1231S', {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i + 15;
          doc.x = 165;
          doc.text('GABRIEL SANCHEZ', {
            align: 'center',
            columns: 1,
            width: 70,
          });
          doc.y = ymin + i + 15;
          doc.x = 240;
          doc.text('JEIKEL SANCHEZ', {
            align: 'center',
            columns: 1,
            width: 75,
          });
          doc.y = ymin + i + 15;
          doc.x = 325;
          doc.text('ADA', {
            align: 'center',
            columns: 1,
            width: 20,
          });
          doc.y = ymin + i + 15;
          doc.x = 355;
          doc.text('122', {
            align: 'center',
            columns: 1,
            width: 20,
          });
          doc.y = ymin + i + 15;
          doc.x = 383;
          doc.text('12.51', {
            align: 'center',
            columns: 1,
            width: 20,
          });
          doc.y = ymin + i + 15;
          doc.x = 410;
          doc.text('ERT', {
            align: 'center',
            columns: 1,
            width: 20,
          });
          doc.y = ymin + i + 15;
          doc.x = 438;
          doc.text('123.34', {
            align: 'center',
            columns: 1,
            width: 20,
          });
          doc.y = ymin + i + 15;
          doc.x = 465;
          doc.text('SDE', {
            align: 'center',
            columns: 1,
            width: 20,
          });
          doc.y = ymin + i + 15;
          doc.x = 498;
          doc.text('123.34', {
            align: 'center',
            columns: 1,
            width: 20,
          });
          doc.y = ymin + i + 15;
          doc.x = 526;
          doc.text('QAS', {
            align: 'center',
            columns: 1,
            width: 25,
          });
          doc.y = ymin + i + 15;
          doc.x = 560;
          doc.text('123.34', {
            align: 'center',
            columns: 1,
            width: 30,
          });
          i += 30;
          if (i >= 480) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data);
          }
        }
        break;
      default:
        break;
    }
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
      doc.x = tipo == 'CTA' ? 646 : 446;
      doc.y = 50;
      doc.text(`Pagina ${i + 1} de ${range.count}`, {
        align: 'right',
        columns: 1,
        width: 100,
      });
    }
  }
}

module.exports = ReporteVentasService;
