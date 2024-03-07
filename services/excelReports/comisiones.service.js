const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

const fechaEnvioCosto =
  '(SELECT max(costos_transporte.fecha_envio) ' +
  ' FROM detalle_costos_guias ' +
  ' JOIN costos_transporte ON detalle_costos_guias.cod_costo = costos_transporte.id ' +
  ' WHERE `Mmovimientos`.id = detalle_costos_guias.cod_movimiento)';
const comisionEnt =
  '(SELECT ROUND(`Mmovimientos`.base_comision_vta_rcl * (agentes.porc_comision_entrega / 100), 2) ' +
  ' FROM agentes ' +
  ' WHERE `Mmovimientos`.cod_agente_entrega = agentes.id)';
const comisionSeg =
  '(SELECT ROUND(`Mmovimientos`.base_comision_seg * (agentes.porc_comision_seguro / 100), 2) ' +
  ' FROM agentes ' +
  ' WHERE `Mmovimientos`.cod_agente_entrega = agentes.id)';
const valorDolar =
  '(SELECT valor FROM historico_dolar ' +
  ' WHERE historico_dolar.fecha = `Mmovimientos`.fecha_emision)';
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
const estatus_operativo = [
  { label: 'En Envío', value: 'PR' },
  { label: 'Por Entregar', value: 'PE' },
  { label: 'Conforme', value: 'CO' },
  { label: 'No Conforme', value: 'NC' },
];

