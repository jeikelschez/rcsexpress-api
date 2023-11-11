const { models } = require('./../../libs/sequelize');

const UtilsService = require('./../utils.service');
const utils = new UtilsService();

class NotaPreimpresoService {
  async mainReport(doc, data) {
    await this.generateData(doc, JSON.parse(data));
  }

  async generateData(doc, data) {
    let cliente_orig;

    if (data.id_clte_part_orig) {
      cliente_orig = await models.Cparticulares.findByPk(
        data.id_clte_part_orig,
        {
          raw: true,
        }
      );
    } else {
      cliente_orig = await models.Clientes.findByPk(data.cliente_orig, {
        raw: true,
      });
    }

    doc
      .fontSize(9)
      .text('CLIENTE:    ' + cliente_orig.nb_cliente, 30, 40)
      .text(
        'RIF/CI:    ' +
          (cliente_orig.rif_cedula
            ? cliente_orig.rif_cedula
            : cliente_orig.rif_ci),
            43,
        65
      )
      .text(
        'TELEFONOS: ' +
          (cliente_orig.tlf_cliente
            ? cliente_orig.tlf_cliente
            : cliente_orig.telefonos
            ? cliente_orig.telefonos
            : ''),
            150,
        65
      );
    doc.text('DIRECCIÓN', 22, 85);
    doc.text('FISCAL:', 38, 95);
    doc.y = 85;
    doc.x = 83;
    doc.fillColor('black');
    doc.text(
      cliente_orig.dir_fiscal
        ? cliente_orig.dir_fiscal
        : cliente_orig.direccion,
      {
        width: 270,
        align: 'left',
      }
    );
    doc.text('DOCUMENTO', 350, 40);
    doc.text(data.tipo, 342, 54);
    doc.text('NUMERO', 430, 40);
    doc.text(data.nroControl, 440, 54);
    doc.text('FECHA DE EMISION', 380, 90);
    doc.text(data.fecha_emision, 400, 103);
    
    doc.text('DESCRIPCIÓN', 30, 130);
    doc.text('CANTIDAD', 200, 130);
    doc.text('PRECIO UNITARIO', 260, 130);
    doc.text('%IVA', 350, 130);
    doc.text('PRECIO TOTAL', 400, 130);
    doc.lineCap('butt').moveTo(25, 145).lineTo(470, 145).stroke();
    
    doc.fontSize(8);
    doc.text('OBSERVACIÓN:', 30, 220);
    doc.y = 220;
    doc.x = 100;
    doc.text(data.observacion,
      {
        width: 300,
        align: 'justify',
      }
    );

    doc.y = 270;
    doc.x = 30;
    doc.text(data.nota,
      {
        width: 280,
        align: 'justify',
      }
    );

    var i = 0;
    for (var item = 0; item <= data.detalles.length - 1; item++) {
      doc.fontSize(8)
      doc.text(data.detalles[item].concepto, 30, 160 + i);
      doc.y = 160 + i;
      doc.x = 193;
      doc.fillColor('black');
      doc.text(
        utils.truncate(data.detalles[item].cantidad, 10),
        {
          width: 57,
          align: 'center',
        }
      );
      doc.y = 160 + i;
      doc.x = 240;
      doc.fillColor('black');
      doc.text(
        utils.truncate(data.detalles[item].costo_unitario, 10),
        {
          width: 97,
          align: 'right',
        }
      );
      doc.y = 160 + i;
      doc.x = 340;
      doc.fillColor('black');
      doc.text(
        utils.truncate(data.iva, 5),
        {
          width: 30,
          align: 'right',
        }
      );
      doc.y = 160 + i;
      doc.x = 380;
      doc.fillColor('black');
      doc.text(
        utils.truncate(data.detalles[item].subtotal, 10),
        {
          width: 86,
          align: 'right',
        }
      );
      i = i + 20;
      if (item === 2) item = data.detalles.length + 2;
    }
  }
}

module.exports = NotaPreimpresoService;
