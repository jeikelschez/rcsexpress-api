const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

class LibroComprasService {
  async mainReport(worksheet, agencia, proveedor, desde, hasta, detalle) {
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
    await this.generateHeader(worksheet, desde, hasta, detalles);
    await this.generateCustomerInformation(worksheet, detalles);
    return true;
  }

  async generateHeader(worksheet, desde, hasta, detalles) {
    worksheet.getCell('A1').value = 'RCS EXPRESS, S.A';
    worksheet.mergeCells('A1:B1');
    worksheet.getCell('A2').value = 'RIF. J-31028463-6';
    worksheet.mergeCells('A2:B2');
    worksheet.getCell('J1').value = 'FECHA:';
    worksheet.getCell('K1').value = moment().format('DD/MM/YYYY');

    worksheet.getCell('D3').value = detalles.proveedor
      ? 'LIBRO DE COMPRAS POR PROVEEDOR'
      : 'LIBRO DE COMPRAS';
    worksheet.mergeCells('D3:J3');
    worksheet.getRow(3).alignment = { horizontal: 'center' };
    worksheet.getCell('A4').value = 'DESDE:';
    worksheet.getCell('B4').value = desde;
    worksheet.getCell('A5').value = 'HASTA:';
    worksheet.getCell('B5').value = hasta;
    worksheet.getCell('A6').value = 'DETALLES:';
    worksheet.getCell('B6').value = detalles.detalle;
    worksheet.mergeCells('B6:D6');

    worksheet.columns = [
      { key: 'A', width: 11 },
      { key: 'B', width: 11 },
      { key: 'C', width: 13 },
      { key: 'D', width: 60 },
      { key: 'E', width: 7 },
      { key: 'F', width: 12 },
      { key: 'G', width: 10 },
      { key: 'H', width: 13 },
      { key: 'I', width: 13 },
      { key: 'J', width: 15 },
      { key: 'K', width: 12 },
      { key: 'L', width: 12 },
      { key: 'M', width: 10 },
      { key: 'N', width: 12 },
      { key: 'O', width: 15 },
      { key: 'P', width: 15 },
      { key: 'Q', width: 12 },
      { key: 'R', width: 15 },
      { key: 'S', width: 15 },
      { key: 'T', width: 15 },
      { key: 'U', width: 10 },
      { key: 'V', width: 10 },
      { key: 'W', width: 14 },
      { key: 'X', width: 16 },
      { key: 'Y', width: 15 },
      { key: 'Z', width: 15 },
      { key: 'AA', width: 15 },
    ];

    worksheet.getCell('A9').value = 'Op. Nº';
    worksheet.getCell('B8').value = 'Fecha';
    worksheet.getCell('B9').value = 'Factura';
    worksheet.getCell('C9').value = 'Rif';
    worksheet.getCell('D9').value = 'Nombre o Razón Social del Proveedor';
    worksheet.getCell('E8').value = 'Tipo';
    worksheet.getCell('E9').value = 'Prov.';
    worksheet.getCell('F9').value = 'N° de Comp.';
    worksheet.getCell('G8').value = 'Num. Plan.';
    worksheet.getCell('G9').value = 'Import.';
    worksheet.getCell('H8').value = 'Num. Exped.';
    worksheet.getCell('H9').value = 'Import.';
    worksheet.getCell('I8').value = 'Número';
    worksheet.getCell('I9').value = 'Factura';
    worksheet.getCell('J8').value = 'Número';
    worksheet.getCell('J9').value = 'Control de Doc.';
    worksheet.getCell('K8').value = 'N° Nota';
    worksheet.getCell('K9').value = 'Débito';
    worksheet.getCell('L8').value = 'N° Nota';
    worksheet.getCell('L9').value = 'Débito';
    worksheet.getCell('M8').value = 'Tipo de';
    worksheet.getCell('M9').value = 'Trans.';
    worksheet.getCell('N8').value = 'N° de Fact.';
    worksheet.getCell('N9').value = 'Afectada';
    worksheet.getCell('O8').value = 'Total';
    worksheet.getCell('O9').value = 'Compras con IVA';
    worksheet.getCell('P8').value = 'Compras sin';
    worksheet.getCell('P9').value = 'derecho a IVA';
    worksheet.getCell('Q7').value = 'Importaciones';
    worksheet.mergeCells('Q7:S7');
    worksheet.getCell('Q8').value = 'Base';
    worksheet.getCell('Q9').value = 'Imponible';
    worksheet.getCell('R8').value = '%';
    worksheet.getCell('R9').value = 'Alic.';
    worksheet.getCell('S8').value = 'Imp.';
    worksheet.getCell('S9').value = 'IVA.';
    worksheet.getCell('T7').value = 'Internas';
    worksheet.mergeCells('T7:V7');
    worksheet.getCell('T8').value = 'Base';
    worksheet.getCell('T9').value = 'Imponible';
    worksheet.getCell('U8').value = '%';
    worksheet.getCell('U9').value = 'Alic.';
    worksheet.getCell('V8').value = 'Imp.';
    worksheet.getCell('V9').value = 'IVA.';
    worksheet.getCell('W8').value = 'Fecha Comp.';
    worksheet.getCell('W9').value = 'Retenc.';
    worksheet.getCell('X9').value = 'N° Comprobante';
    worksheet.getCell('Y9').value = 'IVA Ret. Vend.';
    worksheet.getCell('Z9').value = 'IVA Ret. Terc.';
    worksheet.getCell('AA9').value = 'Ant. IVA Import.';

    worksheet.getRow(7).alignment = { horizontal: 'center' };
    worksheet.getRow(8).alignment = { horizontal: 'center' };
    worksheet.getRow(9).alignment = { horizontal: 'center' };
  }

