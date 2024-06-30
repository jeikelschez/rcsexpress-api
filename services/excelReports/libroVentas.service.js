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
  async mainReport(
    worksheet,
    agencia,
    cliente,
    desde,
    hasta,
    detalle,
    correlativo
  ) {
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
    if (correlativo == 'false') {
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

    await this.generateHeader(worksheet, detalles);
    await this.generateCustomerInformation(worksheet, detalles);
    return true;
  }

  async generateHeader(worksheet, detalles) {
    worksheet.getCell('A1').value = 'RCS EXPRESS, S.A';
    worksheet.mergeCells('A1:B1');
    worksheet.getCell('A2').value = 'RIF. J-31028463-6';
    worksheet.mergeCells('A2:B2');
    worksheet.getCell('J1').value = 'FECHA:';
    worksheet.getCell('K1').value = moment().format('DD/MM/YYYY');

    worksheet.getCell('D3').value = detalles.cliente
      ? 'LIBRO DE VENTAS POR CLIENTE'
      : 'LIBRO DE VENTAS';
    worksheet.mergeCells('D3:J3');
    worksheet.getRow(3).alignment = { horizontal: 'center' };
    worksheet.getCell('A4').value = 'DESDE:';
    worksheet.getCell('B4').value = detalles.desde;
    worksheet.getCell('A5').value = 'HASTA:';
    worksheet.getCell('B5').value = detalles.hasta;
    worksheet.getCell('A6').value = 'DETALLES:';
    worksheet.getCell('B6').value = detalles.detalle;
    worksheet.mergeCells('B6:D6');

    worksheet.columns = [
      { key: 'A', width: 11 },
      { key: 'B', width: 11 },
      { key: 'C', width: 13 },
      { key: 'D', width: 60 },
      { key: 'E', width: 13 },
      { key: 'F', width: 15 },
      { key: 'G', width: 13 },
      { key: 'H', width: 13 },
      { key: 'I', width: 10 },
      { key: 'J', width: 13 },
      { key: 'K', width: 13 },
      { key: 'L', width: 14 },
      { key: 'M', width: 18 },
      { key: 'N', width: 16 },
      { key: 'O', width: 16 },
      { key: 'P', width: 15 },
      { key: 'Q', width: 8 },
      { key: 'R', width: 15 },
      { key: 'S', width: 18 },
      { key: 'T', width: 18 },
    ];

    worksheet.getCell('A9').value = 'Op. Nº';
    worksheet.getCell('B8').value = 'Fecha';
    worksheet.getCell('B9').value = 'Factura';
    worksheet.getCell('C9').value = 'Rif';
    worksheet.getCell('D9').value = 'Nombre o Razón Social del Cliente';
    worksheet.getCell('E8').value = 'Número';
    worksheet.getCell('E9').value = 'Factura';
    worksheet.getCell('F8').value = 'Número';
    worksheet.getCell('F9').value = 'Control de Doc.';
    worksheet.getCell('G8').value = 'N° Nota';
    worksheet.getCell('G9').value = 'Débito';
    worksheet.getCell('H8').value = 'N° Nota';
    worksheet.getCell('H9').value = 'Débito';
    worksheet.getCell('I8').value = 'Tipo de';
    worksheet.getCell('I9').value = 'Trans.';
    worksheet.getCell('J8').value = 'N° de Fact.';
    worksheet.getCell('J9').value = 'Afectada';
    worksheet.getCell('K8').value = 'Fecha Recep.';
    worksheet.getCell('K9').value = 'Comp. Ret.';
    worksheet.getCell('L8').value = 'Fecha Emisión';
    worksheet.getCell('L9').value = 'Comp. Ret.';
    worksheet.getCell('M8').value = 'Número de';
    worksheet.getCell('M9').value = 'Comp. Ret.';
    worksheet.getCell('N8').value = 'Total Ventas';
    worksheet.getCell('N9').value = 'Incluyendo IVA';
    worksheet.getCell('O8').value = 'Ventas Internas';
    worksheet.getCell('O9').value = 'no Gravadas';
    worksheet.getCell('P7').value = 'CONTRIBUYENTE';
    worksheet.mergeCells('P7:R7');
    worksheet.getCell('P8').value = 'Base';
    worksheet.getCell('P9').value = 'Imponible';
    worksheet.getCell('Q8').value = '%';
    worksheet.getCell('Q9').value = 'Alic.';
    worksheet.getCell('R8').value = 'Impuesto';
    worksheet.getCell('R9').value = 'IVA';
    worksheet.getCell('S8').value = 'IVA Retenido';
    worksheet.getCell('S9').value = 'por el Comprador';
    worksheet.getCell('T8').value = 'Franqueo Postal';
    worksheet.getCell('T9').value = 'Obligatorio';

    worksheet.getRow(7).alignment = { horizontal: 'center' };
    worksheet.getRow(8).alignment = { horizontal: 'center' };
    worksheet.getRow(9).alignment = { horizontal: 'center' };
  }

  async generateCustomerInformation(worksheet, detalles) {
    var i = 10;
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

    for (var item = 0; item < detalles.length; item++) {
      worksheet.getCell('A' + i).value = item + 1;
      worksheet.getCell('B' + i).value = moment(
        detalles[item].fecha_emision
      ).format('DD/MM/YYYY');

      let rif_cliente =
        detalles[item].estatus_administra == 'A'
          ? ''
          : detalles[item]['clientes_org.rif_cedula'].substr(1, 1) != '-'
          ? detalles[item]['clientes_org.rif_cedula'].substr(0, 1) +
            '-' +
            detalles[item]['clientes_org.rif_cedula'].substr(1, 18)
          : detalles[item]['clientes_org.rif_cedula'];
      worksheet.getCell('C' + i).value = rif_cliente;
      worksheet.getCell('D' + i).value =
        detalles[item].estatus_administra == 'A'
          ? 'ANULADA'
          : detalles[item].cliente_orig_desc;

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
      worksheet.getCell('E' + i).value = nro_factura;

      let nro_control = '';
      if (detalles[item].nro_control_new) {
        nro_control += detalles[item].nro_control_new.padStart(9, '00-000000');
      } else {
        nro_control += detalles[item].nro_control.padStart(4, '0000');
      }
      if (detalles[item].serie_documento) {
        nro_control += '-' + detalles[item].serie_documento;
      }
      worksheet.getCell('F' + i).value = nro_control;

      let nro_doc = detalles[item].t_de_documento + '-';
      if (detalles[item].nro_control) {
        nro_doc += detalles[item].nro_control.padStart(4, '0000');
      } else {
        nro_doc += detalles[item].nro_documento;
      }
      worksheet.getCell('G' + i).value =
        detalles[item].t_de_documento == 'ND' ? nro_doc : '';
      worksheet.getCell('H' + i).value =
        detalles[item].t_de_documento == 'NC' ? nro_doc : '';
      worksheet.getCell('I' + i).value =
        detalles[item].estatus_administra == 'A' ? '03-Reg' : '01-Reg';

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
      worksheet.getCell('J' + i).value = nro_fact_afectada;

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
      if (monto_impuesto > 0) monto_alicuota = detalles[item].porc_impuesto;
      let monto_fpo =
        detalles[item].estatus_administra != 'A' ? detalles[item].monto_fpo : 0;

      total_venta += utils.parseFloatN(monto_total);
      total_base += utils.parseFloatN(monto_base);
      total_base_imp += utils.parseFloatN(base_imp);
      total_impuesto += utils.parseFloatN(monto_impuesto);
      total_fpo += utils.parseFloatN(monto_fpo);

      worksheet.getCell('N' + i).value = parseFloat(monto_total);
      worksheet.getCell('O' + i).value = parseFloat(monto_base);
      worksheet.getCell('P' + i).value = parseFloat(base_imp);
      worksheet.getCell('Q' + i).value = parseFloat(monto_alicuota.toFixed(1));
      worksheet.getCell('R' + i).value = parseFloat(monto_impuesto);
      worksheet.getCell('S' + i).value = parseFloat(0);
      worksheet.getCell('T' + i).value = monto_fpo ? parseFloat(monto_fpo) : parseFloat(0);      
      i++;
    }

    i = detalles.length + 11;
    worksheet.getCell('M' + i).value = 'TOTALES:';
    worksheet.getCell('N' + i).value = parseFloat(total_venta);
    worksheet.getCell('O' + i).value = parseFloat(total_base);
    worksheet.getCell('P' + i).value = parseFloat(total_base_imp);
    worksheet.getCell('R' + i).value = parseFloat(total_impuesto);
    worksheet.getCell('S' + i).value = parseFloat(0);
    worksheet.getCell('T' + i).value = parseFloat(total_fpo);

    if (!detalles.cliente) {
      i += 5;
      worksheet.getRow(i).alignment = { horizontal: 'center' };
      worksheet.getRow(i - 1).alignment = { horizontal: 'center' };
      worksheet.getCell('N' + i).value = 'Resumen del Periodo';
      worksheet.mergeCells('N' + i + ':Q' + i);
      worksheet.getCell('R' + i).value = 'Base Imponible';
      worksheet.getCell('S' + i).value = 'Débito Fiscal';
      worksheet.getCell('T' + (i - 1)).value = 'IVA Retenido';
      worksheet.getCell('T' + i).value = 'por el Comprador';

      i++;

      worksheet.getCell('N' + i).value =
        'Ventas Internas No Gravadas';
      worksheet.mergeCells('N' + i + ':Q' + i);
      worksheet.getCell('R' + i).value = parseFloat(total_base);
      worksheet.getCell('S' + i).value = parseFloat(0);
      worksheet.getCell('T' + i).value = parseFloat(0);
      i++;
      worksheet.getCell('N' + i).value =
        'Ventas de Exportación';
      worksheet.mergeCells('N' + i + ':Q' + i);
      worksheet.getCell('R' + i).value = parseFloat(0);
      worksheet.getCell('S' + i).value = parseFloat(0);
      worksheet.getCell('T' + i).value = parseFloat(0);
      i++;
      worksheet.getCell('N' + i).value =
        'Ventas Internas Afectas solo Alicuota General';
      worksheet.mergeCells('N' + i + ':Q' + i);
      worksheet.getCell('R' + i).value = parseFloat(0);
      worksheet.getCell('S' + i).value = parseFloat(total_impuesto);
      worksheet.getCell('T' + i).value = parseFloat(0);
      i++;
      worksheet.getCell('N' + i).value =
        'Ventas Internas Afectas en Alicuota General + Adicional';
      worksheet.mergeCells('N' + i + ':Q' + i);
      worksheet.getCell('R' + i).value = parseFloat(0);
      worksheet.getCell('S' + i).value = parseFloat(0);
      worksheet.getCell('T' + i).value = parseFloat(0);
      i++;
      worksheet.getCell('N' + i).value =
        'Ventas Internas Afectas en Alicuota Reducida';
      worksheet.mergeCells('N' + i + ':Q' + i);
      worksheet.getCell('R' + i).value = parseFloat(0);
      worksheet.getCell('S' + i).value = parseFloat(0);
      worksheet.getCell('T' + i).value = parseFloat(0);
      i++;      

      worksheet.getCell('S' + i).value = parseFloat(total_impuesto);
      worksheet.getCell('T' + i).value = parseFloat(0);
    }
  }
}

module.exports = LibroVentasService;
