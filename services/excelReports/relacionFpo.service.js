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
const clienteOrigDesc =
  '(CASE WHEN (id_clte_part_orig IS NULL || id_clte_part_orig = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `movimientos`.cod_cliente_org = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `movimientos`.id_clte_part_orig = clientes_particulares.id)' +
  ' END)';
const clienteOrigRif =
  '(CASE WHEN (id_clte_part_dest IS NULL || id_clte_part_dest = "")' +
  ' THEN (SELECT rif_cedula' +
  ' FROM clientes ' +
  ' WHERE `movimientos`.cod_cliente_dest = clientes.id)' +
  ' ELSE (SELECT rif_ci' +
  ' FROM clientes_particulares' +
  ' WHERE `movimientos`.id_clte_part_dest = clientes_particulares.id)' +
  ' END)';

class RelacionFpoService {
  async mainReport(worksheet, tipo, data) {
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

        where.nro_documento = {
          [Sequelize.Op.lte]: 550000000,
        };

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
                [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
                [Sequelize.literal(clienteOrigRif), 'cliente_orig_rif'],
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

    await this.generateHeader(worksheet, tipo, data, detalles);
    await this.generateCustomerInformation(worksheet, tipo, data, detalles);
    return true;
  }

  async generateHeader(worksheet, tipo, data, detalles) {
    switch (tipo) {
      case 'RG':
        worksheet.getCell('A1').value = 'RCS EXPRESS, S.A';
        worksheet.mergeCells('A1:B1');
        worksheet.getCell('A2').value = 'RIF. J-31028463-6';
        worksheet.mergeCells('A2:B2');
        worksheet.getCell('H1').value = 'FECHA:';
        worksheet.getCell('I1').value = moment().format('DD/MM/YYYY');

        worksheet.getCell('D3').value =
          'Relación de Pagos IPOSTEL Envíos Nacionales';
        worksheet.mergeCells('D3:G3');
        worksheet.getRow(3).alignment = { horizontal: 'center' };
        worksheet.getCell('D4').value = data.tittle;
        worksheet.mergeCells('D4:G4');
        worksheet.getCell('D4').alignment = { horizontal: 'center' };
        worksheet.getCell('D5').value = detalles.cliente;
        worksheet.mergeCells('D5:G5');
        worksheet.getCell('D5').alignment = { horizontal: 'center' };

        worksheet.getCell('A4').value = 'DESDE:';
        worksheet.getCell('B4').value = detalles.desde;
        worksheet.getCell('A5').value = 'HASTA:';
        worksheet.getCell('B5').value = detalles.hasta;

        worksheet.columns = [
          { key: 'A', width: 13 },
          { key: 'B', width: 16 },
          { key: 'C', width: 11 },
          { key: 'D', width: 11 },
          { key: 'E', width: 1 },
          { key: 'F', width: 1 },
          { key: 'G', width: 15 },
          { key: 'H', width: 11 },
          { key: 'I', width: 15 },
        ];

        worksheet.getCell('A8').value = 'Fecha';
        worksheet.getCell('A9').value = 'Emisión';
        worksheet.getCell('B8').value = 'Nro. Guía';
        worksheet.getCell('B9').value = 'Carga';
        worksheet.getCell('C9').value = 'Piezas';
        worksheet.getCell('D9').value = 'Peso';
        if (data.checkProtect) {
          worksheet.columns = [
            { key: 'E', width: 15 },
            { key: 'F', width: 15 },
          ];
          worksheet.getCell('E9').value = 'Monto Base';
          worksheet.getCell('F8').value = 'Protección';
          worksheet.getCell('F9').value = 'Envío';
        }
        worksheet.getCell('G8').value = 'Total';
        worksheet.getCell('G9').value = 'Flete';
        worksheet.getCell('H9').value = 'Porcentaje';
        worksheet.getCell('I9').value = 'Monto FPO';

        worksheet.getRow(8).alignment = { horizontal: 'center' };
        worksheet.getRow(9).alignment = { horizontal: 'center' };

        break;
      case 'RE':
      case 'REG':
        worksheet.getCell('A1').value = 'RCS EXPRESS, S.A';
        worksheet.getCell('A2').value = 'RIF. J-31028463-6';
        worksheet.getCell('G1').value = 'FECHA:';
        worksheet.getCell('H1').value = moment().format('DD/MM/YYYY');

        worksheet.getCell('C3').value =
          'Relación de Pagos IPOSTEL Envíos Nacionales';
        worksheet.mergeCells('C3:F3');
        worksheet.getRow(3).alignment = { horizontal: 'center' };
        worksheet.getCell('C4').value = data.tittle;
        worksheet.mergeCells('C4:F4');
        worksheet.getCell('C4').alignment = { horizontal: 'center' };
        worksheet.getCell('C5').value = detalles.cliente;
        worksheet.mergeCells('C5:F5');
        worksheet.getCell('C5').alignment = { horizontal: 'center' };

        worksheet.getCell('A4').value = 'DESDE: ' + detalles.desde;
        worksheet.getCell('A5').value = 'HASTA: ' + detalles.hasta;

        worksheet.columns = [
          { key: 'A', width: 25 },
          { key: 'B', width: 11 },
          { key: 'C', width: 11 },
          { key: 'D', width: 1 },
          { key: 'E', width: 1 },
          { key: 'F', width: 15 },
          { key: 'G', width: 11 },
          { key: 'H', width: 13 },
        ];

        worksheet.getCell('A9').value = 'Rangos';
        worksheet.getCell('B9').value = 'Peso';
        worksheet.getCell('C9').value = 'Piezas';

        if (data.checkProtect) {
          worksheet.columns = [
            { key: 'D', width: 15 },
            { key: 'E', width: 15 },
          ];
          worksheet.getCell('D9').value = 'Monto Base';
          worksheet.getCell('E8').value = 'Protección';
          worksheet.getCell('E9').value = 'Envío';
        }

        worksheet.getCell('F8').value = 'Total';
        worksheet.getCell('F9').value = 'Flete';
        worksheet.getCell('G9').value = 'Porcentaje';
        worksheet.getCell('H9').value = 'Monto FPO';

        worksheet.getRow(8).alignment = { horizontal: 'center' };
        worksheet.getRow(9).alignment = { horizontal: 'center' };

        break;
      case 'PA':
        worksheet.getCell('A1').value = 'RCS EXPRESS, S.A';
        worksheet.getCell('A2').value = 'RIF. J-31028463-6';
        worksheet.getCell('E1').value = 'FECHA:';
        worksheet.getCell('F1').value = moment().format('DD/MM/YYYY');

        worksheet.getCell('B3').value =
          'Relación de Pagos IPOSTEL Envíos Nacionales';
        worksheet.mergeCells('B3:E3');
        worksheet.getRow(3).alignment = { horizontal: 'center' };
        worksheet.getCell('B4').value = data.tittle;
        worksheet.mergeCells('B4:E4');
        worksheet.getCell('B4').alignment = { horizontal: 'center' };
        worksheet.getCell('B5').value = detalles.cliente;
        worksheet.mergeCells('B5:E5');
        worksheet.getCell('B5').alignment = { horizontal: 'center' };

        worksheet.getCell('A4').value = 'DESDE: ' + detalles.desde;
        worksheet.getCell('A5').value = 'HASTA: ' + detalles.hasta;

        worksheet.columns = [
          { key: 'A', width: 25 },
          { key: 'B', width: 15 },
          { key: 'C', width: 11 },
          { key: 'D', width: 15 },
          { key: 'E', width: 15 },
          { key: 'F', width: 15 },
        ];

        worksheet.getCell('A9').value = 'ESCALA DE PESO (Grs.)';
        worksheet.getCell('B8').value = 'TARIFA DE';
        worksheet.getCell('B9').value = 'SERVICIO';
        worksheet.getCell('C9').value = 'TARIFA %';
        worksheet.getCell('D8').value = 'MONTO DE';
        worksheet.getCell('D9').value = 'FPO';
        worksheet.getCell('E8').value = 'PIEZAS';
        worksheet.getCell('E9').value = 'MOVILIZADAS';
        worksheet.getCell('F8').value = 'MONTO';
        worksheet.getCell('F9').value = 'CAUSADO';

        worksheet.getRow(8).alignment = { horizontal: 'center' };
        worksheet.getRow(9).alignment = { horizontal: 'center' };

        break;
      case 'RD':
        worksheet.columns = [
          { key: 'A', width: 12 },
          { key: 'B', width: 11 },
          { key: 'C', width: 13 },
          { key: 'D', width: 60 },
          { key: 'E', width: 11 },
          { key: 'F', width: 11 },
          { key: 'G', width: 7 },
          { key: 'H', width: 11 },
          { key: 'I', width: 11 },
          { key: 'J', width: 11 },
          { key: 'K', width: 11 },
          { key: 'L', width: 20 },
          { key: 'M', width: 11 },
          { key: 'N', width: 13 },
          { key: 'O', width: 7 },
          { key: 'P', width: 17 },
          { key: 'Q', width: 9 },
          { key: 'R', width: 17 },
          { key: 'S', width: 10 },
          { key: 'T', width: 25 },
          { key: 'U', width: 15 },
        ];

        worksheet.getCell('A1').value = 'N° de';
        worksheet.getCell('A2').value = 'Operación';
        worksheet.getCell('B1').value = 'Fecha de';
        worksheet.getCell('B2').value = 'Factura';
        worksheet.getCell('C2').value = 'Nº R.I.F.';
        worksheet.getCell('D2').value = 'Proveedor o Razón Social';
        worksheet.getCell('E1').value = 'N° de';
        worksheet.getCell('E2').value = 'Guía';
        worksheet.getCell('F1').value = 'Fecha de';
        worksheet.getCell('F2').value = 'Guía';
        worksheet.getCell('G2').value = 'Serie';
        worksheet.getCell('H1').value = 'N° de';
        worksheet.getCell('H2').value = 'Factura';
        worksheet.getCell('I1').value = 'N° de';
        worksheet.getCell('I2').value = 'Control';
        worksheet.getCell('J1').value = 'Tasa de';
        worksheet.getCell('J2').value = 'Cambio';
        worksheet.getCell('K2').value = 'Peso';
        worksheet.getCell('L1').value = 'Total Ventas Internas';
        worksheet.getCell('L2').value = 'Incluyendo el Iva';
        worksheet.getCell('M1').value = 'Base';
        worksheet.getCell('M2').value = 'Imponible';
        worksheet.getCell('N1').value = 'Monto';
        worksheet.getCell('N2').value = 'Exento';
        worksheet.getCell('O2').value = '% IVA';
        worksheet.getCell('P1').value = '% Franqueo';
        worksheet.getCell('P2').value = 'Postal Obligatorio';
        worksheet.getCell('Q1').value = 'Impuesto';
        worksheet.getCell('Q2').value = 'IVA';
        worksheet.getCell('R1').value = 'Franqueo';
        worksheet.getCell('R2').value = 'Postal Obligatorio';
        worksheet.getCell('S2').value = 'Origen';
        worksheet.getCell('T2').value = 'Destino';
        worksheet.getCell('U2').value = 'Contenido';

        worksheet.getRow(1).alignment = { horizontal: 'center' };
        worksheet.getRow(2).alignment = { horizontal: 'center' };
        break;
      default:
        break;
    }
  }

  async generateCustomerInformation(worksheet, tipo, data, detalles) {
    let total_piezas = 0;
    let total_peso = 0;
    let total_base = 0;
    let total_seguro = 0;
    let total_total = 0;
    let total_fpo = 0;
    let total_causado = 0;

    switch (tipo) {
      case 'RG':
        var i = 10;
        for (var item = 0; item < detalles.length; item++) {
          worksheet.getCell('A' + i).value = moment(
            detalles[item]['movimientos.fecha_emision']
          ).format('DD/MM/YYYY');
          worksheet.getCell('B' + i).value = parseFloat(
            detalles[item]['movimientos.nro_documento']
          );
          worksheet.getCell('C' + i).value = parseInt(
            detalles[item].nro_piezas
          );
          worksheet.getCell('D' + i).value = utils.parseFloatN(
            detalles[item].peso_kgs
          );

          if (data.checkProtect) {
            worksheet.getCell('E' + i).value = utils.parseFloatN(
              detalles[item].monto_base
            );
            worksheet.getCell('F' + i).value = utils.parseFloatN(
              detalles[item].monto_seguro
            );
          }

          let monto_total =
            utils.parseFloatN(detalles[item].monto_base) +
            utils.parseFloatN(detalles[item].monto_seguro);
          worksheet.getCell('G' + i).value = utils.parseFloatN(monto_total);
          worksheet.getCell('H' + i).value =
            detalles[item]['movimientos.monto_fpo'] + '%';

          let fpo =
            monto_total *
            (parseInt(detalles[item]['movimientos.monto_fpo']) / 100);
          worksheet.getCell('I' + i).value = utils.parseFloatN(fpo);

          total_piezas += utils.parseFloatN(detalles[item].nro_piezas);
          total_peso += utils.parseFloatN(detalles[item].peso_kgs);
          total_base += utils.parseFloatN(detalles[item].monto_base);
          total_seguro += utils.parseFloatN(detalles[item].monto_seguro);
          total_total += utils.parseFloatN(monto_total);
          total_fpo += utils.parseFloatN(fpo);
          i++;
        }

        i = detalles.length + 11;
        worksheet.getCell('A' + i).value = 'TOTALES:';
        worksheet.getCell('C' + i).value = parseFloat(total_piezas);
        worksheet.getCell('D' + i).value = parseFloat(total_peso);
        if (data.checkProtect) {
          worksheet.getCell('E' + i).value = parseFloat(total_base);
          worksheet.getCell('F' + i).value = parseFloat(total_seguro);
        }
        worksheet.getCell('G' + i).value = parseFloat(total_total);
        worksheet.getCell('I' + i).value = parseFloat(total_fpo);
        break;
      case 'RE':
        var i = 10;
        for (var item = 0; item < detalles.length; item++) {
          worksheet.getCell('A' + i).value = detalles[item].desc_fpo;
          worksheet.getCell('B' + i).value = utils.parseFloatN(
            detalles[item].peso_kgs
          );
          worksheet.getCell('C' + i).value = parseInt(
            detalles[item].nro_piezas
          );

          if (data.checkProtect) {
            worksheet.getCell('D' + i).value = utils.parseFloatN(
              detalles[item].monto_base
            );
            worksheet.getCell('E' + i).value = utils.parseFloatN(
              detalles[item].monto_seguro
            );
          }

          let monto_total =
            utils.parseFloatN(detalles[item].monto_base) +
            utils.parseFloatN(detalles[item].monto_seguro);
          worksheet.getCell('F' + i).value = utils.parseFloatN(monto_total);
          worksheet.getCell('G' + i).value = detalles[item].valor_fpo + '%';

          let fpo = monto_total * (parseInt(detalles[item].valor_fpo) / 100);
          worksheet.getCell('H' + i).value = utils.parseFloatN(fpo);

          total_peso += utils.parseFloatN(detalles[item].peso_kgs);
          total_piezas += utils.parseFloatN(detalles[item].nro_piezas);
          total_base += utils.parseFloatN(detalles[item].monto_base);
          total_seguro += utils.parseFloatN(detalles[item].monto_seguro);
          total_total += utils.parseFloatN(monto_total);
          total_fpo += utils.parseFloatN(fpo);
          i++;
        }

        i = detalles.length + 11;
        worksheet.getCell('A' + i).value = 'TOTALES:';
        worksheet.getCell('B' + i).value = parseFloat(total_peso);
        worksheet.getCell('C' + i).value = parseFloat(total_piezas);
        if (data.checkProtect) {
          worksheet.getCell('D' + i).value = parseFloat(total_base);
          worksheet.getCell('E' + i).value = parseFloat(total_seguro);
        }
        worksheet.getCell('F' + i).value = parseFloat(total_total);
        worksheet.getCell('H' + i).value = parseFloat(total_fpo);
        break;
      case 'REG':
        var i = 10;
        var j = 0;
        for (var item = 0; item < detalles.length; item++) {
          if (
            item == 0 ||
            detalles[item].cliente_orig != detalles[item - 1].cliente_orig
          ) {
            if (item != 0) {
              i++;
              j++;
            }
            worksheet.getCell('A' + i).value = detalles[item].cliente_orig;
            worksheet.mergeCells('A' + i + ':E' + i);
            i++;
            j++;
          }

          worksheet.getCell('A' + i).value = detalles[item].desc_fpo;
          worksheet.getCell('B' + i).value = utils.parseFloatN(
            detalles[item].peso_kgs
          );
          worksheet.getCell('C' + i).value = parseInt(
            detalles[item].nro_piezas
          );

          if (data.checkProtect) {
            worksheet.getCell('D' + i).value = utils.parseFloatN(
              detalles[item].monto_base
            );
            worksheet.getCell('E' + i).value = utils.parseFloatN(
              detalles[item].monto_seguro
            );
          }

          let monto_total =
            utils.parseFloatN(detalles[item].monto_base) +
            utils.parseFloatN(detalles[item].monto_seguro);
          worksheet.getCell('F' + i).value = utils.parseFloatN(monto_total);
          worksheet.getCell('G' + i).value = detalles[item].valor_fpo + '%';

          let fpo = monto_total * (parseInt(detalles[item].valor_fpo) / 100);
          worksheet.getCell('H' + i).value = utils.parseFloatN(fpo);

          total_peso += utils.parseFloatN(detalles[item].peso_kgs);
          total_piezas += utils.parseFloatN(detalles[item].nro_piezas);
          total_base += utils.parseFloatN(detalles[item].monto_base);
          total_seguro += utils.parseFloatN(detalles[item].monto_seguro);
          total_total += utils.parseFloatN(monto_total);
          total_fpo += utils.parseFloatN(fpo);
          i++;
        }

        i = detalles.length + 11 + j;
        worksheet.getCell('A' + i).value = 'TOTALES:';
        worksheet.getCell('B' + i).value = parseFloat(total_peso);
        worksheet.getCell('C' + i).value = parseFloat(total_piezas);
        if (data.checkProtect) {
          worksheet.getCell('D' + i).value = parseFloat(total_base);
          worksheet.getCell('E' + i).value = parseFloat(total_seguro);
        }
        worksheet.getCell('F' + i).value = parseFloat(total_total);
        worksheet.getCell('H' + i).value = parseFloat(total_fpo);
        break;
      case 'PA':
        var i = 10;
        for (var item = 0; item < detalles.length; item++) {
          worksheet.getCell('A' + i).value = detalles[item].desc_fpo;

          let monto_total =
            utils.parseFloatN(detalles[item].monto_base) +
            utils.parseFloatN(detalles[item].monto_seguro);
          worksheet.getCell('B' + i).value = utils.parseFloatN(monto_total);

          worksheet.getCell('C' + i).value = detalles[item].valor_fpo + '%';

          let monto_causado =
            monto_total * (parseInt(detalles[item].valor_fpo) / 100);
          let fpo = monto_causado / detalles[item].nro_piezas;
          worksheet.getCell('D' + i).value = utils.parseFloatN(fpo);

          worksheet.getCell('E' + i).value = parseInt(
            detalles[item].nro_piezas
          );
          worksheet.getCell('F' + i).value = utils.parseFloatN(monto_causado);

          total_piezas += utils.parseFloatN(detalles[item].nro_piezas);
          total_causado += utils.parseFloatN(monto_causado);
          i++;
        }

        i = detalles.length + 11;
        worksheet.getCell('C' + i).value = 'TOTAL CAUSADO:';
        worksheet.getCell('E' + i).value = parseFloat(total_piezas);
        worksheet.getCell('F' + i).value = parseFloat(total_causado);
        break;
      case 'RD':
        var i = 3;
        for (var item = 0; item < detalles.length; item++) {
          worksheet.getCell('A' + i).value = item + 1;
          worksheet.getCell('B' + i).value = detalles[item].fecha_fact
            ? moment(detalles[item].fecha_fact).format('DD/MM/YYYY')
            : '';
          worksheet.getCell('C' + i).value =
            detalles[item]['movimientos.cliente_orig_rif'];
          worksheet.getCell('D' + i).value =
            detalles[item]['movimientos.cliente_orig_desc'];
          worksheet.getCell('E' + i).value = parseFloat(
            detalles[item]['movimientos.nro_documento']
          );
          worksheet.getCell('F' + i).value = moment(
            detalles[item]['movimientos.fecha_emision']
          ).format('DD/MM/YYYY');
          worksheet.getCell('G' + i).value = 'N/A';
          worksheet.getCell('H' + i).value = detalles[item][
            'movimientos.nro_ctrl_doc_ppal'
          ]
            ? parseFloat(detalles[item]['movimientos.nro_ctrl_doc_ppal'])
            : '';
          worksheet.getCell('I' + i).value = detalles[item][
            'movimientos.nro_ctrl_doc_ppal_new'
          ]
            ? detalles[item]['movimientos.nro_ctrl_doc_ppal_new'].padStart(
                9,
                '00-000000'
              )
            : '';
          worksheet.getCell('J' + i).value = utils.parseFloatN(
            detalles[item].valor_dolar
          );
          worksheet.getCell('K' + i).value = utils.parseFloatN(
            detalles[item].peso_kgs
          );
          worksheet.getCell('L' + i).value = 'N/A';
          worksheet.getCell('M' + i).value = 'N/A';

          let monto_total =
            utils.parseFloatN(detalles[item].monto_base) +
            utils.parseFloatN(detalles[item].monto_seguro);
          worksheet.getCell('N' + i).value = utils.parseFloatN(monto_total);
          worksheet.getCell('O' + i).value = 'N/A';
          worksheet.getCell('P' + i).value =
            detalles[item]['movimientos.monto_fpo'] + '%';
          worksheet.getCell('Q' + i).value = 'N/A';

          let fpo =
            monto_total *
            (utils.parseFloatN(detalles[item]['movimientos.monto_fpo']) / 100);
          worksheet.getCell('R' + i).value = utils.parseFloatN(fpo);
          worksheet.getCell('S' + i).value = 'VALENCIA';
          worksheet.getCell('T' + i).value =
            detalles[item]['movimientos.agencias_dest.ciudades.desc_ciudad'];
          worksheet.getCell('U' + i).value =
            detalles[item]['movimientos.clientes_org.contenido'];

          total_peso += utils.parseFloatN(detalles[item].peso_kgs);
          total_base += utils.parseFloatN(monto_total);
          total_fpo += utils.parseFloatN(fpo);

          i++;
        }

        i = detalles.length + 3;
        worksheet.getCell('J' + i).value = 'Totales:';
        worksheet.getCell('K' + i).value = parseFloat(total_peso);
        worksheet.getCell('N' + i).value = parseFloat(total_base);
        worksheet.getCell('R' + i).value = parseFloat(total_fpo);
        break;
      default:
        break;
    }
  }
}

module.exports = RelacionFpoService;
