const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { models, Sequelize } = require('./../../libs/sequelize');

// Grafico del logo (ZPL ^GFA) generado una sola vez a partir de img/logo_rc.png
const LOGO_GFA = fs
  .readFileSync(path.join(__dirname, 'etiquetaLogo.txt'), 'utf8')
  .trim();

// Correccion de centrado horizontal del recuadro de siglas (fuente A0 a 110pt,
// campo ^FB230). El ^FB centra la "caja de avance" de las letras, pero la tinta
// visible queda descentrada segun la forma de cada codigo. Estos offsets (dots)
// desplazan el ^FO para centrar la tinta real. Medidos por render para cada
// siglas existente; regenerar con scratchpad/measure_siglas.js si cambian.
// Siglas no listada -> 0 (centrado automatico por ^FB, como antes).
const SIGLAS_SHIFT = {
  VLN: 20, GUA: 15, PBL: 14, SJQ: 15, BLA: 14, PLC: 16, AOA: 17, TGR: 17,
  STM: 18, CTU: 18, LCH: 17, MCY: -3, LVT: 14, CGU: 18, VCR: 18, VLP: 17,
  CLZ: 16, ZRA: 16, MRD: -1, GTR: 16, GRN: 18, LTQ: 14, MIQ: 14, CCS: 17,
  SFP: 16, NRG: 16, CHV: 15, SJM: 18, SCS: 17, PZO: 16, CBL: 15, SFX: 15,
  UPT: 14, CUM: 2, CRP: 16, BNS: 15, PMV: -2, PPT: 14, JAG: 19, MUN: 1,
  PTM: 1, SVZ: 17, SCB: 17, CLN: 18, TRB: 18, VLV: 17, TRU: 19, LSP: 14,
  CORO: 0, MAR: -2, SRT: 15, COJ: 17, CBM: 2, BRM: 1, AGV: 17, ARE: 18,
  GNR: 16, TCP: 17, SFA: 15,
};

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
    out.push(L(y, 38, `Zona: ${zona}`)); y += contW ? 44 : 50;
    const cl = contW ? this.wrap(contFull, 50, 2) : [contFull];
    const cf = contW ? 24 : 32;
    const clg = contW ? 4 : 8;
    cl.forEach((ln) => { out.push(L(y, cf, ln, W)); y += cf + clg; });
    return out.join('\n');
  }

  // Recuadro negro de siglas (destino), caja 230x200, con el texto blanco
  // centrado: vertical (ink ~82 dots en caja de 200 -> +59) y horizontal
  // (tabla SIGLAS_SHIFT por la forma de cada codigo).
  siglasBox(dst, boxLeft, boxTop) {
    const shift = SIGLAS_SHIFT[dst] != null ? SIGLAS_SHIFT[dst] : 0;
    return (
      `^FO${boxLeft},${boxTop}^GB230,200,200^FS\n` +
      `^FO${boxLeft + shift},${boxTop + 59}^A0N,110,110^FR^FB230,1,0,C^FD${dst}^FS`
    );
  }

  // Etiqueta COMPLETA (preimpreso): logo RCS, destino grande (recuadro negro)
  // arriba-derecha, origen chico abajo-derecha, columna de datos y destinatario.
  etiquetaCompleta(g, orig, dest, bulto, total) {
    const nroGuia = this.clean(g.nro_documento);
    const codigo = `RCS-${nroGuia}-${String(bulto).padStart(2, '0')}`;
    const org = this.clean(g.siglas_org, 5);
    const dst = this.clean(g.siglas_dest, 5);
    const fecha = g.fecha_envio ? moment(g.fecha_envio).format('DD/MM/YYYY') : '';
    const zona = this.clean(g.zona_dest, 30) || 'SIN ZONA';
    const contenido = this.clean(g.dimensiones, 140) || 'N/E';
    const deNombre = this.clean(orig && orig.nb_cliente, 80);
    const destNombre = this.clean(dest && dest.nb_cliente, 90);

    const pie = this.pieCompleto(deNombre, destNombre, zona, contenido);

    return `^XA
^PW800
^LL800
^CI28
^MD18
^LH0,0

^FO24,6${LOGO_GFA}^FS
^FO122,18^A0N,30,30^FDR.C.S. EXPRESS, S.A.^FS
^FO124,58^A0N,20,20^FDRif J31028463-6^FS
^FO124,82^A0N,20,20^FDCP IP 20-22-15-40^FS

${this.siglasBox(dst, 505, 16)}

^FO52,146^BQN,2,16^FDMA,${codigo}^FS
^FO4,514^A0N,22,22^FB440,1,0,C^FD${codigo}^FS

^FO440,120^GB3,420,3^FS

^FO466,260^A0N,17,17^FDGUIA^FS
^FO466,280^A0N,62,62^FD${nroGuia}^FS
^FO458,350^GB342,2,2^FS
^FO466,362^A0N,17,17^FDBULTO^FS
^FO466,382^A0N,46,46^FD${bulto} / ${total}^FS
^FO458,442^GB342,2,2^FS
^FO466,452^A0N,17,17^FDFECHA ENVIO^FS
^FO466,472^A0N,46,46^FD${fecha}^FS

^FO0,540^GB800,3,3^FS

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
    const GBW = 800 - GBX;
    const CELLTOP = 116;

    // Columna derecha: GUIA / BULTO / FECHA (sin PESO), debajo del recuadro
    // de siglas; posiciones fijas.
    const columna = [
      `^FO${COLX},256^A0N,17,17^FDGUIA^FS`,
      `^FO${COLX},274^A0N,48,48^FD${nroGuia}^FS`,
      `^FO${GBX},334^GB${GBW},2,2^FS`,
      `^FO${COLX},346^A0N,17,17^FDBULTO^FS`,
      `^FO${COLX},364^A0N,38,38^FD${bulto} / ${total}^FS`,
      `^FO${GBX},414^GB${GBW},2,2^FS`,
      `^FO${COLX},426^A0N,17,17^FDFECHA ENVIO^FS`,
      `^FO${COLX},444^A0N,38,38^FD${fecha}^FS`,
    ].join('\n');

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
      zonaZpl = `^FO20,684^A0N,64,64^FD${zonaFull}^FS`;
    } else {
      const zl = this.wrap(zonaFull, 30, 2);
      zonaZpl =
        `^FO20,676^A0N,46,46^FB772,1,0,L^FD${zl[0]}^FS\n` +
        `^FO20,728^A0N,46,46^FB772,1,0,L^FD${zl[1] || ''}^FS`;
    }

    return `^XA
^PW800
^LL800
^CI28
^MD18
^LH0,0

^FO${QX},${QY}^BQN,2,${MAG}^FDMA,${qrPayload}^FS
^FO0,${CODY}^A0N,24,24^FB${SEPX},1,0,C^FD${codigoVisible}^FS

${this.siglasBox(dst, 521, 28)}

^FO${SEPX},${CELLTOP}^GB3,${HSEP - CELLTOP + 3},3^FS

${columna}

^FO0,${HSEP}^GB800,3,3^FS

${bloque}

^FO688,${vlnY}^GB112,44,2^FS
^FO688,${vlnY + 9}^A0N,28,28^FB112,1,0,C^FD${org}^FS

${zonaZpl}

^XZ
`;
  }
}

module.exports = EtiquetasLoteService;
