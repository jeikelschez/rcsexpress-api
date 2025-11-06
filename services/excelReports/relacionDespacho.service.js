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
          { key: 'E', width: 18 },
          { key: 'F', width: 10 },
          { key: 'G', width: 10 },
          { key: 'H', width: 40 },
          { key: 'I', width: 40 },
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
            worksheet.getColumn('J').width = 13;
            worksheet.getColumn('K').width = 13;
            worksheet.getColumn('P').width = 10;
          }
          worksheet.getColumn('L').width = 13;
          worksheet.getColumn('M').width = 13;
          worksheet.getColumn('N').width = 13;
          worksheet.getColumn('O').width = 13;
        } else {
          if (data.tipo === 'C') {
            worksheet.getColumn('Q').width = 50;
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
            worksheet.getCell('J9').value = 'Bolivares';
            worksheet.getCell('K9').value = '$';
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
        worksheet.columns = [
          { key: 'A', width: 35 },
          { key: 'B', width: 8 },
          { key: 'C', width: 8 },
          { key: 'D', width: 10 },
          { key: 'E', width: 12 },
        ];

        if (data.visible === 'V') {
          if (data.dolar) {
            worksheet.getColumn('F').width = 13;
            worksheet.getColumn('G').width = 13;
            worksheet.getColumn('L').width = 10;
          }
          worksheet.getColumn('H').width = 13;
          worksheet.getColumn('I').width = 13;
          worksheet.getColumn('J').width = 13;
          worksheet.getColumn('K').width = 13;
        }

        worksheet.getCell('A9').value = 'Agencia Destino';
        worksheet.getCell('B9').value = 'Guías';
        worksheet.getCell('C9').value = 'Piezas';
        worksheet.getCell('D9').value = 'Kgs.';
        worksheet.getCell('E9').value = 'Neto';

        if (data.visible === 'V') {
          if (data.dolar) {
            worksheet.getCell('F8').value = 'VALOR DECLARADO';
            worksheet.mergeCells('F8:G8');
            worksheet.getCell('F8').alignment = { horizontal: 'center' };
            worksheet.getCell('F9').value = 'Bolivares';
            worksheet.getCell('G9').value = '$';
            worksheet.getCell('L9').value = 'Total $';
          }

          worksheet.getCell('H8').value = 'CRÉDITO';
          worksheet.mergeCells('H8:I8');
          worksheet.getCell('H8').alignment = { horizontal: 'center' };
          worksheet.getCell('H9').value = 'Origen';
          worksheet.getCell('I9').value = 'Destino';

          worksheet.getCell('J8').value = 'CONTADO';
          worksheet.mergeCells('J8:K8');
          worksheet.getCell('J8').alignment = { horizontal: 'center' };
          worksheet.getCell('J9').value = 'Origen';
          worksheet.getCell('K9').value = 'Destino';
        }
        break;
      default:
        break;
    }
  }

  async generateCustomerInformation(worksheet, data, detalle) {
    var i = 10;
    switch (data.tipoReporte) {
      case 'GPA':
      case 'APZ':
      case 'MAD':
        let nro_piezas = 0;
        let peso_kgs = 0;
        let carga_neta = 0;
        let credito_orig = 0;
        let credito_dest = 0;
        let contado_orig = 0;
        let contado_dest = 0;
        let total_dolar = 0;
        let total_declarado = 0;
        let total_declarado_dolar = 0;
        let group_piezas = 0;
        let group_neta = 0;
        let group_kgs = 0;
        let credito_orig_group = 0;
        let credito_dest_group = 0;
        let contado_orig_group = 0;
        let contado_dest_group = 0;
        let total_dolar_group = 0;
        let total_declarado_group = 0;
        let total_declarado_dolar_group = 0;

        for (var item = 0; item < detalle.length; item++) {
          let label;
          let field;
          let total;
          let valor_dolar = 0;
          let monto_dolar = 0;
          let declarado_dolar = 0;

          let find_dolar = detalle.hDolar.findIndex(
            (arr) => arr.fecha == detalle[item].fecha_emision
          );
          if (find_dolar >= 0) valor_dolar = detalle.hDolar[find_dolar].valor;

          if (valor_dolar > 0) {
            monto_dolar = (
              utils.parseFloatN(detalle[item].monto_total) /
              utils.parseFloatN(valor_dolar)
            ).toFixed(2);
          }

          if (data.tipoReporte == 'APZ') {
            label = 'Zona Destino: ';
            field = 'zonas_dest.nb_zona';
            total = 'Total por Zona: ';
          } else if (data.tipoReporte == 'MAD') {
            label = 'Agencia Destino: ';
            field = 'agencias_dest.nb_agencia';
            total = 'Total por Agencia: ';
          }

          if (data.tipoReporte == 'APZ' || data.tipoReporte == 'MAD') {
            // Aqui pinto el primer encabezado
            if (item == 0) {
              worksheet.getCell('A' + i).value = label + detalle[item][field];
              i++;
            } else if (detalle[item][field] != detalle[item - 1][field]) {
              // Aqui pinto los totales del agrupado
              worksheet.getCell('F' + i).value = parseFloat(group_piezas);
              worksheet.getCell('G' + i).value =
                data.neta === 'N'
                  ? parseFloat(group_neta)
                  : parseFloat(group_kgs);

              if (data.visible === 'V') {
                if (data.dolar) {
                  worksheet.getCell('J' + i).value = parseFloat(
                    total_declarado_group
                  );
                  worksheet.getCell('K' + i).value = parseFloat(
                    total_declarado_dolar_group
                  );
                  worksheet.getCell('P' + i).value =
                    parseFloat(total_dolar_group);
                }
                worksheet.getCell('L' + i).value =
                  parseFloat(credito_orig_group);
                worksheet.getCell('M' + i).value =
                  parseFloat(credito_dest_group);
                worksheet.getCell('N' + i).value =
                  parseFloat(contado_orig_group);
                worksheet.getCell('O' + i).value =
                  parseFloat(contado_dest_group);
              }
              i++;
              i++;

              worksheet.getCell('A' + i).value = label + detalle[item][field];
              i++;

              group_piezas = 0;
              group_neta = 0;
              group_kgs = 0;
              credito_orig_group = 0;
              credito_dest_group = 0;
              contado_orig_group = 0;
              contado_dest_group = 0;
              total_dolar_group = 0;
              total_declarado_group = 0;
              total_declarado_dolar_group = 0;
            }

            group_piezas += utils.parseFloatN(detalle[item].nro_piezas);
            group_neta += utils.parseFloatN(detalle[item].carga_neta);
            group_kgs += utils.parseFloatN(detalle[item].peso_kgs);

            if (detalle[item].modalidad_pago == 'CR') {
              if (detalle[item].pagado_en == 'O') {
                credito_orig_group += utils.parseFloatN(
                  detalle[item].monto_total
                );
              } else {
                credito_dest_group += utils.parseFloatN(
                  detalle[item].monto_total
                );
              }
            } else {
              if (detalle[item].pagado_en == 'O') {
                contado_orig_group += utils.parseFloatN(
                  detalle[item].monto_total
                );
              } else {
                contado_dest_group += utils.parseFloatN(
                  detalle[item].monto_total
                );
              }
            }

            let declarado_dolar_group = 0;
            total_dolar_group += utils.parseFloatN(monto_dolar);
            total_declarado_group += utils.parseFloatN(
              detalle[item].monto_ref_cte_sin_imp
            );
            if (valor_dolar > 0) {
              declarado_dolar_group = (
                utils.parseFloatN(detalle[item].monto_ref_cte_sin_imp) /
                utils.parseFloatN(valor_dolar)
              ).toFixed(2);
            }

            total_declarado_dolar_group += utils.parseFloatN(
              declarado_dolar_group
            );
          } // Fin de APZ y MAD

          nro_piezas += utils.parseFloatN(detalle[item].nro_piezas);
          peso_kgs += utils.parseFloatN(detalle[item].peso_kgs);
          carga_neta += utils.parseFloatN(detalle[item].carga_neta);

          if (detalle[item].modalidad_pago == 'CR') {
            if (detalle[item].pagado_en == 'O') {
              credito_orig += utils.parseFloatN(detalle[item].monto_total);
            } else {
              credito_dest += utils.parseFloatN(detalle[item].monto_total);
            }
          } else {
            if (detalle[item].pagado_en == 'O') {
              contado_orig += utils.parseFloatN(detalle[item].monto_total);
            } else {
              contado_dest += utils.parseFloatN(detalle[item].monto_total);
            }
          }

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
          worksheet.getCell('F' + i).value = parseFloat(
            detalle[item].nro_piezas
          );
          worksheet.getCell('G' + i).value =
            data.neta === 'N'
              ? parseFloat(detalle[item].carga_neta)
              : parseFloat(detalle[item].peso_kgs);
          worksheet.getCell('H' + i).value = detalle[item].cliente_orig_desc;
          worksheet.getCell('I' + i).value = detalle[item].cliente_dest_desc;

          if (data.visible === 'V') {
            if (data.dolar) {
              if (valor_dolar > 0) {
                declarado_dolar = (
                  utils.parseFloatN(detalle[item].monto_ref_cte_sin_imp) /
                  utils.parseFloatN(valor_dolar)
                ).toFixed(2);

                total_declarado += utils.parseFloatN(
                  detalle[item].monto_ref_cte_sin_imp
                );
                total_declarado_dolar += utils.parseFloatN(declarado_dolar);
                total_dolar += utils.parseFloatN(monto_dolar);
              }

              worksheet.getCell('J' + i).value = parseFloat(
                detalle[item].monto_ref_cte_sin_imp
              );
              worksheet.getCell('K' + i).value = parseFloat(declarado_dolar);
              worksheet.getCell('P' + i).value = parseFloat(monto_dolar);
            }

            worksheet.getCell('L' + i).value =
              detalle[item].modalidad_pago == 'CR' &&
              detalle[item].pagado_en == 'O'
                ? parseFloat(detalle[item].monto_total)
                : parseFloat(0);
            worksheet.getCell('M' + i).value =
              detalle[item].modalidad_pago == 'CR' &&
              detalle[item].pagado_en == 'D'
                ? parseFloat(detalle[item].monto_total)
                : parseFloat(0);
            worksheet.getCell('N' + i).value =
              detalle[item].modalidad_pago == 'CO' &&
              detalle[item].pagado_en == 'O'
                ? parseFloat(detalle[item].monto_total)
                : parseFloat(0);
            worksheet.getCell('O' + i).value =
              detalle[item].modalidad_pago == 'CO' &&
              detalle[item].pagado_en == 'D'
                ? parseFloat(detalle[item].monto_total)
                : parseFloat(0);
          } else if (data.tipo === 'C') {
            worksheet.getCell('Q' + i).value = detalle[item].dimensiones;
          }
          i++;
        }

        if (data.tipoReporte == 'APZ' || data.tipoReporte == 'MAD') {
          // Totales del ultimo grupo
          worksheet.getCell('F' + i).value = parseFloat(group_piezas);
          worksheet.getCell('G' + i).value =
            data.neta === 'N' ? parseFloat(group_neta) : parseFloat(group_kgs);

          if (data.visible === 'V') {
            if (data.dolar) {
              worksheet.getCell('J' + i).value = parseFloat(
                total_declarado_group
              );
              worksheet.getCell('K' + i).value = parseFloat(
                total_declarado_dolar_group
              );
              worksheet.getCell('P' + i).value = parseFloat(total_dolar_group);
            }
            worksheet.getCell('L' + i).value = parseFloat(credito_orig_group);
            worksheet.getCell('M' + i).value = parseFloat(credito_dest_group);
            worksheet.getCell('N' + i).value = parseFloat(contado_orig_group);
            worksheet.getCell('O' + i).value = parseFloat(contado_dest_group);
          }
          i++;
          i++;
        }

        // Totales generales
        worksheet.getCell('F' + i).value = parseFloat(nro_piezas);
        worksheet.getCell('G' + i).value =
          data.neta === 'N' ? parseFloat(carga_neta) : parseFloat(peso_kgs);

        if (data.visible === 'V') {
          if (data.dolar) {
            worksheet.getCell('J' + i).value = parseFloat(total_declarado);
            worksheet.getCell('K' + i).value = parseFloat(
              total_declarado_dolar
            );
            worksheet.getCell('P' + i).value = parseFloat(total_dolar);
          }
          worksheet.getCell('L' + i).value = parseFloat(credito_orig);
          worksheet.getCell('M' + i).value = parseFloat(credito_dest);
          worksheet.getCell('N' + i).value = parseFloat(contado_orig);
          worksheet.getCell('O' + i).value = parseFloat(contado_dest);
        }
        break;
      case 'MAA':
        for (var item = 0; item < detalle.agenciaAgrupado.length; item++) {
          worksheet.getCell('A' + i).value =
            detalle.agenciaAgrupado[item].agencia;
          worksheet.getCell('B' + i).value = parseFloat(
            detalle.agenciaAgrupado[item].count
          );
          worksheet.getCell('C' + i).value = parseFloat(
            detalle.agenciaAgrupado[item].piezas
          );
          worksheet.getCell('D' + i).value = parseFloat(
            detalle.agenciaAgrupado[item].peso
          );
          worksheet.getCell('E' + i).value = parseFloat(
            detalle.agenciaAgrupado[item].carga_neta
          );
          if (data.visible == 'V') {
            worksheet.getCell('F' + i).value = parseFloat(
              detalle.agenciaAgrupado[item].valor_declarado
            );
            worksheet.getCell('H' + i).value = parseFloat(
              detalle.agenciaAgrupado[item].credito_origen
            );
            worksheet.getCell('I' + i).value = parseFloat(
              detalle.agenciaAgrupado[item].credito_destino
            );
            worksheet.getCell('J' + i).value = parseFloat(
              detalle.agenciaAgrupado[item].contado_origen
            );
            worksheet.getCell('K' + i).value = parseFloat(
              detalle.agenciaAgrupado[item].contado_destino
            );
            if (data.dolar == true) {
              worksheet.getCell('G' + i).value = parseFloat(
                detalle.agenciaAgrupado[item].valor_declarado_dolar
              );
              worksheet.getCell('L' + i).value = parseFloat(
                detalle.agenciaAgrupado[item].monto_dolar
              );
            }
          }
          i++;
        }
        // Totales generales
        worksheet.getCell('B' + i).value = parseFloat(
          detalle.length
        );
        worksheet.getCell('C' + i).value = parseFloat(
          detalle.agenciaAgrupado.totales.piezas
        );
        worksheet.getCell('D' + i).value = parseFloat(
          detalle.agenciaAgrupado.totales.peso
        );
        worksheet.getCell('E' + i).value = parseFloat(
          detalle.agenciaAgrupado.totales.carga_neta
        );
        if (data.visible == 'V') {
          worksheet.getCell('F' + i).value = parseFloat(
            detalle.agenciaAgrupado.totales.valor_declarado
          );
          worksheet.getCell('H' + i).value = parseFloat(
            detalle.agenciaAgrupado.totales.credito_origen
          );
          worksheet.getCell('I' + i).value = parseFloat(
            detalle.agenciaAgrupado.totales.credito_destino
          );
          worksheet.getCell('J' + i).value = parseFloat(
            detalle.agenciaAgrupado.totales.contado_origen
          );
          worksheet.getCell('K' + i).value = parseFloat(
            detalle.agenciaAgrupado.totales.contado_destino
          );
          if (data.dolar == true) {
            worksheet.getCell('G' + i).value = parseFloat(
              detalle.agenciaAgrupado.totales.valor_declarado_dolar
            );
            worksheet.getCell('L' + i).value = parseFloat(
              detalle.agenciaAgrupado.totales.monto_dolar
            );
          }
        }
        break;
      default:
        break;
    }
  }
}

module.exports = RelacionDespachoService;
