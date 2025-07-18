const moment = require('moment');
const { models, Sequelize } = require('./../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

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
  async mainReport(
    doc,
    data,
    cliente,
    contacto,
    cargo,
    ciudad,
    usuario,
    monto
  ) {
    await this.generateHeader(doc);
    await this.generateCustomerInformation(
      doc,
      data,
      cliente,
      contacto,
      cargo,
      ciudad,
      usuario,
      monto
    );
  }

  async generateHeader(doc) {
    moment.locale('es');
    const fecha = moment().format('LL');
    const fechaConMesMayus = fecha.replace(
      /de (\w+)/,
      (match, mes) => 'de ' + mes.charAt(0).toUpperCase() + mes.slice(1)
    );

    doc
      .image('./img/logo_rc.png', 50, 45, { width: 50 })
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('RCS Express, S.A', 105, 93)
      .text('R.I.F. J-31028463-6', 105, 107)
      .fontSize(12)
      .font('Helvetica')
      .text('Valencia, ' + fechaConMesMayus, 200, 70, { align: 'right' })
      .moveDown();
  }

  async generateCustomerInformation(
    doc,
    data,
    cliente,
    contacto,
    cargo,
    ciudad,
    usuario,
    monto
  ) {
    doc
      .fontSize(12)
      .font('Helvetica')
      .text('Señores', 50, 150)
      .font('Helvetica-Bold')
      .text(cliente, 50, 165)
      .font('Helvetica')
      .text(contacto ? 'Atención' : ciudad, 50, 180)
      .text(contacto ? 'Sr(a). ' + contacto : '', 50, 195)
      .text(contacto ? cargo : '', 50, 210);

    doc.text(
      'Después de saludarle, sirva la presente para informarle que anexo le estamos enviando relación de cobros correspondiente a los servicios de transporte prestados',
      50,
      250,
      {
        align: 'justify',
      }
    );

    doc.fontSize(10);
    this.titleTable(doc, 295, !!monto);

    // DATOS DE TABLA
    var i = 0;
    var page = 0;
    var y = 310;
    var ymax = 250;
    let montoTotal = 0;

    doc.font('Helvetica');
    data = data.split(',');

    // Por cada item en data, se procesa la información
    for (var item = 0; item <= data.length - 1; item++) {
      doc.fontSize(10);

      // Obtener el nro_control_desc y nro_documento_desc
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

      // Obtener las guías asociadas
      //let guiasAsoc = await this.getGuiasAsoc(dataMovimiento);
      let guiasAsoc = [];

      doc
        .lineJoin('miter')
        .rect(50, y + i, 513, 30)
        .stroke();

      this.line(doc, 180, y + i, y + 30 + i);
      this.line(doc, 240, y + i, y + 30 + i);
      this.line(doc, 115, y + i, y + 30 + i);

      if (monto) {
        this.line(doc, 310, y + i, y + 30 + i); // Línea separadora para MONTO
      }

      // Numero de Control
      this.textInRowFirst(doc, dataMovimiento.nro_control_desc, y + 11 + i, 1);

      // Numero de Documento
      this.textInRowFirst(
        doc,
        dataMovimiento.nro_documento_desc,
        y + 11 + i,
        2
      );

      // Fecha de Emisión
      this.textInRowFirst(
        doc,
        moment(dataMovimiento.fecha_emision).format('DD/MM/YYYY'),
        y + 11 + i,
        3
      );

      // MONTO (solo si monto es true)
      if (monto) {
        montoTotal += parseFloat(factId[2]) || 0;
        doc.y = y + 11 + i;
        doc.x = 240;
        doc.text(utils.formatNumber(factId[2]) ?? '', {
          align: 'center',
          width: 70,
        });
      }

      // Observación de Entrega (ajusta X si hay MONTO)
      doc.y = y + 6 + i;
      doc.x = monto ? 320 : 255;
      doc.text(
        dataMovimiento.observacion_entrega
          ? dataMovimiento.observacion_entrega + ' ' + factId[1]
          : factId[1]
          ? factId[1]
          : ''
      );

      // Guias Asociadas
      if (y + 60 + i + (guiasAsoc.length / 75) * 10 >= 700) {
        doc.addPage();
        y = 150;
        ymax = 400;
        page = page + 1;
        doc.switchToPage(page);
        this.titleTable(doc, 165, !!monto);
        await this.generateHeader(doc);
        i = 0;
      }

      doc.fontSize(10);
      doc.y = y + 36 + i;
      doc.x = 132;
      doc.text(guiasAsoc);

      // Calcula la altura de la caja
      let guiasHeight = (guiasAsoc.length / 75) * 10;
      if (guiasHeight < 18) guiasHeight = 18;
      let alturaCaja = 15 + guiasHeight;

      // Calcula el centro vertical de la caja
      let yCentro = y + 30 + i + alturaCaja / 2 - 4;

      // Textos de Facturas Asociadas
      doc.font('Helvetica-Bold');
      doc.text('Facturas', 50, yCentro - 6, {
        align: 'center',
        width: 65,
      });
      doc.text('Asociadas', 50, yCentro + 6, {
        align: 'center',
        width: 65,
      });
      doc.font('Helvetica');

      // Dibujar la caja para las guías asociadas
      doc
        .lineJoin('miter')
        .rect(50, y + 30 + i, 513, 15 + guiasHeight)
        .stroke();
      this.line(doc, 115, y + 15 + i, y + 45 + i + guiasHeight);
      y = y + guiasHeight;
      i = i + 45;

      if (i >= ymax && !(item == data.length - 1)) {
        doc.addPage();
        y = 180;
        ymax = 400;
        page = page + 1;
        doc.switchToPage(page);
        this.titleTable(doc, 165, !!monto);
        await this.generateHeader(doc);
        i = 0;
      }
    }

    // Si hay monto, dibujar la sección de total
    if (monto) {
      doc.font('Helvetica-Bold');
      doc.y = y + 6 + i;
      doc.x = 180;
      doc.text('Total', {
        align: 'center',
        width: 60,
      });

      doc.y = y + 6 + i;
      doc.x = 240;
      doc.text(utils.formatNumber(montoTotal), {
        align: 'center',
        width: 70,
      });

      // Dibujar la caja para el total
      doc
        .lineJoin('miter')
        .rect(180, y + i, 130, 20)
        .stroke();
      doc
        .lineCap('butt')
        .moveTo(240, y + i)
        .lineTo(240, y + 20 + i)
        .stroke();
    }

    if (i >= 200) {
      doc.addPage();
      y = 160;
      ymax = 280;
      page = page + 1;
      doc.switchToPage(page);
      await this.generateHeader(doc);
      i = 0;
    }

    doc.fontSize(13);
    doc.font('Helvetica');
    doc.x = 50;
    doc.y = y + 70 + i;
    doc.text('Sin mas a que hacer referencia queda de Ustedes,');
    doc.y = y + 85 + i;
    doc.text('Atentamente,');

    doc
      .lineCap('butt')
      .moveTo(400, y + 130 + i)
      .lineTo(550, y + 130 + i)
      .stroke();

    doc.fontSize(10);
    doc.y = y + 140 + i;
    doc.x = 400;
    doc.text(usuario, {
      align: 'center',
      width: 150,
    });
    doc.y = y + 155 + i;
    doc.x = 400;
    doc.text('FACTURACIÓN', {
      align: 'center',
      width: 150,
    });

    var end;
    const range = doc.bufferedPageRange();
    for (
      i = range.start, end = range.start + range.count, range.start <= end;
      i < end;
      i++
    ) {
      // Bloque informativo en la parte inferior
      const blockLeft = 30;
      const blockY = 720;
      const blockWidth = 180;
      const blockLines = [
        'SE ENTREGA',
        'FACTURA ORIGINAL',
        'PARA PROCESAR',
        'PAGO',
      ];
      doc.fontSize(12);
      doc.font('Helvetica-Bold');
      for (let j = 0; j < blockLines.length; j++) {
        doc.text(blockLines[j], blockLeft, blockY + j * 15, {
          width: blockWidth,
          align: 'center',
        });
      }

      doc.switchToPage(i);
      doc.x = 500;
      doc.y = 85;
      doc.fontSize(10);
      doc.font('Helvetica');
      doc.text(`Pagina ${i + 1} de ${range.count}`);
    }
  }

  async titleTable(doc, headerY, mostrarMonto) {
    doc.fontSize(10);
    doc.font('Helvetica-Bold');

    // NRO. CTRL
    doc
      .lineJoin('miter')
      .rect(50, headerY - 6, 65, 20)
      .stroke();
    doc.y = headerY;
    doc.x = 52;
    doc.text('NRO. CTRL', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');

    // NRO. DOC
    doc
      .lineJoin('miter')
      .rect(115, headerY - 6, 65, 20)
      .stroke();
    doc.y = headerY;
    doc.x = 117;
    doc.text('NRO. DOC', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');

    // FECHA
    doc
      .lineJoin('miter')
      .rect(180, headerY - 6, 60, 20)
      .stroke();
    doc.y = headerY;
    doc.x = 186;
    doc.text('FECHA', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');

    // MONTO (antes de DESCRIPCIÓN, solo si aplica)
    let montoWidth = 70;
    let descWidth = mostrarMonto ? 253 : 323;
    if (mostrarMonto) {
      doc
        .lineJoin('miter')
        .rect(240, headerY - 6, montoWidth, 20)
        .stroke();
      doc.y = headerY;
      doc.x = 240;
      doc.text('MONTO', {
        align: 'center',
        width: montoWidth,
      });
      doc.lineCap('butt');
    }

    // DESCRIPCIÓN (ajusta el ancho si hay monto)
    doc
      .lineJoin('miter')
      .rect(240 + (mostrarMonto ? montoWidth : 0), headerY - 6, descWidth, 20)
      .stroke();
    doc.y = headerY;
    doc.x = 240 + (mostrarMonto ? montoWidth : 0);
    doc.text('DESCRIPCIÓN', {
      align: 'center',
      width: descWidth,
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
      guiasAsoc += movimientos[i].dimensiones
        ? movimientos[i].dimensiones.replace(/^\s+/, '') + ' / '
        : '';
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
