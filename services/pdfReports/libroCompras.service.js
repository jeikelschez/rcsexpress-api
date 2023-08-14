const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

class LibroComprasService {
  async mainReport(doc, agencia, proveedor, desde, hasta, detalle) {
    let where = {
      fecha_documento: {
        [Sequelize.Op.between]: [
          moment(desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
          moment(hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
        ],
      },
    };

    if (agencia) where.cod_agencia = agencia;
    if (proveedor) where.cod_proveedor = proveedor;

    let detalles = await models.Mctapagar.findAll({
      where: where,
      attributes: [
        'id',
        'fecha_registro',
        'nro_documento',
        'tipo_documento',
        'nro_ctrl_doc',
        'nro_doc_afectado',
        'total_documento',
        'monto_exento',
        'monto_base_intern',
        'monto_imp_intern',
        'monto_base_nacional',
        'monto_imp_nacional',
        'fecha_comprobante',
        'nro_comprobante_iva',
        'saldo_retenido',
      ],
      include: [
        {
          model: models.Agencias,
          as: 'agencias',
          attributes: ['nb_agencia'],
        },
        {
          model: models.Proveedores,
          as: 'proveedores',
          attributes: ['rif_proveedor', 'nb_proveedor', 'tipo_persona'],
        },
      ],
      order: [['nro_comprobante_iva', 'ASC']],
      raw: true,
    });

    if (detalles.length == 0) return false;

    detalles.desde = desde;
    detalles.hasta = hasta;
    detalles.detalle = detalle;
    if (proveedor) detalles.proveedor = proveedor;
    await this.generateHeader(doc, detalles);
    await this.generateCustomerInformation(doc, detalles);
    return true;
  }

  async generateHeader(doc, detalles) {
    doc.font('Helvetica-Bold');
    doc.fillColor('#444444');
    doc.fontSize(14);
    doc.text('RCS EXPRESS, S.A', 35, 35);
    doc.fontSize(12);
    doc.text('RIF. J-31028463-6', 35, 55);

    doc.fontSize(14);
    doc.y = 70;
    doc.x = 320;
    doc.text(
      detalles.proveedor
        ? 'LIBRO DE COMPRAS POR PROVEEDOR'
        : 'LIBRO DE COMPRAS',
      {
        align: 'center',
        columns: 1,
        width: 400,
      }
    );

    doc.fontSize(12);
    doc.y = 90;
    doc.x = 410;
    doc.text('Desde: ' + detalles.desde, {
      align: 'left',
      columns: 1,
      width: 300,
    });
    doc.y = 90;
    doc.x = 527;
    doc.text('Hasta: ' + detalles.hasta, {
      align: 'left',
      columns: 1,
      width: 300,
    });

    doc.fontSize(8);
    doc.y = 50;
    doc.x = 220;
    doc.text(detalles.detalle, {
      align: 'left',
      columns: 1,
      width: 150,
    });

    doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 910, 35);

    doc.lineWidth(0.5);
    doc.lineCap('butt').moveTo(25, 120).lineTo(985, 120).stroke();

    doc.fontSize(7);
    doc.text('Op.', 30, 125);
    doc.text(' N°', 30, 133);
    doc.text(' Fecha', 51, 125);
    doc.text('Factura', 51, 133);
    doc.text('Rif', 100, 125);
    doc.text('Nombre o Razón Social del Proveedor', 140, 125);
    doc.text('Tipo', 276, 125);
    doc.text('Prov.', 275, 133);
    doc.text('  N°', 297, 125);
    doc.text('  de', 297, 133);
    doc.text('Comp.', 295, 141);
    doc.text(' Num.', 322, 125);
    doc.text(' Plan.', 322, 133);
    doc.text('Import.', 322, 141);
    doc.text(' Num.', 352, 125);
    doc.text('Exped.', 352, 133);
    doc.text('Import.', 352, 141);
    doc.text('Número', 382, 125);
    doc.text('Factura', 382, 133);
    doc.text('Número', 417, 125);
    doc.text('Control.', 417, 133);
    doc.text('de Doc.', 417, 141);
    doc.text('   N°', 455, 125);
    doc.text(' Nota', 455, 133);
    doc.text('Débito', 455, 141);
    doc.text('   N°', 483, 125);
    doc.text(' Nota', 483, 133);
    doc.text('Crédito', 483, 141);
    doc.text('Tipo', 514, 125);
    doc.text('  de', 514, 133);
    doc.text('Trans.', 514, 141);
    doc.text('N° de', 543, 125);
    doc.text('Fact.', 544, 133);
    doc.text('Afectada', 537, 141);
    doc.text('Total', 578, 125);
    doc.text('Compras', 571, 133);
    doc.text('con IVA', 574, 141);
    doc.text(' Compras', 610, 125);
    doc.text('sin derecho', 610, 133);
    doc.text('  a IVA', 618, 141);
    doc.text('Importaciones', 668, 125);
    doc.lineCap('butt').moveTo(655, 132).lineTo(727, 132).stroke();
    doc.text('Base', 663, 133);
    doc.text('Imponible', 655, 141);
    doc.text(' %', 693, 133);
    doc.text('Alic.', 692, 141);
    doc.text('Imp.', 709, 133);
    doc.text('IVA.', 710, 141);
    doc.text('Internas', 755, 125);
    doc.lineCap('butt').moveTo(730, 132).lineTo(810, 132).stroke();
    doc.text('Base', 738, 133);
    doc.text('Imponible', 730, 141);
    doc.text(' %', 768, 133);
    doc.text('Alic.', 767, 141);
    doc.text('Impuesto', 780, 133);
    doc.text('IVA.', 790, 141);
    doc.text('Fecha', 822, 125);
    doc.text('Comp.', 822, 133);
    doc.text('Retenc.', 822, 141);
    doc.text('N°', 880, 125);
    doc.text('Comprobante', 860, 133);
    doc.text(' IVA', 924, 125);
    doc.text(' Ret.', 924, 133);
    doc.text('Vend.', 924, 141);
    doc.text(' IVA', 945, 125);
    doc.text(' Ret.', 945, 133);
    doc.text('Terc.', 945, 141);
    doc.text('  Ant.', 962, 125);
    doc.text('  IVA', 962, 133);
    doc.text('Import.', 962, 141);

    doc.lineWidth(0.5);
    doc.lineCap('butt').moveTo(25, 150).lineTo(985, 150).stroke();
  }

  async generateCustomerInformation(doc, detalles) {
    let total_documento = 0;
    let total_exento = 0;
    let total_base_imp = 0;
    let total_imp_imp = 0;
    let total_base_nac = 0;
    let total_imp_nac = 0;
    let total_retenido = 0;

    var i = 0;
    var page = 0;
    var ymin;
    ymin = 160;
    for (var item = 0; item < detalles.length; item++) {
      doc.fontSize(7);
      doc.font('Helvetica');
      doc.fillColor('#444444');

      doc.y = ymin + i;
      doc.x = 22;
      doc.text(item + 1, {
        align: 'center',
        columns: 1,
        width: 20,
      });
      doc.y = ymin + i;
      doc.x = 42;
      doc.text(moment(detalles[item].fecha_registro).format('DD/MM/YYYY'), {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 83;
      doc.text(detalles[item]['proveedores.rif_proveedor'], {
        align: 'center',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 138;
      doc.text(utils.truncate(detalles[item]['proveedores.nb_proveedor'], 70), {
        align: 'left',
        columns: 1,
        width: 135,
      });
      doc.y = ymin + i;
      doc.x = 270;
      doc.text('P' + detalles[item]['proveedores.tipo_persona'], {
        align: 'center',
        columns: 1,
        width: 30,
      });
      doc.y = ymin + i;
      doc.x = 375;
      doc.text(
        detalles[item].tipo_documento == 'FA'
          ? detalles[item].nro_documento
          : '',
        {
          align: 'center',
          columns: 1,
          width: 35,
        }
      );
      doc.y = ymin + i;
      doc.x = 409;
      doc.text(
        detalles[item].tipo_documento == 'FA'
          ? detalles[item].nro_ctrl_doc
            ? detalles[item].nro_ctrl_doc
            : detalles[item].nro_documento
          : '',
        {
          align: 'center',
          columns: 1,
          width: 45,
        }
      );
      doc.y = ymin + i;
      doc.x = 453;
      doc.text(
        detalles[item].tipo_documento == 'ND'
          ? detalles[item].nro_documento
          : '',
        {
          align: 'center',
          columns: 1,
          width: 26,
        }
      );
      doc.y = ymin + i;
      doc.x = 480;
      doc.text(
        detalles[item].tipo_documento == 'NC'
          ? detalles[item].nro_documento
          : '',
        {
          align: 'center',
          columns: 1,
          width: 26,
        }
      );
      doc.y = ymin + i;
      doc.x = 510;
      doc.text('01-Reg', {
        align: 'center',
        columns: 1,
        width: 26,
      });
      doc.y = ymin + i;
      doc.x = 538;
      doc.text(detalles[item].nro_doc_afectado, {
        align: 'center',
        columns: 1,
        width: 26,
      });

      total_documento += utils.parseFloatN(detalles[item].total_documento);
      total_exento += utils.parseFloatN(detalles[item].monto_exento);
      total_retenido += utils.parseFloatN(detalles[item].saldo_retenido);

      doc.y = ymin + i;
      doc.x = 555;
      doc.text(utils.formatNumber(detalles[item].total_documento), {
        align: 'right',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 610;
      doc.text(utils.formatNumber(detalles[item].monto_exento), {
        align: 'right',
        columns: 1,
        width: 40,
      });

      if (detalles[item].monto_base_intern > 0) {
        let base_imp =
          detalles[item].tipo_documento == 'NC'
            ? detalles[item].monto_base_intern * -1
            : detalles[item].monto_base_intern;
        let imp_imp =
          detalles[item].tipo_documento == 'NC'
            ? detalles[item].monto_imp_intern * -1
            : detalles[item].monto_imp_intern;
        total_base_imp += utils.parseFloatN(base_imp);
        total_imp_imp += utils.parseFloatN(imp_imp);

        doc.y = ymin + i;
        doc.x = 658;
        doc.text(utils.formatNumber(base_imp), {
          align: 'right',
          columns: 1,
          width: 30,
        });
        doc.y = ymin + i;
        doc.x = 688;
        doc.text(
          (
            (detalles[item].monto_imp_intern * 100) /
            detalles[item].monto_base_intern
          ).toFixed(0),
          {
            align: 'right',
            columns: 1,
            width: 15,
          }
        );
        doc.y = ymin + i;
        doc.x = 705;
        doc.text(utils.formatNumber(imp_imp), {
          align: 'right',
          columns: 1,
          width: 20,
        });
      }

      let base_nac =
        detalles[item].tipo_documento == 'NC'
          ? detalles[item].monto_base_nacional * -1
          : detalles[item].monto_base_nacional;
      let imp_nac =
        detalles[item].tipo_documento == 'NC'
          ? detalles[item].monto_imp_nacional * -1
          : detalles[item].monto_imp_nacional;
      total_base_nac += utils.parseFloatN(base_nac);
      total_imp_nac += utils.parseFloatN(imp_nac);

      doc.y = ymin + i;
      doc.x = 718;
      doc.text(utils.formatNumber(base_nac), {
        align: 'right',
        columns: 1,
        width: 45,
      });
      if (detalles[item].monto_base_nacional > 0) {
        doc.y = ymin + i;
        doc.x = 762;
        doc.text(
          (
            (detalles[item].monto_imp_nacional * 100) /
            detalles[item].monto_base_nacional
          ).toFixed(0),
          {
            align: 'right',
            columns: 1,
            width: 15,
          }
        );
      }
      doc.y = ymin + i;
      doc.x = 764;
      doc.text(utils.formatNumber(imp_nac), {
        align: 'right',
        columns: 1,
        width: 45,
      });
      doc.y = ymin + i;
      doc.x = 812;
      doc.text(
        detalles[item].fecha_comprobante
          ? moment(detalles[item].fecha_comprobante).format('DD/MM/YYYY')
          : '',
        {
          align: 'center',
          columns: 1,
          width: 40,
        }
      );
      doc.y = ymin + i;
      doc.x = 853;
      doc.text(detalles[item].nro_comprobante_iva, {
        align: 'center',
        columns: 1,
        width: 60,
      });
      doc.y = ymin + i;
      doc.x = 905;
      doc.text(utils.formatNumber(detalles[item].saldo_retenido), {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 943;
      doc.text(0, {
        align: 'right',
        columns: 1,
        width: 20,
      });
      doc.y = ymin + i;
      doc.x = 963;
      doc.text(0, {
        align: 'right',
        columns: 1,
        width: 20,
      });

      i += 16;
      if (i >= 400) {
        doc.fillColor('#BLACK');
        doc.addPage();
        page = page + 1;
        doc.switchToPage(page);
        i = 0;
        await this.generateHeader(doc, detalles);
      }
    }

    let y = ymin + i;
    doc.lineWidth(0.5);
    doc.lineCap('butt').moveTo(25, y).lineTo(985, y).stroke();

    doc.font('Helvetica-Bold');
    doc.y = y + 8;
    doc.x = 455;
    doc.text('TOTAL GENERAL:', {
      align: 'right',
      columns: 1,
      width: 100,
    });
    doc.y = y + 8;
    doc.x = 555;
    doc.text(utils.formatNumber(total_documento), {
      align: 'right',
      columns: 1,
      width: 50,
    });
    doc.y = y + 8;
    doc.x = 610;
    doc.text(utils.formatNumber(total_exento), {
      align: 'right',
      columns: 1,
      width: 40,
    });

    if (total_base_imp > 0) {
      doc.y = y + 8;
      doc.x = 658;
      doc.text(utils.formatNumber(total_base_imp), {
        align: 'right',
        columns: 1,
        width: 30,
      });
      doc.y = y + 8;
      doc.x = 705;
      doc.text(utils.formatNumber(total_imp_imp), {
        align: 'right',
        columns: 1,
        width: 20,
      });
    }

    doc.y = y + 8;
    doc.x = 718;
    doc.text(utils.formatNumber(total_base_nac), {
      align: 'right',
      columns: 1,
      width: 45,
    });
    doc.y = y + 8;
    doc.x = 764;
    doc.text(utils.formatNumber(total_imp_nac), {
      align: 'right',
      columns: 1,
      width: 45,
    });
    doc.y = y + 8;
    doc.x = 905;
    doc.text(utils.formatNumber(total_retenido), {
      align: 'right',
      columns: 1,
      width: 40,
    });
    doc.y = y + 8;
    doc.x = 943;
    doc.text(0, {
      align: 'right',
      columns: 1,
      width: 20,
    });
    doc.y = y + 8;
    doc.x = 963;
    doc.text(0, {
      align: 'right',
      columns: 1,
      width: 20,
    });

    doc.lineWidth(1);
    doc
      .lineCap('butt')
      .moveTo(370, y + 20)
      .lineTo(985, y + 20)
      .stroke();

    if (!detalles.proveedor) {
      if (y >= 360) {
        doc.addPage();
        page = page + 1;
        doc.switchToPage(page);
        y = 100;
        await this.generateHeader(doc, detalles);
      }

      y += 80;
      doc.text('Base Imponible', 605, y);
      doc.text('Crédito Fiscal', 685, y);
      doc.text('IVA Retenido (a', 768, y - 6);
      doc.text('terceros)', 780, y);

      doc.text('Compras Exentas y/o sin derecho a crédito fiscal', 375, y + 13);
      doc.text(
        'Compras Importación Afectas solo Alicuota General',
        375,
        y + 28
      );
      doc.text(
        'Compras Importación Afectas en Alicuota General + Adicional',
        375,
        y + 43
      );
      doc.text('Compras Importación Afectas en Alicuota Reducida', 375, y + 58);
      doc.text('Compras Internas Afectas solo Alicuota General', 375, y + 73);
      doc.text(
        'Compras Internas Afectas en Alicuota General + Adicional',
        375,
        y + 88
      );
      doc.text('Compras Internas Afectas en Alicuota Reducida', 375, y + 103);

      doc.y = y + 13;
      doc.x = 607;
      doc.text(utils.formatNumber(total_exento), {
        align: 'center',
        columns: 1,
        width: 50,
      });
      doc.y = y + 28;
      doc.x = 607;
      doc.text(total_base_imp, {
        align: 'center',
        columns: 1,
        width: 50,
      });
      doc.y = y + 43;
      doc.x = 607;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 50,
      });
      doc.y = y + 58;
      doc.x = 607;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 50,
      });
      doc.y = y + 73;
      doc.x = 607;
      doc.text(utils.formatNumber(total_base_nac), {
        align: 'center',
        columns: 1,
        width: 50,
      });
      doc.y = y + 88;
      doc.x = 607;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 50,
      });
      doc.y = y + 103;
      doc.x = 607;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 50,
      });
      doc.y = y + 118;
      doc.x = 607;
      doc.text(
        utils.formatNumber(total_exento + total_base_imp + total_base_nac),
        {
          align: 'center',
          columns: 1,
          width: 50,
        }
      );

      doc.y = y + 13;
      doc.x = 687;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 28;
      doc.x = 687;
      doc.text(total_imp_imp, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 43;
      doc.x = 687;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 58;
      doc.x = 687;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 73;
      doc.x = 687;
      doc.text(utils.formatNumber(total_imp_nac), {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 88;
      doc.x = 687;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 103;
      doc.x = 687;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 118;
      doc.x = 687;
      doc.text(utils.formatNumber(total_imp_imp + total_imp_nac), {
        align: 'center',
        columns: 1,
        width: 40,
      });

      doc.y = y + 13;
      doc.x = 775;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 28;
      doc.x = 775;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 43;
      doc.x = 775;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 58;
      doc.x = 775;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 73;
      doc.x = 775;
      doc.text(utils.formatNumber(total_retenido), {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 88;
      doc.x = 775;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 103;
      doc.x = 775;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 118;
      doc.x = 775;
      doc.text(utils.formatNumber(total_retenido), {
        align: 'center',
        columns: 1,
        width: 40,
      });

      doc.lineWidth(0.5);
      y += 9;
      for (var j = 0; j < 7; j++) {
        doc.lineJoin('miter').rect(370, y, 220, 13).stroke();
        doc.lineJoin('miter').rect(590, y, 80, 13).stroke();
        doc.lineJoin('miter').rect(672, y, 70, 13).stroke();
        doc.lineJoin('miter').rect(760, y, 70, 13).stroke();
        y += 15;
      }
      doc.lineJoin('miter').rect(590, y, 80, 13).stroke();
      doc.lineJoin('miter').rect(672, y, 70, 13).stroke();
      doc.lineJoin('miter').rect(760, y, 70, 13).stroke();
    }

    var end;
    const range = doc.bufferedPageRange();
    for (
      i = range.start, end = range.start + range.count, range.start <= end;
      i < end;
      i++
    ) {
      doc.switchToPage(i);
      doc.fontSize(8);
      doc.fillColor('#444444');
      doc.x = 875;
      doc.y = 50;
      doc.text(`Pagina ${i + 1} de ${range.count}`, {
        align: 'right',
        columns: 1,
        width: 100,
      });
    }
  }
}

module.exports = LibroComprasService;
