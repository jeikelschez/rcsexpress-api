const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

class registroCostosService {
  async generateHeader(doc, tipo, data) {
    switch (tipo) {
      case 'RCT':
        doc.image('./img/logo_rc.png', 35, 42, { width: 80 });
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(18);
        doc.y = 90;
        doc.x = 180;
        doc.text('Resumen de Costos de Transporte', {
          align: 'left',
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
        doc.text('Fecha Envió', 35, 185);
        doc.text('Transp. Exter. (Bs.)', 92, 185);
        doc.text('Viáticos (Bs.)', 177, 185);
        doc.text('Total Costos (Bs.)', 238, 185);
        doc.text('Ingresos (Bs.)', 319, 185);
        doc.text('Utilidad Oper. (Bs.)', 385, 185);
        doc.text('% Costo', 470, 185);
        doc.text('% Utilidad', 510, 185);
        break;
      default:
        doc.image('./img/logo_rc.png', 155, 170, { width: 300 });
        break;
    }
  }

  async generateCustomerInformation(doc, tipo, data) {
    switch (tipo) {
      case 'RCT':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 210;
        for (var item = 0; item < 150; item++) {
          doc.fontSize(8);
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 35;
          doc.text('10/10/2022', {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 100;
          doc.text('123123345345345', {
            align: 'right',
            columns: 1,
            width: 70,
          });
          doc.y = ymin + i;
          doc.x = 180;
          doc.text('12312334534', {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 240;
          doc.text('1231233453', {
            align: 'right',
            columns: 1,
            width: 70,
          });
          doc.y = ymin + i;
          doc.x = 325;
          doc.text('12312334534', {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 390;
          doc.text('12312334', {
            align: 'right',
            columns: 1,
            width: 70,
          });
          doc.y = ymin + i;
          doc.x = 475;
          doc.text('1231', {
            align: 'right',
            columns: 1,
            width: 25,
          });
          doc.y = ymin + i;
          doc.x = 530;
          doc.text('1231', {
            align: 'right',
            columns: 1,
            width: 25,
          });
          i += 20;
          if (i >= 480) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc);
          }
        }
        doc.fillColor('#BLACK');
        doc.y = ymin + i + 5;
        doc.x = 35;
        doc.text('TOTALES:', {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 100;
        doc.text('123123345345345', {
          align: 'right',
          columns: 1,
          width: 70,
        });
        doc.y = ymin + i + 5;
        doc.x = 180;
        doc.text('12312334534', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 240;
        doc.text('1231233453', {
          align: 'right',
          columns: 1,
          width: 70,
        });
        doc.y = ymin + i + 5;
        doc.x = 325;
        doc.text('12312334534', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 390;
        doc.text('12312334', {
          align: 'right',
          columns: 1,
          width: 70,
        });
        doc.y = ymin + i + 5;
        doc.x = 475;
        doc.text('1231', {
          align: 'right',
          columns: 1,
          width: 25,
        });
        doc.y = ymin + i + 5;
        doc.x = 530;
        doc.text('1231', {
          align: 'right',
          columns: 1,
          width: 25,
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
          doc.x = 455;
          doc.y = 50;
          doc.text(`Pagina ${i + 1} de ${range.count}`, {
            align: 'right',
            columns: 1,
            width: 100,
          });
        }
      default:
        break;
    }
  }
}

module.exports = registroCostosService;
