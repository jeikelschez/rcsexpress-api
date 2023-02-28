const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

class registroCostosService {
  async generateHeader(doc) {
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
    doc.text('Autorizado Por: ', {
      align: 'right',
      columns: 1,
      width: 150,
    });
    doc.y = 105;
    doc.x = 590;
    doc.text('Impreso Por: ', {
      align: 'right',
      columns: 1,
      width: 150,
    });
    doc.fontSize(19);
    doc.y = 60;
    doc.x = 150;
    doc.text('REPORTE NUMERO 1', {
      align: 'center',
      columns: 1,
      width: 490,
    });
    doc.fontSize(13);
    doc.y = 90;
    doc.x = 240;
    doc.text('VALENCIA, RCS EXPRESS', {
      align: 'center',
      columns: 1,
      width: 300,
    });
    doc.text('Desde: 12/12/2022', 270, 110);
    doc.text('Hasta: 12/12/2022', 400, 110);
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
    doc.text('Kgs.', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
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

  async generateCustomerInformation(doc) {
    var i = 0;
    var page = 0;
    var ymin = 190;

    for (var item = 0; item < 20; item++) {
      doc.y = ymin + i;
      doc.x = 33;
      doc.text('2342', {
        align: 'center',
        columns: 1,
        width: 50,
      });
      if (i >= 290) {
      doc.addPage();
      page = page + 1;
      doc.switchToPage(page);
      i = 0;
      await this.generateHeader(doc);
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

module.exports = registroCostosService;
