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
const clienteOrigRif =
  '(CASE WHEN (id_clte_part_orig IS NULL || id_clte_part_orig = "")' +
  ' THEN (SELECT rif_cedula' +
  ' FROM clientes ' +
  ' WHERE `Mmovimientos`.cod_cliente_org = clientes.id)' +
  ' ELSE (SELECT rif_ci' +
  ' FROM clientes_particulares' +
  ' WHERE `Mmovimientos`.id_clte_part_orig = clientes_particulares.id)' +
  ' END)';
const valorDolar =
  '(SELECT valor FROM historico_dolar ' +
  ' WHERE historico_dolar.fecha = `Mmovimientos`.fecha_emision)';

class ReporteIgtfService {
  async mainReport(doc, data) {
    data = JSON.parse(data);

    let where = {
      fecha_comp_igtf: {
        [Sequelize.Op.between]: [
          moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
          moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
        ],
      },
    };

    if (data.agencia) where.cod_agencia = data.agencia;
    if (data.cliente) where.cod_cliente_org = data.cliente;

    let detalles = await models.Mmovimientos.findAll({
      where: where,
      attributes: [
        'id',
        'cod_cliente_org',
        'nro_comp_igtf',
        'periodo_igtf',
        'fecha_comp_igtf',
        'fecha_emision',
        't_de_documento',
        'nro_control',
        'nro_control_new',
        'nro_documento',
        'serie_documento',
        'monto_total',
        'monto_divisas_igtf',
        [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
        [Sequelize.literal(clienteOrigRif), 'cliente_orig_rif'],
        [Sequelize.literal(valorDolar), 'valor_dolar'],
      ],
      order: [
        ['fecha_emision', 'ASC'],
        ['nro_comp_igtf', 'ASC'],
      ],
      raw: true,
    });

    if (detalles.length == 0) return false;

    await this.generateHeader(doc, data);
    await this.generateCustomerInformation(doc, data, detalles);
    return true;
  }

  async generateHeader(doc, data) {
    doc.image('./img/logo_rc.png', 35, 25, { width: 60 });
    doc.fontSize(8);
    doc.text('RCS EXPRESS, S.A', 35, 120);
    doc.text('RIF. J-31028463-6', 35, 130);
    doc.font('Helvetica-Bold');
    doc.fillColor('#444444');

    doc.fontSize(16);

    doc.y = 70;
    doc.x = 200;
    doc.text('Reporte de Percepción de IGTF (3%)', {
      align: 'center',
      columns: 1,
      width: 400,
    });

    doc.fontSize(12);
    doc.y = 95;
    doc.x = 290;
    doc.text('Desde: ' + data.fecha_desde, {
      align: 'left',
      columns: 1,
      width: 300,
    });
    doc.y = 95;
    doc.x = 407;
    doc.text('Hasta: ' + data.fecha_hasta, {
      align: 'left',
      columns: 1,
      width: 300,
    });
    doc.y = 110;
    doc.x = 200;
    doc.text('Período: ' + data.periodo, {
      align: 'center',
      columns: 1,
      width: 400,
    });

    doc.fontSize(9);
    doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 680, 35);

    doc.fontSize(8);
    doc.text('#', 30, 170);
    doc.text('Cliente', 90, 170);
    doc.text('Rif', 195, 170);
    doc.text('Nº Factura', 230, 170);
    doc.text('Nº Control', 280, 170);
    doc.text('Fecha', 334, 160);
    doc.text('Emisión', 330, 170);
    doc.text('Monto Total', 371, 160);
    doc.text('Factura', 378, 170);
    doc.text('F. Emisión', 427, 160);
    doc.text('Comp.', 435, 170);
    doc.text('Nº Comp.', 485, 160);
    doc.text('IGTF', 493, 170);
    doc.text('Monto', 540, 160);
    doc.text('Cobrado $', 533, 170);
    doc.text('Tasa', 589, 160);
    doc.text('BCV', 590, 170);
    doc.text('Conversión', 620, 160);
    doc.text('a Bs', 634, 170);
    doc.text('Alícuota', 675, 170);
    doc.text('IGTF Perc.', 720, 160);
    doc.text('Bs', 735, 170);
  }

