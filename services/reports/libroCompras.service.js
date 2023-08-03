const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

class LibroComprasService {
  async mainReport(doc, agencia, proveedor, desde, hasta) {
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
    doc.x = 230;
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
    doc.x = 320;
    doc.text('Desde: ' + detalles.desde, {
      align: 'left',
      columns: 1,
      width: 300,
    });
    doc.y = 90;
    doc.x = 437;
    doc.text('Hasta: ' + detalles.hasta, {
      align: 'left',
      columns: 1,
      width: 300,
    });

    doc.fontSize(8);
    doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 700, 35);

    doc.lineWidth(0.5);
    doc.lineCap('butt').moveTo(15, 120).lineTo(780, 120).stroke();

    doc.fontSize(5);
    doc.text('Op.', 18, 125);
    doc.text(' N°', 18, 132);
    doc.text(' Fecha', 30, 125);
    doc.text('Factura', 30, 132);
    doc.text('Rif', 65, 125);
    doc.text('Nombre o Razón Social del Proveedor', 90, 125);
    doc.text('Tipo', 191, 125);
    doc.text('Prov.', 190, 132);
    doc.text('  N°', 206, 125);
    doc.text('  de', 206, 132);
    doc.text('Comp.', 205, 139);
    doc.text(' Num.', 225, 125);
    doc.text(' Plan.', 225, 132);
    doc.text('Import.', 225, 139);
    doc.text(' Num.', 245, 125);
    doc.text('Exped.', 245, 132);
    doc.text('Import.', 245, 139);
    doc.text('Número', 275, 125);
    doc.text('Factura.', 275, 132);
    doc.text('Número', 310, 125);
    doc.text('Control.', 310, 132);
    doc.text('de Doc.', 310, 139);
    doc.text('   N°', 345, 125);
    doc.text(' Nota', 345, 132);
    doc.text('Débito', 345, 139);
    doc.text('   N°', 370, 125);
    doc.text(' Nota', 370, 132);
    doc.text('Crédito', 370, 139);
    doc.text('Tipo', 395, 125);
    doc.text('  de', 395, 132);
    doc.text('Trans.', 395, 139);
    doc.text('  N° de', 420, 125);
    doc.text('  Fact.', 420, 132);
    doc.text('Afectada', 420, 139);
    doc.text('  Total', 456, 125);
    doc.text('Compras', 455, 132);
    doc.text(' con IVA', 455, 139);
    doc.text(' Compras', 486, 125);
    doc.text('sin derecho', 485, 132);
    doc.text('  a IVA', 490, 139);
    doc.text('Importaciones', 530, 125);
    doc.lineCap('butt').moveTo(517, 130).lineTo(577, 130).stroke();
    doc.text('Base', 525, 132);
    doc.text('Imponible', 520, 139);
    doc.text(' %', 550, 132);
    doc.text('Alic.', 549, 139);
    doc.text('Imp.', 564, 132);
    doc.text('IVA.', 565, 139);
    doc.text('Internas', 610, 125);
    doc.lineCap('butt').moveTo(582, 130).lineTo(650, 130).stroke();
    doc.text('Base', 590, 132);
    doc.text('Imponible', 585, 139);
    doc.text(' %', 613, 132);
    doc.text('Alic.', 613, 139);
    doc.text('Impuesto', 625, 132);
    doc.text('IVA.', 633, 139);
    doc.text('Fecha', 657, 125);
    doc.text('Comp.', 657, 132);
    doc.text('Retenc.', 657, 139);
    doc.text('N°', 698, 125);
    doc.text('Comprobante', 683, 132);
    doc.text(' IVA', 725, 125);
    doc.text(' Ret.', 725, 132);
    doc.text('Vend.', 725, 139);
    doc.text(' IVA', 746, 125);
    doc.text(' Ret.', 746, 132);
    doc.text('Terc.', 746, 139);
    doc.text('  Ant.', 763, 125);
    doc.text('  IVA', 763, 132);
    doc.text('Import.', 763, 139);

