const moment = require('moment');
const { models } = require('../../libs/sequelize');

// Manifiesto de un Control de Carga: bultos agrupados por destino
class ControlCargaService {
  async mainReport(worksheet, id) {
    const carga = await models.Ccarga.findByPk(id, {
      include: [
        { association: 'agencias', attributes: ['id', 'nb_agencia'] },
        {
          association: 'bultos',
          separate: true,
          order: [
            ['destino', 'ASC'],
            ['nro_documento', 'ASC'],
            ['nro_bulto', 'ASC'],
          ],
        },
      ],
    });
    if (!carga) return false;

    worksheet.columns = [
      { key: 'A', width: 26 },
      { key: 'B', width: 14 },
      { key: 'C', width: 8 },
      { key: 'D', width: 20 },
      { key: 'E', width: 13 },
      { key: 'F', width: 24 },
      { key: 'G', width: 20 },
    ];

    worksheet.getCell('A1').value = 'CONTROL DE CARGA CC-' + carga.id;
    worksheet.getCell('A1').font = { bold: true, size: 14 };
    const cab = [
      ['Fecha:', carga.fecha],
      ['Agencia:', carga.agencias ? carga.agencias.nb_agencia : ''],
      ['Chofer:', carga.chofer || ''],
      ['Vehículo:', carga.vehiculo || ''],
      ['Estado:', carga.estado],
      ['Vía:', carga.via],
      ['Generado:', moment().format('DD/MM/YYYY HH:mm')],
    ];
    cab.forEach((c, i) => {
      worksheet.getCell('A' + (i + 2)).value = c[0];
      worksheet.getCell('B' + (i + 2)).value = c[1];
    });

    let fila = cab.length + 3;
    const titulos = [
      'Destino',
      'Guía',
      'Bulto',
      'Código',
      'Estado',
      'Escaneado por',
      'Fecha / hora',
    ];
    titulos.forEach((t, i) => {
      const cell = worksheet.getRow(fila).getCell(i + 1);
      cell.value = t;
      cell.font = { bold: true };
    });
    fila++;

    const grupos = {};
    for (const b of carga.bultos) {
      const d = b.destino || 'SIN DESTINO';
      if (!grupos[d]) grupos[d] = [];
      grupos[d].push(b);
    }

    let total = 0;
    let escaneados = 0;
    for (const destino of Object.keys(grupos)) {
      const bultos = grupos[destino];
      for (const b of bultos) {
        worksheet.getRow(fila).values = [
          destino,
          b.nro_documento,
          b.nro_bulto,
          b.codigo,
          b.escaneado ? 'ESCANEADO' : 'FALTANTE',
          b.usuario || '',
          b.fecha_hora || '',
        ];
        fila++;
      }
      const esc = bultos.filter((b) => b.escaneado).length;
      const guias = new Set(bultos.map((b) => b.nro_documento)).size;
      const sub = worksheet.getRow(fila);
      sub.values = [
        'Subtotal ' + destino,
        guias + ' guía(s)',
        bultos.length,
        '',
        esc + ' escaneado(s)',
      ];
      sub.font = { bold: true };
      fila += 2;
      total += bultos.length;
      escaneados += esc;
    }

    const tot = worksheet.getRow(fila);
    tot.values = [
      'TOTAL',
      new Set(carga.bultos.map((b) => b.nro_documento)).size + ' guía(s)',
      total,
      '',
      escaneados + ' escaneado(s)',
      total - escaneados + ' faltante(s)',
    ];
    tot.font = { bold: true };
    return true;
  }
}

module.exports = ControlCargaService;
