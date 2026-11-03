const boom = require('@hapi/boom');
const moment = require('moment');

const sequelize = require('./../libs/sequelize');
const { models, Sequelize } = sequelize;

const ESTADOS_ACTIVA = ['ABIERTA', 'EN PROCESO'];
const ESTADOS_CERRADA = ['CERRADA COMPLETA', 'CERRADA CON FALTANTES', 'COSTEADA'];

// Piloto: el costo nace primero y el control se arma con sus guías, así que
// lo que lleva ese camión se corrige en el costo, no en el control
const MSG_CON_COSTO =
  'Este control nació de un costo: sus guías se gestionan desde el costo';

const INCLUDE_GUIA = [
  { association: 'agencias_dest', attributes: ['id', 'nb_agencia'] },
  { association: 'zonas_dest', attributes: ['id', 'nb_zona'] },
  { association: 'clientes_dest', attributes: ['id', 'nb_cliente'] },
  { association: 'clientes_org', attributes: ['id', 'nb_cliente'] },
];

const INCLUDE_CABECERA = [
  { association: 'agencias', attributes: ['id', 'nb_agencia'] },
  { association: 'agentes', attributes: ['id', 'persona_responsable'] },
  { association: 'unidades', attributes: ['id', 'placas', 'descripcion'] },
];

// Acepta DD/MM/YYYY o YYYY-MM-DD; devuelve YYYY-MM-DD (hoy si no viene)
const normFecha = (f) => {
  if (!f) return moment().format('YYYY-MM-DD');
  const m = moment(f, ['DD/MM/YYYY', 'YYYY-MM-DD'], true);
  if (!m.isValid()) throw boom.badRequest('Fecha inválida');
  return m.format('YYYY-MM-DD');
};

class ControlCargaService {
  constructor() {}

  // RCS-[guia]-[NN] o [guia]-[NN]  ->  { nroGuia, nroBulto }
  // También acepta la etiqueta Code128 de Hidroca (46 dígitos):
  // [nro Hidroca 10][9][guia RCS 9][total 5][bulto 5][fecha AAAAMMDD]
  // -> { nroGuia, nroBulto, totalEtiqueta }
  parseCodigo(codigo) {
    const c = String(codigo || '').trim().toUpperCase();
    const h = c.match(/^\d{19}(\d{9})(\d{5})(\d{5})\d{8}$/);
    if (h) {
      const total = parseInt(h[2], 10);
      const bulto = parseInt(h[3], 10);
      if (!bulto || bulto > total) return null;
      return { nroGuia: h[1], nroBulto: bulto, totalEtiqueta: total };
    }
    const m = c.match(/^(?:RCS-)?(\d+)-(\d+)$/);
    if (!m) return null;
    return { nroGuia: m[1], nroBulto: parseInt(m[2], 10) };
  }

  // Completa placa / nombre del chofer desde el catálogo para mostrarlos
  async datosCatalogo(data) {
    const r = {};
    if (data.cod_agente !== undefined) {
      const a = data.cod_agente
        ? await models.Agentes.findByPk(data.cod_agente)
        : null;
      if (data.cod_agente && !a) throw boom.badRequest('Chofer no existe');
      r.cod_agente = a ? a.id : null;
      r.chofer = a ? a.persona_responsable : null;
    }
    if (data.cod_unidad !== undefined) {
      const u = data.cod_unidad
        ? await models.Unidades.findByPk(data.cod_unidad)
        : null;
      if (data.cod_unidad && !u) throw boom.badRequest('Vehículo no existe');
      r.cod_unidad = u ? u.id : null;
      r.vehiculo = u ? u.placas : null;
    }
    return r;
  }

  async create(data, options = {}) {
    const payload = {
      cod_agencia: data.cod_agencia,
      ...(await this.datosCatalogo({
        cod_agente: data.cod_agente || null,
        cod_unidad: data.cod_unidad || null,
      })),
      fecha: normFecha(data.fecha),
      estado: 'ABIERTA',
      via: data.via || 'ALMACEN',
      usuario: data.usuario || null,
      observacion: data.observacion || null,
    };
    const nueva = await models.Ccarga.create(payload, options);
    return nueva;
  }

