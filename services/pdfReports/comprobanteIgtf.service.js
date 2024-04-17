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

class ComprobanteIgtfService {
  async mainReport(doc, id) {
    let detalles = await models.Mmovimientos.findAll({
      where: {
        id: id,
      },
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
      raw: true,
    });

    if (detalles.length == 0) return false;

    await this.generateHeader(doc, detalles);
    return true;
  }

  async generateHeader(doc, detalles) {
    doc.image('./img/logo_rc.png', 35, 25, { width: 40 });
    doc.font('Helvetica-Bold');
    doc.fontSize(12);
    doc.text('RCS EXPRESS, S.A', 80, 40);
    doc.text('RIF. J-31028463-6', 80, 55);
    doc.fillColor('#444444');

    doc.y = 140;
    doc.x = 200;
    doc.text('COMPROBANTE DE PERCEPCIÓN DEL I.G.T.F. (3%)', {
      align: 'center',
      columns: 1,
      width: 400,
    });

    doc.font('Helvetica');
    doc.fontSize(8);
    doc.text(
      'Providencia Administrativa Nº SNAT/2022/000013 mediante la cual se',
      35,
      90
    );
    doc.text(
      'designan a los sujetos pasivos especiales como agentes de percepción del',
      35,
      100
    );
    doc.text('impuesto a las Grandes Transacciones Financieras.', 35, 110);

    doc.fontSize(10);
    doc.lineJoin('miter').rect(370, 70, 160, 18).stroke();
    doc.text('Nº de Comprobante', 406, 76);
    doc.lineJoin('miter').rect(370, 88, 160, 18).stroke();
    doc.y = 94;
    doc.x = 370;
    doc.text(detalles[0].nro_comp_igtf, {
      align: 'center',
      columns: 1,
      width: 160,
    });

    doc.lineJoin('miter').rect(570, 70, 110, 18).stroke();
    doc.text('Fecha Emisión', 592, 76);
    doc.lineJoin('miter').rect(570, 88, 110, 18).stroke();
    doc.y = 94;
    doc.x = 570;
    doc.text(moment(detalles[0].fecha_comp_igtf).format('DD/MM/YYYY'), {
      align: 'center',
      columns: 1,
      width: 110,
    });

    doc.fontSize(9);
    doc.lineJoin('miter').rect(60, 180, 180, 25).stroke();
    doc.text('2. NOMBRE O RAZÓN SOCIAL', 86, 185);
    doc.text('DEL AGENTE DE PERCEPCIÓN', 82, 195);
    doc.lineJoin('miter').rect(60, 205, 180, 18).stroke();
    doc.y = 211;
    doc.x = 60;
    doc.text('R.C.S. EXPRESS, S.A.', {
      align: 'center',
      columns: 1,
      width: 180,
    });

    doc.lineJoin('miter').rect(280, 180, 200, 25).stroke();
    doc.text('3. REGISTRO DE INFORMACIÓN FISCAL', 294, 185);
    doc.text('DEL AGENTE DE PERCEPCIÓN', 312, 195);
    doc.lineJoin('miter').rect(280, 205, 200, 18).stroke();
    doc.y = 211;
    doc.x = 280;
    doc.text('J-31028463-6', {
      align: 'center',
      columns: 1,
      width: 200,
    });

    doc.lineJoin('miter').rect(520, 180, 170, 25).stroke();
    doc.text('4. PERIODO FISCAL', 560, 195);
    doc.lineJoin('miter').rect(520, 205, 170, 18).stroke();
    doc.y = 211;
    doc.x = 520;
    doc.text(detalles[0].periodo_igtf, {
      align: 'center',
      columns: 1,
      width: 170,
    });

    doc.lineJoin('miter').rect(60, 245, 420, 18).stroke();
    doc.text('5. DIRECCIÓN FISCAL DEL AGENTE DE PERCEPCIÓN', 155, 250);
    doc.lineJoin('miter').rect(60, 263, 420, 25).stroke();
    doc.y = 267;
    doc.x = 60;
    doc.text(
      'AV. 70 C.C. ARAURIMA, NIVEL P.B. LOCAL Nº6 URBANIZACIÓN TERRAZAS DE CASTILLITO VALENCIA, ESTADO CARABOBO',
      {
        align: 'center',
        columns: 1,
        width: 420,
      }
    );

    doc.lineJoin('miter').rect(60, 310, 180, 25).stroke();
    doc.text('6. NOMBRE O RAZÓN SOCIAL', 88, 315);
    doc.text('DEL SUJETO PERCIBIDO', 95, 325);
    doc.lineJoin('miter').rect(60, 335, 180, 18).stroke();
    doc.y = 341;
    doc.x = 60;
    doc.text(utils.truncate(detalles[0].cliente_orig_desc, 30), {
      align: 'center',
      columns: 1,
      width: 180,
    });

    doc.lineJoin('miter').rect(280, 310, 200, 25).stroke();
    doc.text('7. REGISTRO DE INFORMACIÓN FISCAL', 295, 315);
    doc.text('DEL SUJETO PERCIBIDO', 328, 325);
    doc.lineJoin('miter').rect(280, 335, 200, 18).stroke();
    doc.y = 341;
    doc.x = 280;
    doc.text(utils.truncate(detalles[0].cliente_orig_rif, 30), {
      align: 'center',
      columns: 1,
      width: 200,
    });

    doc.lineJoin('miter').rect(60, 375, 35, 35).stroke();
    doc.text('OPER.', 64, 390);
    doc.lineJoin('miter').rect(60, 410, 35, 18).stroke();
    doc.y = 416;
    doc.x = 60;
    doc.text('1', {
      align: 'center',
      columns: 1,
      width: 35,
    });

    doc.lineJoin('miter').rect(95, 375, 55, 35).stroke();
    doc.text('FECHA', 108, 390);
    doc.lineJoin('miter').rect(95, 410, 55, 18).stroke();
    doc.y = 416;
    doc.x = 95;
    doc.text(moment(detalles[0].fecha_emision).format('DD/MM/YYYY'), {
      align: 'center',
      columns: 1,
      width: 55,
    });

    doc.lineJoin('miter').rect(150, 375, 55, 35).stroke();
    doc.text('Nº DE', 164, 385);
    doc.text('FACTURA', 157, 395);
    doc.lineJoin('miter').rect(150, 410, 55, 18).stroke();
    let nro_factura = '';
    if (detalles[0].t_de_documento == 'FA') {
      nro_factura = 'FC-';
      if (detalles[0].nro_control) {
        nro_factura += detalles[0].nro_control.padStart(4, '0000');
      } else {
        nro_factura += detalles[0].nro_documento;
      }
      if (detalles[0].serie_documento) {
        nro_factura += '-' + detalles[0].serie_documento;
      }
    }
    doc.y = 416;
    doc.x = 150;
    doc.text(nro_factura, {
      align: 'center',
      columns: 1,
      width: 55,
    });

    doc.lineJoin('miter').rect(205, 375, 55, 35).stroke();
    doc.text('Nº DE', 220, 385);
    doc.text('CONTROL', 210, 395);
    doc.lineJoin('miter').rect(205, 410, 55, 18).stroke();
    let nro_control = '';
    if (detalles[0].nro_control_new) {
      nro_control += detalles[0].nro_control_new.padStart(9, '00-000000');
    } else {
      nro_control += detalles[0].nro_control.padStart(4, '0000');
    }
    if (detalles[0].serie_documento) {
      nro_control += '-' + detalles[0].serie_documento;
    }
    doc.y = 416;
    doc.x = 205;
    doc.text(nro_control, {
      align: 'center',
      columns: 1,
      width: 55,
    });

    doc.lineJoin('miter').rect(260, 375, 45, 35).stroke();
    doc.text('TIPO DE', 264, 385);
    doc.text('TRANS.', 266, 395);
    doc.lineJoin('miter').rect(260, 410, 45, 18).stroke();
    doc.y = 416;
    doc.x = 260;
    doc.text('1', {
      align: 'center',
      columns: 1,
      width: 45,
    });

    doc.lineJoin('miter').rect(305, 375, 70, 35).stroke();
    doc.text('MONTO TOTAL', 309, 385);
    doc.text('COBRADO', 317, 395);
    doc.lineJoin('miter').rect(305, 410, 70, 18).stroke();
    doc.y = 416;
    doc.x = 305;
    doc.text(utils.formatNumber(detalles[0].monto_total), {
      align: 'center',
      columns: 1,
      width: 70,
    });

    doc.lineJoin('miter').rect(375, 375, 70, 35).stroke();
    doc.text('MONTO', 394, 380);
    doc.text('COBRADO EN', 379, 390);
    doc.text('BOLIVARES', 385, 400);
    doc.lineJoin('miter').rect(375, 410, 70, 18).stroke();
    let monto_bs =
      utils.parseFloatN(detalles[0].valor_dolar) *
      utils.parseFloatN(detalles[0].monto_divisas_igtf);
    doc.y = 416;
    doc.x = 375;
    doc.text(utils.formatNumber(monto_bs), {
      align: 'center',
      columns: 1,
      width: 70,
    });

    doc.lineJoin('miter').rect(445, 375, 70, 35).stroke();
    doc.text('MONTO', 464, 380);
    doc.text('COBRADO EN', 449, 390);
    doc.text('DIVISAS', 463, 400);
    doc.lineJoin('miter').rect(445, 410, 70, 18).stroke();
    doc.y = 416;
    doc.x = 445;
    doc.text(utils.formatNumber(detalles[0].monto_divisas_igtf), {
      align: 'center',
      columns: 1,
      width: 70,
    });

    doc.lineJoin('miter').rect(515, 375, 50, 35).stroke();
    doc.text('ALICUOTA', 518, 390);
    doc.lineJoin('miter').rect(515, 410, 50, 18).stroke();
    doc.y = 416;
    doc.x = 515;
    doc.text('3%', {
      align: 'center',
      columns: 1,
      width: 50,
    });

    doc.lineJoin('miter').rect(565, 375, 55, 35).stroke();
    doc.text('I.G.T.F.', 580, 380);
    doc.text('PERCIBIDO', 568, 390);
    doc.text('($)', 588, 400);
    doc.lineJoin('miter').rect(565, 410, 55, 18).stroke();
    doc.y = 416;
    doc.x = 565;
    doc.text(
      utils.formatNumber(
        utils.parseFloatN(detalles[0].monto_divisas_igtf) * 0.03
      ),
      {
        align: 'center',
        columns: 1,
        width: 55,
      }
    );

    doc.lineJoin('miter').rect(620, 375, 45, 35).stroke();
    doc.text('TASA', 631, 385);
    doc.text('B.C.V.', 631, 395);
    doc.lineJoin('miter').rect(620, 410, 45, 18).stroke();
    doc.y = 416;
    doc.x = 620;
    doc.text(utils.formatNumber(detalles[0].valor_dolar), {
      align: 'center',
      columns: 1,
      width: 45,
    });

    doc.lineJoin('miter').rect(665, 375, 55, 35).stroke();
    doc.text('I.G.T.F.', 680, 380);
    doc.text('PERCIBIDO', 668, 390);
    doc.text('(BS)', 685, 400);
    doc.lineJoin('miter').rect(665, 410, 55, 18).stroke();
    doc.y = 416;
    doc.x = 665;
    doc.text(
      utils.formatNumber(
        utils.parseFloatN(detalles[0].monto_divisas_igtf) *
          0.03 *
          utils.parseFloatN(detalles[0].valor_dolar)
      ),
      {
        align: 'center',
        columns: 1,
        width: 55,
      }
    );

    doc.font('Helvetica-Bold');
    doc.lineJoin('miter').rect(575, 440, 90, 18).stroke();
    doc.text('TOTAL I.G.T.F.', 590, 446);
    doc.lineJoin('miter').rect(665, 440, 55, 18).stroke();
    doc.y = 446;
    doc.x = 665;
    doc.text(
      utils.formatNumber(
        utils.parseFloatN(detalles[0].monto_divisas_igtf) *
          0.03 *
          utils.parseFloatN(detalles[0].valor_dolar)
      ),
      {
        align: 'center',
        columns: 1,
        width: 55,
      }
    );

    doc.font('Helvetica');
    doc.fontSize(11);
    doc.lineCap('butt').moveTo(150, 530).lineTo(350, 530).stroke();
    doc.text('FIRMA Y SELLO', 212, 540);
    doc.text('AGENTE DE PERCEPCIÓN', 182, 555);
    doc.lineCap('butt').moveTo(430, 530).lineTo(630, 530).stroke();
    doc.text('FIRMA Y SELLO', 492, 540);
    doc.text('SUJETO PERCIBIDO', 480, 555);
  }
}

module.exports = ComprobanteIgtfService;
