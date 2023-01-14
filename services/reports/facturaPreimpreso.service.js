const { models } = require('./../../libs/sequelize');

const UtilsService = require('./../utils.service');
const utils = new UtilsService();

class FacturaPreimpresoService {
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
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('CLIENTE: ' + cliente_orig.nb_cliente, 40, 40)
      .text(
        'RIF/CO: ' +
          (cliente_orig.rif_cedula
            ? cliente_orig.rif_cedula
            : cliente_orig.rif_ci),
        40,
        63
      )
      .text(
        'TELEFONOS: ' +
          (cliente_orig.tlf_cliente
            ? cliente_orig.tlf_cliente
            : cliente_orig.telefonos
            ? cliente_orig.telefonos
            : ''),
        40,
        87
      );
    doc.y = 110;
    doc.x = 40;
    doc.fillColor('black');
    doc.text(
      cliente_orig.dir_fiscal
        ? cliente_orig.dir_fiscal
        : cliente_orig.direccion,
      {
        width: 400,
        align: 'justify',
      }
    );
    doc.text('DOCUMENTO', 470, 40);
    doc.text('FACTURA', 470, 58);
    doc.text('NUMERO', 650, 40);
    doc.text(data.nroControl, 650, 58);
    doc.text('CONDICIONES DE PAGO', 470, 90);
    doc.text(data.formaPago, 470, 110);
    doc.text('FECHA DE EMISION', 650, 90);
    doc.text(data.fecha_emision, 650, 110);
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
    doc.text('SON: ' + total, 40, 380).fontSize(10);
    doc.text(data.nroDocumento, 40, 455);
    doc.text('SUBTOTAL: ' + data.subtotal, 680, 300);
    doc.text('DESCUENTO(' + data.porc_desc + '%): ' + data.descuento, 680, 315);
    doc.text('BASE IMPONIBLE: ' + data.base, 680, 330);
    doc.text('MONTO EXENTO: ' + data.exento, 680, 345);
    doc.text('IVA(' + data.iva + '%): ' + data.impuesto, 680, 360);
    doc.text('TARIFA POSTAL (E): ' + data.fpo, 680, 375);
    doc.text('TOTAL: ' + data.total, 680, 390);
    doc.y = 400;
    doc.x = 200;

    if (data.monto_divisas != '0,00') {
      doc.text(
        'PROVIDENCIA ADMINISTRATIVA N° SNAT 2022/000013 que designan a los Sujetos Pasivos Especiales como Agentes de Percepción del IGTF',
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
      doc.text('TASA BCV', 465, 438);
      doc.text('IGTF BS', 545, 438);
      doc.text(data.monto_divisas, 208, 460);
      doc.text('3%', 309, 460);
      doc.text(data.monto_igtf, 380, 460);
      doc.text(data.valor_dolar, 465, 460);
      doc.text(data.igtf_bs, 545, 460);
    }

    var i = 0;
    for (var item = 0; item <= data.detalles.length - 1; item++) {
      doc.text(data.detalles[item].concepto, 40, 195 + i);
      doc.text(data.detalles[item].cantidad, 360, 195 + i);
      doc.text(data.detalles[item].costo_unitario, 440, 195 + i);
      doc.text(data.iva, 550, 195 + i);
      doc.text(data.detalles[item].subtotal, 680, 195 + i);
      i = i + 20;
      if (item === 2) item = data.detalles.length + 2;
    }
  }
}

module.exports = FacturaPreimpresoService;
