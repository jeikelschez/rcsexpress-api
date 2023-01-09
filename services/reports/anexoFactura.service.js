const moment = require('moment');

class AnexoFacturaService {
  async generateHeader(doc) {
    moment.locale('es');
    doc
      .image('./img/logo_rc.png', 50, 45, { width: 50 })
      .fillColor('#444444')
      .fontSize(13)
      .font('Helvetica-Bold')
      .text('RCS Express, S.A', 110, 50)
      .text('R.I.F. J-31028463-6', 110, 70)
      .fontSize(12)
      .text('Valencia, ' + moment().format('LL'), 200, 50, { align: 'right' })
      .text('Pagina 1 de 1', 200, 70, { align: 'right' })
      .fontSize(16)
      .text('Informe de Ventas Realizadas', 200, 110)
      .fontSize(11);
    doc.y = 130;
    doc.x = 213;
    doc.text('COMERCIALIZADORA CIERO, C.A.', {
      align: 'center',
      columns: 1,
      width: 200,
    });
    doc.text('Desde: 19/10/2022', 200, 160);
    doc.text('Hasta: 19/11/2022', 320, 160);
    doc.text('Nro. Factura: 1231231', 50, 140);
    doc.text('Nro. Control: 00-0123124', 50, 160);
    doc.moveDown();
    doc.fontSize(9);
    doc.y = 186;
    doc.x = 40;
    doc.fillColor('black');
    doc.text('Mes/Año', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.y = 186;
    doc.x = 82;
    doc.fillColor('black');
    doc.text('Fecha Envio', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.y = 186;
    doc.x = 148;
    doc.fillColor('black');
    doc.text('Nro. Guía', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.y = 186;
    doc.x = 223;
    doc.fillColor('black');
    doc.text('Facturas Cliente', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.y = 186;
    doc.x = 318;
    doc.fillColor('black');
    doc.text('Origen', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.y = 186;
    doc.x = 353;
    doc.fillColor('black');
    doc.text('Destino', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.y = 186;
    doc.x = 394;
    doc.fillColor('black');
    doc.text('Monto Base', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.y = 186;
    doc.x = 456;
    doc.fillColor('black');
    doc.text('Impuesto', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.y = 186;
    doc.x = 510;
    doc.fillColor('black');
    doc.text('Monto Total');
    doc.lineCap('butt').moveTo(40, 200).lineTo(565, 200).stroke();
  }

  async generateCustomerInformation(doc) {
    var data = [
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215/23142342/234234',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '121212121212',
        impuesto: '556',
        monto_total: '121212121212',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '121212121212',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
      {
        mes_año: '10-2022',
        fecha_envio: '19/10/2022',
        nro_guia: 'GC 550345455',
        facturas_cliente: '17643/123215',
        origen: 'VZL',
        destino: 'MCV',
        monto_base: '5.997,90',
        impuesto: '556',
        monto_total: '6.402,39',
      },
    ];
    var i = 0;
    var page = 0;
    var ymin = 210;
    for (var item = 0; item <= data.length - 1; item++) {
      doc.y = ymin + i;
      doc.x = 43;
      doc.text(data[item].mes_año, {
        align: 'center',
        columns: 1,
        width: 35,
      });
      doc.y = ymin + i;
      doc.x = 90;
      doc.text(data[item].fecha_envio, {
        align: 'center',
        columns: 1,
        width: 47,
      });
      doc.y = ymin + i;
      doc.x = 141;
      doc.text(data[item].nro_guia, {
        align: 'center',
        columns: 1,
        width: 67,
      });
      doc.y = ymin + i - 3;
      doc.x = 210;
      doc.text(data[item].facturas_cliente, {
        align: 'center',
        columns: 1,
        width: 105,
      });
      doc.y = ymin + i;
      doc.x = 326;
      doc.text(data[item].origen, {
        align: 'center',
        columns: 1,
        width: 20,
      });
      doc.y = ymin + i;
      doc.x = 361;
      doc.text(data[item].destino, {
        align: 'center',
        columns: 1,
        width: 20,
      });
      doc.y = ymin + i;
      doc.x = 392;
      doc.text(data[item].monto_base, {
        align: 'center',
        columns: 1,
        width: 65,
      });
      doc.y = ymin + i;
      doc.x = 455;
      doc.text(data[item].impuesto, {
        align: 'center',
        columns: 1,
        width: 44,
      });
      doc.y = ymin + i;
      doc.x = 505;
      doc.text(data[item].monto_total, {
        align: 'center',
        columns: 1,
        width: 65,
      });
      i = i + 25;
      if (i >= 500) {
        doc.addPage();
        page = page + 1;
        doc.switchToPage(page);
        i = 0;
        await this.generateHeader(doc);
      }
    }
    if (i >= 500) {
      doc.addPage();
      page = page + 1;
      doc.switchToPage(page);
      await this.generateHeader(doc);
      i = 0;
      ymin = 50;
    }
    doc.fontSize(12);
    doc.font('Helvetica-Bold');
    doc.text('Totales:', 220, ymin + i);
    doc.fontSize(10);
    doc.y = ymin + i;
    doc.x = 405;
    doc.text('123123', {
      align: 'left',
      columns: 1,
      width: 50,
    });
    doc.y = ymin + i;
    doc.x = 465;
    doc.text('23423', {
      align: 'left',
      columns: 1,
      width: 50,
    });
    doc.y = ymin + i;
    doc.x = 525;
    doc.text('12312', {
      align: 'left',
      columns: 1,
      width: 50,
    });
    doc.fontSize(12);
    doc.text('Descuento de Fletes:', 220, ymin + i + 20);
    doc.fontSize(10);
    (doc.y = ymin + i + 20), (doc.x = 360);
    doc.text('232323', {
      align: 'left',
      columns: 1,
      width: 50,
    });
    doc.y = ymin + i + 20;
    doc.x = 405;
    doc.text('1231231', {
      align: 'left',
      columns: 1,
      width: 50,
    });
    doc.y = ymin + i + 20;
    doc.x = 465;
    doc.text('1231231', {
      align: 'left',
      columns: 1,
      width: 50,
    });
    doc.y = ymin + i + 20;
    doc.x = 525;
    doc.text('123123', {
      align: 'left',
      columns: 1,
      width: 50,
    });
    doc.y = ymin + i + 40;
    doc.x = 405;
    doc.text('123123', {
      align: 'left',
      columns: 1,
      width: 50,
    });
    doc.y = ymin + i + 40;
    doc.x = 465;
    doc.text('23423', {
      align: 'left',
      columns: 1,
      width: 50,
    });
    doc.y = ymin + i + 40;
    doc.x = 525;
    doc.text('12312312', {
      align: 'left',
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
      doc.x = 275;
      doc.y = 724;
      doc.text(`Pagina ${i + 1} de ${range.count}`);
    }
  }
}

module.exports = AnexoFacturaService;
