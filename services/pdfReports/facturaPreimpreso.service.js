const { models } = require('./../../libs/sequelize');

const UtilsService = require('./../utils.service');
const utils = new UtilsService();

class FacturaPreimpresoService {
  async mainReport(doc, data) {
    data = JSON.parse(data);
    data.nroControl = '13266';
    data.formaPago = 'CONTADO';
    data.fecha_emision = '28/04/2025';
    data.nroDocumento = '9-1597';
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

    doc.font('Helvetica-Bold');
    doc.text('DESCRIPCIÓN', 30, 160);
    doc.text('CANTIDAD', 270, 160);
    doc.text('PRECIO UNITARIO', 360, 160);
    doc.text('%IVA', 470, 160);
    doc.text('PRECIO TOTAL', 510, 160);
    doc.lineCap('butt').moveTo(30, 170).lineTo(578, 170).stroke();
    /*doc.text('DESCRIPCIÓN', 30, 255);
    doc.fontSize(8);
    doc.text('FORMA DE PAGO:', 30, 310);
    doc.lineJoin('square').rect(30, 325, 230, 45).stroke();
    doc.text('EFECTIVO', 40, 335);
    doc.lineJoin('square').rect(90, 334, 10, 10).stroke();
    doc.text('CHEQUE', 110, 335);
    doc.text('NRO.', 40, 355);
    doc.lineCap('butt').moveTo(65, 362).lineTo(180, 362).stroke();
    doc.fontSize(7);*/
    doc.font('Helvetica');
    doc.text('SON: ' + total, 30, 340);
    doc.text(data.nroDocumento, 30, 365);
    /*doc.text('SUBTOTAL: ', 340, 300);
    doc.y = 300;
    doc.x = 340;
    doc.text(utils.truncate(data.subtotal, 10), {
      width: 125,
      align: 'right',
    });
    doc.text('DESCUENTO(' + data.porc_desc + '%): ', 340, 315);
    doc.y = 315;
    doc.x = 340;
    doc.text(utils.truncate(data.descuento, 10), {
      width: 125,
      align: 'right',
    });
    doc.text('BASE IMPONIBLE: ', 340, 330);
    doc.y = 330;
    doc.x = 340;
    doc.text(utils.truncate(data.base, 10), {
      width: 125,
      align: 'right',
    });
    doc.text('MONTO EXENTO: ', 340, 345);
    doc.y = 345;
    doc.x = 340;
    doc.text(utils.truncate(data.exento, 10), {
      width: 125,
      align: 'right',
    });
    doc.text('IVA(' + data.iva + '%): ', 340, 360);
    doc.y = 360;
    doc.x = 340;
    doc.text(utils.truncate(data.impuesto, 10), {
      width: 125,
      align: 'right',
    });
    doc.text('TARIFA POSTAL (E): ', 340, 375);
    doc.y = 375;
    doc.x = 340;
    doc.text(utils.truncate(data.fpo, 10), {
      width: 125,
      align: 'right',
    });
    doc.text('TOTAL: ', 340, 390);
    doc.y = 390;
    doc.x = 340;
    doc.text(utils.truncate(data.total, 10), {
      width: 125,
      align: 'right',
    });
    doc.y = 275;
    doc.x = 30;
    doc.fontSize(8);
    if (data.monto_divisas != '0,00') {
      doc.text(
        'PROVIDENCIA ADMINISTRATIVA N° SNAT 2022/000013 que designan a los Sujetos Pasivos Especiales como Agentes de Percepción del IGTF',
        {
          width: 280,
          align: 'justify',
        }
      );
      doc.y = 400;
      doc.x = 30;
      doc.fontSize(8);
      doc.text(
        'PROVIDENCIA ADMINISTRATIVA N° SNAT 2022/000013 que designan a los Sujetos Pasivos Especiales como Agentes de Percepción del IGTF',
        {
          width: 280,
          align: 'justify',
        }
      );
      doc.lineJoin('square').rect(100, 430, 340, 45).stroke();
      doc.lineCap('butt').moveTo(100, 453).lineTo(440, 453).stroke();
      doc.lineCap('butt').moveTo(185, 430).lineTo(185, 475).stroke();
      doc.lineCap('butt').moveTo(250, 430).lineTo(250, 475).stroke();
      doc.lineCap('butt').moveTo(320, 430).lineTo(320, 475).stroke();
      doc.lineCap('butt').moveTo(380, 430).lineTo(380, 475).stroke();
      doc.text('PAGO EN DIVISA', 108, 438);
      doc.text('ALICUOTA', 197, 438);
      doc.text('IGTF DIVISA', 260, 438);
      doc.text('TAZA BCV', 329, 438);
      doc.text('IGTF BS', 394, 438);
      doc.y = 460;
      doc.x = 108;
      doc.text(data.monto_divisas, {
        width: 280,
        align: 'justify',
      });
      doc.text('3%', 211, 460);
      doc.y = 460;
      doc.x = 275;
      doc.text(data.monto_igtf, {
        width: 100,
        align: 'justify',
      });
      doc.y = 460;
      doc.x = 347;
      doc.text(data.valor_dolar, {
        width: 100,
        align: 'justify',
      });
      doc.y = 460;
      doc.x = 402;
      doc.text(data.igtf_bs, {
        width: 100,
        align: 'justify',
      });
    }

    var i = 0;
    console.log(data.detalles);
    for (var item = 0; item <= data.detalles.length - 1; item++) {
      doc.fontSize(8);
      doc.text(data.detalles[item].concepto, 30, 195 + i);
      doc.y = 195 + i;
      doc.x = 193;
      doc.fillColor('black');
      doc.text(data.detalles[item].cantidad, {
        width: 57,
        align: 'center',
      });
      doc.y = 195 + i;
      doc.x = 240;
      doc.fillColor('black');
      doc.text(utils.truncate(data.detalles[item].costo_unitario, 10), {
        width: 97,
        align: 'right',
      });
      doc.y = 195 + i;
      doc.x = 340;
      doc.fillColor('black');
      doc.text(utils.truncate(data.iva, 5), {
        width: 30,
        align: 'right',
      });
      doc.y = 195 + i;
      doc.x = 380;
      doc.fillColor('black');
      doc.text(utils.truncate(data.detalles[item].subtotal, 10), {
        width: 86,
        align: 'right',
      });
      i = i + 20;
      if (item === 2) item = data.detalles.length + 2;
    }*/
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
