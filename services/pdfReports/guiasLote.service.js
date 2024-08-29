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

class GuiasLoteService {
  async mainReport(doc, tipo, data) {
    let params = {};
    data = JSON.parse(data);

    params.id = {
      [Sequelize.Op.in]: data.toString().split(','),
    };

    const detalles = await models.Mmovimientos.findAll({
      where: params,
      attributes: [
        'cod_cliente_org',
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
        [Sequelize.literal(siglasOrg), 'siglas_org'],
        [Sequelize.literal(siglasDest), 'siglas_dest'],
      ],
      include: [
        {
          model: models.Clientes,
          as: 'clientes_org',
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
        },
        {
          model: models.Cparticulares,
          as: 'cliente_particular',
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
        },
        {
          model: models.Agentes,
          as: 'agentes_venta',
        },
      ],
      order: [['nro_documento', 'ASC']],
      raw: true,
    });

    await this.generateCustomerInformation(doc, tipo, detalles);
  }

  async generateCustomerInformation(doc, tipo, detalles) {
    for (var item = 0; item < detalles.length; item++) {
      if (tipo == 1) {
        let y = 17;
        for (var x = 0; x < 3; x++) {
          doc.fontSize(11);
          doc.font('Helvetica-Bold');
          doc.text('GUÍA DE PORTE', 30, y - 7);
          doc.fontSize(12);
          doc.text('- GUÍA DE CARGA', 120, y - 8);
          doc.fontSize(18);
          doc.text('N° ' + detalles[item].nro_documento, 70, y + 5);
          doc.fontSize(10);
          doc.text('CONCESIÓN POSTAL Nº 20-22-15-40', 40, y + 23);
          doc.fontSize(7);
          doc.font('Helvetica');
          doc.text('PARA SEGUIMIENTO DE ESTA GUÍA, CONSULTA', 49, y + 35);
          doc.text('NUESTRA PÁGINA WEB', 51, y + 43);
          doc.font('Helvetica-Bold');
          doc.text('www.rcsexpress.com', 134, y + 43);
          doc.font('Helvetica');
          doc.text('EMAIL:', 70, y + 51);
          doc.font('Helvetica-Bold');
          doc.text('rcsexpress.ve@gmail.com', 95, y + 51);

          doc.image('./img/logo_rc.png', 240, y - 7, { width: 65, height: 65 });

          doc.fontSize(12);
          doc.font('Helvetica-Bold');
          doc.text('R.C.S. EXPRESS, S.A', 308, y - 7);

          doc.fontSize(7);
          doc.font('Helvetica');
          doc.y = y + 6;
          doc.x = 308;
          doc.text(
            'AV. 74 C.C. ARAURIMA, NIVEL PB LOCAL Nº 6 URB. TERRAZAS DE CASTILLITO SAN DIEGO ESTADO CARABOBO, ZONA POSTAL 2006',
            {
              align: 'left',
              columns: 1,
              width: 170,
            }
          );
          doc.text('TELÉFONOS: (0241) 871.75.63 / 871.68.67', 308, y + 31);
          doc.text('CELULAR: (0414) 435.68.05 - (0414) 404.08.62', 308, y + 40);

          doc.font('Helvetica-Bold');
          doc.text('RIF. J-31028463-6', 308, y + 50);

          doc.lineWidth(0.5);
          doc.fontSize(7);
          doc.strokeColor('grey');
          doc.lineJoin('miter').rect(508, y, 80, 20).stroke();
          doc.strokeColor('white');
          doc.lineWidth(3);
          doc.lineCap('butt').moveTo(511, y).lineTo(543, y).stroke();
          doc.text('# Piezas', 513, y - 3);
          doc.fontSize(11);
          doc.y = y + 6;
          doc.x = 508;
          doc.text(detalles[item].nro_piezas, {
            align: 'center',
            columns: 1,
            width: 80,
          });

          doc.lineWidth(0.5);
          doc.fontSize(7);
          doc.strokeColor('grey');
          doc
            .lineJoin('miter')
            .rect(508, y + 25, 80, 20)
            .stroke();
          doc.strokeColor('white');
          doc.lineWidth(3);
          doc
            .lineCap('butt')
            .moveTo(511, y + 25)
            .lineTo(531, y + 25)
            .stroke();
          doc.text('Peso', 513, y + 22);
          doc.fontSize(11);
          doc.y = y + 31;
          doc.x = 508;
          doc.text(utils.formatNumber(detalles[item].peso_kgs), {
            align: 'center',
            columns: 1,
            width: 80,
          });

          doc.fontSize(9);
          doc.text('Fecha: ', 510, y + 50);

          doc.font('Helvetica');
          doc.y = y + 50;
          doc.x = 533;
          doc.text(moment(detalles[item].fecha_emision).format('DD/MM/YYYY'), {
            align: 'center',
            columns: 1,
            width: 60,
          });

          doc.lineWidth(0.5);
          doc.fontSize(7);
          doc.strokeColor('grey');
          doc
            .lineJoin('miter')
            .rect(23, y + 64, 280, 130)
            .stroke();
          doc.strokeColor('white');
          doc.lineWidth(3);
          doc
            .lineCap('butt')
            .moveTo(30, y + 64)
            .lineTo(193, y + 64)
            .stroke();
          doc.text('REMITENTE (PERSONA NATURAL O JURÍDICA):', 32, y + 61);
          doc.fontSize(8);
          doc.font('Helvetica-Bold');
          doc.y = y + 73;
          doc.x = 28;
          doc.text(detalles[item]['clientes_org.razon_social'], {
            align: 'left',
            columns: 1,
            width: 270,
          });
          doc.fontSize(7);
          doc.font('Helvetica-Bold');
          doc.y = y + 92;
          doc.x = 28;
          doc.text('C.I. / R.I.F.:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.font('Helvetica-Bold');
          doc.y = y + 92;
          doc.x = 190;
          doc.text('CORREO:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.font('Helvetica');
          doc.y = y + 92;
          doc.x = 100;
          doc.text(detalles[item]['clientes_org.rif_cedula'], {
            align: 'left',
            columns: 1,
            width: 270,
          });
          doc.font('Helvetica-Bold');
          doc.y = y + 104;
          doc.x = 28;
          doc.text('TELÉFONOS:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.font('Helvetica');
          doc.y = y + 104;
          doc.x = 100;
          doc.text(detalles[item]['clientes_org.tlf_cliente'], {
            align: 'left',
            columns: 1,
            width: 270,
          });
          doc.font('Helvetica-Bold');
          doc.y = y + 116;
          doc.x = 28;
          doc.text('LOCALIDAD:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.y = y + 128;
          doc.x = 28;
          doc.text('INMUEBLE:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.font('Helvetica');
          doc.y = y + 116;
          doc.x = 100;
          doc.text(
            utils.truncate(detalles[item]['clientes_org.dir_fiscal'], 132),
            {
              align: 'left',
              columns: 1,
              width: 200,
            }
          );
          doc.font('Helvetica-Bold');
          doc.y = y + 144;
          doc.x = 28;
          doc.text('PARROQUIA:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.font('Helvetica');
          doc.y = y + 144;
          doc.x = 100;
          doc.text(detalles[item]['clientes_org.parroquias.desc_parroquia'], {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.font('Helvetica-Bold');
          doc.y = y + 144;
          doc.x = 190;
          doc.text('MUNICIPIO:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.font('Helvetica');
          doc.y = y + 144;
          doc.x = 235;
          doc.text(detalles[item]['clientes_org.municipios.desc_municipio'], {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.font('Helvetica-Bold');
          doc.y = y + 155;
          doc.x = 28;
          doc.text('CIUDAD O PUEBLO:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.font('Helvetica');
          doc.y = y + 155;
          doc.x = 100;
          doc.text(detalles[item]['clientes_org.ciudades.desc_ciudad'], {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.font('Helvetica-Bold');
          doc.y = y + 155;
          doc.x = 190;
          doc.text('ESTADO:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.font('Helvetica');
          doc.y = y + 155;
          doc.x = 235;
          doc.text(
            detalles[item]['clientes_org.ciudades.estados.desc_estado'],
            {
              align: 'left',
              columns: 1,
              width: 100,
            }
          );
          doc.font('Helvetica-Bold');
          doc.y = y + 166;
          doc.x = 28;
          doc.text('ZONA POSTAL:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.font('Helvetica');
          doc.y = y + 166;
          doc.x = 100;
          doc.text(detalles[item]['clientes_org.localidades.cod_postal'], {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.font('Helvetica-Bold');
          doc.y = y + 166;
          doc.x = 190;
          doc.text('PAÍS:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.font('Helvetica');
          doc.y = y + 166;
          doc.x = 235;
          doc.text(
            detalles[item]['clientes_org.ciudades.estados.paises.desc_pais'],
            {
              align: 'left',
              columns: 1,
              width: 100,
            }
          );
          doc.fontSize(14);
          doc.y = y + 178;
          doc.x = 23;
          doc.text(
            'ORIGEN: ' +
              detalles[item]['clientes_org.agencias.ciudades.desc_ciudad'] +
              ' (' +
              detalles[item].siglas_dest +
              ')',
            {
              align: 'center',
              columns: 1,
              width: 280,
            }
          );

          doc.lineWidth(0.5);
          doc.fontSize(7);
          doc.strokeColor('grey');
          doc
            .lineJoin('miter')
            .rect(308, y + 64, 280, 130)
            .stroke();
          doc.strokeColor('white');
          doc.lineWidth(3);
          doc
            .lineCap('butt')
            .moveTo(315, y + 64)
            .lineTo(487, y + 64)
            .stroke();
          doc.text('DESTINATARIO (PERSONA NATURAL O JURÍDICA):', 317, y + 61);
          doc.fontSize(8);
          doc.font('Helvetica-Bold');
          doc.y = y + 73;
          doc.x = 313;
          doc.text(detalles[item]['cliente_particular.nb_cliente'], {
            align: 'left',
            columns: 1,
            width: 270,
          });
          doc.fontSize(7);
          doc.font('Helvetica-Bold');
          doc.y = y + 92;
          doc.x = 313;
          doc.text('C.I. / R.I.F.:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.font('Helvetica-Bold');
          doc.y = y + 92;
          doc.x = 475;
          doc.text('CORREO:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.font('Helvetica');
          doc.y = y + 92;
          doc.x = 385;
          doc.text(detalles[item]['cliente_particular.rif_ci'], {
            align: 'left',
            columns: 1,
            width: 270,
          });
          doc.font('Helvetica-Bold');
          doc.y = y + 104;
          doc.x = 313;
          doc.text('TELÉFONOS:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.font('Helvetica');
          doc.y = y + 104;
          doc.x = 385;
          doc.text(detalles[item]['cliente_particular.telefonos'], {
            align: 'left',
            columns: 1,
            width: 270,
          });
          doc.font('Helvetica-Bold');
          doc.y = y + 116;
          doc.x = 313;
          doc.text('LOCALIDAD:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.y = y + 128;
          doc.x = 313;
          doc.text('INMUEBLE:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.font('Helvetica');
          doc.y = y + 116;
          doc.x = 385;
          doc.text(
            utils.truncate(detalles[item]['cliente_particular.direccion'], 132),
            {
              align: 'left',
              columns: 1,
              width: 200,
            }
          );
          doc.font('Helvetica-Bold');
          doc.y = y + 144;
          doc.x = 313;
          doc.text('PARROQUIA:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.font('Helvetica');
          doc.y = y + 144;
          doc.x = 385;
          doc.text(
            detalles[item]['cliente_particular.parroquias.desc_parroquia'],
            {
              align: 'left',
              columns: 1,
              width: 100,
            }
          );
          doc.font('Helvetica-Bold');
          doc.y = y + 144;
          doc.x = 475;
          doc.text('MUNICIPIO:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.font('Helvetica');
          doc.y = y + 144;
          doc.x = 520;
          doc.text(
            detalles[item]['cliente_particular.municipios.desc_municipio'],
            {
              align: 'left',
              columns: 1,
              width: 130,
            }
          );
          doc.font('Helvetica-Bold');
          doc.y = y + 155;
          doc.x = 313;
          doc.text('CIUDAD O PUEBLO:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.font('Helvetica');
          doc.y = y + 155;
          doc.x = 385;
          doc.text(detalles[item]['cliente_particular.ciudades.desc_ciudad'], {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.font('Helvetica-Bold');
          doc.y = y + 155;
          doc.x = 475;
          doc.text('ESTADO:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.font('Helvetica');
          doc.y = y + 155;
          doc.x = 520;
          doc.text(
            detalles[item]['cliente_particular.ciudades.estados.desc_estado'],
            {
              align: 'left',
              columns: 1,
              width: 100,
            }
          );
          doc.font('Helvetica-Bold');
          doc.y = y + 166;
          doc.x = 313;
          doc.text('ZONA POSTAL:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.font('Helvetica');
          doc.y = y + 166;
          doc.x = 385;
          doc.text(
            detalles[item]['cliente_particular.localidades.cod_postal'],
            {
              align: 'left',
              columns: 1,
              width: 100,
            }
          );
          doc.font('Helvetica-Bold');
          doc.y = y + 166;
          doc.x = 475;
          doc.text('PAÍS:', {
            align: 'left',
            columns: 1,
            width: 70,
          });
          doc.font('Helvetica');
          doc.y = y + 166;
          doc.x = 520;
          doc.text(
            detalles[item][
              'cliente_particular.ciudades.estados.paises.desc_pais'
            ],
            {
              align: 'left',
              columns: 1,
              width: 100,
            }
          );
          doc.fontSize(14);
          doc.y = y + 178;
          doc.x = 308;
          doc.text(
            'DESTINO: ' +
              detalles[item][
                'cliente_particular.agencias.ciudades.desc_ciudad'
              ] +
              ' (' +
              detalles[item].siglas_dest +
              ')',
            {
              align: 'center',
              columns: 1,
              width: 280,
            }
          );

          doc.font('Helvetica-Bold');
          doc.fontSize(9);
          doc.text('Nombre:', 28, y + 210);
          doc.text('Apellido:', 28, y + 227);
          doc.text('Fecha:', 28, y + 244);
          doc.text('Hora:', 28, y + 261);
          doc.text('Cédula:', 28, y + 278);
          doc.text('Firma y Sello', 230, y + 278); 
          
          doc.text('Modalidad de Pago:', 313, y + 210);
          doc.text('Descripcion del Envío:', 313, y + 227);
          doc.text('Valor Declarado:', 313, y + 244);
          doc.text('Franqueo Postal:', 313, y + 261);
          doc.text('Precio del Envío:', 313, y + 278);

          doc.font('Helvetica');
          let modalidad = '';
          if (
            detalles[item].modalidad_pago == 'CO' &&
            detalles[item].pagado_en == 'O'
          ) {
            modalidad = 'CONTADO ORIGEN';
          } else if (
            detalles[item].modalidad_pago == 'CO' &&
            detalles[item].pagado_en == 'D'
          ) {
            modalidad = 'CONTADO DESTINO';
          } else if (
            detalles[item].modalidad_pago == 'CR' &&
            detalles[item].pagado_en == 'O'
          ) {
            modalidad = 'CREDITO ORIGEN';
          } else if (
            detalles[item].modalidad_pago == 'CR' &&
            detalles[item].pagado_en == 'D'
          ) {
            modalidad = 'CREDITO DESTINO';
          }
          doc.text(modalidad, 412, y + 210);

          let tipo_carga;
          if (detalles[item].tipo_carga == 'SB') {
            tipo_carga = 'SOBRE';
          } else {
            tipo_carga = 'PAQUETE';
          }
          doc.text(tipo_carga, 412, y + 227);

          doc.lineWidth(0.5);
          doc.fontSize(7);
          doc.strokeColor('grey');
          doc
            .lineJoin('miter')
            .rect(23, y + 200, 280, 90)
            .stroke();
          doc.strokeColor('white');
          doc.lineWidth(3);
          doc.font('Helvetica');
          doc
            .lineCap('butt')
            .moveTo(30, y + 200)
            .lineTo(105, y + 200)
            .stroke();
          doc.text('Detalles de Recepción', 32, y + 197);

          doc.lineWidth(0.5);
          doc.fontSize(7);
          doc.strokeColor('grey');
          doc
            .lineJoin('miter')
            .rect(308, y + 200, 190, 90)
            .stroke();
          doc.strokeColor('white');
          doc.lineWidth(3);
          doc
            .lineCap('butt')
            .moveTo(315, y + 200)
            .lineTo(375, y + 200)
            .stroke();
          doc.font('Helvetica');
          doc.text('Detalles del Envío', 317, y + 197);

          doc.image('./img/qrcode.jpg', 505, y + 203, {
            width: 80,
            height: 80,
          });

          doc.text(detalles[item].dimensiones, 90, y + 295);
          doc.font('Helvetica-Bold');
          doc.text('OBSERVACIONES:', 23, y + 295);
          doc.text(
            'NO SE ACEPTAN RECLAMOS DESPUES DE 24 HORAS DE LA RECEPCIÓN DE LA MERCANCIA',
            147,
            y + 308
          );

          y += 330;
        }

        doc.lineWidth(1);
        doc.strokeColor('grey');
        doc.lineCap('butt').moveTo(20, 335).lineTo(590, 335).stroke();

        doc.lineWidth(1);
        doc.strokeColor('grey');
        doc.lineCap('butt').moveTo(20, 665).lineTo(590, 665).stroke();
      } else {
        // Guias sin Preimpreso
        let y = 17;
        for (var x = 0; x < 3; x++) {
          doc.image('./img/logo_rc.png', 25, y + 8, { width: 20, height: 20 });
          doc.fontSize(7);
          doc.font('Helvetica-Bold');
          doc.text('RCS EXPRESS, S.A', 50, y + 11);
          doc.text('RIF. J-31028463-6', 50, y + 21);
          doc.fontSize(11);
          doc.text('GUIA DE CARGA Nº', 130, y + 13);
          doc.fontSize(16);
          doc.text(detalles[item].nro_documento, 240, y + 11);

          doc.lineWidth(0.5);
          doc.fontSize(7);
          doc.strokeColor('grey');
          doc
            .lineJoin('miter')
            .rect(333, y + 3, 80, 28)
            .stroke();
          doc.strokeColor('white');
          doc.lineWidth(3);
          doc
            .lineCap('butt')
            .moveTo(341, y + 3)
            .lineTo(394, y + 3)
            .stroke();
          doc.text('Fecha Emisión', 343, y);
          doc.fontSize(11);
          doc.y = y + 13;
          doc.x = 333;
          doc.text(moment(detalles[item].fecha_emision).format('DD/MM/YYYY'), {
            align: 'center',
            columns: 1,
            width: 80,
          });

          doc.lineWidth(0.5);
          doc.fontSize(7);
          doc.font('Helvetica');
          doc.strokeColor('grey');
          doc
            .lineJoin('miter')
            .rect(418, y + 3, 40, 28)
            .stroke();
          doc.strokeColor('white');
          doc.lineWidth(3);
          doc
            .lineCap('butt')
            .moveTo(423, y + 3)
            .lineTo(444, y + 3)
            .stroke();
          doc.text('Peso', 425, y);
          doc.fontSize(11);
          doc.y = y + 13;
          doc.x = 418;
          doc.text(utils.formatNumber(detalles[item].peso_kgs), {
            align: 'center',
            columns: 1,
            width: 40,
          });

          doc.lineWidth(0.5);
          doc.fontSize(7);
          doc.strokeColor('grey');
          doc
            .lineJoin('miter')
            .rect(463, y + 3, 40, 28)
            .stroke();
          doc.strokeColor('white');
          doc.lineWidth(3);
          doc
            .lineCap('butt')
            .moveTo(466, y + 3)
            .lineTo(496, y + 3)
            .stroke();
          doc.text('# Piezas', 467, y);
          doc.fontSize(11);
          doc.y = y + 13;
          doc.x = 463;
          doc.text(detalles[item].nro_piezas, {
            align: 'center',
            columns: 1,
            width: 40,
          });

          doc.lineWidth(0.5);
          doc.fontSize(7);
          doc.strokeColor('grey');
          doc
            .lineJoin('miter')
            .rect(508, y + 3, 80, 28)
            .stroke();
          doc.strokeColor('white');
          doc.lineWidth(3);
          doc
            .lineCap('butt')
            .moveTo(512, y + 3)
            .lineTo(570, y + 3)
            .stroke();
          doc.text('Origen / Destino', 514, y);
          doc.fontSize(11);
          doc.y = y + 13;
          doc.x = 508;
          doc.text(
            detalles[item].siglas_org + '/' + detalles[item].siglas_dest,
            {
              align: 'center',
              columns: 1,
              width: 80,
            }
          );

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
          doc.fontSize(7);
          doc.y = y + 45;
          doc.x = 28;
          doc.text(detalles[item]['clientes_org.razon_social'], {
            align: 'right',
            columns: 1,
            width: 270,
          });
          doc.y = y + 60;
          doc.x = 28;
          doc.text(detalles[item]['clientes_org.rif_cedula'], {
            align: 'left',
            columns: 1,
            width: 270,
          });
          doc.y = y + 60;
          doc.x = 28;
          doc.text(
            detalles[item]['clientes_org.dir_correo'] == '0'
              ? ''
              : detalles[item]['clientes_org.dir_correo'],
            {
              align: 'right',
              columns: 1,
              width: 270,
            }
          );
          doc.y = y + 72;
          doc.x = 28;
          doc.text(detalles[item]['clientes_org.tlf_cliente'], {
            align: 'left',
            columns: 1,
            width: 270,
          });
          doc.y = y + 84;
          doc.x = 28;
          doc.text(detalles[item]['clientes_org.dir_fiscal'], {
            align: 'left',
            columns: 1,
            width: 270,
          });
          doc.y = y + 108;
          doc.x = 40;
          doc.text(detalles[item]['clientes_org.parroquias.desc_parroquia'], {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.y = y + 108;
          doc.x = 150;
          doc.text(detalles[item]['clientes_org.municipios.desc_municipio'], {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.y = y + 120;
          doc.x = 40;
          doc.text(detalles[item]['clientes_org.ciudades.desc_ciudad'], {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.y = y + 120;
          doc.x = 150;
          doc.text(
            detalles[item]['clientes_org.ciudades.estados.desc_estado'],
            {
              align: 'left',
              columns: 1,
              width: 100,
            }
          );
          doc.y = y + 132;
          doc.x = 40;
          doc.text(detalles[item]['clientes_org.localidades.cod_postal'], {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.y = y + 132;
          doc.x = 150;
          doc.text(
            detalles[item]['clientes_org.ciudades.estados.paises.desc_pais'],
            {
              align: 'left',
              columns: 1,
              width: 100,
            }
          );
          doc.fontSize(14);
          doc.y = y + 150;
          doc.x = 23;
          doc.text(
            detalles[item]['clientes_org.agencias.ciudades.desc_ciudad'],
            {
              align: 'center',
              columns: 1,
              width: 280,
            }
          );

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
          doc.fontSize(7);
          doc.y = y + 45;
          doc.x = 313;
          doc.text(detalles[item]['cliente_particular.nb_cliente'], {
            align: 'right',
            columns: 1,
            width: 270,
          });
          doc.y = y + 60;
          doc.x = 313;
          doc.text(detalles[item]['cliente_particular.rif_ci'], {
            align: 'left',
            columns: 1,
            width: 270,
          });
          doc.y = y + 72;
          doc.x = 313;
          doc.text(detalles[item]['cliente_particular.telefonos'], {
            align: 'left',
            columns: 1,
            width: 270,
          });
          doc.y = y + 84;
          doc.x = 313;
          doc.text(detalles[item]['cliente_particular.direccion'], {
            align: 'left',
            columns: 1,
            width: 270,
          });
          doc.y = y + 108;
          doc.x = 330;
          doc.text(
            detalles[item]['cliente_particular.parroquias.desc_parroquia'],
            {
              align: 'left',
              columns: 1,
              width: 100,
            }
          );
          doc.y = y + 108;
          doc.x = 440;
          doc.text(
            detalles[item]['cliente_particular.municipios.desc_municipio'],
            {
              align: 'left',
              columns: 1,
              width: 130,
            }
          );
          doc.y = y + 120;
          doc.x = 330;
          doc.text(detalles[item]['cliente_particular.ciudades.desc_ciudad'], {
            align: 'left',
            columns: 1,
            width: 100,
          });
          doc.y = y + 120;
          doc.x = 440;
          doc.text(
            detalles[item]['cliente_particular.ciudades.estados.desc_estado'],
            {
              align: 'left',
              columns: 1,
              width: 100,
            }
          );
          doc.y = y + 132;
          doc.x = 330;
          doc.text(
            detalles[item]['cliente_particular.localidades.cod_postal'],
            {
              align: 'left',
              columns: 1,
              width: 100,
            }
          );
          doc.y = y + 132;
          doc.x = 440;
          doc.text(
            detalles[item][
              'cliente_particular.ciudades.estados.paises.desc_pais'
            ],
            {
              align: 'left',
              columns: 1,
              width: 100,
            }
          );
          doc.fontSize(14);
          doc.y = y + 150;
          doc.x = 308;
          doc.text(
            detalles[item]['cliente_particular.agencias.ciudades.desc_ciudad'],
            {
              align: 'center',
              columns: 1,
              width: 280,
            }
          );

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
            detalles[item].modalidad_pago == 'CO' &&
            detalles[item].pagado_en == 'O'
          ) {
            modalidad = 'CONTADO ORIGEN';
          } else if (
            detalles[item].modalidad_pago == 'CO' &&
            detalles[item].pagado_en == 'D'
          ) {
            modalidad = 'CONTADO DESTINO';
          } else if (
            detalles[item].modalidad_pago == 'CR' &&
            detalles[item].pagado_en == 'O'
          ) {
            modalidad = 'CREDITO ORIGEN';
          } else if (
            detalles[item].modalidad_pago == 'CR' &&
            detalles[item].pagado_en == 'D'
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
          if (detalles[item].tipo_carga == 'SB') {
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
          doc.fontSize(11);
          doc.y = y + 222;
          doc.x = 28;
          doc.text(detalles[item].dimensiones, {
            align: 'left',
            columns: 1,
            width: 217,
          });

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
      if (item != detalles.length - 1) {
        doc.addPage();
      }
    }
  }
}

module.exports = GuiasLoteService;
