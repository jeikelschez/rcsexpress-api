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
    return n.toFixed(1).replace('.', ',') + ' kg';
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

  // tipo: 'C' = completo (preimpreso), 'S' = simple (forma libre, sin marca RCS)
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
      const orig = g.id_clte_part_orig
        ? await models.Cparticulares.findByPk(g.id_clte_part_orig, { raw: true })
        : await models.Clientes.findByPk(g.cod_cliente_org, { raw: true });
      const dest = g.id_clte_part_dest
        ? await models.Cparticulares.findByPk(g.id_clte_part_dest, { raw: true })
        : await models.Clientes.findByPk(g.cod_cliente_dest, { raw: true });

      const total = g.nro_piezas && Number(g.nro_piezas) > 0 ? parseInt(g.nro_piezas) : 1;
      for (let b = 1; b <= total; b++) {
        zpl += esSimple
          ? this.etiquetaSimple(g, orig, dest, b, total)
          : this.etiquetaCompleta(g, orig, dest, b, total);
      }
    }
    return zpl;
  }

  // Pie (De / destinatario / Zona / Contenido) del preimpreso, ancho 660 para
  // dejar lugar al recuadro de origen; recorta a 2 lineas con "..." si es largo.
  pieCompleto(deNombre, destNombre, zona, contenido) {
    const W = 660;
    const L = (y, f, text, fb) =>
      `^FO20,${y}^A0N,${f},${f}${fb ? `^FB${fb},1,0,L` : ''}^FD${text}^FS`;
    const deLine = this.wrap(`De: ${deNombre}`, 56, 1)[0] || '';
    const contFull = `Contenido: ${contenido}`;
    const nameW = destNombre.length > 34;
    const contW = contFull.length > 48;
    if (!nameW && !contW) {
      return [
        L(562, 22, deLine),
        L(598, 38, destNombre, W),
        L(660, 38, `Zona: ${zona}`),
        L(724, 32, contFull, W),
      ].join('\n');
    }
    let y = 556;
    const out = [];
    out.push(L(y, 22, deLine)); y += 36;
    const nl = nameW ? this.wrap(destNombre, 38, 2) : [destNombre];
    const nf = nameW ? 32 : 38;
    nl.forEach((ln) => { out.push(L(y, nf, ln, W)); y += nf + 8; });
    y += 6;
    out.push(L(y, 38, `Zona: ${zona}`)); y += 50;
    const cl = contW ? this.wrap(contFull, 50, 2) : [contFull];
    const cf = contW ? 24 : 32;
    cl.forEach((ln) => { out.push(L(y, cf, ln, W)); y += cf + 8; });
    return out.join('\n');
  }

  // Etiqueta COMPLETA (preimpreso): logo RCS, destino grande (recuadro negro)
  // arriba-derecha, origen chico abajo-derecha, columna de datos y destinatario.
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

^FO556,8^GB250,96,96^FS
^FO556,28^A0N,58,58^FR^FB250,1,0,C^FD${dst}^FS

^FO52,146^BQN,2,16^FDMA,${codigo}^FS
^FO4,514^A0N,22,22^FB440,1,0,C^FD${codigo}^FS

^FO440,120^GB3,420,3^FS

^FO466,151^A0N,17,17^FDGUIA^FS
^FO466,171^A0N,62,62^FD${nroGuia}^FS
^FO458,243^GB352,2,2^FS
^FO466,261^A0N,17,17^FDBULTO^FS
^FO466,281^A0N,46,46^FD${bulto} / ${total}^FS
^FO458,341^GB352,2,2^FS
^FO466,359^A0N,17,17^FDPESO GUIA^FS
^FO466,379^A0N,46,46^FD${peso}^FS
^FO458,439^GB352,2,2^FS
^FO466,457^A0N,17,17^FDFECHA ENVIO^FS
^FO466,477^A0N,46,46^FD${fecha}^FS

^FO0,540^GB812,3,3^FS

${pie}

^FO688,556^GB112,46,2^FS
^FO688,566^A0N,30,30^FB112,1,0,C^FD${org}^FS

