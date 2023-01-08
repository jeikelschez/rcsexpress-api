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
    nro_ctrl_doc_ppal_new,
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
    if (nro_ctrl_doc_ppal_new) params2.nro_ctrl_doc_ppal_new = nro_ctrl_doc_ppal_new;
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

  async getGuiasAsoc(dataFact) {
    let guiasAsoc = "";
    let movimientos = await models.Mmovimientos.findAll({
      where: {
        nro_doc_principal: dataFact.nro_documento,
        nro_ctrl_doc_ppal_new: dataFact.nro_control_new,
        tipo_doc_principal: dataFact.t_de_documento,
        cod_ag_doc_ppal: dataFact.cod_agencia,
      },
      raw: true,
    });
    for (var i = 0; i < movimientos.length; i++) {
      guiasAsoc += movimientos[i].dimensiones.replace(/^\s+/,"") + " / ";
    }
    return guiasAsoc;
  }

  // REPORTE EMITIR CARTA CLIENTE

  // async letterPDF(data, cliente, contacto, cargo, ciudad) {
  //   let doc = new PDFDocument({ margin: 50, bufferPages: true});
  //   await this.generateHeader(doc, cliente, contacto, cargo, ciudad);
  //   await this.generateCustomerInformation(doc, data, cliente, contacto, cargo, ciudad);
  //   doc.end();
  //   var encoder = new base64.Base64Encode();
  //   var b64s = doc.pipe(encoder);
  //   return await getStream(b64s);
  // }

  // async generateHeader(doc) {
  //   moment.locale('es');
  //   doc
  //     .image('./img/logo_rc.png', 50, 45, { width: 50 })
  //     .fillColor('#444444')
  //     .fontSize(13)
  //     .font('Helvetica-Bold')
  //     .text('RCS Express, S.A', 110, 89)
  //     .text('R.I.F. J-31028463-6', 110, 107)
  //     .fontSize(12)
  //     .text('Valencia, ' + moment().format('LL'), 200, 50, { align: 'right' })
  //     .moveDown();
  // }

  // async generateCustomerInformation(doc, data, cliente, contacto, cargo, ciudad) {
  //   doc
  //     .fontSize(12)
  //     .text('Señores', 50, 150)
  //     .text(cliente, 50, 165)
  //     .text(contacto ? 'Atención' : ciudad, 50, 180)
  //     .text(contacto ? 'Sr(a). ' + contacto : '', 50, 195)
  //     .text(contacto ? cargo : '', 50, 210);

  //   doc
  //     .fontSize(14)
  //     .text(
  //       'Después de saludarle, sirva la presente para informarle que anexo le estamos enviando relación de cobros correspondiente a los servicios de transporte prestados',
  //       50,
  //       240,
  //       {
  //         align: 'justify',
  //       }
  //     );
  //   doc.fontSize(10);
  //   doc.lineJoin('miter').rect(50, 299, 65, 20).stroke();
  //   doc.y = 306;
  //   doc.x = 52;
  //   doc.fillColor('black');
  //   doc.text('NRO. CTRL', {
  //     paragraphGap: 5,
  //     indent: 5,
  //     align: 'justify',
  //     columns: 1,
  //   });
  //   doc.lineCap('butt');

  //   doc.lineJoin('miter').rect(115, 299, 65, 20).stroke();
  //   doc.y = 306;
  //   doc.x = 117;
  //   doc.fillColor('black');
  //   doc.text('NRO. DOC', {
  //     paragraphGap: 5,
  //     indent: 5,
  //     align: 'justify',
  //     columns: 1,
  //   });
  //   doc.lineCap('butt');

  //   doc.lineJoin('miter').rect(180, 299, 60, 20).stroke();
  //   doc.y = 306;
  //   doc.x = 186;
  //   doc.fillColor('black');
  //   doc.text('FECHA', {
  //     paragraphGap: 5,
  //     indent: 5,
  //     align: 'justify',
  //     columns: 1,
  //   });
  //   doc.lineCap('butt');

  //   doc.lineJoin('miter').rect(240, 299, 323, 20).stroke();
  //   doc.y = 306;
  //   doc.x = 355;
  //   doc.fillColor('black');
  //   doc.text('DESCRIPCION', {
  //     paragraphGap: 5,
  //     indent: 5,
  //     align: 'justify',
  //     columns: 1,
  //   });
  //   doc.lineCap('butt');

  //   // DATOS DE TABLA
  //   var i = 0;
  //   var page = 0;
  //   var y = 320;
  //   var ymax = 280;

  //   data = data.split(',');
  //   for (var item = 0; item <= data.length - 1; item++) {
  //     doc.fontSize(10);
  //     let factId = data[item].split('/');
  //     let dataMovimiento = await models.Mmovimientos.findByPk(factId[0], {
  //       attributes: {
  //         include: [
  //           [Sequelize.literal(nroControlDesc), 'nro_control_desc'],
  //           [Sequelize.literal(nroDocumentoDesc), 'nro_documento_desc'],
  //         ],
  //       },
  //       raw: true,
  //     });
  //     let guiasAsoc = await this.getGuiasAsoc(dataMovimiento);
  //     doc.lineJoin('miter').rect(50, y + i, 513, 30).stroke()
  //     this.textInRowFirst(doc, dataMovimiento.nro_control_desc, y + 11 + i, 1);
  //     this.textInRowFirst(doc, dataMovimiento.nro_documento_desc, y + 11 + i, 2);
  //     this.line(doc, 180, y + i, y + 30 + i)
  //     this.line(doc, 240, y + i, y + 30 + i)
  //     this.line(doc, 115, y + i, y + 30 + i)
  //     this.textInRowFirst(doc, moment(dataMovimiento.fecha_emision).format("DD/MM/YYYY"), y + 11 + i, 3);
  //     doc.y = y + 7 + i;
  //     doc.x = 255;      
  //     doc.text(dataMovimiento.observacion_entrega + " " + factId[1]);
  //     if (y + 60 + i + (guiasAsoc.length/75) * 10 >= 700) {
  //       doc.addPage();
  //       y = 150;
  //       ymax = 400;
  //       page = page + 1;
  //       doc.switchToPage(page);
  //       this.titleTable(doc, 165);
  //       await this.generateHeader(doc, cliente, contacto, cargo, ciudad);
  //       i = 0;
  //     }
  //     doc.fontSize(10);
  //     this.textInRowFirst(doc, 'Facturas', y + 36 + i, 1);
  //     this.textInRowFirst(doc, 'Asociadas', y + 47 + i, 1);
  //     doc.y = y + 36 + i;
  //     doc.x = 132;
  //     doc.fillColor('black');
  //     doc.text(guiasAsoc);
  //     doc.lineJoin('miter').rect(50, y + 30 + i, 513, 30 + (guiasAsoc.length/75) * 10).stroke()
  //     this.line(doc, 115, y + 30 + i, y + 60 + i + (guiasAsoc.length/75) * 10)
  //     y = y + (guiasAsoc.length/75) * 10
  //     i = i + 60;

  //     if (i >= ymax && !(item == data.length - 1)) {
  //       doc.addPage();
  //       y = 180;
  //       ymax = 400;
  //       page = page + 1;
  //       doc.switchToPage(page);
  //       this.titleTable(doc, 165);
  //       await this.generateHeader(doc, cliente, contacto, cargo, ciudad);
  //       i = 0;
  //     }
  //   }

  //   if (i >= 600) {
  //     doc.addPage();
  //     y = 160;
  //     ymax = 280;
  //     page = page + 1;
  //     doc.switchToPage(page);
  //     await this.generateHeader(doc, cliente, contacto, cargo, ciudad);
  //     i = 0;
  //   }
    
  //   doc.y = y + 30 + i;
  //   doc.x = 100;
  //   doc.fillColor('black');
  //   doc.text('Total');
  //   doc.y = y + 30 + i;
  //   doc.x = 200;
  //   doc.text('123123123');
  //   doc
  //     .lineJoin('miter')
  //     .rect(50, y + 20 + i, 250, 25)
  //     .stroke();
  //   doc
  //     .lineCap('butt')
  //     .moveTo(170, y + 20 + i)
  //     .lineTo(170, y + 45 + i)
  //     .stroke();

  //   doc.x = 50;
  //   doc.y = y + 70 + i;
  //   doc.text('Sin mas a que hacer referencia queda de Ustedes ,');
  //   doc.y = y + 90 + i;
  //   doc.text('Atentamente ,');

  //   doc
  //     .lineCap('butt')
  //     .moveTo(400, y + 80 + i)
  //     .lineTo(550, y + 80 + i)
  //     .stroke();

  //   doc.x = 421;
  //   doc.y = y + 90 + i;
  //   doc.text('Zohagrick  Elleboro');
  //   doc.x = 432;
  //   doc.y = y + 110 + i;
  //   doc.text('FACTURACION');
  //   var end;
  //   const range = doc.bufferedPageRange();
  //   for (i = range.start, end = range.start + range.count, range.start <= end; i < end; i++) {
  //     doc.switchToPage(i);
  //     doc.x = 275;
  //     doc.y = 724;
  //     doc.text(`Pagina ${i + 1} de ${range.count}`);
  //   }
  // }

  // async titleTable(doc, headerY) {
  //   doc.fontSize(10);
  //   doc.lineJoin('miter').rect(50, headerY - 6, 65, 20).stroke();
  //   doc.y = headerY;
  //   doc.x = 52;
  //   doc.fillColor('black');
  //   doc.text('NRO. CTRL', {
  //     paragraphGap: 5,
  //     indent: 5,
  //     align: 'justify',
  //     columns: 1,
  //   });
  //   doc.lineCap('butt');

  //   doc.lineJoin('miter').rect(115, headerY - 6, 65, 20).stroke();
  //   doc.y = headerY;
  //   doc.x = 117;
  //   doc.fillColor('black');
  //   doc.text('NRO. DOC', {
  //     paragraphGap: 5,
  //     indent: 5,
  //     align: 'justify',
  //     columns: 1,
  //   });
  //   doc.lineCap('butt');

  //   doc.lineJoin('miter').rect(180, headerY - 6, 60, 20).stroke();
  //   doc.y = headerY;
  //   doc.x = 186;
  //   doc.fillColor('black');
  //   doc.text('FECHA', {
  //     paragraphGap: 5,
  //     indent: 5,
  //     align: 'justify',
  //     columns: 1,
  //   });
  //   doc.lineCap('butt');

  //   doc.lineJoin('miter').rect(240, headerY - 6, 323, 20).stroke();
  //   doc.y = headerY;
  //   doc.x = 355;
  //   doc.fillColor('black');
  //   doc.text('DESCRIPCION', {
  //     paragraphGap: 5,
  //     indent: 5,
  //     align: 'justify',
  //     columns: 1,
  //   });
  //   doc.lineCap('butt');
  // }

  // REPORTE FACTURACION

  // async letterPDF(data, cliente, contacto, cargo, ciudad) {
  //   let doc = new PDFDocument({size: [500, 841], layout: 'landscape', margin: 20});
  //   await this.generateData(doc, cliente, contacto, cargo, ciudad);
  //   doc.end();
  //   var encoder = new base64.Base64Encode();
  //   var b64s = doc.pipe(encoder);
  //   return await getStream(b64s);
  // }

  // async generateData(doc) {
  //   moment.locale('es');
  //   var data = [
  //     {
  //       concepto: 'TRANSPORTE DE MERCANCIAS (E)',
  //       cantidad: '1',
  //       precio_unitario: '330,20',
  //       iva: '0,00',
  //       precio_total: '330,20',
  //     },
  //     {
  //       concepto: 'TRANSPORTE DE PRODUCTOS (G)',
  //       cantidad: '1',
  //       precio_unitario: '630,20',
  //       iva: '0,00',
  //       precio_total: '630,20',
  //     },
  //     {
  //       concepto: 'TRANSPORTE DE DATOS (F)',
  //       cantidad: '2',
  //       precio_unitario: '730,20',
  //       iva: '0,00',
  //       precio_total: '1460,40',
  //     },
  //   ]
  //   doc
  //     .fontSize(11)
  //     .font('Helvetica-Bold')
  //     .text('CLIENTE: COMERCIALIZADORA CIERO,C.A.', 40, 40)
  //     .text('RIF/CO: J-324234234', 40, 63)
  //     .text('TELEFONOS: 0412312323/12312313', 40, 87)
  //     doc.y = 110;
  //     doc.x = 40;
  //     doc.fillColor('black');
  //     doc.text(('DIRECCIÓN FISCAL: CALLE 99 CC INDUSTRIAL UNICENTRO DEL NORTE NIVEL PB LOCAL GALPON 10 ZONA PARTE INDUSTRIAL CASTILLITO VALENCIA EDO. CARABOBO '), {
  //     width: 400,
  //     align: 'justify',
  //     });
  //     doc.text('DOCUMENTO', 470, 40)
  //     doc.text('FACTURA', 470, 58)
  //     doc.text('NUMERO', 650, 40)
  //     doc.text('12208', 650, 58)
  //     doc.text('CONDICIONES DE PAGO', 470, 90)
  //     doc.text('CREDITO', 470, 110)
  //     doc.text('FECHA DE EMISION', 650, 90)
  //     doc.text('01/12/2021', 650, 110)
  //     doc.text('DESCRIPCIÓN', 40, 170)
  //     doc.text('CANTIDAD', 360, 170)
  //     doc.text('PRECIO UNITARIO', 440, 170)
  //     doc.text('%IVA', 550, 170)
  //     doc.text('PRECIO TOTAL', 680, 170)
  //     doc.lineCap('butt')
  //     .moveTo(40, 188)
  //     .lineTo(770, 188)
  //     .stroke();
  //     doc.text('DESCRIPCIÓN', 40, 255)
  //     doc.fontSize(10)
  //     doc.text('FORMA DE PAGO:', 40, 310)
  //     doc.lineJoin('square')
  //     .rect(40, 325, 390, 45)
  //     .stroke();
  //     doc.text('EFECTIVO', 50, 335)
  //     doc.lineJoin('square')
  //     .rect(110, 334, 10, 10)
  //     .stroke();
  //     doc.text('CHEQUE', 130, 335)
  //     doc.text('NRO.', 50, 355)
  //     doc.lineCap('butt')
  //     .moveTo(83, 362)
  //     .lineTo(180, 362)
  //     .stroke();
  //     doc.text('SON: TRESCIENTOS TREINTA CON VEINTE CENTIMOS', 40, 380)
  //     .fontSize(10)
  //     doc.text('F 1-5950', 40, 395)
  //     doc.text('SUBTOTAL:  330,20', 680, 300)
  //     doc.text('BASE IMPONIBLE:  0,00', 680, 330)
  //     doc.text('MONTO EXENTO:  330,20', 680, 345)
  //     doc.text('IVA: 0%:  0,00', 680, 360)
  //     doc.text('TARIFA POSTAL (E):  0,00', 680, 375)
  //     doc.text('TOTAL:  330,20', 680, 390)
  //     doc.y = 400;
  //     doc.x = 200;
  //     doc.text(('PROVIDENCIA ADMINISTRATIVA N* SENIAT 2023012312312 que designan los Sujetos Publicos como Angete de percepcion Scen 2022 del ICTF'), {
  //       width: 400,
  //       align: 'justify',
  //     });
  //     doc.lineJoin('square')
  //     .rect(200, 430, 400, 45)
  //     .stroke();
  //     doc.lineCap('butt')
  //     .moveTo(200, 453)
  //     .lineTo(600, 453)
  //     .stroke();
  //     doc.lineCap('butt')
  //     .moveTo(300, 430)
  //     .lineTo(300, 475)
  //     .stroke();
  //     doc.lineCap('butt')
  //     .moveTo(370, 430)
  //     .lineTo(370, 475)
  //     .stroke();
  //     doc.lineCap('butt')
  //     .moveTo(450, 430)
  //     .lineTo(450, 475)
  //     .stroke();
  //     doc.lineCap('butt')
  //     .moveTo(530, 430)
  //     .lineTo(530, 475)
  //     .stroke();
  //     doc.text('PAGO EN DIVISA', 208, 438)
  //     doc.text('ALICUOTA', 309, 438)
  //     doc.text('IGTF DIVISA', 380, 438)
  //     doc.text('TAZA BCV', 465, 438)
  //     doc.text('IGTF BS', 545, 438)
  //     var i = 0;
  //     for (var item = 0; item <= data.length - 1; item++) {
  //       doc.text(data[item].concepto, 40, 195 + i)
  //       doc.text(data[item].cantidad, 360, 195 + i)
  //       doc.text(data[item].precio_unitario, 440, 195 + i)
  //       doc.text(data[item].iva, 550, 195 + i)
  //       doc.text(data[item].precio_total, 680, 195 + i)
  //       i = i + 20;
  //       if (item === 2) item = data.length + 2
  //     }
  // var end;
  // const range = doc.bufferedPageRange();
  // for (i = range.start, end = range.start + range.count, range.start <= end; i < end; i++) {
  //   doc.switchToPage(i);
  //   doc.x = 275;
  //   doc.y = 724;
  //   doc.text(`Pagina ${i + 1} de ${range.count}`);
  // }
  // }

  // REPORTE ANEXO FACTURACION

  // async letterPDF(data, cliente, contacto, cargo, ciudad) {
  //   let doc = new PDFDocument({ margin: 50 });
  //   await this.generateHeader(doc, cliente, contacto, cargo, ciudad);
  //   await this.generateCustomerInformation(doc);
  //   doc.end();
  //   var encoder = new base64.Base64Encode();
  //   var b64s = doc.pipe(encoder);
  //   return await getStream(b64s);
  // }

  // async generateHeader(doc) {
  //   moment.locale('es');
  //   doc
  //     .image('./img/logo_rc.png', 50, 45, { width: 50 })
  //     .fillColor('#444444')
  //     .fontSize(13)
  //     .font('Helvetica-Bold')
  //     .text('RCS Express, S.A', 110, 50)
  //     .text('R.I.F. J-31028463-6', 110, 70)
  //     .fontSize(12)
  //     .text('Valencia, ' + moment().format('LL'), 200, 50, { align: 'right' })
  //     .text('Pagina 1 de 1', 200, 70, { align: 'right' })
  //     .fontSize(16)
  //     .text('Informe de Ventas Realizadas', 200, 110)
  //     .fontSize(11)
  //     doc.y = 130;
  //     doc.x = 213;
  //     doc.text('COMERCIALIZADORA CIERO, C.A.', {
  //       align: 'center',
  //       columns: 1,
  //       width: 200,
  //     });
  //     doc.text('Desde: 19/10/2022', 200, 160)
  //     doc.text('Hasta: 19/11/2022', 320, 160)
  //     doc.text('Nro. Factura: 1231231', 50, 140)
  //     doc.text('Nro. Control: 00-0123124', 50, 160)
  //     doc.moveDown();
  //     doc.fontSize(9);
  //     doc.y = 186;
  //     doc.x = 40;
  //     doc.fillColor('black');
  //     doc.text('Mes/Año', {
  //       paragraphGap: 5,
  //       indent: 5,
  //       align: 'justify',
  //       columns: 1,
  //     });
  //     doc.y = 186;
  //     doc.x = 82;
  //     doc.fillColor('black');
  //     doc.text('Fecha Envio', {
  //       paragraphGap: 5,
  //       indent: 5,
  //       align: 'justify',
  //       columns: 1,
  //     });
  //     doc.y = 186;
  //     doc.x = 148;
  //     doc.fillColor('black');
  //     doc.text('Nro. Guía', {
  //       paragraphGap: 5,
  //       indent: 5,
  //       align: 'justify',
  //       columns: 1,
  //     });
  //     doc.y = 186;
  //     doc.x = 223;
  //     doc.fillColor('black');
  //     doc.text('Facturas Cliente', {
  //       paragraphGap: 5,
  //       indent: 5,
  //       align: 'justify',
  //       columns: 1,
  //     }); 
  //     doc.y = 186;
  //     doc.x = 318;
  //     doc.fillColor('black');
  //     doc.text('Origen', {
  //       paragraphGap: 5,
  //       indent: 5,
  //       align: 'justify',
  //       columns: 1,
  //     }); 
  //     doc.y = 186;
  //     doc.x = 353;
  //     doc.fillColor('black');
  //     doc.text('Destino', {
  //       paragraphGap: 5,
  //       indent: 5,
  //       align: 'justify',
  //       columns: 1,
  //     }); 
  //     doc.y = 186;
  //     doc.x = 394;
  //     doc.fillColor('black');
  //     doc.text('Monto Base', {
  //       paragraphGap: 5,
  //       indent: 5,
  //       align: 'justify',
  //       columns: 1,
  //     });  
  //     doc.y = 186;
  //     doc.x = 456;
  //     doc.fillColor('black');
  //     doc.text('Impuesto', {
  //       paragraphGap: 5,
  //       indent: 5,
  //       align: 'justify',
  //       columns: 1,
  //     }); 
  //     doc.y = 186;
  //     doc.x = 510;
  //     doc.fillColor('black');
  //     doc.text('Monto Total')
  //     doc.lineCap('butt')
  //     .moveTo(40, 200)
  //     .lineTo(565, 200)
  //     .stroke();
  // }

  // async generateCustomerInformation(doc) {
  //   var data = [
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215/23142342/234234',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '121212121212',
  //           impuesto: '556',
  //           monto_total: '121212121212',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '121212121212',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },
  //         {
  //           mes_año: '10-2022',
  //           fecha_envio: '19/10/2022',
  //           nro_guia: 'GC 550345455',
  //           facturas_cliente: '17643/123215',
  //           origen: 'VZL',
  //           destino: 'MCV',
  //           monto_base: '5.997,90',
  //           impuesto: '556',
  //           monto_total: '6.402,39',
  //         },

  //   ]
  //   var i = 0;
  //   var page = 0;
  //   var ymin = 210;
  //   for (var item = 0; item <= data.length - 1; item++) {
  //     doc.y = ymin + i;
  //     doc.x = 43;
  //     doc.text(data[item].mes_año, {
  //       align: 'center',
  //       columns: 1,
  //       width: 35,
  //     });
  //     doc.y = ymin + i;
  //     doc.x = 90;
  //     doc.text(data[item].fecha_envio, {
  //       align: 'center',
  //       columns: 1,
  //       width: 47,
  //     });
  //     doc.y = ymin + i;
  //     doc.x = 141;
  //     doc.text(data[item].nro_guia, {
  //       align: 'center',
  //       columns: 1,
  //       width: 67,
  //     });
  //     doc.y = ymin + i - 3;
  //     doc.x = 210;
  //     doc.text(data[item].facturas_cliente, {
  //       align: 'center',
  //       columns: 1,
  //       width: 105,
  //     });
  //     doc.y = ymin + i;
  //     doc.x = 326;
  //     doc.text(data[item].origen, {
  //       align: 'center',
  //       columns: 1,
  //       width: 20,
  //     });
  //     doc.y = ymin + i;
  //     doc.x = 361;
  //     doc.text(data[item].destino, {
  //       align: 'center',
  //       columns: 1,
  //       width: 20,
  //     });
  //     doc.y = ymin + i;
  //     doc.x = 392;
  //     doc.text(data[item].monto_base, {
  //       align: 'center',
  //       columns: 1,
  //       width: 65,
  //     });
  //     doc.y = ymin + i;
  //     doc.x = 455;
  //     doc.text(data[item].impuesto, {
  //       align: 'center',
  //       columns: 1,
  //       width: 44,
  //     });
  //     doc.y = ymin + i;
  //     doc.x = 505;
  //     doc.text(data[item].monto_total, {
  //       align: 'center',
  //       columns: 1,
  //       width: 65,
  //     });
  //     i = i + 25;
  //     if (i >= 500) {
  //       doc.addPage();
  //       page = page + 1;
  //       doc.switchToPage(page);
  //       i = 0;
  //       await this.generateHeader(doc);
  //     }
  //   }
  //   if (i >= 500) {
  //     doc.addPage();
  //     page = page + 1;
  //     doc.switchToPage(page);
  //     await this.generateHeader(doc);
  //     i = 0;
  //     ymin = 50
  //   }
  //   doc.fontSize(12)
  //   doc.font('Helvetica-Bold')
  //   doc.text('Totales:', 220, ymin + i)
  //   doc.fontSize(10)
  //   doc.y = ymin + i;
  //   doc.x = 405;
  //   doc.text('123123', {
  //     align: 'left',
  //     columns: 1,
  //     width: 50,
  //   });
  //   doc.y = ymin + i;
  //   doc.x = 465;
  //   doc.text('23423', {
  //     align: 'left',
  //     columns: 1,
  //     width: 50,
  //   });
  //   doc.y = ymin + i;
  //   doc.x = 525;
  //   doc.text('12312', {
  //     align: 'left',
  //     columns: 1,
  //     width: 50,
  //   });
  //   doc.fontSize(12)
  //   doc.text('Descuento de Fletes:', 220, ymin + i + 20)
  //   doc.fontSize(10)
  //   doc.y = ymin + i + 20,
  //   doc.x = 360;
  //   doc.text('232323', {
  //     align: 'left',
  //     columns: 1,
  //     width: 50,
  //   });
  //   doc.y = ymin + i + 20;
  //   doc.x = 405;
  //   doc.text('1231231', {
  //     align: 'left',
  //     columns: 1,
  //     width: 50,
  //   });
  //   doc.y = ymin + i + 20;
  //   doc.x = 465;
  //   doc.text('1231231', {
  //     align: 'left',
  //     columns: 1,
  //     width: 50,
  //   });
  //   doc.y = ymin + i + 20;
  //   doc.x = 525;
  //   doc.text('123123', {
  //     align: 'left',
  //     columns: 1,
  //     width: 50,
  //   });
  //   doc.y = ymin + i + 40;
  //   doc.x = 405;
  //   doc.text('123123', {
  //     align: 'left',
  //     columns: 1,
  //     width: 50,
  //   });
  //   doc.y = ymin + i + 40;
  //   doc.x = 465;
  //   doc.text('23423', {
  //     align: 'left',
  //     columns: 1,
  //     width: 50,
  //   });
  //   doc.y = ymin + i + 40;
  //   doc.x = 525;
  //   doc.text('12312312', {
  //     align: 'left',
  //     columns: 1,
  //     width: 50,
  //   });
  // var end;
  // const range = doc.bufferedPageRange();
  // for (i = range.start, end = range.start + range.count, range.start <= end; i < end; i++) {
  //   doc.switchToPage(i);
  //   doc.x = 275;
  //   doc.y = 724;
  //   doc.text(`Pagina ${i + 1} de ${range.count}`);
  // }
  // }

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
  async line(doc, x, y1, y2) {
    doc.lineCap('butt')
    .moveTo(x, y1)
    .lineTo(x, y2)
    .stroke();
    return doc; 
  }
}

module.exports = MmovimientosService;