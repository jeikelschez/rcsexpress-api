const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('./../utils.service');
const utils = new UtilsService();

class AsignacionGuiasService {
  async mainReport(doc, id) {
    var data = await this.guiasDispLote(id);
    await this.generateHeader(doc, data);
    await this.generateCustomerInformation(doc, data);
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

    doc
      .image('./img/logo_rc.png', 50, 45, { width: 50 })
      .fillColor('#444444')
      .fontSize(18)
      .text('Reporte de Guias Disponibles', 110, 50)
      .fontSize(12)
      .text(moment().format('DD/MM/YYYY'), 200, 50, { align: 'right' })
      .text(
        `Guias Desde: ${data.control_inicio}       Guias Hasta: ${data.control_final}`,
        110,
        80
      )
      .text(assign, 110, 100)
      .moveDown();
  }

  async titleTable(doc, title) {
    this.row(doc, 140);
    doc.y = 147;
    doc.x = 283;
    doc.fillColor('black');
    doc.text(title, {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    doc.lineCap('butt');
  }

  async textInRowFirst(doc, text, heigth, column) {
    if (column == 1) {
      column = 195;
    } else {
      column = 300;
    }
    doc.y = heigth;
    doc.x = column;
    doc.fillColor('black');
    doc.text(text, {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    return doc;
  }

  async row(doc, heigth) {
    doc.lineJoin('miter').rect(190, heigth, 250, 20).stroke();
    return doc;
  }

  async generateCustomerInformation(doc, data) {
    // TITULO DE TABLA
    this.titleTable(doc, 'NRO. GUIA');

    // DATOS DE TABLA
    var i = 0;
    var page = 0;
    for (var item = 0; item <= data.data.length - 1; ) {
      this.row(doc, 160 + i);
      this.textInRowFirst(doc, 'Guía Carga', 167 + i, 1);
      this.textInRowFirst(doc, data.data[item].nro_documento, 167 + i, 2);
      doc
        .lineCap('butt')
        .moveTo(300, 160 + i)
        .lineTo(300, 180 + i)
        .stroke();
      item = item + 1;
      i = i + 20;

      if (i >= 530) {
        doc.addPage();
        page = page + 1;
        doc.switchToPage(page);
        this.generateHeader(doc, data);
        this.row(doc, 140);
        this.titleTable(doc, 'NRO. GUIA');
        i = 0;
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
      doc.x = 275;
      doc.y = 724;
      doc.text(`Pagina ${i + 1} de ${range.count}`);
    }
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
}

module.exports = AsignacionGuiasService;
