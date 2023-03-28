const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

class registroCostosService {
  async generateHeader(doc, data) {
    let agente = '';
    let ayudante = '';
    let observacion = '';
    let anticipo = '';
    switch (data.tipo) {
      case 'DE':
        agente =
          data.costos.tipo_transporte == 'I'
            ? data.costos['agentes.nb_agente'] +
              ' - ' +
              data.costos['agentes.persona_responsable']
            : data.costos['proveedores.nb_proveedor'];
        ayudante =
          data.costos['ayudantes.nb_ayudante'] == null
            ? ''
            : data.costos['ayudantes.nb_ayudante'];
        observacion =
          data.costos.observacion_gnral == null
            ? ''
            : data.costos.observacion_gnral;
        anticipo =
          data.costos.monto_anticipo == null
            ? '0,00'
            : utils.formatNumber(data.costos.monto_anticipo);

        doc.image('./img/logo_rc.png', 35, 42, { width: 80 });
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(18);
        doc.y = 50;
        doc.x = 130;
        doc.text('Costos de Transporte Por Viaje', {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc
          .fontSize(8)
          .text('Fecha: ' + moment().format('DD/MM/YYYY'), 480, 35);
        doc
          .text('Transporte: ' + agente, 130, 83)
          .text('Ayudante: ' + ayudante, 130, 100);
        doc
          .fillColor('#444444')
          .text('Origen: ' + data.agencia, 130, 117)
          .text('Destino: ' + data.costos.destino, 130, 134)
          .text('Observacion: ' + observacion, 130, 150);
        doc.fillColor('black');
        doc
          .fillColor('#444444')
          .text('Anticipo: ' + anticipo, 400, 83)
          .text(
            'Fecha Envio: ' +
              moment(data.costos.fecha_envio).format('DD/MM/YYYY'),
            400,
            100
          )
          .text('Vehiculo: ' + data.costos['unidades.placas'], 400, 117);
        doc.lineJoin('miter').rect(35, 180, 530, 50).stroke();
        doc.fontSize(11);
        doc.text('Flete sin IVA (Bs.)', 60, 192);
        doc.text('Ventas sin IVA (Bs.)', 170, 192);
        doc.text('Utilidad Operativa (Bs.)', 285, 192);
        doc.text('% Costo', 425, 192);
        doc.text('% Utilidad', 490, 192);
        doc.fontSize(8);
        doc.y = 210;
        doc.x = 50;
        doc.text(utils.formatNumber(data.totalCostos), {
          align: 'center',
          columns: 1,
          width: 100,
        });
        doc.y = 210;
        doc.x = 165;
        doc.text(utils.formatNumber(data.totalGuias), {
          align: 'center',
          columns: 1,
          width: 100,
        });
        doc.y = 210;
        doc.x = 290;
        doc.text(utils.formatNumber(data.utilidad), {
          align: 'center',
          columns: 1,
          width: 100,
        });
        doc.y = 210;
        doc.x = 425;
        doc.text(utils.formatNumber(data.porcCosto), {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.y = 210;
        doc.x = 495;
        doc.text(utils.formatNumber(data.porcUtilidad), {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.text('Item', 35, 245);
        doc.text('Nro. Guía', 57, 245);
        doc.text('Emisión', 100, 245);
        doc.text('Remitente', 145, 245);
        doc.text('Destinatario', 268, 245);
        doc.text('Dest.', 393, 245);
        doc.text('Pzas.', 418, 245);
        doc.text(data.neta == 'true' ? 'Neta' : 'Kgs.', 450, 245);
        doc.text('Venta sin IVA', 475, 245);
        if (data.dolar == 'true') doc.text('Venta $', 533, 245);
        break;
      case 'RE':
        agente =
          data.costos.tipo_transporte == 'I'
            ? data.costos['agentes.nb_agente'] +
              ' - ' +
              data.costos['agentes.persona_responsable']
            : data.costos['proveedores.nb_proveedor'];
        ayudante =
          data.costos['ayudantes.nb_ayudante'] == null
            ? ''
            : data.costos['ayudantes.nb_ayudante'];
        observacion =
          data.costos.observacion_gnral == null
            ? ''
            : data.costos.observacion_gnral;
        anticipo =
          data.costos.monto_anticipo == null
            ? '0,00'
            : utils.formatNumber(data.costos.monto_anticipo);

        doc.image('./img/logo_rc.png', 35, 42, { width: 70 });
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(15);
        doc.y = 40;
        doc.x = 130;
        doc.text('Distribución de Costos de Transporte Por Viaje', {
          align: 'left',
          columns: 1,
          width: 350,
        });
        doc
          .fontSize(8)
          .text('Fecha: ' + moment().format('DD/MM/YYYY'), 480, 35);
        doc
          .text('Transporte: ' + agente, 130, 83)
          .text('Ayudante: ' + ayudante, 130, 100);
        doc
          .fillColor('#444444')
          .text('Origen: ' + data.agencia, 130, 117)
          .text('Destino: ' + data.costos.destino, 130, 134)
          .text('Observacion: ' + observacion, 130, 150);
        doc.fillColor('black');
        doc
          .fillColor('#444444')
          .text('Anticipo: ' + anticipo, 400, 83)
          .text(
            'Fecha Envio: ' +
              moment(data.costos.fecha_envio).format('DD/MM/YYYY'),
            400,
            100
          )
          .text('Vehiculo: ' + data.costos['unidades.placas'], 400, 117);
        doc.lineJoin('miter').rect(35, 180, 530, 50).stroke();
        doc.fontSize(11);
        doc.text('Flete sin IVA (Bs.)', 60, 192);
        doc.text('Ventas sin IVA (Bs.)', 170, 192);
        doc.text('Utilidad Operativa (Bs.)', 285, 192);
        doc.text('% Costo', 425, 192);
        doc.text('% Utilidad', 490, 192);
        doc.text('Distribución del Costo de Transporte Segun Destino', 35, 240);
        doc.fontSize(8);
        doc.y = 210;
        doc.x = 50;
        doc.text(utils.formatNumber(data.totalCostos), {
          align: 'center',
          columns: 1,
          width: 100,
        });
        doc.y = 210;
        doc.x = 165;
        doc.text(utils.formatNumber(data.totalGuias), {
          align: 'center',
          columns: 1,
          width: 100,
        });
        doc.y = 210;
        doc.x = 290;
        doc.text(utils.formatNumber(data.utilidad), {
          align: 'center',
          columns: 1,
          width: 100,
        });
        doc.y = 210;
        doc.x = 425;
        doc.text(utils.formatNumber(data.porcCosto), {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.y = 210;
        doc.x = 495;
        doc.text(utils.formatNumber(data.porcUtilidad), {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.fontSize(9);
        doc.text('Destino', 35, 260);
        doc.text('Cant. Guías', 80, 260);
        doc.text('Piezas', 145, 260);
        doc.text(data.neta == 'true' ? 'Neta' : 'Kgs.', 190, 260);
        doc.text('Ventas sin IVA', 235, 260);
        doc.text('% Costo p/Dest.', 320, 260);
        doc.text('Costo Distrib.p/Dest. (Bs.)', 410, 260);
        if (data.dolar == 'true') doc.text('Venta $', 530, 260);
        break;
      case 'GE':
        doc.image('./img/logo_rc.png', 35, 42, { width: 70 });
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(18);
        doc.y = 100;
        doc.x = 190;
        doc.text('Resumen de Costos de Transporte', {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.lineJoin('miter').rect(35, 160, 530, 50).stroke();
        doc.fontSize(11);
        doc.text('Flete sin IVA (Bs.)', 60, 172);
        doc.text('Ventas sin IVA (Bs.)', 170, 172);
        doc.text('Utilidad Operativa (Bs.)', 285, 172);
        doc.text('% Costo', 425, 172);
        doc.text('% Utilidad', 490, 172);
        doc.text('Distribución del Costo de Transporte Segun Destino', 35, 223);
        doc.fontSize(8);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 480, 35);
        doc.y = 190;
        doc.x = 50;
        doc.text(utils.formatNumber(data.totalCostos), {
          align: 'center',
          columns: 1,
          width: 100,
        });
        doc.y = 190;
        doc.x = 165;
        doc.text(utils.formatNumber(data.totalGuias), {
          align: 'center',
          columns: 1,
          width: 100,
        });
        doc.y = 190;
        doc.x = 290;
        doc.text(utils.formatNumber(data.utilidad), {
          align: 'center',
          columns: 1,
          width: 100,
        });
        doc.y = 190;
        doc.x = 425;
        doc.text(utils.formatNumber(data.porcCosto), {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.y = 190;
        doc.x = 495;
        doc.text(utils.formatNumber(data.porcUtilidad), {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.fontSize(9);
        doc.text('Destino', 40, 245);
        doc.text('Cant. Guías', 90, 245);
        doc.text('Nro. Piezas', 150, 245);
        doc.text(data.neta == 'true' ? 'Neta' : 'Kgs', 220, 245);
        doc.text('Ventas sin IVA', 253, 245);
        doc.text('% Costo p/Dest.', 330, 245);
        doc.text('Costo Distrib.p/Dest. (Bs.)', 410, 245);
        if (data.dolar == 'true') doc.text('Venta $', 530, 245);
        break;
      case 'DI':
        doc.image('./img/logo_rc.png', 35, 42, { width: 70 });
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc
          .fontSize(12)
          .text('Fecha: ' + moment().format('DD/MM/YYYY'), 650, 30);
        doc.text('Ruta VLN: ___________________', 550, 75);
        doc.text('Ruta VLN: ___________________', 550, 95);
        doc.text('Hidroca: _____________________', 550, 115);
        doc.text('Hidroca: _____________________', 550, 135);
        doc.fontSize(20);
        doc.y = 120;
        doc.x = 180;
        doc.text('Relación de Transporte Diario', {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.fontSize(26);
        doc.y = 50;
        doc.x = 180;
        doc.text('Fecha', {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 75;
        doc.x = 180;
        doc.text(data.desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        break;
      case 'CO':
        doc.image('./img/logo_rc.png', 35, 42, { width: 70 });
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc
          .fontSize(12)
          .text('Fecha: ' + moment().format('DD/MM/YYYY'), 650, 30);
        doc.text('Ruta VLN: ___________________', 550, 75);
        doc.text('Ruta VLN: ___________________', 550, 95);
        doc.text('Hidroca: _____________________', 550, 115);
        doc.text('Hidroca: _____________________', 550, 135);
        doc.fontSize(20);
        doc.y = 120;
        doc.x = 180;
        doc.text('Relación de Transporte Diario', {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.fontSize(26);
        doc.y = 50;
        doc.x = 180;
        doc.text('Fecha', {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 75;
        doc.x = 180;
        doc.text(data.desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        break;
    }
  }

  async generateCustomerInformation(doc, data, detalles) {
    var i = 0;
    var page = 0;
    var ymin;
    let total_guias = 0;
    let total_pzas = 0;
    let total_kgs = 0;
    let total_neta = 0;
    let total_dolar = 0;

    switch (data.tipo) {
      case 'DE':
        ymin = 270;
        for (var item = 0; item < detalles.length; item++) {
          doc.fontSize(7);
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 18;
          doc.text(item + 1, {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 57;
          doc.text(detalles[item]['movimientos.nro_documento'], {
            align: 'left',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 100;
          doc.text(
            moment(detalles[item]['movimientos.fecha_emision']).format(
              'DD/MM/YYYY'
            ),
            {
              align: 'left',
              columns: 1,
              width: 50,
            }
          );
          doc.y = ymin + i;
          doc.x = 145;
          doc.text(detalles[item]['movimientos.cliente_orig_desc'].trim(), {
            align: 'left',
            columns: 1,
            width: 123,
          });
          doc.y = ymin + i;
          doc.x = 268;
          doc.text(
            detalles[item]['movimientos.cliente_dest_desc'] != null
              ? detalles[item]['movimientos.cliente_dest_desc'].trim()
              : '',
            {
              align: 'left',
              columns: 1,
              width: 120,
            }
          );
          doc.y = ymin + i;
          doc.x = 390;
          doc.text(
            detalles[item]['movimientos.agencias_dest.ciudades.siglas'],
            {
              align: 'center',
              columns: 1,
              width: 25,
            }
          );
          total_pzas += utils.parseFloatN(
            detalles[item]['movimientos.nro_piezas']
          );
          total_kgs += utils.parseFloatN(
            detalles[item]['movimientos.peso_kgs']
          );
          total_neta += utils.parseFloatN(
            detalles[item]['movimientos.carga_neta']
          );
          doc.y = ymin + i;
          doc.x = 413;
          doc.text(detalles[item]['movimientos.nro_piezas'], {
            align: 'right',
            columns: 1,
            width: 20,
          });
          doc.y = ymin + i;
          doc.x = 440;
          doc.text(
            data.neta == 'true'
              ? utils.formatNumber(detalles[item]['movimientos.carga_neta'])
              : utils.formatNumber(detalles[item]['movimientos.peso_kgs']),
            {
              align: 'right',
              columns: 1,
              width: 28,
            }
          );
          doc.y = ymin + i;
          doc.x = 465;
          doc.text(
            utils.formatNumber(detalles[item]['movimientos.monto_subtotal']),
            {
              align: 'right',
              columns: 1,
              width: 60,
            }
          );
          if (data.dolar == 'true') {
            total_dolar += utils.parseFloatN(
              detalles[item]['movimientos.monto_dolar']
            );
            doc.y = ymin + i;
            doc.x = 520;
            doc.text(
              utils.formatNumber(detalles[item]['movimientos.monto_dolar']),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
          }

          i += 22;
          if (i >= 440 || item >= 100) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, data);
          }
        }
        doc.fillColor('#BLACK');
        doc.y = ymin + i + 5;
        doc.x = 360;
        doc.text('TOTALES:', {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 413;
        doc.text(total_pzas, {
          align: 'right',
          columns: 1,
          width: 20,
        });
        doc.y = ymin + i + 5;
        doc.x = 440;
        doc.text(
          data.neta == 'true'
            ? utils.formatNumber(total_neta.toFixed(2))
            : utils.formatNumber(total_kgs.toFixed(2)),
          {
            align: 'right',
            columns: 1,
            width: 28,
          }
        );
        doc.y = ymin + i + 5;
        doc.x = 465;
        doc.text(utils.formatNumber(data.totalGuias), {
          align: 'right',
          columns: 1,
          width: 60,
        });
        if (data.dolar == 'true') {
          doc.y = ymin + i + 5;
          doc.x = 520;
          doc.text(utils.formatNumber(total_dolar.toFixed(2)), {
            align: 'right',
            columns: 1,
            width: 40,
          });
        }
        break;
      case 'RE':
        ymin = 280;
        for (var item = 0; item < detalles.length; item++) {
          doc.fontSize(9);
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 35;
          doc.text(
            detalles[item]['movimientos.agencias_dest.ciudades.siglas'],
            {
              align: 'center',
              columns: 1,
              width: 35,
            }
          );

          total_guias += utils.parseFloatN(
            detalles[item]['movimientos.total_guias']
          );
          total_pzas += utils.parseFloatN(
            detalles[item]['movimientos.total_pzas']
          );
          total_kgs += utils.parseFloatN(
            detalles[item]['movimientos.total_kgs']
          );
          total_neta += utils.parseFloatN(
            detalles[item]['movimientos.total_neta']
          );

          doc.y = ymin + i;
          doc.x = 80;
          doc.text(detalles[item]['movimientos.total_guias'], {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 145;
          doc.text(detalles[item]['movimientos.total_pzas'], {
            align: 'right',
            columns: 1,
            width: 30,
          });
          let peso_kgs =
            data.neta == 'true'
              ? detalles[item]['movimientos.total_neta']
              : detalles[item]['movimientos.total_kgs'];
          doc.y = ymin + i;
          doc.x = 185;
          doc.text(utils.formatNumber(peso_kgs), {
            align: 'right',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 225;
          doc.text(
            utils.formatNumber(detalles[item]['movimientos.total_monto']),
            {
              align: 'right',
              columns: 1,
              width: 80,
            }
          );
          let porcCosto =
            utils.parseFloatN(detalles[item]['movimientos.total_monto']) /
            data.totalGuias;
          let porcCostoDest = porcCosto * data.totalCostos;
          doc.y = ymin + i;
          doc.x = 320;
          doc.text(utils.formatNumber(porcCosto * 100) + '%', {
            align: 'right',
            columns: 1,
            width: 80,
          });
          doc.y = ymin + i;
          doc.x = 415;
          doc.text(utils.formatNumber(porcCostoDest), {
            align: 'right',
            columns: 1,
            width: 100,
          });
          if (data.dolar == 'true') {
            total_dolar += utils.parseFloatN(
              detalles[item]['movimientos.total_dolar']
            );
            doc.y = ymin + i;
            doc.x = 520;
            doc.text(
              utils.formatNumber(detalles[item]['movimientos.total_dolar']),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
          }

          i += 15;
          if (i >= 440 || item >= 100) {
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, data);
          }
        }
        doc.fillColor('#BLACK');
        doc.y = ymin + i + 5;
        doc.x = 35;
        doc.text('TOTALES:', {
          align: 'left',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 80;
        doc.text(total_guias, {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 145;
        doc.text(total_pzas, {
          align: 'right',
          columns: 1,
          width: 30,
        });
        doc.y = ymin + i + 5;
        doc.x = 185;
        doc.text(
          data.neta == 'true'
            ? utils.formatNumber(total_neta)
            : utils.formatNumber(total_kgs),
          {
            align: 'right',
            columns: 1,
            width: 40,
          }
        );
        doc.y = ymin + i + 5;
        doc.x = 225;
        doc.text(utils.formatNumber(data.totalGuias), {
          align: 'right',
          columns: 1,
          width: 80,
        });
        doc.y = ymin + i + 5;
        doc.x = 415;
        doc.text(utils.formatNumber(data.totalCostos), {
          align: 'right',
          columns: 1,
          width: 100,
        });
        if (data.dolar == 'true') {
          doc.y = ymin + i + 5;
          doc.x = 520;
          doc.text(utils.formatNumber(total_dolar.toFixed(2)), {
            align: 'right',
            columns: 1,
            width: 40,
          });
        }
        break;
      case 'GE':
        ymin = 270;
        for (var item = 0; item < data.costos.length; item++) {
          doc.fontSize(9);
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 40;
          doc.text(
            data.costos[item][
              'detallesg.movimientos.agencias_dest.ciudades.siglas'
            ],
            {
              align: 'center',
              columns: 1,
              width: 35,
            }
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

          doc.y = ymin + i;
          doc.x = 90;
          doc.text(data.costos[item]['detallesg.movimientos.total_guias'], {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 145;
          doc.text(data.costos[item]['detallesg.movimientos.total_pzas'], {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 210;
          doc.text(
            data.neta == 'true'
              ? utils.formatNumber(
                  data.costos[item]['detallesg.movimientos.total_neta']
                )
              : utils.formatNumber(
                  data.costos[item]['detallesg.movimientos.total_kgs']
                ),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = ymin + i;
          doc.x = 250;
          doc.text(
            utils.formatNumber(
              data.costos[item]['detallesg.movimientos.total_monto']
            ),
            {
              align: 'right',
              columns: 1,
              width: 65,
            }
          );
          let porcCosto =
            utils.parseFloatN(
              data.costos[item]['detallesg.movimientos.total_monto']
            ) / data.totalGuias;
          let porcCostoDest = porcCosto * data.totalCostos;
          doc.y = ymin + i;
          doc.x = 325;
          doc.text(utils.formatNumber(porcCosto * 100) + '%', {
            align: 'right',
            columns: 1,
            width: 80,
          });
          doc.y = ymin + i;
          doc.x = 405;
          doc.text(utils.formatNumber(porcCostoDest), {
            align: 'right',
            columns: 1,
            width: 110,
          });
          if (data.dolar == 'true') {
            total_dolar += utils.parseFloatN(
              data.costos[item]['detallesg.movimientos.total_dolar']
            );
            doc.y = ymin + i;
            doc.x = 520;
            doc.text(
              utils.formatNumber(
                data.costos[item]['detallesg.movimientos.total_dolar']
              ),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
          }
          i += 15;
          if (i >= 440 || item >= 100) {
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, data);
          }
        }
        doc.fillColor('#BLACK');
        doc.y = ymin + i + 5;
        doc.x = 35;
        doc.text('TOTALES:', {
          align: 'left',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 90;
        doc.text(total_guias, {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 145;
        doc.text(total_pzas, {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 200;
        doc.text(
          data.neta == 'true'
            ? utils.formatNumber(total_neta)
            : utils.formatNumber(total_kgs),
          {
            align: 'right',
            columns: 1,
            width: 50,
          }
        );
        doc.y = ymin + i + 5;
        doc.x = 250;
        doc.text(utils.formatNumber(data.totalGuias), {
          align: 'right',
          columns: 1,
          width: 65,
        });
        doc.y = ymin + i + 5;
        doc.x = 405;
        doc.text(utils.formatNumber(data.totalCostos), {
          align: 'right',
          columns: 1,
          width: 110,
        });
        if (data.dolar == 'true') {
          doc.y = ymin + i + 5;
          doc.x = 510;
          doc.text(utils.formatNumber(total_dolar.toFixed(2)), {
            align: 'right',
            columns: 1,
            width: 50,
          });
        }
        break;
      case 'DI':
        ymin = 160;
        for (var item = 0; item < data.costos.length; item++) {
          doc.fillColor('#444444');
          doc
            .lineJoin('miter')
            .rect(35, ymin + i, 720, 70)
            .stroke();
          doc.fontSize(10);
          doc.text('Origen: VALENCIA, RCS EXPRESS, S.A.', 50, ymin + i + 13);
          doc.text('Chofer: VALENCIA, RCS EXPRESS, S.A.', 50, ymin + i + 33);
          doc.text('Ayudante: VALENCIA, RCS EXPRESS, S.A.', 50, ymin + i + 51);
          doc.text('Destinos: VALENCIA, RCS EXPRESS, S.A.', 270, ymin + i + 13);
          doc.text('Anticipo: VALENCIA, RCS EXPRESS, S.A.', 270, ymin + i + 33);
          doc.text('Anticipo: VALENCIA, RCS EXPRESS, S.A.', 270, ymin + i + 51);
          doc.text('Vehiculo: VALENCIA, RCS EXPRESS, S.A.', 490, ymin + i + 13);
          doc.text(
            'Observacion: VALENCIA, RCS EXPRESS, S.A.',
            490,
            ymin + i + 51
          );
          i += 80;
          if (i >= 350 || item >= 100) {
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, data);
          }
        }
        break;
      case 'CO':
        ymin = 160;
        for (var item = 0; item < data.costos.length; item++) {
          doc.fillColor('#444444');
          doc
            .lineJoin('miter')
            .rect(35, ymin + i, 720, 70)
            .stroke();
          doc.fontSize(10);
          doc.text('Origen: VALENCIA, RCS EXPRESS, S.A.', 50, ymin + i + 13);
          doc.text('Chofer: VALENCIA, RCS EXPRESS, S.A.', 50, ymin + i + 33);
          doc.text('Ayudante: VALENCIA, RCS EXPRESS, S.A.', 50, ymin + i + 51);
          doc.text('Destinos: VALENCIA, RCS EXPRESS, S.A.', 270, ymin + i + 13);
          doc.text('Anticipo: VALENCIA, RCS EXPRESS, S.A.', 270, ymin + i + 33);
          doc.text('Anticipo: VALENCIA, RCS EXPRESS, S.A.', 270, ymin + i + 51);
          doc.text('Vehiculo: VALENCIA, RCS EXPRESS, S.A.', 490, ymin + i + 13);
          doc.text(
            'Observacion: VALENCIA, RCS EXPRESS, S.A.',
            490,
            ymin + i + 51
          );
          i += 80;
          if (i >= 350 || item >= 100) {
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, data);
          }
        }
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
      if (data.tipo == 'DI') {
        doc.fontSize(12);
        doc.fillColor('#444444');
        doc.x = 650;
        doc.y = 50;
        doc.text(`Pagina ${i + 1} de ${range.count}`, {
          align: 'right',
          columns: 1,
          width: 100,
        });
      } else {
        doc.fontSize(8);
        doc.fillColor('#444444');
        doc.x = 446;
        doc.y = 50;
        doc.text(`Pagina ${i + 1} de ${range.count}`, {
          align: 'right',
          columns: 1,
          width: 100,
        });
      }
    }
  }
}

module.exports = registroCostosService;
