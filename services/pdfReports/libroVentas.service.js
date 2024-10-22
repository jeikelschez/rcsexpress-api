const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

const clienteOrigDesc =
  '(CASE WHEN (id_clte_part_orig IS NULL || id_clte_part_orig = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `Mmovimientos`.cod_cliente_org = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `Mmovimientos`.id_clte_part_orig = clientes_particulares.id)' +
  ' END)';
const montoFpo =
  '(SELECT SUM(d.importe_renglon) FROM detalle_de_movimientos d' +
  ' WHERE `Mmovimientos`.id = d.cod_movimiento AND d.cod_concepto >= 15)';

class LibroVentasService {
  async mainReport(doc, agencia, cliente, desde, hasta, detalle, correlativo) {
    let where = {
      fecha_emision: {
        [Sequelize.Op.between]: [
          moment(desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
          moment(hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
        ],
      },
      t_de_documento: {
        [Sequelize.Op.in]: ['FA', 'NC', 'ND'],
      },
    };

    let order = [
      ['fecha_emision', 'ASC'],
      ['serie_documento', 'ASC'],
      ['nro_control_new', 'ASC'],
      ['nro_control', 'ASC'],
    ];
    if (!correlativo) {
      order = [
        ['cod_agencia', 'ASC'],
        ['fecha_emision', 'ASC'],
        ['t_de_documento', 'ASC'],
        ['serie_documento', 'ASC'],
        ['nro_documento', 'ASC'],
      ];
    }

    if (agencia) where.cod_agencia = agencia;
    if (cliente) where.cod_cliente_org = cliente;

    let detalles = await models.Mmovimientos.findAll({
      where: where,
      attributes: [
        'id',
        'cod_agencia',
        'fecha_emision',
        'estatus_administra',
        't_de_documento',
        'nro_control',
        'nro_control_new',
        'nro_documento',
        'serie_documento',
        'serie_doc_principal',
        'nro_doc_principal',
        'nro_ctrl_doc_ppal',
        'monto_total',
        'monto_base',
        'monto_descuento',
        'monto_subtotal',
        'monto_impuesto',
        'porc_impuesto',
        [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
        [Sequelize.literal(montoFpo), 'monto_fpo'],
      ],
      include: [
        {
          model: models.Agencias,
          as: 'agencias',
          attributes: ['nb_agencia'],
        },
        {
          model: models.Clientes,
          as: 'clientes_org',
          attributes: ['rif_cedula'],
        },
      ],
      order: order,
      raw: true,
    });

    if (detalles.length == 0) return false;

    detalles.desde = desde;
    detalles.hasta = hasta;
    detalles.detalle = detalle;
    detalles.correlativo = correlativo;
    if (cliente) detalles.cliente = cliente;
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
      detalles.cliente ? 'LIBRO DE VENTAS POR CLIENTE' : 'LIBRO DE VENTAS',
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
    doc.text('Op.', 32, 125);
    doc.text(' N°', 32, 133);
    doc.text(' Fecha', 52, 125);
    doc.text('de la', 55, 133);
    doc.text('Factura', 51, 141);
    doc.text('Rif del Cliente', 87, 125);
    doc.text('Nombre o Razón Social', 170, 125);
    doc.text('Número', 290, 125);
    doc.text('de', 298, 133);
    doc.text('Factura', 290, 141);
    doc.text('Número', 335, 125);
    doc.text('Control', 335, 133);
    doc.text('Documento', 330, 141);
    doc.text('Número de', 378, 125);
    doc.text('Nota de', 383, 133);
    doc.text('Débito', 385, 141);
    doc.text('Número de', 421, 125);
    doc.text('Nota de', 425, 133);
    doc.text('Crédito', 425, 141);
    doc.text('Tipo', 468, 125);
    doc.text('  de', 467, 133);
    doc.text('Trans.', 467, 141);
    doc.text('Número de', 493, 125);
    doc.text('Factura', 498, 133);
    doc.text('Afectada', 496, 141);
    doc.text('Fecha', 546, 125);
    doc.text('Recepción', 540, 133);
    doc.text('Comp. Ret.', 540, 141);
    doc.text('Fecha', 592, 125);
    doc.text('Emisión', 590, 133);
    doc.text('Comp. Ret.', 587, 141);
    doc.text('Número de', 633, 125);
    doc.text('Comp.', 641, 133);
    doc.text('Retención', 635, 141);
    doc.text('Total Ventas', 680, 125);
    doc.text('Incluyendo', 682, 133);
    doc.text('IVA', 694, 141);
    doc.text('Ventas Internas', 730, 125);
    doc.text('no Gravadas', 735, 133);
    doc.text('CONTRIBUYENTE', 809, 125);
    doc.lineCap('butt').moveTo(787, 132).lineTo(890, 132).stroke();
    doc.text('Base', 800, 133);
    doc.text('Imponible', 792, 141);
    doc.text(' %', 833, 133);
    doc.text('Alic.', 833, 141);
    doc.text('Impuesto', 853, 133);
    doc.text('IVA', 863, 141);
    doc.text('IVA Retenido', 895, 125);
    doc.text('por el', 908, 133);
    doc.text('Comprador', 897, 141);
    doc.text('Franqueo', 950, 125);
    doc.text('Postal', 955, 133);
    doc.text('Obligatorio', 947, 141);

    doc.lineWidth(0.5);
    doc.lineCap('butt').moveTo(25, 150).lineTo(985, 150).stroke();
  }

  async generateCustomerInformation(doc, detalles) {
    let total_venta = 0;
    let total_base = 0;
    let total_base_imp = 0;
    let total_impuesto = 0;
    let total_fpo = 0;
    let subTotal_venta = 0;
    let subTotal_base = 0;
    let subTotal_base_imp = 0;
    let subTotal_impuesto = 0;
    let subTotal_fpo = 0;

    var i = 0;
    var page = 0;
    var ymin;
    ymin = 160;
    for (var item = 0; item < detalles.length; item++) {
      if (
        !detalles.correlativo &&
        (item == 0 ||
          detalles[item].cod_agencia != detalles[item - 1].cod_agencia)
      ) {
        if (item > 0) i += 20;
        doc.fontSize(12);
        doc.font('Helvetica-Bold');
        doc.text(detalles[item]['agencias.nb_agencia'], 35, ymin + i);
        i += 17;
      }

      doc.fontSize(7);
      doc.font('Helvetica');
      doc.fillColor('#444444');

      doc.y = ymin + i;
      doc.x = 27;
      doc.text(item + 1, {
        align: 'center',
        columns: 1,
        width: 20,
      });
      doc.y = ymin + i;
      doc.x = 44;
      doc.text(moment(detalles[item].fecha_emision).format('DD/MM/YYYY'), {
        align: 'center',
        columns: 1,
        width: 40,
      });

      let rif_cliente =
        detalles[item].estatus_administra == 'A'
          ? ''
          : detalles[item]['clientes_org.rif_cedula'].substr(1, 1) != '-'
          ? detalles[item]['clientes_org.rif_cedula'].substr(0, 1) +
            '-' +
            detalles[item]['clientes_org.rif_cedula'].substr(1, 18)
          : detalles[item]['clientes_org.rif_cedula'];
      doc.y = ymin + i;
      doc.x = 85;
      doc.text(rif_cliente, {
        align: 'center',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 140;
      doc.text(
        utils.truncate(
          detalles[item].estatus_administra == 'A'
            ? 'ANULADA'
            : detalles[item].cliente_orig_desc,
          70
        ),
        {
          align: 'left',
          columns: 1,
          width: 140,
        }
      );

      let nro_factura = '';
      if (detalles[item].t_de_documento == 'FA') {
        nro_factura = 'FC-';
        if (detalles[item].nro_control) {
          nro_factura += detalles[item].nro_control.padStart(4, '0000');
        } else {
          nro_factura += detalles[item].nro_documento;
        }
        if (detalles[item].serie_documento) {
          nro_factura += '-' + detalles[item].serie_documento;
        }
      }
      doc.y = ymin + i;
      doc.x = 285;
      doc.text(nro_factura, {
        align: 'center',
        columns: 1,
        width: 35,
      });

      let nro_control = '';
      if (detalles[item].nro_control_new) {
        nro_control += detalles[item].nro_control_new.padStart(9, '00-000000');
      } else {
        nro_control += detalles[item].nro_control.padStart(4, '0000');
      }
      if (detalles[item].serie_documento) {
        nro_control += '-' + detalles[item].serie_documento;
      }
      doc.y = ymin + i;
      doc.x = 331;
      doc.text(nro_control, {
        align: 'center',
        columns: 1,
        width: 35,
      });

      let nro_doc = detalles[item].t_de_documento + '-';
      if (detalles[item].nro_control) {
        nro_doc += detalles[item].nro_control.padStart(4, '0000');
      } else {
        nro_doc += detalles[item].nro_documento;
      }
      doc.y = ymin + i;
      doc.x = 377;
      doc.text(detalles[item].t_de_documento == 'ND' ? nro_doc : '', {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 420;
      doc.text(detalles[item].t_de_documento == 'NC' ? nro_doc : '', {
        align: 'center',
        columns: 1,
        width: 40,
      });

      doc.y = ymin + i;
      doc.x = 463;
      doc.text(detalles[item].estatus_administra == 'A' ? '03-Reg' : '01-Reg', {
        align: 'center',
        columns: 1,
        width: 26,
      });

      let nro_fact_afectada = '';
      if (
        detalles[item].estatus_administra != 'A' &&
        (detalles[item].t_de_documento == 'ND' ||
          detalles[item].t_de_documento == 'NC')
      ) {
        nro_fact_afectada = 'FC-';
        if (detalles[item].nro_ctrl_doc_ppal) {
          nro_fact_afectada += detalles[item].nro_ctrl_doc_ppal.padStart(
            4,
            '0000'
          );
        } else {
          nro_fact_afectada += detalles[item].nro_doc_principal;
        }
        if (detalles[item].serie_doc_principal) {
          nro_fact_afectada += '-' + detalles[item].serie_doc_principal;
        }
      }
      doc.y = ymin + i;
      doc.x = 492;
      doc.text(nro_fact_afectada, {
        align: 'center',
        columns: 1,
        width: 40,
      });

      let monto_total = 0;
      if (detalles[item].estatus_administra != 'A') {
        if (detalles[item].t_de_documento == 'NC') {
          monto_total = utils.parseFloatN(detalles[item].monto_total) * -1;
        } else {
          monto_total = detalles[item].monto_total;
        }
        monto_total -= utils.parseFloatN(detalles[item].monto_fpo);
      }

      let monto_base = 0;
      if (detalles[item].estatus_administra != 'A') {
        if (detalles[item].t_de_documento == 'NC') {
          monto_base = utils.parseFloatN(detalles[item].monto_total) * -1;
        } else {
          monto_base = detalles[item].monto_base;
        }
      }

      let base_imp = 0;
      if (
        detalles[item].estatus_administra != 'A' &&
        detalles[item].monto_descuento != 0
      ) {
        base_imp =
          utils.parseFloatN(detalles[item].monto_subtotal) -
          utils.parseFloatN(detalles[item].monto_base);
      }
      if (base_imp < 0) base_imp = 0;

      let monto_impuesto = 0;
      if (detalles[item].estatus_administra != 'A') {
        if (detalles[item].t_de_documento == 'NC') {
          monto_impuesto =
            utils.parseFloatN(detalles[item].monto_impuesto) * -1;
        } else {
          monto_impuesto = detalles[item].monto_impuesto;
        }
      }

      let monto_alicuota = 0;
      if (monto_impuesto > 0) monto_alicuota = utils.parseFloatN(detalles[item].porc_impuesto);
      let monto_fpo =
        detalles[item].estatus_administra != 'A' ? detalles[item].monto_fpo : 0;

      doc.y = ymin + i;
      doc.x = 675;
      doc.text(utils.formatNumber(monto_total), {
        align: 'right',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 728;
      doc.text(utils.formatNumber(monto_base), {
        align: 'right',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 775;
      doc.text(utils.formatNumber(base_imp), {
        align: 'right',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 825;
      doc.text(monto_alicuota.toFixed(1), {
        align: 'right',
        columns: 1,
        width: 20,
      });
      doc.y = ymin + i;
      doc.x = 845;
      doc.text(utils.formatNumber(monto_impuesto), {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 895;
      doc.text('0,00', {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 940;
      doc.text(utils.formatNumber(monto_fpo), {
        align: 'right',
        columns: 1,
        width: 40,
      });

      // Sub Totales por Agencia
      if (
        !detalles.correlativo &&
        item > 0 &&
        detalles[item].cod_agencia != detalles[item - 1].cod_agencia
      ) {
        doc.font('Helvetica-Bold');
        doc.y = ymin + i - 32;
        doc.x = 533;
        doc.text('SUB TOTALES POR AGENCIA:', {
          align: 'right',
          columns: 1,
          width: 120,
        });
        doc.y = ymin + i - 32;
        doc.x = 675;
        doc.text(utils.formatNumber(subTotal_venta), {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i - 32;
        doc.x = 728;
        doc.text(utils.formatNumber(subTotal_base), {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i - 32;
        doc.x = 775;
        doc.text(utils.formatNumber(subTotal_base_imp), {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i - 32;
        doc.x = 845;
        doc.text(utils.formatNumber(subTotal_impuesto), {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i - 32;
        doc.x = 895;
        doc.text('0,00', {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i - 32;
        doc.x = 940;
        doc.text(utils.formatNumber(subTotal_fpo), {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.font('Helvetica');
        i += 3;

        subTotal_venta = 0;
        subTotal_base = 0;
        subTotal_base_imp = 0;
        subTotal_impuesto = 0;
        subTotal_fpo = 0;
      }

      total_venta += utils.parseFloatN(monto_total);
      total_base += utils.parseFloatN(monto_base);
      total_base_imp += utils.parseFloatN(base_imp);
      total_impuesto += utils.parseFloatN(monto_impuesto);
      total_fpo += utils.parseFloatN(monto_fpo);

      subTotal_venta += utils.parseFloatN(monto_total);
      subTotal_base += utils.parseFloatN(monto_base);
      subTotal_base_imp += utils.parseFloatN(base_imp);
      subTotal_impuesto += utils.parseFloatN(monto_impuesto);
      subTotal_fpo += utils.parseFloatN(monto_fpo);

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

    if (!detalles.correlativo) {
      // Sub Totales por Agencia Finales
      i += 5;
      doc.font('Helvetica-Bold');
      doc.y = ymin + i;
      doc.x = 533;
      doc.text('SUB TOTALES POR AGENCIA:', {
        align: 'right',
        columns: 1,
        width: 120,
      });
      doc.y = ymin + i;
      doc.x = 675;
      doc.text(utils.formatNumber(subTotal_venta), {
        align: 'right',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 728;
      doc.text(utils.formatNumber(subTotal_base), {
        align: 'right',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 775;
      doc.text(utils.formatNumber(subTotal_base_imp), {
        align: 'right',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 845;
      doc.text(utils.formatNumber(subTotal_impuesto), {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 895;
      doc.text('0,00', {
        align: 'right',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 940;
      doc.text(utils.formatNumber(subTotal_fpo), {
        align: 'right',
        columns: 1,
        width: 40,
      });

      i += 15;
    }

    let y = ymin + i;
    doc.lineWidth(0.5);
    doc.lineCap('butt').moveTo(25, y).lineTo(985, y).stroke();

    doc.font('Helvetica-Bold');
    doc.y = y + 8;
    doc.x = 555;
    doc.text('TOTALES:', {
      align: 'right',
      columns: 1,
      width: 100,
    });
    doc.y = y + 8;
    doc.x = 675;
    doc.text(utils.formatNumber(total_venta), {
      align: 'right',
      columns: 1,
      width: 50,
    });
    doc.y = y + 8;
    doc.x = 728;
    doc.text(utils.formatNumber(total_base), {
      align: 'right',
      columns: 1,
      width: 50,
    });
    doc.y = y + 8;
    doc.x = 775;
    doc.text(utils.formatNumber(total_base_imp), {
      align: 'right',
      columns: 1,
      width: 50,
    });
    doc.y = y + 8;
    doc.x = 845;
    doc.text(utils.formatNumber(total_impuesto), {
      align: 'right',
      columns: 1,
      width: 40,
    });
    doc.y = y + 8;
    doc.x = 895;
    doc.text('0,00', {
      align: 'right',
      columns: 1,
      width: 40,
    });
    doc.y = y + 8;
    doc.x = 940;
    doc.text(utils.formatNumber(total_fpo), {
      align: 'right',
      columns: 1,
      width: 40,
    });

    if (!detalles.cliente) {
      if (y >= 380) {
        doc.addPage();
        page = page + 1;
        doc.switchToPage(page);
        y = 100;
        await this.generateHeader(doc, detalles);
      }

      y += 70;
      doc.text('Resumen del Periodo', 455, y);
      doc.text('Base Imponible', 605, y);
      doc.text('Débito Fiscal', 685, y);
      doc.text('IVA Retenido por el', 763, y - 6);
      doc.text('Comprador', 778, y);

      doc.text('Ventas Internas No Gravadas', 375, y + 13);
      doc.text('Ventas de Exportación', 375, y + 28);
      doc.text('Ventas Internas Afectas solo Alicuota General', 375, y + 43);
      doc.text(
        'Ventas Internas Afectas en Alicuota General + Adicional',
        375,
        y + 58
      );
      doc.text('Ventas Internas Afectas en Alicuota Reducida', 375, y + 73);

      doc.y = y + 13;
      doc.x = 607;
      doc.text(utils.formatNumber(total_base), {
        align: 'center',
        columns: 1,
        width: 50,
      });
      doc.y = y + 28;
      doc.x = 607;
      doc.text(0, {
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
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 50,
      });

      doc.y = y + 13;
      doc.x = 687;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 28;
      doc.x = 687;
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 43;
      doc.x = 687;
      doc.text(utils.formatNumber(total_impuesto), {
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
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 88;
      doc.x = 687;
      doc.text(utils.formatNumber(total_impuesto), {
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
      doc.text(utils.formatNumber(0), {
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
      doc.text(0, {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = y + 88;
      doc.x = 775;
      doc.text(utils.formatNumber(0), {
        align: 'center',
        columns: 1,
        width: 40,
      });

      doc.lineWidth(0.5);
      y += 9;
      for (var j = 0; j < 5; j++) {
        doc.lineJoin('miter').rect(370, y, 220, 13).stroke();
        doc.lineJoin('miter').rect(590, y, 80, 13).stroke();
        doc.lineJoin('miter').rect(672, y, 70, 13).stroke();
        doc.lineJoin('miter').rect(760, y, 70, 13).stroke();
        y += 15;
      }
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

module.exports = LibroVentasService;
