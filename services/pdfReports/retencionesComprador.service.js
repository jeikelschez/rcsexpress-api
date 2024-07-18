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

class RetencionesCompradorService {
  async mainReport(doc, data) {
    data = JSON.parse(data);

    let where = {
      fecha_comp_ret_compra: {
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
        'porc_impuesto',
        'monto_impuesto',
        'fecha_comp_ret_compra',
        'fecha_emi_comp_ret_compra',
        'nro_comp_ret_compra',
        'iva_retenido_comprador',
        [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
        [Sequelize.literal(clienteOrigRif), 'cliente_orig_rif'],
        [Sequelize.literal(valorDolar), 'valor_dolar'],
      ],
      order: [
        ['fecha_comp_ret_compra', 'ASC'],
        ['nro_control_new', 'ASC'],
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
    doc.text('Retenciones Generales del Comprador', {
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

    doc.fontSize(9);
    doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 680, 35);

    doc.fontSize(8);
    doc.text('#', 30, 170);
    doc.text('Cliente', 90, 170);
    doc.text('Rif', 195, 170);
    doc.text('Factura', 235, 160);
    doc.text('Afectada', 233, 170);
    doc.text('Nº Control', 280, 170);
    doc.text('Emisión', 330, 170);
    doc.text('Total', 390, 170);
    doc.text('% IVA', 430, 170);
    doc.text('IVA', 480, 170);
    doc.text('F. Rec. Comp.', 510, 170);
    doc.text('F. Emi. Comp.', 575, 170);
    doc.text('Nº Comp. Ret.', 645, 170);
    doc.text('IVA', 730, 160);
    doc.text('Retenido', 720, 170);
  }

  async generateCustomerInformation(doc, data, detalles) {
    var i = 0;
    var page = 0;
    var ymin;
    ymin = 190;

    let total_retenido = 0;

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
      doc.text(
        detalles[item].t_de_documento == 'NC'
          ? utils.formatNumber(detalles[item].monto_total * -1)
          : utils.formatNumber(detalles[item].monto_total),
        {
          align: 'right',
          columns: 1,
          width: 60,
        }
      );
      doc.y = ymin + i;
      doc.x = 418;
      doc.text(detalles[item].porc_impuesto + '%', {
        align: 'center',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 440;
      doc.text(
        detalles[item].t_de_documento == 'NC'
          ? utils.formatNumber(detalles[item].monto_impuesto * -1)
          : utils.formatNumber(detalles[item].monto_impuesto),
        {
          align: 'right',
          columns: 1,
          width: 60,
        }
      );
      doc.y = ymin + i;
      doc.x = 515;
      doc.text(
        moment(detalles[item].fecha_comp_ret_compra).format('DD/MM/YYYY'),
        {
          align: 'center',
          columns: 1,
          width: 40,
        }
      );
      doc.y = ymin + i;
      doc.x = 580;
      doc.text(
        moment(detalles[item].fecha_emi_comp_ret_compra).format('DD/MM/YYYY'),
        {
          align: 'center',
          columns: 1,
          width: 40,
        }
      );
      doc.y = ymin + i;
      doc.x = 635;
      doc.text(detalles[item].nro_comp_ret_compra, {
        align: 'center',
        columns: 1,
        width: 70,
      });

      let retenido =
        detalles[item].t_de_documento == 'NC'
          ? utils.parseFloatN(detalles[item].iva_retenido_comprador) * -1
          : utils.parseFloatN(detalles[item].iva_retenido_comprador);
      total_retenido += retenido;
      doc.y = ymin + i;
      doc.x = 690;
      doc.text(utils.formatNumber(retenido), {
        align: 'right',
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
    doc.x = 500;
    doc.text('Total Retenido Comprador:', {
      align: 'right',
      columns: 1,
      width: 150,
    });
    doc.y = ymin + i;
    doc.x = 690;
    doc.text(utils.formatNumber(total_retenido), {
      align: 'right',
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

module.exports = RetencionesCompradorService;
