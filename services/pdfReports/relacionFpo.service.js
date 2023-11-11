const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

const nroPiezas =
  'SUM(CASE WHEN `Dmovimientos`.`cod_concepto` = 1 THEN `nro_piezas` ELSE 0 END)';
const pesoKgs =
  'SUM(CASE WHEN `Dmovimientos`.`cod_concepto` = 1 THEN `peso_kgs` ELSE 0 END)';
const montoBase =
  'SUM(CASE WHEN `Dmovimientos`.`cod_concepto` IN (1,2,3) THEN `importe_renglon` ELSE 0 END)';
const montoSeguro =
  'SUM(CASE WHEN `Dmovimientos`.`cod_concepto` = 6 THEN `importe_renglon` ELSE 0 END)';
const codFpo =
  '(SELECT `fpo`.`cod_fpo` FROM `fpos` AS `fpo` ' +
  'WHERE `fpo`.`cod_fpo` = `movimientos`.`cod_fpo` ' +
  'AND `fpo`.`f_val` <= `movimientos`.`fecha_emision` ' +
  'AND `fpo`.`f_anul` >= `movimientos`.`fecha_emision`)';
const valorFpo =
  '(SELECT `fpo`.`valor` FROM `fpos` AS `fpo` ' +
  'WHERE `fpo`.`cod_fpo` = `movimientos`.`cod_fpo` ' +
  'AND `fpo`.`f_val` <= `movimientos`.`fecha_emision` ' +
  'AND `fpo`.`f_anul` >= `movimientos`.`fecha_emision`)';
const descFpo =
  '(SELECT `fpo`.`desc_tipo` FROM `fpos` AS `fpo` ' +
  'WHERE `fpo`.`cod_fpo` = `movimientos`.`cod_fpo` ' +
  'AND `fpo`.`f_val` <= `movimientos`.`fecha_emision` ' +
  'AND `fpo`.`f_anul` >= `movimientos`.`fecha_emision`)';
const clienteOrg =
  '(SELECT `clientes`.`nb_cliente` FROM `clientes` AS `clientes` ' +
  'WHERE `clientes`.`id` = `movimientos`.`cod_cliente_org`)';
const escala =
  '(CASE WHEN peso_kgs <= 0.5 THEN "Más de 0 Hasta 0,500" ' +
  'WHEN peso_kgs > 0.5 AND peso_kgs <= 1 THEN "Más de 0,500 Hasta 1000" ' +
  'WHEN peso_kgs > 1 AND peso_kgs <= 2 THEN "Más de 1000 Hasta 2000" ' +
  'WHEN peso_kgs > 2 AND peso_kgs <= 4 THEN "Más de 2000 Hasta 4000" ' +
  'WHEN peso_kgs > 4 AND peso_kgs <= 5 THEN "Más de 4000 Hasta 5000" ' +
  'WHEN peso_kgs > 5 AND peso_kgs <= 10 THEN "Más de 5000 Hasta 10000" ' +
  'WHEN peso_kgs > 10 AND peso_kgs <= 20 THEN "Más de 10000 Hasta 20000" ' +
  'WHEN peso_kgs > 20 AND peso_kgs <= 30 THEN "Más de 20000 Hasta 30000" END)';
const tarifa =
  '(SELECT SUM(dm.importe_renglon) ' +
  'FROM detalle_de_movimientos dm ' +
  'WHERE `Mmovimientos`.id = dm.cod_movimiento ' +
  'AND dm.cod_concepto in (1,2,3,6))';

