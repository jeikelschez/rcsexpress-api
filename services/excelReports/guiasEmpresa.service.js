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
const clienteDestDesc =
  '(CASE WHEN (id_clte_part_dest IS NULL || id_clte_part_dest = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `Mmovimientos`.cod_cliente_dest = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `Mmovimientos`.id_clte_part_dest = clientes_particulares.id)' +
  ' END)';
const motivoRetraso =
  '(SELECT desc_concepto' +
  ' FROM conceptos_operacion' +
  ' WHERE `Mmovimientos`.cod_motivo_retraso = conceptos_operacion.cod_concepto)';
const estatus_operativo = [
  { label: 'En proceso de envío', value: 'PR' },
  { label: 'Pendiente por entregar', value: 'PE' },
  { label: 'Entregada conforme', value: 'CO' },
  { label: 'Entregada no conforme', value: 'NC' },
];

class GuiasEmpresaService {
  async mainReport(worksheet, client, desde, hasta, estatus, ciudad, guia) {
    let params = {};
    let params2 = {};
    let data = {};

    params.cod_cliente_org = client;
    params.fecha_emision = {
      [Sequelize.Op.between]: [desde, hasta],
    };
    params.t_de_documento = 'GC';

    if (guia) {
      params.nro_documento = guia;
    }

    if (estatus) {
      params.estatus_operativo = estatus;
    }

    if (ciudad) {
      params2.id = ciudad;
    }

    let detalles = await models.Mmovimientos.findAll({
      where: params,
      attributes: [
        'cod_cliente_org',
        'nro_documento',
        'dimensiones',
        'nro_piezas',
        'peso_kgs',
        'persona_recibio',
        'ci_persona_recibio',
        'fecha_emision',
        'fecha_envio',
        'fecha_recepcion',
        'hora_recepcion',
        'estatus_operativo',
        'observacion_entrega',
        'modalidad_pago',
        'cod_agencia_transito',
        [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
        [Sequelize.literal(clienteDestDesc), 'cliente_dest_desc'],
        [Sequelize.literal(motivoRetraso), 'motivo_retraso'],
      ],
      include: [
        {
          model: models.Agencias,
          as: 'agencias_dest',
          attributes: ['id'],
          required: true,
          include: [
            {
              model: models.Ciudades,
              as: 'ciudades',
              required: true,
              where: params2,
            },
          ],
        },
        {
          model: models.Agencias,
          as: 'agencias_trans',
          attributes: ['id', 'nb_agencia'],
          required: false,
        },
      ],
      order: [['nro_documento', 'DESC']],
      raw: true,
    });

    if (detalles.length == 0) return false;

    data.cliente = detalles[0].cliente_orig_desc;
    data.fecha_desde = desde;
    data.fecha_hasta = hasta;

    data.estatus = 'TODOS';
    if (estatus) {
      data.estatus = estatus_operativo.find(
        (item) => item.value == estatus
      ).label;
    }

    data.destino = 'TODOS';
    if (ciudad) {
      data.destino = detalles[0]['agencias_dest.ciudades.desc_ciudad'];
    }

    await this.generateHeader(worksheet, data);
    await this.generateCustomerInformation(worksheet, detalles);
    return true;
  }

  async generateHeader(worksheet, data) {
    worksheet.getCell('A1').style = { font: { bold: true } };
    worksheet.getCell('A2').style = { font: { bold: true } };
    worksheet.getCell('A3').style = { font: { bold: true } };
    worksheet.getCell('C2').style = { font: { bold: true } };
    worksheet.getCell('C3').style = { font: { bold: true } };

    worksheet.getCell('A5').style = {
      font: { bold: true, color: { argb: 'FFFFFF' } },
    };
    worksheet.getCell('B5').style = {
      font: { bold: true, color: { argb: 'FFFFFF' } },
    };
    worksheet.getCell('C5').style = {
      font: { bold: true, color: { argb: 'FFFFFF' } },
    };
    worksheet.getCell('D5').style = {
      font: { bold: true, color: { argb: 'FFFFFF' } },
    };
    worksheet.getCell('E5').style = {
      font: { bold: true, color: { argb: 'FFFFFF' } },
    };
    worksheet.getCell('F5').style = {
      font: { bold: true, color: { argb: 'FFFFFF' } },
    };
    worksheet.getCell('G5').style = {
      font: { bold: true, color: { argb: 'FFFFFF' } },
    };
    worksheet.getCell('H5').style = {
      font: { bold: true, color: { argb: 'FFFFFF' } },
    };
    worksheet.getCell('I5').style = {
      font: { bold: true, color: { argb: 'FFFFFF' } },
    };
    worksheet.getCell('J5').style = {
      font: { bold: true, color: { argb: 'FFFFFF' } },
    };
    worksheet.getCell('K5').style = {
      font: { bold: true, color: { argb: 'FFFFFF' } },
    };
    worksheet.getCell('L5').style = {
      font: { bold: true, color: { argb: 'FFFFFF' } },
    };

    worksheet.getCell('A5').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0B2488' },
      bgColor: { argb: '0B2488' },
    };
    worksheet.getCell('B5').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0B2488' },
      bgColor: { argb: '0B2488' },
    };
    worksheet.getCell('C5').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0B2488' },
      bgColor: { argb: '0B2488' },
    };
    worksheet.getCell('D5').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0B2488' },
      bgColor: { argb: '0B2488' },
    };
    worksheet.getCell('E5').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0B2488' },
      bgColor: { argb: '0B2488' },
    };
    worksheet.getCell('F5').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0B2488' },
      bgColor: { argb: '0B2488' },
    };
    worksheet.getCell('G5').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0B2488' },
      bgColor: { argb: '0B2488' },
    };
    worksheet.getCell('H5').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0B2488' },
      bgColor: { argb: '0B2488' },
    };
    worksheet.getCell('I5').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0B2488' },
      bgColor: { argb: '0B2488' },
    };
    worksheet.getCell('J5').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0B2488' },
      bgColor: { argb: '0B2488' },
    };
    worksheet.getCell('K5').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0B2488' },
      bgColor: { argb: '0B2488' },
    };
    worksheet.getCell('L5').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0B2488' },
      bgColor: { argb: '0B2488' },
    };

    worksheet.getCell('B1').alignment = { horizontal: 'center' };
    worksheet.getCell('D2').alignment = { horizontal: 'center' };
    worksheet.getCell('D3').alignment = { horizontal: 'center' };
    worksheet.getRow(5).alignment = { horizontal: 'center' };

    worksheet.getRow(5).height = 27;

    worksheet.mergeCells('B1:D1');
    worksheet.getCell('A1').value = 'Empresa:';
    worksheet.getCell('B1').value = data.cliente;
    worksheet.getCell('A2').value = 'Desde:';
    worksheet.getCell('B2').value = data.fecha_desde;
    worksheet.getCell('A3').value = 'Hasta:';
    worksheet.getCell('B3').value = data.fecha_hasta;
    worksheet.getCell('C2').value = 'Estatus:';
    worksheet.getCell('D2').value = data.estatus;
    worksheet.getCell('C3').value = 'Destino:';
    worksheet.getCell('D3').value = data.destino;

    worksheet.columns = [
      { key: 'A', width: 15 },
      { key: 'B', width: 10 },
      { key: 'C', width: 20 },
      { key: 'D', width: 30 },
      { key: 'E', width: 8 },
      { key: 'F', width: 8 },
      { key: 'G', width: 15 },
      { key: 'H', width: 10 },
      { key: 'I', width: 12 },
      { key: 'J', width: 12 },
      { key: 'K', width: 15 },
      { key: 'L', width: 20 },
    ];

    worksheet.getCell('A5').value = 'Destino';
    worksheet.getCell('B5').value = 'Guía';
    worksheet.getCell('C5').value = 'N° Fact Cliente';
    worksheet.getCell('D5').value = 'Destinatario';
    worksheet.getCell('E5').value = 'Piezas';
    worksheet.getCell('F5').value = 'Peso';
    worksheet.getCell('G5').value = 'Receptor';
    worksheet.getCell('H5').value = 'CI/Rif';
    worksheet.getCell('I5').value = 'Emisión';
    worksheet.getCell('J5').value = 'Recepción';
    worksheet.getCell('K5').value = 'Estatus';
    worksheet.getCell('L5').value = 'Motivo Retraso';
  }

  async generateCustomerInformation(worksheet, detalles) {
    var i = 6;
    for (var item = 0; item < detalles.length; item++) {
      worksheet.getRow(i).height = 27;

      worksheet.getCell('A' + i).alignment = {
        wrapText: true,
        horizontal: 'center',
      };
      worksheet.getCell('C' + i).alignment = {
        wrapText: true,
        horizontal: 'center',
      };
      worksheet.getCell('D' + i).alignment = {
        wrapText: true,
        horizontal: 'center',
      };
      worksheet.getCell('G' + i).alignment = {
        wrapText: true,
        horizontal: 'center',
      };
      worksheet.getCell('H' + i).alignment = {
        wrapText: true,
        horizontal: 'center',
      };
      worksheet.getCell('I' + i).alignment = {
        wrapText: true,
        horizontal: 'center',
      };
      worksheet.getCell('J' + i).alignment = {
        wrapText: true,
        horizontal: 'center',
      };
      worksheet.getCell('K' + i).alignment = {
        wrapText: true,
        horizontal: 'center',
      };
      worksheet.getCell('L' + i).alignment = {
        wrapText: true,
        horizontal: 'center',
      };

      worksheet.getCell('A' + i).value =
        detalles[item]['agencias_dest.ciudades.desc_ciudad'];
      worksheet.getCell('B' + i).value = parseFloat(
        detalles[item].nro_documento
      );
      worksheet.getCell('C' + i).value = this.hasNonNumericCharacters(
        detalles[item].dimensiones
      )
        ? detalles[item].dimensiones
        : parseFloat(detalles[item].dimensiones);
      worksheet.getCell('D' + i).value = detalles[item].cliente_dest_desc;
      worksheet.getCell('E' + i).value = parseFloat(detalles[item].nro_piezas);
      worksheet.getCell('F' + i).value = parseFloat(
        detalles[item].peso_kgs
      );
      worksheet.getCell('G' + i).value =
        detalles[item].persona_recibio == null ||
        detalles[item].persona_recibio == ''
          ? 'NO DEFINIDO'
          : detalles[item].persona_recibio;
      worksheet.getCell('H' + i).value = detalles[item].ci_persona_recibio;
      worksheet.getCell('I' + i).value = moment(
        detalles[item].fecha_emision
      ).format('DD/MM/YYYY');
      worksheet.getCell('J' + i).value =
        detalles[item].fecha_recepcion == null
          ? ''
          : moment(detalles[item].fecha_recepcion).format('DD/MM/YYYY');
      worksheet.getCell('K' + i).value = estatus_operativo.find(
        (estatus) => estatus.value == detalles[item].estatus_operativo
      ).label;

      let fecha_recepcion = moment(
        detalles[item].fecha_recepcion,
        'YYYY-MM-DD'
      );
      let fecha_emision = moment(detalles[item].fecha_emision, 'YYYY-MM-DD');
      let dias = fecha_recepcion.diff(fecha_emision, 'days');

      let motivo = '';
      if (
        detalles[item].observacion_entrega != null ||
        detalles[item].motivo_retraso != null
      ) {
        if (detalles[item].motivo_retraso != null) {
          motivo = detalles[item].motivo_retraso + '. ';
        }
        if (detalles[item].observacion_entrega != null) {
          motivo = detalles[item].observacion_entrega;
        }

        motivo += ' ' + dias;
        if (dias == 1) {
          motivo += ' Día';
        } else if (dias > 1) {
          motivo += ' Días';
        }
      }
      worksheet.getCell('L' + i).value = motivo;

      i++;
    }
  }

  hasNonNumericCharacters(str) {
    if(str == null) return true;
    for (let char of str) {
      if (isNaN(char)) {
        return true;
      }
    }
    return false;
  }
}

module.exports = GuiasEmpresaService;
