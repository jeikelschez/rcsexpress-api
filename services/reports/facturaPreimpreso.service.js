const moment = require('moment');

class FacturaPreimpresoService {
  async generateData(doc) {
    moment.locale('es');
    var data = [
      {
        concepto: 'TRANSPORTE DE MERCANCIAS (E)',
        cantidad: '1',
        precio_unitario: '330,20',
        iva: '0,00',
        precio_total: '330,20',
      },
      {
        concepto: 'TRANSPORTE DE PRODUCTOS (G)',
        cantidad: '1',
        precio_unitario: '630,20',
        iva: '0,00',
        precio_total: '630,20',
      },
      {
        concepto: 'TRANSPORTE DE DATOS (F)',
        cantidad: '2',
        precio_unitario: '730,20',
        iva: '0,00',
        precio_total: '1460,40',
      },
    ];
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('CLIENTE: COMERCIALIZADORA CIERO,C.A.', 40, 40)
      .text('RIF/CO: J-324234234', 40, 63)
      .text('TELEFONOS: 0412312323/12312313', 40, 87);
    doc.y = 110;
    doc.x = 40;
    doc.fillColor('black');
    doc.text(
      'DIRECCIÓN FISCAL: CALLE 99 CC INDUSTRIAL UNICENTRO DEL NORTE NIVEL PB LOCAL GALPON 10 ZONA PARTE INDUSTRIAL CASTILLITO VALENCIA EDO. CARABOBO ',
      {
        width: 400,
        align: 'justify',
      }
    );
    doc.text('DOCUMENTO', 470, 40);
    doc.text('FACTURA', 470, 58);
    doc.text('NUMERO', 650, 40);
    doc.text('12208', 650, 58);
    doc.text('CONDICIONES DE PAGO', 470, 90);
    doc.text('CREDITO', 470, 110);
    doc.text('FECHA DE EMISION', 650, 90);
    doc.text('01/12/2021', 650, 110);
    doc.text('DESCRIPCIÓN', 40, 170);
    doc.text('CANTIDAD', 360, 170);
    doc.text('PRECIO UNITARIO', 440, 170);
    doc.text('%IVA', 550, 170);
    doc.text('PRECIO TOTAL', 680, 170);
    doc.lineCap('butt').moveTo(40, 188).lineTo(770, 188).stroke();
    doc.text('DESCRIPCIÓN', 40, 255);
    doc.fontSize(10);
    doc.text('FORMA DE PAGO:', 40, 310);
    doc.lineJoin('square').rect(40, 325, 390, 45).stroke();
    doc.text('EFECTIVO', 50, 335);
    doc.lineJoin('square').rect(110, 334, 10, 10).stroke();
    doc.text('CHEQUE', 130, 335);
    doc.text('NRO.', 50, 355);
    doc.lineCap('butt').moveTo(83, 362).lineTo(180, 362).stroke();
    doc
      .text('SON: TRESCIENTOS TREINTA CON VEINTE CENTIMOS', 40, 380)
      .fontSize(10);
    doc.text('F 1-5950', 40, 395);
    doc.text('SUBTOTAL:  330,20', 680, 300);
    doc.text('BASE IMPONIBLE:  0,00', 680, 330);
    doc.text('MONTO EXENTO:  330,20', 680, 345);
    doc.text('IVA: 0%:  0,00', 680, 360);
    doc.text('TARIFA POSTAL (E):  0,00', 680, 375);
    doc.text('TOTAL:  330,20', 680, 390);
    doc.y = 400;
    doc.x = 200;
    doc.text(
      'PROVIDENCIA ADMINISTRATIVA N* SENIAT 2023012312312 que designan los Sujetos Publicos como Angete de percepcion Scen 2022 del ICTF',
      {
        width: 400,
        align: 'justify',
      }
    );
    doc.lineJoin('square').rect(200, 430, 400, 45).stroke();
    doc.lineCap('butt').moveTo(200, 453).lineTo(600, 453).stroke();
    doc.lineCap('butt').moveTo(300, 430).lineTo(300, 475).stroke();
    doc.lineCap('butt').moveTo(370, 430).lineTo(370, 475).stroke();
    doc.lineCap('butt').moveTo(450, 430).lineTo(450, 475).stroke();
    doc.lineCap('butt').moveTo(530, 430).lineTo(530, 475).stroke();
    doc.text('PAGO EN DIVISA', 208, 438);
    doc.text('ALICUOTA', 309, 438);
    doc.text('IGTF DIVISA', 380, 438);
    doc.text('TAZA BCV', 465, 438);
    doc.text('IGTF BS', 545, 438);
    var i = 0;
    for (var item = 0; item <= data.length - 1; item++) {
      doc.text(data[item].concepto, 40, 195 + i);
      doc.text(data[item].cantidad, 360, 195 + i);
      doc.text(data[item].precio_unitario, 440, 195 + i);
      doc.text(data[item].iva, 550, 195 + i);
      doc.text(data[item].precio_total, 680, 195 + i);
      i = i + 20;
      if (item === 2) item = data.length + 2;
    }
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
}

module.exports = FacturaPreimpresoService;
