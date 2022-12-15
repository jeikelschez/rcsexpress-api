const boom = require('@hapi/boom');

const PDFDocument = require('pdfkit');
const getStream = require('get-stream');
const base64 = require('base64-stream');
const moment = require('moment');

const { models, Sequelize } = require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();
const PdfService = require('./pdf.service');

const clienteOrigDesc =
  '(CASE WHEN (ci_rif_cte_conta_org IS NULL || ci_rif_cte_conta_org = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `Mmovimientos`.cod_cliente_org = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `Mmovimientos`.cod_agencia = clientes_particulares.cod_agencia' +
  ' AND `Mmovimientos`.cod_cliente_org = clientes_particulares.cod_cliente' +
  ' AND `Mmovimientos`.ci_rif_cte_conta_org = clientes_particulares.rif_ci' +
  ' AND clientes_particulares.estatus = "A" LIMIT 1)' +
  ' END)';
const clienteDestDesc =
  '(CASE WHEN (ci_rif_cte_conta_dest IS NULL || ci_rif_cte_conta_dest = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `Mmovimientos`.cod_cliente_dest = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `Mmovimientos`.cod_agencia_dest = clientes_particulares.cod_agencia' +
  ' AND `Mmovimientos`.cod_cliente_dest = clientes_particulares.cod_cliente' +
  ' AND `Mmovimientos`.ci_rif_cte_conta_dest = clientes_particulares.rif_ci' +
  ' AND clientes_particulares.estatus = "A" LIMIT 1)' +
  ' END)';
const nroControlDesc =
  '(CASE WHEN nro_control IS NULL THEN CONCAT(serie_documento, nro_documento)' +
  ' WHEN nro_control_new IS NULL THEN LPAD(nro_control, 4, "0000")' +
  ' WHEN serie_documento IS NULL THEN LPAD(nro_control_new, 9, "00-000000")' +
  ' ELSE CONCAT(serie_documento, "-", LPAD(nro_control_new, 9, "00-000000")) ' +
  ' END)';
const nroDocumentoDesc =
  '(CASE WHEN nro_control IS NULL THEN CONCAT(serie_documento, "-",  nro_documento)' +
  ' ELSE CONCAT(t_de_documento, " ", LPAD(nro_control, 5, "0")) ' +
  ' END)';

class MmovimientosService {
  constructor() {}

  async create(data) {
    const newMmovimiento = await models.Mmovimientos.create(data);
    return newMmovimiento;
  }

