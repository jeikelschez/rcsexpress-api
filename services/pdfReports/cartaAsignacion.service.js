const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('./../utils.service');
const utils = new UtilsService();

class CartaAsignacionService {
  async mainReport(doc, id, usuario) {
    var data = await this.getLote(id);
    await this.generateBody(doc, data, usuario);
  }

  async generateBody(doc, data, usuario) {
    moment.locale('es');
    const fecha = moment().format('LL');
    const fechaConMesMayus = fecha.replace(
      /de (\w+)/,
      (match, mes) => 'de ' + mes.charAt(0).toUpperCase() + mes.slice(1)
    );  

    doc
      .image('./img/logo_rc.png', 50, 45, { width: 50 })
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('RCS Express, S.A', 105, 93)
      .text('R.I.F. J-31028463-6', 105, 107)
      .fontSize(12)
      .font('Helvetica')
      .text('Valencia, ' + fechaConMesMayus, 50, 70, {
        width: doc.page.width - 105,
        align: 'right',
      });

    doc
      .fontSize(12)
      .font('Helvetica')
      .text('Señores', 50, 150)
      .font('Helvetica-Bold')
      .text(data['clientes.nb_cliente'], 50, 165)
      .font('Helvetica')
      .text('Atención', 50, 180);

    // Cuerpo de la carta con interlineado mayor y texto justificado
    const cartaOptions = { width: 500, align: 'justify', lineGap: 6 };
    doc.moveDown(2);
    doc.fontSize(12).font('Helvetica');
    doc.text(
      'Adjunto le estamos asignando un lote de GUIAS CARGAS según correlativo: Desde Nro. ' +
        data.control_inicio +
        ' Hasta Nro. ' +
        data.control_final +
        '. TOTAL DE GUÍAS ASIGNADAS: ' +
        data.cant_asignada +
        '.',
      50,
      210,
      cartaOptions
    );
    doc.moveDown(1);
    doc.text(
      'Es de manera OBLIGATORIA colocar los siguientes datos del cliente destino: Razón Social Completa ó Nombre del Cliente si es persona natural, Número de Teléfono, DIRECCIÓN FISCAL COMPLETA Y EXACTA y Número de RIF de la Empresa y/o Cédula de Identidad.',
      cartaOptions
    );
    doc.moveDown(1);
    doc.text(
      'OBSERVACIÓN: En los casos donde el despacho se debe cobrar en destino y la guía no contenga todos los datos fiscales exigidos para facturar, la misma será cobrada al cliente origen, SIN EXCEPCIÓN.',
      cartaOptions
    );
    doc.moveDown(1);
    doc.text(
      'Sin más a que hacer referencia y quedando a sus ordenes para obtener información adicional, se despide,',
      cartaOptions
    );
    doc.moveDown(2);
    doc.text('Atentamente,', cartaOptions);

    // Línea para la firma alineada a la derecha
    const firmaX = 350;
    const firmaY = doc.y + 30;
    doc
      .moveTo(firmaX, firmaY)
      .lineTo(firmaX + 200, firmaY)
      .stroke();

    // Nombre y departamento centrados debajo de la línea
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text(usuario, firmaX, firmaY + 10, {
      width: 200,
      align: 'center',
    });
    doc.font('Helvetica');
    doc.text('DPTO. DE OPERACIONES', firmaX, firmaY + 30, {
      width: 200,
      align: 'center',
    });

    // Footer: dos líneas horizontales y textos centrados
    const footerY = doc.page.height - 50;
    doc.lineWidth(1);
    doc
      .moveTo(40, footerY)
      .lineTo(doc.page.width - 40, footerY)
      .stroke();
    doc
      .moveTo(40, footerY + 3)
      .lineTo(doc.page.width - 40, footerY + 3)
      .stroke();
    doc.fontSize(9).font('Helvetica');
    doc.text(
      'Av. 74, CC Araurima, nivel PB, Local No. 6, Urb. Terrazas de Castillito, San Diego, Valencia, Edo. Carabobo',
      40,
      footerY + 8,
      { width: doc.page.width - 80, align: 'center' }
    );
    doc.text(
      'Teléfonos: (0241) 8716835, 8717563, (0414) 1503143. E-mail: rcsexpress@cantv.net. Página Web: www.rcsexpress.com',
      40,
      footerY + 18,
      { width: doc.page.width - 80, align: 'center' }
    );
  }

  async getLote(id) {
    let arrayLote = await models.Cguias.findByPk(id, {
      include: ['clientes'],
      raw: true,
    });
    return arrayLote;
  }
}

module.exports = CartaAsignacionService;
