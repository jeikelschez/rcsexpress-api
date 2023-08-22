const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

const clienteOrigDesc =
  '(CASE WHEN (id_clte_part_orig IS NULL || id_clte_part_orig = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `movimientos`.cod_cliente_org = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `movimientos`.id_clte_part_orig = clientes_particulares.id)' +
  ' END)';
const clienteDestDesc =
  '(CASE WHEN (id_clte_part_dest IS NULL || id_clte_part_dest = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `movimientos`.cod_cliente_dest = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `movimientos`.id_clte_part_dest = clientes_particulares.id)' +
  ' END)';
const montoDolarDesc =
  'CASE WHEN ((SELECT valor FROM historico_dolar' +
  ' WHERE historico_dolar.fecha = movimientos.fecha_emision) = 0)' +
  ' THEN 0 ELSE ROUND(movimientos.monto_subtotal /' +
  ' (SELECT valor FROM historico_dolar' +
  ' WHERE historico_dolar.fecha = movimientos.fecha_emision), 2) END';
const montoDolarCostoDesc =
  'CASE WHEN ((SELECT valor FROM historico_dolar' +
  ' WHERE historico_dolar.fecha = `Costos`.fecha_envio) = 0)' +
  ' THEN 0 ELSE ROUND(`Costos`.monto_anticipo /' +
  ' (SELECT valor FROM historico_dolar' +
  ' WHERE historico_dolar.fecha = `Costos`.fecha_envio), 2) END';
