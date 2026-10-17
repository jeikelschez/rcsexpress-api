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
const zonaDest =
  '(SELECT nb_zona FROM zonas ' +
  'WHERE `Mmovimientos`.cod_zona_dest = zonas.id)';

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

  // tipo: 'C' = completo (preimpreso), 'S' = simple (forma libre, sin datos RCS)
  async generar(data, tipo) {
    const ids = JSON.parse(data).toString().split(',');
    const esSimple = String(tipo).toUpperCase() === 'S';

    const guias = await models.Mmovimientos.findAll({
      where: { id: { [Sequelize.Op.in]: ids } },
      attributes: [
        'id',
        'nro_documento',
        'nro_piezas',
        'peso_kgs',
        'fecha_envio',
        'dimensiones',
        'cod_cliente_org',
        'cod_cliente_dest',
        'id_clte_part_orig',
        'id_clte_part_dest',
        [Sequelize.literal(siglasOrg), 'siglas_org'],
        [Sequelize.literal(siglasDest), 'siglas_dest'],
        [Sequelize.literal(zonaDest), 'zona_dest'],
      ],
      order: [['nro_documento', 'ASC']],
      raw: true,
    });

    let zpl = '';
    for (const g of guias) {
      // En la etiqueta simple no se consultan datos de empresas (remitente/destinatario)
      let orig = null;
      let dest = null;
      if (!esSimple) {
        orig = g.id_clte_part_orig
          ? await models.Cparticulares.findByPk(g.id_clte_part_orig, { raw: true })
          : await models.Clientes.findByPk(g.cod_cliente_org, { raw: true });
        dest = g.id_clte_part_dest
          ? await models.Cparticulares.findByPk(g.id_clte_part_dest, { raw: true })
          : await models.Clientes.findByPk(g.cod_cliente_dest, { raw: true });
      }

      const total = g.nro_piezas && Number(g.nro_piezas) > 0 ? parseInt(g.nro_piezas) : 1;
      for (let b = 1; b <= total; b++) {
        zpl += esSimple
          ? this.etiquetaSimple(g, b, total)
          : this.etiquetaCompleta(g, orig, dest, b, total);
      }
    }
    return zpl;
  }

  // Etiqueta COMPLETA (preimpreso): logo RCS, cabecera, QR, columna de datos y destinatario
  etiquetaCompleta(g, orig, dest, bulto, total) {
    const nroGuia = this.clean(g.nro_documento);
    const codigo = `RCS-${nroGuia}-${String(bulto).padStart(2, '0')}`;
    const org = this.clean(g.siglas_org, 5);
    const dst = this.clean(g.siglas_dest, 5);
    const peso = this.formatPeso(g.peso_kgs);
    const fecha = g.fecha_envio ? moment(g.fecha_envio).format('DD/MM/YYYY') : '';
    const zona = this.clean(g.zona_dest, 30) || 'SIN ZONA';
    const contenido = this.clean(g.dimensiones, 140) || 'N/E';
    const deNombre = this.clean(orig && orig.nb_cliente, 80);
    const destNombre = this.clean(dest && dest.nb_cliente, 90);

    const pie = this.pieCompleto(deNombre, destNombre, zona, contenido);

    return `^XA
^PW812
^LL812
^CI28
^MD18
^LH0,0

^FO24,6${LOGO_GFA}^FS
^FO122,18^A0N,30,30^FDR.C.S. EXPRESS, S.A.^FS
^FO124,58^A0N,20,20^FDRif J31028463-6^FS
^FO124,82^A0N,20,20^FDCP IP 20-22-15-40^FS

^FO470,30^GB132,62,3^FS
^FO474,49^A0N,34,34^FB132,1,0,C^FD${org}^FS
^FO610,49^A0N,34,34^FD>^FS
^FO646,30^GB132,62,62^FS
^FO650,49^A0N,34,34^FR^FB132,1,0,C^FD${dst}^FS

^FO52,146^BQN,2,16^FDMA,${codigo}^FS
^FO4,514^A0N,22,22^FB440,1,0,C^FD${codigo}^FS

^FO440,120^GB3,420,3^FS

^FO466,140^A0N,17,17^FDGUIA^FS
^FO466,160^A0N,62,62^FD${nroGuia}^FS
^FO458,232^GB352,2,2^FS
^FO466,250^A0N,17,17^FDBULTO^FS
^FO466,270^A0N,46,46^FD${bulto} / ${total}^FS
^FO458,330^GB352,2,2^FS
^FO466,348^A0N,17,17^FDPESO GUIA^FS
^FO466,368^A0N,46,46^FD${peso}^FS
^FO458,428^GB352,2,2^FS
^FO466,446^A0N,17,17^FDFECHA ENVIO^FS
^FO466,466^A0N,46,46^FD${fecha}^FS

^FO0,540^GB812,3,3^FS

${pie}

^XZ
`;
  }

  // Envuelve texto en <=maxLines lineas de ~cpl caracteres; agrega "..." si no entra todo
  wrap(text, cpl, maxLines) {
    const full = String(text).replace(/\s+/g, ' ').trim();
    const words = full.split(' ');
    const lines = [];
    let cur = '';
    for (let i = 0; i < words.length && lines.length < maxLines; i++) {
      let w = words[i];
      while (w.length > cpl && lines.length < maxLines) {
        if (cur) { lines.push(cur); cur = ''; }
        if (lines.length >= maxLines) break;
        lines.push(w.substring(0, cpl));
        w = w.substring(cpl);
      }
      if (lines.length >= maxLines) break;
      const test = cur ? cur + ' ' + w : w;
      if (test.length <= cpl) cur = test;
      else { lines.push(cur); cur = w; }
    }
    if (cur && lines.length < maxLines) lines.push(cur);
    const consumed = lines.join(' ').length;
    if (consumed < full.length && lines.length) {
      let last = lines[lines.length - 1];
      if (last.length > cpl - 3) last = last.substring(0, cpl - 3);
      lines[lines.length - 1] = last + '...';
    }
    return lines;
  }

  // Pie dinamico: usa el layout aprobado si nombre y contenido entran en 1 linea;
  // si alguno es largo, lo envuelve a 2 lineas y apila sin dejar hueco.
  pieCompleto(deNombre, destNombre, zona, contenido) {
    const L = (y, f, text, fb) =>
      `^FO20,${y}^A0N,${f},${f}${fb ? `^FB${fb},1,0,L` : ''}^FD${text}^FS`;
    const contFull = `Contenido: ${contenido}`;
    const nameWrapped = destNombre.length > 36;
    const contWrapped = contFull.length > 44;

    const deLine = this.wrap(`De: ${deNombre}`, 64, 1)[0] || '';

    if (!nameWrapped && !contWrapped) {
      return [
        L(562, 22, deLine),
        L(598, 38, destNombre, 772),
        L(660, 38, `Zona: ${zona}`),
        L(724, 32, contFull, 772),
      ].join('\n');
    }

    let y = 556;
    const out = [];
    out.push(L(y, 22, deLine));
    y += 36;
    const nameLines = nameWrapped ? this.wrap(destNombre, 44, 2) : [destNombre];
    const nf = nameWrapped ? 32 : 38;
    nameLines.forEach((ln) => { out.push(L(y, nf, ln, 772)); y += nf + 8; });
    y += 6;
    out.push(L(y, 38, `Zona: ${zona}`));
    y += 50;
    const contLines = contWrapped ? this.wrap(contFull, 58, 2) : [contFull];
    const cf = contWrapped ? 24 : 32;
    contLines.forEach((ln) => { out.push(L(y, cf, ln, 772)); y += cf + 8; });
    return out.join('\n');
  }

  // Etiqueta SIMPLE (forma libre): solo QR + codigo + guia/bulto + origen>destino, SIN referencia a RCS
  etiquetaSimple(g, bulto, total) {
    const nroGuia = this.clean(g.nro_documento);
    const nn = String(bulto).padStart(2, '0');
    // El QR mantiene el prefijo RCS- para que el escaneo sea uniforme con las completas.
    const qrPayload = `RCS-${nroGuia}-${nn}`;
    // El texto visible va SIN referencia a RCS.
    const codigoVisible = `${nroGuia}-${nn}`;
    const org = this.clean(g.siglas_org, 5);
    const dst = this.clean(g.siglas_dest, 5);

    return `^XA
^PW812
^LL812
^CI28
^MD18
^LH0,0

^FO166,70^BQN,2,22^FDMA,${qrPayload}^FS

^FO0,590^A0N,56,56^FB812,1,0,C^FD${codigoVisible}^FS
^FO0,662^A0N,40,40^FB812,1,0,C^FDGuia ${nroGuia}   Bulto ${bulto}/${total}^FS
^FO0,718^A0N,44,44^FB812,1,0,C^FD${org}  >  ${dst}^FS

^XZ
`;
  }
}

module.exports = EtiquetasLoteService;
