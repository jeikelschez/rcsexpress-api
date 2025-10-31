const { models, Sequelize } = require('./../../libs/sequelize');
const moment = require('moment');

const UtilsService = require('./../utils.service');
const utils = new UtilsService();

const siglasOrg =
  '(SELECT siglas' +
  ' FROM agencias ' +
  ' JOIN ciudades ON agencias.cod_ciudad = ciudades.id ' +
  ' WHERE `Mmovimientos`.cod_agencia = agencias.id)';
const siglasDest =
  '(SELECT siglas' +
  ' FROM agencias ' +
  ' JOIN ciudades ON agencias.cod_ciudad = ciudades.id ' +
  ' WHERE `Mmovimientos`.cod_agencia_dest = agencias.id)';
const zonaDesc =
  '(SELECT nb_zona' +
  ' FROM zonas ' +
  ' WHERE `Mmovimientos`.cod_zona_dest = zonas.id)';

class GuiaIndividualService {
  async mainReport(doc, guia) {
    let params = {};
    let cliente_orig;
    let cliente_dest;

    params.id = {
      [Sequelize.Op.eq]: guia,
    };

    const detalleGuia = await models.Mmovimientos.findAll({
      where: params,
      attributes: [
        'cod_cliente_org',
        'cod_cliente_dest',
        'nro_documento',
        'dimensiones',
        'nro_piezas',
        'peso_kgs',
        'persona_recibio',
        'ci_persona_recibio',
        'fecha_emision',
        'fecha_envio',
        'fecha_recepcion',
        'hora_recepcion',
        'estatus_operativo',
        'observacion_entrega',
        'modalidad_pago',
        'cod_agencia_transito',
        'pagado_en',
        'tipo_carga',
        'id_clte_part_orig',
        'id_clte_part_dest',
        [Sequelize.literal(siglasOrg), 'siglas_org'],
        [Sequelize.literal(siglasDest), 'siglas_dest'],
        [Sequelize.literal(zonaDesc), 'zona_desc'],
      ],
      include: [
        {
          model: models.Agentes,
          as: 'agentes_venta',
        },
      ],
      raw: true,
    });

    if (detalleGuia[0].id_clte_part_orig) {
      cliente_orig = await models.Cparticulares.findByPk(
        detalleGuia[0].id_clte_part_orig,
        {
          include: [
            {
              model: models.Agencias,
              as: 'agencias',
              attributes: ['id'],
              include: [
                {
                  model: models.Ciudades,
                  as: 'ciudades',
                  attributes: ['desc_ciudad'],
                },
              ],
            },
            {
              model: models.Ciudades,
              as: 'ciudades',
              attributes: ['desc_ciudad'],
              include: [
                {
                  model: models.Estados,
                  as: 'estados',
                  attributes: ['desc_estado'],
                  include: [
                    {
                      model: models.Paises,
                      as: 'paises',
                      attributes: ['desc_pais'],
                    },
                  ],
                },
              ],
            },
            {
              model: models.Municipios,
              as: 'municipios',
              attributes: ['desc_municipio'],
            },
            {
              model: models.Parroquias,
              as: 'parroquias',
              attributes: ['desc_parroquia'],
            },
            {
              model: models.Localidades,
              as: 'localidades',
              attributes: ['cod_postal'],
            },
          ],
          raw: true,
        }
      );
    } else {
      cliente_orig = await models.Clientes.findByPk(
        detalleGuia[0].cod_cliente_org,
        {
          include: [
            {
              model: models.Agencias,
              as: 'agencias',
              attributes: ['id'],
              include: [
                {
                  model: models.Ciudades,
                  as: 'ciudades',
                  attributes: ['desc_ciudad'],
                },
              ],
            },
            {
              model: models.Ciudades,
              as: 'ciudades',
              attributes: ['desc_ciudad'],
              include: [
                {
                  model: models.Estados,
                  as: 'estados',
                  attributes: ['desc_estado'],
                  include: [
                    {
                      model: models.Paises,
                      as: 'paises',
                      attributes: ['desc_pais'],
                    },
                  ],
                },
              ],
            },
            {
              model: models.Municipios,
              as: 'municipios',
              attributes: ['desc_municipio'],
            },
            {
              model: models.Parroquias,
              as: 'parroquias',
              attributes: ['desc_parroquia'],
            },
            {
              model: models.Localidades,
              as: 'localidades',
              attributes: ['cod_postal'],
            },
          ],
          raw: true,
        }
      );
    }

    if (detalleGuia[0].id_clte_part_dest) {
      cliente_dest = await models.Cparticulares.findByPk(
        detalleGuia[0].id_clte_part_dest,
        {
          include: [
            {
              model: models.Agencias,
              as: 'agencias',
              attributes: ['id'],
              include: [
                {
                  model: models.Ciudades,
                  as: 'ciudades',
                  attributes: ['desc_ciudad'],
                },
              ],
            },
            {
              model: models.Ciudades,
              as: 'ciudades',
              attributes: ['desc_ciudad'],
              include: [
                {
                  model: models.Estados,
                  as: 'estados',
                  attributes: ['desc_estado'],
                  include: [
                    {
                      model: models.Paises,
                      as: 'paises',
                      attributes: ['desc_pais'],
                    },
                  ],
                },
              ],
            },
            {
              model: models.Municipios,
              as: 'municipios',
              attributes: ['desc_municipio'],
            },
            {
              model: models.Parroquias,
              as: 'parroquias',
              attributes: ['desc_parroquia'],
            },
            {
              model: models.Localidades,
              as: 'localidades',
              attributes: ['cod_postal'],
            },
          ],
          raw: true,
        }
      );
    } else {
      cliente_dest = await models.Clientes.findByPk(
        detalleGuia[0].cod_cliente_dest,
        {
          include: [
            {
              model: models.Agencias,
              as: 'agencias',
              attributes: ['id'],
              include: [
                {
                  model: models.Ciudades,
                  as: 'ciudades',
                  attributes: ['desc_ciudad'],
                },
              ],
            },
            {
              model: models.Ciudades,
              as: 'ciudades',
              attributes: ['desc_ciudad'],
              include: [
                {
                  model: models.Estados,
                  as: 'estados',
                  attributes: ['desc_estado'],
                  include: [
                    {
                      model: models.Paises,
                      as: 'paises',
                      attributes: ['desc_pais'],
                    },
                  ],
                },
              ],
            },
            {
              model: models.Municipios,
              as: 'municipios',
              attributes: ['desc_municipio'],
            },
            {
              model: models.Parroquias,
              as: 'parroquias',
              attributes: ['desc_parroquia'],
            },
            {
              model: models.Localidades,
              as: 'localidades',
              attributes: ['cod_postal'],
            },
          ],
          raw: true,
        }
      );
    }

    detalleGuia.cliente_orig = cliente_orig;
    detalleGuia.cliente_dest = cliente_dest;

    await this.generateCustomerInformation(doc, detalleGuia);
  }

