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
  async mainReport(doc, client, desde, hasta, estatus, ciudad, guia) {
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

    await this.generateHeader(doc, data);
    await this.generateCustomerInformation(doc, data, detalles);
    return true;
  }

  async generateHeader(doc, data) {
    doc.image('./img/logo_rc.png', 35, 25, { width: 60 });
    doc.fontSize(8);
    doc.text('RCS EXPRESS, S.A', 35, 120);
    doc.text('RIF. J-31028463-6', 35, 130);
    doc.font('Helvetica-Bold');
    doc.fillColor('#444444');

    doc.fontSize(16);

    doc.y = 60;
    doc.x = 200;
    doc.text('GUIAS CARGAS EMITIDAS', {
      align: 'center',
      columns: 1,
      width: 400,
    });

    doc.fontSize(12);
    doc.y = 80;
    doc.x = 200;
    doc.text('Empresa: ' + data.cliente, {
      align: 'center',
      columns: 1,
      width: 400,
    });
    doc.y = 95;
    doc.x = 290;
    doc.text('Desde: ' + moment(data.fecha_desde).format('DD/MM/YYYY'), {
      align: 'left',
      columns: 1,
      width: 300,
    });
    doc.y = 95;
    doc.x = 407;
    doc.text('Hasta: ' + moment(data.fecha_hasta).format('DD/MM/YYYY'), {
      align: 'left',
      columns: 1,
      width: 300,
    });
    doc.y = 95;
    doc.x = 290;
    doc.text('Desde: ' + moment(data.fecha_desde).format('DD/MM/YYYY'), {
      align: 'left',
      columns: 1,
      width: 300,
    });
    doc.y = 95;
    doc.x = 407;
    doc.text('Hasta: ' + moment(data.fecha_hasta).format('DD/MM/YYYY'), {
      align: 'left',
      columns: 1,
      width: 300,
    });
    doc.y = 110;
    doc.x = 200;
    doc.text('Estatus: ' + data.estatus + '  Destino: ' + data.destino, {
      align: 'center',
      columns: 1,
      width: 400,
    });

    doc.fontSize(10);
    doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 680, 35);

    doc.fontSize(9);
    doc.text('Destino', 55, 160);
    doc.text('Nº Guía', 115, 160);
    doc.text('N° Fact Cliente', 170, 160);
    doc.text('Destinatario', 280, 160);
    doc.text('Piezas', 375, 160);
    doc.text('Peso', 410, 160);
    doc.text('Receptor', 440, 160);
    doc.text('CI/Rif', 498, 160);
    doc.text('Emisión', 537, 160);
    doc.text('Recepción', 582, 160);
    doc.text('Estatus', 640, 160);
    doc.text('Motivo Retraso', 690, 160);
  }

  async generateCustomerInformation(doc, data, detalles) {
    var i = 0;
    var page = 0;
    var ymin;
    ymin = 180;

    let total_cobrado = 0;
    let total_bs = 0;

    for (var item = 0; item < detalles.length; item++) {
      doc.fontSize(7);
      doc.font('Helvetica');
      doc.fillColor('#444444');
      doc.y = ymin + i;
      doc.x = 35;
      doc.text(detalles[item]['agencias_dest.ciudades.desc_ciudad'], {
        align: 'left',
        columns: 1,
        width: 75,
      });
      doc.y = ymin + i;
      doc.x = 105;
      doc.text(detalles[item].nro_documento, {
        align: 'center',
        columns: 1,
        width: 50,
      });
      doc.y = ymin + i;
      doc.x = 160;
      doc.text(detalles[item].dimensiones, {
        align: 'left',
        columns: 1,
        width: 90,
      });
      doc.y = ymin + i;
      doc.x = 255;
      doc.text(detalles[item].cliente_dest_desc, {
        align: 'left',
        columns: 1,
        width: 130,
      });
      doc.y = ymin + i;
      doc.x = 375;
      doc.text(detalles[item].nro_piezas, {
        align: 'center',
        columns: 1,
        width: 30,
      });
      doc.y = ymin + i;
      doc.x = 400;
      doc.text(utils.formatNumber(detalles[item].peso_kgs), {
        align: 'right',
        columns: 1,
        width: 30,
      });
      doc.y = ymin + i;
      doc.x = 430;
      doc.text(
        detalles[item].persona_recibio == null ||
          detalles[item].persona_recibio == ''
          ? 'NO DEFINIDO'
          : detalles[item].persona_recibio,
        {
          align: 'center',
          columns: 1,
          width: 60,
        }
      );
      doc.y = ymin + i;
      doc.x = 480;
      doc.text(detalles[item].ci_persona_recibio, {
        align: 'center',
        columns: 1,
        width: 60,
      });
      doc.y = ymin + i;
      doc.x = 525;
      doc.text(moment(detalles[item].fecha_emision).format('DD/MM/YYYY'), {
        align: 'center',
        columns: 1,
        width: 60,
      });
      doc.y = ymin + i;
      doc.x = 575;
      doc.text(
        detalles[item].fecha_recepcion == null
          ? ''
          : moment(detalles[item].fecha_recepcion).format('DD/MM/YYYY'),
        {
          align: 'center',
          columns: 1,
          width: 60,
        }
      );
      doc.y = ymin + i;
      doc.x = 627;
      doc.text(
        estatus_operativo.find(
          (estatus) => estatus.value == detalles[item].estatus_operativo
        ).label,
        {
          align: 'center',
          columns: 1,
          width: 60,
        }
      );

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
      doc.y = ymin + i;
      doc.x = 684;
      doc.text(motivo, {
        align: 'left',
        columns: 1,
        width: 80,
      });

      i += 25;
      if (i >= 400) {
        doc.fontSize(9);
        doc.addPage();
        page = page + 1;
        doc.switchToPage(page);
        i = 0;
        await this.generateHeader(doc, data);
      }
    }
    var end;
    const range = doc.bufferedPageRange();
    for (
      i = range.start, end = range.start + range.count, range.start <= end;
      i < end;
      i++
    ) {
      doc.switchToPage(i);
      doc.fillColor('#444444');
      doc.x = 665;
      doc.y = 50;
      doc.fontSize(10);
      doc.text(`Pagina ${i + 1} de ${range.count}`, {
        align: 'right',
        columns: 1,
        width: 100,
      });
    }
  }
}

module.exports = GuiasEmpresaService;
