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

class CguiasService {
  constructor() {}

  async create(data) {
    // Valida que el lote no exista
    const cguias = await models.Cguias.count({
      where: {
        [Sequelize.Op.or]: [
          {
            tipo: data.tipo,
            control_inicio: {
              [Sequelize.Op.gte]: data.control_inicio,
            },
            control_final: {
              [Sequelize.Op.lte]: data.control_final,
            },
          },
          {
            tipo: data.tipo,
            control_inicio: {
              [Sequelize.Op.lte]: data.control_inicio,
            },
            control_final: {
              [Sequelize.Op.gte]: data.control_final,
            },
          },
        ],
      },
    });

    if (cguias > 0) {
      throw boom.badRequest(
        'El lote para este tipo de guía ya está registrado'
      );
    }

    const newCguia = await models.Cguias.create(data);
    return newCguia;
  }

  async find(
    page,
    limit,
    order_by,
    order_direction,
    filter,
    filter_value,
    agencia,
    agente,
    cliente,
    desde,
    desde_fact,
    hasta,
    hasta_fact,
    disp,
    tipo
  ) {
    let params2 = {};
    let filterArray = {};
    let order = [];

    if (agencia) params2.cod_agencia = agencia;
    if (agente) params2.cod_agente = agente;
    if (cliente) params2.cod_cliente = cliente;

    if (desde) {
      params2.control_inicio = {
        [Sequelize.Op.gte]: desde,
      };
    }
    if (hasta) {
      params2.control_final = {
        [Sequelize.Op.lte]: hasta,
      };
    }

    if (desde_fact) {
      params2.control_inicio = {
        [Sequelize.Op.lte]: desde_fact,
      };
    }
    if (hasta_fact) {
      params2.control_final = {
        [Sequelize.Op.gte]: hasta_fact,
      };
    }

    if (disp) params2.cant_disponible = disp;
    if (tipo) params2.tipo = tipo;

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

    if (order_by && order_direction) {
      order.push([order_by, order_direction]);
    }

    let attributes = {};
    let include = ['tipos'];

    return await utils.paginate(
      models.Cguias,
      page,
      limit,
      params,
      order,
      attributes,
      include
    );
  }

  async findOne(id) {
    const cguia = await models.Cguias.findByPk(id, {
      include: ['tipos'],
    });
    if (!cguia) {
      throw boom.notFound('Numero de Control de Guía no existe');
    }
    return cguia;
  }

  async update(id, changes) {
    const cguia = await models.Cguias.findByPk(id);
    if (!cguia) {
      throw boom.notFound('Numero de Control de Guía no existe');
    }
    const rta = await cguia.update(changes);
    return rta;
  }

  async delete(id) {
    const cguia = await models.Cguias.findByPk(id);
    if (!cguia) {
      throw boom.notFound('Numero de Control de Guía no existe');
    }
    await cguia.destroy();
    return { id };
  }

  // async guiasDispLote(lote) {
  //   let arrayDisp = [];
  //   let arrayLote = await models.Cguias.findByPk(lote, {
  //     include: ['agencias', 'clientes', 'agentes'],
  //     raw: true,
  //   });
  //   let movimientos = await models.Mmovimientos.findAll({
  //     where: {
  //       t_de_documento: 'GC',
  //       nro_documento: {
  //         [Sequelize.Op.gte]: arrayLote.control_inicio,
  //         [Sequelize.Op.lte]: arrayLote.control_final,
  //       },
  //     },
  //     raw: true,
  //   });
  //   for (var i = arrayLote.control_inicio; i <= arrayLote.control_final; i++) {
  //     if (movimientos.findIndex((item) => item.nro_documento == i) < 0) {
  //       arrayDisp.push({ nro_documento: i });
  //     }
  //   }
  //   arrayLote['data'] = arrayDisp;
  //   return arrayLote;
  // }

  // async generatePdf(id) {
  //   let doc = new PDFDocument({ margin: 50 });
  //   await this.generateCustomerInformation(doc, id);
  //   doc.end();
  //   var encoder = new base64.Base64Encode();
  //   var b64s = doc.pipe(encoder);
  //   return await getStream(b64s);
  // }

  // async generateHeader(doc, data) {
  //   var assign = "Asignada a: ";
  //   if(data['agentes.id']) {
  //     assign += `Agente: ${data['agentes.nb_agente']} - ${data['agentes.persona_responsable']}`;
  //   } else if (data['clientes.id']) {
  //     assign += `Cliente: ${data['clientes.razon_social']}`;
  //   } else if (data['agencias.id']) {
  //     assign += `Agencia: ${data['agencias.nb_agencia']}`;
  //   } else {
  //     assign = "";
  //   }

  //   pdf.generateHeader(
  //     doc,
  //     'Reporte de Guias Disponibles',
  //     `Guias Desde: ${data.control_inicio}       Guias Hasta: ${data.control_final}`,
  //     assign,
  //     moment().format("DD/MM/YYYY")
  //   );
  // }