class RelacionFpoService {
  async mainReport(doc, tipo, data) {
    let detalles = [];
    let where = {};
    data = JSON.parse(data);

    switch (tipo) {
      case 'RG':
      case 'R1':
      case 'R2':
      case 'R3':
      case 'R4':
      case 'R5':
      case 'R6':
      case 'R7':
      case 'R8':
        where = {
          fecha_emision: {
            [Sequelize.Op.between]: [
              moment(data.desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              moment(data.hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            ],
          },
          peso_kgs: {
            [Sequelize.Op.gt]: data.kgs_min,
            [Sequelize.Op.lte]: data.kgs_max,
          },
          estatus_administra: {
            [Sequelize.Op.not]: 'A',
          },
          monto_fpo: {
            [Sequelize.Op.not]: 0,
          },
        };

        if (data.cliente) where.cod_cliente_org = data.cliente;

        detalles = await models.Dmovimientos.findAll({
          attributes: [
            [Sequelize.literal(nroPiezas), 'nro_piezas'],
            [Sequelize.literal(pesoKgs), 'peso_kgs'],
            [Sequelize.literal(montoBase), 'monto_base'],
            [Sequelize.literal(montoSeguro), 'monto_seguro'],
          ],
          include: [
            {
              model: models.Mmovimientos,
              as: 'movimientos',
              where: where,
              attributes: ['fecha_emision', 'nro_documento', 'monto_fpo'],
            },
          ],
          raw: true,
          group: ['movimientos.id'],
        });

        if (detalles.length == 0) return false;

        detalles.desde = data.desde;
        detalles.hasta = data.hasta;
        if (data.nbCliente) detalles.cliente = data.nbCliente;
        break;
      case 'RE':
        where = {
          fecha_emision: {
            [Sequelize.Op.between]: [
              moment(data.desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              moment(data.hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            ],
          },
          peso_kgs: {
            [Sequelize.Op.gt]: data.kgs_min,
            [Sequelize.Op.lte]: data.kgs_max,
          },
          estatus_administra: {
            [Sequelize.Op.not]: 'A',
          },
          monto_fpo: {
            [Sequelize.Op.not]: 0,
          },
        };

        if (data.cliente) where.cod_cliente_org = data.cliente;

        detalles = await models.Dmovimientos.findAll({
          attributes: [
            [Sequelize.literal(nroPiezas), 'nro_piezas'],
            [Sequelize.literal(pesoKgs), 'peso_kgs'],
            [Sequelize.literal(montoBase), 'monto_base'],
            [Sequelize.literal(montoSeguro), 'monto_seguro'],
            [Sequelize.literal(codFpo), 'cod_fpo'],
            [Sequelize.literal(valorFpo), 'valor_fpo'],
            [Sequelize.literal(descFpo), 'desc_fpo'],
          ],
          include: [
            {
              model: models.Mmovimientos,
              as: 'movimientos',
              where: where,
              attributes: [],
            },
          ],
          raw: true,
          group: ['desc_fpo'],
          order: [['cod_fpo', 'ASC']],
        });

        if (detalles.length == 0) return false;

        detalles.desde = data.desde;
        detalles.hasta = data.hasta;
        if (data.nbCliente) detalles.cliente = data.nbCliente;
        break;
      case 'REG':
        where = {
          fecha_emision: {
            [Sequelize.Op.between]: [
              moment(data.desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              moment(data.hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            ],
          },
          peso_kgs: {
            [Sequelize.Op.gt]: data.kgs_min,
            [Sequelize.Op.lte]: data.kgs_max,
          },
          estatus_administra: {
            [Sequelize.Op.not]: 'A',
          },
          monto_fpo: {
            [Sequelize.Op.not]: 0,
          },
        };

        if (data.cliente) where.cod_cliente_org = data.cliente;

        detalles = await models.Dmovimientos.findAll({
          attributes: [
            [Sequelize.literal(nroPiezas), 'nro_piezas'],
            [Sequelize.literal(pesoKgs), 'peso_kgs'],
            [Sequelize.literal(montoBase), 'monto_base'],
            [Sequelize.literal(montoSeguro), 'monto_seguro'],
            [Sequelize.literal(codFpo), 'cod_fpo'],
            [Sequelize.literal(valorFpo), 'valor_fpo'],
            [Sequelize.literal(descFpo), 'desc_fpo'],
            [Sequelize.literal(clienteOrg), 'cliente_orig'],
          ],
          include: [
            {
              model: models.Mmovimientos,
              as: 'movimientos',
              where: where,
              attributes: [],
            },
          ],
          raw: true,
          group: ['cliente_orig', 'desc_fpo'],
          order: [
            ['cliente_orig', 'ASC'],
            ['cod_fpo', 'ASC'],
          ],
        });

        if (detalles.length == 0) return false;

        detalles.desde = data.desde;
        detalles.hasta = data.hasta;
        if (data.nbCliente) detalles.cliente = data.nbCliente;
        break;
      case 'PA':
        where = {
          fecha_emision: {
            [Sequelize.Op.between]: [
              moment(data.desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              moment(data.hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            ],
          },
          peso_kgs: {
            [Sequelize.Op.gt]: data.kgs_min,
            [Sequelize.Op.lte]: data.kgs_max,
          },
          estatus_administra: {
            [Sequelize.Op.not]: 'A',
          },
          monto_fpo: {
            [Sequelize.Op.not]: 0,
          },
        };

        detalles = await models.Mmovimientos.findAll({
          where: where,
          attributes: [
            [Sequelize.literal(escala), 'escala'],
            [Sequelize.literal(tarifa), 'tarifa'],
            'monto_fpo',
            'nro_piezas',
          ],
          raw: true,
          order: [['monto_fpo', 'ASC'], ['peso_kgs', 'ASC']],
        });

        if (detalles.length == 0) return false;

        detalles.desde = data.desde;
        detalles.hasta = data.hasta;
        break;
      default:
        return false;
    }

    if (detalles.length == 0) return false;

    await this.generateHeader(doc, tipo, data, detalles);
    await this.generateCustomerInformation(doc, tipo, data, detalles);
    return true;
  }

  async generateHeader(doc, tipo, data, detalles) {
    switch (tipo) {
      case 'RG':
      case 'R1':
      case 'R2':
      case 'R3':
      case 'R4':
      case 'R5':
      case 'R6':
      case 'R7':
      case 'R8':
        doc.image('./img/logo_rc.png', 35, 25, { width: 50 });
        doc.fontSize(10);
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.text('R.C.S EXPRESS, S.A', 35, 105);
        doc.fontSize(8);
        doc.font('Helvetica');
        doc.text('RIF. J-31028463-6', 35, 117);

        doc.font('Helvetica-Bold');
        doc.fontSize(14);
        doc.y = 60;
        doc.x = 120;
        doc.text('Relación de Pagos IPOSTEL Envíos Nacionales', {
          align: 'center',
          columns: 1,
          width: 400,
        });
        doc.fontSize(10);
        doc.y = 100;
        doc.x = 120;
        doc.text(data.tittle, {
          align: 'center',
          columns: 1,
          width: 400,
        });

        if (detalles.cliente) {
          doc.fontSize(12);
          doc.y = 115;
          doc.x = 120;
          doc.text(detalles.cliente, {
            align: 'center',
            columns: 1,
            width: 400,
          });
        }

        doc.font('Helvetica');
        doc.fontSize(10);
        doc.y = 85;
        doc.x = 230;
        doc.text('Desde: ' + detalles.desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 85;
        doc.x = 327;
        doc.text('Hasta: ' + detalles.hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });

        doc.fontSize(8);
        doc.x = 480;
        doc.y = 30;
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), {
          align: 'right',
          columns: 1,
          width: 100,
        });

        doc.lineWidth(0.5);
        doc.lineCap('butt').moveTo(35, 145).lineTo(580, 145).stroke();
        doc.lineCap('butt').moveTo(35, 160).lineTo(580, 160).stroke();
        doc.text('Fecha Emisión', 40, 150);
        doc.text('Nro. Guía Carga', 110, 150);
        doc.text('Piezas', 185, 150);
        doc.text('Peso', 230, 150);
        doc.text('Monto Base', 270, 150);
        doc.text('Protección Envío', 330, 150);
        doc.text('Total Flete', 415, 150);
        doc.text('Porcentaje', 475, 150);
        doc.text('Monto FPO', 530, 150);
        break;
      case 'RE':
      case 'REG':
        doc.image('./img/logo_rc.png', 35, 25, { width: 50 });
        doc.fontSize(10);
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.text('R.C.S EXPRESS, S.A', 35, 105);
        doc.fontSize(8);
        doc.font('Helvetica');
        doc.text('RIF. J-31028463-6', 35, 117);

        doc.font('Helvetica-Bold');
        doc.fontSize(14);
        doc.y = 60;
        doc.x = 120;
        doc.text('Relación de Pagos IPOSTEL Envíos Nacionales', {
          align: 'center',
          columns: 1,
          width: 400,
        });
        doc.fontSize(10);
        doc.y = 100;
        doc.x = 120;
        doc.text(data.tittle, {
          align: 'center',
          columns: 1,
          width: 400,
        });

        if (detalles.cliente) {
          doc.fontSize(12);
          doc.y = 115;
          doc.x = 120;
          doc.text(detalles.cliente, {
            align: 'center',
            columns: 1,
            width: 400,
          });
        }

        doc.font('Helvetica');
        doc.fontSize(10);
        doc.y = 85;
        doc.x = 230;
        doc.text('Desde: ' + detalles.desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 85;
        doc.x = 327;
        doc.text('Hasta: ' + detalles.hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });

        doc.fontSize(8);
        doc.x = 480;
        doc.y = 30;
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), {
          align: 'right',
          columns: 1,
          width: 100,
        });

        doc.lineWidth(0.5);
        doc.lineCap('butt').moveTo(35, 145).lineTo(580, 145).stroke();
        doc.lineCap('butt').moveTo(35, 160).lineTo(580, 160).stroke();
        doc.text('Rangos', 100, 150);
        doc.text('Peso', 185, 150);
        doc.text('Piezas', 225, 150);
        doc.text('Monto Base', 270, 150);
        doc.text('Protección Envío', 330, 150);
        doc.text('Total Flete', 415, 150);
        doc.text('Porcentaje', 475, 150);
        doc.text('Monto FPO', 530, 150);
        break;
      case 'PA':
        doc.image('./img/cintillo.jpg', 35, 25, { width: 550 });
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(14);
        doc.y = 65;
        doc.x = 115;
        doc.text('PLANILLA DE AUTOLIQUIDACIÓN', {
          align: 'center',
          columns: 1,
          width: 400,
        });

        doc.fontSize(10);
        doc.font('Helvetica');
        doc.y = 110;
        doc.x = 0;
        doc.text('Nombre de la Empresa:', {
          align: 'right',
          columns: 1,
          width: 150,
        });
        doc.y = 135;
        doc.x = 0;
        doc.text('Dirección:', {
          align: 'right',
          columns: 1,
          width: 150,
        });
        doc.y = 160;
        doc.x = 0;
        doc.text('Teléfono:', {
          align: 'right',
          columns: 1,
          width: 150,
        });
        doc.y = 185;
        doc.x = 0;
        doc.text('Franqueo Postal (Lapso):', {
          align: 'right',
          columns: 1,
          width: 150,
        });
        doc.y = 205;
        doc.x = 0;
        doc.text('Monto:', {
          align: 'right',
          columns: 1,
          width: 150,
        });
        doc.y = 205;
        doc.x = 250;
        doc.text('Planilla Depósito:', {
          align: 'right',
          columns: 1,
          width: 150,
        });
        doc.y = 230;
        doc.x = 0;
        doc.text('Banco:', {
          align: 'right',
          columns: 1,
          width: 150,
        });
        doc.y = 230;
        doc.x = 250;
        doc.text('N° Cuenta:', {
          align: 'right',
          columns: 1,
          width: 150,
        });
        doc.y = 255;
        doc.x = 0;
        doc.text('Fecha Depósito:', {
          align: 'right',
          columns: 1,
          width: 150,
        });

        doc.font('Helvetica-Bold');
        doc.y = 110;
        doc.x = 155;
        doc.text('R.C.S. Express, S.A.', {
          align: 'left',
          columns: 1,
          width: 150,
        });
        doc.y = 110;
        doc.x = 535;
        doc.text('C.P. 20-22', {
          align: 'left',
          columns: 1,
          width: 150,
        });
        doc.y = 135;
        doc.x = 155;
        doc.text(
          'Av. 74 C. C. Araurima Nivel PB Local Nº 6 Urb. Terrazas de Castillito San Diego - Edo. Carabobo',
          {
            align: 'left',
            columns: 1,
            width: 340,
          }
        );
        doc.y = 160;
        doc.x = 155;
        doc.text('(0241) 871.7563 / 871.6867', {
          align: 'left',
          columns: 1,
          width: 150,
        });
        doc.y = 185;
        doc.x = 155;
        doc.text('Desde ' + data.desde + ' Hasta ' + data.hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 205;
        doc.x = 155;
        doc.text('81.223,22', {
          align: 'left',
          columns: 1,
          width: 150,
        });
        doc.y = 205;
        doc.x = 405;
        doc.text(data.planilla, {
          align: 'left',
          columns: 1,
          width: 150,
        });
        doc.y = 230;
        doc.x = 155;
        doc.text('Banco de Venezuela', {
          align: 'left',
          columns: 1,
          width: 150,
        });
        doc.y = 230;
        doc.x = 405;
        doc.text('0102-0552-22-0000037769', {
          align: 'left',
          columns: 1,
          width: 150,
        });
        doc.y = 255;
        doc.x = 155;
        doc.text(data.fecha_deposito, {
          align: 'left',
          columns: 1,
          width: 150,
        });

        doc.fontSize(8);
        doc.font('Helvetica-BoldOblique');
        doc.text(
          'Providencia Administrativa N° CJ/002/2020, de fecha 30 de junio de 2020, publicada en Gaceta Oficial Nº 41.912 de fecha 01-07-2020',
          60,
          280
        );

        doc.fontSize(10);
        doc.y = 305;
        doc.x = 115;
        doc.text('RÉGIMEN NACIONAL', {
          align: 'center',
          columns: 1,
          width: 400,
        });

        doc.lineWidth(0.5);
        doc
          .lineJoin('miter')
          .rect(40, 320, 530, 30)
          .fillAndStroke('grey', 'black');
        doc.fillColor('black');
        doc.font('Helvetica-Bold');
        doc.fontSize(9);
        doc.text('ESCALA DE PESO (Grs.)', 47, 332);
        doc.text('TARIFA DE', 180, 326);
        doc.text('SERVICIO', 182, 338);
        doc.text('TARIFA %', 260, 332);
        doc.text('MONTO DE', 330, 326);
        doc.text('FPO', 344, 338);
        doc.text('PIEZAS', 412, 326);
        doc.text('MOVILIZADAS', 400, 338);
        doc.text('MONTO CAUSADO', 480, 332);
        break;
      default:
        break;
    }
  }

  async generateCustomerInformation(doc, tipo, data, detalles) {
    var i = 0;
    var page = 0;
    var ymin;
    let count = 0;
    let total_piezas = 0;
    let total_peso = 0;
    let total_base = 0;
    let total_seguro = 0;
    let total_total = 0;
    let total_fpo = 0;
    let subtotal_piezas = 0;
    let subtotal_peso = 0;
    let subtotal_base = 0;
    let subtotal_seguro = 0;
    let subtotal_total = 0;
    let subtotal_fpo = 0;

    switch (tipo) {
      case 'RG':
      case 'R1':
      case 'R2':
      case 'R3':
      case 'R4':
      case 'R5':
      case 'R6':
      case 'R7':
      case 'R8':
        ymin = 170;
        for (var item = 0; item < detalles.length; item++) {
          doc.y = ymin + i;
          doc.x = 32;
          doc.text(
            moment(detalles[item]['movimientos.fecha_emision']).format(
              'DD/MM/YYYY'
            ),
            {
              align: 'center',
              columns: 1,
              width: 70,
            }
          );
          doc.y = ymin + i;
          doc.x = 100;
          doc.text(detalles[item]['movimientos.nro_documento'], {
            align: 'center',
            columns: 1,
            width: 75,
          });
          doc.y = ymin + i;
          doc.x = 175;
          doc.text(detalles[item].nro_piezas, {
            align: 'center',
            columns: 1,
            width: 45,
          });
          doc.y = ymin + i;
          doc.x = 218;
          doc.text(utils.formatNumber(detalles[item].peso_kgs), {
            align: 'center',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 260;
          doc.text(utils.formatNumber(detalles[item].monto_base), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 310;
          doc.text(utils.formatNumber(detalles[item].monto_seguro), {
            align: 'right',
            columns: 1,
            width: 80,
          });
          let monto_total =
            utils.parseFloatN(detalles[item].monto_base) +
            utils.parseFloatN(detalles[item].monto_seguro);
          doc.y = ymin + i;
          doc.x = 395;
          doc.text(utils.formatNumber(monto_total), {
            align: 'right',
            columns: 1,
            width: 65,
          });
          doc.y = ymin + i;
          doc.x = 465;
          doc.text(parseInt(detalles[item]['movimientos.monto_fpo']) + '%', {
            align: 'center',
            columns: 1,
            width: 60,
          });
          let fpo =
            monto_total *
            (parseInt(detalles[item]['movimientos.monto_fpo']) / 100);
          doc.y = ymin + i;
          doc.x = 510;
          doc.text(utils.formatNumber(fpo), {
            align: 'right',
            columns: 1,
            width: 60,
          });

          count++;
          total_piezas += utils.parseFloatN(detalles[item].nro_piezas);
          total_peso += utils.parseFloatN(detalles[item].peso_kgs);
          total_base += utils.parseFloatN(detalles[item].monto_base);
          total_seguro += utils.parseFloatN(detalles[item].monto_seguro);
          total_total += utils.parseFloatN(monto_total);
          total_fpo += utils.parseFloatN(fpo);

          i += 15;
          if (i >= 580) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data, detalles);
          }
        }

        // Totales Finales
        doc.font('Helvetica-Bold');
        doc.y = ymin + i;
        doc.x = 60;
        doc.text('Totales:', {
          align: 'left',
          columns: 1,
          width: 80,
        });
        doc.y = ymin + i;
        doc.x = 100;
        doc.text(count, {
          align: 'center',
          columns: 1,
          width: 75,
        });
        doc.y = ymin + i;
        doc.x = 175;
        doc.text(total_piezas, {
          align: 'center',
          columns: 1,
          width: 45,
        });
        doc.y = ymin + i;
        doc.x = 218;
        doc.text(utils.formatNumber(total_peso), {
          align: 'center',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i;
        doc.x = 260;
        doc.text(utils.formatNumber(total_base), {
          align: 'right',
          columns: 1,
          width: 60,
        });
        doc.y = ymin + i;
        doc.x = 310;
        doc.text(utils.formatNumber(total_seguro), {
          align: 'right',
          columns: 1,
          width: 80,
        });
        doc.y = ymin + i;
        doc.x = 395;
        doc.text(utils.formatNumber(total_total), {
          align: 'right',
          columns: 1,
          width: 65,
        });
        doc.y = ymin + i;
        doc.x = 510;
        doc.text(utils.formatNumber(total_fpo), {
          align: 'right',
          columns: 1,
          width: 60,
        });
        break;
      case 'RE':
        ymin = 170;
        for (var item = 0; item < detalles.length; item++) {
          doc.y = ymin + i;
          doc.x = 45;
          doc.text(detalles[item].desc_fpo, {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.y = ymin + i;
          doc.x = 170;
          doc.text(utils.formatNumber(detalles[item].peso_kgs), {
            align: 'center',
            columns: 1,
            width: 45,
          });
          doc.y = ymin + i;
          doc.x = 218;
          doc.text(detalles[item].nro_piezas, {
            align: 'center',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 260;
          doc.text(utils.formatNumber(detalles[item].monto_base), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 310;
          doc.text(utils.formatNumber(detalles[item].monto_seguro), {
            align: 'right',
            columns: 1,
            width: 80,
          });
          let monto_total =
            utils.parseFloatN(detalles[item].monto_base) +
            utils.parseFloatN(detalles[item].monto_seguro);
          doc.y = ymin + i;
          doc.x = 395;
          doc.text(utils.formatNumber(monto_total), {
            align: 'right',
            columns: 1,
            width: 65,
          });
          doc.y = ymin + i;
          doc.x = 465;
          doc.text(detalles[item].valor_fpo + ' %', {
            align: 'center',
            columns: 1,
            width: 60,
          });
          let fpo = monto_total * (parseInt(detalles[item].valor_fpo) / 100);
          doc.y = ymin + i;
          doc.x = 510;
          doc.text(utils.formatNumber(fpo), {
            align: 'right',
            columns: 1,
            width: 60,
          });

          count++;
          total_piezas += utils.parseFloatN(detalles[item].nro_piezas);
          total_peso += utils.parseFloatN(detalles[item].peso_kgs);
          total_base += utils.parseFloatN(detalles[item].monto_base);
          total_seguro += utils.parseFloatN(detalles[item].monto_seguro);
          total_total += utils.parseFloatN(monto_total);
          total_fpo += utils.parseFloatN(fpo);

          i += 15;
          if (i >= 580) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data, detalles);
          }
        }

        // Totales Finales
        doc.font('Helvetica-Bold');
        doc.y = ymin + i;
        doc.x = 60;
        doc.text('Total Causado:', {
          align: 'left',
          columns: 1,
          width: 80,
        });
        doc.y = ymin + i;
        doc.x = 170;
        doc.text(utils.formatNumber(total_peso), {
          align: 'center',
          columns: 1,
          width: 45,
        });
        doc.y = ymin + i;
        doc.x = 218;
        doc.text(total_piezas, {
          align: 'center',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i;
        doc.x = 260;
        doc.text(utils.formatNumber(total_base), {
          align: 'right',
          columns: 1,
          width: 60,
        });
        doc.y = ymin + i;
        doc.x = 310;
        doc.text(utils.formatNumber(total_seguro), {
          align: 'right',
          columns: 1,
          width: 80,
        });
        doc.y = ymin + i;
        doc.x = 395;
        doc.text(utils.formatNumber(total_total), {
          align: 'right',
          columns: 1,
          width: 65,
        });
        doc.y = ymin + i;
        doc.x = 510;
        doc.text(utils.formatNumber(total_fpo), {
          align: 'right',
          columns: 1,
          width: 60,
        });
        break;
      case 'REG':
        ymin = 170;
        for (var item = 0; item < detalles.length; item++) {
          if (
            item == 0 ||
            detalles[item].cliente_orig != detalles[item - 1].cliente_orig
          ) {
            if (item > 0) i += 20;
            doc.fontSize(10);
            doc.font('Helvetica-Bold');
            doc.text(detalles[item].cliente_orig, 35, ymin + i);
            i += 17;
          }
          doc.font('Helvetica');
          doc.fontSize(8);
          doc.y = ymin + i;
          doc.x = 45;
          doc.text(detalles[item].desc_fpo, {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.y = ymin + i;
          doc.x = 170;
          doc.text(utils.formatNumber(detalles[item].peso_kgs), {
            align: 'center',
            columns: 1,
            width: 45,
          });
          doc.y = ymin + i;
          doc.x = 218;
          doc.text(detalles[item].nro_piezas, {
            align: 'center',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 260;
          doc.text(utils.formatNumber(detalles[item].monto_base), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 310;
          doc.text(utils.formatNumber(detalles[item].monto_seguro), {
            align: 'right',
            columns: 1,
            width: 80,
          });
          let monto_total =
            utils.parseFloatN(detalles[item].monto_base) +
            utils.parseFloatN(detalles[item].monto_seguro);
          doc.y = ymin + i;
          doc.x = 395;
          doc.text(utils.formatNumber(monto_total), {
            align: 'right',
            columns: 1,
            width: 65,
          });
          doc.y = ymin + i;
          doc.x = 465;
          doc.text(detalles[item].valor_fpo + ' %', {
            align: 'center',
            columns: 1,
            width: 60,
          });
          let fpo = monto_total * (parseInt(detalles[item].valor_fpo) / 100);
          doc.y = ymin + i;
          doc.x = 510;
          doc.text(utils.formatNumber(fpo), {
            align: 'right',
            columns: 1,
            width: 60,
          });

          // Sub Totales por Cliente
          if (
            item > 0 &&
            detalles[item].cliente_orig != detalles[item - 1].cliente_orig
          ) {
            doc.font('Helvetica-Bold');
            doc.y = ymin + i - 36;
            doc.x = 60;
            doc.text('Sub Total Cliente:', {
              align: 'left',
              columns: 1,
              width: 80,
            });
            doc.y = ymin + i - 36;
            doc.x = 170;
            doc.text(utils.formatNumber(subtotal_peso), {
              align: 'center',
              columns: 1,
              width: 45,
            });
            doc.y = ymin + i - 36;
            doc.x = 218;
            doc.text(subtotal_piezas, {
              align: 'center',
              columns: 1,
              width: 40,
            });
            doc.y = ymin + i - 36;
            doc.x = 260;
            doc.text(utils.formatNumber(subtotal_base), {
              align: 'right',
              columns: 1,
              width: 60,
            });
            doc.y = ymin + i - 36;
            doc.x = 310;
            doc.text(utils.formatNumber(subtotal_seguro), {
              align: 'right',
              columns: 1,
              width: 80,
            });
            doc.y = ymin + i - 36;
            doc.x = 395;
            doc.text(utils.formatNumber(subtotal_total), {
              align: 'right',
              columns: 1,
              width: 65,
            });
            doc.y = ymin + i - 36;
            doc.x = 510;
            doc.text(utils.formatNumber(subtotal_fpo), {
              align: 'right',
              columns: 1,
              width: 60,
            });
            doc.font('Helvetica');
            i += 3;

            subtotal_piezas = 0;
            subtotal_peso = 0;
            subtotal_base = 0;
            subtotal_seguro = 0;
            subtotal_total = 0;
            subtotal_fpo = 0;
          }

          count++;
          total_piezas += utils.parseFloatN(detalles[item].nro_piezas);
          total_peso += utils.parseFloatN(detalles[item].peso_kgs);
          total_base += utils.parseFloatN(detalles[item].monto_base);
          total_seguro += utils.parseFloatN(detalles[item].monto_seguro);
          total_total += utils.parseFloatN(monto_total);
          total_fpo += utils.parseFloatN(fpo);

          subtotal_piezas += utils.parseFloatN(detalles[item].nro_piezas);
          subtotal_peso += utils.parseFloatN(detalles[item].peso_kgs);
          subtotal_base += utils.parseFloatN(detalles[item].monto_base);
          subtotal_seguro += utils.parseFloatN(detalles[item].monto_seguro);
          subtotal_total += utils.parseFloatN(monto_total);
          subtotal_fpo += utils.parseFloatN(fpo);

          i += 15;
          if (i >= 580) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data, detalles);
          }
        }

        // Sub Totales por Cliente Finales
        doc.font('Helvetica-Bold');
        doc.y = ymin + i;
        doc.x = 60;
        doc.text('Sub Total Cliente:', {
          align: 'left',
          columns: 1,
          width: 80,
        });
        doc.y = ymin + i;
        doc.x = 170;
        doc.text(utils.formatNumber(subtotal_peso), {
          align: 'center',
          columns: 1,
          width: 45,
        });
        doc.y = ymin + i;
        doc.x = 218;
        doc.text(subtotal_piezas, {
          align: 'center',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i;
        doc.x = 260;
        doc.text(utils.formatNumber(subtotal_base), {
          align: 'right',
          columns: 1,
          width: 60,
        });
        doc.y = ymin + i;
        doc.x = 310;
        doc.text(utils.formatNumber(subtotal_seguro), {
          align: 'right',
          columns: 1,
          width: 80,
        });
        doc.y = ymin + i;
        doc.x = 395;
        doc.text(utils.formatNumber(subtotal_total), {
          align: 'right',
          columns: 1,
          width: 65,
        });
        doc.y = ymin + i;
        doc.x = 510;
        doc.text(utils.formatNumber(subtotal_fpo), {
          align: 'right',
          columns: 1,
          width: 60,
        });

        i += 16;

        // Totales Finales
        doc.font('Helvetica-Bold');
        doc.y = ymin + i;
        doc.x = 60;
        doc.text('Total Causado:', {
          align: 'left',
          columns: 1,
          width: 80,
        });
        doc.y = ymin + i;
        doc.x = 170;
        doc.text(utils.formatNumber(total_peso), {
          align: 'center',
          columns: 1,
          width: 45,
        });
        doc.y = ymin + i;
        doc.x = 218;
        doc.text(total_piezas, {
          align: 'center',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i;
        doc.x = 260;
        doc.text(utils.formatNumber(total_base), {
          align: 'right',
          columns: 1,
          width: 60,
        });
        doc.y = ymin + i;
        doc.x = 310;
        doc.text(utils.formatNumber(total_seguro), {
          align: 'right',
          columns: 1,
          width: 80,
        });
        doc.y = ymin + i;
        doc.x = 395;
        doc.text(utils.formatNumber(total_total), {
          align: 'right',
          columns: 1,
          width: 65,
        });
        doc.y = ymin + i;
        doc.x = 510;
        doc.text(utils.formatNumber(total_fpo), {
          align: 'right',
          columns: 1,
          width: 60,
        });
        break;
      case 'PA':
        ymin = 360;
        for (var item = 0; item < detalles.length; item++) {
          if (
            item > 0 &&
            detalles[item].monto_fpo != detalles[item - 1].monto_fpo
          ) {
            i += 20;
          }

          doc.font('Helvetica');
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 50;
          doc.text(detalles[item].escala, {
            align: 'left',
            columns: 1,
            width: 150,
          });
          doc.y = ymin + i;
          doc.x = 170;
          doc.text(utils.formatNumber(detalles[item].tarifa), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 253;
          doc.text(parseInt(detalles[item].monto_fpo) + '%', {
            align: 'center',
            columns: 1,
            width: 60,
          });
          let fpo =
            detalles[item].tarifa * (parseInt(detalles[item].monto_fpo) / 100);
          doc.y = ymin + i;
          doc.x = 315;
          doc.text(utils.formatNumber(fpo), {
            align: 'right',
            columns: 1,
            width: 65,
          });
          doc.y = ymin + i;
          doc.x = 370;
          doc.text(detalles[item].nro_piezas, {
            align: 'right',
            columns: 1,
            width: 65,
          });
          let monto_fpo =
            utils.parseFloatN(fpo) *
            utils.parseFloatN(detalles[item].nro_piezas);
          doc.y = ymin + i;
          doc.x = 495;
          doc.text(utils.formatNumber(monto_fpo), {
            align: 'right',
            columns: 1,
            width: 65,
          });

          // Sub Totales por %
          if (
            item > 0 &&
            detalles[item].monto_fpo != detalles[item - 1].monto_fpo
          ) {
            doc.font('Helvetica-Bold');
            doc.y = ymin + i - 20;
            doc.x = 297;
            doc.text('SUBTOTAL ' + parseInt(detalles[item - 1].monto_fpo) + '%:', {
              align: 'left',
              columns: 1,
              width: 80,
            });
            doc.y = ymin + i - 20;
            doc.x = 370;
            doc.text(subtotal_piezas, {
              align: 'right',
              columns: 1,
              width: 65,
            });
            doc.y = ymin + i - 20;
            doc.x = 495;
            doc.text(utils.formatNumber(subtotal_fpo), {
              align: 'right',
              columns: 1,
              width: 65,
            });
            doc.font('Helvetica');

            subtotal_piezas = 0;
            subtotal_fpo = 0;
          }

          count++;
          total_piezas += utils.parseFloatN(detalles[item].nro_piezas);
          total_fpo += utils.parseFloatN(monto_fpo);
          subtotal_piezas += utils.parseFloatN(detalles[item].nro_piezas);
          subtotal_fpo += utils.parseFloatN(monto_fpo);

          i += 15;
          if (i >= 380) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data, detalles);
          }
        }

        // Sub Totales por % Finales
        doc.font('Helvetica-Bold');
        doc.y = ymin + i;
        doc.x = 297;
        doc.text('SUBTOTAL ' + parseInt(detalles[count - 1].monto_fpo) + '%:', {
          align: 'left',
          columns: 1,
          width: 80,
        });
        doc.y = ymin + i;
        doc.x = 370;
        doc.text(subtotal_piezas, {
          align: 'right',
          columns: 1,
          width: 65,
        });
        doc.y = ymin + i;
        doc.x = 495;
        doc.text(utils.formatNumber(subtotal_fpo), {
          align: 'right',
          columns: 1,
          width: 65,
        });

        i += 16;

        // Totales Finales
        doc.font('Helvetica-Bold');
        doc.y = ymin + i;
        doc.x = 320;
        doc.text('TOTALES:', {
          align: 'left',
          columns: 1,
          width: 80,
        });
        doc.y = ymin + i;
        doc.x = 370;
        doc.text(total_piezas, {
          align: 'right',
          columns: 1,
          width: 65,
        });
        doc.y = ymin + i;
        doc.x = 495;
        doc.text(utils.formatNumber(total_fpo), {
          align: 'right',
          columns: 1,
          width: 65,
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
      if (tipo != 'PA') {
        doc.fontSize(8);
        doc.font('Helvetica');
        doc.fillColor('#444444');
        doc.x = 480;
        doc.y = 45;
        doc.text(`Pagina ${i + 1} de ${range.count}`, {
          align: 'right',
          columns: 1,
          width: 100,
        });
      }
    }
  }
}

module.exports = RelacionFpoService;
