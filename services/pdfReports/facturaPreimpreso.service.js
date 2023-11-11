const { models } = require('./../../libs/sequelize');

const UtilsService = require('./../utils.service');
const utils = new UtilsService();

class FacturaPreimpresoService {
  async mainReport(doc, data) {
    await this.generateData(doc, JSON.parse(data));
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
      (utils.numeroALetras(total[1]) != " " ? ' CON ' : ' SIN') +
      utils.numeroALetras(total[1]) +
      ' CENTIMOS';

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('CLIENTE: ' + cliente_orig.nb_cliente, 30, 40)
      .text(
        'RIF/CI: ' +
          (cliente_orig.rif_cedula
            ? cliente_orig.rif_cedula
            : cliente_orig.rif_ci),
            30,
        63
      )
      .text(
        'TELEFONOS: ' +
          (cliente_orig.tlf_cliente
            ? cliente_orig.tlf_cliente
            : cliente_orig.telefonos
            ? cliente_orig.telefonos
            : ''),
            30,
        87
      );
    doc.y = 110;
    doc.x = 30;
    doc.fillColor('black');
    doc.text(
      cliente_orig.dir_fiscal
        ? cliente_orig.dir_fiscal
        : cliente_orig.direccion,
      {
        width: 190,
        align: 'justify',
      }
    );
    doc.text('DOCUMENTO', 250, 40);
    doc.text('FACTURA', 250, 58);
    doc.text('NUMERO', 370, 40);
    doc.text(data.nroControl, 370, 58);
    doc.text('CONDICIONES DE PAGO', 250, 90);
    doc.text(data.formaPago, 250, 110);
    doc.text('FECHA DE EMISION', 370, 90);
    doc.text(data.fecha_emision, 370, 110);
    
    doc.text('DESCRIPCIÓN', 30, 170);
    doc.text('CANTIDAD', 200, 170);
    doc.text('PRECIO UNITARIO', 260, 170);
    doc.text('%IVA', 350, 170);
    doc.text('PRECIO TOTAL', 400, 170);
    doc.lineCap('butt').moveTo(30, 188).lineTo(470, 188).stroke();
    doc.text('DESCRIPCIÓN', 30, 255);
    doc.fontSize(8);
    doc.text('FORMA DE PAGO:', 30, 310);
    doc.lineJoin('square').rect(30, 325, 230, 45).stroke();
    doc.text('EFECTIVO', 40, 335);
    doc.lineJoin('square').rect(90, 334, 10, 10).stroke();
    doc.text('CHEQUE', 110, 335);
    doc.text('NRO.', 40, 355);
    doc.lineCap('butt').moveTo(65, 362).lineTo(180, 362).stroke();
    doc.fontSize(7);
    doc.text('SON: ' + total, 30, 380)
    doc.text(data.nroDocumento, 30, 455);
    doc.text('SUBTOTAL: ', 340, 300);
    doc.y = 300;
    doc.x = 340;
    doc.text(
      utils.truncate(data.subtotal, 10),
      {
        width: 125,
        align: 'right',
      }
    );
    doc.text('DESCUENTO(' + data.porc_desc + '%): ', 340, 315);
    doc.y = 315;
    doc.x = 340;
    doc.text(
      utils.truncate(data.descuento, 10),
      {
        width: 125,
        align: 'right',
      }
    );
    doc.text('BASE IMPONIBLE: ', 340, 330);
    doc.y = 330;
    doc.x = 340;
    doc.text(
      utils.truncate(data.base, 10),
      {
        width: 125,
        align: 'right',
      }
    );
    doc.text('MONTO EXENTO: ', 340, 345);
    doc.y = 345;
    doc.x = 340;
    doc.text(
      utils.truncate(data.exento, 10),
      {
        width: 125,
        align: 'right',
      }
    );
    doc.text('IVA(' + data.iva + '%): ', 340, 360);
    doc.y = 360;
    doc.x = 340;
    doc.text(
      utils.truncate(data.impuesto, 10),
      {
        width: 125,
        align: 'right',
      }
    );
    doc.text('TARIFA POSTAL (E): ', 340, 375);
    doc.y = 375;
    doc.x = 340;
    doc.text(
      utils.truncate(data.fpo, 10),
      {
        width: 125,
        align: 'right',
      }
    );
    doc.text('TOTAL: ', 340, 390);
    doc.y = 390;
    doc.x = 340;
    doc.text(
      utils.truncate(data.total, 10),
      {
        width: 125,
        align: 'right',
      }
    );
    doc.y = 275;
    doc.x = 30;
    doc.fontSize(8)
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
      doc.text(
        data.monto_divisas,
        {
          width: 280,
          align: 'justify',
        }
      );
      doc.text('3%', 211, 460);
      doc.y = 460;
      doc.x = 275;
      doc.text(
        data.monto_igtf,
        {
          width: 100,
          align: 'justify',
        }
      );
      doc.y = 460;
      doc.x = 347;
      doc.text(
        data.valor_dolar,
        {
          width: 100,
          align: 'justify',
        }
      );
      doc.y = 460;
      doc.x = 402;
      doc.text(
        data.igtf_bs,
        {
          width: 100,
          align: 'justify',
        }
      );
    }

    var i = 0;
    for (var item = 0; item <= data.detalles.length - 1; item++) {
      doc.fontSize(8)
      doc.text(data.detalles[item].concepto, 30, 195 + i);
      doc.y = 195 + i;
      doc.x = 193;
      doc.fillColor('black');
      doc.text(
        utils.truncate(data.detalles[item].cantidad, 10),
        {
          width: 57,
          align: 'center',
        }
      );
      doc.y = 195 + i;
      doc.x = 240;
      doc.fillColor('black');
      doc.text(
        utils.truncate(data.detalles[item].costo_unitario, 10),
        {
          width: 97,
          align: 'right',
        }
      );
      doc.y = 195 + i;
      doc.x = 340;
      doc.fillColor('black');
      doc.text(
        utils.truncate(data.iva, 5),
        {
          width: 30,
          align: 'right',
        }
      );
      doc.y = 195 + i;
      doc.x = 380;
      doc.fillColor('black');
      doc.text(
        utils.truncate(data.detalles[item].subtotal, 10),
        {
          width: 86,
          align: 'right',
        }
      );
      i = i + 20;
      if (item === 2) item = data.detalles.length + 2;
    }
  }
}

module.exports = FacturaPreimpresoService;
