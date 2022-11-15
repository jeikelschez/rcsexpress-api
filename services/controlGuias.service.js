const boom = require('@hapi/boom');

const PDFDocument = require('pdfkit');
const getStream = require('get-stream');
const base64 = require('base64-stream');

const { models, Sequelize }= require('./../libs/sequelize');
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
            control_inicio : {
              [Sequelize.Op.gte]: data.control_inicio
            },
            control_final : {
              [Sequelize.Op.lte]: data.control_final
            }                    
          },
          {
            tipo: data.tipo,
            control_inicio : {
              [Sequelize.Op.lte]: data.control_inicio
            },
            control_final : {
              [Sequelize.Op.gte]: data.control_final
            }                    
          },
        ]
      }  
    });

    if (cguias > 0) {
      throw boom.badRequest('El lote para este tipo de guía ya está registrado');
    }

    const newCguia = await models.Cguias.create(data);
    return newCguia;
  }  

  async find(page, limit, order_by, order_direction, filter, filter_value, agencia, agente, 
    cliente, desde, desde_fact, hasta, hasta_fact, disp, tipo) {
    let params2 = {};
    let filterArray = {};
    let order = [];    
    
    if(agencia) params2.cod_agencia = agencia;
    if(agente) params2.cod_agente = agente;
    if(cliente) params2.cod_cliente = cliente;
    
    if(desde) {
      params2.control_inicio = {
        [Sequelize.Op.gte]: desde
      }
    };
    if(hasta) {
      params2.control_final = {
        [Sequelize.Op.lte]: hasta
      }
    };

    if(desde_fact) {
      params2.control_inicio = {
        [Sequelize.Op.lte]: desde_fact
      }
    };
    if(hasta_fact) {
      params2.control_final = {
        [Sequelize.Op.gte]: hasta_fact
      }
    };
    
    if(disp) params2.cant_disponible = disp;
    if(tipo) params2.tipo = tipo;

    if(filter && filter_value) {
      let filters = [];
      filter.split(",").forEach(function(item) {
        let itemArray = {};
        itemArray[item] = { [Sequelize.Op.substring]: filter_value };
        filters.push(itemArray);
      })

      filterArray = { 
        [Sequelize.Op.or]: filters 
      };      
    }

    let params = { ...params2, ...filterArray };

    if(order_by && order_direction) {
      order.push([order_by, order_direction]);
    }

    let attributes = {};
    let include = ['tipos'];

    return await utils.paginate(models.Cguias, page, limit, params, order, attributes, include);
  }

  async findOne(id) {
    const cguia = await models.Cguias.findByPk(id, {
      include: ['tipos']
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

  async generatePdf(id) {
    let doc = new PDFDocument({ margin: 50 });
    pdf.generateHeader(doc);
    this.generateCustomerInformation(doc, id);
	  //generateInvoiceTable(doc, invoice);
	  pdf.generateFooter(doc);
    //doc.fontSize(25).text('Some text with an embedded font!', 100, 100);
    //doc.pipe(fs.createWriteStream(`file.pdf`));
    doc.end();

    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }

  async generateCustomerInformation(doc) {
    var data = [
      {
        name: 'GUIA CARGA',
        id: '21342342'
      },
      {
        name: 'GUIA CARGA',
        id: '2325'
      },
      {
        name: 'GUIA CARGA',
        id: '567567'
      },
      {
        name: 'GUIA CARGA',
        id: '13123'
      },
      {
        name: 'GUIA CARGA',
        id: '7897978'
      },
      {
        name: 'GUIA FACTURA',
        id: '234234'
      },
      {
        name: 'GUIA CARGA',
        id: '907686786'
      },
      {
        name: 'GUIA FACTURA',
        id: '12367967'
      },
      {
        name: 'GUIA CARGA',
        id: '123708078'
      },
      {
        name: 'GUIA CARGA',
        id: '5461238'
      },
      {
        name: 'GUIA FACTURA',
        id: '345098123'
      },
      {
        name: 'GUIA CARGA',
        id: '456456890'
      },
      {
        name: 'GUIA CARGA',
        id: '2342367867'
      },
    ]
    this.row(doc, 140);
    doc.y = 147;
    doc.x = 283;
    doc.fillColor('black')
    doc.text('NRO. GUIA', {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt')
    for (var i = 0; i <= 500;) {
      this.row(doc, (160 + i));
      this.textInRowFirst(doc, data[i/20].name, (167 + i), 1);
      this.textInRowFirst(doc, data[i/20].id, (167 + i), 2);
      doc.lineCap('butt')
      .moveTo(300, (160 + i))
      .lineTo(300, (180 + i))
      .stroke() 
      if ((i/20) == data.length - 1) {
        i = 500
      }
      i = i + 20
    }
  }

  async textInRowFirst(doc, text, heigth, column) {
    if (column == 1) {
      column = 195
    } else {
      column = 300
    }
    doc.y = heigth;
    doc.x = column;
    doc.fillColor('black')
    doc.text(text, {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    return doc
  }

  async row(doc, heigth) {
    doc.lineJoin('miter')
      .rect(190, heigth, 250, 20)
      .stroke()
    return doc
  }
}

module.exports = CguiasService;
