const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

class registroCostosService {
  async generateHeader(doc, tipo) {
    switch (tipo) {
      case 'DE':
        doc.image('./img/logo_rc.png', 35, 42, { width: 80 })
        doc.font('Helvetica-Bold')
        doc.fillColor('#444444')
        doc.fontSize(18);
        doc.y = 50;
        doc.x = 130;
        doc.text('Costos de Transporte Por Viaje', {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.fontSize(8)
        .text('Fecha: 27/02/2022', 480, 35)
        doc.fillColor('black');
        doc.text('Transporte: Agente - Fabian Delgado', 130, 83)
        .text('Ayudante: Agente - Fabian Delgado', 130, 100)
        doc.fillColor('#444444')
        .text('Origen: VALENCIA, RCS EXPRESS', 130, 117)
        .text('Destino: VALENCIA, RCS EXPRESS', 130, 134)
        .text('Observacion:', 130, 150)
        doc.fillColor('black');
        doc.text('Anticipo:', 300, 83)
        doc.y = 83;
        doc.x = 335;
        doc.text('12.321', {
          align: 'right',
          columns: 1,
          width: 30,
        });
        doc.text('Anticipo:', 300, 100)
        doc.y = 100;
        doc.x = 335;
        doc.text('12.321', {
          align: 'right',
          columns: 1,
          width: 30,
        });
        doc.fillColor('#444444')
        .text('Fecha Envio: 03/10/2022', 390, 83)
        .text('Vehiculo: A23FD123', 390, 100)
        .text('Nro. Guia Flete: A23FD123', 390, 117)
        .text('ID: 123', 500, 83)
        doc.lineJoin('miter').rect(35, 180, 530, 50).stroke();
        doc.fontSize(11)
        doc.text('Flete sin IVA (Bs.)', 60, 192)
        doc.text('Ventas sin IVA (Bs.)', 170, 192)
        doc.text('Utilidad Operativa (Bs.)', 285, 192)
        doc.text('% Costo', 425, 192)
        doc.text('% Utilidad', 490, 192)
        doc.fontSize(8)
        doc.text('Fecha: 27/02/2022', 480, 35)
        doc.y = 210;
        doc.x = 50;
        doc.text('2342121231231231', {
          align: 'right',
          columns: 1,
          width: 100,
        });
        doc.y = 210;
        doc.x = 165;
        doc.text('2342123112313213', {
          align: 'right',
          columns: 1,
          width: 100,
        });
        doc.y = 210;
        doc.x = 290;
        doc.text('2342123112312323', {
          align: 'right',
          columns: 1,
          width: 100,
        });
        doc.y = 210;
        doc.x = 415;
        doc.text('2342', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = 210;
        doc.x = 485;
        doc.text('23421', {
          align: 'right',
          columns: 1,
          width: 50,
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
      break;

      case 'GE':
        doc.image('./img/logo_rc.png', 35, 42, { width: 70 })
        doc.font('Helvetica-Bold')
        doc.fillColor('#444444')
        doc.fontSize(18);
        doc.y = 100;
        doc.x = 190;
        doc.text('Resumen de Costos de Transporte', {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.lineJoin('miter').rect(35, 160, 530, 50).stroke();
        doc.fontSize(11)
        doc.text('Flete sin IVA (Bs.)', 60, 172)
        doc.text('Ventas sin IVA (Bs.)', 170, 172)
        doc.text('Utilidad Operativa (Bs.)', 285, 172)
        doc.text('% Costo', 425, 172)
        doc.text('% Utilidad', 490, 172)
        doc.text('Distribución del Costo de Transporte Segun Destino', 35, 223)
        doc.fontSize(8)
        doc.text('Fecha: 27/02/2022', 480, 35)
        doc.y = 190;
        doc.x = 50;
        doc.text('2342121231231231', {
          align: 'right',
          columns: 1,
          width: 100,
        });
        doc.y = 190;
        doc.x = 165;
        doc.text('2342123112313213', {
          align: 'right',
          columns: 1,
          width: 100,
        });
        doc.y = 190;
        doc.x = 290;
        doc.text('2342123112312323', {
          align: 'right',
          columns: 1,
          width: 100,
        });
        doc.y = 190;
        doc.x = 415;
        doc.text('2342', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = 190;
        doc.x = 485;
        doc.text('23421', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.fontSize(9)
        doc.text('Destino', 35, 245)
        doc.text('Cant. Guías', 100, 245)
        doc.text('Piezas', 175, 245)
        doc.text('Kgs', 230, 245)
        doc.text('Ventas sin IVA', 275, 245)
        doc.text('% Costo p/Dest.', 360, 245)
        doc.text('Costo Distrib.p/Dest. (Bs.)', 450, 245)
      break;

      case 'RE':
        doc.image('./img/logo_rc.png', 35, 42, { width: 70 })
        doc.font('Helvetica-Bold')
        doc.fillColor('#444444')
        doc.fontSize(15);
        doc.y = 40;
        doc.x = 130;
        doc.text('Distribución de Costos de Transporte Por Viaje', {
          align: 'left',
          columns: 1,
          width: 350,
        });
        doc.fontSize(8)
        .text('Fecha: 27/02/2022', 480, 35)
        doc.fillColor('black');
        doc.text('Transporte: Agente - Fabian Delgado', 130, 70)
        .text('Ayudante: Agente - Fabian Delgado', 130, 90)
        doc.fillColor('#444444')
        .text('Origen: VALENCIA, RCS EXPRESS', 130, 110)
        .text('Destino: VALENCIA, RCS EXPRESS', 130, 126)
        .text('Observacion:', 130, 142)
        doc.fillColor('black');
        doc.text('Anticipo:', 300, 70)
        doc.y = 70;
        doc.x = 335;
        doc.text('12.321', {
          align: 'right',
          columns: 1,
          width: 30,
        });
        doc.text('Anticipo:', 300, 90)
        doc.y = 90;
        doc.x = 335;
        doc.text('12.321', {
          align: 'right',
          columns: 1,
          width: 30,
        });
        doc.fillColor('#444444')
        .text('Fecha Envio: 03/10/2022', 390, 70)
        .text('Vehiculo: A23FD123', 390, 90)
        .text('Nro. Guia Flete: A23FD123', 390, 110)
        .text('ID: 123', 500, 70)
        doc.lineJoin('miter').rect(35, 160, 530, 50).stroke();
        doc.fontSize(11)
        doc.text('Flete sin IVA (Bs.)', 60, 172)
        doc.text('Ventas sin IVA (Bs.)', 170, 172)
        doc.text('Utilidad Operativa (Bs.)', 285, 172)
        doc.text('% Costo', 425, 172)
        doc.text('% Utilidad', 490, 172)
        doc.text('Distribución del Costo de Transporte Segun Destino', 35, 223)
        doc.fontSize(8)
        doc.text('Fecha: 27/02/2022', 480, 35)
        doc.y = 190;
        doc.x = 50;
        doc.text('2342121231231231', {
          align: 'right',
          columns: 1,
          width: 100,
        });
        doc.y = 190;
        doc.x = 165;
        doc.text('2342123112313213', {
          align: 'right',
          columns: 1,
          width: 100,
        });
        doc.y = 190;
        doc.x = 290;
        doc.text('2342123112312323', {
          align: 'right',
          columns: 1,
          width: 100,
        });
        doc.y = 190;
        doc.x = 415;
        doc.text('2342', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = 190;
        doc.x = 485;
        doc.text('23421', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.fontSize(9)
        doc.text('Destino', 35, 245)
        doc.text('Cant. Guías', 100, 245)
        doc.text('Piezas', 175, 245)
        doc.text('Kgs', 230, 245)
        doc.text('Ventas sin IVA', 275, 245)
        doc.text('% Costo p/Dest.', 360, 245)
        doc.text('Costo Distrib.p/Dest. (Bs.)', 450, 245)
      break;
      
      case 'DI':
        doc.image('./img/logo_rc.png', 35, 42, { width: 70 })
        doc.font('Helvetica-Bold')
        doc.fillColor('#444444')
        doc.fontSize(12)
        .text('Fecha: 27/02/2022', 650, 30)
        doc.text('Ruta VLN: ___________________', 550, 75)
        doc.text('Ruta VLN: ___________________', 550, 95)
        doc.text('Hidroca: _____________________', 550, 115)
        doc.text('Hidroca: _____________________', 550, 135)
        doc.fontSize(20);
        doc.y = 120;
        doc.x = 180;
        doc.text('Relación de Transporte Diario', {
          align: 'left',
          columns: 1,
          width: 300,
        });
      break;

    }
  }

  async generateCustomerInformation(doc, tipo) {
    var i = 0;
    var page = 0;
    var ymin;
    switch (tipo) {
    case 'DE':  
      ymin = 270;
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
        doc.x = 75;
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
          doc.addPage();
          page = page + 1;
          doc.switchToPage(page);
          i = 0;
          await this.generateHeader(doc, 'DE');
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
    break;
    case 'GE':
      ymin = 270;
      for (var item = 0; item < 100; item++) {
        doc.fontSize(9);
        doc.fillColor('#444444')
        doc.y = ymin + i;
        doc.x = 50;
        doc.text('AMD', {
          align: 'left',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i;
        doc.x = 110;
        doc.text('AAAAA', {
          align: 'left',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i;
        doc.x = 150;
        doc.text('123', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i;
        doc.x = 197;
        doc.text('123', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i;
        doc.x = 280;
        doc.text('123123', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i;
        doc.x = 400;
        doc.text('1231%', {
          align: 'RIGHT',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i;
        doc.x = 530;
        doc.text('1231%', {
          align: 'RIGHT',
          columns: 1,
          width: 50,
        });
        i+= 15;
        if (i >= 440 || item >= 100) {
          doc.addPage();
          page = page + 1;
          doc.switchToPage(page);
          i = 0;
          await this.generateHeader(doc, 'GE');
        }
      }
      doc.fillColor('#BLACK')
          doc.y = ymin + i + 5;
        doc.x = 50;
        doc.text('TOTALES:', {
          align: 'left',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 110;
        doc.text('AAAAA', {
          align: 'left',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 150;
        doc.text('123', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 197;
        doc.text('123', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 280;
        doc.text('123123', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 400;
        doc.text('1231%', {
          align: 'RIGHT',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 530;
        doc.text('1231%', {
          align: 'RIGHT',
          columns: 1,
          width: 50,
        });
    break;
    case 'RE':
      ymin = 270;
      for (var item = 0; item < 100; item++) {
        doc.fontSize(9);
        doc.fillColor('#444444')
        doc.y = ymin + i;
        doc.x = 50;
        doc.text('AMD', {
          align: 'left',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i;
        doc.x = 110;
        doc.text('AAAAA', {
          align: 'left',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i;
        doc.x = 150;
        doc.text('123', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i;
        doc.x = 197;
        doc.text('123', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i;
        doc.x = 280;
        doc.text('123123', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i;
        doc.x = 400;
        doc.text('1231%', {
          align: 'RIGHT',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i;
        doc.x = 530;
        doc.text('1231%', {
          align: 'RIGHT',
          columns: 1,
          width: 50,
        });
        i+= 15;
        if (i >= 440 || item >= 100) {
          doc.addPage();
          page = page + 1;
          doc.switchToPage(page);
          i = 0;
          await this.generateHeader(doc, 'RE');
        }
      }
      doc.fillColor('#BLACK')
          doc.y = ymin + i + 5;
        doc.x = 50;
        doc.text('TOTALES:', {
          align: 'left',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 110;
        doc.text('AAAAA', {
          align: 'left',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 150;
        doc.text('123', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 197;
        doc.text('123', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 280;
        doc.text('123123', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 400;
        doc.text('1231%', {
          align: 'RIGHT',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 530;
        doc.text('1231%', {
          align: 'RIGHT',
          columns: 1,
          width: 50,
        });
    break;
    case 'DI':
      ymin = 160;
      for (var item = 0; item < 100; item++) {
        doc.fillColor('#444444')
        doc.lineJoin('miter').rect(35, ymin + i, 720, 70).stroke();
        doc.fontSize(10)
        doc.text('Origen: VALENCIA, RCS EXPRESS, S.A.', 50, ymin + i + 13)
        doc.text('Chofer: VALENCIA, RCS EXPRESS, S.A.', 50, ymin + i + 33)
        doc.text('Ayudante: VALENCIA, RCS EXPRESS, S.A.', 50, ymin + i + 51)
        doc.text('Destinos: VALENCIA, RCS EXPRESS, S.A.', 270, ymin + i + 13)
        doc.text('Anticipo: VALENCIA, RCS EXPRESS, S.A.', 270, ymin + i + 33)
        doc.text('Anticipo: VALENCIA, RCS EXPRESS, S.A.', 270, ymin + i + 51)
        doc.text('Vehiculo: VALENCIA, RCS EXPRESS, S.A.', 490, ymin + i + 13)
        doc.text('Observacion: VALENCIA, RCS EXPRESS, S.A.', 490, ymin + i + 51)
        i+= 80;
        if (i >= 350 || item >= 100) {
          doc.addPage();
          page = page + 1;
          doc.switchToPage(page);
          i = 0;
          await this.generateHeader(doc, 'DI');
        }
      }
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
      if (tipo == 'DI') {
        doc.fontSize(12);
        doc.fillColor('#444444');
        doc.x = 650;
        doc.y = 50;
        doc.text(`Pagina ${i + 1} de ${range.count}`, {
          align: 'right',
          columns: 1,
          width: 100,
        });
      } else {
        doc.fontSize(8);
        doc.fillColor('#444444');
        doc.x = 446;
        doc.y = 50;
        doc.text(`Pagina ${i + 1} de ${range.count}`, {
          align: 'right',
          columns: 1,
          width: 100,
        });
      }
   }
  }
}

module.exports = registroCostosService;