  async find(filtros = {}) {
    const { agencia, destino, estado, agente, unidad, desde, hasta, activas } =
      filtros;
    const where = {};
    if (agencia) where.cod_agencia = agencia;
    // Controles con al menos una guía hacia alguna de las agencias destino (o
    // en tránsito por ellas), igual que el filtro de la relación de despacho.
    // `destino` admite varias agencias separadas por coma.
    if (destino) {
      const dests = String(destino)
        .split(',')
        .map((d) => parseInt(d, 10));
      if (!dests.length || dests.some((d) => !d)) {
        throw boom.badRequest('Agencia destino inválida');
      }
      const lista = dests.join(',');
      where.id = {
        [Sequelize.Op.in]: Sequelize.literal(
          '(SELECT g.cod_control_carga FROM control_carga_guias g' +
            ' JOIN maestro_de_movimientos m ON m.id = g.cod_movimiento' +
            ` WHERE m.cod_agencia_dest IN (${lista})` +
            ` OR m.cod_agencia_transito IN (${lista}))`
        ),
      };
    }
    // Estados de gestión: ABIERTA, EN PROCESO y POR COSTEAR (cerrada sin
    // costo). Las cerradas que ya tienen costo no se gestionan: solo salen
    // con `cerradas` = 'S'. Sin `estado` se traen los tres de gestión.
    const { Op } = Sequelize;
    const porCosteo = { estado: ESTADOS_CERRADA, cod_costo: null };
    let condEstado;
    if (activas === 'S') condEstado = { estado: ESTADOS_ACTIVA };
    else if (estado === 'POR COSTEAR') condEstado = porCosteo;
    // Una cerrada sin costo se muestra como POR COSTEAR, así que filtrar por
    // un estado cerrado trae solo las que ya tienen costo
    else if (ESTADOS_CERRADA.includes(estado)) {
      condEstado = { estado, cod_costo: { [Op.ne]: null } };
    } else if (estado) condEstado = { estado };
    else condEstado = { [Op.or]: [{ estado: ESTADOS_ACTIVA }, porCosteo] };
    // "Ver cerradas" suma las cerradas con costo solo cuando no se eligió un
    // estado puntual (TODOS)
    if (filtros.cerradas === 'S' && activas !== 'S' && !estado) {
      condEstado = {
        [Op.or]: [
          condEstado,
          { estado: ESTADOS_CERRADA, cod_costo: { [Op.ne]: null } },
        ],
      };
    }
    where[Op.and] = [condEstado];
    if (agente) where.cod_agente = agente;
    if (unidad) where.cod_unidad = unidad;
    if (desde || hasta) {
      where.fecha = {
        [Sequelize.Op.between]: [
          normFecha(desde || '2000-01-01'),
          normFecha(hasta || moment().format('YYYY-MM-DD')),
        ],
      };
    }
    const cargas = await models.Ccarga.findAll({
      where,
      include: [
        ...INCLUDE_CABECERA,
        {
          association: 'bultos',
          attributes: ['id', 'estado_bulto', 'escaneado', 'nro_documento', 'destino'],
          separate: true,
        },
      ],
      order: [['id', 'DESC']],
    });
    await this.agregarSiglasDestino(cargas);
    return cargas;
  }

