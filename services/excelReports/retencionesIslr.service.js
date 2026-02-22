const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

const nbTipoRetencion =
  '(SELECT nb_tipo_retencion FROM maestro_retenciones' +
  ' WHERE fecha_ini_val <= `Cislr`.`fecha_comprobante`' +
  ' AND fecha_fin_val >= `Cislr`.`fecha_comprobante`' +
  ' AND id = `Cislr`.`cod_tipo_retencion`' +
  ' AND cod_tipo_persona = `retenciones->compras`.cod_tipo_persona)';
const sustraendo =
  '(SELECT sustraendo FROM maestro_retenciones' +
  ' WHERE fecha_ini_val <= `Cislr`.`fecha_comprobante`' +
  ' AND fecha_fin_val >= `Cislr`.`fecha_comprobante`' +
  ' AND id = `Cislr`.`cod_tipo_retencion`' +
  ' AND cod_tipo_persona = `retenciones->compras`.cod_tipo_persona)';
const sustraendo2 =
  'SUM((SELECT sustraendo FROM maestro_retenciones' +
  ' WHERE fecha_ini_val <= `ctaspagar->compras->retenciones`.`fecha_comprobante`' +
  ' AND fecha_fin_val >= `ctaspagar->compras->retenciones`.`fecha_comprobante`' +
  ' AND id = `ctaspagar->compras->retenciones`.`cod_tipo_retencion`' +
  ' AND cod_tipo_persona = `ctaspagar`.cod_tipo_persona))';

class RetencionesIslrService {
  async mainReport(worksheet, data) {
    let detalles = [];
    let detalles2 = [];
    let where = {};
    let where2 = {};
    data = JSON.parse(data);

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
        [Sequelize.fn('sum', Sequelize.col('Cislr.monto_base')), 'monto_base'],
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

    await this.generateHeader(worksheet, data);
    await this.generateCustomerInformation(worksheet, detalles, detalles2);
    return true;
  }

  async generateHeader(worksheet, data) {
    worksheet.getCell('A2').value = 'RESUMEN DE RETENCIONES ISLR';
    worksheet.getCell('A3').value = 'DESDE:';
    worksheet.getCell('B3').value = data.desde;
    worksheet.getCell('A4').value = 'HASTA:';
    worksheet.getCell('B4').value = data.hasta;
    worksheet.getCell('A5').value = 'FECHA:';
    worksheet.getCell('B5').value = moment().format('DD/MM/YYYY');
    worksheet.columns = [
      { key: 'A', width: 8 },
      { key: 'B', width: 12 },
      { key: 'C', width: 15 },
      { key: 'D', width: 40 },
      { key: 'E', width: 12 },
      { key: 'F', width: 12 },
      { key: 'G', width: 8 },
      { key: 'H', width: 15 },
      { key: 'I', width: 15 },
      { key: 'J', width: 15 },
      { key: 'K', width: 25 },
      { key: 'L', width: 14 },
      { key: 'M', width: 30 },
      { key: 'N', width: 12 },
      { key: 'O', width: 20 },
    ];

    worksheet.getCell('A7').value = 'Período';
    worksheet.getCell('B7').value = 'Fecha';
    worksheet.getCell('C7').value = 'Rif Proveedor';
    worksheet.getCell('D7').value = 'Nombre Proveedor';
    worksheet.getCell('E7').value = 'N° Factura';
    worksheet.getCell('F7').value = 'N° Control';
    worksheet.getCell('G7').value = 'Cód.';
    worksheet.getCell('H7').value = 'Fecha';
    worksheet.getCell('H8').value = 'Comprobante';
    worksheet.getCell('I7').value = 'N°';
    worksheet.getCell('I8').value = 'Comprobante';
    worksheet.getCell('J7').value = 'Monto';
    worksheet.getCell('J8').value = 'Abonado';
    worksheet.getCell('K7').value = 'Cantidad Objeto';
    worksheet.getCell('K8').value = 'Retención';
    worksheet.getCell('L7').value = '% Retención';
    worksheet.getCell('M7').value = 'Concepto ISLR';
    worksheet.getCell('N7').value = 'Sustraendo';
    worksheet.getCell('O7').value = 'Impuesto Retenido';
    worksheet.getCell('O8').value = 'Menos Sustraendo';

    worksheet.getRow(7).alignment = { horizontal: 'center' };
    worksheet.getRow(8).alignment = { horizontal: 'center' };
  }

