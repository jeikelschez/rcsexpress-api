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
const sustraendo2 =
  'SUM((SELECT sustraendo FROM maestro_retenciones' +
  ' WHERE fecha_ini_val <= `ctaspagar->compras->retenciones`.`fecha_comprobante`' +
  ' AND fecha_fin_val >= `ctaspagar->compras->retenciones`.`fecha_comprobante`' +
  ' AND cod_tipo_retencion = `ctaspagar->compras->retenciones`.`cod_tipo_retencion`' +
  ' AND cod_tipo_persona = `ctaspagar`.cod_tipo_persona))';

class RetencionesIslrService {
  async mainReport(doc, tipo, data) {
    let detalles = [];
    let detalles2 = [];
    let where = {};
    let where2 = {};
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

        if (data.comprobante) where.nro_comprobante = data.comprobante;
        if (data.proveedor) where2.cod_proveedor = data.proveedor;

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
            'cod_seniat',
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
          order: [
            ['nro_comprobante', 'ASC'],
            ['retenciones', 'nro_factura', 'ASC'],
          ],
          raw: true,
        });

        detalles2 = await models.Cislr.findAll({
          where: where,
          attributes: [
            'porc_retencion',
            [Sequelize.literal(sustraendo), 'sustraendo'],
            [
              Sequelize.fn('sum', Sequelize.col('Cislr.monto_base')),
              'monto_base',
            ],
            [Sequelize.fn('count', Sequelize.col('Cislr.id')), 'cantidad'],
          ],
          include: [
            {
              model: models.Cislrfac,
              as: 'retenciones',
              attributes: [],
              where: where2,
              include: [
                {
                  model: models.Mctapagar,
                  as: 'compras',
                  attributes: [],
                },
              ],
            },
          ],
          group: ['porc_retencion', 'sustraendo'],
          order: [
            ['porc_retencion', 'ASC'],
            ['sustraendo', 'ASC'],
          ],
          raw: true,
        });

        if (detalles.length == 0) return false;

        detalles.desde = data.desde;
        detalles.hasta = data.hasta;
        if (data.proveedor) detalles.proveedor = data.proveedor;
        break;
      case 'DI':
        where = {
          fecha_pago: {
            [Sequelize.Op.between]: [
              moment(data.desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              moment(data.hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            ],
          },
        };

        detalles = await models.Pgenerados.findAll({
          where: where,
          attributes: [
            'id',
            'fecha_pago',
            'nro_doc_pago',
            'monto_pagado',
            'monto_retenido',
            'cod_cuenta',
            'monto_base',
            'porc_retencion',
          ],
          include: [
            {
              model: models.Mctapagar,
              as: 'ctaspagar',
              required: true,
              attributes: [
                'fecha_registro',
                'nro_documento',
                'nro_ctrl_doc',
                'porcentaje_retencion',
              ],
              include: [
                {
                  model: models.Cislrfac,
                  as: 'compras',
                  attributes: ['id', 'monto_base'],
                  required: true,
                  include: [
                    {
                      model: models.Cislr,
                      as: 'retenciones',
                      attributes: [
                        'id',
                        'cod_seniat',
                        'porc_retencion',
                        'monto_retener',
                      ],
                    },
                  ],
                },
                {
                  model: models.Proveedores,
                  as: 'proveedores',
                  attributes: ['nb_proveedor', 'rif_proveedor'],
                },
              ],
            },
            {
              model: models.Cuentas,
              as: 'cuentas',
              attributes: ['nro_cuenta'],
              include: [
                {
                  model: models.Bancos,
                  as: 'bancos',
                  attributes: ['nb_banco'],
                },
              ],
            },
          ],
          order: [
            ['cuentas', 'bancos', 'id', 'ASC'],
            ['nro_doc_pago', 'ASC'],
            ['ctaspagar', 'nro_documento', 'ASC'],
          ],
          raw: true,
        });

        detalles2 = await models.Pgenerados.findAll({
          where: where,
          attributes: [
            'ctaspagar.compras.retenciones.porc_retencion',
            [
              Sequelize.fn(
                'sum',
                Sequelize.col('`ctaspagar.compras`.monto_base')
              ),
              'monto_base',
            ],
            [
              Sequelize.fn(
                'sum',
                Sequelize.col('`ctaspagar.compras.retenciones`.monto_retener')
              ),
              'monto_retener',
            ],
            [Sequelize.fn('count', Sequelize.col('Pgenerados.id')), 'cantidad'],
            [Sequelize.literal(sustraendo2), 'sustraendo'],
          ],
          include: [
            {
              model: models.Mctapagar,
              as: 'ctaspagar',
              required: true,
              attributes: [],
              include: [
                {
                  model: models.Cislrfac,
                  as: 'compras',
                  attributes: [],
                  required: true,
                  include: [
                    {
                      model: models.Cislr,
                      as: 'retenciones',
                      attributes: [],
                    },
                  ],
                },
              ],
            },
          ],
          group: ['ctaspagar.compras.retenciones.porc_retencion'],
          order: [
            ['ctaspagar', 'compras', 'retenciones', 'porc_retencion', 'DESC'],
          ],
          raw: true,
        });

        if (detalles.length == 0) return false;

        detalles.desde = data.desde;
        detalles.hasta = data.hasta;
        break;
      default:
        break;
    }

    await this.generateHeader(doc, tipo, detalles);
    await this.generateCustomerInformation(doc, tipo, detalles, detalles2);
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
        doc.font('Helvetica');
        doc.text('Av. 74, C.C. Araurima, Nivel P.B. Local Nº 6', 30, 75);
        doc.text('Urb. Terrazas de Castillito', 30, 88);
        doc.text('Valencia Edo. Carabobo', 30, 101);
        doc.text('Teléfonos: 0241-8717563 - 8716867', 30, 114);
        doc.lineWidth(0.5);
        doc.lineJoin('miter').rect(610, 70, 150, 48).stroke();

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
        doc.y = 95;
        doc.x = 200;
        doc.text('COMPROBANTE DE RETENCIÓN ISLR', {
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
        doc.x = 140;
        doc.text(detalles[0]['retenciones.proveedores.nb_proveedor'], {
          align: 'left',
          columns: 1,
          width: 300,
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
        let nit = detalles[0]['retenciones.proveedores.nit_proveedor']
          ? detalles[0]['retenciones.proveedores.nit_proveedor']
          : '';
        doc.y = 182;
        doc.x = 220;
        doc.text('N.I.T: ' + nit, {
          align: 'left',
          columns: 1,
          width: 100,
        });
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
      case 'RC':
        doc.font('Helvetica');
        doc.text('Av. 74, C.C. Araurima, Nivel P.B. Local Nº 6', 30, 75);
        doc.text('Urb. Terrazas de Castillito', 30, 88);
        doc.text('Valencia Edo. Carabobo', 30, 101);
        doc.text('Teléfonos: 0241-8717563 - 8716867', 30, 114);
        doc.lineWidth(0.5);
        doc.fontSize(13);
        doc.font('Helvetica-Bold');
        doc.y = 85;
        doc.x = 200;
        doc.text('COMPROBANTE DE RETENCIÓN ISLR', {
          align: 'center',
          columns: 1,
          width: 400,
        });

        doc.fontSize(12);
        doc.y = 105;
        doc.x = 290;
        doc.text('Desde: ' + detalles.desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 105;
        doc.x = 410;
        doc.text('Hasta: ' + detalles.hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });

        doc.fontSize(8);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 688, 35);

        if (detalles.proveedor) {
          doc.fontSize(13);
          doc.font('Helvetica-Bold');
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
          doc.font('Helvetica');
          doc.y = 156;
          doc.x = 140;
          doc.text(detalles[0]['retenciones.proveedores.nb_proveedor'], {
            align: 'left',
            columns: 1,
            width: 300,
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
          let nit = detalles[0]['retenciones.proveedores.nit_proveedor']
            ? detalles[0]['retenciones.proveedores.nit_proveedor']
            : '';
          doc.y = 182;
          doc.x = 220;
          doc.text('N.I.T: ' + nit, {
            align: 'left',
            columns: 1,
            width: 100,
          });
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

          doc.fontSize(8);
          doc.lineJoin('miter').rect(30, 225, 49, 26).stroke();
          doc.text('Período', 41, 240);
          doc.lineJoin('miter').rect(81, 225, 50, 26).stroke();
          doc.text('Fecha', 95, 240);
          doc.lineJoin('miter').rect(133, 225, 65, 26).stroke();
          doc.text('N° Factura ó', 143, 230);
          doc.text('Nota de Crédito', 137, 240);
          doc.lineJoin('miter').rect(200, 225, 39, 26).stroke();
          doc.text('N°', 217, 230);
          doc.text('Control', 207, 240);
          doc.lineJoin('miter').rect(241, 225, 19, 26).stroke();
          doc.text('Cod.', 243, 240);
          doc.lineJoin('miter').rect(262, 225, 53, 26).stroke();
          doc.text('Fecha', 277, 230);
          doc.text('Comprobante', 264, 240);
          doc.lineJoin('miter').rect(317, 225, 53, 26).stroke();
          doc.text('N°', 340, 230);
          doc.text('Comprobante', 319, 240);
          doc.lineJoin('miter').rect(372, 225, 45, 26).stroke();
          doc.text('Monto', 384, 230);
          doc.text('Abonado', 379, 240);
          doc.lineJoin('miter').rect(419, 225, 70, 26).stroke();
          doc.text('Cantidad', 439, 230);
          doc.text('Objeto Retención', 423, 240);
          doc.lineJoin('miter').rect(491, 225, 20, 26).stroke();
          doc.text('%', 496, 230);
          doc.text('Ret.', 494, 240);
          doc.lineJoin('miter').rect(513, 225, 120, 26).stroke();
          doc.text('Concepto', 560, 230);
          doc.text('I.S.L.R', 564, 240);
          doc.lineJoin('miter').rect(635, 225, 50, 26).stroke();
          doc.text('Sustraendo', 640, 240);
          doc.lineJoin('miter').rect(687, 225, 73, 26).stroke();
          doc.text('Impuesto Retenido', 690, 230);
          doc.text('Menos Sustraendo', 690, 240);
        } else {
          doc.fontSize(7);
          doc.lineJoin('miter').rect(30, 145, 30, 24).stroke();
          doc.text('Período', 32, 158);
          doc.lineJoin('miter').rect(62, 145, 40, 24).stroke();
          doc.text('Fecha', 72, 158);
          doc.lineJoin('miter').rect(104, 145, 49, 24).stroke();
          doc.text('Rif', 123, 150);
          doc.text('Proveedor', 111, 158);
          doc.lineJoin('miter').rect(155, 145, 80, 24).stroke();
          doc.text('Nombre', 185, 150);
          doc.text('Proveedor', 181, 158);
          doc.lineJoin('miter').rect(237, 145, 56, 24).stroke();
          doc.text('N° Factura ó', 245, 150);
          doc.text('Nota de Crédito', 239, 158);
          doc.lineJoin('miter').rect(295, 145, 40, 24).stroke();
          doc.text('N°', 313, 150);
          doc.text('Control', 303, 158);
          doc.lineJoin('miter').rect(337, 145, 20, 24).stroke();
          doc.text('Cód.', 339, 158);
          doc.lineJoin('miter').rect(359, 145, 50, 24).stroke();
          doc.text('Fecha', 375, 150);
          doc.text('Comprobante', 361, 158);
          doc.lineJoin('miter').rect(411, 145, 50, 24).stroke();
          doc.text('N°', 435, 150);
          doc.text('Comprobante', 413, 158);
          doc.lineJoin('miter').rect(463, 145, 45, 24).stroke();
          doc.text('Monto', 476, 150);
          doc.text('Abonado', 470, 158);
          doc.lineJoin('miter').rect(510, 145, 62, 24).stroke();
          doc.text('Cantidad', 528, 150);
          doc.text('Objeto Retención', 512, 158);
          doc.lineJoin('miter').rect(574, 145, 19, 24).stroke();
          doc.text('%', 580, 150);
          doc.text('Ret.', 577, 158);
          doc.lineJoin('miter').rect(595, 145, 85, 24).stroke();
          doc.text('Concepto', 625, 150);
          doc.text('I.S.L.R', 630, 158);
          doc.lineJoin('miter').rect(682, 145, 36, 24).stroke();
          doc.text('Sust.', 692, 158);
          doc.lineJoin('miter').rect(720, 145, 45, 24).stroke();
          doc.text('Imp. Ret.', 729, 150);
          doc.text('Menos Sust.', 722, 158);
        }
        break;
      case 'DI':
        doc.fontSize(13);
        doc.font('Helvetica-Bold');
        doc.y = 30;
        doc.x = 200;
        doc.text('DECLARACION DE ISLR', {
          align: 'center',
          columns: 1,
          width: 400,
        });

        doc.fontSize(12);
        doc.y = 50;
        doc.x = 290;
        doc.text('Desde: ' + detalles.desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 50;
        doc.x = 410;
        doc.text('Hasta: ' + detalles.hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });

        doc.fontSize(8);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 688, 35);

        doc.fontSize(7);
        doc.lineJoin('miter').rect(30, 98, 35, 13).stroke();
        doc.text('Cheque', 35, 102);
        doc.lineJoin('miter').rect(67, 98, 120, 13).stroke();
        doc.text('Banco', 120, 102);
        doc.lineJoin('miter').rect(189, 83, 82, 13).stroke();
        doc.text('Fecha', 220, 87);
        doc.lineJoin('miter').rect(189, 98, 40, 13).stroke();
        doc.text('Pago', 202, 102);
        doc.lineJoin('miter').rect(231, 98, 40, 13).stroke();
        doc.text('Factura', 238, 102);
        doc.lineJoin('miter').rect(273, 98, 140, 13).stroke();
        doc.text('Beneficiario', 325, 102);
        doc.lineJoin('miter').rect(415, 98, 64, 13).stroke();
        doc.text('Rif', 443, 102);
        doc.lineJoin('miter').rect(481, 98, 50, 13).stroke();
        doc.text('N° Factura', 488, 102);
        doc.lineJoin('miter').rect(533, 98, 50, 13).stroke();
        doc.text('N° Control', 540, 102);
        doc.lineJoin('miter').rect(585, 98, 25, 13).stroke();
        doc.text('Cód.', 589, 102);
        doc.lineJoin('miter').rect(612, 83, 60, 13).stroke();
        doc.lineJoin('miter').rect(612, 98, 60, 13).stroke();
        doc.text('Monto Objeto', 620, 87);
        doc.text('Retención', 625, 102);
        doc.lineJoin('miter').rect(674, 83, 25, 28).stroke();
        doc.text('Aplic.', 677, 89);
        doc.text('%', 683, 100);
        doc.lineJoin('miter').rect(701, 98, 60, 13).stroke();
        doc.text('Monto Retenido', 705, 102);
        break;
      default:
        break;
    }
  }

  async generateCustomerInformation(doc, tipo, detalles, detalles2) {
    let total_retencion = 0;
    let total_base = 0;
    let total_total = 0;
    let total_retener = 0;
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

        doc
          .lineJoin('miter')
          .rect(615, ymin + i + 50, 145, 47)
          .stroke();
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
      case 'RC':
        if (detalles.proveedor) {
          doc.fontSize(8);
          doc.font('Helvetica');
          doc.fillColor('#444444');
          ymin = 260;
          for (var item = 0; item < detalles.length; item++) {
            doc.y = ymin + i;
            doc.x = 37;
            doc.text(
              moment(detalles[item].fecha_comprobante).format('YYYY') +
                moment(detalles[item].fecha_comprobante).format('MM'),
              {
                align: 'center',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 83;
            doc.text(
              moment(
                detalles[item]['retenciones.compras.fecha_registro']
              ).format('DD/MM/YYYY'),
              {
                align: 'center',
                columns: 1,
                width: 50,
              }
            );
            doc.y = ymin + i;
            doc.x = 141;
            doc.text(detalles[item]['retenciones.compras.nro_documento'], {
              align: 'center',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i;
            doc.x = 195;
            doc.text(detalles[item]['retenciones.nro_factura'], {
              align: 'center',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i;
            doc.x = 242;
            doc.text(detalles[item].cod_seniat, {
              align: 'center',
              columns: 1,
              width: 20,
            });
            doc.y = ymin + i;
            doc.x = 264;
            doc.text(
              moment(detalles[item]['retenciones.fecha_factura']).format(
                'DD/MM/YYYY'
              ),
              {
                align: 'center',
                columns: 1,
                width: 50,
              }
            );
            doc.y = ymin + i;
            doc.x = 319;
            doc.text(detalles[item].nro_comprobante, {
              align: 'center',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i;
            doc.x = 365;
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
            doc.x = 437;
            doc.text(utils.formatNumber(monto_base), {
              align: 'right',
              columns: 1,
              width: 50,
            });

            doc.y = ymin + i;
            doc.x = 489;
            doc.text(parseInt(detalles[item].porc_retencion) + '%', {
              align: 'right',
              columns: 1,
              width: 20,
            });
            doc.y = ymin + i;
            doc.x = 515;
            doc.text(detalles[item].nb_tipo_retencion, {
              align: 'center',
              columns: 1,
              width: 120,
            });
            doc.y = ymin + i;
            doc.x = 632;
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
            doc.x = 707;
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

            i += 22;
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
          doc.x = 280;
          doc.text('Totales:', {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.y = ymin + i;
          doc.x = 365;
          doc.text(utils.formatNumber(total_retencion), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 437;
          doc.text(utils.formatNumber(total_base), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 707;
          doc.text(utils.formatNumber(total_total), {
            align: 'right',
            columns: 1,
            width: 50,
          });

          doc
            .lineJoin('miter')
            .rect(615, ymin + i + 50, 145, 47)
            .stroke();
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
        } else {
          ymin = 180;
          for (var item = 0; item < detalles.length; item++) {
            doc.fontSize(7);
            doc.font('Helvetica');
            doc.fillColor('#444444');

            doc.y = ymin + i;
            doc.x = 27;
            doc.text(
              moment(detalles[item].fecha_comprobante).format('YYYY') +
                moment(detalles[item].fecha_comprobante).format('MM'),
              {
                align: 'center',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 58;
            doc.text(
              moment(
                detalles[item]['retenciones.compras.fecha_registro']
              ).format('DD/MM/YYYY'),
              {
                align: 'center',
                columns: 1,
                width: 50,
              }
            );
            doc.y = ymin + i;
            doc.x = 105;
            doc.text(detalles[item]['retenciones.proveedores.rif_proveedor'], {
              align: 'center',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i;
            doc.x = 160;
            doc.text(
              utils.truncate(
                detalles[item]['retenciones.proveedores.nb_proveedor'],
                35
              ),
              {
                align: 'left',
                columns: 1,
                width: 80,
              }
            );
            doc.y = ymin + i;
            doc.x = 240;
            doc.text(detalles[item]['retenciones.compras.nro_documento'], {
              align: 'center',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i;
            doc.x = 291;
            doc.text(detalles[item]['retenciones.nro_factura'], {
              align: 'center',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i;
            doc.x = 337;
            doc.text(detalles[item].cod_seniat, {
              align: 'center',
              columns: 1,
              width: 20,
            });
            doc.y = ymin + i;
            doc.x = 358;
            doc.text(
              moment(detalles[item]['retenciones.fecha_factura']).format(
                'DD/MM/YYYY'
              ),
              {
                align: 'center',
                columns: 1,
                width: 50,
              }
            );
            doc.y = ymin + i;
            doc.x = 412;
            doc.text(detalles[item].nro_comprobante, {
              align: 'center',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i;
            doc.x = 455;
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
            doc.x = 518;
            doc.text(utils.formatNumber(monto_base), {
              align: 'right',
              columns: 1,
              width: 50,
            });
            doc.y = ymin + i;
            doc.x = 571;
            doc.text(parseInt(detalles[item].porc_retencion) + '%', {
              align: 'right',
              columns: 1,
              width: 20,
            });
            doc.y = ymin + i;
            doc.x = 598;
            doc.text(detalles[item].nb_tipo_retencion, {
              align: 'center',
              columns: 1,
              width: 90,
            });
            doc.y = ymin + i;
            doc.x = 665;
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
            doc.x = 710;
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

            i += 23;
            if (i >= 400) {
              doc.fillColor('#BLACK');
              doc.addPage();
              page = page + 1;
              doc.switchToPage(page);
              i = 0;
              await this.generateHeader(doc, tipo, detalles);
            }
          }

          // Totales Finales
          doc.font('Helvetica-Bold');
          doc.y = ymin + i;
          doc.x = 400;
          doc.text('Totales:', {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.y = ymin + i;
          doc.x = 455;
          doc.text(utils.formatNumber(total_retencion), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 518;
          doc.text(utils.formatNumber(total_base), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 710;
          doc.text(utils.formatNumber(total_total), {
            align: 'right',
            columns: 1,
            width: 50,
          });

          if (i >= 250) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, detalles);
          }

          doc
            .lineJoin('miter')
            .rect(615, ymin + i + 50, 145, 47)
            .stroke();
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

          doc
            .lineJoin('miter')
            .rect(130, ymin + i + 33, 136, 18)
            .stroke();
          doc.text('Cantidad Objeto Retención', 133, ymin + i + 37);
          doc
            .lineJoin('miter')
            .rect(268, ymin + i + 33, 75, 18)
            .stroke();
          doc.text('Cant. Facturas', 271, ymin + i + 37);
          doc
            .lineJoin('miter')
            .rect(345, ymin + i + 33, 108, 18)
            .stroke();
          doc.text('Imp. Ret. Menos Sust.', 348, ymin + i + 37);
          doc
            .lineJoin('miter')
            .rect(455, ymin + i + 33, 63, 18)
            .stroke();
          doc.text('Sustraendo', 458, ymin + i + 37);

          for (var item2 = 0; item2 < detalles2.length; item2++) {
            doc.y = ymin + i + 60;
            doc.x = 60;
            doc.text(
              'Total Base ' + parseInt(detalles2[item2].porc_retencion) + '%',
              {
                align: 'left',
                columns: 1,
                width: 70,
              }
            );
            doc.y = ymin + i + 60;
            doc.x = 190;
            doc.text(utils.formatNumber(detalles2[item2].monto_base), {
              align: 'right',
              columns: 1,
              width: 70,
            });
            doc.y = ymin + i + 60;
            doc.x = 280;
            doc.text(detalles2[item2].cantidad, {
              align: 'center',
              columns: 1,
              width: 60,
            });
            let monto_total =
              utils.parseFloatN(detalles2[item2].monto_base) *
                (utils.parseFloatN(detalles2[item2].porc_retencion) / 100) -
              utils.parseFloatN(detalles2[item2].sustraendo);
            doc.y = ymin + i + 60;
            doc.x = 390;
            doc.text(utils.formatNumber(monto_total), {
              align: 'right',
              columns: 1,
              width: 60,
            });
            doc.y = ymin + i + 60;
            doc.x = 453;
            doc.text(utils.formatNumber(detalles2[item2].sustraendo), {
              align: 'right',
              columns: 1,
              width: 60,
            });
            i += 18;
          }
        }
        break;
      case 'DI':
        ymin = 118;
        for (var item = 0; item < detalles.length; item++) {
          doc.fontSize(7);
          doc.font('Helvetica');
          doc.fillColor('#444444');

          doc.y = ymin + i;
          doc.x = 31;
          doc.text(detalles[item].nro_doc_pago, {
            align: 'center',
            columns: 1,
            width: 35,
          });
          doc.y = ymin + i;
          doc.x = 70;
          doc.text(detalles[item]['cuentas.bancos.nb_banco'], {
            align: 'center',
            columns: 1,
            width: 120,
          });
          doc.y = ymin + i;
          doc.x = 190;
          doc.text(moment(detalles[item].fecha_pago).format('DD/MM/YYYY'), {
            align: 'center',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 232;
          doc.text(
            moment(detalles[item]['ctaspagar.fecha_registro']).format(
              'DD/MM/YYYY'
            ),
            {
              align: 'center',
              columns: 1,
              width: 40,
            }
          );
          doc.y = ymin + i;
          doc.x = 277;
          doc.text(detalles[item]['ctaspagar.proveedores.nb_proveedor'], {
            align: 'left',
            columns: 1,
            width: 140,
          });
          doc.y = ymin + i;
          doc.x = 416;
          doc.text(detalles[item]['ctaspagar.proveedores.rif_proveedor'], {
            align: 'center',
            columns: 1,
            width: 64,
          });
          doc.y = ymin + i;
          doc.x = 482;
          doc.text(detalles[item]['ctaspagar.nro_documento'], {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 534;
          doc.text(detalles[item]['ctaspagar.nro_ctrl_doc'], {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 586;
          doc.text(detalles[item]['ctaspagar.compras.retenciones.cod_seniat'], {
            align: 'center',
            columns: 1,
            width: 25,
          });
          doc.y = ymin + i;
          doc.x = 610;
          doc.text(
            utils.formatNumber(detalles[item]['ctaspagar.compras.monto_base']),
            {
              align: 'right',
              columns: 1,
              width: 60,
            }
          );
          doc.y = ymin + i;
          doc.x = 675;
          doc.text(
            detalles[item]['ctaspagar.compras.retenciones.porc_retencion'] +
              '%',
            {
              align: 'center',
              columns: 1,
              width: 25,
            }
          );
          doc.y = ymin + i;
          doc.x = 699;
          doc.text(
            utils.formatNumber(
              detalles[item]['ctaspagar.compras.retenciones.monto_retener']
            ),
            {
              align: 'right',
              columns: 1,
              width: 60,
            }
          );
          total_base += utils.parseFloatN(
            detalles[item]['ctaspagar.compras.monto_base']
          );
          total_retener += utils.parseFloatN(
            detalles[item]['ctaspagar.compras.retenciones.monto_retener']
          );

          i += 18;
          if (i >= 450) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, detalles);
          }
        }
        // Totales Finales
        doc.font('Helvetica-Bold');
        doc.y = ymin + i;
        doc.x = 540;
        doc.text('Totales:', {
          align: 'left',
          columns: 1,
          width: 100,
        });
        doc.y = ymin + i;
        doc.x = 610;
        doc.text(utils.formatNumber(total_base), {
          align: 'right',
          columns: 1,
          width: 60,
        });
        doc.y = ymin + i;
        doc.x = 699;
        doc.text(utils.formatNumber(total_retener), {
          align: 'right',
          columns: 1,
          width: 60,
        });

        if (i >= 250) {
          doc.fillColor('#BLACK');
          doc.addPage();
          page = page + 1;
          doc.switchToPage(page);
          i = 0;
          await this.generateHeader(doc, tipo, detalles);
        }

        doc.fontSize(10);
        doc
          .lineJoin('miter')
          .rect(130, ymin + i + 33, 136, 18)
          .stroke();
        doc.text('Cantidad Objeto Retención', 133, ymin + i + 37);
        doc
          .lineJoin('miter')
          .rect(268, ymin + i + 33, 75, 18)
          .stroke();
        doc.text('Cant. Facturas', 271, ymin + i + 37);
        doc
          .lineJoin('miter')
          .rect(345, ymin + i + 33, 108, 18)
          .stroke();
        doc.text('Imp. Ret. Menos Sust.', 348, ymin + i + 37);
        doc
          .lineJoin('miter')
          .rect(455, ymin + i + 33, 63, 18)
          .stroke();
        doc.text('Sustraendo', 458, ymin + i + 37);

        let base = 0;
        let cantidad = 0;
        let retener = 0;

        for (var item2 = 0; item2 < detalles2.length; item2++) {
          doc.y = ymin + i + 60;
          doc.x = 60;
          doc.text(
            'Total Base ' + parseInt(detalles2[item2].porc_retencion) + '%',
            {
              align: 'left',
              columns: 1,
              width: 70,
            }
          );
          doc.y = ymin + i + 60;
          doc.x = 190;
          doc.text(utils.formatNumber(detalles2[item2].monto_base), {
            align: 'right',
            columns: 1,
            width: 70,
          });
          doc.y = ymin + i + 60;
          doc.x = 280;
          doc.text(detalles2[item2].cantidad, {
            align: 'center',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i + 60;
          doc.x = 390;
          doc.text(utils.formatNumber(detalles2[item2].monto_retener), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i + 60;
          doc.x = 453;
          doc.text(utils.formatNumber(detalles2[item2].sustraendo), {
            align: 'right',
            columns: 1,
            width: 60,
          });

          base += utils.parseFloatN(detalles2[item2].monto_base);
          cantidad += utils.parseFloatN(detalles2[item2].cantidad);
          retener += utils.parseFloatN(detalles2[item2].monto_retener);
          i += 18;
        }

        doc.lineCap('butt').moveTo(180, ymin + i + 57).lineTo(460, ymin + i + 57).stroke();

        doc.y = ymin + i + 65;
        doc.x = 190;
        doc.text(utils.formatNumber(base), {
          align: 'right',
          columns: 1,
          width: 70,
        });
        doc.y = ymin + i + 65;
        doc.x = 280;
        doc.text(cantidad, {
          align: 'center',
          columns: 1,
          width: 60,
        });
        doc.y = ymin + i + 65;
        doc.x = 390;
        doc.text(utils.formatNumber(retener), {
          align: 'right',
          columns: 1,
          width: 60,
        });
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
        doc.x = 656;
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