    doc.lineWidth(0.5);
    doc.lineCap('butt').moveTo(15, 146).lineTo(780, 146).stroke();
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
    ymin = 155;
    for (var item = 0; item < detalles.length; item++) {
      doc.fontSize(5);
      doc.font('Helvetica');
      doc.fillColor('#444444');

      doc.y = ymin + i;
      doc.x = 10;
      doc.text(item + 1, {
        align: 'center',
        columns: 1,
        width: 20,
      });
      doc.y = ymin + i;
      doc.x = 18;
      doc.text(moment(detalles[item].fecha_registro).format('DD/MM/YYYY'), {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 50;
      doc.text(detalles[item]['proveedores.rif_proveedor'], {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 90;
      doc.text(utils.truncate(detalles[item]['proveedores.nb_proveedor'], 70), {
        align: 'left',
        columns: 1,
        width: 100,
      });
      doc.y = ymin + i;
      doc.x = 180;
      doc.text('P' + detalles[item]['proveedores.tipo_persona'], {
        align: 'center',
        columns: 1,
        width: 30,
      });
      doc.y = ymin + i;
      doc.x = 267;
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
      doc.x = 302;
      doc.text(
        detalles[item].tipo_documento == 'FA'
          ? detalles[item].nro_ctrl_doc
            ? detalles[item].nro_ctrl_doc
            : detalles[item].nro_documento
          : '',
        {
          align: 'center',
          columns: 1,
          width: 35,
        }
      );
      doc.y = ymin + i;
      doc.x = 338;
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
      doc.x = 365;
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
      doc.x = 388;
      doc.text('01-Reg', {
        align: 'center',
        columns: 1,
        width: 26,
      });
      doc.y = ymin + i;
      doc.x = 416;
      doc.text(detalles[item].nro_doc_afectado, {
        align: 'center',
        columns: 1,
        width: 26,
      });

      total_documento += utils.parseFloatN(detalles[item].total_documento);
      total_exento += utils.parseFloatN(detalles[item].monto_exento);
      total_retenido += utils.parseFloatN(detalles[item].saldo_retenido);

      doc.y = ymin + i;
      doc.x = 430;
      doc.text(utils.formatNumber(detalles[item].total_documento), {
        align: 'right',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 488;
      doc.text(utils.formatNumber(detalles[item].monto_exento), {
        align: 'right',
        columns: 1,
        width: 26,
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
        doc.x = 518;
        doc.text(utils.formatNumber(base_imp), {
          align: 'right',
          columns: 1,
          width: 26,
        });
        doc.y = ymin + i;
        doc.x = 543;
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
        doc.x = 558;
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
      doc.x = 580;
      doc.text(utils.formatNumber(base_nac), {
        align: 'right',
        columns: 1,
        width: 30,
      });
      if (detalles[item].monto_base_nacional > 0) {
        doc.y = ymin + i;
        doc.x = 605;
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
      doc.x = 616;
      doc.text(utils.formatNumber(imp_nac), {
        align: 'right',
        columns: 1,
        width: 30,
      });
      doc.y = ymin + i;
      doc.x = 644;
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
      doc.x = 675;
      doc.text(detalles[item].nro_comprobante_iva, {
        align: 'center',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 705;
      doc.text(utils.formatNumber(detalles[item].saldo_retenido), {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 740;
      doc.text(0, {
        align: 'right',
        columns: 1,
        width: 20,
      });
      doc.y = ymin + i;
      doc.x = 757;
      doc.text(0, {
        align: 'right',
        columns: 1,
        width: 20,
      });

      i += 14;
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
    doc.lineCap('butt').moveTo(15, y).lineTo(780, y).stroke();

    doc.font('Helvetica-Bold');
    doc.y = y + 8;
    doc.x = 320;
    doc.text('TOTAL GENERAL:', {
      align: 'right',
      columns: 1,
      width: 100,
    });
    doc.y = y + 8;
    doc.x = 430;
    doc.text(utils.formatNumber(total_documento), {
      align: 'right',
      columns: 1,
      width: 50,
    });
    doc.y = y + 8;
    doc.x = 488;
    doc.text(utils.formatNumber(total_exento), {
      align: 'right',
      columns: 1,
      width: 26,
    });

    if (total_base_imp > 0) {
      doc.y = y + 8;
      doc.x = 518;
      doc.text(utils.formatNumber(total_base_imp), {
        align: 'right',
        columns: 1,
        width: 26,
      });
      doc.y = y + 8;
      doc.x = 558;
      doc.text(utils.formatNumber(total_imp_imp), {
        align: 'right',
        columns: 1,
        width: 20,
      });
    }

    doc.y = y + 8;
    doc.x = 580;
    doc.text(utils.formatNumber(total_base_nac), {
      align: 'right',
      columns: 1,
      width: 30,
    });
    doc.y = y + 8;
    doc.x = 616;
    doc.text(utils.formatNumber(total_imp_nac), {
      align: 'right',
      columns: 1,
      width: 30,
    });
    doc.y = y + 8;
    doc.x = 705;
    doc.text(utils.formatNumber(total_retenido), {
      align: 'right',
      columns: 1,
      width: 40,
    });
    doc.y = y + 8;
    doc.x = 740;
    doc.text(0, {
      align: 'right',
      columns: 1,
      width: 20,
    });
    doc.y = y + 8;
    doc.x = 757;
    doc.text(0, {
      align: 'right',
      columns: 1,
      width: 20,
    });

    doc.lineWidth(1);
    doc
      .lineCap('butt')
      .moveTo(370, y + 20)
      .lineTo(780, y + 20)
      .stroke();

    if (!detalles.proveedor) {
      if (y >= 360) {
        doc.addPage();
        page = page + 1;
        doc.switchToPage(page);
        y = 100;
        await this.generateHeader(doc, detalles);
      }
  
      y += 60;
      doc.text('Base Imponible', 476, y);
      doc.text('Crédito Fiscal', 545, y);
      doc.text('IVA Retenido (a', 610, y - 6);
      doc.text('terceros)', 618, y);
  
      doc.text('Compras Exentas y/o sin derecho a crédito fiscal', 303, y + 11);
      doc.text('Compras Importación Afectas solo Alicuota General', 303, y + 23);
      doc.text(
        'Compras Importación Afectas en Alicuota General + Adicional',
        303,
        y + 35
      );
      doc.text('Compras Importación Afectas en Alicuota Reducida', 303, y + 47);
      doc.text('Compras Internas Afectas solo Alicuota General', 303, y + 59);
      doc.text(
        'Compras Internas Afectas en Alicuota General + Adicional',
        303,
        y + 71
      );
      doc.text('Compras Internas Afectas en Alicuota Reducida', 303, y + 83);
  
      doc.y = y + 11;
      doc.x = 475;
      doc.text(utils.formatNumber(total_exento), {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 23;
      doc.x = 475;
      doc.text(total_base_imp, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 35;
      doc.x = 475;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 47;
      doc.x = 475;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 59;
      doc.x = 475;
      doc.text(utils.formatNumber(total_base_nac), {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 71;
      doc.x = 475;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 83;
      doc.x = 475;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 95;
      doc.x = 475;
      doc.text(
        utils.formatNumber(total_exento + total_base_imp + total_base_nac),
        {
          align: 'center',
          columns: 1,
          width: 40,
        }
      );
  
      doc.y = y + 11;
      doc.x = 541;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 23;
      doc.x = 541;
      doc.text(total_imp_imp, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 35;
      doc.x = 541;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 47;
      doc.x = 541;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 59;
      doc.x = 541;
      doc.text(utils.formatNumber(total_imp_nac), {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 71;
      doc.x = 541;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 83;
      doc.x = 541;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 95;
      doc.x = 541;
      doc.text(utils.formatNumber(total_imp_imp + total_imp_nac), {
        align: 'center',
        columns: 1,
        width: 40,
      });
  
      doc.y = y + 11;
      doc.x = 610;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 23;
      doc.x = 610;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 35;
      doc.x = 610;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 47;
      doc.x = 610;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 59;
      doc.x = 610;
      doc.text(utils.formatNumber(total_retenido), {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 71;
      doc.x = 610;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 83;
      doc.x = 610;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 95;
      doc.x = 610;
      doc.text(utils.formatNumber(total_retenido), {
        align: 'center',
        columns: 1,
        width: 40,
      });
  
      doc.lineWidth(0.5);
      y += 7;
      for (var j = 0; j < 7; j++) {
        doc.lineJoin('miter').rect(300, y, 160, 10).stroke();
        doc.lineJoin('miter').rect(460, y, 70, 10).stroke();
        doc.lineJoin('miter').rect(532, y, 60, 10).stroke();
        doc.lineJoin('miter').rect(600, y, 60, 10).stroke();
        y += 12;
      }
      doc.lineJoin('miter').rect(460, y, 70, 10).stroke();
      doc.lineJoin('miter').rect(532, y, 60, 10).stroke();
      doc.lineJoin('miter').rect(600, y, 60, 10).stroke();

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
      doc.x = 665;
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
