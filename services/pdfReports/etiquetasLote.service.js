const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { models, Sequelize } = require('./../../libs/sequelize');

// Grafico del logo (ZPL ^GFA) generado una sola vez a partir de img/logo_rc.png
const LOGO_GFA = fs
  .readFileSync(path.join(__dirname, 'etiquetaLogo.txt'), 'utf8')
  .trim();

const siglasOrg =
  '(SELECT siglas FROM agencias ' +
  'JOIN ciudades ON agencias.cod_ciudad = ciudades.id ' +
  'WHERE `Mmovimientos`.cod_agencia = agencias.id)';
const siglasDest =
  '(SELECT siglas FROM agencias ' +
  'JOIN ciudades ON agencias.cod_ciudad = ciudades.id ' +
  'WHERE `Mmovimientos`.cod_agencia_dest = agencias.id)';

class EtiquetasLoteService {
  // Limpia texto para ZPL: quita caracteres de control de ZPL y recorta
  clean(txt, max) {
    if (txt === null || txt === undefined) return '';
    let s = String(txt).replace(/[\^~]/g, ' ').trim();
    if (max && s.length > max) s = s.substring(0, max);
    return s;
  }

  formatPeso(v) {
    const n = Number(v);
    if (!v || isNaN(n)) return '0 kg';
    // una decimal, coma decimal
    return n.toFixed(1).replace('.', ',') + ' kg';
  }

  async generar(data) {
    const ids = JSON.parse(data).toString().split(',');

    const guias = await models.Mmovimientos.findAll({
      where: { id: { [Sequelize.Op.in]: ids } },
      attributes: [
        'id',
        'nro_documento',
        'nro_piezas',
        'peso_kgs',
        'fecha_envio',
        'cod_cliente_org',
        'cod_cliente_dest',
        'id_clte_part_orig',
        'id_clte_part_dest',
        [Sequelize.literal(siglasOrg), 'siglas_org'],
        [Sequelize.literal(siglasDest), 'siglas_dest'],
      ],
      order: [['nro_documento', 'ASC']],
      raw: true,
    });

    let zpl = '';
    for (const g of guias) {
      const orig = g.id_clte_part_orig
        ? await models.Cparticulares.findByPk(g.id_clte_part_orig, { raw: true })
        : await models.Clientes.findByPk(g.cod_cliente_org, { raw: true });
      const dest = g.id_clte_part_dest
        ? await models.Cparticulares.findByPk(g.id_clte_part_dest, { raw: true })
        : await models.Clientes.findByPk(g.cod_cliente_dest, { raw: true });

      const total = g.nro_piezas && Number(g.nro_piezas) > 0 ? parseInt(g.nro_piezas) : 1;
      for (let b = 1; b <= total; b++) {
        zpl += this.etiqueta(g, orig, dest, b, total);
      }
    }
    return zpl;
  }

  etiqueta(g, orig, dest, bulto, total) {
    const nroGuia = this.clean(g.nro_documento);
    const codigo = `RCS-${nroGuia}-${String(bulto).padStart(2, '0')}`;
    const org = this.clean(g.siglas_org, 5);
    const dst = this.clean(g.siglas_dest, 5);
    const peso = this.formatPeso(g.peso_kgs);
    const fecha = g.fecha_envio ? moment(g.fecha_envio).format('DD/MM/YYYY') : '';
    const deNombre = this.clean(orig && orig.nb_cliente, 60);

    const destNombre = this.clean(dest && dest.nb_cliente, 70);
    const destDir = this.clean(
      dest && (dest.direccion || dest.dir_fiscal),
      160
    );
    const destTlf = this.clean(dest && (dest.telefonos || dest.tlf_cliente), 40);

    return `^XA
^PW812
^LL812
^CI28
^MD18
^LH0,0

^FO24,6${LOGO_GFA}^FS
^FO122,22^A0N,38,38^FDRCS EXPRESS^FS
^FO124,66^A0N,20,20^FDRIF J-31028463-6^FS
^FO124,90^A0N,20,20^FDCP IP 20-22-15-40^FS

^FO470,30^GB132,62,3^FS
^FO474,49^A0N,34,34^FB132,1,0,C^FD${org}^FS
^FO610,49^A0N,34,34^FD>^FS
^FO646,30^GB132,62,62^FS
^FO650,49^A0N,34,34^FR^FB132,1,0,C^FD${dst}^FS

^FO52,146^BQN,2,16^FDMA,${codigo}^FS
^FO4,514^A0N,22,22^FB440,1,0,C^FD${codigo}^FS

^FO440,120^GB3,420,3^FS

^FO466,144^A0N,17,17^FDGUIA^FS
^FO466,165^A0N,48,48^FD${nroGuia}^FS
^FO458,225^GB352,2,2^FS
^FO466,249^A0N,17,17^FDBULTO^FS
^FO466,270^A0N,48,48^FD${bulto} / ${total}^FS
^FO458,330^GB352,2,2^FS
^FO466,351^A0N,17,17^FDPESO GUIA^FS
^FO466,372^A0N,48,48^FD${peso}^FS
^FO458,435^GB352,2,2^FS
^FO466,459^A0N,17,17^FDFECHA ENVIO^FS
^FO466,480^A0N,48,48^FD${fecha}^FS

^FO0,540^GB812,3,3^FS

^FO20,566^A0N,20,20^FDDe: ${deNombre}^FS
^FO20,604^A0N,36,36^FB772,1,0,L^FD${destNombre}^FS
^FO20,662^A0N,25,25^FB772,2,4,L^FD${destDir}^FS
^FO20,742^A0N,28,28^FDTlf: ${destTlf}^FS

^XZ
`;
  }
}

module.exports = EtiquetasLoteService;
