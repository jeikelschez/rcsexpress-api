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
const fechaFact =
  '(SELECT fecha_emision FROM maestro_de_movimientos b ' +
  'WHERE `movimientos`.cod_ag_doc_ppal = b.cod_agencia ' +
  'AND `movimientos`.nro_ctrl_doc_ppal = b.nro_control ' +
  'AND `movimientos`.nro_ctrl_doc_ppal_new = b.nro_control_new)';
const valorDolar =
  '(SELECT valor FROM historico_dolar ' +
  ' WHERE historico_dolar.fecha = `movimientos`.fecha_emision)';

class RelacionFpoService {
  async mainReport(doc, tipo, data) {
    let detalles = [];
    let where = {};
    data = JSON.parse(data);

    switch (tipo) {
      case 'RG':
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
          order: [['movimientos', 'nro_documento', 'ASC']],
        });

        if (detalles.length == 0) return false;

        detalles.desde = data.desde;
        detalles.hasta = data.hasta;
        if (data.nbCliente) detalles.cliente = data.nbCliente;
        break;
      case 'RE':
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
      case 'RD':
        where.fecha_emision = {
          [Sequelize.Op.between]: [
            moment(data.desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            moment(data.hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
          ],
        };

        where.peso_kgs = {
          [Sequelize.Op.gt]: data.kgs_min,
          [Sequelize.Op.lte]: data.kgs_max,
        };

        where.estatus_administra = {
          [Sequelize.Op.not]: 'A',
        };

        if (data.kgs_max !== 10000) {
          where.monto_fpo = {
            [Sequelize.Op.not]: 0,
          };
        }

        if (data.cliente) where.cod_cliente_org = data.cliente;

        detalles = await models.Dmovimientos.findAll({
          attributes: [
            [Sequelize.literal(nroPiezas), 'nro_piezas'],
            [Sequelize.literal(pesoKgs), 'peso_kgs'],
            [Sequelize.literal(montoBase), 'monto_base'],
            [Sequelize.literal(montoSeguro), 'monto_seguro'],
            [Sequelize.literal(fechaFact), 'fecha_fact'],
            [Sequelize.literal(valorDolar), 'valor_dolar'],
          ],
          include: [
            {
              model: models.Mmovimientos,
              as: 'movimientos',
              where: where,
              attributes: [
                'fecha_emision',
                'nro_documento',
                'monto_fpo',
                'nro_ctrl_doc_ppal',
                'nro_ctrl_doc_ppal_new',
              ],
              include: [
                {
                  model: models.Clientes,
                  as: 'clientes_org',
                },
                {
                  model: models.Agencias,
                  as: 'agencias_dest',
                  attributes: [],
                  include: [
                    {
                      model: models.Ciudades,
                      as: 'ciudades',
                    },
                  ],
                },
              ],
            },
          ],
          raw: true,
          group: ['movimientos.id'],
          order: [
            ['movimientos', 'fecha_emision', 'ASC'],
            ['movimientos', 'nro_documento', 'ASC'],
          ],
        });

        if (detalles.length == 0) return false;

        detalles.desde = data.desde;
        detalles.hasta = data.hasta;
        if (data.nbCliente) detalles.cliente = data.nbCliente;
        break;
      default:
        return false;
    }

    if (detalles.length == 0) return false;

    await this.generateHeader(doc, tipo, data, detalles, 0);
    await this.generateCustomerInformation(doc, tipo, data, detalles);
    return true;
  }

