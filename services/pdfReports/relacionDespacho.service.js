const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

const clienteOrigDesc =
  '(CASE WHEN (id_clte_part_orig IS NULL || id_clte_part_orig = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `Mmovimientos`.cod_cliente_org = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `Mmovimientos`.id_clte_part_orig = clientes_particulares.id)' +
  ' END)';
const clienteDestDesc =
  '(CASE WHEN (id_clte_part_dest IS NULL || id_clte_part_dest = "")' +
  ' THEN (SELECT nb_cliente' +
  ' FROM clientes ' +
  ' WHERE `Mmovimientos`.cod_cliente_dest = clientes.id)' +
  ' ELSE (SELECT nb_cliente' +
  ' FROM clientes_particulares' +
  ' WHERE `Mmovimientos`.id_clte_part_dest = clientes_particulares.id)' +
  ' END)';

class RelacionDespachoService {
  async mainReport(doc, data, detalle) {
    data = JSON.parse(data);
    detalle = detalle.join(',');
    let dataDetalle = await models.Mmovimientos.findAll({
      where: {
        nro_documento: {
          [Sequelize.Op.in]: detalle.split(','),
        },
      },
      include: [
        {
          model: models.Agencias,
          as: 'agencias',
          include: {
            model: models.Ciudades,
            as: 'ciudades',
          },
        },
        {
          model: models.Agencias,
          as: 'agencias_dest',
          include: {
            model: models.Ciudades,
            as: 'ciudades',
          },
        },
        {
          model: models.Zonas,
          as: 'zonas_dest',
        },
      ],
      attributes: {
        include: [
          [Sequelize.literal(clienteOrigDesc), 'cliente_orig_desc'],
          [Sequelize.literal(clienteDestDesc), 'cliente_dest_desc'],
        ],
      },
      order: JSON.parse(data.sortBy),
      raw: true,
    });
    await this.generateHeader(doc, data);
    await this.generateCustomerInformation(doc, data, dataDetalle);
    return true;
  }

  async generateHeader(doc, data) {
    const headerOffsetY = -28;

    // Sección de información de la empresa y encabezado del reporte
    doc
      .image('./img/logo_rc.png', 50, 22, { width: 25 })
      .fillColor('#444444')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('RCS Express, S.A', 80, 32)
      .text('R.I.F. J-31028463-6', 80, 45)
      .fontSize(9);

    doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 665, 25);
    doc.fontSize(8);

    doc.y = 48;
    doc.x = 590;
    doc.text('Autorizado Por: ' + data.usuario, {
      align: 'right',
      columns: 1,
      width: 150,
    });
    doc.y = 55;
    doc.x = 590;
    doc.text('Impreso Por: ' + data.usuario, {
      align: 'right',
      columns: 1,
      width: 150,
    });

    doc.fontSize(14);
    doc.y = 25;
    doc.x = 150;
    doc.text(data.nombreReporte, {
      align: 'center',
      columns: 1,
      width: 490,
    });

    doc.fontSize(11);
    doc.y = 41;
    doc.x = 240;
    doc.text(data.agencia, {
      align: 'center',
      columns: 1,
      width: 300,
    });
    doc.fontSize(10);
    doc.text('Desde: ' + data.fecha_desde, 280, 55);
    doc.text('Hasta: ' + data.fecha_hasta, 400, 55);

