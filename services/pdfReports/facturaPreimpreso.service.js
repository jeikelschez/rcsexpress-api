const { models } = require('./../../libs/sequelize');

const UtilsService = require('./../utils.service');
const utils = new UtilsService();

class FacturaPreimpresoService {
  async mainReport(doc, data) {
    data = JSON.parse(data);
    await this.generateData(doc, data);
  }

  async generateData(doc, data) {
    let cliente_orig;

    if (data.id_clte_part_orig) {
      cliente_orig = await models.Cparticulares.findByPk(
        data.id_clte_part_orig,
        {
          raw: true,
        }
      );
    } else {
      cliente_orig = await models.Clientes.findByPk(data.cliente_orig, {
        raw: true,
      });
    }

    let total = data.totalString.split(',');
    total =
      utils.numeroALetras(total[0]) +
      (utils.numeroALetras(total[1]) != ' ' ? ' CON ' : ' SIN') +
      utils.numeroALetras(total[1]) +
      ' CENTIMOS';

    doc.fontSize(9);
    doc.font('Helvetica');

    // CLIENTE
    doc.text('CLIENTE:', 30, 60, { continued: true });
    doc.font('Helvetica-Bold');
    doc.text(' ' + cliente_orig.nb_cliente);
    doc.font('Helvetica');

    // RIF/CI
    doc.text('RIF/CI:', 30, 90, { continued: true });
    doc.font('Helvetica-Bold');
    doc.text(
      ' ' +
        (cliente_orig.rif_cedula
          ? cliente_orig.rif_cedula
          : cliente_orig.rif_ci)
    );
    doc.font('Helvetica');

    // TELEFONOS
    doc.text('TELÉFONOS:', 170, 90, { continued: true });
    doc.text(
      ' ' +
        (cliente_orig.tlf_cliente
          ? cliente_orig.tlf_cliente
          : cliente_orig.telefonos
          ? cliente_orig.telefonos
          : '')
    );

    // DIRECCIÓN FISCAL
    const direccionFiscal = cliente_orig.dir_fiscal
      ? cliente_orig.dir_fiscal
      : cliente_orig.direccion;

    const labelX = 30;
    const y1 = 105; // "DIRECCIÓN"
    const y2 = 120; // "FISCAL:"
    const y3 = 135; // tercera línea
    const width1 = 270; // ancho después de "DIRECCIÓN"
    const width2 = 280; // ancho después de "FISCAL:"
    const width3 = 330; // ancho para la tercera línea

    // 1. Primera línea: después de "DIRECCIÓN"
    doc.font('Helvetica-Bold');
    doc.text('DIRECCIÓN', labelX, y1, { continued: true });
    doc.font('Helvetica');
    let dirLines = this.splitTextToLines(doc, direccionFiscal, width1);
    doc.text(' ' + (dirLines[0] || ''), { continued: false });

    // 2. Segunda línea: después de "FISCAL:"
    doc.font('Helvetica-Bold');
    doc.text('FISCAL:', labelX, y2, { continued: true });
    doc.font('Helvetica');
    let resto = dirLines.slice(1).join(' ');
    let dirLines2 = this.splitTextToLines(doc, resto, width2);
    doc.text(' ' + (dirLines2[0] || ''), { continued: false });

    // 3. Tercera línea: si hay más texto, imprímelo en la tercera línea
    if (dirLines2.length > 1) {
      doc.text(dirLines2.slice(1).join(' '), labelX, y3, {
        width: width3,
        align: 'left',
      });
    }

    // DOCUMENTO
    doc.font('Helvetica-Bold');
    doc.y = 60;
    doc.x = 390;
    doc.text('DOCUMENTO', {
      width: 150,
      align: 'center',
    });
    doc.y = 75;
    doc.x = 390;
    doc.text('FACTURA', {
      width: 150,
      align: 'center',
    });

    // NÚMERO DE CONTROL
    doc.y = 60;
    doc.x = 480;
    doc.text('NÚMERO', {
      width: 150,
      align: 'center',
    });
    doc.y = 75;
    doc.x = 480;
    doc.text(data.nroControl, {
      width: 150,
      align: 'center',
    });

    // CONDICIONES DE PAGO
    doc.font('Helvetica');
    doc.y = 105;
    doc.x = 350;
    doc.text('CONDICIONES DE PAGO', {
      width: 150,
      align: 'center',
    });
    doc.y = 120;
    doc.x = 350;
    doc.text(data.formaPago, {
      width: 150,
      align: 'center',
    });

    // FECHA DE EMISIÓN
    doc.font('Helvetica');
    doc.y = 105;
    doc.x = 460;
    doc.text('FECHA DE EMISIÓN', {
      width: 150,
      align: 'center',
    });
    doc.y = 120;
    doc.x = 460;
    doc.text(data.fecha_emision, {
      width: 150,
      align: 'center',
    });

    // ENCABEZADO
    doc.font('Helvetica-Bold');
    doc.text('DESCRIPCIÓN', 30, 150);
    doc.text('CANTIDAD', 270, 150);
    doc.text('PRECIO UNITARIO', 360, 150);
    doc.text('%IVA', 470, 150);
    doc.text('PRECIO TOTAL', 510, 150);
    doc.lineCap('butt').moveTo(30, 160).lineTo(578, 160).stroke();

    doc.font('Helvetica');
    doc.y = 230;
    doc.x = 30;
    doc.text('OBSERVACIÓN: ' + (data.observacion ? data.observacion : ''), {
      width: 350,
      align: 'left',
    });

    // EFECTIVO Y CHEQUE
    doc.roundedRect(30, 250, 360, 25, 3).stroke();
    doc.text('EFECTIVO', 40, 255);
    doc.lineJoin('square').rect(90, 254, 10, 10).stroke();
    doc.text('CHEQUE', 110, 255);
    doc.lineJoin('square').rect(155, 254, 10, 10).stroke();
    doc.text('NRO.', 40, 265);

    // MONTO TOTAL
    doc.fontSize(7);
    doc.text('SON: ' + total, 30, 290);
    doc.fontSize(9);
    doc.text(data.nroDocumento, 30, 335);

    // SUBTOTAL, DESCUENTO, BASE IMPONIBLE, MONTO EXENTO, IVA, TARIFA POSTAL, TOTAL
    doc.text('Sub-Total: ', 450, 220);
    doc.y = 220;
    doc.x = 500;
    doc.text(data.subtotal, {
      width: 70,
      align: 'right',
    });
    doc.text('Base Imponible: ', 450, 235);
    doc.y = 235;
    doc.x = 500;
    doc.text(parseFloat(data.base) > 0 ? data.base : '0.00', {
      width: 70,
      align: 'right',
    });
    doc.text('Monto Exento: ', 450, 250);
    doc.y = 250;
    doc.x = 500;
    doc.text(parseFloat(data.exento) > 0 ? data.exento : '0.00', {
      width: 70,
      align: 'right',
    });
    doc.text('IVA %: ', 450, 265);
    doc.y = 265;
    doc.x = 500;
    doc.text(parseFloat(data.iva) > 0 ? data.iva : '0.00', {
      width: 70,
      align: 'right',
    });
    doc.text('Tarifa Postal (E): ', 450, 280);
    doc.y = 280;
    doc.x = 500;
    doc.text(parseFloat(data.fpo) > 0 ? data.fpo : '0.00', {
      width: 70,
      align: 'right',
    });
    doc.text('Total Bs: ', 450, 295);
    doc.y = 295;
    doc.x = 500;
    doc.text(data.total, {
      width: 70,
      align: 'right',
    });

    // DETALLES DE LA FACTURA - 1er Detalle

    // CONCEPTO
    doc.text(data.detalles[0].concepto, 30, 170);

    // CANTIDAD
    doc.y = 170;
    doc.x = 270;
    doc.text(data.detalles[0].cantidad, {
      width: 56,
      align: 'center',
    });

    // COSTO UNITARIO
    doc.y = 170;
    doc.x = 350;
    doc.text(data.detalles[0].costo_unitario, {
      width: 70,
      align: 'right',
    });

    // IVA
    doc.y = 170;
    doc.x = 420;
    doc.text(utils.formatNumber(data.iva), {
      width: 70,
      align: 'right',
    });

    // SUB TOTAL
    doc.y = 170;
    doc.x = 500;
    doc.text(data.detalles[0].subtotal, {
      width: 70,
      align: 'right',
    });

    // DETALLES DE LA FACTURA - 2do Detalle (si existe)
    if (data.detalles.length > 1) {
      // CONCEPTO
      doc.text(data.detalles[1].concepto, 30, 185);

      // CANTIDAD
      doc.y = 185;
      doc.x = 270;
      doc.text(data.detalles[1].cantidad, {
        width: 56,
        align: 'center',
      });

      // COSTO UNITARIO
      doc.y = 185;
      doc.x = 350;
      doc.text(data.detalles[1].costo_unitario, {
        width: 70,
        align: 'right',
      });

      // IVA
      doc.y = 185;
      doc.x = 420;
      doc.text(utils.formatNumber(data.iva), {
        width: 70,
        align: 'right',
      });

      // SUB TOTAL
      doc.y = 185;
      doc.x = 500;
      doc.text(data.detalles[1].subtotal, {
        width: 70,
        align: 'right',
      });
    }
  }

  // Función auxiliar para dividir texto en líneas según ancho
  splitTextToLines(doc, text, width) {
    const words = text.split(' ');
    let lines = [];
    let line = '';

    for (let i = 0; i < words.length; i++) {
      let testLine = line ? line + ' ' + words[i] : words[i];
      let testWidth = doc.widthOfString(testLine);
      if (testWidth > width && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);
    return lines;
  }
}

module.exports = FacturaPreimpresoService;
