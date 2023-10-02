const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

const porcIva = '(SELECT valor from variable_control WHERE id = 1)';

class RetencionesIvaService {
  async mainReport(doc, tipo, data) {
    let detalles = [];
    let order = [];
    let where = {};
    data = JSON.parse(data);

    switch (tipo) {
      case 'IC':
      case 'RC':
        where = {
          fecha_comprobante: {
            [Sequelize.Op.between]: [
              moment(data.desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              moment(data.hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            ],
          },
        };

        if (data.comprobante) where.nro_comprobante_iva = data.comprobante;
        if (data.proveedor) where.cod_proveedor = data.proveedor;
        if (tipo == 'IC') {
          order = [['fecha_registro', 'ASC']];
        } else {
          order = [['nro_comprobante_iva', 'ASC']];
        }

        detalles = await models.Mctapagar.findAll({
          where: where,
          attributes: [
            'id',
            'nro_comprobante_iva',
            'fecha_comprobante',
            'fecha_entrega',
            'fecha_registro',
            'tipo_documento',
            'nro_documento',
            'nro_ctrl_doc',
            'nro_doc_afectado',
            'total_documento',
            'monto_exento',
            'monto_base_nacional',
            'monto_imp_nacional',
            'saldo_retenido',
            'porcentaje_retencion',
            [Sequelize.literal(porcIva), 'porc_iva'],
          ],
          include: [
            {
              model: models.Proveedores,
              as: 'proveedores',
              attributes: ['id', 'nb_proveedor', 'rif_proveedor'],
            },
          ],
          order: order,
          raw: true,
        });
        if (detalles.length == 0) return false;
        
        detalles.desde = data.desde;
        detalles.hasta = data.hasta;
        if (data.proveedor) detalles.proveedor = data.proveedor;
        break;
      default:
        break;
    }

    await this.generateHeader(doc, tipo, detalles);
    await this.generateCustomerInformation(doc, tipo, detalles);
    return true;
  }

  async generateHeader(doc, tipo, detalles) {
    doc.image('./img/logo_rc5.png', 30, 25, { width: 50 });
    doc.fontSize(10);
    doc.font('Helvetica-Bold');
    doc.fillColor('#444444');
    doc.text('R.C.S EXPRESS, S.A', 85, 35);
    doc.text('RIF. J-31028463-6', 85, 50);
    doc.lineWidth(0.5);

    switch (tipo) {
      case 'IC':
        doc.fontSize(7);
        doc.font('Helvetica');
        doc.y = 75;
        doc.x = 30;
        doc.text(
          'Ley IVA - Art.11: " Serán responsables del pago del impuesto en calidad de retención los compradores o adquirientes de determinados bienes muebles y receptores de ciertos servicios, a quienes la administración Tributaria designe como tal".',
          {
            align: 'left',
            columns: 1,
            width: 285,
          }
        );

        doc.fontSize(8);
        doc.lineJoin('miter').rect(460, 68, 97, 13).stroke();
        doc.text('N° Comprobante', 479, 72);
        doc.lineJoin('miter').rect(460, 83, 97, 13).stroke();
        doc.font('Helvetica-Bold');
        doc.text(detalles[0].nro_comprobante_iva, 477, 87);
        doc.font('Helvetica');
        doc.lineJoin('miter').rect(581, 68, 78, 13).stroke();
        doc.text('Fecha de Emisión', 588, 72);
        80;
        doc.lineJoin('miter').rect(581, 83, 78, 13).stroke();
        doc.text(
          moment(detalles[0].fecha_comprobante).format('DD/MM/YYYY'),
          600,
          87
        );
        doc.lineJoin('miter').rect(681, 68, 78, 13).stroke();
        doc.text('Fecha de Entrega', 688, 72);
        doc.lineJoin('miter').rect(681, 83, 78, 13).stroke();
        doc.text(
          moment(detalles[0].fecha_entrega).format('DD/MM/YYYY'),
          700,
          87
        );
        doc.lineJoin('miter').rect(30, 110, 400, 14).stroke();
        doc.text('Nombre o Razón Social del Agente de Retención', 145, 114);
        doc.lineJoin('miter').rect(30, 126, 400, 14).stroke();
        doc.font('Helvetica-Bold');
        doc.text('R.C.S EXPRESS, S.A', 195, 130);
        doc.font('Helvetica');
        doc.lineJoin('miter').rect(30, 142, 400, 14).stroke();
        doc.text('Dirección Fiscal del Agente de Retención', 160, 146);
        doc.lineJoin('miter').rect(30, 158, 400, 14).stroke();
        doc.text(
          'Av. 74, C.C. Araurima, Nivel P.B. Local Nº 6 Urb. Terrazas de Castillito Valencia Edo. Carabobo',
          65,
          162
        );
        doc.lineJoin('miter').rect(30, 174, 400, 14).stroke();
        doc.text('Nombre o Razón Social del Sujeto Retenido', 155, 178);
        doc.lineJoin('miter').rect(30, 190, 400, 14).stroke();
        doc.font('Helvetica-Bold');
        doc.y = 194;
        doc.x = 30;
        doc.text(detalles[0]['proveedores.nb_proveedor'], {
          align: 'center',
          columns: 1,
          width: 400,
        });
        doc.font('Helvetica');
        doc.lineJoin('miter').rect(460, 110, 203, 14).stroke();
        doc.text(
          'Registro de Información Fiscal del Agente de Retención',
          463,
          114
        );
        doc.lineJoin('miter').rect(460, 126, 203, 14).stroke();
        doc.font('Helvetica-Bold');
        doc.text('RIF: J-31028463-6', 530, 130);
        doc.font('Helvetica');
        doc.lineJoin('miter').rect(680, 110, 78, 14).stroke();
        doc.text('Período Fiscal', 694, 114);
        doc.font('Helvetica-Bold');
        doc.text(
          'AÑO: ' +
            moment(detalles[0].fecha_comprobante).format('YYYY') +
            ' - MES: ' +
            moment(detalles[0].fecha_comprobante).format('MM'),
          680,
          130
        );
        doc.font('Helvetica');
        doc.lineJoin('miter').rect(460, 174, 203, 14).stroke();
        doc.text(
          'Registro de Información Fiscal del Sujeto Retenido',
          470,
          178
        );
        doc.lineJoin('miter').rect(460, 190, 203, 14).stroke();
        doc.font('Helvetica-Bold');
        doc.y = 194;
        doc.x = 460;
        doc.text(detalles[0]['proveedores.rif_proveedor'], {
          align: 'center',
          columns: 1,
          width: 203,
        });
        doc.font('Helvetica');

        doc.lineJoin('miter').rect(30, 220, 35, 26).stroke();
        doc.text('Operac.', 35, 225);
        doc.text('N°', 45, 235);
        doc.lineJoin('miter').rect(67, 220, 45, 26).stroke();
        doc.text('Fecha de', 73, 225);
        doc.text('Factura', 76, 235);
        doc.lineJoin('miter').rect(114, 220, 55, 26).stroke();
        doc.text('N° Factura', 122, 235);
        doc.lineJoin('miter').rect(171, 220, 55, 26).stroke();
        doc.text('N° Control de', 174, 225);
        doc.text('Documento', 178, 235);
        doc.lineJoin('miter').rect(228, 220, 45, 26).stroke();
        doc.text('N° de Nota', 231, 225);
        doc.text('Crédito', 237, 235);
        doc.lineJoin('miter').rect(275, 220, 55, 26).stroke();
        doc.text('N° de Factura', 278, 225);
        doc.text('Afectada', 286, 235);
        doc.lineJoin('miter').rect(332, 220, 35, 26).stroke();
        doc.text('Tipo de', 336, 225);
        doc.text('Trans.', 339, 235);
        doc.lineJoin('miter').rect(369, 220, 75, 26).stroke();
        doc.text('Total Compras', 380, 225);
        doc.text('incluyendo el I.V.A.', 373, 235);
        doc.lineJoin('miter').rect(446, 220, 85, 26).stroke();
        doc.text('Compras Sin Derecho', 449, 225);
        doc.text('a Crédito I.V.A.', 463, 235);
        doc.lineJoin('miter').rect(533, 220, 60, 26).stroke();
        doc.text('Monto Base', 542, 225);
        doc.text('Imponible', 545, 235);
        doc.lineJoin('miter').rect(595, 220, 35, 26).stroke();
        doc.text('Alícuota', 598, 235);
        doc.lineJoin('miter').rect(632, 220, 61, 26).stroke();
        doc.text('Impuesto', 645, 225);
        doc.text('I.V.A.', 654, 235);
        doc.lineJoin('miter').rect(695, 220, 65, 26).stroke();
        doc.text('I.V.A. Retenido', 701, 225);
        doc.text('75% ó 100%', 705, 235);
        break;
      case 'RC':
        doc.fontSize(7);
        doc.font('Helvetica');
        doc.y = 75;
        doc.x = 30;
        doc.text(
          'Ley IVA - Art.11: " Serán responsables del pago del impuesto en calidad de retención los compradores o adquirientes de determinados bienes muebles y receptores de ciertos servicios, a quienes la administración Tributaria designe como tal".',
          {
            align: 'left',
            columns: 1,
            width: 285,
          }
        );

        doc.fontSize(8);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 688, 35);

        doc.lineJoin('miter').rect(30, 110, 400, 14).stroke();
        doc.text('Nombre o Razón Social del Agente de Retención', 145, 114);
        doc.lineJoin('miter').rect(30, 126, 400, 14).stroke();
        doc.font('Helvetica-Bold');
        doc.text('R.C.S EXPRESS, S.A', 195, 130);
        doc.font('Helvetica');
        doc.lineJoin('miter').rect(30, 142, 400, 14).stroke();
        doc.text('Dirección Fiscal del Agente de Retención', 160, 146);
        doc.lineJoin('miter').rect(30, 158, 400, 14).stroke();
        doc.text(
          'Av. 74, C.C. Araurima, Nivel P.B. Local Nº 6 Urb. Terrazas de Castillito Valencia Edo. Carabobo',
          65,
          162
        );
        doc.lineJoin('miter').rect(460, 110, 203, 14).stroke();
        doc.text(
          'Registro de Información Fiscal del Agente de Retención',
          463,
          114
        );
        doc.lineJoin('miter').rect(460, 126, 203, 14).stroke();
        doc.font('Helvetica-Bold');
        doc.text('RIF: J-31028463-6', 530, 130);
        doc.font('Helvetica');

        if (detalles.proveedor) {
          doc.lineJoin('miter').rect(30, 174, 400, 14).stroke();
          doc.text('Nombre o Razón Social del Sujeto Retenido', 155, 178);
          doc.lineJoin('miter').rect(30, 190, 400, 14).stroke();
          doc.font('Helvetica-Bold');
          doc.y = 194;
          doc.x = 30;
          doc.text(detalles[0]['proveedores.nb_proveedor'], {
            align: 'center',
            columns: 1,
            width: 400,
          });
          doc.lineJoin('miter').rect(460, 174, 203, 14).stroke();
          doc.font('Helvetica');
          doc.text(
            'Registro de Información Fiscal del Sujeto Retenido',
            470,
            178
          );
          doc.lineJoin('miter').rect(460, 190, 203, 14).stroke();
          doc.font('Helvetica-Bold');
          doc.y = 194;
          doc.x = 460;
          doc.text(detalles[0]['proveedores.rif_proveedor'], {
            align: 'center',
            columns: 1,
            width: 203,
          });
          doc.font('Helvetica');
          doc.lineJoin('miter').rect(30, 225, 35, 16).stroke();
          doc.text('Período', 34, 230);
          doc.lineJoin('miter').rect(67, 215, 55, 26).stroke();
          doc.text('Fecha de', 77, 220);
          doc.text('Factura', 79, 230);
          doc.lineJoin('miter').rect(124, 225, 65, 16).stroke();
          doc.text('Rif Proveedor', 131, 230);
          doc.lineJoin('miter').rect(191, 225, 60, 16).stroke();
          doc.text('N° Factura', 201, 230);
          doc.lineJoin('miter').rect(253, 225, 60, 16).stroke();
          doc.text('N° Control', 264, 230);
          doc.lineJoin('miter').rect(315, 215, 70, 26).stroke();
          doc.text('Total Compras', 324, 220);
          doc.text('con IVA', 336, 230);
          doc.lineJoin('miter').rect(387, 215, 60, 26).stroke();
          doc.text('Compras S/D', 392, 220);
          doc.text('a Crédito', 399, 230);
          doc.lineJoin('miter').rect(449, 215, 60, 26).stroke();
          doc.text('Base', 470, 220);
          doc.text('Imponible', 462, 230);
          doc.lineJoin('miter').rect(511, 215, 60, 26).stroke();
          doc.text('IVA', 535, 220);
          doc.text('Retenido', 525, 230);
          doc.lineJoin('miter').rect(573, 215, 30, 26).stroke();
          doc.text('%', 585, 220);
          doc.text('Alic.', 582, 230);
          doc.lineJoin('miter').rect(605, 215, 81, 26).stroke();
          doc.text('Número de', 627, 220);
          doc.text('Comprobante', 623, 230);
          doc.lineJoin('miter').rect(688, 215, 50, 26).stroke();
          doc.text('Fecha', 702, 220);
          doc.text('Comp.', 702, 230);
          doc.lineJoin('miter').rect(740, 215, 20, 26).stroke();
          doc.text('%', 746, 220);
          doc.text('IVA', 744, 230);
        } else {
          doc.lineJoin('miter').rect(30, 195, 30, 16).stroke();
          doc.text('Período', 31, 200);
          doc.lineJoin('miter').rect(62, 185, 45, 26).stroke();
          doc.text('Fecha de', 68, 190);
          doc.text('Factura', 71, 200);
          doc.lineJoin('miter').rect(109, 195, 55, 16).stroke();
          doc.text('Rif Proveedor', 112, 200);
          doc.lineJoin('miter').rect(166, 195, 124, 16).stroke();
          doc.text('Nombre Proveedor', 197, 200);
          doc.lineJoin('miter').rect(292, 195, 50, 16).stroke();
          doc.text('N° Factura', 298, 200);
          doc.lineJoin('miter').rect(344, 195, 48, 16).stroke();
          doc.text('N° Control', 349, 200);
          doc.lineJoin('miter').rect(394, 185, 55, 26).stroke();
          doc.text('Total Compras', 396, 190);
          doc.text('con IVA', 408, 200);
          doc.lineJoin('miter').rect(451, 185, 52, 26).stroke();
          doc.text('Compras S/D', 453, 190);
          doc.text('a Crédito', 460, 200);
          doc.lineJoin('miter').rect(505, 185, 45, 26).stroke();
          doc.text('Base', 519, 190);
          doc.text('Imponible', 510, 200);
          doc.lineJoin('miter').rect(552, 185, 40, 26).stroke();
          doc.text('IVA', 565, 190);
          doc.text('Retenido', 556, 200);
          doc.lineJoin('miter').rect(594, 185, 25, 26).stroke();
          doc.text('%', 603, 190);
          doc.text('Alic.', 600, 200);
          doc.lineJoin('miter').rect(621, 185, 70, 26).stroke();
          doc.text('Número de', 635, 190);
          doc.text('Comprobante', 631, 200);
          doc.lineJoin('miter').rect(693, 185, 45, 26).stroke();
          doc.text('Fecha', 704, 190);
          doc.text('Comp.', 705, 200);
          doc.lineJoin('miter').rect(740, 185, 20, 26).stroke();
          doc.text('%', 746, 190);
          doc.text('IVA', 744, 200);
        }
        break;
      default:
        break;
    }
  }

  async generateCustomerInformation(doc, tipo, detalles) {
    let total_compras = 0;
    let total_impuesto = 0;
    let total_exento = 0;
    let total_base = 0;
    let total_retenido = 0;
    var i = 0;
    var page = 0;
    var ymin;

    switch (tipo) {
      case 'IC':
        ymin = 260;
        for (var item = 0; item < detalles.length; item++) {
          doc.fontSize(8);
          doc.font('Helvetica');
          doc.fillColor('#444444');

          doc
            .lineJoin('miter')
            .rect(30, ymin + i - 4, 35, 14)
            .stroke();
          doc
            .lineJoin('miter')
            .rect(67, ymin + i - 4, 45, 14)
            .stroke();
          doc
            .lineJoin('miter')
            .rect(114, ymin + i - 4, 55, 14)
            .stroke();
          doc
            .lineJoin('miter')
            .rect(171, ymin + i - 4, 55, 14)
            .stroke();
          doc
            .lineJoin('miter')
            .rect(228, ymin + i - 4, 45, 14)
            .stroke();
          doc
            .lineJoin('miter')
            .rect(275, ymin + i - 4, 55, 14)
            .stroke();
          doc
            .lineJoin('miter')
            .rect(332, ymin + i - 4, 35, 14)
            .stroke();
          doc
            .lineJoin('miter')
            .rect(369, ymin + i - 4, 75, 14)
            .stroke();
          doc
            .lineJoin('miter')
            .rect(446, ymin + i - 4, 85, 14)
            .stroke();
          doc
            .lineJoin('miter')
            .rect(533, ymin + i - 4, 60, 14)
            .stroke();
          doc
            .lineJoin('miter')
            .rect(595, ymin + i - 4, 35, 14)
            .stroke();
          doc
            .lineJoin('miter')
            .rect(632, ymin + i - 4, 61, 14)
            .stroke();
          doc
            .lineJoin('miter')
            .rect(695, ymin + i - 4, 65, 14)
            .stroke();

          doc.y = ymin + i;
          doc.x = 30;
          doc.text(item + 1, {
            align: 'center',
            columns: 1,
            width: 35,
          });
          doc.y = ymin + i;
          doc.x = 67;
          doc.text(moment(detalles[item].fecha_registro).format('DD/MM/YYYY'), {
            align: 'center',
            columns: 1,
            width: 45,
          });

          let nroDoc = '';
          if (detalles[item].tipo_documento == 'FA')
            nroDoc = detalles[item].nro_documento;
          doc.y = ymin + i;
          doc.x = 114;
          doc.text(nroDoc, {
            align: 'center',
            columns: 1,
            width: 55,
          });
          doc.y = ymin + i;
          doc.x = 171;
          doc.text(detalles[item].nro_ctrl_doc, {
            align: 'center',
            columns: 1,
            width: 55,
          });
          let nroNc = '';
          if (detalles[item].tipo_documento == 'NC')
            nroNc = detalles[item].nro_documento;
          doc.y = ymin + i;
          doc.x = 228;
          doc.text(nroNc, {
            align: 'center',
            columns: 1,
            width: 45,
          });
          doc.y = ymin + i;
          doc.x = 275;
          doc.text(detalles[item].nro_doc_afectado, {
            align: 'center',
            columns: 1,
            width: 55,
          });
          let tipoTrans = 2;
          if (detalles[item].tipo_documento == 'FA') tipoTrans = 1;
          if (detalles[item].tipo_documento == 'NC') tipoTrans = 3;
          doc.y = ymin + i;
          doc.x = 332;
          doc.text(tipoTrans, {
            align: 'center',
            columns: 1,
            width: 35,
          });
          doc.y = ymin + i;
          doc.x = 367;
          doc.text(utils.formatNumber(detalles[item].total_documento), {
            align: 'right',
            columns: 1,
            width: 75,
          });
          doc.y = ymin + i;
          doc.x = 444;
          doc.text(utils.formatNumber(detalles[item].monto_exento), {
            align: 'right',
            columns: 1,
            width: 85,
          });
          let montoBaseNac = detalles[item].monto_base_nacional;
          if (detalles[item].tipo_documento == 'NC')
            montoBaseNac = utils.parseFloatN(montoBaseNac) * -1;
          doc.y = ymin + i;
          doc.x = 531;
          doc.text(utils.formatNumber(montoBaseNac), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 595;
          doc.text(detalles[item].porc_iva + '%', {
            align: 'center',
            columns: 1,
            width: 35,
          });
          let montoImpNac = detalles[item].monto_imp_nacional;
          if (detalles[item].tipo_documento == 'NC')
            montoImpNac = utils.parseFloatN(montoImpNac) * -1;
          doc.y = ymin + i;
          doc.x = 630;
          doc.text(utils.formatNumber(montoImpNac), {
            align: 'right',
            columns: 1,
            width: 61,
          });
          let saldoRetenido = detalles[item].saldo_retenido;
          if (detalles[item].tipo_documento == 'NC')
            saldoRetenido = utils.parseFloatN(saldoRetenido) * -1;
          doc.y = ymin + i;
          doc.x = 693;
          doc.text(utils.formatNumber(saldoRetenido), {
            align: 'right',
            columns: 1,
            width: 65,
          });

          total_compras += utils.parseFloatN(detalles[item].total_documento);
          total_impuesto += utils.parseFloatN(montoImpNac);
          total_retenido += utils.parseFloatN(saldoRetenido);

          i += 17;
          if (i >= 450) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 20;
            await this.generateHeader(doc, tipo, detalles);
          }
        }
        // Totales Finales
        doc
          .lineJoin('miter')
          .rect(369, ymin + i - 4, 75, 14)
          .stroke();
        doc
          .lineJoin('miter')
          .rect(632, ymin + i - 4, 61, 14)
          .stroke();
        doc
          .lineJoin('miter')
          .rect(695, ymin + i - 4, 65, 14)
          .stroke();
        doc.font('Helvetica-Bold');
        doc.y = ymin + i;
        doc.x = 320;
        doc.text('Totales:', {
          align: 'left',
          columns: 1,
          width: 100,
        });
        doc.y = ymin + i;
        doc.x = 367;
        doc.text(utils.formatNumber(total_compras), {
          align: 'right',
          columns: 1,
          width: 75,
        });
        doc.y = ymin + i;
        doc.x = 630;
        doc.text(utils.formatNumber(total_impuesto), {
          align: 'right',
          columns: 1,
          width: 61,
        });
        doc.y = ymin + i;
        doc.x = 693;
        doc.text(utils.formatNumber(total_retenido), {
          align: 'right',
          columns: 1,
          width: 65,
        });

        doc.image('./img/logo_firma.png', 300, 460, { width: 120 });
        doc.lineJoin('miter').rect(438, 505, 160, 75).stroke();
        doc.lineJoin('miter').rect(598, 505, 160, 75).stroke();
        doc.fontSize(6);
        doc.font('Helvetica');
        doc.text('AGENTE RETENCIÓN (SELLO, FECHA Y FIRMA)', 450, 510);
        doc.text('RECIBIDO (SELLO Y FECHA)', 635, 510);
        break;
      case 'RC':
        if (detalles.proveedor) {
          ymin = 260;
          for (var item = 0; item < detalles.length; item++) {
            doc.fontSize(8);
            doc.font('Helvetica');
            doc.fillColor('#444444');

            doc.lineJoin('miter').rect(30, ymin + i - 4, 35, 14).stroke();
            doc.lineJoin('miter').rect(67, ymin + i - 4, 55, 14).stroke();
            doc.lineJoin('miter').rect(124, ymin + i - 4, 65, 14).stroke();
            doc.lineJoin('miter').rect(191, ymin + i - 4, 60, 14).stroke();
            doc.lineJoin('miter').rect(253, ymin + i - 4, 60, 14).stroke();
            doc.lineJoin('miter').rect(315, ymin + i - 4, 70, 14).stroke();
            doc.lineJoin('miter').rect(387, ymin + i - 4, 60, 14).stroke();
            doc.lineJoin('miter').rect(449, ymin + i - 4, 60, 14).stroke();
            doc.lineJoin('miter').rect(511, ymin + i - 4, 60, 14).stroke();
            doc.lineJoin('miter').rect(573, ymin + i - 4, 30, 14).stroke();
            doc.lineJoin('miter').rect(605, ymin + i - 4, 81, 14).stroke();
            doc.lineJoin('miter').rect(688, ymin + i - 4, 50, 14).stroke();
            doc.lineJoin('miter').rect(740, ymin + i - 4, 20, 14).stroke();

            doc.y = ymin + i;
            doc.x = 30;
            doc.text(
              moment(detalles[item].fecha_registro).format('YYYY') +
                moment(detalles[item].fecha_registro).format('MM'),
              {
                align: 'center',
                columns: 1,
                width: 35,
              }
            );
            doc.y = ymin + i;
            doc.x = 67;
            doc.text(
              moment(detalles[item].fecha_registro).format('DD/MM/YYYY'),
              {
                align: 'center',
                columns: 1,
                width: 55,
              }
            );
            doc.y = ymin + i;
            doc.x = 124;
            doc.text(detalles[item]['proveedores.rif_proveedor'], {
              align: 'center',
              columns: 1,
              width: 65,
            });
            doc.y = ymin + i;
            doc.x = 191;
            doc.text(detalles[item].nro_documento,
              {
                align: 'center',
                columns: 1,
                width: 60,
              }
            );
            doc.y = ymin + i;
            doc.x = 253;
            doc.text(detalles[item].nro_ctrl_doc,
              {
                align: 'center',
                columns: 1,
                width: 60,
              }
            );            
            doc.y = ymin + i;
            doc.x = 313;
            doc.text(utils.formatNumber(detalles[item].total_documento), {
              align: 'right',
              columns: 1,
              width: 70,
            });
            doc.y = ymin + i;
            doc.x = 385;
            doc.text(utils.formatNumber(detalles[item].monto_exento), {
              align: 'right',
              columns: 1,
              width: 60,
            });
            doc.y = ymin + i;
            doc.x = 447;
            doc.text(utils.formatNumber(detalles[item].monto_base_nacional), {
              align: 'right',
              columns: 1,
              width: 60,
            });
            doc.y = ymin + i;
            doc.x = 509;
            doc.text(utils.formatNumber(detalles[item].saldo_retenido), {
              align: 'right',
              columns: 1,
              width: 60,
            });
            doc.y = ymin + i;
            doc.x = 573;
            doc.text(utils.parseFloatN(detalles[item].porcentaje_retencion).toFixed(0) + '%', {
              align: 'center',
              columns: 1,
              width: 30,
            });
            doc.y = ymin + i;
            doc.x = 605;
            doc.text(detalles[item].nro_comprobante_iva, {
              align: 'center',
              columns: 1,
              width: 81,
            });
            doc.y = ymin + i;
            doc.x = 688;
            doc.text(moment(detalles[item].fecha_comprobante).format('DD/MM/YYYY'), {
              align: 'center',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i;
            doc.x = 740;
            doc.text(detalles[item].iva ? detalles[item].iva : 0, {
              align: 'center',
              columns: 1,
              width: 20,
            });

            total_compras += utils.parseFloatN(detalles[item].total_documento);
            total_base += utils.parseFloatN(detalles[item].monto_base_nacional);
            total_retenido += utils.parseFloatN(detalles[item].saldo_retenido);

            i += 17;
            if (i >= 330) {
              doc.fillColor('#BLACK');
              doc.addPage();
              page = page + 1;
              doc.switchToPage(page);
              i = 0;
              await this.generateHeader(doc, tipo, detalles);
            }
          }
          // Totales Finales
          doc.lineJoin('miter').rect(315, ymin + i - 4, 70, 14).stroke();
          doc.lineJoin('miter').rect(449, ymin + i - 4, 60, 14).stroke();
          doc.lineJoin('miter').rect(511, ymin + i - 4, 60, 14).stroke();
          
          doc.font('Helvetica-Bold');
          doc.y = ymin + i;
          doc.x = 280;
          doc.text('Totales:', {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.y = ymin + i;
          doc.x = 313;
          doc.text(utils.formatNumber(total_compras), {
            align: 'right',
            columns: 1,
            width: 70,
          });
          doc.y = ymin + i;
          doc.x = 447;
          doc.text(utils.formatNumber(total_base), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 509;
          doc.text(utils.formatNumber(total_retenido), {
            align: 'right',
            columns: 1,
            width: 60,
          });
        } else {
          ymin = 230;
          for (var item = 0; item < detalles.length; item++) {
            doc.fontSize(8);
            doc.font('Helvetica');
            doc.fillColor('#444444');

            doc.lineJoin('miter').rect(30, ymin + i - 4, 30, 14).stroke();
            doc.lineJoin('miter').rect(62, ymin + i - 4, 45, 14).stroke();
            doc.lineJoin('miter').rect(109, ymin + i - 4, 55, 14).stroke();
            doc.lineJoin('miter').rect(166, ymin + i - 4, 124, detalles[item]['proveedores.nb_proveedor'].length < 25 ? 14 : 22).stroke();
            doc.lineJoin('miter').rect(292, ymin + i - 4, 50, 14).stroke();
            doc.lineJoin('miter').rect(344, ymin + i - 4, 48, 14).stroke();
            doc.lineJoin('miter').rect(394, ymin + i - 4, 55, 14).stroke();
            doc.lineJoin('miter').rect(451, ymin + i - 4, 52, 14).stroke();
            doc.lineJoin('miter').rect(505, ymin + i - 4, 45, 14).stroke();
            doc.lineJoin('miter').rect(552, ymin + i - 4, 40, 14).stroke();
            doc.lineJoin('miter').rect(594, ymin + i - 4, 25, 14).stroke();
            doc.lineJoin('miter').rect(621, ymin + i - 4, 70, 14).stroke();
            doc.lineJoin('miter').rect(693, ymin + i - 4, 45, 14).stroke();
            doc.lineJoin('miter').rect(740, ymin + i - 4, 20, 14).stroke();

            doc.y = ymin + i;
            doc.x = 30;
            doc.text(
              moment(detalles[item].fecha_registro).format('YYYY') +
                moment(detalles[item].fecha_registro).format('MM'),
              {
                align: 'center',
                columns: 1,
                width: 30,
              }
            );
            doc.y = ymin + i;
            doc.x = 62;
            doc.text(
              moment(detalles[item].fecha_registro).format('DD/MM/YYYY'),
              {
                align: 'center',
                columns: 1,
                width: 45,
              }
            );
            doc.y = ymin + i;
            doc.x = 109;
            doc.text(detalles[item]['proveedores.rif_proveedor'], {
              align: 'center',
              columns: 1,
              width: 55,
            });
            doc.y = ymin + i;
            doc.x = 166;
            doc.text(utils.truncate(detalles[item]['proveedores.nb_proveedor'], 45), {
              align: 'center',
              columns: 1,
              width: 124,
            });
            doc.y = ymin + i;
            doc.x = 292;
            doc.text(detalles[item].nro_documento,
              {
                align: 'center',
                columns: 1,
                width: 50,
              }
            );
            doc.y = ymin + i;
            doc.x = 344;
            doc.text(detalles[item].nro_ctrl_doc,
              {
                align: 'center',
                columns: 1,
                width: 48,
              }
            );            
            doc.y = ymin + i;
            doc.x = 390;
            doc.text(utils.formatNumber(detalles[item].total_documento), {
              align: 'right',
              columns: 1,
              width: 55,
            });
            doc.y = ymin + i;
            doc.x = 447;
            doc.text(utils.formatNumber(detalles[item].monto_exento), {
              align: 'right',
              columns: 1,
              width: 52,
            });
            doc.y = ymin + i;
            doc.x = 503;
            doc.text(utils.formatNumber(detalles[item].monto_base_nacional), {
              align: 'right',
              columns: 1,
              width: 45,
            });
            doc.y = ymin + i;
            doc.x = 550;
            doc.text(utils.formatNumber(detalles[item].saldo_retenido), {
              align: 'right',
              columns: 1,
              width: 40,
            });
            doc.y = ymin + i;
            doc.x = 594;
            doc.text(utils.parseFloatN(detalles[item].porcentaje_retencion).toFixed(0) + '%', {
              align: 'center',
              columns: 1,
              width: 25,
            });
            doc.y = ymin + i;
            doc.x = 621;
            doc.text(detalles[item].nro_comprobante_iva, {
              align: 'center',
              columns: 1,
              width: 70,
            });
            doc.y = ymin + i;
            doc.x = 693;
            doc.text(moment(detalles[item].fecha_comprobante).format('DD/MM/YYYY'), {
              align: 'center',
              columns: 1,
              width: 45,
            });
            doc.y = ymin + i;
            doc.x = 740;
            doc.text(detalles[item].iva ? detalles[item].iva : 0, {
              align: 'center',
              columns: 1,
              width: 20,
            });

            total_compras += utils.parseFloatN(detalles[item].total_documento);
            total_exento += utils.parseFloatN(detalles[item].monto_exento);
            total_base += utils.parseFloatN(detalles[item].monto_base_nacional);
            total_retenido += utils.parseFloatN(detalles[item].saldo_retenido);

            if (detalles[item]['proveedores.nb_proveedor'].length < 25) {
              i += 17;
            } else {
              i += 25;
            }
            if (i >= 330) {
              doc.fillColor('#BLACK');
              doc.addPage();
              page = page + 1;
              doc.switchToPage(page);
              i = 0;
              await this.generateHeader(doc, tipo, detalles);
            }
          }
          // Totales Finales
          doc.lineJoin('miter').rect(394, ymin + i - 4, 55, 14).stroke();
          doc.lineJoin('miter').rect(451, ymin + i - 4, 52, 14).stroke();
          doc.lineJoin('miter').rect(505, ymin + i - 4, 45, 14).stroke();
          doc.lineJoin('miter').rect(552, ymin + i - 4, 40, 14).stroke();
          
          doc.font('Helvetica-Bold');
          doc.fontSize(7);
          doc.y = ymin + i;
          doc.x = 320;
          doc.text('Totales:', {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.y = ymin + i;
          doc.x = 390;
          doc.text(utils.formatNumber(total_compras), {
            align: 'right',
            columns: 1,
            width: 55,
          });
          doc.y = ymin + i;
          doc.x = 447;
          doc.text(utils.formatNumber(total_exento), {
            align: 'right',
            columns: 1,
            width: 52,
          });
          doc.y = ymin + i;
          doc.x = 503;
          doc.text(utils.formatNumber(total_base), {
            align: 'right',
            columns: 1,
            width: 45,
          });
          doc.y = ymin + i;
          doc.x = 550;
          doc.text(utils.formatNumber(total_retenido), {
            align: 'right',
            columns: 1,
            width: 40,
          });
        }
        break;
      default:
        break;
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
      doc.font('Helvetica');
      doc.fillColor('#444444');
      if (tipo != 'IC' && !detalles.proveedor) {
        doc.x = 653;
        doc.y = 50;
        doc.text(`Pagina ${i + 1} de ${range.count}`, {
          align: 'right',
          columns: 1,
          width: 100,
        });
      }
    }
  }
}

module.exports = RetencionesIvaService;