  async generateCustomerInformation(worksheet, detalles, detalles2) {
    var i = 10;
    for (var item = 0; item < detalles.length; item++) {
      worksheet.getCell('A' + i).value = utils.parseFloatN(moment(detalles[item].fecha_comprobante).format('YYYY') +
        moment(detalles[item].fecha_comprobante).format('MM'));
      worksheet.getCell('B' + i).value = moment(detalles[item]['retenciones.compras.fecha_registro']).format('DD/MM/YYYY');
      worksheet.getCell('C' + i).value = detalles[item]['retenciones.proveedores.rif_proveedor'];
      worksheet.getCell('D' + i).value = detalles[item]['retenciones.proveedores.nb_proveedor'];
      worksheet.getCell('E' + i).value = detalles[item]['retenciones.compras.nro_documento'];
      worksheet.getCell('F' + i).value = detalles[item]['retenciones.nro_factura'];
      worksheet.getCell('G' + i).value = detalles[item].cod_seniat;
      worksheet.getCell('H' + i).value = moment(detalles[item]['retenciones.fecha_factura']).format('DD/MM/YYYY');
      worksheet.getCell('I' + i).value = utils.parseFloatN(detalles[item].nro_comprobante);
      worksheet.getCell('J' + i).value = parseFloat(detalles[item]['retenciones.compras.total_documento']);
      let monto_base = detalles[item].monto_base;
      if (detalles[item]['retenciones.compras.tipo_documento'] == 'NC')
        monto_base = monto_base * -1;
      worksheet.getCell('K' + i).value = parseFloat(monto_base);
      worksheet.getCell('L' + i).value = detalles[item].porc_retencion + '%';
      worksheet.getCell('M' + i).value = detalles[item].nb_tipo_retencion;
      worksheet.getCell('N' + i).value = parseFloat(detalles[item].sustraendo);
      let monto_total =
        detalles[item].monto_base *
          (detalles[item].porc_retencion) / 100 -
        detalles[item].sustraendo;
      if (detalles[item]['retenciones.compras.tipo_documento'] == 'NC')
        monto_total = monto_total * -1;  
      worksheet.getCell('O' + i).value = parseFloat(monto_total.toFixed(2));
      i++;
    }

    i++;

    // Totales Finales
    worksheet.getCell('I' + i).value = 'Totales:';
    worksheet.getCell('J' + i).value = {
      formula: `SUM(J10:J${i - 1})`,
    };
    worksheet.getCell('K' + i).value = {
      formula: `SUM(K10:K${i - 1})`,
    };
    worksheet.getCell('O' + i).value = {
      formula: `SUM(O10:O${i - 1})`,
    };

    worksheet.getCell('I' + i).font = { bold: true };
    worksheet.getCell('J' + i).font = { bold: true };
    worksheet.getCell('K' + i).font = { bold: true };
    worksheet.getCell('O' + i).font = { bold: true };

    // Agregar encabezados de la tabla resumen al Excel
    i += 4;
    worksheet.getCell('J' + i).value = 'Total Base';
    worksheet.getCell('K' + i).value = 'Cantidad Objeto Retención';
    worksheet.getCell('L' + i).value = 'Cant. Facturas';
    worksheet.getCell('M' + i).value = 'Imp. Ret. Menos Sust.';
    worksheet.getCell('N' + i).value = 'Sustraendo';
    worksheet.getRow(i).font = { bold: true };

    // Agregar los datos de detalles2
    let total_total = 0;
    let total_retencion = 0;
    for (var item2 = 0; item2 < detalles2.length; item2++) {
      let rowIdx = i + 1 + item2;
      worksheet.getCell('J' + rowIdx).value =
        'Total Base ' + parseInt(detalles2[item2].porc_retencion) + '%';
      worksheet.getCell('K' + rowIdx).value = parseFloat(detalles2[item2].monto_base);
      worksheet.getCell('L' + rowIdx).value = parseFloat(detalles2[item2].cantidad);
      let monto_total =
        detalles2[item2].monto_base *
          detalles2[item2].porc_retencion / 100 - 
        (detalles2[item2].sustraendo * detalles2[item2].cantidad);
      worksheet.getCell('M' + rowIdx).value = parseFloat(monto_total.toFixed(2));
      worksheet.getCell('N' + rowIdx).value = parseFloat(detalles2[item2].sustraendo);
      total_total += monto_total;
      total_retencion += detalles2[item2].monto_base * detalles2[item2].porc_retencion / 100;
    }

    // Agregar totales al final de la tabla resumen
    let resumenEnd = i + detalles2.length;
    let resumenRow = resumenEnd + 4;
    worksheet.getCell('M' + resumenRow).value = 'Total Retenido:';
    worksheet.getCell('N' + resumenRow).value = parseFloat(total_total.toFixed(2));
    worksheet.getCell('M' + (resumenRow + 1)).value = 'Neto a Pagar:';
    worksheet.getCell('N' + (resumenRow + 1)).value = {
      formula: `SUM(J10:J${i - 6})-SUM(O10:O${i - 6})`,
    };
    worksheet.getCell('M' + resumenRow).font = { bold: true };
    worksheet.getCell('M' + (resumenRow + 1)).font = { bold: true };
    worksheet.getCell('N' + resumenRow).font = { bold: true };
    worksheet.getCell('N' + (resumenRow + 1)).font = { bold: true };
  }
}

module.exports = RetencionesIslrService;
