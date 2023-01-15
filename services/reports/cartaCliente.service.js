const moment = require('moment');
const { models, Sequelize } = require('./../../libs/sequelize');

const nroControlDesc =
  '(CASE WHEN nro_control IS NULL THEN CONCAT(serie_documento, nro_documento)' +
  ' WHEN nro_control_new IS NULL THEN LPAD(nro_control, 4, "0000")' +
  ' WHEN serie_documento IS NULL THEN LPAD(nro_control_new, 9, "00-000000")' +
  ' ELSE CONCAT(serie_documento, "-", LPAD(nro_control_new, 9, "00-000000")) ' +
  ' END)';
const nroDocumentoDesc =
  '(CASE WHEN nro_control IS NULL THEN CONCAT(serie_documento, "-",  nro_documento)' +
  ' ELSE CONCAT(t_de_documento, " ", LPAD(nro_control, 5, "0")) ' +
  ' END)';

class CartaClienteService {
  async generateHeader(doc) {
    moment.locale('es');
    doc
      .image('./img/logo_rc.png', 50, 45, { width: 50 })
      .fillColor('#444444')
      .fontSize(13)
      .font('Helvetica-Bold')
      .text('RCS Express, S.A', 110, 89)
      .text('R.I.F. J-31028463-6', 110, 107)
      .fontSize(12)
      .text('Valencia, ' + moment().format('LL'), 200, 50, { align: 'right' })
      .moveDown();
  }