class ComisionesService {
  async mainReport(worksheet, data, desde, hasta, dolar) {
    data = JSON.parse(data);
    let detalles = await models.Mmovimientos.findAll({
      where: {
        id: {
          [Sequelize.Op.in]: data,
        },
      },
      attributes: [
        'nro_documento',
        'fecha_emision',
        'carga_neta',
        'nro_piezas',
        'fecha_envio',
        'fecha_recepcion',
        'monto_total',
        'estatus_operativo',
        'cod_agencia_dest',
        'cod_agente_entrega',
        [Sequelize.literal(fechaEnvioCosto), 'fecha_envio_costo'],
        [Sequelize.literal(comisionEnt), 'comision_entrega'],
        [Sequelize.literal(comisionSeg), 'comision_seguro'],
        [Sequelize.literal(valorDolar), 'valor_dolar'],
        [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
        [Sequelize.literal(clienteDestDesc), 'cliente_dest_desc'],
      ],
      include: [
        {
          model: models.Agencias,
          as: 'agencias',
          attributes: ['nb_agencia'],
          include: [
            {
              model: models.Ciudades,
              as: 'ciudades',
              attributes: ['siglas'],
            },
          ],
        },
        {
          model: models.Agencias,
          as: 'agencias_dest',
          attributes: ['nb_agencia'],
        },
        {
          model: models.Agentes,
          as: 'agentes_entrega',
          attributes: [
            'persona_responsable',
            'porc_comision_entrega',
            'porc_comision_seguro',
          ],
        },
      ],
      order: [
        ['cod_agencia_dest', 'ASC'],
        ['cod_agente_entrega', 'ASC'],
        ['nro_documento', 'ASC'],
        ['fecha_emision', 'ASC'],
      ],
      raw: true,
    });

    if (detalles.length == 0) return false;
    await this.generateHeader(worksheet, desde, hasta, dolar);
    await this.generateCustomerInformation(worksheet, detalles, dolar);
    return true;
  }

  async generateHeader(worksheet, desde, hasta, dolar) {
    worksheet.getCell('A2').value = 'COMISIONES DE ENTREGA POR GENERAR';
    worksheet.getCell('A3').value = 'DESDE:';
    worksheet.getCell('B3').value = desde;
    worksheet.getCell('A4').value = 'HASTA:';
    worksheet.getCell('B4').value = hasta;
    worksheet.getCell('A5').value = 'FECHA:';
    worksheet.getCell('B5').value = moment().format('DD/MM/YYYY');
    worksheet.columns = [
      { key: 'A', width: 10 },
      { key: 'B', width: 30 },
      { key: 'C', width: 30 },
      { key: 'D', width: 17 },
      { key: 'E', width: 13 },
      { key: 'F', width: 8 },
      { key: 'G', width: 8 },
      { key: 'H', width: 13 },
      { key: 'I', width: 13 },
      { key: 'J', width: 6 },
      { key: 'K', width: 6 },
      { key: 'L', width: 30 },
      { key: 'M', width: 15 },
      { key: 'N', width: 10 },
      { key: 'O', width: dolar == 'true' ? 10 : 0 },
      { key: 'P', width: 10 },
      { key: 'Q', width: dolar == 'true' ? 10 : 0 },
      { key: 'R', width: 10 },
      { key: 'S', width: dolar == 'true' ? 10 : 0 },
    ];

    worksheet.getCell('A7').value = '#';
    worksheet.getCell('B7').value = 'Agencia Destino';
    worksheet.getCell('C7').value = 'Agente Entrega';
    worksheet.getCell('D7').value = 'Nro. Documento';
    worksheet.getCell('E7').value = 'Fecha Emisión';
    worksheet.getCell('F7').value = 'Kilos';
    worksheet.getCell('G7').value = 'Piezas';
    worksheet.getCell('H7').value = 'Fecha Envío';
    worksheet.getCell('I7').value = 'Fecha Entrega';
    worksheet.getCell('J7').value = 'Días';
    worksheet.getCell('K7').value = 'Org.';
    worksheet.getCell('L7').value = 'Cliente';
    worksheet.getCell('M7').value = 'Estatus Oper.';
    worksheet.getCell('N7').value = 'Total';
    worksheet.getCell('P7').value = 'Entrega';
    worksheet.getCell('R7').value = 'Seguro';
    if (dolar == 'true') {
      worksheet.getCell('O7').value = 'Total $';
      worksheet.getCell('Q7').value = 'Entrega $ ';
      worksheet.getCell('S7').value = 'Seguro $';
    }
  }

  async generateCustomerInformation(worksheet, detalles, dolar) {
    var i = 8;
    for (var item = 0; item < detalles.length; item++) {
      worksheet.getCell('A' + i).value = item + 1;
      worksheet.getCell('B' + i).value =
        detalles[item]['agencias_dest.nb_agencia'];
      worksheet.getCell('C' + i).value =
        detalles[item]['agentes_entrega.persona_responsable'];
      worksheet.getCell('D' + i).value = parseFloat(
        detalles[item].nro_documento
      );
      worksheet.getCell('E' + i).value = moment(
        detalles[item].fecha_emision
      ).format('DD/MM/YYYY');
      worksheet.getCell('F' + i).value = parseFloat(detalles[item].carga_neta);
      worksheet.getCell('G' + i).value = parseFloat(detalles[item].nro_piezas);

      let fecha_envio = moment(detalles[item].fecha_envio);
      if (detalles[item].fecha_envio_costo) {
        fecha_envio = moment(detalles[item].fecha_envio_costo, 'YYYY-MM-DD');
      }
      worksheet.getCell('H' + i).value = fecha_envio.format('DD/MM/YYYY');

      let fecha_recepcion = moment(detalles[item].fecha_recepcion);
      worksheet.getCell('I' + i).value = fecha_recepcion.format('DD/MM/YYYY');
      worksheet.getCell('J' + i).value = fecha_recepcion.diff(
        fecha_envio,
        'days'
      );

      worksheet.getCell('K' + i).value =
        detalles[item]['agencias.ciudades.siglas'];

      let cliente_desc = detalles[item].cliente_dest_desc;
      if (detalles[item].pagado_en == 'O') {
        cliente_desc = detalles[item].cliente_orig_desc;
      }
      worksheet.getCell('L' + i).value = cliente_desc;

      worksheet.getCell('M' + i).value = estatus_operativo.find(
        (estatus) => estatus.value == detalles[item].estatus_operativo
      ).label;
      worksheet.getCell('N' + i).value = parseFloat(detalles[item].monto_total);
      worksheet.getCell('P' + i).value = parseFloat(
        detalles[item].comision_entrega
      );
      worksheet.getCell('R' + i).value = parseFloat(
        detalles[item].comision_seguro
      );

      if (dolar == 'true') {
        let monto_total_dolar =
          detalles[item].valor_dolar == 0
            ? 0
            : detalles[item].monto_total / detalles[item].valor_dolar;
        let comision_entrega_dolar =
          detalles[item].valor_dolar == 0
            ? 0
            : detalles[item].comision_entrega / detalles[item].valor_dolar;
        let comision_seguro_dolar =
          detalles[item].valor_dolar == 0
            ? 0
            : detalles[item].comision_seguro / detalles[item].valor_dolar;

        worksheet.getCell('O' + i).value = parseFloat(monto_total_dolar.toFixed(2));
        worksheet.getCell('Q' + i).value = parseFloat(comision_entrega_dolar.toFixed(2));
        worksheet.getCell('S' + i).value = parseFloat(comision_seguro_dolar.toFixed(2));
      }
      i++;
    }
  }
}

module.exports = ComisionesService;
