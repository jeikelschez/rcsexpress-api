const boom = require('@hapi/boom');
const PDFDocument = require('pdfkit');
const getStream = require('get-stream');
const base64 = require('base64-stream');
const fs = require('fs');

const { models, Sequelize } = require('./../libs/sequelize');
const UtilsService = require('./utils.service');
const utils = new UtilsService();

const caseTipo = '(CASE t_de_documento WHEN "GC" THEN "GUIA CARGA"' +
                                     ' WHEN "GF" THEN "GUIA FACTURA"' +
                                     ' WHEN "FA" THEN "FACTURA"' +
                                     ' WHEN "NC" THEN "NOTA DE CREDITO"' +
                                     ' ELSE "" END)';
const caseEstatusOper = '(CASE estatus_operativo WHEN "PR" THEN "En proceso de Envío"' +
                                               ' WHEN "PE" THEN "Pendiente por Entrega"' +
                                               ' WHEN "CO" THEN "Entrega Conforme"' +
                                               ' WHEN "NC" THEN "Entrega NO Conforme"' +
                                               ' ELSE "" END)';
const caseEstatusAdmin = '(CASE estatus_administra WHEN "E" THEN "En Elaboración"' +
                                                 ' WHEN "F" THEN "Pendiente por Facturar"' +
                                                 ' WHEN "G" THEN "Con Factura Generada"' +
                                                 ' WHEN "A" THEN "Anulada"' +
                                                 ' WHEN "P" THEN "Pendiente por Cobrar"' +
                                                 ' WHEN "C" THEN "Cancelada"' +
                                                 ' WHEN "I" THEN "Pendiente por Imprimir"' +
                                                 ' ELSE "" END)';
const casePagadoEn = '(CASE pagado_en WHEN "O" THEN "Origen"' +
                                    ' WHEN "D" THEN "Destino"' +
                                    ' ELSE "" END)';
const caseModalidad = '(CASE modalidad_pago WHEN "CR" THEN "Crédito"' +
                                          ' WHEN "CO" THEN "Contado"' +
                                          ' WHEN "PP" THEN "Prepagada"' +
                                          ' ELSE "" END)';

class MmovimientosService {

  constructor() {}

  async exportPdf() {
    let pdfDoc = new PDFDocument;
    pdfDoc.pipe(fs.createWriteStream('SampleDocument2.pdf'));
    pdfDoc.text("My Sample PDF Document");
    pdfDoc.end();
  }

  async generatePdf() {
    let doc = new PDFDocument({ margin: 50 });

    this.generateHeader(doc);
	  //generateCustomerInformation(doc, invoice);
	  //generateInvoiceTable(doc, invoice);
	  this.generateFooter(doc);
    //doc.fontSize(25).text('Some text with an embedded font!', 100, 100);
    //doc.pipe(fs.createWriteStream(`file.pdf`));
    doc.end();

    var encoder = new base64.Base64Encode();
    var b64s = doc.pipe(encoder);
    return await getStream(b64s);
  }

  generateHeader(doc) {
    doc.image('./img/logo_rc.png', 50, 45, { width: 50 })
      .fillColor('#444444')
      .fontSize(12)
      .text('Reporte de Guias Disponibles', 110, 57)
      .text('Reporte de Guias Disponibles', 110, 77)
      .fontSize(10)
      .text('19/10/2022', 200, 65, { align: 'right' })
      .moveDown();
  }
  
  generateFooter(doc) {
    doc.fontSize(
      10,
    ).text(
      'Payment is due within 15 days. Thank you for your business.',
      50,
      780,
      { align: 'center', width: 500 },
    );
  }
  
  async create(data) {
    const newMmovimiento = await models.Mmovimientos.create(data);
    return newMmovimiento;
  }

  async find(page, limit, order_by, order_direction, filter, filter_value, agencia, agencia_dest, 
    nro_documento, tipo, desde, hasta, cliente_orig, cliente_dest, estatus_oper, transito) {    

    let params2 = {};
    let filterArray = {};
    let order = []; 
    
    if(agencia) params2.cod_agencia = agencia;
    if(agencia_dest) params2.cod_agencia_dest = agencia_dest;
    if(nro_documento) params2.nro_documento = nro_documento;
    if(tipo) params2.t_de_documento = tipo;
    
    if(desde) {
      params2.fecha_emision = {
        [Sequelize.Op.gte]: desde
      }
    };
    if(hasta) {
      params2.fecha_emision = {
        [Sequelize.Op.lte]: hasta
      }
    };

    if(cliente_orig) params2.cod_cliente_org = cliente_orig;
    if(cliente_dest) params2.cod_cliente_dest = cliente_dest;
    if(estatus_oper) params2.estatus_operativo = estatus_oper;
    if(transito) params2.check_transito = transito;

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

    let attributes = {
      include: [
        [Sequelize.literal(caseTipo), 'tipo_desc'],
        [Sequelize.literal(caseEstatusOper), 'estatus_oper_desc'],
        [Sequelize.literal(caseEstatusAdmin), 'estatus_admin_desc'],        
        [Sequelize.literal(casePagadoEn), 'pagado_en_desc'],
        [Sequelize.literal(caseModalidad), 'modalidad_desc']
      ]
    };

    if(order_by && order_direction) {
      order.push([order_by, order_direction]);
    }

    return await utils.paginate(models.Mmovimientos, page, limit, params, order, attributes);
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
}

module.exports = MmovimientosService;