  async generateCustomerInformation(
    doc,
    data,
    cliente,
    contacto,
    cargo,
    ciudad,
    usuario
  ) {
    doc
      .fontSize(12)
      .text('Señores', 50, 150)
      .text(cliente, 50, 165)
      .text(contacto ? 'Atención' : ciudad, 50, 180)
      .text(contacto ? 'Sr(a). ' + contacto : '', 50, 195)
      .text(contacto ? cargo : '', 50, 210);

    doc
      .fontSize(14)
      .text(
        'Después de saludarle, sirva la presente para informarle que anexo le estamos enviando relación de cobros correspondiente a los servicios de transporte prestados',
        50,
        240,
        {
          align: 'justify',
        }
      );
    doc.fontSize(10);
    doc.lineJoin('miter').rect(50, 299, 65, 20).stroke();
    doc.y = 306;
    doc.x = 52;
    doc.fillColor('black');
    doc.text('NRO. CTRL', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');

    doc.lineJoin('miter').rect(115, 299, 65, 20).stroke();
    doc.y = 306;
    doc.x = 117;
    doc.fillColor('black');
    doc.text('NRO. DOC', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');

    doc.lineJoin('miter').rect(180, 299, 60, 20).stroke();
    doc.y = 306;
    doc.x = 186;
    doc.fillColor('black');
    doc.text('FECHA', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');

    doc.lineJoin('miter').rect(240, 299, 323, 20).stroke();
    doc.y = 306;
    doc.x = 355;
    doc.fillColor('black');
    doc.text('DESCRIPCION', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');

    // DATOS DE TABLA
    var i = 0;
    var page = 0;
    var y = 320;
    var ymax = 280;

    data = data.split(',');
    for (var item = 0; item <= data.length - 1; item++) {
      doc.fontSize(10);
      let factId = data[item].split('/');
      let dataMovimiento = await models.Mmovimientos.findByPk(factId[0], {
        attributes: {
          include: [
            [Sequelize.literal(nroControlDesc), 'nro_control_desc'],
            [Sequelize.literal(nroDocumentoDesc), 'nro_documento_desc'],
          ],
        },
        raw: true,
      });
      let guiasAsoc = await this.getGuiasAsoc(dataMovimiento);
      doc
        .lineJoin('miter')
        .rect(50, y + i, 513, 30)
        .stroke();
      this.textInRowFirst(doc, dataMovimiento.nro_control_desc, y + 11 + i, 1);
      this.textInRowFirst(
        doc,
        dataMovimiento.nro_documento_desc,
        y + 11 + i,
        2
      );
      this.line(doc, 180, y + i, y + 30 + i);
      this.line(doc, 240, y + i, y + 30 + i);
      this.line(doc, 115, y + i, y + 30 + i);
      this.textInRowFirst(
        doc,
        moment(dataMovimiento.fecha_emision).format('DD/MM/YYYY'),
        y + 11 + i,
        3
      );
      doc.y = y + 7 + i;
      doc.x = 255;
      doc.text(dataMovimiento.observacion_entrega ? dataMovimiento.observacion_entrega + ' ' + factId[1] : factId[1] ? factId[1] : '');
      if (y + 60 + i + (guiasAsoc.length / 75) * 10 >= 700) {
        doc.addPage();
        y = 150;
        ymax = 400;
        page = page + 1;
        doc.switchToPage(page);
        this.titleTable(doc, 165);
        await this.generateHeader(doc);
        i = 0;
      }
      doc.fontSize(10);
      this.textInRowFirst(doc, 'Facturas', y + 36 + i, 1);
      this.textInRowFirst(doc, 'Asociadas', y + 47 + i, 1);
      doc.y = y + 36 + i;
      doc.x = 132;
      doc.fillColor('black');
      doc.text(guiasAsoc);
      doc
        .lineJoin('miter')
        .rect(50, y + 30 + i, 513, 30 + (guiasAsoc.length / 75) * 10)
        .stroke();
      this.line(
        doc,
        115,
        y + 30 + i,
        y + 60 + i + (guiasAsoc.length / 75) * 10
      );
      y = y + (guiasAsoc.length / 75) * 10;
      i = i + 60;

      if (i >= ymax && !(item == data.length - 1)) {
        doc.addPage();
        y = 180;
        ymax = 400;
        page = page + 1;
        doc.switchToPage(page);
        this.titleTable(doc, 165);
        await this.generateHeader(doc);
        i = 0;
      }
    }

    if (i >= 600) {
      doc.addPage();
      y = 160;
      ymax = 280;
      page = page + 1;
      doc.switchToPage(page);
      await this.generateHeader(doc);
      i = 0;
    }

    doc.y = y + 30 + i;
    doc.x = 100;
    doc.fillColor('black');
    doc.text('Total');
    doc.y = y + 30 + i;
    doc.x = 200;
    doc.text('123123123');
    doc
      .lineJoin('miter')
      .rect(50, y + 20 + i, 250, 25)
      .stroke();
    doc
      .lineCap('butt')
      .moveTo(170, y + 20 + i)
      .lineTo(170, y + 45 + i)
      .stroke();

    doc.x = 50;
    doc.y = y + 70 + i;
    doc.text('Sin mas a que hacer referencia queda de Ustedes ,');
    doc.y = y + 90 + i;
    doc.text('Atentamente ,');

    doc
      .lineCap('butt')
      .moveTo(400, y + 80 + i)
      .lineTo(550, y + 80 + i)
      .stroke();

    doc.x = 421;
    doc.y = y + 90 + i;
    doc.text(usuario);
    doc.x = 432;
    doc.y = y + 110 + i;
    doc.text('FACTURACION');
    var end;
    const range = doc.bufferedPageRange();
    for (
      i = range.start, end = range.start + range.count, range.start <= end;
      i < end;
      i++
    ) {
      doc.switchToPage(i);
      doc.x = 275;
      doc.y = 724;
      doc.text(`Pagina ${i + 1} de ${range.count}`);
    }
  }

  async titleTable(doc, headerY) {
    doc.fontSize(10);
    doc
      .lineJoin('miter')
      .rect(50, headerY - 6, 65, 20)
      .stroke();
    doc.y = headerY;
    doc.x = 52;
    doc.fillColor('black');
    doc.text('NRO. CTRL', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');

    doc
      .lineJoin('miter')
      .rect(115, headerY - 6, 65, 20)
      .stroke();
    doc.y = headerY;
    doc.x = 117;
    doc.fillColor('black');
    doc.text('NRO. DOC', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');

    doc
      .lineJoin('miter')
      .rect(180, headerY - 6, 60, 20)
      .stroke();
    doc.y = headerY;
    doc.x = 186;
    doc.fillColor('black');
    doc.text('FECHA', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');

    doc
      .lineJoin('miter')
      .rect(240, headerY - 6, 323, 20)
      .stroke();
    doc.y = headerY;
    doc.x = 355;
    doc.fillColor('black');
    doc.text('DESCRIPCION', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');
  }

  async getGuiasAsoc(dataFact) {
    let guiasAsoc = '';
    let movimientos = await models.Mmovimientos.findAll({
      where: {
        nro_doc_principal: dataFact.nro_documento,
        nro_ctrl_doc_ppal_new: dataFact.nro_control_new,
        tipo_doc_principal: dataFact.t_de_documento,
        cod_ag_doc_ppal: dataFact.cod_agencia,
      },
      raw: true,
    });
    for (var i = 0; i < movimientos.length; i++) {
      guiasAsoc += movimientos[i].dimensiones.replace(/^\s+/, '') + ' / ';
    }
    return guiasAsoc;
  }

  async textInRowFirst(doc, text, heigth, column) {
    if (column == 1) {
      column = 52;
    }
    if (column == 2) {
      column = 120;
    }
    if (column == 3) {
      column = 180;
    }
    doc.y = heigth;
    doc.x = column;
    doc.fillColor('black');
    doc.text(text, {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 2,
    });
    return doc;
  }

  async row(doc, heigth) {
    doc.lineJoin('miter').rect(50, heigth, 513, 30).stroke();
    return doc;
  }
  async line(doc, x, y1, y2) {
    doc.lineCap('butt').moveTo(x, y1).lineTo(x, y2).stroke();
    return doc;
  }
}

module.exports = CartaClienteService;
