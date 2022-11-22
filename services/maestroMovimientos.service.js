const boom = require('@hapi/boom');

const PDFDocument = require('pdfkit');
const getStream = require('get-stream');
const base64 = require('base64-stream');
const moment = require('moment');

const { models, Sequelize } = require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();
const PdfService = require('./pdf.service');
const pdf = new PdfService();

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
    cod_ag_doc_ppal
  ) {
    let params2 = {};
    let filterArray = {};
    let order = [];

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

    let attributes = {};

    if (order_by && order_direction) {
      order.push([order_by, order_direction]);
    }

    return await utils.paginate(
      models.Mmovimientos,
      page,
      limit,
      params,
      order,
      attributes
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

  async letterPDF(data, contacto, cargo) {
    let doc = new PDFDocument({ margin: 50 });
    await this.generateCustomerInformation(doc, data, contacto, cargo);
    doc.end();
    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }

  async generateHeader(doc, data) {
    var assign = 'Asignada a: ';
    if (data['agentes.id']) {
      assign += `Agente: ${data['agentes.nb_agente']} - ${data['agentes.persona_responsable']}`;
    } else if (data['clientes.id']) {
      assign += `Cliente: ${data['clientes.razon_social']}`;
    } else if (data['agencias.id']) {
      assign += `Agencia: ${data['agencias.nb_agencia']}`;
    } else {
      assign = '';
    }

    pdf.generateHeader(
      doc,
      'Reporte de Guias Disponibles',
      `Guias Desde: ${data.control_inicio}       Guias Hasta: ${data.control_final}`,
      assign,
      moment().format('DD/MM/YYYY')
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

    doc.lineJoin('miter').rect(127, 50, 78, 20).stroke();
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
      column = 132;
    }
    if (column == 3) {
      column = 209;
    }
    if (column == 4) {
      column = 383;
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
    doc.lineJoin('miter').rect(50, heigth, 513, 20).stroke();
    return doc;
  }

  async generateCustomerInformation(doc, data, contacto, cargo) {
    var data = await this.guiasDispLote(32783);
    await this.generateHeader(doc, data);

    doc
      .fontSize(14)
      .text('Señores', 50, 150)
      .text('COMERCIALIZADORA CIERO, C.A', 50, 170)
      .text('VALENCIA.-', 50, 190)

      .text(
        'Después de saludarle, sirva la presente para informarle que anexo le estamos enviando relación de cobros correspondiente a los servicios de transporte prestados',
        50,
        220
      );
    doc.fontSize(12);

    doc.lineJoin('miter').rect(50, 299, 78, 20).stroke();
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

    doc.lineJoin('miter').rect(127, 299, 78, 20).stroke();
    doc.y = 306;
    doc.x = 132;
    doc.fillColor('black');
    doc.text('NRO. DOC', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');

    doc.lineJoin('miter').rect(205, 299, 78, 20).stroke();
    doc.y = 306;
    doc.x = 215;
    doc.fillColor('black');
    doc.text('FECHA', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');

    doc.lineJoin('miter').rect(283, 299, 280, 20).stroke();
    doc.y = 306;
    doc.x = 375;
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

    for (var item = 0; item <= data.data.length - 1; ) {
      this.row(doc, y + i);
      this.textInRowFirst(doc, 'Guía Carga', y + 7 + i, 1);
      this.textInRowFirst(doc, data.data[item].nro_documento, y + 7 + i, 2);
      this.textInRowFirst(doc, data.data[item].nro_documento, y + 7 + i, 3);
      this.textInRowFirst(doc, data.data[item].nro_documento, y + 7 + i, 4);
      this.textInRowFirst(doc, 'Facturas Asociadas', y + 36 + i, 1);
      doc.fontSize(12);
      doc.y = y + 30 + i;
      doc.x = 200;
      doc.fillColor('black');
      doc.text(
        '1010/1023/1233/23423/2342/3454322/34534/3454322/34534/34534/34534/34534/34534'
      );
      doc
        .lineJoin('miter')
        .rect(50, y + 20 + i, 513, 40)
        .stroke();

      doc
        .lineCap('butt')
        .moveTo(190, y + 20 + i)
        .lineTo(190, y + 60 + i)
        .stroke();

      doc
        .lineCap('butt')
        .moveTo(127, y + i)
        .lineTo(127, y + 20 + i)
        .stroke();
      doc
        .lineCap('butt')
        .moveTo(205, y + i)
        .lineTo(205, y + 20 + i)
        .stroke();

      doc
        .lineCap('butt')
        .moveTo(283, y + i)
        .lineTo(283, y + 20 + i)
        .stroke();

      item = item + 1;
      i = i + 60;

      if (i >= ymax) {
        doc.addPage();
        y = 70;
        ymax = 640;
        page = page + 1;
        this.titleTable(doc, 'NRO. GUIA');
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