  async generateHeader(doc, tipo, data, detalles, page) {
    switch (tipo) {
      case 'RG':
        doc.image('./img/logo_rc.png', 35, 25, { width: 50 });
        doc.fontSize(10);
        doc.font('Helvetica-Bold');
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
        doc.fontSize(12);
        doc.y = 105;
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
        doc.lineCap('butt').moveTo(35, 130).lineTo(580, 130).stroke();
        doc.lineCap('butt').moveTo(35, 145).lineTo(580, 145).stroke();
        doc.text('Fecha Emisión', 40, 135);
        doc.text('Nro. Guía Carga', 110, 135);
        doc.text('Piezas', 185, 135);
        doc.text('Peso', 230, 135);
        if (data.checkProtect) {
          doc.text('Monto Base', 270, 135);
          doc.text('Protección Envío', 330, 135);
        }
        doc.text('Total Flete', 415, 135);
        doc.text('Porcentaje', 475, 135);
        doc.text('Monto FPO', 530, 135);
        break;
      case 'RE':
      case 'REG':
        doc.image('./img/logo_rc.png', 35, 25, { width: 50 });
        doc.fontSize(10);
        doc.font('Helvetica-Bold');
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
        doc.fontSize(12);
        doc.y = 105;
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
        doc.lineCap('butt').moveTo(35, 130).lineTo(580, 130).stroke();
        doc.lineCap('butt').moveTo(35, 145).lineTo(580, 145).stroke();
        doc.text('Rangos', 100, 135);
        doc.text('Peso', 185, 135);
        doc.text('Piezas', 225, 135);
        if (data.checkProtect) {
          doc.text('Monto Base', 270, 135);
          doc.text('Protección Envío', 330, 135);
        }
        doc.text('Total Flete', 415, 135);
        doc.text('Porcentaje', 475, 135);
        doc.text('Monto FPO', 530, 135);
        break;
      case 'PA':
        doc.image('./img/logo_rc.png', 35, 25, { width: 50 });
        doc.fontSize(10);
        doc.font('Helvetica-Bold');
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
        doc.fontSize(12);
        doc.y = 105;
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
        doc.fontSize(9);
        doc.lineCap('butt').moveTo(35, 130).lineTo(580, 130).stroke();
        doc.lineCap('butt').moveTo(35, 155).lineTo(580, 155).stroke();
        doc.text('ESCALA DE PESO (Grs.)', 50, 135);
        doc.text('TARIFA DE', 190, 135);
        doc.text('SERVICIO', 192, 145);
        doc.text('TARIFA %', 263, 135);
        doc.text('MONTO DE FPO', 330, 135);
        doc.text('PIEZAS', 433, 135);
        doc.text('MOVILIZADAS', 420, 145);
        doc.text('MONTO CAUSADO', 495, 135);
        break;
      case 'RD':
        doc.lineWidth(0.5);
        doc.fontSize(9);
        doc.font('Helvetica-Bold');

        let ymin = 140;

        doc
          .lineJoin('square')
          .rect(20, 20 + ymin, 575, 15)
          .stroke();
        doc.y = 25 + ymin;
        doc.x = 20;
        doc.text('R.C.S. EXPRESS, S.A. RIF J31028463-6 CP N° IP 20-22-15-40', {
          align: 'center',
          columns: 1,
          width: 575,
        });

        doc
          .lineJoin('square')
          .rect(20, 35 + ymin, 575, 15)
          .stroke();
        doc.y = 40 + ymin;
        doc.x = 20;
        doc.text(
          'RESUMEN ' +
            utils.numerosAMeses(
              parseInt(moment(detalles.desde, 'DD/MM/YYYY').format('MM'))
            ) +
            ' ' +
            moment(detalles.desde, 'DD/MM/YYYY').format('YYYY'),
          {
            align: 'center',
            columns: 1,
            width: 575,
          }
        );

        if (page % 2 === 0) {
          doc
            .lineJoin('square')
            .rect(20, 50 + ymin, 50, 45)
            .stroke();
          doc.y = 65 + ymin;
          doc.x = 20;
          doc.text('N° de', {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = 75 + ymin;
          doc.x = 20;
          doc.text('Operación', {
            align: 'center',
            columns: 1,
            width: 50,
          });

          doc
            .lineJoin('square')
            .rect(70, 50 + ymin, 60, 45)
            .stroke();
          doc.y = 65 + ymin;
          doc.x = 70;
          doc.text('Fecha de', {
            align: 'center',
            columns: 1,
            width: 60,
          });
          doc.y = 75 + ymin;
          doc.x = 70;
          doc.text('Factura', {
            align: 'center',
            columns: 1,
            width: 60,
          });

          doc
            .lineJoin('square')
            .rect(130, 50 + ymin, 80, 45)
            .stroke();
          doc.y = 70 + ymin;
          doc.x = 130;
          doc.text('Nº R.I.F.', {
            align: 'center',
            columns: 1,
            width: 80,
          });

          doc
            .lineJoin('square')
            .rect(210, 50 + ymin, 120, 45)
            .stroke();
          doc.y = 70 + ymin;
          doc.x = 210;
          doc.text('Proveedor o Razón Social', {
            align: 'center',
            columns: 1,
            width: 120,
          });

          doc
            .lineJoin('square')
            .rect(330, 50 + ymin, 60, 45)
            .stroke();
          doc.y = 65 + ymin;
          doc.x = 330;
          doc.text('N° de', {
            align: 'center',
            columns: 1,
            width: 60,
          });
          doc.y = 75 + ymin;
          doc.x = 330;
          doc.text('Guía', {
            align: 'center',
            columns: 1,
            width: 60,
          });

          doc
            .lineJoin('square')
            .rect(390, 50 + ymin, 60, 45)
            .stroke();
          doc.y = 65 + ymin;
          doc.x = 390;
          doc.text('Fecha de', {
            align: 'center',
            columns: 1,
            width: 60,
          });
          doc.y = 75 + ymin;
          doc.x = 390;
          doc.text('Guía', {
            align: 'center',
            columns: 1,
            width: 60,
          });

          doc
            .lineJoin('square')
            .rect(450, 50 + ymin, 30, 45)
            .stroke();
          doc.y = 70 + ymin;
          doc.x = 450;
          doc.text('Serie', {
            align: 'center',
            columns: 1,
            width: 30,
          });

          doc
            .lineJoin('square')
            .rect(480, 50 + ymin, 55, 45)
            .stroke();
          doc.y = 65 + ymin;
          doc.x = 480;
          doc.text('N° de', {
            align: 'center',
            columns: 1,
            width: 55,
          });
          doc.y = 75 + ymin;
          doc.x = 480;
          doc.text('Factura', {
            align: 'center',
            columns: 1,
            width: 55,
          });

          doc
            .lineJoin('square')
            .rect(535, 50 + ymin, 60, 45)
            .stroke();
          doc.y = 65 + ymin;
          doc.x = 535;
          doc.text('N° de', {
            align: 'center',
            columns: 1,
            width: 60,
          });
          doc.y = 75 + ymin;
          doc.x = 535;
          doc.text('Control', {
            align: 'center',
            columns: 1,
            width: 60,
          });
        } else {
          doc
            .lineJoin('square')
            .rect(20, 50 + ymin, 45, 45)
            .stroke();
          doc.y = 65 + ymin;
          doc.x = 20;
          doc.text('Tasa de', {
            align: 'center',
            columns: 1,
            width: 45,
          });
          doc.y = 75 + ymin;
          doc.x = 20;
          doc.text('Cambio', {
            align: 'center',
            columns: 1,
            width: 45,
          });

          doc
            .lineJoin('square')
            .rect(65, 50 + ymin, 50, 45)
            .stroke();
          doc.y = 70 + ymin;
          doc.x = 65;
          doc.text('Peso', {
            align: 'center',
            columns: 1,
            width: 50,
          });

          doc
            .lineJoin('square')
            .rect(115, 50 + ymin, 50, 45)
            .stroke();
          doc.y = 54 + ymin;
          doc.x = 115;
          doc.text('Total', {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = 62 + ymin;
          doc.x = 115;
          doc.text('Ventas', {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = 70 + ymin;
          doc.x = 115;
          doc.text('Internas', {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = 78 + ymin;
          doc.x = 115;
          doc.text('Incluyendo', {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = 86 + ymin;
          doc.x = 115;
          doc.text('el Iva', {
            align: 'center',
            columns: 1,
            width: 50,
          });

          doc
            .lineJoin('square')
            .rect(165, 50 + ymin, 45, 45)
            .stroke();
          doc.y = 65 + ymin;
          doc.x = 165;
          doc.text('Base', {
            align: 'center',
            columns: 1,
            width: 45,
          });
          doc.y = 75 + ymin;
          doc.x = 165;
          doc.text('Imponible', {
            align: 'center',
            columns: 1,
            width: 45,
          });

          doc
            .lineJoin('square')
            .rect(210, 50 + ymin, 55, 45)
            .stroke();
          doc.y = 65 + ymin;
          doc.x = 210;
          doc.text('Monto', {
            align: 'center',
            columns: 1,
            width: 55,
          });
          doc.y = 75 + ymin;
          doc.x = 210;
          doc.text('Exento', {
            align: 'center',
            columns: 1,
            width: 55,
          });

          doc
            .lineJoin('square')
            .rect(265, 50 + ymin, 25, 45)
            .stroke();
          doc.y = 65 + ymin;
          doc.x = 265;
          doc.text('%', {
            align: 'center',
            columns: 1,
            width: 25,
          });
          doc.y = 75 + ymin;
          doc.x = 265;
          doc.text('IVA', {
            align: 'center',
            columns: 1,
            width: 25,
          });

          doc
            .lineJoin('square')
            .rect(290, 50 + ymin, 50, 45)
            .stroke();
          doc.y = 55 + ymin;
          doc.x = 290;
          doc.text('%', {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = 64 + ymin;
          doc.x = 290;
          doc.text('Franqueo', {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = 73 + ymin;
          doc.x = 290;
          doc.text('Postal', {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = 82 + ymin;
          doc.x = 290;
          doc.text('Obligatorio', {
            align: 'center',
            columns: 1,
            width: 50,
          });

          doc
            .lineJoin('square')
            .rect(340, 50 + ymin, 50, 45)
            .stroke();
          doc.y = 65 + ymin;
          doc.x = 340;
          doc.text('Impuesto', {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = 75 + ymin;
          doc.x = 340;
          doc.text('IVA', {
            align: 'center',
            columns: 1,
            width: 50,
          });

          doc
            .lineJoin('square')
            .rect(390, 50 + ymin, 50, 45)
            .stroke();
          doc.y = 60 + ymin;
          doc.x = 390;
          doc.text('Franqueo', {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = 70 + ymin;
          doc.x = 390;
          doc.text('Postal', {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = 80 + ymin;
          doc.x = 390;
          doc.text('Obligatorio', {
            align: 'center',
            columns: 1,
            width: 50,
          });

          doc
            .lineJoin('square')
            .rect(440, 50 + ymin, 50, 45)
            .stroke();
          doc.y = 70 + ymin;
          doc.x = 440;
          doc.text('Origen', {
            align: 'center',
            columns: 1,
            width: 50,
          });

          doc
            .lineJoin('square')
            .rect(490, 50 + ymin, 50, 45)
            .stroke();
          doc.y = 70 + ymin;
          doc.x = 490;
          doc.text('Destino', {
            align: 'center',
            columns: 1,
            width: 50,
          });

          doc
            .lineJoin('square')
            .rect(540, 50 + ymin, 55, 45)
            .stroke();
          doc.y = 70 + ymin;
          doc.x = 540;
          doc.text('Contenido', {
            align: 'center',
            columns: 1,
            width: 55,
          });
        }

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
    let total_causado = 0;
    let subtotal_piezas = 0;
    let subtotal_peso = 0;
    let subtotal_base = 0;
    let subtotal_seguro = 0;
    let subtotal_total = 0;
    let subtotal_fpo = 0;

    switch (tipo) {
      case 'RG':
        ymin = 155;
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

          if (data.checkProtect) {
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
          }

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
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data, detalles, page);
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

        if (data.checkProtect) {
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
        }

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
        ymin = 155;
        for (var item = 0; item < detalles.length; item++) {
          doc.y = ymin + i;
          doc.x = 45;
          doc.text(detalles[item].desc_fpo, {
            align: 'left',
            columns: 1,
            width: 150,
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

          if (data.checkProtect) {
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
          }

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
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data, detalles, page);
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

        if (data.checkProtect) {
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
        }

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
        doc.fontSize(9);
        ymin = 165;
        for (var item = 0; item < detalles.length; item++) {
          doc.y = ymin + i;
          doc.x = 45;
          doc.text(detalles[item].desc_fpo, {
            align: 'left',
            columns: 1,
            width: 150,
          });

          let monto_total =
            utils.parseFloatN(detalles[item].monto_base) +
            utils.parseFloatN(detalles[item].monto_seguro);
          doc.y = ymin + i;
          doc.x = 160;
          doc.text(utils.formatNumber(monto_total), {
            align: 'right',
            columns: 1,
            width: 80,
          });

          doc.y = ymin + i;
          doc.x = 255;
          doc.text(detalles[item].valor_fpo + ' %', {
            align: 'center',
            columns: 1,
            width: 60,
          });

          let monto_causado =
            monto_total * (parseInt(detalles[item].valor_fpo) / 100);
          let fpo = monto_causado / detalles[item].nro_piezas;

          doc.y = ymin + i;
          doc.x = 340;
          doc.text(utils.formatNumber(fpo), {
            align: 'right',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i;
          doc.x = 430;
          doc.text(detalles[item].nro_piezas, {
            align: 'center',
            columns: 1,
            width: 40,
          });

          doc.y = ymin + i;
          doc.x = 490;
          doc.text(utils.formatNumber(monto_causado), {
            align: 'right',
            columns: 1,
            width: 80,
          });

          count++;
          total_piezas += utils.parseFloatN(detalles[item].nro_piezas);
          total_causado += monto_causado;

          i += 15;
          if (i >= 580) {
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data, detalles, page);
          }
        }

        // Totales Finales
        doc.font('Helvetica-Bold');
        doc.y = ymin + i;
        doc.x = 300;
        doc.text('TOTAL CAUSADO:', {
          align: 'left',
          columns: 1,
          width: 80,
        });
        doc.y = ymin + i;
        doc.x = 430;
        doc.text(total_piezas, {
          align: 'center',
          columns: 1,
          width: 40,
        });

        doc.y = ymin + i;
        doc.x = 490;
        doc.text(utils.formatNumber(total_causado), {
          align: 'right',
          columns: 1,
          width: 80,
        });
        break;
      case 'REG':
        ymin = 155;
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
            width: 150,
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

          if (data.checkProtect) {
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
          }

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

            if (data.checkProtect) {
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
            }

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
          if (i >= 570) {
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data, detalles, page);
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

        if (data.checkProtect) {
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
        }

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

        if (data.checkProtect) {
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
        }

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
      case 'RD':
        ymin = 245;

        // Primera pagina
        for (var item = 0; item < detalles.length; item++) {
          doc.font('Helvetica');
          doc.fontSize(7);

          doc
            .lineJoin('square')
            .rect(20, ymin + i - 10, 50, 20)
            .stroke();
          doc.y = ymin + i;
          doc.x = 20;
          doc.text(item + 1, {
            align: 'center',
            columns: 1,
            width: 50,
          });

          doc
            .lineJoin('square')
            .rect(70, ymin + i - 10, 60, 20)
            .stroke();
          doc.y = ymin + i;
          doc.x = 70;
          doc.text(
            detalles[item].fecha_fact
              ? moment(detalles[item].fecha_fact).format('DD/MM/YYYY')
              : '',
            {
              align: 'center',
              columns: 1,
              width: 60,
            }
          );

          doc
            .lineJoin('square')
            .rect(130, ymin + i - 10, 80, 20)
            .stroke();
          doc.y = ymin + i;
          doc.x = 130;
          doc.text(detalles[item]['movimientos.clientes_org.rif_cedula'], {
            align: 'center',
            columns: 1,
            width: 80,
          });

          doc
            .lineJoin('square')
            .rect(210, ymin + i - 10, 120, 20)
            .stroke();

          let rectY = ymin + i - 10; // Y del rectángulo
          let rectHeight = 20; // Altura del rectángulo
          let rectWidth = 120; // Ancho del rectángulo
          let text = detalles[item]['movimientos.clientes_org.nb_cliente'];

          // Calcula la altura real del texto
          let textHeight = doc.heightOfString(text, {
            width: rectWidth,
            align: 'center',
          });

          // Calcula la posición Y centrada
          let textY = rectY + (rectHeight - textHeight) / 2;

          doc.y = textY + 2;
          doc.x = 210;
          doc.text(text, {
            align: 'center',
            columns: 1,
            width: rectWidth,
          });

          doc
            .lineJoin('square')
            .rect(330, ymin + i - 10, 60, 20)
            .stroke();
          doc.y = ymin + i;
          doc.x = 330;
          doc.text(detalles[item]['movimientos.nro_documento'], {
            align: 'center',
            columns: 1,
            width: 60,
          });

          doc
            .lineJoin('square')
            .rect(390, ymin + i - 10, 60, 20)
            .stroke();
          doc.y = ymin + i;
          doc.x = 390;
          doc.text(
            moment(detalles[item]['movimientos.fecha_emision']).format(
              'DD/MM/YYYY'
            ),
            {
              align: 'center',
              columns: 1,
              width: 60,
            }
          );

          doc
            .lineJoin('square')
            .rect(450, ymin + i - 10, 30, 20)
            .stroke();
          doc.y = ymin + i;
          doc.x = 450;
          doc.text('N/A', {
            align: 'center',
            columns: 1,
            width: 30,
          });

          doc
            .lineJoin('square')
            .rect(480, ymin + i - 10, 55, 20)
            .stroke();
          doc.y = ymin + i;
          doc.x = 480;
          doc.text(detalles[item]['movimientos.nro_ctrl_doc_ppal'], {
            align: 'center',
            columns: 1,
            width: 55,
          });

          doc
            .lineJoin('square')
            .rect(535, ymin + i - 10, 60, 20)
            .stroke();
          doc.y = ymin + i;
          doc.x = 535;
          doc.text(
            detalles[item]['movimientos.nro_ctrl_doc_ppal_new']
              ? detalles[item]['movimientos.nro_ctrl_doc_ppal_new'].padStart(
                  9,
                  '00-000000'
                )
              : '',
            {
              align: 'center',
              columns: 1,
              width: 60,
            }
          );

          i += 20;
          if (i >= 550) {
            doc.addPage();
            doc.addPage();
            page = page + 2;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, tipo, data, detalles, page);
          }
        }

        let maxPage = page + 1;
        ymin = 245;
        i = 0;
        page = 1;
        doc.addPage();
        doc.switchToPage(page);
        await this.generateHeader(doc, tipo, data, detalles, page);

        // Segunda pagina
        for (var item = 0; item < detalles.length; item++) {
          doc.font('Helvetica');
          doc.fontSize(7);

          doc
            .lineJoin('square')
            .rect(20, ymin + i - 10, 45, 20)
            .stroke();
          doc.y = ymin + i;
          doc.x = 18;
          doc.text(utils.formatNumber(detalles[item].valor_dolar), {
            align: 'right',
            columns: 1,
            width: 45,
          });

          doc
            .lineJoin('square')
            .rect(65, ymin + i - 10, 50, 20)
            .stroke();
          doc.y = ymin + i;
          doc.x = 63;
          doc.text(utils.formatNumber(detalles[item].peso_kgs), {
            align: 'right',
            columns: 1,
            width: 50,
          });

          doc
            .lineJoin('square')
            .rect(115, ymin + i - 10, 50, 20)
            .stroke();
          doc.y = ymin + i;
          doc.x = 115;
          doc.text('N/A', {
            align: 'center',
            columns: 1,
            width: 50,
          });

          doc
            .lineJoin('square')
            .rect(165, ymin + i - 10, 45, 20)
            .stroke();
          doc.y = ymin + i;
          doc.x = 165;
          doc.text('N/A', {
            align: 'center',
            columns: 1,
            width: 45,
          });

          let monto_total =
            utils.parseFloatN(detalles[item].monto_base) +
            utils.parseFloatN(detalles[item].monto_seguro);

          doc
            .lineJoin('square')
            .rect(210, ymin + i - 10, 55, 20)
            .stroke();
          doc.y = ymin + i;
          doc.x = 208;
          doc.text(utils.formatNumber(monto_total), {
            align: 'right',
            columns: 1,
            width: 55,
          });

          doc
            .lineJoin('square')
            .rect(265, ymin + i - 10, 25, 20)
            .stroke();
          doc.y = ymin + i;
          doc.x = 265;
          doc.text('N/A', {
            align: 'center',
            columns: 1,
            width: 25,
          });

          doc
            .lineJoin('square')
            .rect(290, ymin + i - 10, 50, 20)
            .stroke();
          doc.y = ymin + i;
          doc.x = 290;
          doc.text(
            utils.formatNumber(detalles[item]['movimientos.monto_fpo']) + '%',
            {
              align: 'center',
              columns: 1,
              width: 50,
            }
          );

          doc
            .lineJoin('square')
            .rect(340, ymin + i - 10, 50, 20)
            .stroke();
          doc.y = ymin + i;
          doc.x = 340;
          doc.text('N/A', {
            align: 'center',
            columns: 1,
            width: 50,
          });

          let fpo =
            monto_total *
            (utils.parseFloatN(detalles[item]['movimientos.monto_fpo']) / 100);

          doc
            .lineJoin('square')
            .rect(390, ymin + i - 10, 50, 20)
            .stroke();
          doc.y = ymin + i;
          doc.x = 388;
          doc.text(utils.formatNumber(fpo), {
            align: 'right',
            columns: 1,
            width: 50,
          });

          doc
            .lineJoin('square')
            .rect(440, ymin + i - 10, 50, 20)
            .stroke();
          doc.y = ymin + i;
          doc.x = 440;
          doc.text('VALENCIA', {
            align: 'center',
            columns: 1,
            width: 50,
          });

          doc
            .lineJoin('square')
            .rect(490, ymin + i - 10, 50, 20)
            .stroke();
          // Centrado vertical del texto de ciudad con menor interlineado
          let rectYCiudad = ymin + i - 10;
          let rectHeightCiudad = 20;
          let rectWidthCiudad = 48;
          let textCiudad =
            detalles[item]['movimientos.agencias_dest.ciudades.desc_ciudad'];
          doc.fontSize(6); // Reducir tamaño de fuente para más líneas
          let textHeightCiudad = doc.heightOfString(textCiudad, {
            width: rectWidthCiudad,
            align: 'center',
            lineGap: 1, // Menor interlineado
          });
          let textYCiudad =
            rectYCiudad + (rectHeightCiudad - textHeightCiudad) / 2;
          doc.y = textYCiudad + 2;
          doc.x = 491;
          doc.text(textCiudad, {
            align: 'center',
            columns: 1,
            width: rectWidthCiudad,
            lineGap: 1, // Menor interlineado
          });
          doc.fontSize(7); // Restaurar tamaño de fuente por defecto

          doc
            .lineJoin('square')
            .rect(540, ymin + i - 10, 55, 20)
            .stroke();
          // Centrado vertical y menor interlineado para contenido
          let rectYContenido = ymin + i - 10;
          let rectHeightContenido = 20;
          let rectWidthContenido = 53;
          let textContenido =
            detalles[item]['movimientos.clientes_org.contenido'];
          doc.fontSize(6); // Reducir tamaño de fuente para más líneas
          let textHeightContenido = doc.heightOfString(textContenido, {
            width: rectWidthContenido,
            align: 'center',
            lineGap: 1, // Menor interlineado
          });
          let textYContenido =
            rectYContenido + (rectHeightContenido - textHeightContenido) / 2;
          doc.y = textYContenido + 2;
          doc.x = 541;
          doc.text(textContenido, {
            align: 'center',
            columns: 1,
            width: rectWidthContenido,
            lineGap: 1, // Menor interlineado
          });
          doc.fontSize(7); // Restaurar tamaño de fuente por defecto

          total_peso += utils.parseFloatN(detalles[item].peso_kgs);
          total_total += utils.parseFloatN(monto_total);
          total_fpo += utils.parseFloatN(fpo);

          i += 20;
          if (i >= 550) {
            page = page + 2;
            if (page <= maxPage) {
              doc.switchToPage(page);
            }

            i = 0;
            await this.generateHeader(doc, tipo, data, detalles, page);
          }
        }

        // Totales Finales
        doc.font('Helvetica-Bold');
        doc
          .lineJoin('square')
          .rect(20, ymin + i - 10, 45, 27)
          .stroke();
        doc.y = ymin + i;
        doc.x = 20;
        doc.text('Totales:', {
          align: 'center',
          columns: 1,
          width: 45,
        });

        doc
          .lineJoin('square')
          .rect(65, ymin + i - 10, 50, 27)
          .stroke();
        doc.y = ymin + i;
        doc.x = 63;
        doc.text(utils.formatNumber(total_peso), {
          align: 'right',
          columns: 1,
          width: 50,
        });

        doc
          .lineJoin('square')
          .rect(115, ymin + i - 10, 50, 27)
          .stroke();
        doc
          .lineJoin('square')
          .rect(165, ymin + i - 10, 100, 27)
          .stroke();
        doc.y = ymin + i;
        doc.x = 163;
        doc.text(utils.formatNumber(total_total), {
          align: 'right',
          columns: 1,
          width: 100,
        });

        doc
          .lineJoin('square')
          .rect(265, ymin + i - 10, 25, 27)
          .stroke();
        doc
          .lineJoin('square')
          .rect(290, ymin + i - 10, 50, 27)
          .stroke();
        doc
          .lineJoin('square')
          .rect(340, ymin + i - 10, 100, 27)
          .stroke();
        doc.y = ymin + i;
        doc.x = 338;
        doc.text(utils.formatNumber(total_fpo), {
          align: 'right',
          columns: 1,
          width: 100,
        });

        doc
          .lineJoin('square')
          .rect(440, ymin + i - 10, 50, 27)
          .stroke();
        doc
          .lineJoin('square')
          .rect(490, ymin + i - 10, 50, 27)
          .stroke();
        doc
          .lineJoin('square')
          .rect(540, ymin + i - 10, 55, 27)
          .stroke();

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
      if (tipo != 'RD') {
        doc.fontSize(8);
        doc.font('Helvetica');
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
