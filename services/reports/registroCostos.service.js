const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

class registroCostosService {
  async generateHeader(doc) {
    doc.image('./img/logo_rc.png', 35, 42, { width: 80 })
    .font('Helvetica-Bold')
    doc.fillColor('#444444')
    doc.fontSize(18);
    doc.y = 40;
    doc.x = 130;
    doc.text('Costos de Transporte Por Viaje', {
      align: 'left',
      columns: 1,
      width: 300,
    });
    doc.fontSize(8)
    .text('Fecha: 27/02/2022', 480, 35)
    doc.fillColor('black');
    doc.text('Transporte: Agente - Fabian Delgado', 130, 70)
    .text('Ayudante: Agente - Fabian Delgado', 130, 90)
    doc.fillColor('#444444')
    .text('Origen: VALENCIA, RCS EXPRESS', 130, 110)
    .text('Destino: VALENCIA, RCS EXPRESS', 130, 130)
    .text('Observacion:', 130, 150)
    doc.fillColor('black');
    doc.text('Anticipo: 12.312', 300, 70)
    .text('Anticipo: 12.321', 300, 90)
    doc.fillColor('#444444')
    .text('Fecha Envio: 03/10/2022', 390, 70)
    .text('Vehiculo: A23FD123', 390, 90)
    .text('Nro. Guia Flete: A23FD123', 390, 110)
    .text('ID: 123', 500, 70)
    doc.lineJoin('miter').rect(35, 180, 530, 50).stroke();
    doc.fontSize(11)
    doc.text('Flete sin IVA (Bs.)', 60, 192)
    doc.text('Ventas sin IVA (Bs.)', 170, 192)
    doc.text('Utilidad Operativa (Bs.)', 285, 192)
    doc.text('Utilidad Operativa (Bs.)', 420, 192)
    doc.y = 210;
    doc.x = 60;
    doc.text('234212312313123', {
      align: 'left',
      columns: 1,
      width: 100,
    });
    doc.y = 210;
    doc.x = 170;
    doc.text('234212312313123', {
      align: 'left',
      columns: 1,
      width: 100,
    });
    doc.y = 210;
    doc.x = 285;
    doc.text('234212312313123', {
      align: 'left',
      columns: 1,
      width: 100,
    });
    doc.y = 210;
    doc.x = 420;
    doc.text('234212312313123', {
      align: 'center',
      columns: 1,
      width: 100,
    });
    doc.text('Item', 35, 245)
    doc.text('Nro. Guía', 65, 245)
    doc.text('Emisión', 120, 245)
    doc.text('Remitente', 170, 245)
    doc.text('Destinatario', 280, 245)
    doc.text('Dest.', 385, 245)
    doc.text('Piezas', 420, 245)
    doc.text('Kgs', 460, 245)
    doc.text('Ventas sin IVA', 485, 245)
  }

  async generateCustomerInformation(doc) {
    var i = 0;
    var page = 0;
    var ymin = 270;

    for (var item = 0; item < 100; item++) {
      doc.fontSize(7);
      doc.fillColor('#444444')
      doc.y = ymin + i;
      doc.x = 45;
      doc.text(item, {
        align: 'left',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 70;
      doc.text('2342123', {
        align: 'left',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 125;
      doc.text('27/02/2022', {
        align: 'left',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 170;
      doc.text('AUTOPARTES ELIMOTORS CA', {
        align: 'left',
        columns: 1,
        width: 200,
      });
      doc.y = ymin + i;
      doc.x = 280;
      doc.text('AUTOPARTES ELIMOTORS CA', {
        align: 'left',
        columns: 1,
        width: 200,
      });
      doc.y = ymin + i;
      doc.x = 390;
      doc.text('MRD', {
        align: 'left',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 435;
      doc.text('223', {
        align: 'RIGHT',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 470;
      doc.text('223', {
        align: 'RIGHT',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 530;
      doc.text('122.02', {
        align: 'RIGHT',
        columns: 1,
        width: 50,
      });
      i+= 15;
      if (i >= 440 || item >= 100) {
        doc.fillColor('#BLACK')
        doc.y = ymin + i + 5;
        doc.x = 390;
        doc.text('TOTALES:', {
          align: 'RIGHT',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 435;
        doc.text('2313', {
          align: 'RIGHT',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 468;
        doc.text('1232', {
          align: 'RIGHT',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 530;
        doc.text('122.02', {
          align: 'RIGHT',
          columns: 1,
          width: 50,
        });
        doc.addPage();
        page = page + 1;
        doc.switchToPage(page);
        i = 0;
        await this.generateHeader(doc);
      }
    }
    doc.fillColor('#BLACK')
    doc.y = ymin + i + 5;
    doc.x = 390;
    doc.text('TOTALES:', {
      align: 'RIGHT',
      columns: 1,
      width: 50,
    });
    doc.y = ymin + i + 5;
    doc.x = 435;
    doc.text('2313', {
      align: 'RIGHT',
      columns: 1,
      width: 50,
    });
    doc.y = ymin + i + 5;
    doc.x = 468;
    doc.text('1232', {
      align: 'RIGHT',
      columns: 1,
      width: 50,
    });
    doc.y = ymin + i + 5;
    doc.x = 530;
    doc.text('122.02', {
      align: 'RIGHT',
      columns: 1,
      width: 50,
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
      doc.x = 480;
      doc.y = 50;
      doc.text(`Pagina ${i + 1} de ${range.count}`, {
        align: 'left',
        columns: 1,
        width: 100,
      });
   }
  }
}

module.exports = registroCostosService;