    if (data.tipoReporte == 'APZ') {
      // Sección de Encabezados de Columnas de Datos del Documento
      // Se aplica el offset a todas las coordenadas 'y' dentro de esta sección
      doc.fontSize(8);
      doc.y = 102 + headerOffsetY;
      doc.x = 35;
      doc.text('DATOS DEL DOCUMENTO', {
        align: 'center',
        columns: 1,
        width: 176,
      });

      if (data.visibleGuia) {
        doc.y = 120 + headerOffsetY;
        doc.x = 50;
        doc.text('Guía', {
          align: 'left',
          columns: 1,
          width: 40,
        });
      }

      doc.y = 120 + headerOffsetY;
      doc.x = 82;
      doc.text('Emisión', {
        align: 'left',
        columns: 1,
        width: 40,
      });
      doc.y = 120 + headerOffsetY;
      doc.x = 124;
      doc.text('O.', {
        align: 'left',
        columns: 1,
        width: 10,
      });
      doc.y = 120 + headerOffsetY;
      doc.x = 144;
      doc.text('D.', {
        align: 'left',
        columns: 1,
        width: 10,
      });

      doc.y = 120 + headerOffsetY;
      doc.x = 160;
      doc.text('Piezas', {
        align: 'left',
        columns: 1,
        width: 30,
      });
      doc.y = 120 + headerOffsetY;
      doc.x = 188;
      doc.text(data.neta === 'N' ? 'Neto' : 'Kgs.', {
        align: 'left',
        columns: 1,
        width: 30,
      });

      // Lógica Condicional para Columnas de Cliente, Valor Declarado y Formas de Pago
      // Si los montos son visibles y se desea mostrar la columna en dólares.
      if (data.visible === 'V' && data.dolar) {
        doc.y = 102 + headerOffsetY;
        doc.x = 211;
        doc.text('CLIENTE', {
          align: 'center',
          columns: 1,
          width: 220,
        });
        doc.y = 102 + headerOffsetY;
        doc.x = 431;
        doc.text('VALOR DECLARADO', {
          align: 'center',
          columns: 1,
          width: 97,
        });
        doc.y = 118 + headerOffsetY;
        doc.x = 724;
        doc.text('$', {
          align: 'center',
          columns: 1,
          width: 30,
        });

        doc.y = 120 + headerOffsetY;
        doc.x = 214;
        doc.text('Remitente');
        doc.y = 120 + headerOffsetY;
        doc.x = 326;
        doc.text('Destinatario');
        doc.y = 120 + headerOffsetY;
        doc.x = 443;
        doc.text('Bolivares');
        doc.y = 120 + headerOffsetY;
        doc.x = 504;
        doc.text('$');

        doc.y = 102 + headerOffsetY;
        doc.x = 528;
        doc.text('CRÉDITO', {
          align: 'center',
          columns: 1,
          width: 101,
        });
        doc.y = 120 + headerOffsetY;
        doc.x = 536;
        doc.text('Origen');
        doc.y = 120 + headerOffsetY;
        doc.x = 580;
        doc.text('Destino');

        doc.y = 102 + headerOffsetY;
        doc.x = 629;
        doc.text('CONTADO', {
          align: 'center',
          columns: 1,
          width: 95,
        });
        doc.y = 120 + headerOffsetY;
        doc.x = 636;
        doc.text('Origen');
        doc.y = 120 + headerOffsetY;
        doc.x = 680;
        doc.text('Destino');

        // Dibujo de los encabezados para la condición: montos visibles y dólar
        doc
          .lineJoin('miter')
          .rect(35, 97 + headerOffsetY, 176, 17)
          .stroke(); // DATOS DEL DOCUMENTO
        doc
          .lineJoin('miter')
          .rect(211, 97 + headerOffsetY, 220, 17)
          .stroke(); // CLIENTE
        doc
          .lineJoin('miter')
          .rect(431, 97 + headerOffsetY, 97, 17)
          .stroke(); // VALOR DECLARADO
        doc
          .lineJoin('miter')
          .rect(528, 97 + headerOffsetY, 101, 17)
          .stroke(); // CRÉDITO
        doc
          .lineJoin('miter')
          .rect(629, 97 + headerOffsetY, 95, 17)
          .stroke(); // CONTADO
        doc
          .lineJoin('miter')
          .rect(724, 97 + headerOffsetY, 30, 34)
          .stroke(); // $ (Valor Declarado)
        doc
          .lineJoin('miter')
          .rect(35, 114 + headerOffsetY, 176, 17)
          .stroke(); // Sub-encabezado DATOS DEL DOCUMENTO
        doc
          .lineJoin('miter')
          .rect(211, 114 + headerOffsetY, 220, 17)
          .stroke(); // Sub-encabezado CLIENTE (Remitente/Destinatario)
        doc
          .lineJoin('miter')
          .rect(431, 114 + headerOffsetY, 97, 17)
          .stroke(); // Sub-encabezado VALOR DECLARADO (Bolivares/$)
        doc
          .lineJoin('miter')
          .rect(528, 114 + headerOffsetY, 101, 17)
          .stroke(); // Sub-encabezado CRÉDITO (Origen/Destino)
        doc
          .lineJoin('miter')
          .rect(629, 114 + headerOffsetY, 95, 17)
          .stroke(); // Sub-encabezado CONTADO (Origen/Destino)
      } else {
        // Si la condición anterior no se cumple.
        doc.y = 102 + headerOffsetY;
        doc.x = 211;
        doc.text('CLIENTE', {
          align: 'center',
          columns: 1,
          width: 293,
        });

        // Si el reporte es de costos y los montos no son visibles.
        if (data.tipo === 'C' && data.visible === 'N') {
          doc.y = 102 + headerOffsetY;
          doc.x = 504;
          doc.text('DATOS DEL DOCUMENTO', {
            align: 'center',
            columns: 1,
            width: 250,
          });
          doc.y = 120 + headerOffsetY;
          doc.x = 504;
          doc.text('Números Factura Cliente', {
            align: 'center',
            columns: 1,
            width: 250,
          });
          doc.y = 120 + headerOffsetY;
          doc.x = 214;
          doc.text('Remitente');
          doc.y = 120 + headerOffsetY;
          doc.x = 343;
          doc.text('Destinatario');

          // Dibujo de los encabezados para la condición: reporte de costos y montos no visibles
          doc
            .lineJoin('miter')
            .rect(35, 97 + headerOffsetY, 176, 17)
            .stroke(); // DATOS DEL DOCUMENTO
          doc
            .lineJoin('miter')
            .rect(211, 97 + headerOffsetY, 293, 17)
            .stroke(); // CLIENTE
          doc
            .lineJoin('miter')
            .rect(504, 97 + headerOffsetY, 250, 17)
            .stroke(); // DATOS DEL DOCUMENTO (Números Factura Cliente)
          doc
            .lineJoin('miter')
            .rect(35, 114 + headerOffsetY, 176, 17)
            .stroke(); // Sub-encabezado DATOS DEL DOCUMENTO
          doc
            .lineJoin('miter')
            .rect(211, 114 + headerOffsetY, 293, 17)
            .stroke(); // Sub-encabezado CLIENTE (Remitente/Destinatario)
          doc
            .lineJoin('miter')
            .rect(504, 114 + headerOffsetY, 250, 17)
            .stroke(); // Sub-encabezado Números Factura Cliente
        } else {
          // En cualquier otro caso dentro de esta rama principal.
          doc.y = 120 + headerOffsetY;
          doc.x = 214;
          doc.text('Remitente');
          doc.y = 120 + headerOffsetY;
          doc.x = 343;
          doc.text('Destinatario');

          doc.y = 102 + headerOffsetY;
          doc.x = 504;
          doc.text('CRÉDITO', {
            align: 'center',
            columns: 1,
            width: 126,
          });
          doc.y = 120 + headerOffsetY;
          doc.x = 515;
          doc.text('Origen');
          doc.y = 120 + headerOffsetY;
          doc.x = 570;
          doc.text('Destino');

          doc.y = 102 + headerOffsetY;
          doc.x = 630;
          doc.text('CONTADO', {
            align: 'center',
            columns: 1,
            width: 124,
          });
          doc.y = 120 + headerOffsetY;
          doc.x = 640;
          doc.text('Origen');
          doc.y = 120 + headerOffsetY;
          doc.x = 700;
          doc.text('Destino');

          // Dibujo de los encabezados para la condición: otro caso (montos visibles pero sin dólar, o tipo no es C)
          doc
            .lineJoin('miter')
            .rect(35, 97 + headerOffsetY, 176, 17)
            .stroke(); // DATOS DEL DOCUMENTO
          doc
            .lineJoin('miter')
            .rect(211, 97 + headerOffsetY, 293, 17)
            .stroke(); // CLIENTE
          doc
            .lineJoin('miter')
            .rect(504, 97 + headerOffsetY, 126, 17)
            .stroke(); // CRÉDITO
          doc
            .lineJoin('miter')
            .rect(630, 97 + headerOffsetY, 124, 17)
            .stroke(); // CONTADO
          doc
            .lineJoin('miter')
            .rect(35, 114 + headerOffsetY, 176, 17)
            .stroke(); // Sub-encabezado DATOS DEL DOCUMENTO
          doc
            .lineJoin('miter')
            .rect(211, 114 + headerOffsetY, 293, 17)
            .stroke(); // Sub-encabezado CLIENTE (Remitente/Destinatario)
          doc
            .lineJoin('miter')
            .rect(504, 114 + headerOffsetY, 126, 17)
            .stroke(); // Sub-encabezado CRÉDITO (Origen/Destino)
          doc
            .lineJoin('miter')
            .rect(630, 114 + headerOffsetY, 124, 17)
            .stroke(); // Sub-encabezado CONTADO (Origen/Destino)
        }
      }
    } else {
      // Sección de Encabezados de Columnas de Datos del Documento
      // Se aplica el offset a todas las coordenadas 'y' dentro de esta sección
      doc.fontSize(8);
      doc.y = 102 + headerOffsetY;
      doc.x = 35;
      doc.text('DATOS DEL DOCUMENTO', {
        align: 'center',
        columns: 1,
        width: 217,
      });

      if (data.visibleGuia) {
        doc.y = 120 + headerOffsetY;
        doc.x = 50;
        doc.text('Guía', {
          align: 'left',
          columns: 1,
          width: 40,
        });
      }

      doc.y = 120 + headerOffsetY;
      doc.x = 82;
      doc.text('Emisión', {
        align: 'left',
        columns: 1,
        width: 40,
      });
      doc.y = 120 + headerOffsetY;
      doc.x = 124;
      doc.text('O.', {
        align: 'left',
        columns: 1,
        width: 10,
      });
      doc.y = 120 + headerOffsetY;
      doc.x = 144;
      doc.text('D.', {
        align: 'left',
        columns: 1,
        width: 10,
      });

      doc.y = 120 + headerOffsetY;
      doc.x = 160;
      doc.text('Zona D.', {
        align: 'left',
        columns: 1,
        width: 30,
      });
      doc.y = 120 + headerOffsetY;
      doc.x = 201;
      doc.text('Piezas', {
        align: 'left',
        columns: 1,
        width: 30,
      });
      doc.y = 120 + headerOffsetY;
      doc.x = 229;
      doc.text(data.neta === 'N' ? 'Neto' : 'Kgs.', {
        align: 'left',
        columns: 1,
        width: 30,
      });

      // Lógica Condicional para Columnas de Cliente, Valor Declarado y Formas de Pago
      // Si los montos son visibles y se desea mostrar la columna en dólares.
      if (data.visible === 'V' && data.dolar) {
        doc.y = 102 + headerOffsetY;
        doc.x = 252;
        doc.text('CLIENTE', {
          align: 'center',
          columns: 1,
          width: 220,
        });
        doc.y = 102 + headerOffsetY;
        doc.x = 472;
        doc.text('VALOR DECLARADO', {
          align: 'center',
          columns: 1,
          width: 97,
        });
        doc.y = 118 + headerOffsetY;
        doc.x = 724;
        doc.text('$', {
          align: 'center',
          columns: 1,
          width: 30,
        });

        doc.y = 120 + headerOffsetY;
        doc.x = 255;
        doc.text('Remitente');
        doc.y = 120 + headerOffsetY;
        doc.x = 367;
        doc.text('Destinatario');
        doc.y = 120 + headerOffsetY;
        doc.x = 484;
        doc.text('Bolivares');
        doc.y = 120 + headerOffsetY;
        doc.x = 545;
        doc.text('$');

        doc.y = 102 + headerOffsetY;
        doc.x = 569;
        doc.text('CRÉDITO', {
          align: 'center',
          columns: 1,
          width: 80,
        });
        doc.y = 120 + headerOffsetY;
        doc.x = 577;
        doc.text('Origen');
        doc.y = 120 + headerOffsetY;
        doc.x = 610;
        doc.text('Destino');

        doc.y = 102 + headerOffsetY;
        doc.x = 649;
        doc.text('CONTADO', {
          align: 'center',
          columns: 1,
          width: 75,
        });
        doc.y = 120 + headerOffsetY;
        doc.x = 656;
        doc.text('Origen');
        doc.y = 120 + headerOffsetY;
        doc.x = 688;
        doc.text('Destino');

        // Dibujo de los encabezados para la condición: montos visibles y dólar
        doc
          .lineJoin('miter')
          .rect(35, 97 + headerOffsetY, 217, 17)
          .stroke(); // DATOS DEL DOCUMENTO
        doc
          .lineJoin('miter')
          .rect(252, 97 + headerOffsetY, 220, 17)
          .stroke(); // CLIENTE
        doc
          .lineJoin('miter')
          .rect(472, 97 + headerOffsetY, 97, 17)
          .stroke(); // VALOR DECLARADO
        doc
          .lineJoin('miter')
          .rect(569, 97 + headerOffsetY, 80, 17)
          .stroke(); // CRÉDITO
        doc
          .lineJoin('miter')
          .rect(649, 97 + headerOffsetY, 75, 17)
          .stroke(); // CONTADO
        doc
          .lineJoin('miter')
          .rect(724, 97 + headerOffsetY, 30, 34)
          .stroke(); // $ (Valor Declarado)
        doc
          .lineJoin('miter')
          .rect(35, 114 + headerOffsetY, 217, 17)
          .stroke(); // Sub-encabezado DATOS DEL DOCUMENTO
        doc
          .lineJoin('miter')
          .rect(252, 114 + headerOffsetY, 220, 17)
          .stroke(); // Sub-encabezado CLIENTE (Remitente/Destinatario)
        doc
          .lineJoin('miter')
          .rect(472, 114 + headerOffsetY, 97, 17)
          .stroke(); // Sub-encabezado VALOR DECLARADO (Bolivares/$)
        doc
          .lineJoin('miter')
          .rect(569, 114 + headerOffsetY, 80, 17)
          .stroke(); // Sub-encabezado CRÉDITO (Origen/Destino)
        doc
          .lineJoin('miter')
          .rect(649, 114 + headerOffsetY, 75, 17)
          .stroke(); // Sub-encabezado CONTADO (Origen/Destino)
      } else {
        // Si la condición anterior no se cumple.
        doc.y = 102 + headerOffsetY;
        doc.x = 252;
        doc.text('CLIENTE', {
          align: 'center',
          columns: 1,
          width: 293,
        });

        // Si el reporte es de costos y los montos no son visibles.
        if (data.tipo === 'C' && data.visible === 'N') {
          doc.y = 102 + headerOffsetY;
          doc.x = 545;
          doc.text('DATOS DEL DOCUMENTO', {
            align: 'center',
            columns: 1,
            width: 209,
          });
          doc.y = 120 + headerOffsetY;
          doc.x = 545;
          doc.text('Números Factura Cliente', {
            align: 'center',
            columns: 1,
            width: 209,
          });
          doc.y = 120 + headerOffsetY;
          doc.x = 255;
          doc.text('Remitente');
          doc.y = 120 + headerOffsetY;
          doc.x = 384;
          doc.text('Destinatario');

          // Dibujo de los encabezados para la condición: reporte de costos y montos no visibles
          doc
            .lineJoin('miter')
            .rect(35, 97 + headerOffsetY, 217, 17)
            .stroke(); // DATOS DEL DOCUMENTO
          doc
            .lineJoin('miter')
            .rect(252, 97 + headerOffsetY, 293, 17)
            .stroke(); // CLIENTE
          doc
            .lineJoin('miter')
            .rect(545, 97 + headerOffsetY, 209, 17)
            .stroke(); // DATOS DEL DOCUMENTO (Números Factura Cliente)
          doc
            .lineJoin('miter')
            .rect(35, 114 + headerOffsetY, 217, 17)
            .stroke(); // Sub-encabezado DATOS DEL DOCUMENTO
          doc
            .lineJoin('miter')
            .rect(252, 114 + headerOffsetY, 293, 17)
            .stroke(); // Sub-encabezado CLIENTE (Remitente/Destinatario)
          doc
            .lineJoin('miter')
            .rect(545, 114 + headerOffsetY, 209, 17)
            .stroke(); // Sub-encabezado Números Factura Cliente
        } else {
          // En cualquier otro caso dentro de esta rama principal.
          doc.y = 120 + headerOffsetY;
          doc.x = 255;
          doc.text('Remitente');
          doc.y = 120 + headerOffsetY;
          doc.x = 384;
          doc.text('Destinatario');

          doc.y = 102 + headerOffsetY;
          doc.x = 545;
          doc.text('CRÉDITO', {
            align: 'center',
            columns: 1,
            width: 105,
          });
          doc.y = 120 + headerOffsetY;
          doc.x = 555;
          doc.text('Origen');
          doc.y = 120 + headerOffsetY;
          doc.x = 604;
          doc.text('Destino');

          doc.y = 102 + headerOffsetY;
          doc.x = 650;
          doc.text('CONTADO', {
            align: 'center',
            columns: 1,
            width: 104,
          });
          doc.y = 120 + headerOffsetY;
          doc.x = 660;
          doc.text('Origen');
          doc.y = 120 + headerOffsetY;
          doc.x = 705;
          doc.text('Destino');

          // Dibujo de los encabezados para la condición: otro caso (montos visibles pero sin dólar, o tipo no es C)
          doc
            .lineJoin('miter')
            .rect(35, 97 + headerOffsetY, 217, 17)
            .stroke(); // DATOS DEL DOCUMENTO
          doc
            .lineJoin('miter')
            .rect(252, 97 + headerOffsetY, 293, 17)
            .stroke(); // CLIENTE
          doc
            .lineJoin('miter')
            .rect(545, 97 + headerOffsetY, 105, 17)
            .stroke(); // CRÉDITO
          doc
            .lineJoin('miter')
            .rect(650, 97 + headerOffsetY, 104, 17)
            .stroke(); // CONTADO
          doc
            .lineJoin('miter')
            .rect(35, 114 + headerOffsetY, 217, 17)
            .stroke(); // Sub-encabezado DATOS DEL DOCUMENTO
          doc
            .lineJoin('miter')
            .rect(252, 114 + headerOffsetY, 293, 17)
            .stroke(); // Sub-encabezado CLIENTE (Remitente/Destinatario)
          doc
            .lineJoin('miter')
            .rect(545, 114 + headerOffsetY, 105, 17)
            .stroke(); // Sub-encabezado CRÉDITO (Origen/Destino)
          doc
            .lineJoin('miter')
            .rect(650, 114 + headerOffsetY, 104, 17)
            .stroke(); // Sub-encabezado CONTADO (Origen/Destino)
        }
      }
    }
  }

  async generateCustomerInformation(doc, data, detalle) {
    var i = 0;
    var page = 0;
    var ymin = 110;
    var maxlength = 0;

    let credito_orig = 0;
    let credito_dest = 0;
    let contado_orig = 0;
    let contado_dest = 0;
    let total_dolar = 0;
    let total_declarado = 0;
    let total_declarado_dolar = 0;
    let nro_piezas = 0;
    let peso_kgs = 0;
    let carga_neta = 0;

    let group_len = 0;
    let group_piezas = 0;
    let group_neta = 0;
    let group_kgs = 0;
    let credito_orig_group = 0;
    let credito_dest_group = 0;
    let contado_orig_group = 0;
    let contado_dest_group = 0;
    let total_dolar_group = 0;
    let total_declarado_group = 0;
    let total_declarado_dolar_group = 0;
    let total;
    let zonaOff = 41;

    let hDolar = await models.Hdolar.findAll({
      where: {
        fecha: {
          [Sequelize.Op.between]: [
            moment(data.fecha_desde, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            moment(data.fecha_hasta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
          ],
        },
      },
      raw: true,
    });

    for (var item = 0; item < detalle.length; item++) {
      doc.font('Helvetica')
      doc.fontSize(7);
      let monto_total = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        currencyDisplay: 'code',
      })
        .format(detalle[item].monto_total)
        .replace('EUR', '')
        .trim();

      nro_piezas += utils.parseFloatN(detalle[item].nro_piezas);
      peso_kgs += utils.parseFloatN(detalle[item].peso_kgs);
      carga_neta += utils.parseFloatN(detalle[item].carga_neta);

      if (detalle[item].modalidad_pago == 'CR') {
        if (detalle[item].pagado_en == 'O') {
          credito_orig += utils.parseFloatN(detalle[item].monto_total);
        } else {
          credito_dest += utils.parseFloatN(detalle[item].monto_total);
        }
      } else {
        if (detalle[item].pagado_en == 'O') {
          contado_orig += utils.parseFloatN(detalle[item].monto_total);
        } else {
          contado_dest += utils.parseFloatN(detalle[item].monto_total);
        }
      }

      let label;
      let field;
      let valor_dolar = 0;
      let monto_dolar = 0;
      let declarado_dolar = 0;

      let find_dolar = hDolar.findIndex(
        (arr) => arr.fecha == detalle[item].fecha_emision
      );
      if (find_dolar >= 0) valor_dolar = hDolar[find_dolar].valor;

      if (valor_dolar > 0) {
        monto_dolar = (
          utils.parseFloatN(detalle[item].monto_total) /
          utils.parseFloatN(valor_dolar)
        ).toFixed(2);
      }

      total_dolar += utils.parseFloatN(monto_dolar);
      total_declarado += utils.parseFloatN(detalle[item].monto_ref_cte_sin_imp);

      if (valor_dolar > 0) {
        declarado_dolar = (
          utils.parseFloatN(detalle[item].monto_ref_cte_sin_imp) /
          utils.parseFloatN(valor_dolar)
        ).toFixed(2);
      }
      total_declarado_dolar += utils.parseFloatN(declarado_dolar);

      doc.font('Helvetica-Bold')

      if (data.tipoReporte == 'APZ') {
        label = 'Zona Destino: ';
        field = 'zonas_dest.nb_zona';
        total = 'Total por Zona: ';       

        if (item == 0) {
          // Aqui pinto el primer encabezado
          doc.fontSize(9);
          doc.y = ymin + i;
          doc.x = 42;
          doc.text(label + detalle[item][field], {
            align: 'left',
            columns: 1,
            width: 500,
          });
          i += 15;
        } else if (detalle[item][field] != detalle[item - 1][field]) {
          // Aqui pinto los totales del agrupado
          i += 5;
          doc.y = ymin + i;
          doc.x = 28;
          doc.text(total + group_len, {
            align: 'center',
            columns: 1,
            width: 100,
          });
          doc.y = ymin + i;
          doc.x = 161;
          doc.text('Total Piezas: ' + group_piezas, {
            align: 'center',
            columns: 1,
            width: 67,
          });
          doc.y = ymin + i;
          doc.x = 210;
          if (data.neta == 'N') {
            doc.text(
              'Total Neto: ' +
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(group_neta)
                  .replace('EUR', '')
                  .trim(),
              {
                align: 'center',
                columns: 1,
                width: 105,
              }
            );
          } else {
            doc.text(
              'Total Kgs: ' +
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(group_kgs)
                  .replace('EUR', '')
                  .trim(),
              {
                align: 'center',
                columns: 1,
                width: 105,
              }
            );
          }

          if (data.visible == 'V') {
            if (data.dolar) {
              doc.y = ymin + i;
              doc.x = 480 - zonaOff;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(total_declarado_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 522 - zonaOff;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(total_declarado_dolar_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 580 - zonaOff;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(credito_orig_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 621 - zonaOff;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(credito_dest_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 670 - zonaOff;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(contado_orig_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 715 - zonaOff;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(contado_dest_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 750 - zonaOff;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(total_dolar_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
            } else {
              doc.y = ymin + i;
              doc.x = 552 - zonaOff;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(credito_orig_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 620 - zonaOff;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(credito_dest_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 680 - zonaOff;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(contado_orig_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
              doc.y = ymin + i;
              doc.x = 740 - zonaOff;
              doc.text(
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  currencyDisplay: 'code',
                })
                  .format(contado_dest_group)
                  .replace('EUR', '')
                  .trim(),
                {
                  align: 'right',
                  columns: 1,
                  width: 40,
                }
              );
            }
          }

          i += 15;
          group_len = 0;
          group_piezas = 0;
          group_neta = 0;
          group_kgs = 0;
          credito_orig_group = 0;
          credito_dest_group = 0;
          contado_orig_group = 0;
          contado_dest_group = 0;
          total_dolar_group = 0;
          total_declarado_group = 0;
          total_declarado_dolar_group = 0;

          maxlength = 400;
          if (!data.chofer && !data.receptor) maxlength += 50;
          if (data.observacion && data.tipo == 'C') maxlength -= 50;

          if (i >= maxlength) {
            this.generateFooter(doc, data);
            if (!(item >= detalle.length - 1)) {
              doc.addPage();
              page = page + 1;
              doc.switchToPage(page);
              i = 0;
              await this.generateHeader(doc, data);
            }
          }

          // Aqui pinto el encabezado del agrupado
          doc.fontSize(9);
          doc.y = ymin + i;
          doc.x = 42;
          doc.text(label + detalle[item][field], {
            align: 'left',
            columns: 1,
            width: 500,
          });
          i += 15;
        }
        doc.fontSize(7);

        group_len++;
        group_piezas += utils.parseFloatN(detalle[item].nro_piezas);
        group_neta += utils.parseFloatN(detalle[item].carga_neta);
        group_kgs += utils.parseFloatN(detalle[item].peso_kgs);

        if (detalle[item].modalidad_pago == 'CR') {
          if (detalle[item].pagado_en == 'O') {
            credito_orig_group += utils.parseFloatN(detalle[item].monto_total);
          } else {
            credito_dest_group += utils.parseFloatN(detalle[item].monto_total);
          }
        } else {
          if (detalle[item].pagado_en == 'O') {
            contado_orig_group += utils.parseFloatN(detalle[item].monto_total);
          } else {
            contado_dest_group += utils.parseFloatN(detalle[item].monto_total);
          }
        }

        let declarado_dolar_group = 0;
        total_dolar_group += utils.parseFloatN(monto_dolar);
        total_declarado_group += utils.parseFloatN(
          detalle[item].monto_ref_cte_sin_imp
        );
        if (valor_dolar > 0) {
          declarado_dolar_group = (
            utils.parseFloatN(detalle[item].monto_ref_cte_sin_imp) /
            utils.parseFloatN(valor_dolar)
          ).toFixed(2);
        }

        total_declarado_dolar_group += utils.parseFloatN(declarado_dolar_group);

        doc.font('Helvetica')

        if (data.visibleGuia) {
          doc.y = ymin + i;
          doc.x = 33;
          doc.text(detalle[item].nro_documento, {
            align: 'center',
            columns: 1,
            width: 50,
          });
        }

        doc.y = ymin + i;
        doc.x = 75;
        doc.text(moment(detalle[item].fecha_emision).format('DD/MM/YYYY'), {
          align: 'center',
          columns: 1,
          width: 47,
        });
        doc.y = ymin + i;
        doc.x = 95;
        doc.text(detalle[item]['agencias.ciudades.siglas'], {
          align: 'center',
          columns: 1,
          width: 67,
        });
        doc.y = ymin + i;
        doc.x = 115;
        doc.text(detalle[item]['agencias_dest.ciudades.siglas'], {
          align: 'center',
          columns: 1,
          width: 67,
        });

        doc.y = ymin + i;
        doc.x = 200 - zonaOff;
        doc.text(detalle[item].nro_piezas, {
          align: 'center',
          columns: 1,
          width: 40,
        });

        if (data.neta == 'N') {
          doc.y = ymin + i;
          doc.x = 210 - zonaOff;
          doc.text(detalle[item].carga_neta, {
            align: 'right',
            columns: 1,
            width: 40,
          });
        } else if (data.neta == 'K') {
          doc.y = ymin + i;
          doc.x = 210 - zonaOff;
          doc.text(detalle[item].peso_kgs, {
            align: 'right',
            columns: 1,
            width: 40,
          });
        } else {
          doc.y = ymin + i;
          doc.x = 210 - zonaOff;
          doc.text(detalle[item].peso_kgs, {
            align: 'right',
            columns: 1,
            width: 40,
          });
        }

        if (data.dolar) {
          doc.y = ymin + i;
          doc.x = 260 - zonaOff;
          doc.text(
            detalle[item].cliente_orig_desc
              ? detalle[item].cliente_orig_desc.substring(0, 47)
              : '',
            {
              align: 'left',
              columns: 1,
              width: 105,
            }
          );
          doc.y = ymin + i;
          doc.x = 370 - zonaOff;
          if (detalle[item].cliente_dest_desc) {
            doc.text(
              detalle[item].cliente_dest_desc
                ? detalle[item].cliente_dest_desc.substring(0, 43)
                : '',
              {
                align: 'left',
                columns: 1,
                width: 110,
              }
            );
          }

          if (data.visible == 'V') {
            doc.y = ymin + i;
            doc.x = 480 - zonaOff;
            doc.text(
              new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR',
                currencyDisplay: 'code',
              })
                .format(detalle[item].monto_ref_cte_sin_imp)
                .replace('EUR', '')
                .trim(),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 522 - zonaOff;
            doc.text(
              new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR',
                currencyDisplay: 'code',
              })
                .format(declarado_dolar)
                .replace('EUR', '')
                .trim(),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 580 - zonaOff;
            doc.text(
              detalle[item].modalidad_pago == 'CR' &&
                detalle[item].pagado_en == 'O'
                ? monto_total
                : '0,00',
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 621 - zonaOff;
            doc.text(
              detalle[item].modalidad_pago == 'CR' &&
                detalle[item].pagado_en == 'D'
                ? monto_total
                : '0,00',
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 670 - zonaOff;
            doc.text(
              detalle[item].modalidad_pago == 'CO' &&
                detalle[item].pagado_en == 'O'
                ? monto_total
                : '0,00',
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 715 - zonaOff;
            doc.text(
              detalle[item].modalidad_pago == 'CO' &&
                detalle[item].pagado_en == 'D'
                ? monto_total
                : '0,00',
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 750 - zonaOff;
            doc.text(
              new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR',
                currencyDisplay: 'code',
              })
                .format(monto_dolar)
                .replace('EUR', '')
                .trim(),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
          }
        } else {
          doc.y = ymin + i;
          doc.x = 260 - zonaOff;
          doc.text(
            detalle[item].cliente_orig_desc
              ? detalle[item].cliente_orig_desc.substring(0, 53)
              : '',
            {
              align: 'left',
              columns: 1,
              width: 125,
            }
          );
          doc.y = ymin + i;
          doc.x = 390 - zonaOff;
          if (detalle[item].cliente_dest_desc) {
            doc.text(
              detalle[item].cliente_dest_desc
                ? detalle[item].cliente_dest_desc.substring(0, 70)
                : '',
              {
                align: 'left',
                columns: 1,
                width: 160,
              }
            );
          }

          if (data.visible == 'V') {
            doc.y = ymin + i;
            doc.x = 552 - zonaOff;
            doc.text(
              detalle[item].modalidad_pago == 'CR' &&
                detalle[item].pagado_en == 'O'
                ? monto_total
                : '0,00',
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 620 - zonaOff;
            doc.text(
              detalle[item].modalidad_pago == 'CR' &&
                detalle[item].pagado_en == 'D'
                ? monto_total
                : '0,00',
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 680 - zonaOff;
            doc.text(
              detalle[item].modalidad_pago == 'CO' &&
                detalle[item].pagado_en == 'O'
                ? monto_total
                : '0,00',
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 740 - zonaOff;
            doc.text(
              detalle[item].modalidad_pago == 'CO' &&
                detalle[item].pagado_en == 'D'
                ? monto_total
                : '0,00',
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
          }
        }

        if (data.tipo == 'C' && data.visible == 'N') {
          doc.y = ymin + i;
          doc.x = 545 - zonaOff;
          doc.text(detalle[item].dimensiones.substring(0, 76), {
            align: 'center',
            columns: 1,
            width: 250,
          });
        }

        i += 18;

        maxlength = 410;
        if (!data.chofer && !data.receptor) maxlength += 50;
        if (data.observacion && data.tipo == 'C') maxlength -= 50;

        if (i >= maxlength || item >= detalle.length - 1) {
          this.generateFooter(doc, data);
          if (!(item >= detalle.length - 1)) {
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, data);
          }
        }
      } else {
        if (data.tipoReporte == 'MAD') {
          label = 'Agencia Destino: ';
          field = 'agencias_dest.nb_agencia';
          total = 'Total por Agencia: ';

          if (item == 0) {
            // Aqui pinto el primer encabezado
            doc.fontSize(9);
            doc.y = ymin + i;
            doc.x = 42;
            doc.text(label + detalle[item][field], {
              align: 'left',
              columns: 1,
              width: 500,
            });
            i += 15;
          } else if (detalle[item][field] != detalle[item - 1][field]) {
            // Aqui pinto los totales del agrupado
            i += 5;
            doc.y = ymin + i;
            doc.x = 28;
            doc.text(total + group_len, {
              align: 'center',
              columns: 1,
              width: 100,
            });
            doc.y = ymin + i;
            doc.x = 161;
            doc.text('Total Piezas: ' + group_piezas, {
              align: 'center',
              columns: 1,
              width: 67,
            });
            doc.y = ymin + i;
            doc.x = 210;
            if (data.neta == 'N') {
              doc.text(
                'Total Neto: ' +
                  new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                    currencyDisplay: 'code',
                  })
                    .format(group_neta)
                    .replace('EUR', '')
                    .trim(),
                {
                  align: 'center',
                  columns: 1,
                  width: 105,
                }
              );
            } else {
              doc.text(
                'Total Kgs: ' +
                  new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                    currencyDisplay: 'code',
                  })
                    .format(group_kgs)
                    .replace('EUR', '')
                    .trim(),
                {
                  align: 'center',
                  columns: 1,
                  width: 105,
                }
              );
            }

            if (data.visible == 'V') {
              if (data.dolar) {
                doc.y = ymin + i;
                doc.x = 480;
                doc.text(
                  new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                    currencyDisplay: 'code',
                  })
                    .format(total_declarado_group)
                    .replace('EUR', '')
                    .trim(),
                  {
                    align: 'right',
                    columns: 1,
                    width: 40,
                  }
                );
                doc.y = ymin + i;
                doc.x = 522;
                doc.text(
                  new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                    currencyDisplay: 'code',
                  })
                    .format(total_declarado_dolar_group)
                    .replace('EUR', '')
                    .trim(),
                  {
                    align: 'right',
                    columns: 1,
                    width: 40,
                  }
                );
                doc.y = ymin + i;
                doc.x = 565;
                doc.text(
                  new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                    currencyDisplay: 'code',
                  })
                    .format(credito_orig_group)
                    .replace('EUR', '')
                    .trim(),
                  {
                    align: 'right',
                    columns: 1,
                    width: 40,
                  }
                );
                doc.y = ymin + i;
                doc.x = 600;
                doc.text(
                  new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                    currencyDisplay: 'code',
                  })
                    .format(credito_dest_group)
                    .replace('EUR', '')
                    .trim(),
                  {
                    align: 'right',
                    columns: 1,
                    width: 40,
                  }
                );
                doc.y = ymin + i;
                doc.x = 645;
                doc.text(
                  new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                    currencyDisplay: 'code',
                  })
                    .format(contado_orig_group)
                    .replace('EUR', '')
                    .trim(),
                  {
                    align: 'right',
                    columns: 1,
                    width: 40,
                  }
                );
                doc.y = ymin + i;
                doc.x = 680;
                doc.text(
                  new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                    currencyDisplay: 'code',
                  })
                    .format(contado_dest_group)
                    .replace('EUR', '')
                    .trim(),
                  {
                    align: 'right',
                    columns: 1,
                    width: 40,
                  }
                );
                doc.y = ymin + i;
                doc.x = 713;
                doc.text(
                  new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                    currencyDisplay: 'code',
                  })
                    .format(total_dolar_group)
                    .replace('EUR', '')
                    .trim(),
                  {
                    align: 'right',
                    columns: 1,
                    width: 40,
                  }
                );
              } else {
                doc.y = ymin + i;
                doc.x = 552;
                doc.text(
                  new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                    currencyDisplay: 'code',
                  })
                    .format(credito_orig_group)
                    .replace('EUR', '')
                    .trim(),
                  {
                    align: 'right',
                    columns: 1,
                    width: 40,
                  }
                );
                doc.y = ymin + i;
                doc.x = 596;
                doc.text(
                  new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                    currencyDisplay: 'code',
                  })
                    .format(credito_dest_group)
                    .replace('EUR', '')
                    .trim(),
                  {
                    align: 'right',
                    columns: 1,
                    width: 40,
                  }
                );
                doc.y = ymin + i;
                doc.x = 657;
                doc.text(
                  new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                    currencyDisplay: 'code',
                  })
                    .format(contado_orig_group)
                    .replace('EUR', '')
                    .trim(),
                  {
                    align: 'right',
                    columns: 1,
                    width: 40,
                  }
                );
                doc.y = ymin + i;
                doc.x = 705;
                doc.text(
                  new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                    currencyDisplay: 'code',
                  })
                    .format(contado_dest_group)
                    .replace('EUR', '')
                    .trim(),
                  {
                    align: 'right',
                    columns: 1,
                    width: 40,
                  }
                );
              }
            }

            i += 15;
            group_len = 0;
            group_piezas = 0;
            group_neta = 0;
            group_kgs = 0;
            credito_orig_group = 0;
            credito_dest_group = 0;
            contado_orig_group = 0;
            contado_dest_group = 0;
            total_dolar_group = 0;
            total_declarado_group = 0;
            total_declarado_dolar_group = 0;

            maxlength = 400;
            if (!data.chofer && !data.receptor) maxlength += 50;
            if (data.observacion && data.tipo == 'C') maxlength -= 50;

            if (i >= maxlength) {
              this.generateFooter(doc, data);
              if (!(item >= detalle.length - 1)) {
                doc.addPage();
                page = page + 1;
                doc.switchToPage(page);
                i = 0;
                await this.generateHeader(doc, data);
              }
            }

            // Aqui pinto el encabezado del agrupado
            doc.fontSize(9);
            doc.y = ymin + i;
            doc.x = 42;
            doc.text(label + detalle[item][field], {
              align: 'left',
              columns: 1,
              width: 500,
            });
            i += 15;
          }
          doc.fontSize(7);
        }
        group_len++;
        group_piezas += utils.parseFloatN(detalle[item].nro_piezas);
        group_neta += utils.parseFloatN(detalle[item].carga_neta);
        group_kgs += utils.parseFloatN(detalle[item].peso_kgs);

        if (detalle[item].modalidad_pago == 'CR') {
          if (detalle[item].pagado_en == 'O') {
            credito_orig_group += utils.parseFloatN(detalle[item].monto_total);
          } else {
            credito_dest_group += utils.parseFloatN(detalle[item].monto_total);
          }
        } else {
          if (detalle[item].pagado_en == 'O') {
            contado_orig_group += utils.parseFloatN(detalle[item].monto_total);
          } else {
            contado_dest_group += utils.parseFloatN(detalle[item].monto_total);
          }
        }

        let declarado_dolar_group = 0;
        total_dolar_group += utils.parseFloatN(monto_dolar);
        total_declarado_group += utils.parseFloatN(
          detalle[item].monto_ref_cte_sin_imp
        );
        if (valor_dolar > 0) {
          declarado_dolar_group = (
            utils.parseFloatN(detalle[item].monto_ref_cte_sin_imp) /
            utils.parseFloatN(valor_dolar)
          ).toFixed(2);
        }

        total_declarado_dolar_group += utils.parseFloatN(declarado_dolar_group);

        doc.font('Helvetica')

        if (data.visibleGuia) {
          doc.y = ymin + i;
          doc.x = 33;
          doc.text(detalle[item].nro_documento, {
            align: 'center',
            columns: 1,
            width: 50,
          });
        }

        doc.y = ymin + i;
        doc.x = 75;
        doc.text(moment(detalle[item].fecha_emision).format('DD/MM/YYYY'), {
          align: 'center',
          columns: 1,
          width: 47,
        });
        doc.y = ymin + i;
        doc.x = 95;
        doc.text(detalle[item]['agencias.ciudades.siglas'], {
          align: 'center',
          columns: 1,
          width: 67,
        });
        doc.y = ymin + i;
        doc.x = 115;
        doc.text(detalle[item]['agencias_dest.ciudades.siglas'], {
          align: 'center',
          columns: 1,
          width: 67,
        });
        doc.y = ymin + i;
        doc.x = 160;
        doc.text(
          detalle[item]['zonas_dest.nb_zona']
            ? detalle[item]['zonas_dest.nb_zona'].substring(0, 12)
            : ''
        );
        doc.y = ymin + i;
        doc.x = 200;
        doc.text(detalle[item].nro_piezas, {
          align: 'center',
          columns: 1,
          width: 40,
        });

        if (data.neta == 'N') {
          doc.y = ymin + i;
          doc.x = 210;
          doc.text(detalle[item].carga_neta, {
            align: 'right',
            columns: 1,
            width: 40,
          });
        } else if (data.neta == 'K') {
          doc.y = ymin + i;
          doc.x = 210;
          doc.text(detalle[item].peso_kgs, {
            align: 'right',
            columns: 1,
            width: 40,
          });
        } else {
          doc.y = ymin + i;
          doc.x = 210;
          doc.text(detalle[item].peso_kgs, {
            align: 'right',
            columns: 1,
            width: 40,
          });
        }

        if (data.dolar) {
          doc.y = ymin + i;
          doc.x = 260;
          doc.text(
            detalle[item].cliente_orig_desc
              ? detalle[item].cliente_orig_desc.substring(0, 43)
              : '',
            {
              align: 'left',
              columns: 1,
              width: 105,
            }
          );
          doc.y = ymin + i;
          doc.x = 370;
          if (detalle[item].cliente_dest_desc) {
            doc.text(
              detalle[item].cliente_dest_desc
                ? detalle[item].cliente_dest_desc.substring(0, 42)
                : '',
              {
                align: 'left',
                columns: 1,
                width: 110,
              }
            );
          }

          if (data.visible == 'V') {
            doc.y = ymin + i;
            doc.x = 480;
            doc.text(
              new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR',
                currencyDisplay: 'code',
              })
                .format(detalle[item].monto_ref_cte_sin_imp)
                .replace('EUR', '')
                .trim(),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 522;
            doc.text(
              new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR',
                currencyDisplay: 'code',
              })
                .format(declarado_dolar)
                .replace('EUR', '')
                .trim(),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 565;
            doc.text(
              detalle[item].modalidad_pago == 'CR' &&
                detalle[item].pagado_en == 'O'
                ? monto_total
                : '0,00',
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 600;
            doc.text(
              detalle[item].modalidad_pago == 'CR' &&
                detalle[item].pagado_en == 'D'
                ? monto_total
                : '0,00',
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 645;
            doc.text(
              detalle[item].modalidad_pago == 'CO' &&
                detalle[item].pagado_en == 'O'
                ? monto_total
                : '0,00',
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 680;
            doc.text(
              detalle[item].modalidad_pago == 'CO' &&
                detalle[item].pagado_en == 'D'
                ? monto_total
                : '0,00',
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 712;
            doc.text(
              new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR',
                currencyDisplay: 'code',
              })
                .format(monto_dolar)
                .replace('EUR', '')
                .trim(),
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
          }
        } else {
          doc.y = ymin + i;
          doc.x = 260;
          doc.text(
            detalle[item].cliente_orig_desc
              ? detalle[item].cliente_orig_desc.substring(0, 53)
              : '',
            {
              align: 'left',
              columns: 1,
              width: 125,
            }
          );
          doc.y = ymin + i;
          doc.x = 390;
          if (detalle[item].cliente_dest_desc) {
            doc.text(
              detalle[item].cliente_dest_desc
                ? detalle[item].cliente_dest_desc.substring(0, 70)
                : '',
              {
                align: 'left',
                columns: 1,
                width: 160,
              }
            );
          }

          if (data.visible == 'V') {
            doc.y = ymin + i;
            doc.x = 552;
            doc.text(
              detalle[item].modalidad_pago == 'CR' &&
                detalle[item].pagado_en == 'O'
                ? monto_total
                : '0,00',
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 596;
            doc.text(
              detalle[item].modalidad_pago == 'CR' &&
                detalle[item].pagado_en == 'D'
                ? monto_total
                : '0,00',
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 657;
            doc.text(
              detalle[item].modalidad_pago == 'CO' &&
                detalle[item].pagado_en == 'O'
                ? monto_total
                : '0,00',
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
            doc.y = ymin + i;
            doc.x = 705;
            doc.text(
              detalle[item].modalidad_pago == 'CO' &&
                detalle[item].pagado_en == 'D'
                ? monto_total
                : '0,00',
              {
                align: 'right',
                columns: 1,
                width: 40,
              }
            );
          }
        }

        if (data.tipo == 'C' && data.visible == 'N') {
          doc.y = ymin + i;
          doc.x = 545;
          doc.text(detalle[item].dimensiones.substring(0, 63), {
            align: 'center',
            columns: 1,
            width: 209,
          });
        }

        i += 18;

        maxlength = 410;
        if (!data.chofer && !data.receptor) maxlength += 50;
        if (data.observacion && data.tipo == 'C') maxlength -= 50;

        if (i >= maxlength || item >= detalle.length - 1) {
          this.generateFooter(doc, data);
          if (!(item >= detalle.length - 1)) {
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, data);
          }
        }
      }
    }

    if (i >= maxlength - 15) {
      doc.addPage();
      page = page + 1;
      doc.switchToPage(page);
      i = 0;
      await this.generateHeader(doc, data);
    }

    let y = ymin + i + 8;
    doc.fontSize(7);
    doc.font('Helvetica-Bold')

    if (data.tipoReporte == 'APZ') {
      doc.y = y;
      doc.x = 28;
      doc.text(total + group_len, {
        align: 'center',
        columns: 1,
        width: 100,
      });
      doc.y = y;
      doc.x = 161;
      doc.text('Total Piezas: ' + group_piezas, {
        align: 'center',
        columns: 1,
        width: 67,
      });

      doc.y = y;
      doc.x = 210;
      if (data.neta == 'N') {
        doc.text(
          'Total Neto: ' +
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(group_neta)
              .replace('EUR', '')
              .trim(),
          {
            align: 'center',
            columns: 1,
            width: 105,
          }
        );
      } else {
        doc.text(
          'Total Kgs: ' +
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(group_kgs)
              .replace('EUR', '')
              .trim(),
          {
            align: 'center',
            columns: 1,
            width: 105,
          }
        );
      }

      if (data.visible == 'V') {
        if (data.dolar) {
          doc.y = y;
          doc.x = 480 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(total_declarado_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 522 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(total_declarado_dolar_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 580 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(credito_orig_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 621 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(credito_dest_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 670 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(contado_orig_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 715 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(contado_dest_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 750 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(total_dolar_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
        } else {
          doc.y = y;
          doc.x = 552 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(credito_orig_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 620 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(credito_dest_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 680 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(contado_orig_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 740 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(contado_dest_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
        }
      }
      y += 20;
    } else if (data.tipoReporte == 'MAD') {
      doc.y = y;
      doc.x = 28;
      doc.text(total + group_len, {
        align: 'center',
        columns: 1,
        width: 100,
      });
      doc.y = y;
      doc.x = 161;
      doc.text('Total Piezas: ' + group_piezas, {
        align: 'center',
        columns: 1,
        width: 67,
      });

      doc.y = y;
      doc.x = 210;
      if (data.neta == 'N') {
        doc.text(
          'Total Neto: ' +
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(group_neta)
              .replace('EUR', '')
              .trim(),
          {
            align: 'center',
            columns: 1,
            width: 105,
          }
        );
      } else {
        doc.text(
          'Total Kgs: ' +
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(group_kgs)
              .replace('EUR', '')
              .trim(),
          {
            align: 'center',
            columns: 1,
            width: 105,
          }
        );
      }

      if (data.visible == 'V') {
        if (data.dolar) {
          doc.y = y;
          doc.x = 480;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(total_declarado_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 522;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(total_declarado_dolar_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 565;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(credito_orig_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 600;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(credito_dest_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 645;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(contado_orig_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 680;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(contado_dest_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 713;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(total_dolar_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
        } else {
          doc.y = y;
          doc.x = 552;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(credito_orig_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 596;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(credito_dest_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 657;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(contado_orig_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 705;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(contado_dest_group)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
        }
      }
      y += 20;
    }

    doc
      .lineCap('butt')
      .moveTo(35, y - 5)
      .lineTo(755, y - 5)
      .stroke();
    doc
      .lineCap('butt')
      .moveTo(35, y + 13)
      .lineTo(755, y + 13)
      .stroke();

    doc.y = y;
    doc.x = 28;
    doc.text('Total Guías: ' + detalle.length, {
      align: 'center',
      columns: 1,
      width: 70,
    });
    doc.y = y;
    doc.x = 161;
    doc.text('Total Piezas: ' + nro_piezas, {
      align: 'center',
      columns: 1,
      width: 67,
    });

    doc.y = y;
    doc.x = 210;
    if (data.neta == 'N') {
      doc.text(
        'Total Neto: ' +
          new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            currencyDisplay: 'code',
          })
            .format(carga_neta)
            .replace('EUR', '')
            .trim(),
        {
          align: 'center',
          columns: 1,
          width: 105,
        }
      );
    } else {
      doc.text(
        'Total Kgs: ' +
          new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            currencyDisplay: 'code',
          })
            .format(peso_kgs)
            .replace('EUR', '')
            .trim(),
        {
          align: 'center',
          columns: 1,
          width: 105,
        }
      );
    }

    if (data.visible == 'V') {
      if (data.tipoReporte == 'APZ') {        
        if (data.dolar) {          
          doc.y = y;
          doc.x = 470 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(total_declarado)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 50,
            }
          );
          doc.y = y;
          doc.x = 522 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(total_declarado_dolar)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 580 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(credito_orig)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 621 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(credito_dest)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 670 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(contado_orig)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 715 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(contado_dest)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 750 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(total_dolar)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
        } else {
          doc.y = y;
          doc.x = 552 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(credito_orig)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 620 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(credito_dest)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 680 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(contado_orig)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 740 - zonaOff;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(contado_dest)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
        }
      } else {
        if (data.dolar) {
          doc.y = y;
          doc.x = 470;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(total_declarado)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 50,
            }
          );
          doc.y = y;
          doc.x = 522;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(total_declarado_dolar)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 565;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(credito_orig)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 600;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(credito_dest)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 645;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(contado_orig)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 680;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(contado_dest)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 713;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(total_dolar)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
        } else {
          doc.y = y;
          doc.x = 552;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(credito_orig)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 596;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(credito_dest)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 657;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(contado_orig)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
          doc.y = y;
          doc.x = 705;
          doc.text(
            new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'code',
            })
              .format(contado_dest)
              .replace('EUR', '')
              .trim(),
            {
              align: 'right',
              columns: 1,
              width: 40,
            }
          );
        }
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
      doc.fontSize(9);
      doc.fillColor('#444444');
      doc.x = 640;
      doc.y = 35;
      doc.text(`Pagina ${i + 1} de ${range.count}`, {
        align: 'right',
        columns: 1,
        width: 100,
      });
    }
  }

  async generateFooter(doc, data) {
    // Definimos un offset base para las cajas.
    let boxesOffsetY = 25;

    if (data.observacion && data.tipo == 'C') {
      boxesOffsetY = -30;
    }

    if (data.chofer) {
      doc
        .lineJoin('square')
        .rect(35, 510 + boxesOffsetY, 350, 50)
        .stroke(); // Caja "Autorizado para Traslado"
      doc.fontSize(10);
      doc.font('Helvetica-Bold')
      doc.y = 515 + boxesOffsetY;
      doc.x = 140;
      doc.text('Autorizado para Traslado');
      doc.y = 535 + boxesOffsetY;
      doc.x = 50;
      doc.fontSize(7);
      doc.text('Chofer: ' + data.chofer, {
        align: 'left',
        columns: 1,
        width: 300,
      });
      doc.y = 545 + boxesOffsetY;
      doc.x = 50;
      doc.text('Vehiculo: ' + data.vehiculo, {
        align: 'left',
        columns: 1,
        width: 320,
      });
    }

    if (data.receptor) {
      doc
        .lineJoin('square')
        .rect(410, 510 + boxesOffsetY, 350, 50)
        .stroke(); // Caja "Agente Receptor Entrega"
      doc.y = 515 + boxesOffsetY;
      doc.x = 510;
      doc.fontSize(10);
      doc.text('Agente Receptor Entrega');
      doc.y = 530 + boxesOffsetY;
      doc.x = 425;
      doc.fontSize(7);
      doc.text(
        'Chofer: ' +
          (data.receptor.nb_receptor
            ? data.receptor.nb_receptor.substring(0, 20)
            : ''),
        {
          align: 'left',
          columns: 1,
          width: 300,
        }
      );
      doc.y = 530 + boxesOffsetY;
      doc.x = 590;
      doc.text('CI: ' + data.receptor.cedula_receptor, {
        align: 'left',
        columns: 1,
        width: 300,
      });
      doc.y = 530 + boxesOffsetY;
      doc.x = 660;
      if (data.receptor.placa) {
        doc.text('Placas: ' + data.receptor.placa, {
          align: 'left',
          columns: 1,
          width: 300,
        });
      }
      doc.y = 540 + boxesOffsetY;
      doc.x = 425;
      doc.text('Vehiculo: ' + data.receptor.vehiculo, {
        align: 'left',
        columns: 1,
        width: 300,
      });
      doc.y = 550 + boxesOffsetY;
      doc.x = 425;
      doc.text('Dirección: ' + utils.truncate(data.receptor.dir_receptor, 70), {
        align: 'left',
        columns: 1,
        width: 350,
      });
    }

    // El bloque de observaciones solo se imprime si hay data.observacion Y data.tipo es 'C'
    if (data.observacion && data.tipo == 'C') {
      doc
        .lineJoin('square')
        .rect(35, 565 + boxesOffsetY, 725, 53)
        .stroke(); // Caja "Observación"
      doc.y = 569 + boxesOffsetY;
      doc.x = 40;
      doc.font('Helvetica-Bold').text('OBSERVACION: ', {
        continued: true,
        width: 715,
        align: 'justify',
      });
      doc.font('Helvetica').text(' ' + utils.truncate(data.observacion, 1000), {
        width: 715,
        align: 'justify',
      });
    }
  }
}

module.exports = RelacionDespachoService;