  // Siglas de las agencias destino de cada control (como el destino de Costos)
  async agregarSiglasDestino(cargas) {
    if (!cargas.length) return;
    const filas = await sequelize.query(
      'SELECT g.cod_control_carga AS id,' +
        " GROUP_CONCAT(DISTINCT c.siglas ORDER BY c.siglas SEPARATOR ' ') AS siglas" +
        ' FROM control_carga_guias g' +
        ' JOIN maestro_de_movimientos m ON m.id = g.cod_movimiento' +
        ' JOIN agencias a ON a.id = m.cod_agencia_dest' +
        ' JOIN ciudades c ON c.id = a.cod_ciudad' +
        ' WHERE g.cod_control_carga IN (:ids)' +
        ' GROUP BY g.cod_control_carga',
      {
        replacements: { ids: cargas.map((c) => c.id) },
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    const mapa = new Map(filas.map((f) => [f.id, f.siglas]));
    for (const c of cargas) {
      c.setDataValue('siglas_destino', mapa.get(c.id) || '');
    }
  }

  async findOne(id) {
    const carga = await models.Ccarga.findByPk(id, {
      include: [
        ...INCLUDE_CABECERA,
        {
          association: 'bultos',
          separate: true,
          order: [['id', 'ASC']],
        },
      ],
    });
    if (!carga) throw boom.notFound('Control de carga no existe');
    return carga;
  }

  async resolver(codigo) {
    const parsed = this.parseCodigo(codigo);
    if (!parsed) throw boom.badRequest('Codigo invalido');
    const mov = await this.buscarGuia(parsed.nroGuia);
    return {
      ...parsed,
      encontrada: !!mov,
      guia: mov ? this.datosGuia(mov) : null,
    };
  }

  async buscarGuia(nroGuia, options = {}) {
    return models.Mmovimientos.findOne({
      where: { nro_documento: nroGuia },
      include: INCLUDE_GUIA,
      ...options,
    });
  }

  datosGuia(mov) {
    const destino =
      (mov.zonas_dest && mov.zonas_dest.nb_zona) ||
      (mov.agencias_dest && mov.agencias_dest.nb_agencia) ||
      null;
    return {
      cod_movimiento: mov.id,
      nro_documento: String(mov.nro_documento),
      destino,
      zona: mov.zonas_dest ? mov.zonas_dest.nb_zona : null,
      remitente: mov.clientes_org ? mov.clientes_org.nb_cliente : null,
      destinatario: mov.clientes_dest ? mov.clientes_dest.nb_cliente : null,
      total_piezas: mov.nro_piezas != null ? Number(mov.nro_piezas) : null,
    };
  }

  // Motivo por el que una guía no puede subir a un camión (o null si puede)
  motivoGuiaNoCargable(mov) {
    if (mov.estatus_administra === 'A') {
      return `La guía ${mov.nro_documento} está anulada`;
    }
    if (['CO', 'NC'].includes(mov.estatus_operativo)) {
      return `La guía ${mov.nro_documento} ya fue entregada`;
    }
    return null;
  }

  // Candado de guía: la registra en la carga si no está en otro control activo.
  // Devuelve null si quedó tomada, o el motivo del conflicto.
  async tomarGuia(cargaId, mov, transaction) {
    const propia = await models.Ccargag.findOne({
      where: { cod_control_carga: cargaId, cod_movimiento: mov.id },
      transaction,
    });
    if (propia) return null;
    const otra = await models.Ccargag.findOne({
      where: {
        cod_movimiento: mov.id,
        activa: true,
        cod_control_carga: { [Sequelize.Op.ne]: cargaId },
      },
      transaction,
    });
    if (otra) {
      return `La guía ${mov.nro_documento} ya está en el control CC-${otra.cod_control_carga}`;
    }
    try {
      await models.Ccargag.create(
        {
          cod_control_carga: cargaId,
          cod_movimiento: mov.id,
          nro_documento: String(mov.nro_documento),
          activa: true,
        },
        { transaction }
      );
    } catch (e) {
      // Otro usuario la tomó al mismo tiempo: lo frena el índice único
      if (e instanceof Sequelize.UniqueConstraintError) {
        return `La guía ${mov.nro_documento} ya está en otro control activo`;
      }
      throw e;
    }
    return null;
  }

  // Suelta el candado si la guía ya no tiene bultos en la carga
  async liberarGuiaSiVacia(cargaId, movId, transaction) {
    if (!movId) return;
    const n = await models.Ccargab.count({
      where: { cod_control_carga: cargaId, cod_movimiento: movId },
      transaction,
    });
    if (n === 0) {
      await models.Ccargag.destroy({
        where: { cod_control_carga: cargaId, cod_movimiento: movId },
        transaction,
      });
    }
  }

  // Registra un bulto escaneado en la carga.
  // Devuelve status OK / SOBRANTE / DUPLICADO / RECHAZADO / EN_OTRA_CARGA.
  async addBulto(id, codigo, usuario) {
    const carga = await models.Ccarga.findByPk(id);
    if (!carga) throw boom.notFound('Control de carga no existe');
    if (!ESTADOS_ACTIVA.includes(carga.estado)) {
      throw boom.conflict('La carga ya esta cerrada');
    }

    const parsed = this.parseCodigo(codigo);
    if (!parsed) throw boom.badRequest('Codigo invalido');
    const { nroGuia, nroBulto, totalEtiqueta } = parsed;
    const codNorm = `RCS-${nroGuia}-${String(nroBulto).padStart(2, '0')}`;

    // Etiqueta de Hidroca: si su total de bultos no cuadra con las piezas de
    // la guía, no se registra (formato cambiado o guía mal cargada)
    if (totalEtiqueta) {
      const movh = await this.buscarGuia(nroGuia);
      const piezas = movh ? this.datosGuia(movh).total_piezas : null;
      if (piezas && piezas !== totalEtiqueta) {
        return {
          status: 'RECHAZADO',
          motivo: `La etiqueta de Hidroca indica ${totalEtiqueta} bulto(s) y la guía ${nroGuia} tiene ${piezas} pieza(s)`,
        };
      }
    }

    // Regla de negocio: un bulto físico no puede estar cargado (escaneado) en
    // dos cargas a la vez. Si el mismo código ya está escaneado en OTRA carga
    // (cualquier estado), se bloquea. Se excluye esta misma carga para que un
    // re-escaneo acá siga siendo DUPLICADO.
    const enOtra = await models.Ccargab.findOne({
      where: {
        codigo: codNorm,
        escaneado: true,
        cod_control_carga: { [Sequelize.Op.ne]: id },
      },
    });
    if (enOtra) {
      const otra = await models.Ccarga.findByPk(enOtra.cod_control_carga);
      return {
        status: 'EN_OTRA_CARGA',
        motivo: `El bulto ${codNorm} ya está cargado en CC-${enOtra.cod_control_carga}${
          otra ? ' (' + otra.estado + ')' : ''
        }`,
        carga_id: enOtra.cod_control_carga,
      };
    }

    const existente = await models.Ccargab.findOne({
      where: { cod_control_carga: id, codigo: codNorm },
    });
    if (existente) {
      if (existente.escaneado) {
        return { status: 'DUPLICADO', bulto: existente };
      }
      // Vía oficina (top-down): el bulto estaba esperado (PENDIENTE) -> se marca
      await existente.update({
        escaneado: true,
        estado_bulto: 'OK',
        fecha_hora: moment().format('DD/MM/YYYY HH:mm:ss'),
        usuario: usuario || null,
      });
      if (carga.estado === 'ABIERTA') await carga.update({ estado: 'EN PROCESO' });
      const movc = await this.buscarGuia(nroGuia);
      return {
        status: 'OK',
        bulto: existente,
        guia: movc ? this.datosGuia(movc) : null,
      };
    }

    // No está en la carga. Si es vía oficina (tiene set esperado), es SOBRANTE.
    if (carga.via === 'OFICINA') {
      return {
        status: 'SOBRANTE',
        motivo: `El bulto ${codNorm} no pertenece a esta carga`,
      };
    }

    const mov = await this.buscarGuia(nroGuia);

    // Vía almacén (bottom-up): si la guía no existe, no se puede cargar o el
    // bulto está fuera de rango, se RECHAZA (no se registra, solo se avisa).
    if (!mov) {
      return {
        status: 'RECHAZADO',
        motivo: `La guía ${nroGuia} no existe en el sistema`,
      };
    }
    const noCargable = this.motivoGuiaNoCargable(mov);
    if (noCargable) return { status: 'RECHAZADO', motivo: noCargable };
    const d = this.datosGuia(mov);
    if (d.total_piezas && nroBulto > d.total_piezas) {
      return {
        status: 'RECHAZADO',
        motivo: `La guía ${nroGuia} tiene ${d.total_piezas} pieza(s); el bulto ${nroBulto} está fuera de rango`,
      };
    }

    const t = await sequelize.transaction();
    try {
      const conflicto = await this.tomarGuia(id, mov, t);
      if (conflicto) {
        await t.rollback();
        return { status: 'EN_OTRA_CARGA', motivo: conflicto };
      }
      const bulto = await models.Ccargab.create(
        {
          cod_control_carga: id,
          cod_movimiento: d.cod_movimiento,
          nro_documento: String(nroGuia),
          nro_bulto: nroBulto,
          codigo: codNorm,
          destino: d.destino,
          escaneado: true,
          estado_bulto: 'OK',
          fecha_hora: moment().format('DD/MM/YYYY HH:mm:ss'),
          usuario: usuario || null,
        },
        { transaction: t }
      );
      if (carga.estado === 'ABIERTA') {
        await carga.update({ estado: 'EN PROCESO' }, { transaction: t });
      }
      await t.commit();
      return { status: 'OK', bulto, guia: d };
    } catch (e) {
      await t.rollback();
      throw e;
    }
  }

  // Precarga el set esperado de varias guías (vía oficina): crea un bulto
  // PENDIENTE por pieza. Las guías que no se pueden cargar se devuelven en
  // `conflictos` con su motivo; las demás se agregan.
  // Con `soloPendientes` solo se aceptan guías en PR (aún no costeadas).
  async precargar(carga, movs, transaction, soloPendientes = false) {
    let guiasAgregadas = 0;
    let bultosCreados = 0;
    const conflictos = [];

    for (const mov of movs) {
      const nro = String(mov.nro_documento);
      const noCargable = this.motivoGuiaNoCargable(mov);
      if (noCargable) {
        conflictos.push({ nro_documento: nro, motivo: noCargable });
        continue;
      }
      if (soloPendientes && mov.estatus_operativo !== 'PR') {
        conflictos.push({
          nro_documento: nro,
          motivo: `La guía ${nro} ya fue costeada`,
        });
        continue;
      }

      const d = this.datosGuia(mov);
      const total = d.total_piezas && d.total_piezas > 0 ? d.total_piezas : 1;
      const codigos = [];
      for (let i = 1; i <= total; i++) {
        codigos.push(`RCS-${nro}-${String(i).padStart(2, '0')}`);
      }

      // Bultos de la guía ya escaneados en otra carga no se vuelven a esperar
      const yaCargados = await models.Ccargab.findAll({
        attributes: ['codigo'],
        where: {
          codigo: codigos,
          escaneado: true,
          cod_control_carga: { [Sequelize.Op.ne]: carga.id },
        },
        transaction,
      });
      const setCargados = new Set(yaCargados.map((b) => b.codigo));
      const existentes = await models.Ccargab.findAll({
        attributes: ['codigo'],
        where: { cod_control_carga: carga.id, codigo: codigos },
        transaction,
      });
      const setExistentes = new Set(existentes.map((b) => b.codigo));
      const nuevos = codigos.filter(
        (c) => !setCargados.has(c) && !setExistentes.has(c)
      );

      if (nuevos.length === 0) {
        if (setExistentes.size === 0) {
          conflictos.push({
            nro_documento: nro,
            motivo: `Todos los bultos de la guía ${nro} ya fueron cargados en otro control`,
          });
        }
        continue;
      }

      const conflicto = await this.tomarGuia(carga.id, mov, transaction);
      if (conflicto) {
        conflictos.push({ nro_documento: nro, motivo: conflicto });
        continue;
      }

      await models.Ccargab.bulkCreate(
        nuevos.map((codigo) => ({
          cod_control_carga: carga.id,
          cod_movimiento: d.cod_movimiento,
          nro_documento: nro,
          nro_bulto: parseInt(codigo.split('-')[2], 10),
          codigo,
          destino: d.destino,
          escaneado: false,
          estado_bulto: 'PENDIENTE',
        })),
        { transaction }
      );
      guiasAgregadas++;
      bultosCreados += nuevos.length;
    }

    if (guiasAgregadas > 0 && carga.via !== 'OFICINA') {
      await carga.update({ via: 'OFICINA' }, { transaction });
    }
    return {
      guias_agregadas: guiasAgregadas,
      bultos_creados: bultosCreados,
      conflictos,
    };
  }

  async cargaActiva(id, transaction) {
    const carga = await models.Ccarga.findByPk(id, { transaction });
    if (!carga) throw boom.notFound('Control de carga no existe');
    if (!ESTADOS_ACTIVA.includes(carga.estado)) {
      throw boom.conflict('La carga ya esta cerrada');
    }
    return carga;
  }

  // Control activo del mismo costo, o del mismo chofer + vehículo + fecha
  async buscarActivaMismoCamion(data, transaction) {
    if (data.cod_costo) {
      const porCosto = await models.Ccarga.findOne({
        where: { cod_costo: data.cod_costo, estado: ESTADOS_ACTIVA },
        order: [['id', 'DESC']],
        transaction,
      });
      if (porCosto) return porCosto;
    }
    if (!data.cod_agente || !data.cod_unidad) return null;
    // Por la llave del camión solo se une a un control sin costo (p. ej. uno
    // que el almacén empezó a escanear) o del mismo costo: si la oficina no
    // unificó los costos, tampoco se unifican los controles.
    return models.Ccarga.findOne({
      where: {
        cod_agente: data.cod_agente,
        cod_unidad: data.cod_unidad,
        fecha: normFecha(data.fecha),
        estado: ESTADOS_ACTIVA,
        [Sequelize.Op.or]: [
          { cod_costo: null },
          ...(data.cod_costo ? [{ cod_costo: data.cod_costo }] : []),
        ],
      },
      order: [['id', 'DESC']],
      transaction,
    });
  }

  // --- Sincronización con Registro de Costos (piloto) ---------------------
  // El control nacido de un costo lo representa: si en el costo se saca una
  // guía o se elimina el costo, el control lo sigue. Solo se tocan controles
  // abiertos / en proceso; si ya se cerró (el camión salió), queda la
  // diferencia para el análisis del piloto.

  // Se sacó la guía `movId` del costo `codCosto`
  async alQuitarGuiaDeCosto(codCosto, movId) {
    const cargas = await models.Ccarga.findAll({
      where: { cod_costo: codCosto, estado: ESTADOS_ACTIVA },
    });
    const resultado = [];
    for (const carga of cargas) {
      const bultos = await models.Ccargab.findAll({
        where: { cod_control_carga: carga.id, cod_movimiento: movId },
      });
      if (!bultos.length) continue;
      // Si ya subió algún bulto, la guía se queda en el control (sí viajó)
      if (bultos.some((b) => b.escaneado)) {
        resultado.push({ id: carga.id, quitada: false, motivo: 'tiene bultos escaneados' });
        continue;
      }
      const t = await sequelize.transaction();
      try {
        await models.Ccargab.destroy({
          where: { cod_control_carga: carga.id, cod_movimiento: movId },
          transaction: t,
        });
        await models.Ccargag.destroy({
          where: { cod_control_carga: carga.id, cod_movimiento: movId },
          transaction: t,
        });
        await t.commit();
      } catch (e) {
        await t.rollback();
        throw e;
      }
      resultado.push({ id: carga.id, quitada: true });
    }
    return resultado;
  }

  // Se eliminó el costo `codCosto`: el control abierto sin nada escaneado se
  // elimina; si ya tiene escaneos o está cerrado, solo pierde el vínculo y
  // queda como un control del almacén (al cerrarse sale POR COSTEAR)
  async alEliminarCosto(codCosto) {
    const cargas = await models.Ccarga.findAll({ where: { cod_costo: codCosto } });
    const resultado = [];
    for (const carga of cargas) {
      const nEsc = await models.Ccargab.count({
        where: { cod_control_carga: carga.id, escaneado: true },
      });
      const t = await sequelize.transaction();
      try {
        if (ESTADOS_ACTIVA.includes(carga.estado) && nEsc === 0) {
          await models.Ccargab.destroy({ where: { cod_control_carga: carga.id }, transaction: t });
          await models.Ccargag.destroy({ where: { cod_control_carga: carga.id }, transaction: t });
          await carga.destroy({ transaction: t });
          resultado.push({ id: carga.id, eliminado: true });
        } else {
          await carga.update({ cod_costo: null }, { transaction: t });
          resultado.push({ id: carga.id, eliminado: false });
        }
        await t.commit();
      } catch (e) {
        await t.rollback();
        throw e;
      }
    }
    return resultado;
  }

  // Precarga de una guía por número (app de escaneo, vía oficina)
  async addEsperado(id, nroGuia) {
    const parsed = String(nroGuia || '').trim().match(/^\d+$/);
    if (!parsed) throw boom.badRequest('Número de guía inválido');
    const mov = await this.buscarGuia(nroGuia);
    if (!mov) {
      throw boom.badRequest(`La guía ${nroGuia} no existe en el sistema`);
    }
    const t = await sequelize.transaction();
    try {
      const carga = await this.cargaActiva(id, t);
      const r = await this.precargar(carga, [mov], t);
      if (r.conflictos.length) {
        await t.rollback();
        throw boom.conflict(r.conflictos[0].motivo);
      }
      await t.commit();
      return {
        creados: r.bultos_creados,
        total: mov.nro_piezas > 0 ? Number(mov.nro_piezas) : 1,
        guia: this.datosGuia(mov),
      };
    } catch (e) {
      if (!t.finished) await t.rollback();
      throw e;
    }
  }

  // Busca las guías por id (cod_movimiento) y/o por número
  async buscarGuias({ ids = [], nros = [] }, transaction) {
    const movs = [];
    const noEncontradas = [];
    if (ids.length) {
      const porId = await models.Mmovimientos.findAll({
        where: { id: ids },
        include: INCLUDE_GUIA,
        transaction,
      });
      movs.push(...porId);
      const vistos = new Set(porId.map((m) => String(m.id)));
      ids
        .filter((i) => !vistos.has(String(i)))
        .forEach((i) =>
          noEncontradas.push({ nro_documento: `id ${i}`, motivo: 'La guía no existe' })
        );
    }
    for (const nro of nros) {
      const n = String(nro).trim();
      if (!/^\d+$/.test(n)) {
        noEncontradas.push({ nro_documento: n, motivo: 'Número de guía inválido' });
        continue;
      }
      const mov = await this.buscarGuia(n, { transaction });
      if (mov) movs.push(mov);
      else
        noEncontradas.push({
          nro_documento: n,
          motivo: `La guía ${n} no existe en el sistema`,
        });
    }
    // Sin repetidos
    const unicos = [...new Map(movs.map((m) => [m.id, m])).values()];
    return { movs: unicos, noEncontradas };
  }

  // Precarga de varias guías en una carga existente (pantalla del SCEN)
  async addEsperados(id, data) {
    const t = await sequelize.transaction();
    try {
      const carga = await this.cargaActiva(id, t);
      const { movs, noEncontradas } = await this.buscarGuias(
        { ids: data.guias || [], nros: data.nros || [] },
        t
      );
      const r = await this.precargar(carga, movs, t);
      r.conflictos.unshift(...noEncontradas);
      await t.commit();
      return r;
    } catch (e) {
      if (!t.finished) await t.rollback();
      throw e;
    }
  }

  // Genera un control de carga desde la oficina (relación de despacho en modo
  // operativa, o la pantalla de Control de Carga): crea uno nuevo o agrega a
  // `cod_control_carga`. Las guías llegan por id (`guias`) y/o por número
  // (`nros`). No toca las guías ni costos. Si se iba a crear uno nuevo y
  // ninguna guía se pudo agregar, no se crea.
  // - `solo_pendientes`: solo guías en PR (relación de despacho operativa).
  // - `cod_costo`: costo con el que nació (relación de costos). Es solo una
  //   referencia; no aplica ninguna regla sobre el costo.
  // - `unir_existente`: si no viene `cod_control_carga`, se busca un control
  //   activo del mismo costo o, si no, del mismo chofer + vehículo + fecha (la
  //   llave del costo) y se le agregan las guías; si no hay, se crea uno.
  async generar(data) {
    const ids = Array.isArray(data.guias) ? data.guias : [];
    const nros = Array.isArray(data.nros) ? data.nros : [];
    if (!ids.length && !nros.length) {
      throw boom.badRequest('No hay guías seleccionadas');
    }
    const t = await sequelize.transaction();
    try {
      let carga;
      let creada = false;
      if (!data.cod_control_carga && data.unir_existente) {
        const existente = await this.buscarActivaMismoCamion(data, t);
        if (existente) data.cod_control_carga = existente.id;
      }
      if (data.cod_control_carga) {
        carga = await this.cargaActiva(data.cod_control_carga, t);
      } else {
        carga = await this.create({ ...data, via: 'OFICINA' }, { transaction: t });
        creada = true;
      }
      if (data.cod_costo && !carga.cod_costo) {
        await carga.update({ cod_costo: data.cod_costo }, { transaction: t });
      }
      const { movs, noEncontradas } = await this.buscarGuias({ ids, nros }, t);

      // Guías que ya subieron en un control cerrado sin costo (el almacén
      // escaneó y cerró antes de costear): ese control queda vinculado a
      // este costo y deja de estar POR COSTEAR.
      const vinculados = [];
      const nrosVinculados = new Set();
      if (data.cod_costo && data.unir_existente && movs.length) {
        const filas = await models.Ccargag.findAll({
          where: { cod_movimiento: movs.map((m) => m.id) },
          include: [
            {
              association: 'carga',
              attributes: ['id'],
              where: { estado: ESTADOS_CERRADA, cod_costo: null },
            },
          ],
          transaction: t,
        });
        for (const f of filas) {
          if (!vinculados.includes(f.cod_control_carga)) {
            vinculados.push(f.cod_control_carga);
          }
          nrosVinculados.add(String(f.nro_documento));
        }
        if (vinculados.length) {
          await models.Ccarga.update(
            { cod_costo: data.cod_costo },
            { where: { id: vinculados }, transaction: t }
          );
        }
      }

      const r = await this.precargar(carga, movs, t, !!data.solo_pendientes);
      r.conflictos = r.conflictos.filter(
        (c) => !nrosVinculados.has(String(c.nro_documento))
      );
      r.conflictos.unshift(...noEncontradas);
      r.vinculados = vinculados;
      if (creada && r.guias_agregadas === 0) {
        if (!vinculados.length) {
          await t.rollback();
          return { id: null, creada: false, ...r };
        }
        // Todo ya estaba cargado: no hace falta un control nuevo, pero se
        // conserva el vínculo del costo con los controles cerrados
        await carga.destroy({ transaction: t });
        await t.commit();
        return { id: null, creada: false, ...r };
      }
      await t.commit();
      return { id: carga.id, creada, ...r };
    } catch (e) {
      if (!t.finished) await t.rollback();
      throw e;
    }
  }

  async deleteBulto(cargaId, bultoId, usuario) {
    const carga = await models.Ccarga.findByPk(cargaId);
    if (!carga) throw boom.notFound('Control de carga no existe');
    if (!ESTADOS_ACTIVA.includes(carga.estado)) {
      throw boom.conflict('La carga ya esta cerrada');
    }
    // Control nacido de un costo: sus bultos son los del costo y no se
    // quitan; solo se puede deshacer un escaneo (vuelve a PENDIENTE)
    if (carga.cod_costo) {
      const esperado = await models.Ccargab.findOne({
        where: { id: bultoId, cod_control_carga: cargaId },
      });
      if (!esperado) throw boom.notFound('Bulto no existe en esta carga');
      if (!esperado.escaneado) throw boom.conflict(MSG_CON_COSTO);
      await esperado.update({
        escaneado: false,
        estado_bulto: 'PENDIENTE',
        fecha_hora: null,
        usuario: null,
      });
      const nEsc = await models.Ccargab.count({
        where: { cod_control_carga: cargaId, escaneado: true },
      });
      if (nEsc === 0 && carga.estado === 'EN PROCESO') {
        await carga.update({ estado: 'ABIERTA' });
      }
      return { id: bultoId, desmarcado: true };
    }
    // Solo quien creó la carga puede quitarle bultos
    if (usuario && carga.usuario && carga.usuario !== usuario) {
      throw boom.forbidden('Solo quien creó la carga puede quitar bultos');
    }
    const bulto = await models.Ccargab.findOne({
      where: { id: bultoId, cod_control_carga: cargaId },
    });
    if (!bulto) throw boom.notFound('Bulto no existe en esta carga');
    const t = await sequelize.transaction();
    try {
      await bulto.destroy({ transaction: t });
      await this.liberarGuiaSiVacia(cargaId, bulto.cod_movimiento, t);
      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
    const n = await models.Ccargab.count({
      where: { cod_control_carga: cargaId },
    });
    if (n === 0 && carga.estado === 'EN PROCESO') {
      await carga.update({ estado: 'ABIERTA' });
    }
    return { id: bultoId, bultos_restantes: n };
  }

  // Quita una guía completa (todos sus bultos) de la carga
  async deleteGuia(cargaId, movId, usuario) {
    const carga = await models.Ccarga.findByPk(cargaId);
    if (!carga) throw boom.notFound('Control de carga no existe');
    if (!ESTADOS_ACTIVA.includes(carga.estado)) {
      throw boom.conflict('La carga ya esta cerrada');
    }
    if (carga.cod_costo) throw boom.conflict(MSG_CON_COSTO);
    if (usuario && carga.usuario && carga.usuario !== usuario) {
      throw boom.forbidden('Solo quien creó la carga puede quitar guías');
    }
    const t = await sequelize.transaction();
    try {
      const n = await models.Ccargab.destroy({
        where: { cod_control_carga: cargaId, cod_movimiento: movId },
        transaction: t,
      });
      await models.Ccargag.destroy({
        where: { cod_control_carga: cargaId, cod_movimiento: movId },
        transaction: t,
      });
      await t.commit();
      return { cod_movimiento: movId, bultos_eliminados: n };
    } catch (e) {
      await t.rollback();
      throw e;
    }
  }

  async cerrar(id, estado, usuario) {
    const carga = await models.Ccarga.findByPk(id);
    if (!carga) throw boom.notFound('Control de carga no existe');
    if (!ESTADOS_ACTIVA.includes(carga.estado)) {
      throw boom.conflict('La carga ya esta cerrada');
    }
    const nEscaneados = await models.Ccargab.count({
      where: { cod_control_carga: id, escaneado: true },
    });
    if (nEscaneados === 0) {
      throw boom.badRequest(
        'No se puede cerrar una carga sin bultos escaneados'
      );
    }
    // Si no se indica el estado (cierre desde el SCEN) se detecta solo
    const nPendientes = await models.Ccargab.count({
      where: { cod_control_carga: id, escaneado: false },
    });
    const permitidos = ['CERRADA COMPLETA', 'CERRADA CON FALTANTES'];
    const nuevo = permitidos.includes(estado)
      ? estado
      : nPendientes > 0
      ? 'CERRADA CON FALTANTES'
      : 'CERRADA COMPLETA';
    const t = await sequelize.transaction();
    try {
      const rta = await carga.update({ estado: nuevo }, { transaction: t });
      // Al cerrar se suelta el candado: las guías con faltantes pueden ir en
      // otro control; los bultos ya escaneados siguen bloqueados por bulto.
      await models.Ccargag.update(
        { activa: null },
        { where: { cod_control_carga: id }, transaction: t }
      );
      await t.commit();
      return rta;
    } catch (e) {
      await t.rollback();
      throw e;
    }
  }

  // Solo se permiten cambiar chofer, vehículo, fecha y observación
  async update(id, changes) {
    const carga = await models.Ccarga.findByPk(id);
    if (!carga) throw boom.notFound('Control de carga no existe');
    const permitidos = {};
    if (changes.observacion !== undefined) {
      permitidos.observacion = changes.observacion || null;
    }
    if (changes.fecha !== undefined) permitidos.fecha = normFecha(changes.fecha);
    Object.assign(
      permitidos,
      await this.datosCatalogo({
        cod_agente: changes.cod_agente,
        cod_unidad: changes.cod_unidad,
      })
    );
    const rta = await carga.update(permitidos);
    return rta;
  }

  async delete(id, usuario) {
    const carga = await models.Ccarga.findByPk(id);
    if (!carga) throw boom.notFound('Control de carga no existe');
    // En el piloto el costo nace primero: un control con costo no se elimina
    if (carga.cod_costo) throw boom.conflict(MSG_CON_COSTO);
    // Solo quien creó la carga puede eliminarla
    if (usuario && carga.usuario && carga.usuario !== usuario) {
      throw boom.forbidden('Solo quien creó la carga puede eliminarla');
    }
    const t = await sequelize.transaction();
    try {
      await models.Ccargab.destroy({ where: { cod_control_carga: id }, transaction: t });
      await models.Ccargag.destroy({ where: { cod_control_carga: id }, transaction: t });
      await carga.destroy({ transaction: t });
      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
    return { id };
  }
}

module.exports = ControlCargaService;
