const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

const nbTipoRetencion =
  '(SELECT nb_tipo_retencion FROM maestro_retenciones' +
  ' WHERE fecha_ini_val <= `Cislr`.`fecha_comprobante`' +
  ' AND fecha_fin_val >= `Cislr`.`fecha_comprobante`' +
  ' AND cod_tipo_retencion = `Cislr`.`cod_tipo_retencion`' +
  ' AND cod_tipo_persona = `retenciones->compras`.cod_tipo_persona)';
const sustraendo =
  '(SELECT sustraendo FROM maestro_retenciones' +
  ' WHERE fecha_ini_val <= `Cislr`.`fecha_comprobante`' +
  ' AND fecha_fin_val >= `Cislr`.`fecha_comprobante`' +
  ' AND cod_tipo_retencion = `Cislr`.`cod_tipo_retencion`' +
  ' AND cod_tipo_persona = `retenciones->compras`.cod_tipo_persona)';

class RetencionesIslrService {
  async mainReport(
    doc,
    tipo,
    proveedor,
    desde,
    hasta,
    nro_comprobante
  ) {
    let detalles = [];

    switch (tipo) {
      case 'IC':
        let where = {
          fecha_comprobante: {
            [Sequelize.Op.between]: [
              moment(desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              moment(hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            ],
          },
          nro_comprobante: nro_comprobante,
        };

        let where2 = {};
        if (proveedor) where2.cod_proveedor = proveedor;

        detalles = await models.Cislr.findAll({
          where: where,
          attributes: [
            'id',
            'porc_retencion',
            'monto_base',
            'monto_retener',
            'fecha_reg_islr',
            'nro_comprobante',
            'fecha_comprobante',
            'cod_tipo_retencion',
            [Sequelize.literal(nbTipoRetencion), 'nb_tipo_retencion'],
            [Sequelize.literal(sustraendo), 'sustraendo'],
          ],
          include: [
            {
              model: models.Cislrfac,
              as: 'retenciones',
              attributes: ['fecha_factura', 'nro_factura'],
              where: where2,
              include: [
                {
                  model: models.Proveedores,
                  as: 'proveedores',
                  attributes: [
                    'nb_proveedor',
                    'rif_proveedor',
                    'nit_proveedor',
                    'tipo_persona',
                    'direccion_fiscal',
                    'tlf_proveedor',
                  ],
                },
                {
                  model: models.Mctapagar,
                  as: 'compras',
                  attributes: [
                    'nro_documento',
                    'fecha_registro',
                    'tipo_documento',
                    'cod_tipo_persona',
                    'total_documento',
                  ],
                },
              ],
            },
          ],
          raw: true,
        });

        if (detalles.length == 0) return false;

        detalles.desde = desde;
        detalles.hasta = hasta;
        if (agencia) detalles.agencia = agencia;
        if (proveedor) detalles.proveedor = proveedor;
        break;
      default:
        return false;
        break;
    }

    await this.generateHeader(doc, tipo, detalles);
    await this.generateCustomerInformation(doc, tipo, detalles);
    return true;
  }

  async generateHeader(doc, tipo, detalles) {
    switch (tipo) {
      case 'IC':
        doc.image('./img/logo_rc5.png', 30, 25, { width: 50 });
        doc.fontSize(10);
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.text('R.C.S EXPRESS, S.A', 85, 35);
        doc.text('RIF. J-31028463-6', 85, 50);
        doc.fontSize(9);
        doc.font('Helvetica');
        doc.text('Av. 74, C.C. Araurima, Nivel P.B. Local Nº 6', 30, 75);
        doc.text('Urb. Terrazas de Castillito', 30, 88);
        doc.text('Valencia Edo. Carabobo', 30, 101);
        doc.text('Teléfonos: 0241-8717563 - 8716867', 30, 114);

        doc.lineWidth(0.5);
        doc.lineJoin('miter').rect(630, 70, 130, 48).stroke();

        doc.y = 75;
        doc.x = 605;
        doc.text(
          'Fecha: ' +
            moment(detalles[0].fecha_comprobante).format('DD/MM/YYYY'),
          {
            align: 'right',
            columns: 1,
            width: 150,
          }
        );
        doc.y = 90;
        doc.x = 605;
        doc.text('Nro. Comprobante: ' + detalles[0].nro_comprobante, {
          align: 'right',
          columns: 1,
          width: 150,
        });
        doc.y = 105;
        doc.x = 605;
        doc.text(
          'Período: Año: ' +
            moment(detalles[0]['retenciones.fecha_factura']).format('YYYY') +
            ' Mes: ' +
            moment(detalles[0]['retenciones.fecha_factura']).format('MM'),
          {
            align: 'right',
            columns: 1,
            width: 150,
          }
        );

        doc.fontSize(13);
        doc.font('Helvetica-Bold');
        let tittle = 'COMPROBANTE DE RETENCIÓN ISLR';
        doc.y = 95;
        doc.x = 200;
        doc.text(tittle, {
          align: 'center',
          columns: 1,
          width: 400,
        });

        doc.lineJoin('miter').rect(30, 135, 730, 80).stroke();
        doc.lineCap('butt').moveTo(30, 152).lineTo(760, 152).stroke();
        doc.lineCap('butt').moveTo(30, 193).lineTo(760, 193).stroke();

        doc.y = 140;
        doc.x = 200;
        doc.text('SUJETO DE RETENCIÓN', {
          align: 'center',
          columns: 1,
          width: 400,
        });
        doc.y = 200;
        doc.x = 200;
        doc.text('Información del Impuesto Retenido', {
          align: 'center',
          columns: 1,
          width: 400,
        });

        doc.fontSize(9);
        doc.y = 156;
        doc.x = 90;
        doc.text(detalles[0]['retenciones.proveedores.nb_proveedor'], {
          align: 'center',
          columns: 1,
          width: 150,
        });
        doc.y = 182;
        doc.x = 65;
        doc.text(detalles[0]['retenciones.proveedores.rif_proveedor'], {
          align: 'left',
          columns: 1,
          width: 100,
        });

        doc.font('Helvetica');
        doc.y = 156;
        doc.x = 40;
        doc.text('Nombre o Razón Social: ', {
          align: 'left',
          columns: 1,
          width: 100,
        });
        doc.y = 169;
        doc.x = 40;
        doc.text('Dirección Fiscal: ', {
          align: 'left',
          columns: 1,
          width: 100,
        });
        doc.y = 169;
        doc.x = 110;
        doc.text(detalles[0]['retenciones.proveedores.direccion_fiscal'], {
          align: 'left',
          columns: 1,
          width: 500,
        });
        doc.y = 182;
        doc.x = 40;
        doc.text('R.I.F: ', {
          align: 'left',
          columns: 1,
          width: 100,
        });
        doc.y = 182;
        doc.x = 220;
        doc.text(
          'N.I.T: ' + detalles[0]['retenciones.proveedores.nit_proveedor'],
          {
            align: 'left',
            columns: 1,
            width: 100,
          }
        );
        doc.y = 182;
        doc.x = 380;
        doc.text(
          'Teléfono: ' + detalles[0]['retenciones.proveedores.tlf_proveedor'],
          {
            align: 'left',
            columns: 1,
            width: 300,
          }
        );

        doc.fontSize(9);
        doc.lineJoin('miter').rect(30, 225, 47, 26).stroke();
        doc.text('Fecha', 41, 240);
        doc.lineJoin('miter').rect(79, 225, 55, 26).stroke();
        doc.text('Tipo de', 91, 230);
        doc.text('Documento', 83, 240);
        doc.lineJoin('miter').rect(136, 225, 75, 26).stroke();
        doc.text('N° Factura ó', 148, 230);
        doc.text('Nota de Crédito', 141, 240);
        doc.lineJoin('miter').rect(213, 225, 55, 26).stroke();
        doc.text('N°', 238, 230);
        doc.text('Control', 226, 240);
        doc.lineJoin('miter').rect(270, 225, 60, 26).stroke();
        doc.text('Monto', 289, 230);
        doc.text('Abonado', 283, 240);
        doc.lineJoin('miter').rect(332, 225, 80, 26).stroke();
        doc.text('Cantidad', 355, 230);
        doc.text('Objeto Retención', 337, 240);
        doc.lineJoin('miter').rect(414, 225, 25, 26).stroke();
        doc.text('%', 422, 230);
        doc.text('Ret.', 419, 240);
        doc.lineJoin('miter').rect(441, 225, 170, 26).stroke();
        doc.text('Concepto I.S.L.R', 493, 240);
        doc.lineJoin('miter').rect(613, 225, 60, 26).stroke();
        doc.text('Sustraendo', 620, 240);
        doc.lineJoin('miter').rect(675, 225, 85, 26).stroke();
        doc.text('Impuesto Retenido', 679, 230);
        doc.text('Menos Sustraendo', 680, 240);
        break;
      default:
        break;
    }
  }

  async generateCustomerInformation(doc, tipo, detalles) {
    let total_retencion = 0;
    let total_base = 0;
    let total_total = 0;

    switch (tipo) {
      case 'IC':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 260;
        for (var item = 0; item < detalles.length; item++) {
          doc.fontSize(8);
          doc.font('Helvetica');
          doc.fillColor('#444444');

          doc.y = ymin + i;
          doc.x = 32;
          doc.text(
            moment(detalles[item].fecha_comprobante).format('DD/MM/YYYY'),
            {
              align: 'center',
              columns: 1,
              width: 45,
            }
          );

          let tipoDoc = 'Factura';
          if (detalles[item]['retenciones.compras.tipo_documento'] == 'NC')
            tipoDoc = 'Nota Crédito';
          if (detalles[item]['retenciones.compras.tipo_documento'] == 'ND')
            tipoDoc = 'Nota Débito';
          doc.y = ymin + i;
          doc.x = 81;
          doc.text(tipoDoc, {
            align: 'center',
            columns: 1,
            width: 50,
          });

          doc.y = ymin + i;
          doc.x = 150;
          doc.text(detalles[item]['retenciones.compras.nro_documento'], {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 216;
          doc.text(detalles[item]['retenciones.nro_factura'], {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 278;
          doc.text(
            utils.formatNumber(
              detalles[item]['retenciones.compras.total_documento']
            ),
            {
              align: 'right',
              columns: 1,
              width: 50,
            }
          );

          let monto_base = detalles[item].monto_base;
          if (detalles[item]['retenciones.compras.tipo_documento'] == 'NC')
            monto_base = utils.parseFloatN(monto_base) * -1;
          doc.y = ymin + i;
          doc.x = 360;
          doc.text(utils.formatNumber(monto_base), {
            align: 'right',
            columns: 1,
            width: 50,
          });

          doc.y = ymin + i;
          doc.x = 413;
          doc.text(parseInt(detalles[item].porc_retencion) + '%', {
            align: 'right',
            columns: 1,
            width: 20,
          });
          doc.y = ymin + i;
          doc.x = 437;
          doc.text(detalles[item].nb_tipo_retencion, {
            align: 'center',
            columns: 1,
            width: 180,
          });
          doc.y = ymin + i;
          doc.x = 620;
          doc.text(utils.formatNumber(detalles[item].sustraendo), {
            align: 'right',
            columns: 1,
            width: 50,
          });

          let monto_total =
            utils.parseFloatN(detalles[item].monto_base) *
              (utils.parseFloatN(detalles[item].porc_retencion) / 100) -
            utils.parseFloatN(detalles[item].sustraendo);
          if (detalles[item]['retenciones.compras.tipo_documento'] == 'NC')
            monto_total = utils.parseFloatN(monto_total) * -1;
          doc.y = ymin + i;
          doc.x = 705;
          doc.text(utils.formatNumber(monto_total), {
            align: 'right',
            columns: 1,
            width: 50,
          });

          total_retencion += utils.parseFloatN(
            detalles[item]['retenciones.compras.total_documento']
          );
          total_base += utils.parseFloatN(monto_base);
          total_total += utils.parseFloatN(monto_total);

          i += 18;
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
        doc.font('Helvetica-Bold');
        doc.y = ymin + i;
        doc.x = 220;
        doc.text('Totales:', {
          align: 'left',
          columns: 1,
          width: 100,
        });
        doc.y = ymin + i;
        doc.x = 278;
        doc.text(utils.formatNumber(total_retencion), {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i;
        doc.x = 360;
        doc.text(utils.formatNumber(total_base), {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i;
        doc.x = 705;
        doc.text(utils.formatNumber(total_total), {
          align: 'right',
          columns: 1,
          width: 50,
        });
        
        doc.lineJoin('miter').rect(615, ymin + i + 50, 145, 47).stroke();
        doc.fontSize(10);
        doc.y = ymin + i + 60;
        doc.x = 620;
        doc.text('Total Retenido:', {
          align: 'left',
          columns: 1,
          width: 100,
        });
        doc.y = ymin + i + 60;
        doc.x = 695;
        doc.text(utils.formatNumber(total_total), {
          align: 'right',
          columns: 1,
          width: 60,
        });
        doc.fontSize(10);
        doc.y = ymin + i + 80;
        doc.x = 620;
        doc.text('Neto a Pagar:', {
          align: 'left',
          columns: 1,
          width: 100,
        });
        doc.y = ymin + i + 80;
        doc.x = 695;
        doc.text(utils.formatNumber(total_retencion - total_total), {
          align: 'right',
          columns: 1,
          width: 60,
        });

        doc.lineJoin('miter').rect(288, 440, 150, 140).stroke();
        doc.image('./img/logo_firma.png', 300, 445, { width: 120 });
        doc.lineJoin('miter').rect(438, 505, 160, 75).stroke();
        doc.lineJoin('miter').rect(598, 505, 160, 75).stroke();
        doc.fontSize(6);
        doc.font('Helvetica');
        doc.text('AGENTE RETENCIÓN (SELLO, FECHA Y FIRMA)', 450, 510);
        doc.text('RECIBIDO (SELLO Y FECHA)', 635, 510);
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
      doc.fillColor('#444444');
      if (tipo != 'IC') {
        doc.x = 485;
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

module.exports = RetencionesIslrService;