  async generateCustomerInformation(doc, data, detalles) {
    var i = 0;
    var page = 0;
    var ymin;
    ymin = 190;

    let total_cobrado = 0;
    let total_bs = 0;

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
      doc.x = 35;
      doc.text(utils.truncate(detalles[item].cliente_orig_desc, 80), {
        align: 'center',
        columns: 1,
        width: 140,
      });
      doc.y = ymin + i;
      doc.x = 175;
      doc.text(detalles[item].cliente_orig_rif, {
        align: 'center',
        columns: 1,
        width: 50,
      });

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
      doc.x = 226;
      doc.text(nro_factura, {
        align: 'center',
        columns: 1,
        width: 50,
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
      doc.x = 280;
      doc.text(nro_control, {
        align: 'center',
        columns: 1,
        width: 40,
      });

      doc.y = ymin + i;
      doc.x = 327;
      doc.text(moment(detalles[item].fecha_emision).format('DD/MM/YYYY'), {
        align: 'center',
        columns: 1,
        width: 40,
      });
      doc.y = ymin + i;
      doc.x = 355;
      doc.text(utils.formatNumber(detalles[item].monto_total), {
        align: 'right',
        columns: 1,
        width: 60,
      });
      doc.y = ymin + i;
      doc.x = 423;
      doc.text(moment(detalles[item].fecha_comp_igtf).format('DD/MM/YYYY'), {
        align: 'center',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 473;
      doc.text(detalles[item].nro_comp_igtf, {
        align: 'center',
        columns: 1,
        width: 60,
      });

      total_cobrado += utils.parseFloatN(detalles[item].monto_divisas_igtf);
      doc.y = ymin + i;
      doc.x = 510;
      doc.text(utils.formatNumber(detalles[item].monto_divisas_igtf), {
        align: 'right',
        columns: 1,
        width: 60,
      });

      doc.y = ymin + i;
      doc.x = 570;
      doc.text(utils.formatNumber(detalles[item].valor_dolar), {
        align: 'right',
        columns: 1,
        width: 40,
      });

      let monto_bs =
        utils.parseFloatN(detalles[item].valor_dolar) *
        utils.parseFloatN(detalles[item].monto_divisas_igtf);
      total_bs += utils.parseFloatN(monto_bs);
      doc.y = ymin + i;
      doc.x = 603;
      doc.text(utils.formatNumber(monto_bs), {
        align: 'right',
        columns: 1,
        width: 60,
      });

      doc.y = ymin + i;
      doc.x = 683;
      doc.text('3%', {
        align: 'center',
        columns: 1,
        width: 20,
      });

      doc.y = ymin + i;
      doc.x = 715;
      doc.text(utils.formatNumber(monto_bs * 0.03), {
        align: 'center',
        columns: 1,
        width: 60,
      });

      i += 20;
      if (i >= 400) {
        doc.fontSize(9);
        doc.addPage();
        page = page + 1;
        doc.switchToPage(page);
        i = 0;
        await this.generateHeader(doc, data);
      }
    }

    // Totales Finales
    doc.font('Helvetica-Bold');
    doc.y = ymin + i;
    doc.x = 470;
    doc.text('Totales:', {
      align: 'right',
      columns: 1,
      width: 50,
    });
    doc.y = ymin + i;
    doc.x = 510;
    doc.text(utils.formatNumber(total_cobrado), {
      align: 'right',
      columns: 1,
      width: 60,
    });
    doc.y = ymin + i;
    doc.x = 603;
    doc.text(utils.formatNumber(total_bs), {
      align: 'right',
      columns: 1,
      width: 60,
    });
    doc.y = ymin + i;
    doc.x = 715;
    doc.text(utils.formatNumber(total_bs * 0.03), {
      align: 'center',
      columns: 1,
      width: 60,
    });

    var end;
    const range = doc.bufferedPageRange();
    for (
      i = range.start, end = range.start + range.count, range.start <= end;
      i < end;
      i++
    ) {
      doc.switchToPage(i);
      doc.fillColor('#444444');
      doc.x = 655;
      doc.y = 50;
      doc.text(`Pagina ${i + 1} de ${range.count}`, {
        align: 'right',
        columns: 1,
        width: 100,
      });
    }
  }
}

module.exports = ReporteIgtfService;