const totalDolarDesc =
  'SUM(CASE WHEN ((SELECT valor FROM historico_dolar' +
  ' WHERE historico_dolar.fecha = movimientos.fecha_emision) = 0)' +
  ' THEN 0 ELSE ROUND(movimientos.monto_subtotal /' +
  ' (SELECT valor FROM historico_dolar' +
  ' WHERE historico_dolar.fecha = movimientos.fecha_emision), 2) END)';
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
  async mainReport(doc, id, tipo, agencia, desde, hasta, neta, dolar) {
    let costos = [];
    let data = [];
    let detallesg = [];
    let totalGuias = 0;
    let totalCostos = 0;
    let porcCosto = 0;
    let porcUtilidad = 0;

    switch (tipo) {
      case 'DE':
      case 'RE':
        let order = [];
        let group = '';
        costos = await models.Costos.findByPk(id, {
          include: [
            {
              model: models.Agentes,
              as: 'agentes',
            },
            {
              model: models.Proveedores,
              as: 'proveedores',
            },
            {
              model: models.Ayudantes,
              as: 'ayudantes',
            },
            {
              model: models.Unidades,
              as: 'unidades',
            },
          ],
          raw: true,
        });

        let detalles = await models.Dcostos.findAll({
          where: {
            cod_costo: costos.id,
          },
          raw: true,
        });

        let attributes = [
          'id',
          'nro_documento',
          'fecha_emision',
          'monto_subtotal',
          'nro_piezas',
          'peso_kgs',
          'carga_neta',
          'cod_cliente_org',
          [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
          [Sequelize.literal(clienteDestDesc), 'cliente_dest_desc'],
        ];

        if (tipo == 'DE') {
          order = [['movimientos', 'nro_documento', 'ASC']];
          attributes.push([Sequelize.literal(montoDolarDesc), 'monto_dolar']);
        } else {
          group = 'movimientos.cod_cliente_dest';
          order = [['movimientos', 'cod_cliente_dest', 'ASC']];
          attributes.push([
            Sequelize.fn('count', Sequelize.col('nro_documento')),
            'total_guias',
          ]);
          attributes.push([
            Sequelize.fn('sum', Sequelize.col('nro_piezas')),
            'total_pzas',
          ]);
          attributes.push([
            Sequelize.fn('sum', Sequelize.col('peso_kgs')),
            'total_kgs',
          ]);
          attributes.push([
            Sequelize.fn('sum', Sequelize.col('carga_neta')),
            'total_neta',
          ]);
          attributes.push([
            Sequelize.fn('sum', Sequelize.col('monto_subtotal')),
            'total_monto',
          ]);
          attributes.push([Sequelize.literal(totalDolarDesc), 'total_dolar']);
        }

        detallesg = await models.Dcostosg.findAll({
          where: {
            cod_costo: costos.id,
          },
          include: [
            {
              model: models.Mmovimientos,
              as: 'movimientos',
              attributes: attributes,
              include: {
                model: models.Agencias,
                as: 'agencias_dest',
                include: {
                  model: models.Ciudades,
                  as: 'ciudades',
                },
              },
            },
          ],
          order: order,
          group: group,
          raw: true,
        });

        if (detallesg.length == 0) return false;

        for (var i = 0; i < detalles.length; i++)
          totalCostos += utils.parseFloatN(detalles[i].monto_costo);
        for (var i = 0; i < detallesg.length; i++) {
          if (tipo == 'DE') {
            totalGuias += utils.parseFloatN(
              detallesg[i]['movimientos.monto_subtotal']
            );
          } else {
            totalGuias += utils.parseFloatN(
              detallesg[i]['movimientos.total_monto']
            );
          }
        }

        if (totalGuias > 0) {
          porcCosto = (totalCostos / totalGuias) * 100;
          porcUtilidad = ((totalGuias - totalCostos) / totalGuias) * 100;
        }

        data.costos = costos;
        data.tipo = tipo;
        data.agencia = agencia;
        data.neta = neta;
        data.dolar = dolar;
        data.totalCostos = totalCostos.toFixed(2);
        data.totalGuias = totalGuias.toFixed(2);
        data.utilidad = (totalGuias - totalCostos).toFixed(2);
        data.porcCosto = porcCosto.toFixed(2);
        data.porcUtilidad = porcUtilidad.toFixed(2);
        data.detalle = detallesg;
        break;
      case 'GE':
        costos = await models.Costos.findAll({
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
                    [
                      Sequelize.fn('sum', Sequelize.col('peso_kgs')),
                      'total_kgs',
                    ],
                    [
                      Sequelize.fn('sum', Sequelize.col('carga_neta')),
                      'total_neta',
                    ],
                    [
                      Sequelize.fn('sum', Sequelize.col('monto_subtotal')),
                      'total_monto',
                    ],
                    [Sequelize.literal(totalDolarDesc2), 'total_dolar'],
                  ],
                  include: {
                    model: models.Agencias,
                    as: 'agencias_dest',
                    include: {
                      model: models.Ciudades,
                      as: 'ciudades',
                    },
                  },
                },
              ],
            },
          ],
          group: 'detallesg.movimientos.cod_agencia_dest',
          order: [['detallesg', 'movimientos', 'cod_agencia_dest', 'ASC']],
          raw: true,
        });

        let detalle = await models.Costos.findAll({
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
              model: models.Dcostos,
              as: 'detalles',
            },
          ],
          raw: true,
        });

        for (var i = 0; i < detalle.length; i++) {
          totalCostos += utils.parseFloatN(detalle[i]['detalles.monto_costo']);
        }

        for (var i = 0; i < costos.length; i++) {
          totalGuias += utils.parseFloatN(
            costos[i]['detallesg.movimientos.total_monto']
          );
        }

        if (totalGuias > 0) {
          porcCosto = (totalCostos / totalGuias) * 100;
          porcUtilidad = ((totalGuias - totalCostos) / totalGuias) * 100;
        }

        data.costos = costos;
        data.tipo = tipo;
        data.agencia = agencia;
        data.neta = neta;
        data.dolar = dolar;
        data.totalCostos = totalCostos.toFixed(2);
        data.totalGuias = totalGuias.toFixed(2);
        data.utilidad = (totalGuias - totalCostos).toFixed(2);
        data.porcCosto = porcCosto.toFixed(2);
        data.porcUtilidad = porcUtilidad.toFixed(2);
        break;
      case 'DI':
        costos = await models.Costos.findAll({
          where: {
            fecha_envio: moment(desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
          },
          attributes: [
            'id',
            'fecha_envio',
            'destino',
            'monto_anticipo',
            'observacion_gnral',
            [Sequelize.literal(montoDolarCostoDesc), 'monto_dolar'],
          ],
          include: [
            {
              model: models.Agencias,
              as: 'agencias',
            },
            {
              model: models.Agentes,
              as: 'agentes',
            },
            {
              model: models.Proveedores,
              as: 'proveedores',
            },
            {
              model: models.Ayudantes,
              as: 'ayudantes',
            },
            {
              model: models.Unidades,
              as: 'unidades',
            },
          ],
          raw: true,
        });

        let totalAnticipo = 0;
        let totalDolar = 0;
        for (var i = 0; i < costos.length; i++) {
          totalAnticipo += utils.parseFloatN(costos[i].monto_anticipo);
          totalDolar += utils.parseFloatN(costos[i].monto_dolar);
        }

        data.desde = desde;
        data.costos = costos;
        data.tipo = tipo;
        data.dolar = dolar;
        data.totalAnticipo = totalAnticipo;
        data.totalDolar = totalDolar;
        break;
      case 'CO':
        costos = await models.Costos.findAll({
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
                    [
                      Sequelize.fn('sum', Sequelize.col('peso_kgs')),
                      'total_kgs',
                    ],
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
        data.tipo = tipo;
        data.neta = neta;
        data.dolar = dolar;
        break;
    }
    await this.generateHeader(doc, data);
    await this.generateCustomerInformation(doc, data);
    return true;
  }

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
        doc.fontSize(22);
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
        doc.fontSize(16);
        doc.y = 80;
        doc.x = 270;
        doc.text('Reporte de Comisiones por Transporte', {
          align: 'left',
          columns: 1,
          width: 400,
        });
        doc.fontSize(12);
        doc.text('Desde: ' + data.desde, 300, 110);
        doc.text('Hasta: ' + data.hasta, 420, 110);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 650, 30);
        doc.y = 190;
        doc.x = 50;
        doc.fontSize(9);
        doc.y = 170;
        doc.x = 30;
        doc.text('Fecha Envio', {
          align: 'left',
          columns: 1,
          width: 100,
        });
        doc.text('Agente', 130, 170);
        doc.text('Destino', 270, 170);
        doc.y = 165;
        doc.x = 350;
        doc.text('Placas Vehículo', {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.text(data.neta == 'true' ? 'Neta' : 'Kgs.', 437, 170);
        doc.text('Pzas', 470, 170);
        doc.text('Guías', 500, 170);
        doc.y = 165;
        doc.x = 530;
        doc.text('Monto Comisión', {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.y = 165;
        doc.x = 582;
        doc.text('Valor Bulto', {
          align: 'center',
          columns: 1,
          width: 30,
        });
        doc.y = 165;
        doc.x = 620;
        doc.text('Valor Guía', {
          align: 'center',
          columns: 1,
          width: 30,
        });
        doc.y = 165;
        doc.x = 673;
        doc.text('Venta sin IVA', {
          align: 'center',
          columns: 1,
          width: 30,
        });
        doc.y = 165;
        doc.x = 717;
        if (data.dolar == 'true') {
          doc.text('Venta $', {
            align: 'center',
            columns: 1,
            width: 40,
          });
        }
        doc.fontSize(8);
        break;
    }
  }

  async generateCustomerInformation(doc, data) {
    var i = 0;
    var page = 0;
    var ymin;
    let total_guias = 0;
    let total_pzas = 0;
    let total_kgs = 0;
    let total_neta = 0;
    let total_monto = 0;
    let total_dolar = 0;
    let total_comision = 0;
    let total_vbultos = 0;
    let total_vguias = 0;

    switch (data.tipo) {
      case 'DE':
        ymin = 270;
        for (var item = 0; item < data.detalle.length; item++) {
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
          doc.text(data.detalle[item]['movimientos.nro_documento'], {
            align: 'left',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 100;
          doc.text(
            moment(data.detalle[item]['movimientos.fecha_emision']).format(
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
          doc.text(data.detalle[item]['movimientos.cliente_orig_desc'].trim(), {
            align: 'left',
            columns: 1,
            width: 123,
          });
          doc.y = ymin + i;
          doc.x = 268;
          doc.text(
            data.detalle[item]['movimientos.cliente_dest_desc'] != null
              ? data.detalle[item]['movimientos.cliente_dest_desc'].trim()
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
            data.detalle[item]['movimientos.agencias_dest.ciudades.siglas'],
            {
              align: 'center',
              columns: 1,
              width: 25,
            }
          );
          total_pzas += utils.parseFloatN(
            data.detalle[item]['movimientos.nro_piezas']
          );
          total_kgs += utils.parseFloatN(
            data.detalle[item]['movimientos.peso_kgs']
          );
          total_neta += utils.parseFloatN(
            data.detalle[item]['movimientos.carga_neta']
          );
          doc.y = ymin + i;
          doc.x = 413;
          doc.text(data.detalle[item]['movimientos.nro_piezas'], {
            align: 'right',
            columns: 1,
            width: 20,
          });
          doc.y = ymin + i;
          doc.x = 440;
          doc.text(
            data.neta == 'true'
              ? utils.formatNumber(data.detalle[item]['movimientos.carga_neta'])
              : utils.formatNumber(data.detalle[item]['movimientos.peso_kgs']),
            {
              align: 'right',
              columns: 1,
              width: 28,
            }
          );
          doc.y = ymin + i;
          doc.x = 465;
          doc.text(
            utils.formatNumber(
              data.detalle[item]['movimientos.monto_subtotal']
            ),
            {
              align: 'right',
              columns: 1,
              width: 60,
            }
          );
          if (data.dolar == 'true') {
            total_dolar += utils.parseFloatN(
              data.detalle[item]['movimientos.monto_dolar']
            );
            doc.y = ymin + i;
            doc.x = 520;
            doc.text(
              utils.formatNumber(data.detalle[item]['movimientos.monto_dolar']),
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
        for (var item = 0; item < data.detalle.length; item++) {
          doc.fontSize(9);
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 35;
          doc.text(
            data.detalle[item]['movimientos.agencias_dest.ciudades.siglas'],
            {
              align: 'center',
              columns: 1,
              width: 35,
            }
          );

          total_guias += utils.parseFloatN(
            data.detalle[item]['movimientos.total_guias']
          );
          total_pzas += utils.parseFloatN(
            data.detalle[item]['movimientos.total_pzas']
          );
          total_kgs += utils.parseFloatN(
            data.detalle[item]['movimientos.total_kgs']
          );
          total_neta += utils.parseFloatN(
            data.detalle[item]['movimientos.total_neta']
          );

          doc.y = ymin + i;
          doc.x = 80;
          doc.text(data.detalle[item]['movimientos.total_guias'], {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 145;
          doc.text(data.detalle[item]['movimientos.total_pzas'], {
            align: 'right',
            columns: 1,
            width: 30,
          });
          let peso_kgs =
            data.neta == 'true'
              ? data.detalle[item]['movimientos.total_neta']
              : data.detalle[item]['movimientos.total_kgs'];
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
            utils.formatNumber(data.detalle[item]['movimientos.total_monto']),
            {
              align: 'right',
              columns: 1,
              width: 80,
            }
          );
          let porcCosto =
            utils.parseFloatN(data.detalle[item]['movimientos.total_monto']) /
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
              data.detalle[item]['movimientos.total_dolar']
            );
            doc.y = ymin + i;
            doc.x = 520;
            doc.text(
              utils.formatNumber(data.detalle[item]['movimientos.total_dolar']),
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
          doc.text(
            'Origen: ' + data.costos[item]['agencias.nb_agencia'],
            50,
            ymin + i + 13
          );
          doc.text(
            'Chofer: ' + data.costos[item]['agentes.persona_responsable'],
            50,
            ymin + i + 33
          );
          let ayudante =
            data.costos[item]['ayudantes.nb_ayudante'] == null
              ? ''
              : data.costos[item]['ayudantes.nb_ayudante'];
          doc.text('Ayudante: ' + ayudante, 50, ymin + i + 51);
          doc.text(
            'Destinos: ' + data.costos[item].destino,
            270,
            ymin + i + 13
          );
          doc.text(
            'Anticipo: ' + data.costos[item].monto_anticipo,
            270,
            ymin + i + 33
          );
          doc.y = ymin + i + 13;
          doc.x = 490;
          doc.text(
            'Vehiculo: ' +
              data.costos[item]['unidades.placas'] +
              ' - Vehículo: ' +
              data.costos[item]['unidades.descripcion'],
            {
              align: 'left',
              columns: 1,
              width: 250,
            }
          );
          let observacion =
            data.costos[item].observacion_gnral == null
              ? ''
              : data.costos[item].observacion_gnral;
          doc.y = ymin + i + 43;
          doc.x = 490;
          doc.text('Observacion: ' + observacion, {
            align: 'left',
            columns: 1,
            width: 250,
          });
          i += 80;
          if (i >= 350 || item >= 100) {
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, data);
          }
        }
        doc.font('Helvetica-Bold');
        doc.fontSize(18);
        doc.fillColor('#BLACK');
        doc.y = ymin + i + 10;
        doc.x = 450;
        doc.text('Total Anticipo:', {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.fontSize(12);
        doc.y = ymin + i + 12;
        doc.x = 520;
        doc.text(utils.formatNumber(data.totalAnticipo), {
          align: 'right',
          columns: 1,
          width: 150,
        });
        if (data.dolar == 'true') {
          doc.y = ymin + i + 12;
          doc.x = 590;
          doc.text(utils.formatNumber(data.totalDolar) + '$', {
            align: 'right',
            columns: 1,
            width: 150,
          });
        }
        break;
      case 'CO':
        ymin = 185;
        for (var item = 0; item < data.costos.length; item++) {
          doc.fillColor('#BLACK');
          doc.y = ymin + i + 5;
          doc.x = 33;
          doc.text(moment(data.costos[item].fecha_envio).format('DD/MM/YYYY'), {
            align: 'left',
            columns: 1,
            width: 65,
          });
          doc.y = ymin + i + 5;
          doc.x = 90;
          doc.text(data.costos[item]['agentes.persona_responsable'], {
            align: 'left',
            columns: 1,
            width: 140,
          });
          doc.y = ymin + i + 5;
          doc.x = 210;
          doc.text(data.costos[item].destino, {
            align: 'center',
            columns: 1,
            width: 150,
          });
          doc.y = ymin + i + 5;
          doc.x = 360;
          doc.text(data.costos[item]['unidades.placas'], {
            align: 'left',
            columns: 1,
            width: 60,
          });
          doc.y = ymin + i + 5;
          doc.x = 400;
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
              width: 60,
            }
          );
          doc.y = ymin + i + 5;
          doc.x = 465;
          doc.text(data.costos[item]['detallesg.movimientos.total_pzas'], {
            align: 'center',
            columns: 1,
            width: 35,
          });
          doc.y = ymin + i + 5;
          doc.x = 500;
          doc.text(data.costos[item]['detallesg.movimientos.total_guias'], {
            align: 'center',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i + 5;
          doc.x = 520;
          doc.text(
            utils.formatNumber(
              data.costos[item]['detallesg.movimientos.total_comision']
            ),
            {
              align: 'right',
              columns: 1,
              width: 50,
            }
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

          doc.y = ymin + i + 5;
          doc.x = 570;
          doc.text(utils.formatNumber(valorBulto.toFixed(2)), {
            align: 'right',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i + 5;
          doc.x = 610;
          doc.text(utils.formatNumber(valorGuia.toFixed(2)), {
            align: 'right',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i + 5;
          doc.x = 650;
          doc.text(
            utils.formatNumber(
              data.costos[item]['detallesg.movimientos.total_monto']
            ),
            {
              align: 'right',
              columns: 1,
              width: 60,
            }
          );
          if (data.dolar == 'true') {
            doc.y = ymin + i + 5;
            doc.x = 715;
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
          i = i + 13;
          if (i >= 350 || item >= data.costos.length) {
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, data);
          }
        }
        doc.y = ymin + i + 5;
        doc.x = 360;
        doc.text('TOTALES:', {
          align: 'left',
          columns: 1,
          width: 80,
        });
        doc.y = ymin + i + 5;
        doc.x = 400;
        doc.text(
          data.neta == 'true'
            ? utils.formatNumber(total_neta)
            : utils.formatNumber(total_kgs),
          {
            align: 'right',
            columns: 1,
            width: 60,
          }
        );
        doc.y = ymin + i + 5;
        doc.x = 465;
        doc.text(total_pzas, {
          align: 'center',
          columns: 1,
          width: 35,
        });
        doc.y = ymin + i + 5;
        doc.x = 500;
        doc.text(total_guias, {
          align: 'center',
          columns: 1,
          width: 30,
        });
        doc.y = ymin + i + 5;
        doc.x = 520;
        doc.text(utils.formatNumber(total_comision), {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 570;
        doc.text(utils.formatNumber(total_vbultos), {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i + 5;
        doc.x = 610;
        doc.text(utils.formatNumber(total_vguias), {
          align: 'right',
          columns: 1,
          width: 40,
        });
        doc.y = ymin + i + 5;
        doc.x = 650;
        doc.text(utils.formatNumber(total_monto), {
          align: 'right',
          columns: 1,
          width: 60,
        });
        if (data.dolar == 'true') {
          doc.y = ymin + i + 5;
          doc.x = 715;
          doc.text(utils.formatNumber(total_dolar), {
            align: 'right',
            columns: 1,
            width: 40,
          });
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
      if (data.tipo == 'DI' || data.tipo == 'CO') {
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

module.exports = CostosTransporteService;