  async generateCustomerInformation(worksheet, detalles) {
    var i = 10;
    let total_documento = 0;
    let total_exento = 0;
    let total_base_imp = 0;
    let total_imp_imp = 0;
    let total_base_nac = 0;
    let total_imp_nac = 0;
    let total_retenido = 0;
    for (var item = 0; item < detalles.length; item++) {
      worksheet.getCell('A' + i).value = item + 1;
      worksheet.getCell('B' + i).value = moment(
        detalles[item].fecha_registro
      ).format('DD/MM/YYYY');
      worksheet.getCell('C' + i).value =
        detalles[item]['proveedores.rif_proveedor'];
      worksheet.getCell('D' + i).value =
        detalles[item]['proveedores.nb_proveedor'];
      worksheet.getCell('E' + i).value =
        'P' + detalles[item]['proveedores.tipo_persona'];
      worksheet.getCell('I' + i).value =
        detalles[item].tipo_documento == 'FA'
          ? detalles[item].nro_documento
          : '';
      worksheet.getCell('J' + i).value =
        detalles[item].tipo_documento == 'FA'
          ? detalles[item].nro_ctrl_doc
            ? detalles[item].nro_ctrl_doc
            : detalles[item].nro_documento
          : '';
      worksheet.getCell('K' + i).value =
        detalles[item].tipo_documento == 'ND'
          ? detalles[item].nro_documento
          : '';
      worksheet.getCell('L' + i).value =
        detalles[item].tipo_documento == 'NC'
          ? detalles[item].nro_documento
          : '';
      worksheet.getCell('M' + i).value = '01-Reg';
      worksheet.getCell('N' + i).value = detalles[item].nro_doc_afectado;

      total_documento += utils.parseFloatN(detalles[item].total_documento);
      total_exento += utils.parseFloatN(detalles[item].monto_exento);
      total_retenido += utils.parseFloatN(detalles[item].saldo_retenido);

      worksheet.getCell('O' + i).value = parseFloat(
        detalles[item].total_documento
      );
      worksheet.getCell('P' + i).value = parseFloat(
        detalles[item].monto_exento
      );

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

        worksheet.getCell('Q' + i).value = parseFloat(base_imp);
        worksheet.getCell('R' + i).value = parseFloat(
          (
            (detalles[item].monto_imp_intern * 100) /
            detalles[item].monto_base_intern
          ).toFixed(0)
        );
        worksheet.getCell('S' + i).value = parseFloat(imp_imp);
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

      worksheet.getCell('T' + i).value = parseFloat(base_nac);
      if (detalles[item].monto_base_nacional > 0) {
        worksheet.getCell('U' + i).value = parseFloat(
          (
            (detalles[item].monto_imp_nacional * 100) /
            detalles[item].monto_base_nacional
          ).toFixed(0)
        );
      }
      worksheet.getCell('V' + i).value = parseFloat(imp_nac);
      worksheet.getCell('W' + i).value = detalles[item].fecha_comprobante
        ? moment(detalles[item].fecha_comprobante).format('DD/MM/YYYY')
        : '';
      worksheet.getCell('X' + i).value = detalles[item].nro_comprobante_iva;
      worksheet.getCell('Y' + i).value = detalles[item].saldo_retenido
        ? parseFloat(detalles[item].saldo_retenido)
        : '';
      worksheet.getCell('Z' + i).value = parseFloat(0);
      worksheet.getCell('AA' + i).value = parseFloat(0);
      i++;
    }

    i = detalles.length + 11;
    worksheet.getCell('M' + i).value = 'Total General:';
    worksheet.getCell('O' + i).value = parseFloat(total_documento);
    worksheet.getCell('P' + i).value = parseFloat(total_exento);

    if (total_base_imp > 0) {
      worksheet.getCell('Q' + i).value = parseFloat(total_base_imp);
      worksheet.getCell('S' + i).value = parseFloat(total_imp_imp);
    }

    worksheet.getCell('T' + i).value = parseFloat(total_base_nac);
    worksheet.getCell('V' + i).value = parseFloat(total_imp_nac);
    worksheet.getCell('Y' + i).value = parseFloat(total_retenido);
    worksheet.getCell('Z' + i).value = parseFloat(0);
    worksheet.getCell('AA' + i).value = parseFloat(0);

    if (!detalles.proveedor) {
      i += 5;
      worksheet.getRow(i).alignment = { horizontal: 'center' };
      worksheet.getRow(i - 1).alignment = { horizontal: 'center' };
      worksheet.getCell('R' + i).value = 'Base Imponible';
      worksheet.getCell('S' + i).value = 'Crédito Fiscal';
      worksheet.getCell('T' + (i - 1)).value = 'IVA Retenido';
      worksheet.getCell('T' + i).value = '(a terceros)';

      i++;

      worksheet.getCell('M' + i).value =
        'Compras Exentas y/o sin derecho a crédito fiscal';
      worksheet.mergeCells('M' + i + ':Q' + i);
      worksheet.getCell('R' + i).value = parseFloat(total_exento);
      worksheet.getCell('S' + i).value = parseFloat(0);
      worksheet.getCell('T' + i).value = parseFloat(0);
      i++;
      worksheet.getCell('M' + i).value =
        'Compras Importación Afectas solo Alicuota General';
      worksheet.mergeCells('M' + i + ':Q' + i);
      worksheet.getCell('R' + i).value = parseFloat(total_base_imp);
      worksheet.getCell('S' + i).value = parseFloat(total_imp_imp);
      worksheet.getCell('T' + i).value = parseFloat(0);
      i++;
      worksheet.getCell('M' + i).value =
        'Compras Importación Afectas en Alicuota General + Adicional';
      worksheet.mergeCells('M' + i + ':Q' + i);
      worksheet.getCell('R' + i).value = parseFloat(0);
      worksheet.getCell('S' + i).value = parseFloat(0);
      worksheet.getCell('T' + i).value = parseFloat(0);
      i++;
      worksheet.getCell('M' + i).value =
        'Compras Importación Afectas en Alicuota Reducida';
      worksheet.mergeCells('M' + i + ':Q' + i);
      worksheet.getCell('R' + i).value = parseFloat(0);
      worksheet.getCell('S' + i).value = parseFloat(0);
      worksheet.getCell('T' + i).value = parseFloat(0);
      i++;
      worksheet.getCell('M' + i).value =
        'Compras Internas Afectas solo Alicuota General';
      worksheet.mergeCells('M' + i + ':Q' + i);
      worksheet.getCell('R' + i).value = parseFloat(total_base_nac);
      worksheet.getCell('S' + i).value = parseFloat(total_imp_nac);
      worksheet.getCell('T' + i).value = parseFloat(total_retenido);
      i++;
      worksheet.getCell('M' + i).value =
        'Compras Internas Afectas en Alicuota General + Adicional';
      worksheet.mergeCells('M' + i + ':Q' + i);
      worksheet.getCell('R' + i).value = parseFloat(0);
      worksheet.getCell('S' + i).value = parseFloat(0);
      worksheet.getCell('T' + i).value = parseFloat(0);
      i++;
      worksheet.getCell('M' + i).value =
        'Compras Internas Afectas en Alicuota Reducida';
      worksheet.mergeCells('M' + i + ':Q' + i);
      worksheet.getCell('R' + i).value = parseFloat(0);
      worksheet.getCell('S' + i).value = parseFloat(0);
      worksheet.getCell('T' + i).value = parseFloat(0);
      i++;

      worksheet.getCell('R' + i).value = parseFloat(
        total_exento + total_base_imp + total_base_nac
      );
      worksheet.getCell('S' + i).value = parseFloat(
        total_imp_imp + total_imp_nac
      );
      worksheet.getCell('T' + i).value = parseFloat(total_retenido);
    }
  }
}

module.exports = LibroComprasService;
