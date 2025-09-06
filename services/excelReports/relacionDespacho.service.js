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

class RelacionDespachoService {
  async mainReport(worksheet, data, detalle) {
    detalle = detalle.join(',');

    let dataDetalle = await models.Mmovimientos.findAll({
      where: {
        nro_documento: {
          [Sequelize.Op.in]: detalle.split(','),
        },
      },
      include: [
        {
          model: models.Agencias,
          as: 'agencias',
          include: {
            model: models.Ciudades,
            as: 'ciudades',
          },
        },
        {
          model: models.Agencias,
          as: 'agencias_dest',
          include: {
            model: models.Ciudades,
            as: 'ciudades',
          },
        },
        {
          model: models.Zonas,
          as: 'zonas_dest',
        },
      ],
      attributes: {
        include: [
          [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
          [Sequelize.literal(clienteDestDesc), 'cliente_dest_desc'],
        ],
      },
      order: JSON.parse(data.sortBy),
      raw: true,
    });

    let hDolar = await models.Hdolar.findAll({
      where: {
        fecha: {
          [Sequelize.Op.between]: [
            moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
          ],
        },
      },
      raw: true,
    });

    let agenciaAgrupado = [];

    if (data.tipoReporte == 'MAA') {
      // Totales generales
      let totales = {
        piezas: 0,
        peso: 0,
        carga_neta: 0,
        credito_origen: 0,
        credito_destino: 0,
        contado_origen: 0,
        contado_destino: 0,
        monto_dolar: 0,
        valor_declarado: 0,
        valor_declarado_dolar: 0,
      };

      for (let i = 0; i < dataDetalle.length; i++) {
        const guiaActual = dataDetalle[i];
        const codAgenciaDestino = guiaActual.cod_agencia_dest;
        let valor_dolar = 0;
        if (data.dolar) {
          let find_dolar = hDolar.findIndex(
            (arr) => arr.fecha == guiaActual.fecha_emision
          );
          if (find_dolar >= 0) valor_dolar = hDolar[find_dolar].valor;
        }

        totales.piezas += parseFloat(guiaActual.nro_piezas);
        totales.peso += parseFloat(guiaActual.peso_kgs);
        totales.carga_neta += parseFloat(guiaActual.carga_neta);
        totales.valor_declarado +=
          guiaActual.monto_ref_cte_sin_imp > 0
            ? parseFloat(guiaActual.monto_ref_cte_sin_imp)
            : 0;
        totales.valor_declarado_dolar +=
          valor_dolar > 0 && guiaActual.monto_ref_cte_sin_imp > 0
            ? guiaActual.monto_ref_cte_sin_imp / valor_dolar
            : 0;

        let agenciaIndex = agenciaAgrupado.findIndex(
          (a) => a.codAgenciaDestino === codAgenciaDestino
        );
        if (agenciaIndex === -1) {
          agenciaAgrupado.push({
            codAgenciaDestino,
            agencia: guiaActual['agencias_dest.nb_agencia'],
            piezas: 0,
            peso: 0,
            carga_neta: 0,
            credito_origen: 0,
            credito_destino: 0,
            contado_origen: 0,
            contado_destino: 0,
            monto_dolar: 0,
            valor_declarado: 0,
            valor_declarado_dolar: 0,
            count: 0,
          });
          agenciaIndex = agenciaAgrupado.length - 1;
        }
        let agencia = agenciaAgrupado[agenciaIndex];
        agencia.piezas += parseFloat(guiaActual.nro_piezas);
        agencia.peso += parseFloat(guiaActual.peso_kgs);
        agencia.carga_neta += parseFloat(guiaActual.carga_neta);
        agencia.valor_declarado +=
          guiaActual.monto_ref_cte_sin_imp > 0
            ? parseFloat(guiaActual.monto_ref_cte_sin_imp)
            : 0;
        agencia.valor_declarado_dolar +=
          valor_dolar > 0 && guiaActual.monto_ref_cte_sin_imp > 0
            ? guiaActual.monto_ref_cte_sin_imp / valor_dolar
            : 0;
        agencia.count += 1;

        const monto = parseFloat(guiaActual.monto_total) || 0;
        agencia.monto_dolar += valor_dolar > 0 ? monto / valor_dolar : 0;
        totales.monto_dolar += valor_dolar > 0 ? monto / valor_dolar : 0;
        if (guiaActual.modalidad_pago == 'CR') {
          if (guiaActual.pagado_en == 'O') {
            agencia.credito_origen += monto;
            totales.credito_origen += monto;
          } else if (guiaActual.pagado_en == 'D') {
            agencia.credito_destino += monto;
            totales.credito_destino += monto;
          }
        } else {
          if (guiaActual.pagado_en == 'O') {
            agencia.contado_origen += monto;
            totales.contado_origen += monto;
          } else if (guiaActual.pagado_en == 'D') {
            agencia.contado_destino += monto;
            totales.contado_destino += monto;
          }
        }
      }
      // Puedes devolver los totales generales junto con el arreglo si lo necesitas
      agenciaAgrupado.totales = totales;
    }

    dataDetalle.agenciaAgrupado = agenciaAgrupado;
    dataDetalle.hDolar = hDolar;

    await this.generateHeader(worksheet, data);
    await this.generateCustomerInformation(worksheet, data, dataDetalle);
    return true;
  }

  async generateHeader(worksheet, data) {
    worksheet.getCell('A2').value = data.nombreReporte + ' ' + data.agencia;
    worksheet.getCell('A3').value = 'DESDE:';
    worksheet.getCell('B3').value = data.fecha_desde;
    worksheet.getCell('A4').value = 'HASTA:';
    worksheet.getCell('B4').value = data.fecha_hasta;
    worksheet.getCell('A5').value = 'FECHA:';
    worksheet.getCell('B5').value = moment().format('DD/MM/YYYY');

    worksheet.getCell('A8').value = 'Guía:';
    worksheet.getCell('B8').value = 'Emisión';
    worksheet.getCell('C8').value = 'Origen';
    worksheet.getCell('D8').value = 'Destino';
    worksheet.getCell('E8').value = 'Zona D.';
    worksheet.getCell('F8').value = 'Piezas';
    worksheet.getCell('G8').value = data.neta === 'N' ? 'Neto' : 'Kgs.';
    worksheet.getCell('H8').value = 'Remitente';
    worksheet.getCell('I8').value = 'Destinatario';
    worksheet.getCell('J8').value = 'Bolivares';
    worksheet.getCell('K8').value = 'USD';
    worksheet.getCell('L8').value = 'Origen';
    worksheet.getCell('M8').value = 'Destino';
    worksheet.getCell('N8').value = 'Origen';
    worksheet.getCell('O8').value = 'Destino';
    worksheet.getCell('P8').value = 'Total (USD)';
  }

  async generateCustomerInformation(worksheet, data, dataDetalle) {}
}

module.exports = RelacionDespachoService;