^XZ
`;
  }

  // Etiqueta SIMPLE (forma libre): SIN marca RCS (sin logo/encabezado), QR grande,
  // destino grande arriba-derecha, origen chico, columna de datos, destinatario y
  // Zona grande al pie. El QR conserva RCS-[guia]-[NN]; el texto visible va sin RCS.
  etiquetaSimple(g, orig, dest, bulto, total) {
    const nroGuia = this.clean(g.nro_documento);
    const nn = String(bulto).padStart(2, '0');
    const qrPayload = `RCS-${nroGuia}-${nn}`;
    const codigoVisible = `${nroGuia}-${nn}`;
    const org = this.clean(g.siglas_org, 5);
    const dst = this.clean(g.siglas_dest, 5);
    const peso = this.formatPeso(g.peso_kgs);
    const fecha = g.fecha_envio ? moment(g.fecha_envio).format('DD/MM/YYYY') : '';
    const zona = this.clean(g.zona_dest, 30) || 'SIN ZONA';
    const contenido = this.clean(g.dimensiones, 140) || 'N/E';
    const deNombre = this.clean(orig && orig.nb_cliente, 80);
    const destNombre = this.clean(dest && dest.nb_cliente, 90);

    // Parametros de layout
    const MAG = 20;
    const QRW = 21 * MAG;
    const SEPX = 472;
    const QX = Math.round((SEPX - QRW) / 2);
    const QY = 12;
    const CODY = QY + QRW + 26;
    const HSEP = Math.max(492, CODY + 26);
    const COLX = SEPX + 22;
    const GBX = SEPX + 12;
    const GBW = 806 - GBX;
    const CELLTOP = 116;

    // Columna derecha: 4 bandas repartidas parejas en [CELLTOP, HSEP]
    const H = HSEP - CELLTOP;
    const bandH = H / 4;
    const bands = [
      ['GUIA', nroGuia, 48],
      ['BULTO', `${bulto} / ${total}`, 38],
      ['PESO GUIA', peso, 38],
      ['FECHA ENVIO', fecha, 38],
    ];
    const col = [];
    bands.forEach((b, i) => {
      const top = CELLTOP + Math.round(i * bandH);
      const labelY = top + Math.max(6, Math.round((bandH - (20 + b[2])) / 2));
      col.push(`^FO${COLX},${labelY}^A0N,17,17^FD${b[0]}^FS`);
      col.push(`^FO${COLX},${labelY + 20}^A0N,${b[2]},${b[2]}^FD${b[1]}^FS`);
      if (i < 3) col.push(`^FO${GBX},${CELLTOP + Math.round((i + 1) * bandH)}^GB${GBW},2,2^FS`);
    });
    const columna = col.join('\n');

    // Bloque De / destinatario / Contenido (ancho 660 por el recuadro de origen)
    const W = 660;
    const L = (y, f, text, fb) =>
      `^FO20,${y}^A0N,${f},${f}${fb ? `^FB${fb},1,0,L` : ''}^FD${text}^FS`;
    const deLine = this.wrap(`De: ${deNombre}`, 56, 1)[0] || '';
    const contFull = `Contenido: ${contenido}`;
    let y = HSEP + 20;
    const out = [];
    out.push(L(y, 20, deLine)); y += 30;
    const nameW = destNombre.length > 34;
    const nl = nameW ? this.wrap(destNombre, 38, 2) : [destNombre];
    const nf = nameW ? 30 : 34;
    nl.forEach((ln) => { out.push(L(y, nf, ln, W)); y += nf + 6; });
    const contW = contFull.length > 58;
    const cl = contW ? this.wrap(contFull, 58, 2) : [contFull];
    const cf = contW ? 22 : 26;
    y += 4;
    cl.forEach((ln) => { out.push(L(y, cf, ln, W)); y += cf + 6; });
    const bloque = out.join('\n');
    const vlnY = HSEP + 18;

    // Zona grande (adaptativa) al pie
    const zonaFull = `Zona: ${zona}`;
    let zonaZpl;
    if (zonaFull.length <= 22) {
      zonaZpl = `^FO20,728^A0N,64,64^FD${zonaFull}^FS`;
    } else {
      const zl = this.wrap(zonaFull, 30, 2);
      zonaZpl =
        `^FO20,692^A0N,46,46^FB772,1,0,L^FD${zl[0]}^FS\n` +
        `^FO20,744^A0N,46,46^FB772,1,0,L^FD${zl[1] || ''}^FS`;
    }

    return `^XA
^PW812
^LL812
^CI28
^MD18
^LH0,0

^FO${QX},${QY}^BQN,2,${MAG}^FDMA,${qrPayload}^FS
^FO0,${CODY}^A0N,24,24^FB${SEPX},1,0,C^FD${codigoVisible}^FS

^FO556,16^GB250,92,92^FS
^FO556,36^A0N,56,56^FR^FB250,1,0,C^FD${dst}^FS

^FO${SEPX},${CELLTOP}^GB3,${HSEP - CELLTOP + 3},3^FS

${columna}

^FO0,${HSEP}^GB812,3,3^FS

${bloque}

^FO688,${vlnY}^GB112,44,2^FS
^FO688,${vlnY + 9}^A0N,28,28^FB112,1,0,C^FD${org}^FS

${zonaZpl}

^XZ
`;
  }
}

module.exports = EtiquetasLoteService;
