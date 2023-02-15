const moment = require('moment');
const { models } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

class RelacionDespachoService {
  async generateHeader(doc, data, detalle) {
    let cliente_orig;

    if (data.id_clte_part_orig) {
      cliente_orig = await models.Cparticulares.findByPk(
        data.id_clte_part_orig,
        {
          raw: true,
        }
      );
    } else {
      cliente_orig = await models.Clientes.findByPk(data.cod_cliente_org, {
        raw: true,
      });
    }

    let fecha_emision_init =
      detalle[0].fecha_emision.substring(8, 10) +
      '/' +
      detalle[0].fecha_emision.substring(5, 7) +
      '/' +
      detalle[0].fecha_emision.substring(0, 4);

    let fecha_emision_end =
      detalle[detalle.length - 1].fecha_emision.substring(8, 10) +
      '/' +
      detalle[detalle.length - 1].fecha_emision.substring(5, 7) +
      '/' +
      detalle[detalle.length - 1].fecha_emision.substring(0, 4);

    moment.locale('es');
    doc
    .image('./img/logo_rc.png', 50, 45, { width: 50 })
    .fillColor('#444444')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('RCS Express, S.A', 110, 95)
    .text('R.I.F. J-31028463-6', 110, 110)
    .text('Fecha: 15/02/2023', 640, 53)
    .fontSize(10)
    .text('Autorizado Por: Valencia', 620, 90)
    .text('Impreso Por: Caracas', 620, 105)
    .fontSize(19)
    doc.y = 50;
    doc.x = 150;
    doc.text('Relación de Despacho Agrupada por Zonas para la Agencia Destino', {
      align: 'center',
      columns: 1,
      width: 490,
    });
    doc.fontSize(13)
    doc.y = 100;
    doc.x = 240;
    doc.text('VALENCIA, RCS EXPRESSS S.A', {
      align: 'center',
      columns: 1,
      width: 300,
    });
    doc.text('Desde: ' + fecha_emision_init, 270, 120);
    doc.text('Hasta: ' + fecha_emision_end, 400, 120);
    doc.moveDown();
    doc.fontSize(9);
    doc.lineJoin('miter').rect(35, 140, 192, 20).stroke();
    doc.lineJoin('miter').rect(227, 140, 318, 20).stroke();
    doc.lineJoin('miter').rect(545, 140, 209, 20).stroke();
    doc.y = 146;
    doc.x = 63;
    doc.fillColor('black');
    doc.text('DATOS DEL DOCUMENTO', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
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
    doc.x = 40;
    doc.fillColor('black');
    doc.text('Guia', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.y = 166;
    doc.x = 82;
    doc.fillColor('black');
    doc.text('Emision', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.y = 166;
    doc.x = 125;
    doc.fillColor('black');
    doc.text('Origen', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.y = 166;
    doc.x = 160;
    doc.fillColor('black');
    doc.text('Piezas', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.y = 166;
    doc.x = 195;
    doc.fillColor('black');
    doc.text('Kgs.', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.y = 166;
    doc.x = 230;
    doc.fillColor('black');
    doc.text('Remitente', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.y = 166;
    doc.x = 381;
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
    doc.lineJoin('miter').rect(35, 160, 192, 20).stroke();
    doc.lineJoin('miter').rect(227, 160, 318, 20).stroke();
    doc.lineJoin('miter').rect(545, 160, 105, 20).stroke();
    doc.lineJoin('miter').rect(649, 160, 105, 20).stroke();
    doc.y = 189;
    doc.x = 50;
    doc.fillColor('black');
    doc.fontSize(12)
    doc.text('Zona Destino: VALENCIA')
    doc.fontSize(9)
  }

  async generateCustomerInformation(doc, data, detalle) {
    var i = 0;
    var page = 0;
    var ymin = 210;
    let base = 0;
    let impuesto = 0;
    let total = 0;

    let descuento = utils.parseFloatN(data.monto_descuento) * -1;
    let descuento_impuesto =
      (descuento * utils.parseFloatN(data.porc_impuesto)) / 100;

    for (var item = 0; item <= 30; item++) {
      let fecha_envio =
        detalle[item].fecha_envio.substring(8, 10) +
        '/' +
        detalle[item].fecha_envio.substring(5, 7) +
        '/' +
        detalle[item].fecha_envio.substring(0, 4);

      base += utils.parseFloatN(detalle[item].monto_base);
      impuesto += utils.parseFloatN(detalle[item].monto_impuesto);
      total += utils.parseFloatN(detalle[item].monto_total);

      doc.y = ymin + i;
      doc.x = 33;
      doc.text('CG 12313',
        {
          align: 'center',
          columns: 1,
          width: 50,
        }
      );
      doc.y = ymin + i;
      doc.x = 82;
      doc.text(fecha_envio, {
        align: 'center',
        columns: 1,
        width: 47,
      });
      doc.y = ymin + i;
      doc.x = 110;
      doc.text('VZL', {
        align: 'center',
        columns: 1,
        width: 67,
      });
      doc.y = ymin + i;
      doc.x = 125;
      doc.text('5', {
        align: 'center',
        columns: 1,
        width: 105,
      });
      doc.y = ymin + i;
      doc.x = 155;
      doc.text('12.2', {
        align: 'center',
        columns: 1,
        width: 105,
      });
      doc.y = ymin + i;
      doc.x = 230;
      doc.text('COMERCIALIZADORA CIERO, C.A', {
        align: 'center',
        columns: 1,
        width: 150,
      });
      doc.y = ymin + i;
      doc.x = 375;
      doc.text('NERIO ALBERTO MOLINA CASTILLA', {
        align: 'center',
        columns: 1,
        width: 180,
      });
      doc.y = ymin + i;
      doc.x = 547;
      doc.text('12312', {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 600;
      doc.text('12312', {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 653;
      doc.text('12312', {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 700;
      doc.text('12312', {
        align: 'center',
        columns: 1,
        width: 40,
      });
      i = i + 15;
      if ((i >= 230) || (item >= 30)) {
        if (item >= 30) {
          doc.y = ymin + i + 10;
          doc.x = 30;
          doc.text('Total Guias: 3',
            {
              align: 'center',
              columns: 1,
              width: 70,
            }
          );
          doc.y = ymin + i + 10;
          doc.x = 113;
          doc.text('Total Piezas: 8', {
            align: 'center',
            columns: 1,
            width: 67,
          });
          doc.y = ymin + i + 10;
          doc.x = 175;
          doc.text('170 Total Kgs', {
            align: 'center',
            columns: 1,
            width: 105,
          });
        }
      doc.lineJoin('square').rect(35, ymin + i + 30, 300, 80).stroke();
      doc.lineJoin('square').rect(350, ymin + i + 30, 300, 80).stroke();
      doc.fontSize(12)
      doc.y = ymin + i + 40;
      doc.x = 110;
      doc.fillColor('black');
      doc.text('Autorizado para Traslado');
      doc.y = ymin + i + 65;
      doc.x = 50;
      doc.fontSize(9)
      doc.text('Chofer: Andis Medina - C.I.V V-12313123', {
        align: 'left',
        columns: 1,
        width: 300,
      });
      doc.y = ymin + i + 85;
      doc.x = 50;
      doc.text('Vehiculo: Andis Medina - C.I.V V-12313123', {
        align: 'left',
        columns: 1,
        width: 300,
      });
      doc.y = ymin + i + 40;
      doc.x = 430;
      doc.fillColor('black');
      doc.fontSize(12)
      doc.text('Agente Receptor Entrega');
      doc.y = ymin + i + 60;
      doc.x = 365;
      doc.fontSize(9)
      doc.text('Chofer: Andis Medina - C.I.V V-12313123', {
        align: 'left',
        columns: 1,
        width: 300,
      });
      doc.y = ymin + i + 75;
      doc.x = 365;
      doc.text('Vehiculo: Andis Medina - C.I.V V-12313123', {
        align: 'left',
        columns: 1,
        width: 300,
      });
      doc.y = ymin + i + 90;
      doc.x = 365;
      doc.text('Dirección: Andis Medina - C.I.V V-12313123', {
        align: 'left',
        columns: 1,
        width: 300,
      });
      if (!(item >= 30)) {
        doc.addPage();
        page = page + 1;
        doc.switchToPage(page);
        i = 0;
        await this.generateHeader(doc, data, detalle);
      }
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
      doc.fontSize(12)
      doc.x = 640;
      doc.y = 70;
      doc.text(`Pagina ${i + 1} de ${range.count}`);
    }
  }
}

module.exports = RelacionDespachoService;