  async find(
    page,
    limit,
    order_by,
    order_direction,
    filter,
    filter_value,
    agencia,
    agencia_dest,
    nro_documento,
    tipo,
    tipo_in,
    desde,
    hasta,
    cliente_orig,
    cliente_dest,
    cliente_orig_exist,
    cliente_part_exist,
    estatus_oper,
    transito,
    estatus_admin_in,
    estatus_admin_ex,
    no_abono,
    tipo_doc_ppal,
    nro_doc_ppal,
    serie_doc_ppal,
    nro_ctrl_doc_ppal,
    cod_ag_doc_ppal,
    order_pe,
    pagado_en,
    modalidad
  ) {
    let params2 = {};
    let filterArray = {};
    let order = [];
    let include = [];

    if (agencia) params2.cod_agencia = agencia;
    if (agencia_dest) params2.cod_agencia_dest = agencia_dest;
    if (nro_documento) params2.nro_documento = nro_documento;
    if (tipo) params2.t_de_documento = tipo;

    if (tipo_in) {
      params2.t_de_documento = {
        [Sequelize.Op.in]: tipo_in.split(','),
      };
    }

    if (desde) {
      params2.fecha_emision = {
        [Sequelize.Op.gte]: desde,
      };
    }

    if (hasta) {
      if (desde) {
        params2.fecha_emision = {
          [Sequelize.Op.between]: [desde, hasta],
        };
      } else {
        params2.fecha_emision = {
          [Sequelize.Op.lte]: hasta,
        };
      }
    }

    if (cliente_orig) params2.cod_cliente_org = cliente_orig;
    if (cliente_dest) params2.cod_cliente_dest = cliente_dest;

    if (cliente_orig_exist) {
      params2.cod_cliente_org = {
        [Sequelize.Op.not]: null,
      };
    }

    if (cliente_part_exist) {
      params2.id_clte_part_orig = {
        [Sequelize.Op.not]: null,
      };
    }

    if (estatus_oper) params2.estatus_operativo = estatus_oper;
    if (transito) params2.check_transito = transito;

    if (estatus_admin_in) {
      params2.estatus_administra = {
        [Sequelize.Op.in]: estatus_admin_in.split(','),
      };
    }

    if (estatus_admin_ex) {
      params2.estatus_administra = {
        [Sequelize.Op.notIn]: estatus_admin_ex.split(','),
      };
    }
    if (no_abono) {
      params2.monto_total = {
        [Sequelize.Op.col]: 'saldo',
      };
    }

    if (tipo_doc_ppal) params2.tipo_doc_principal = tipo_doc_ppal;
    if (nro_doc_ppal) params2.nro_doc_principal = nro_doc_ppal;
    if (serie_doc_ppal) params2.serie_doc_principal = serie_doc_ppal;
    if (nro_ctrl_doc_ppal) params2.nro_ctrl_doc_ppal = nro_ctrl_doc_ppal;
    if (cod_ag_doc_ppal) params2.cod_ag_doc_ppal = cod_ag_doc_ppal;
    if (pagado_en) params2.pagado_en = pagado_en;
    if (modalidad) params2.modalidad_pago = modalidad;

    if (filter && filter_value) {
      let filters = [];
      filter.split(',').forEach(function (item) {
        let itemArray = {};
        itemArray[item] = { [Sequelize.Op.substring]: filter_value };
        filters.push(itemArray);
      });

      filterArray = {
        [Sequelize.Op.or]: filters,
      };
    }

    let params = { ...params2, ...filterArray };

    let attributes = {
      include: [
        [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
        [Sequelize.literal(clienteDestDesc), 'cliente_dest_desc'],
      ],
    };

    if (order_pe) {
      order.push(['cod_agencia', 'ASC']);
      order.push(['cod_agencia_dest', 'ASC']);
      order.push(['nro_documento', 'ASC']);
      order.push(['fecha_emision', 'ASC']);
    } else if (order_by && order_direction) {
      order.push([order_by, order_direction]);
    }

    return await utils.paginate(
      models.Mmovimientos,
      page,
      limit,
      params,
      order,
      attributes,
      include
    );
  }

  async findOne(id) {
    const mMovimiento = await models.Mmovimientos.findByPk(id);
    if (!mMovimiento) {
      throw boom.notFound('Maestro de Movimientos no existe');
    }
    return mMovimiento;
  }

  async update(id, changes) {
    const mMovimiento = await models.Mmovimientos.findByPk(id);
    if (!mMovimiento) {
      throw boom.notFound('Maestro de Movimientos no existe');
    }
    const rta = await mMovimiento.update(changes);
    return rta;
  }

  async delete(id) {
    const mMovimiento = await models.Mmovimientos.findByPk(id);
    if (!mMovimiento) {
      throw boom.notFound('Maestro de Movimientos no existe');
    }
    await mMovimiento.destroy();
    return { id };
  }

  async guiasDispLote(lote) {
    let arrayDisp = [];
    let arrayLote = await models.Cguias.findByPk(lote, {
      include: ['agencias', 'clientes', 'agentes'],
      raw: true,
    });
    let movimientos = await models.Mmovimientos.findAll({
      where: {
        t_de_documento: 'GC',
        nro_documento: {
          [Sequelize.Op.gte]: arrayLote.control_inicio,
          [Sequelize.Op.lte]: arrayLote.control_final,
        },
      },
      raw: true,
    });
    for (var i = arrayLote.control_inicio; i <= arrayLote.control_final; i++) {
      if (movimientos.findIndex((item) => item.nro_documento == i) < 0) {
        arrayDisp.push({ nro_documento: i });
      }
    }
    arrayLote['data'] = arrayDisp;
    return arrayLote;
  }

  async letterPDF(data, cliente, contacto, cargo, ciudad) {
    let doc = new PDFDocument({ margin: 50 });
    await this.generateHeader(doc, cliente, contacto, cargo, ciudad);
    await this.generateCustomerInformation(doc, data);
    doc.end();
    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }

  async generateHeader(doc, cliente, contacto, cargo, ciudad) {
    moment.locale('es');
    doc
      .image('./img/logo_rc.png', 50, 45, { width: 50 })
      .fillColor('#444444')
      .fontSize(13)
      .font('Helvetica-Bold')
      .text('RCS Express, S.A', 110, 89)
      .text('R.I.F. J-31028463-6', 110, 107)
      .fontSize(12)
      .text('Valencia, ' + moment().format('LL'), 200, 50, { align: 'right' })
      .moveDown();

    doc
      .fontSize(12)
      .text('Señores', 50, 150)
      .text(cliente, 50, 165)
      .text(contacto ? 'Atención' : ciudad, 50, 180)
      .text(contacto ? 'Sr(a).' + contacto : '', 50, 195)
      .text(contacto ? cargo : '', 50, 210);

    doc
      .fontSize(14)
      .text(
        'Después de saludarle, sirva la presente para informarle que anexo le estamos enviando relación de cobros correspondiente a los servicios de transporte prestados',
        50,
        240,
        {
          align: 'justify',
        }
      );
  }

  async titleTable(doc) {
    doc.lineJoin('miter').rect(50, 50, 78, 20).stroke();
    doc.y = 56;
    doc.x = 52;
    doc.fillColor('black');
    doc.text('NRO. CTRL', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');

    doc.lineJoin('miter').rect(115, 50, 78, 20).stroke();
    doc.y = 56;
    doc.x = 132;
    doc.fillColor('black');
    doc.text('NRO. DOC', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');

    doc.lineJoin('miter').rect(205, 50, 78, 20).stroke();
    doc.y = 56;
    doc.x = 215;
    doc.fillColor('black');
    doc.text('FECHA', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');

    doc.lineJoin('miter').rect(283, 50, 280, 20).stroke();
    doc.y = 56;
    doc.x = 375;
    doc.fillColor('black');
    doc.text('DESCRIPCION', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');
  }

  async textInRowFirst(doc, text, heigth, column) {
    if (column == 1) {
      column = 52;
    }
    if (column == 2) {
      column = 120;
    }
    if (column == 3) {
      column = 180;
    }
    doc.y = heigth;
    doc.x = column;
    doc.fillColor('black');
    doc.text(text, {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 2,
    });
    return doc;
  }

  async row(doc, heigth) {
    doc.lineJoin('miter').rect(50, heigth, 513, 30).stroke();
    return doc;
  }

  async generateCustomerInformation(doc, data) {
    doc.fontSize(10);

    doc.lineJoin('miter').rect(50, 299, 65, 20).stroke();
    doc.y = 306;
    doc.x = 52;
    doc.fillColor('black');
    doc.text('NRO. CTRL', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');

    doc.lineJoin('miter').rect(115, 299, 65, 20).stroke();
    doc.y = 306;
    doc.x = 117;
    doc.fillColor('black');
    doc.text('NRO. DOC', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');

    doc.lineJoin('miter').rect(180, 299, 60, 20).stroke();
    doc.y = 306;
    doc.x = 186;
    doc.fillColor('black');
    doc.text('FECHA', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');

    doc.lineJoin('miter').rect(240, 299, 323, 20).stroke();
    doc.y = 306;
    doc.x = 355;
    doc.fillColor('black');
    doc.text('DESCRIPCION', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');

    // DATOS DE TABLA
    var i = 0;
    var page = 0;
    var y = 320;
    var ymax = 400;

    data = data.split(',');

    for (var item = 0; item <= data.length - 1; item++) {
      let dataMovimiento = await models.Mmovimientos.findByPk(data[item], {
        attributes: {
          include: [
            [Sequelize.literal(nroControlDesc), 'nro_control_desc'],
            [Sequelize.literal(nroDocumentoDesc), 'nro_documento_desc'],
          ],
        },
        raw: true,
      });
      this.row(doc, y + i);
      this.textInRowFirst(doc, dataMovimiento.nro_control_desc, y + 11 + i, 1);
      this.textInRowFirst(doc, dataMovimiento.nro_documento_desc, y + 11 + i, 2);
      this.textInRowFirst(doc, moment(dataMovimiento.fecha_emision).format("DD/MM/YYYY"), y + 11 + i, 3);
      doc.fontSize(8);
      doc.y = y + 7 + i;
      doc.x = 255;
      doc.text(dataMovimiento.observacion_entrega + "sdfsdfsd sdfsdfsdf");
      doc.fontSize(10);
      this.textInRowFirst(doc, 'Facturas', y + 36 + i, 1);
      this.textInRowFirst(doc, 'Asociadas', y + 47 + i, 1);
      doc.y = y + 36 + i;
      doc.x = 132;
      doc.fillColor('black');
      doc.text(
        '1010/1023/1233/23423/2342/3454322/34534/3454322/34534/34534/34534/34534/345341010/1023/1233/23423/2342/3454322/34534/3454322/34534/34534/34534/34534/34534'
      );
      doc
        .lineJoin('miter')
        .rect(50, y + 30 + i, 513, 30)
        .stroke();

      doc
        .lineCap('butt')
        .moveTo(115, y + 30 + i)
        .lineTo(115, y + 60 + i)
        .stroke();

      doc
        .lineCap('butt')
        .moveTo(115, y + i)
        .lineTo(115, y + 30 + i)
        .stroke();

      doc
        .lineCap('butt')
        .moveTo(180, y + i)
        .lineTo(180, y + 30 + i)
        .stroke();

      doc
        .lineCap('butt')
        .moveTo(240, y + i)
        .lineTo(240, y + 30 + i)
        .stroke();

      i = i + 60;

      if (i >= ymax) {
        doc.addPage();
        y = 70;
        ymax = 640;
        page = page + 1;
        this.titleTable(doc);
        doc.switchToPage(page);
        i = 0;
      }
    }
    doc.y = y + 30 + i;
    doc.x = 100;
    doc.fillColor('black');
    doc.text('Total');
    doc.y = y + 30 + i;
    doc.x = 200;
    doc.text('123123123');
    doc
      .lineJoin('miter')
      .rect(50, y + 20 + i, 250, 25)
      .stroke();
    doc
      .lineCap('butt')
      .moveTo(170, y + 20 + i)
      .lineTo(170, y + 45 + i)
      .stroke();

    doc.x = 50;
    doc.y = y + 70 + i;
    doc.text('Sin mas a que hacer referencia queda de Ustedes ,');
    doc.y = y + 90 + i;
    doc.text('Atentamente ,');

    doc
      .lineCap('butt')
      .moveTo(400, y + 80 + i)
      .lineTo(550, y + 80 + i)
      .stroke();

    doc.x = 421;
    doc.y = y + 90 + i;
    doc.text('Zohagrick  Elleboro');
    doc.x = 432;
    doc.y = y + 110 + i;
    doc.text('FACTURACION');
  }
}

module.exports = MmovimientosService;