  // async titleTable(doc, title) {
  //   this.row(doc, 140);
  //   doc.y = 147;
  //   doc.x = 283;
  //   doc.fillColor('black');
  //   doc.text(title, {
  //     paragraphGap: 5,
  //     indent: 5,
  //     align: 'justify',
  //     columns: 1,
  //   });
  //   doc.lineCap('butt');
  // }

  // async textInRowFirst(doc, text, heigth, column) {
  //   if (column == 1) {
  //     column = 195;
  //   } else {
  //     column = 300;
  //   }
  //   doc.y = heigth;
  //   doc.x = column;
  //   doc.fillColor('black');
  //   doc.text(text, {
  //     paragraphGap: 5,
  //     indent: 5,
  //     align: 'justify',
  //     columns: 1,
  //   });
  //   return doc;
  // }

  // async row(doc, heigth) {
  //   doc.lineJoin('miter').rect(190, heigth, 250, 20).stroke();
  //   return doc;
  // }

  // async generateCustomerInformation(doc, id) {
  //   var data = await this.guiasDispLote(id);
  //   await this.generateHeader(doc, data);

  //   // TITULO DE TABLA
  //   this.titleTable(doc, 'NRO. GUIA');

  //   // DATOS DE TABLA
  //   var i = 0;
  //   var page = 0;
  //   for (var item = 0; item <= data.data.length - 1; ) {
  //     this.row(doc, 160 + i);
  //     this.textInRowFirst(doc, 'Guía Carga', 167 + i, 1);
  //     this.textInRowFirst(doc, data.data[item].nro_documento, 167 + i, 2);
  //     doc
  //       .lineCap('butt')
  //       .moveTo(300, 160 + i)
  //       .lineTo(300, 180 + i)
  //       .stroke();
  //     item = item + 1;
  //     i = i + 20;

  //     if (i >= 573) {
  //       doc.addPage();
  //       page = page + 1;
  //       doc.switchToPage(page);
  //       this.generateHeader(doc, data);
  //       this.row(doc, 140);
  //       this.titleTable(doc, 'NRO. GUIA');
  //       i = 0;
  //     }
  //   }
  // }

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

  async generatePdf(id) {
    let doc = new PDFDocument({ margin: 50 });
    await this.generateCustomerInformation(doc, id);
    doc.end();
    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }

  async generateHeader(doc, data) {
    var assign = "Asignada a: ";
    if(data['agentes.id']) {
      assign += `Agente: ${data['agentes.nb_agente']} - ${data['agentes.persona_responsable']}`;
    } else if (data['clientes.id']) {
      assign += `Cliente: ${data['clientes.razon_social']}`;
    } else if (data['agencias.id']) {
      assign += `Agencia: ${data['agencias.nb_agencia']}`;
    } else {
      assign = "";
    }

    pdf.generateHeader(
      doc,
      'Reporte de Guias Disponibles',
      `Guias Desde: ${data.control_inicio}       Guias Hasta: ${data.control_final}`,
      assign,
      moment().format("DD/MM/YYYY")
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
    doc.x =215;
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
    doc.x =375;
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

  async generateCustomerInformation(doc, id) {
    var data = await this.guiasDispLote(id);
    await this.generateHeader(doc, data);

    doc.fontSize(14)
    .text('Señores', 50, 150)
    .text('COMERCIALIZADORA CIERO, C.A', 50, 170)
    .text('VALENCIA.-', 50, 190)

    .text('Después de saludarle, sirva la presente para informarle que anexo le estamos enviando relación de cobros correspondiente a los servicios de transporte prestados', 50, 220)
    doc.fontSize(12)
    
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
    doc.x =215;
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
    doc.x =375;
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
      doc.fontSize(12)
      doc.y =  y + 30 + i;
      doc.x = 200;
      doc.fillColor('black');
      doc.text('1010/1023/1233/23423/2342/3454322/34534/3454322/34534/34534/34534/34534/34534')
      doc.lineJoin('miter').rect(50, y + 20 + i, 513, 40).stroke();
      
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
        y = 70
        ymax = 640
        page = page + 1;
        this.titleTable(doc, 'NRO. GUIA');
        doc.switchToPage(page);
        i = 0;
      }
    }
    doc.y =  y + 30 + i;
    doc.x = 100;
    doc.fillColor('black');
    doc.text('Total')
    doc.y =  y + 30 + i;
    doc.x = 200;
    doc.text('123123123')
    doc.lineJoin('miter').rect(50, y + 20 + i, 250, 25).stroke();     
    doc
    .lineCap('butt')
    .moveTo(170, y + 20 + i)
    .lineTo(170, y + 45 + i)
    .stroke();

    doc.x = 50;
    doc.y =  y + 70 + i;
    doc.text('Sin mas a que hacer referencia queda de Ustedes ,')
    doc.y =  y + 90 + i;
    doc.text('Atentamente ,')

    doc
    .lineCap('butt')
    .moveTo(400, y + 80 + i)
    .lineTo(550, y + 80 + i)
    .stroke();

    doc.x = 421;
    doc.y =  y + 90 + i;
    doc.text('Zohagrick  Elleboro')
    doc.x = 432;
    doc.y =  y + 110 + i;
    doc.text('FACTURACION')
  }
}

module.exports = CguiasService;