  async generateCustomerInformation(doc, detalleGuia) {
    let y = 17;
    for (var x = 0; x < 3; x++) {
      doc.font('Helvetica');
      doc.lineWidth(0.5);
      doc.fontSize(7);
      doc.strokeColor('grey');
      doc
        .lineJoin('miter')
        .rect(23, y + 2, 80, 28)
        .stroke();
      doc.strokeColor('white');
      doc.lineWidth(3);
      doc
        .lineCap('butt')
        .moveTo(31, y + 2)
        .lineTo(84, y + 2)
        .stroke();
      doc.text('Fecha Emisión', 35, y - 1);
      doc.fontSize(11);
      doc.y = y + 12;
      doc.x = 23;
      doc.text(moment(detalleGuia[0].fecha_emision).format('DD/MM/YYYY'), {
        align: 'center',
        columns: 1,
        width: 80,
      });

      doc.lineWidth(0.5);
      doc.fontSize(7);
      doc.strokeColor('grey');
      doc
        .lineJoin('miter')
        .rect(108, y + 2, 40, 28)
        .stroke();
      doc.strokeColor('white');
      doc.lineWidth(3);
      doc
        .lineCap('butt')
        .moveTo(113, y + 2)
        .lineTo(134, y + 2)
        .stroke();
      doc.text('Peso', 116, y - 1);
      doc.fontSize(9);
      doc.y = y + 13;
      doc.x = 108;
      doc.text(utils.formatNumber(detalleGuia[0].peso_kgs), {
        align: 'center',
        columns: 1,
        width: 40,
      });

      doc.lineWidth(0.5);
      doc.fontSize(7);
      doc.strokeColor('grey');
      doc
        .lineJoin('miter')
        .rect(153, y + 2, 40, 28)
        .stroke();
      doc.strokeColor('white');
      doc.lineWidth(3);
      doc
        .lineCap('butt')
        .moveTo(156, y + 2)
        .lineTo(186, y + 2)
        .stroke();
      doc.text('# Piezas', 158, y - 1);
      doc.fontSize(11);
      doc.y = y + 12;
      doc.x = 153;
      doc.text(detalleGuia[0].nro_piezas, {
        align: 'center',
        columns: 1,
        width: 40,
      });

      doc.lineWidth(0.5);
      doc.fontSize(7);
      doc.strokeColor('grey');
      doc
        .lineJoin('miter')
        .rect(198, y + 2, 80, 28)
        .stroke();
      doc.strokeColor('white');
      doc.lineWidth(3);
      doc
        .lineCap('butt')
        .moveTo(202, y + 2)
        .lineTo(260, y + 2)
        .stroke();
      doc.text('Origen / Destino', 205, y - 1);
      doc.fontSize(11);
      doc.y = y + 12;
      doc.x = 198;
      doc.text(detalleGuia[0].siglas_org + '/' + detalleGuia[0].siglas_dest, {
        align: 'center',
        columns: 1,
        width: 80,
      });

      doc.font('Helvetica-Oblique');
      doc.lineWidth(0.5);
      doc.strokeColor('grey');
      doc
        .lineJoin('miter')
        .rect(283, y + 2, 153, 28)
        .stroke();
      doc.fontSize(8);
      doc.y = y + 5;
      doc.x = 283;
      doc.text('Se agradece verificar el embalaje y', {
        align: 'center',
        columns: 1,
        width: 153,
      });
      doc.y = y + 13;
      doc.x = 283;
      doc.text('cantidad de bultos recibidos, pasadas las', {
        align: 'center',
        columns: 1,
        width: 153,
      });
      doc.y = y + 21;
      doc.x = 283;
      doc.text('24 horas no se aceptan reclamos', {
        align: 'center',
        columns: 1,
        width: 153,
      });

      doc.font('Helvetica-Bold');
      doc.fontSize(16);
      doc.text('GUIA Nº ' + detalleGuia[0].nro_documento, 440, y + 10);

      doc.lineWidth(0.5);
      doc.fontSize(7);
      doc.strokeColor('grey');
      doc
        .lineJoin('miter')
        .rect(23, y + 36, 280, 130)
        .stroke();
      doc.strokeColor('white');
      doc.lineWidth(3);
      doc
        .lineCap('butt')
        .moveTo(30, y + 36)
        .lineTo(68, y + 36)
        .stroke();
      doc.text('Remitente', 32, y + 33);

      doc.fontSize(8);
      doc.font('Helvetica-Bold');
      doc.y = y + 45;
      doc.x = 23;
      doc.text(detalleGuia.cliente_orig.nb_cliente, {
        align: 'center',
        columns: 1,
        width: 280,
      });

      doc.fontSize(7);
      doc.font('Helvetica');
      doc.y = y + 60;
      doc.x = 28;
      doc.text(
        detalleGuia.cliente_orig.rif_cedula
          ? detalleGuia.cliente_orig.rif_cedula
          : detalleGuia.cliente_orig.rif_ci,
        {
          align: 'left',
          columns: 1,
          width: 270,
        }
      );
      doc.y = y + 60;
      doc.x = 28;
      doc.text(
        !detalleGuia.cliente_orig.dir_correo ||
          detalleGuia.cliente_orig.dir_correo == '0'
          ? ''
          : detalleGuia.cliente_orig.dir_correo.substr(0, 30),
        {
          align: 'right',
          columns: 1,
          width: 270,
        }
      );
      doc.y = y + 72;
      doc.x = 28;
      doc.text(
        detalleGuia.cliente_orig.tlf_cliente
          ? detalleGuia.cliente_orig.tlf_cliente
          : detalleGuia.cliente_orig.telefonos,
        {
          align: 'left',
          columns: 1,
          width: 270,
        }
      );
      doc.y = y + 84;
      doc.x = 28;
      doc.text(
        detalleGuia.cliente_orig.dir_fiscal
          ? detalleGuia.cliente_orig.dir_fiscal
          : detalleGuia.cliente_orig.direccion,
        {
          align: 'left',
          columns: 1,
          width: 270,
        }
      );
      doc.y = y + 108;
      doc.x = 40;
      doc.text(detalleGuia.cliente_orig['parroquias.desc_parroquia'], {
        align: 'left',
        columns: 1,
        width: 100,
      });
      doc.y = y + 108;
      doc.x = 150;
      doc.text(detalleGuia.cliente_orig['municipios.desc_municipio'], {
        align: 'left',
        columns: 1,
        width: 100,
      });
      doc.y = y + 120;
      doc.x = 40;
      doc.text(detalleGuia.cliente_orig['ciudades.desc_ciudad'], {
        align: 'left',
        columns: 1,
        width: 100,
      });
      doc.y = y + 120;
      doc.x = 150;
      doc.text(detalleGuia.cliente_orig['ciudades.estados.desc_estado'], {
        align: 'left',
        columns: 1,
        width: 100,
      });
      doc.y = y + 132;
      doc.x = 40;
      doc.text(detalleGuia.cliente_orig['localidades.cod_postal'], {
        align: 'left',
        columns: 1,
        width: 100,
      });
      doc.y = y + 132;
      doc.x = 150;
      doc.text(detalleGuia.cliente_orig['ciudades.estados.paises.desc_pais'], {
        align: 'left',
        columns: 1,
        width: 100,
      });
      doc.fontSize(14);
      doc.y = y + 150;
      doc.x = 23;
      doc.text(detalleGuia.cliente_orig['agencias.ciudades.desc_ciudad'], {
        align: 'center',
        columns: 1,
        width: 280,
      });

      doc.lineWidth(0.5);
      doc.fontSize(7);
      doc.strokeColor('grey');
      doc
        .lineJoin('miter')
        .rect(308, y + 36, 280, 130)
        .stroke();
      doc.strokeColor('white');
      doc.lineWidth(3);
      doc
        .lineCap('butt')
        .moveTo(315, y + 36)
        .lineTo(360, y + 36)
        .stroke();
      doc.text('Destinatario', 317, y + 33);

      doc.fontSize(8);
      doc.font('Helvetica-Bold');
      doc.y = y + 45;
      doc.x = 308;
      doc.text(detalleGuia.cliente_dest.nb_cliente, {
        align: 'center',
        columns: 1,
        width: 280,
      });

      doc.fontSize(7);
      doc.font('Helvetica');
      doc.y = y + 60;
      doc.x = 313;
      doc.text(
        detalleGuia.cliente_dest.rif_ci
          ? detalleGuia.cliente_dest.rif_ci
          : detalleGuia.cliente_dest.rif_cedula,
        {
          align: 'left',
          columns: 1,
          width: 270,
        }
      );
      doc.y = y + 72;
      doc.x = 313;
      doc.text(
        detalleGuia.cliente_dest.telefonos
          ? detalleGuia.cliente_dest.telefonos
          : detalleGuia.cliente_dest.tlf_cliente,
        {
          align: 'left',
          columns: 1,
          width: 270,
        }
      );
      doc.y = y + 84;
      doc.x = 313;
      doc.text(
        detalleGuia.cliente_dest.direccion
          ? detalleGuia.cliente_dest.direccion
          : detalleGuia.cliente_dest.dir_fiscal,
        {
          align: 'left',
          columns: 1,
          width: 270,
        }
      );
      doc.y = y + 108;
      doc.x = 330;
      doc.text(detalleGuia.cliente_dest['parroquias.desc_parroquia'], {
        align: 'left',
        columns: 1,
        width: 100,
      });
      doc.y = y + 108;
      doc.x = 440;
      doc.text(detalleGuia.cliente_dest['municipios.desc_municipio'], {
        align: 'left',
        columns: 1,
        width: 130,
      });
      doc.y = y + 120;
      doc.x = 330;
      doc.text(detalleGuia.cliente_dest['ciudades.desc_ciudad'], {
        align: 'left',
        columns: 1,
        width: 100,
      });
      doc.y = y + 120;
      doc.x = 440;
      doc.text(detalleGuia.cliente_dest['ciudades.estados.desc_estado'], {
        align: 'left',
        columns: 1,
        width: 100,
      });
      doc.y = y + 132;
      doc.x = 330;
      doc.text(detalleGuia.cliente_dest['localidades.cod_postal'], {
        align: 'left',
        columns: 1,
        width: 100,
      });
      doc.y = y + 132;
      doc.x = 440;
      doc.text(detalleGuia.cliente_dest['ciudades.estados.paises.desc_pais'], {
        align: 'left',
        columns: 1,
        width: 100,
      });
      doc.fontSize(14);
      doc.y = y + 150;
      doc.x = 308;
      doc.text(detalleGuia[0].zona_desc, {
        align: 'center',
        columns: 1,
        width: 280,
      });

      doc.lineWidth(0.5);
      doc.fontSize(7);
      doc.strokeColor('grey');
      doc
        .lineJoin('miter')
        .rect(23, y + 172, 115, 33)
        .stroke();
      doc.strokeColor('white');
      doc.lineWidth(3);
      doc
        .lineCap('butt')
        .moveTo(30, y + 172)
        .lineTo(97, y + 172)
        .stroke();
      doc.text('Modalidad de Pago', 32, y + 169);
      let modalidad = '';
      if (
        detalleGuia[0].modalidad_pago == 'CO' &&
        detalleGuia[0].pagado_en == 'O'
      ) {
        modalidad = 'CONTADO ORIGEN';
      } else if (
        detalleGuia[0].modalidad_pago == 'CO' &&
        detalleGuia[0].pagado_en == 'D'
      ) {
        modalidad = 'CONTADO DESTINO';
      } else if (
        detalleGuia[0].modalidad_pago == 'CR' &&
        detalleGuia[0].pagado_en == 'O'
      ) {
        modalidad = 'CREDITO ORIGEN';
      } else if (
        detalleGuia[0].modalidad_pago == 'CR' &&
        detalleGuia[0].pagado_en == 'D'
      ) {
        modalidad = 'CREDITO DESTINO';
      }
      doc.fontSize(11);
      doc.y = y + 185;
      doc.x = 28;
      doc.text(modalidad, {
        align: 'left',
        columns: 1,
        width: 112,
      });

      doc.lineWidth(0.5);
      doc.fontSize(7);
      doc.strokeColor('grey');
      doc
        .lineJoin('miter')
        .rect(143, y + 172, 102, 33)
        .stroke();
      doc.strokeColor('white');
      doc.lineWidth(3);
      doc
        .lineCap('butt')
        .moveTo(150, y + 172)
        .lineTo(227, y + 172)
        .stroke();
      doc.text('Descripcion del Envio', 152, y + 169);
      let tipo_carga;
      if (detalleGuia[0].tipo_carga == 'SB') {
        tipo_carga = 'SOBRE';
      } else {
        tipo_carga = 'PAQUETE';
      }
      doc.fontSize(11);
      doc.y = y + 185;
      doc.x = 148;
      doc.text(tipo_carga, {
        align: 'left',
        columns: 1,
        width: 97,
      });

      doc.lineWidth(0.5);
      doc.fontSize(7);
      doc.strokeColor('grey');
      doc
        .lineJoin('miter')
        .rect(23, y + 210, 222, 32)
        .stroke();
      doc.strokeColor('white');
      doc.lineWidth(3);
      doc
        .lineCap('butt')
        .moveTo(30, y + 210)
        .lineTo(100, y + 210)
        .stroke();
      doc.text('Facturas Asociadas', 32, y + 207);
      doc.fontSize(8);
      doc.y = y + 222;
      doc.x = 28;
      doc.text(
        detalleGuia[0].dimensiones
          ? detalleGuia[0].dimensiones.substr(0, 105)
          : '',
        {
          align: 'left',
          columns: 1,
          width: 217,
        }
      );

      doc.lineWidth(0.5);
      doc.fontSize(7);
      doc.strokeColor('grey');
      doc
        .lineJoin('miter')
        .rect(250, y + 172, 338, 70)
        .stroke();
      doc.strokeColor('white');
      doc.lineWidth(3);
      doc
        .lineCap('butt')
        .moveTo(257, y + 172)
        .lineTo(304, y + 172)
        .stroke();
      doc.text('Recibido por', 259, y + 169);
      doc.strokeColor('grey');
      doc.lineWidth(0.5);
      doc
        .lineCap('butt')
        .moveTo(260, y + 200)
        .lineTo(450, y + 200)
        .stroke();
      doc
        .lineCap('butt')
        .moveTo(260, y + 225)
        .lineTo(350, y + 225)
        .stroke();
      doc
        .lineCap('butt')
        .moveTo(355, y + 225)
        .lineTo(450, y + 225)
        .stroke();
      doc
        .lineCap('butt')
        .moveTo(455, y + 190)
        .lineTo(455, y + 235)
        .stroke();
      doc.y = y + 203;
      doc.x = 260;
      doc.text('Nombre y Apellido', {
        align: 'left',
        columns: 1,
        width: 190,
      });
      doc.y = y + 228;
      doc.x = 260;
      doc.text('Cédula', {
        align: 'left',
        columns: 1,
        width: 90,
      });
      doc.y = y + 228;
      doc.x = 462;
      doc.text('Firma y Sello', {
        align: 'left',
        columns: 1,
        width: 90,
      });
      doc.y = y + 228;
      doc.x = 355;
      doc.text('Fecha', {
        align: 'left',
        columns: 1,
        width: 90,
      });
      doc.fontSize(9);
      doc.font('Helvetica-Bold');
      doc.y = y + 175;
      doc.x = 250;
      doc.text('DEVOLVER ESTE DOCUMENTO CON DATOS LEGIBLES', {
        align: 'center',
        columns: 1,
        width: 335,
      });

      y += 255;
    }

    doc.lineWidth(1);
    doc.strokeColor('black');
    doc.lineCap('butt').moveTo(20, 265).lineTo(590, 265).stroke();

    doc.lineWidth(1);
    doc.strokeColor('black');
    doc.lineCap('butt').moveTo(20, 520).lineTo(590, 520).stroke();
  }
}

module.exports = GuiaIndividualService;
