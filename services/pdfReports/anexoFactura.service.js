const moment = require('moment');
const { models } = require('./../../libs/sequelize');

const UtilsService = require('./../utils.service');
const utils = new UtilsService();

class AnexoFacturaService {
  async mainReport(doc, data) {
    data = JSON.parse(data);
    let detalle = await models.Mmovimientos.findAll({
      where: {
        tipo_doc_principal: 'FA',
        nro_doc_principal: data.nro_documento,
        nro_ctrl_doc_ppal: data.nro_control,
        cod_ag_doc_ppal: data.cod_agencia,
      },
      include: [
        {
          model: models.Agencias,
          as: 'agencias',
          include: {
            model: models.Ciudades,
            as: 'ciudades',
          },
        },
        {
          model: models.Agencias,
          as: 'agencias_dest',
          include: {
            model: models.Ciudades,
            as: 'ciudades',
          },
        },
      ],
      raw: true,
    });

    if (detalle.length == 0) return false;
    await this.generateHeader(doc, data, detalle);
    await this.generateCustomerInformation(doc, data, detalle);
    return true;
  }

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

    let fecha_emision_init = moment(detalle[0].fecha_emision).format(
      'DD/MM/YYYY'
    );
    let fecha_emision_end = moment(
      detalle[detalle.length - 1].fecha_emision
    ).format('DD/MM/YYYY');

    doc
      .image('./img/logo_rc.png', 50, 45, { width: 50 })
      .fillColor('#444444')
      .fontSize(13)
      .font('Helvetica-Bold')
      .text('RCS Express, S.A', 110, 50)
      .text('R.I.F. J-31028463-6', 110, 70)
      .fontSize(12)
      .text('Valencia, ' + moment().format('DD/MM/YYYY'), 200, 50, {
        align: 'right',
      })
      .fontSize(16)
      .text('Informe de Ventas Realizadas', 200, 110)
      .fontSize(11);
    doc.y = 130;
    doc.x = 213;
    doc.text(cliente_orig.nb_cliente, {
      align: 'center',
      columns: 1,
      width: 200,
    });
    doc.text('Desde: ' + fecha_emision_init, 200, 160);
    doc.text('Hasta: ' + fecha_emision_end, 320, 160);
    doc.text('Nro. Factura: ' + data.nroFact, 50, 140);
    doc.text('Nro. Control: ' + data.nroControl, 50, 160);
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

    for (var item = 0; item <= detalle.length - 1; item++) {
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
      doc.x = 45;
      doc.text(
        detalle[item].fecha_emision.substring(5, 7) +
          '-' +
          detalle[item].fecha_emision.substring(0, 4),
        {
          align: 'center',
          columns: 1,
          width: 35,
        }
      );
      doc.y = ymin + i;
      doc.x = 90;
      doc.text(fecha_envio, {
        align: 'center',
        columns: 1,
        width: 47,
      });
      doc.y = ymin + i;
      doc.x = 141;
      doc.text(detalle[item].nro_documento, {
        align: 'center',
        columns: 1,
        width: 67,
      });
      doc.y = ymin + i;
      doc.x = 210;
      doc.text(detalle[item].dimensiones.substring(0, 20), {
        align: 'center',
        columns: 1,
        width: 105,
      });
      doc.y = ymin + i;
      doc.x = 326;
      doc.text(detalle[item]['agencias.ciudades.siglas'], {
        align: 'center',
        columns: 1,
        width: 30,
      });
      doc.y = ymin + i;
      doc.x = 361;
      doc.text(detalle[item]['agencias_dest.ciudades.siglas'], {
        align: 'center',
        columns: 1,
        width: 30,
      });
      doc.y = ymin + i;
      doc.x = 388;
      doc.text(utils.formatNumber(detalle[item].monto_base), {
        align: 'right',
        columns: 1,
        width: 65,
      });
      doc.y = ymin + i;
      doc.x = 455;
      doc.text(utils.formatNumber(detalle[item].monto_impuesto), {
        align: 'right',
        columns: 1,
        width: 44,
      });
      doc.y = ymin + i;
      doc.x = 495;
      doc.text(
        utils.formatNumber(
          (
            utils.parseFloatN(detalle[item].monto_base) +
            utils.parseFloatN(detalle[item].monto_impuesto)
          ).toFixed(2)
        ),
        {
          align: 'right',
          columns: 1,
          width: 65,
        }
      );
      i = i + 17;
      if (i >= 500) {
        doc.addPage();
        page = page + 1;
        doc.switchToPage(page);
        i = 0;
        await this.generateHeader(doc, data, detalle);
      }
    }
    if (i >= 500) {
      doc.addPage();
      page = page + 1;
      doc.switchToPage(page);
      await this.generateHeader(doc, data, detalle);
      i = 0;
      ymin = 50;
    }
    doc.font('Helvetica-Bold');
    doc.text('Totales:', 310, ymin + i);
    doc.y = ymin + i;
    doc.x = 388;
    doc.text(utils.formatNumber(base.toFixed(2)), {
      align: 'right',
      columns: 1,
      width: 65,
    });
    doc.y = ymin + i;
    doc.x = 455;
    doc.text(utils.formatNumber(impuesto.toFixed(2)), {
      align: 'right',
      columns: 1,
      width: 44,
    });
    doc.y = ymin + i;
    doc.x = 495;
    doc.text(utils.formatNumber((base + impuesto).toFixed(2)), {
      align: 'right',
      columns: 1,
      width: 65,
    });

    if (data.monto_descuento > 0) {
      doc.text('Descuento de Fletes:', 310, ymin + i + 17);
      doc.y = ymin + i + 17;
      doc.x = 388;
      doc.text(utils.formatNumber(descuento.toFixed(2)), {
        align: 'right',
        columns: 1,
        width: 65,
      });
      doc.y = ymin + i + 17;
      doc.x = 455;
      doc.text(utils.formatNumber(descuento_impuesto.toFixed(2)), {
        align: 'right',
        columns: 1,
        width: 44,
      });
      doc.y = ymin + i + 17;
      doc.x = 495;
      doc.text(
        utils.formatNumber((descuento + descuento_impuesto).toFixed(2)),
        {
          align: 'right',
          columns: 1,
          width: 65,
        }
      );
      doc.y = ymin + i + 34;
      doc.x = 388;
      doc.text(utils.formatNumber((base + descuento).toFixed(2)), {
        align: 'right',
        columns: 1,
        width: 65,
      });
      doc.y = ymin + i + 34;
      doc.x = 455;
      doc.text(
        utils.formatNumber((base + descuento + descuento_impuesto).toFixed(2)),
        {
          align: 'right',
          columns: 1,
          width: 44,
        }
      );
      doc.y = ymin + i + 34;
      doc.x = 495;
      doc.text(
        utils.formatNumber((base + descuento + descuento_impuesto).toFixed(2)),
        {
          align: 'right',
          columns: 1,
          width: 65,
        }
      );
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
      doc.y = 800;
      doc.text(`Pagina ${i + 1} de ${range.count}`);
    }
  }
}

module.exports = AnexoFacturaService;
