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
    worksheet.getCell('A2').value =
      data.nombreReporte + ' ' + (data.agencia ? data.agencia : '');
    worksheet.getCell('A3').value = 'DESDE:';
    worksheet.getCell('B3').value = data.fecha_desde;
    worksheet.getCell('A4').value = 'HASTA:';
    worksheet.getCell('B4').value = data.fecha_hasta;
    worksheet.getCell('A5').value = 'FECHA:';
    worksheet.getCell('B5').value = moment().format('DD/MM/YYYY');

    switch (data.tipoReporte) {
      case 'GPA':
      case 'APZ':
      case 'MAD':
        worksheet.columns = [
          { key: 'A', width: 13 },
          { key: 'B', width: 11 },
          { key: 'C', width: 8 },
          { key: 'D', width: 8 },
          { key: 'E', width: 12 },
          { key: 'F', width: 10 },
          { key: 'G', width: 10 },
          { key: 'H', width: 20 },
          { key: 'I', width: 20 },
          { key: 'J', width: 0 },
          { key: 'K', width: 0 },
          { key: 'L', width: 0 },
          { key: 'M', width: 0 },
          { key: 'N', width: 0 },
          { key: 'O', width: 0 },
          { key: 'P', width: 0 },
          { key: 'Q', width: 0 },
        ];

        if (data.visible === 'V') {
          if (data.dolar) {
            worksheet.getColumn('J').width = 10;
            worksheet.getColumn('K').width = 13;
            worksheet.getColumn('P').width = 10;
          }
          worksheet.getColumn('L').width = 13;
          worksheet.getColumn('M').width = 13;
          worksheet.getColumn('N').width = 13;
          worksheet.getColumn('O').width = 13;
        } else {
          if (data.tipo === 'C') {
            worksheet.getColumn('Q').width = 30;
          }
        }

        worksheet.getCell('A8').value = 'DATOS DEL DOCUMENTO';
        worksheet.mergeCells('A8:G8');
        worksheet.getCell('A8').alignment = { horizontal: 'center' };
        worksheet.getCell('A9').value = 'Guía';
        worksheet.getCell('B9').value = 'Emisión';
        worksheet.getCell('C9').value = 'O.';
        worksheet.getCell('D9').value = 'D.';
        worksheet.getCell('E9').value = 'Zona D.';
        worksheet.getCell('F9').value = 'Piezas';
        worksheet.getCell('G9').value = data.neta === 'N' ? 'Neto' : 'Kgs.';

        worksheet.getCell('H8').value = 'CLIENTE';
        worksheet.mergeCells('H8:I8');
        worksheet.getCell('H8').alignment = { horizontal: 'center' };
        worksheet.getCell('H9').value = 'Remitente';
        worksheet.getCell('I9').value = 'Destinatario';

        if (data.visible === 'V') {
          if (data.dolar) {
            worksheet.getCell('J8').value = 'VALOR DECLARADO';
            worksheet.mergeCells('J8:K8');
            worksheet.getCell('J8').alignment = { horizontal: 'center' };
            worksheet.getCell('J9').value = '$';
            worksheet.getCell('K9').value = 'Bolivares';
            worksheet.getCell('P9').value = '$';
          }

          worksheet.getCell('L8').value = 'CRÉDITO';
          worksheet.mergeCells('L8:M8');
          worksheet.getCell('L8').alignment = { horizontal: 'center' };
          worksheet.getCell('L9').value = 'Origen';
          worksheet.getCell('M9').value = 'Destino';

          worksheet.getCell('N8').value = 'CONTADO';
          worksheet.mergeCells('N8:O8');
          worksheet.getCell('N8').alignment = { horizontal: 'center' };
          worksheet.getCell('N9').value = 'Origen';
          worksheet.getCell('O9').value = 'Destino';
        } else {
          if (data.tipo === 'C') {
            worksheet.getCell('Q8').value = 'DATOS DEL DOCUMENTO';
            worksheet.getCell('Q8').alignment = { horizontal: 'center' };
            worksheet.getCell('Q9').value = 'Números Factura Cliente';
          }
        }
        break;
      case 'MAA':
      /*doc.fontSize(9);
        doc.text('Agencia Destino', 35, 100);
        doc.text('Guías', 233, 100);
        doc.text('Piezas', 265, 100);
        doc.text('Kgs.', 310, 100);
        doc.text('Neto', 360, 100);
        doc.text('VALOR DECLARADO', 405, 88);
        doc.text('Bolivares', 408, 100);
        if (data.dolar == true) doc.text('$', 480, 100);
        doc.text('CRÉDITO', 550, 88);
        doc.text('Origen', 530, 100);
        doc.text('Destino', 580, 100);
        doc.text('CONTADO', 645, 88);
        doc.text('Origen', 630, 100);
        doc.text('Destino', 675, 100);
        if (data.dolar == true) doc.text('Total $', 728, 100);
        doc.lineCap('butt').moveTo(30, 115).lineTo(760, 115).stroke();
        break;*/
      default:
        break;
    }
  }

  async generateCustomerInformation(worksheet, data, detalle) {
    switch (data.tipoReporte) {
      case 'GPA':
      case 'APZ':
      case 'MAD':
        var i = 10;
        for (var item = 0; item < detalle.length; item++) {
          let valor_dolar = 0;
          
          worksheet.getCell('A' + i).value = parseFloat(
            detalle[item].nro_documento
          );
          worksheet.getCell('B' + i).value = moment(
            detalle[item].fecha_emision
          ).format('DD/MM/YYYY');
          worksheet.getCell('C' + i).value =
            detalle[item]['agencias.ciudades.siglas'];
          worksheet.getCell('D' + i).value =
            detalle[item]['agencias_dest.ciudades.siglas'];
          worksheet.getCell('E' + i).value = detalle[item]['zonas_dest.nb_zona']
            ? detalle[item]['zonas_dest.nb_zona']
            : '';
          worksheet.getCell('F' + i).value = detalle[item].nro_piezas;
          worksheet.getCell('G' + i).value =
            data.neta === 'N'
              ? detalle[item].carga_neta
              : detalle[item].peso_kgs;
          worksheet.getCell('H' + i).value = detalle[item].cliente_orig_desc;
          worksheet.getCell('I' + i).value = detalle[item].cliente_dest_desc;

          if (data.visible === 'V') {
            worksheet.getCell('J' + i).value = utils.parseFloatN(detalle[item].monto_ref_cte_sin_imp);
            worksheet.getCell('K' + i).value = utils.parseFloatN(declarado_dolar);
          }

          i++;
          /*

          if (data.visible === 'V') {
            if (data.dolar) {
              worksheet.getCell('J8').value = 'VALOR DECLARADO';
              worksheet.mergeCells('J8:K8');
              worksheet.getCell('J8').alignment = { horizontal: 'center' };
              worksheet.getCell('J9').value = '$';
              worksheet.getCell('K9').value = 'Bolivares';
              worksheet.getCell('P9').value = '$';
            }

            worksheet.getCell('L8').value = 'CRÉDITO';
            worksheet.mergeCells('L8:M8');
            worksheet.getCell('L8').alignment = { horizontal: 'center' };
            worksheet.getCell('L9').value = 'Origen';
            worksheet.getCell('M9').value = 'Destino';

            worksheet.getCell('N8').value = 'CONTADO';
            worksheet.mergeCells('N8:O8');
            worksheet.getCell('N8').alignment = { horizontal: 'center' };
            worksheet.getCell('N9').value = 'Origen';
            worksheet.getCell('O9').value = 'Destino';
          } else {
            if (data.tipo === 'C') {
              worksheet.getCell('Q8').value = 'DATOS DEL DOCUMENTO';
              worksheet.getCell('Q8').alignment = { horizontal: 'center' };
              worksheet.getCell('Q9').value = 'Números Factura Cliente';
            }
          }*/
        }
        break;
      case 'MAA':
        break;
      default:
        break;
    }
  }
}

module.exports = RelacionDespachoService;
