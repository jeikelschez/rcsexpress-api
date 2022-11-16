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

  async guiasDispLote(lote) {
    let arrayDisp = [];
    let arrayLote = await models.Cguias.findByPk(lote, {raw: true});
    let movimientos = await models.Mmovimientos.findAll({
      where: {
        t_de_documento: "GC",
        nro_documento: {
          [Sequelize.Op.gte]: arrayLote.control_inicio,
          [Sequelize.Op.lte]: arrayLote.control_final
        }
      },
      raw: true
    });
    for (var i = arrayLote.control_inicio; i <= arrayLote.control_final; i++) {
      if(movimientos.findIndex((item) => item.nro_documento == i) < 0) 
        arrayDisp.push(i);
    }      
    return arrayDisp;
  }

  async generatePdf(id) {
    let doc = new PDFDocument({ margin: 50 });
    this.generateHeader(doc)
    this.generateCustomerInformation(doc, id);
    doc.end();
    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }
  
  async generateHeader(doc) {
    pdf.generateHeader(
      doc,
      'Reporte de Guias Disponibles',
      'Guias Desde: 34234234234       Guias Hasta: 234234234234', 
      'Asignada a:  Agencia - VALENCIA, RCS EXPRESS, S.A',
      '14/11/2022');
  }

  async titleTable(doc, title) {
    this.row(doc, 140);
    doc.y = 147;
    doc.x = 283;
    doc.fillColor('black')
    doc.text(title, {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt')
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

  async generateCustomerInformation(doc) {
    var data = [
      {
        name: 'GUIA CARGA',
        id: '7587595689'
      },
      {
        name: 'GUIA CARGA',
        id: '456879'
      },
      {
        name: 'GUIA CARGA',
        id: '80789578'
      },
      {
        name: 'GUIA CARGA',
        id: '12312321'
      },
      {
        name: 'GUIA CARGA',
        id: '546456546'
      },
      {
        name: 'GUIA CARGA',
        id: '7689678678'
      },
      {
        name: 'GUIA CARGA',
        id: '12367543'
      },
      {
        name: 'GUIA CARGA',
        id: '900980'
      },
      {
        name: 'GUIA CARGA',
        id: '56798089'
      },
      {
        name: 'GUIA CARGA',
        id: '45628548'
      },
      {
        name: 'GUIA CARGA',
        id: '547895623'
      },
      {
        name: 'GUIA CARGA',
        id: '5683456'
      },
      {
        name: 'GUIA CARGA',
        id: '4579865345'
      },
      {
        name: 'GUIA CARGA',
        id: '4842554854'
      },
      {
        name: 'GUIA CARGA',
        id: '65823428'
      },
      {
        name: 'GUIA CARGA',
        id: '5682345'
      },
      {
        name: 'GUIA CARGA',
        id: '679635465345'
      },
      {
        name: 'GUIA CARGA',
        id: '45623425'
      },
      {
        name: 'GUIA CARGA',
        id: '5467674'
      },
      {
        name: 'GUIA CARGA',
        id: '678678678'
      },
      {
        name: 'GUIA CARGA',
        id: '678678678'
      },
      {
        name: 'GUIA CARGA',
        id: '678678678'
      },
      {
        name: 'GUIA CARGA',
        id: '678678678'
      },
      {
        name: 'GUIA CARGA',
        id: '678678678'
      },
      {
        name: 'GUIA CARGA',
        id: '678678678'
      },
      {
        name: 'GUIA CARGA',
        id: '678678678'
      },
      {
        name: 'GUIA CARGA',
        id: '678678678'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '678678678'
      },
      {
        name: 'GUIA CARGA',
        id: '678678678'
      },
      {
        name: 'GUIA CARGA',
        id: '678678678'
      },
      {
        name: 'GUIA CARGA',
        id: '678678678'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '678678678'
      },
      {
        name: 'GUIA CARGA',
        id: '678678678'
      },
      {
        name: 'GUIA CARGA',
        id: '678678678'
      },
      {
        name: 'GUIA CARGA',
        id: '678678678'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '678678678'
      },
      {
        name: 'GUIA CARGA',
        id: '678678678'
      },
      {
        name: 'GUIA CARGA',
        id: '678678678'
      },
      {
        name: 'GUIA CARGA',
        id: '678678678'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      }, 
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },{
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },{
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: '123123'
      },
      {
        name: 'GUIA CARGA',
        id: 'FINAL'
      },
    ]

    // TITULO DE TABLA

    this.titleTable(doc, 'NRO. GUIA')

    // DATOS DE TABLA 

    var i = 0
    var page = 0
    for (var item = 0; item <= (data.length - 1);) {
      this.row(doc, (160 + i));
      this.textInRowFirst(doc, data[item].name, (167 + i), 1);
      this.textInRowFirst(doc, data[item].id, (167 + i), 2);
      doc.lineCap('butt')
      .moveTo(300, (160 + i))
      .lineTo(300, (180 + i))
      .stroke() 
      item = item + 1
      i = i + 20

      if (i >= 573) {
        doc.addPage();
        page = page + 1
        doc.switchToPage(page);
        this.row(doc, 140);

        this.titleTable(doc, 'NRO. GUIA')

        this.generateHeader(doc)
        
        i = 0
      }
    }
  }
}

module.exports = CguiasService;
