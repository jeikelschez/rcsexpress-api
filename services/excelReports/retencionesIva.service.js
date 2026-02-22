const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

const porcIva = '(SELECT valor from variable_control WHERE id = 1)';

class RetencionesIvaService {
  async mainReport(worksheet, data) {
    let detalles = [];
    let order = [];
    let where = {};
    data = JSON.parse(data);

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
    order = [['nro_comprobante_iva', 'ASC']];

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

    await this.generateHeader(worksheet, detalles);
    await this.generateCustomerInformation(worksheet, detalles);
    return true;
  }

  async generateHeader(worksheet, detalles) {
    worksheet.getCell('A2').value = 'RESUMEN DE RETENCIONES IVA';
    worksheet.getCell('A3').value = 'DESDE:';
    worksheet.getCell('B3').value = detalles.desde;
    worksheet.getCell('A4').value = 'HASTA:';
    worksheet.getCell('B4').value = detalles.hasta;
    worksheet.getCell('A5').value = 'FECHA:';
    worksheet.getCell('B5').value = moment().format('DD/MM/YYYY');
    worksheet.columns = [
      { key: 'A', width: 8 },
      { key: 'B', width: 15 },
      { key: 'C', width: 15 },
      { key: 'D', width: 40 },
      { key: 'E', width: 12 },
      { key: 'F', width: 12 },
      { key: 'G', width: 15 },
      { key: 'H', width: 15 },
      { key: 'I', width: 15 },
      { key: 'J', width: 15 },
      { key: 'K', width: 10 },
      { key: 'L', width: 18 },
      { key: 'M', width: 14 },
      { key: 'N', width: 10 },
    ];

    worksheet.getCell('A7').value = 'Período';
    worksheet.getCell('B7').value = 'Fecha Factura';
    worksheet.getCell('C7').value = 'Rif Proveedor';
    worksheet.getCell('D7').value = 'Nombre Proveedor';
    worksheet.getCell('E7').value = 'N° Factura';
    worksheet.getCell('F7').value = 'N° Control';
    worksheet.getCell('G7').value = 'Total Compras';
    worksheet.getCell('G8').value = 'con IVA';
    worksheet.getCell('H7').value = 'Compras S/D ';
    worksheet.getCell('H8').value = 'a Crédito';
    worksheet.getCell('I7').value = 'Base Imponible';
    worksheet.getCell('J7').value = 'IVA Retenido';
    worksheet.getCell('K7').value = '% Alic.';
    worksheet.getCell('L7').value = 'Número de';
    worksheet.getCell('L8').value = 'Comprobante';
    worksheet.getCell('M7').value = 'Fecha';
    worksheet.getCell('M8').value = 'Comprobante';
    worksheet.getCell('N7').value = '% IVA';

    worksheet.getRow(7).alignment = { horizontal: 'center' };
    worksheet.getRow(8).alignment = { horizontal: 'center' };
  }

  async generateCustomerInformation(worksheet, detalles) {
    let i = 10;
    for (let item = 0; item < detalles.length; item++) {
      worksheet.getCell('A' + i).value = utils.parseFloatN(moment(detalles[item].fecha_registro).format('YYYY') + moment(detalles[item].fecha_registro).format('MM'));
      worksheet.getCell('B' + i).value = moment(detalles[item].fecha_registro).format('DD/MM/YYYY');
      worksheet.getCell('C' + i).value = detalles[item]['proveedores.rif_proveedor'];
      worksheet.getCell('D' + i).value = utils.truncate(detalles[item]['proveedores.nb_proveedor'], 45);
      worksheet.getCell('E' + i).value = detalles[item].nro_documento;
      worksheet.getCell('F' + i).value = detalles[item].nro_ctrl_doc;
      worksheet.getCell('G' + i).value = parseFloat(detalles[item].total_documento);
      worksheet.getCell('H' + i).value = parseFloat(detalles[item].monto_exento); 
      worksheet.getCell('I' + i).value = parseFloat(detalles[item].monto_base_nacional);
      worksheet.getCell('J' + i).value = parseFloat(detalles[item].saldo_retenido);
      worksheet.getCell('K' + i).value = detalles[item].porcentaje_retencion + '%';
      worksheet.getCell('L' + i).value = detalles[item].nro_comprobante_iva;
      worksheet.getCell('M' + i).value = moment(detalles[item].fecha_comprobante).format('DD/MM/YYYY');
      worksheet.getCell('N' + i).value = detalles[item].iva ? detalles[item].iva : 0;
      i++;
    }

    // Totales
    worksheet.getCell('F' + i).value = 'Totales:';
    worksheet.getCell('G' + i).value = { formula: `SUM(G10:G${i - 1})` };
    worksheet.getCell('H' + i).value = { formula: `SUM(H10:H${i - 1})` };
    worksheet.getCell('I' + i).value = { formula: `SUM(I10:I${i - 1})` };
    worksheet.getCell('J' + i).value = { formula: `SUM(J10:J${i - 1})` };
    worksheet.getCell('F' + i).font = { bold: true };
    worksheet.getCell('G' + i).font = { bold: true };
    worksheet.getCell('H' + i).font = { bold: true };
    worksheet.getCell('I' + i).font = { bold: true };
    worksheet.getCell('J' + i).font = { bold: true };
  }
}

module.exports = RetencionesIvaService;
