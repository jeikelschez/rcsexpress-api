const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

const totalComisionDesc =
  'ROUND(SUM(COALESCE(`detallesg->movimientos`.base_comision_vta_rcl * ' +
  '`agentes`.porc_comision_entrega / 100 , 0)),2)';
const totalDolarDesc2 =
  'SUM(CASE WHEN ((SELECT valor FROM historico_dolar' +
  ' WHERE historico_dolar.fecha = `detallesg->movimientos`.fecha_emision) = 0)' +
  ' THEN 0 ELSE ROUND(`detallesg->movimientos`.monto_subtotal /' +
  ' (SELECT valor FROM historico_dolar' +
  ' WHERE historico_dolar.fecha = `detallesg->movimientos`.fecha_emision), 2) END)';

class CostosTransporteService {
  async mainReport(worksheet, desde, hasta, neta, dolar) {
    let data = [];
    let costos = await models.Costos.findAll({
      where: {
        fecha_envio: {
          [Sequelize.Op.between]: [
            moment(desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            moment(hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
          ],
        },
      },
      include: [
        {
          model: models.Agentes,
          as: 'agentes',
        },
        {
          model: models.Unidades,
          as: 'unidades',
        },
        {
          model: models.Dcostosg,
          as: 'detallesg',
          required: true,
          include: [
            {
              model: models.Mmovimientos,
              as: 'movimientos',
              attributes: [
                [
                  Sequelize.fn('count', Sequelize.col('nro_documento')),
                  'total_guias',
                ],
                [
                  Sequelize.fn('sum', Sequelize.col('nro_piezas')),
                  'total_pzas',
                ],
                [Sequelize.fn('sum', Sequelize.col('peso_kgs')), 'total_kgs'],
                [
                  Sequelize.fn('sum', Sequelize.col('carga_neta')),
                  'total_neta',
                ],
                [
                  Sequelize.fn('sum', Sequelize.col('monto_subtotal')),
                  'total_monto',
                ],
                [Sequelize.literal(totalComisionDesc), 'total_comision'],
                [Sequelize.literal(totalDolarDesc2), 'total_dolar'],
              ],
            },
          ],
        },
      ],
      group: '`Costos`.id',
      order: [['fecha_envio', 'ASC']],
      raw: true,
    });

    data.costos = costos;
    data.desde = desde;
    data.hasta = hasta;
    data.neta = neta;
    data.dolar = dolar;

    await this.generateHeader(worksheet, data);
    await this.generateCustomerInformation(worksheet, data);
    return true;
  }

  async generateHeader(worksheet, data) {
    worksheet.getCell('A2').value = 'REPORTE DE COMISIONES POR TRANSPORTE';
    worksheet.getCell('A3').value = 'DESDE:';
    worksheet.getCell('B3').value = data.desde;
    worksheet.getCell('A4').value = 'HASTA:';
    worksheet.getCell('B4').value = data.hasta;
    worksheet.getCell('A5').value = 'FECHA:';
    worksheet.getCell('B5').value = moment().format('DD/MM/YYYY');
    worksheet.columns = [
      { key: 'A', width: 13 },
      { key: 'B', width: 30 },
      { key: 'C', width: 30 },
      { key: 'D', width: 15 },
      { key: 'E', width: 13 },
      { key: 'F', width: 10 },
      { key: 'G', width: 10 },
      { key: 'H', width: 16 },
      { key: 'I', width: 12 },
      { key: 'J', width: 12 },
      { key: 'K', width: 13 },
      { key: 'L', width: data.dolar ? 10 : 0 },
    ];

    worksheet.getCell('A7').value = 'Fecha Envio';
    worksheet.getCell('B7').value = 'Agente';
    worksheet.getCell('C7').value = 'Destino';
    worksheet.getCell('D7').value = 'Placas Vehículo';
    worksheet.getCell('E7').value = data.neta == 'true' ? 'Neta' : 'Kilos';
    worksheet.getCell('F7').value = 'Piezas';
    worksheet.getCell('G7').value = 'Guías';
    worksheet.getCell('H7').value = 'Monto Comisión';
    worksheet.getCell('I7').value = 'Valor Bulto';
    worksheet.getCell('J7').value = 'Valor Guía';
    worksheet.getCell('K7').value = 'Venta sin IVA';
    if (data.dolar) worksheet.getCell('L7').value = 'Venta $';
  }

  async generateCustomerInformation(worksheet, data) {
    let total_guias = 0;
    let total_pzas = 0;
    let total_kgs = 0;
    let total_neta = 0;
    let total_monto = 0;
    let total_dolar = 0;
    let total_comision = 0;
    let total_vbultos = 0;
    let total_vguias = 0;
    var i = 8;

    for (var item = 0; item < data.costos.length; item++) {
      worksheet.getCell('A' + i).value = moment(
        data.costos[item].fecha_envio
      ).format('DD/MM/YYYY');
      worksheet.getCell('B' + i).value =
        data.costos[item]['agentes.persona_responsable'];
      worksheet.getCell('C' + i).value = data.costos[item].destino;
      worksheet.getCell('D' + i).value = data.costos[item]['unidades.placas'];
      worksheet.getCell('E' + i).value =
        data.neta == 'true'
          ? parseFloat(data.costos[item]['detallesg.movimientos.total_neta'])
          : parseFloat(data.costos[item]['detallesg.movimientos.total_kgs']);
      worksheet.getCell('F' + i).value = parseFloat(
        data.costos[item]['detallesg.movimientos.total_pzas']
      );
      worksheet.getCell('G' + i).value = parseFloat(
        data.costos[item]['detallesg.movimientos.total_guias']
      );
      worksheet.getCell('H' + i).value = parseFloat(
        data.costos[item]['detallesg.movimientos.total_comision']
      );

      let valorBulto =
        utils.parseFloatN(
          data.costos[item]['detallesg.movimientos.total_comision']
        ) /
        utils.parseFloatN(
          data.costos[item]['detallesg.movimientos.total_pzas']
        );
      let valorGuia =
        utils.parseFloatN(
          data.costos[item]['detallesg.movimientos.total_comision']
        ) /
        utils.parseFloatN(
          data.costos[item]['detallesg.movimientos.total_guias']
        );

      total_guias += utils.parseFloatN(
        data.costos[item]['detallesg.movimientos.total_guias']
      );
      total_pzas += utils.parseFloatN(
        data.costos[item]['detallesg.movimientos.total_pzas']
      );
      total_kgs += utils.parseFloatN(
        data.costos[item]['detallesg.movimientos.total_kgs']
      );
      total_neta += utils.parseFloatN(
        data.costos[item]['detallesg.movimientos.total_neta']
      );
      total_monto += utils.parseFloatN(
        data.costos[item]['detallesg.movimientos.total_monto']
      );
      total_dolar += utils.parseFloatN(
        data.costos[item]['detallesg.movimientos.total_dolar']
      );
      total_comision += utils.parseFloatN(
        data.costos[item]['detallesg.movimientos.total_comision']
      );
      total_vbultos += utils.parseFloatN(valorBulto);
      total_vguias += utils.parseFloatN(valorGuia);

      worksheet.getCell('I' + i).value = parseFloat(valorBulto.toFixed(2));
      worksheet.getCell('J' + i).value = parseFloat(valorGuia.toFixed(2));

      worksheet.getCell('K' + i).value = parseFloat(
        data.costos[item]['detallesg.movimientos.total_monto']
      );

      if (data.dolar)
        worksheet.getCell('L' + i).value = parseFloat(
          data.costos[item]['detallesg.movimientos.total_dolar']
        );

      i++;
    }

    i++;
    worksheet.getCell('D' + i).value = 'Totales:';
    worksheet.getCell('E' + i).value =
      data.neta == 'true' ? parseFloat(total_neta) : parseFloat(total_kgs);
    worksheet.getCell('F' + i).value = parseFloat(total_pzas);
    worksheet.getCell('G' + i).value = parseFloat(total_guias);
    worksheet.getCell('H' + i).value = parseFloat(total_comision);
    worksheet.getCell('I' + i).value = parseFloat(total_vbultos);
    worksheet.getCell('J' + i).value = parseFloat(total_vguias);
    worksheet.getCell('K' + i).value = parseFloat(total_monto);
    if (data.dolar) worksheet.getCell('L' + i).value = parseFloat(total_dolar);
  }
}

module.exports = CostosTransporteService;
