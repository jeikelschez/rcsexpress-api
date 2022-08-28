const boom = require('@hapi/boom');
const PDFDocument = require('pdfkit');
const getStream = require('get-stream');
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
    const doc = new PDFDocument();
    doc.fontSize(25).text('Some text with an embedded font!', 100, 100);
    doc.pipe(fs.createWriteStream(`file.pdf`));
    doc.end();
    const pdfStream = await getStream.buffer(doc);
    return pdfStream;
  }

  async create(data) {
    const newMmovimiento = await models.Mmovimientos.create(data);
    return newMmovimiento;
  }

  async find(page, limit, order_by, order_direction, agencia, agencia_dest, nro_documento, 
    tipo, desde, hasta, cliente_orig, cliente_dest, estatus_oper, transito) {    
    let params = {};
    let order = [];
    
    if(agencia) params.cod_agencia = agencia;
    if(agencia_dest) params.cod_agencia_dest = agencia_dest;
    if(nro_documento) params.nro_documento = nro_documento;
    if(tipo) params.t_de_documento = tipo;
    
    if(desde) {
      params.fecha_emision = {
        [Sequelize.Op.gte]: desde
      }
    };
    if(hasta) {
      params.fecha_emision = {
        [Sequelize.Op.lte]: hasta
      }
    };

    if(cliente_orig) params.cod_cliente_org = cliente_orig;
    if(cliente_dest) params.cod_cliente_dest = cliente_dest;
    if(estatus_oper) params.estatus_operativo = estatus_oper;
    if(transito) params.check_transito = transito;

    let attributes = {
      include: [
        [Sequelize.literal(caseTipo), 'tipo_desc'],
        [Sequelize.literal(caseEstatusOper), 'estatus_oper_desc'],
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
