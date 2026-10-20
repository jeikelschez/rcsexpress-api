const boom = require('@hapi/boom');
const moment = require('moment');

const { models, Sequelize } = require('./../libs/sequelize');

const ESTADOS_CERRADA = ['CERRADA COMPLETA', 'CERRADA CON FALTANTES', 'COSTEADA'];

class ControlCargaService {
  constructor() {}

  // RCS-[guia]-[NN] o [guia]-[NN]  ->  { nroGuia, nroBulto }
  parseCodigo(codigo) {
    const m = String(codigo || '')
      .trim()
      .toUpperCase()
      .match(/^(?:RCS-)?(\d+)-(\d+)$/);
    if (!m) return null;
    return { nroGuia: m[1], nroBulto: parseInt(m[2], 10) };
  }

  async create(data) {
    const payload = {
      cod_agencia: data.cod_agencia,
      vehiculo: data.vehiculo || null,
      chofer: data.chofer || null,
      fecha: data.fecha || moment().format('DD/MM/YYYY'),
      estado: 'ABIERTA',
      via: data.via || 'ALMACEN',
      usuario: data.usuario || null,
      observacion: data.observacion || null,
    };
    const nueva = await models.Ccarga.create(payload);
    return nueva;
  }

  async find(agencia, estado) {
    const where = {};
    if (agencia) where.cod_agencia = agencia;
    if (estado) where.estado = estado;
    const cargas = await models.Ccarga.findAll({
      where,
      include: [
        { association: 'agencias', attributes: ['id', 'nb_agencia'] },
        { association: 'bultos', attributes: ['id', 'estado_bulto'], separate: true },
      ],
      order: [['id', 'DESC']],
    });
    return cargas;
  }

  async findOne(id) {
    const carga = await models.Ccarga.findByPk(id, {
      include: [
        { association: 'agencias', attributes: ['id', 'nb_agencia'] },
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

  async buscarGuia(nroGuia) {
    return models.Mmovimientos.findOne({
      where: { nro_documento: nroGuia },
      include: [
        { association: 'agencias_dest', attributes: ['id', 'nb_agencia'] },
        { association: 'zonas_dest', attributes: ['id', 'nb_zona'] },
        { association: 'clientes_dest', attributes: ['id', 'nb_cliente'] },
        { association: 'clientes_org', attributes: ['id', 'nb_cliente'] },
      ],
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

  // Registra un bulto escaneado en la carga. Devuelve status OK / SOBRANTE / DUPLICADO.
  async addBulto(id, codigo, usuario) {
    const carga = await models.Ccarga.findByPk(id);
    if (!carga) throw boom.notFound('Control de carga no existe');
    if (ESTADOS_CERRADA.includes(carga.estado)) {
      throw boom.conflict('La carga ya esta cerrada');
    }

    const parsed = this.parseCodigo(codigo);
    if (!parsed) throw boom.badRequest('Codigo invalido');
    const { nroGuia, nroBulto } = parsed;
    const codNorm = `RCS-${nroGuia}-${String(nroBulto).padStart(2, '0')}`;

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

    // Vía almacén (bottom-up): si la guía no existe o el bulto está fuera de
    // rango, se RECHAZA (no se registra, solo se avisa).
    if (!mov) {
      return {
        status: 'RECHAZADO',
        motivo: `La guía ${nroGuia} no existe en el sistema`,
      };
    }
    const d = this.datosGuia(mov);
    if (d.total_piezas && nroBulto > d.total_piezas) {
      return {
        status: 'RECHAZADO',
        motivo: `La guía ${nroGuia} tiene ${d.total_piezas} pieza(s); el bulto ${nroBulto} está fuera de rango`,
      };
    }

    const bulto = await models.Ccargab.create({
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
    });

    if (carga.estado === 'ABIERTA') await carga.update({ estado: 'EN PROCESO' });

    return { status: 'OK', bulto, guia: d };
  }

  // Pre-carga (manual) del set esperado de una guía en la carga (vía oficina):
  // crea un bulto PENDIENTE por cada pieza de la guía.
  async addEsperado(id, nroGuia) {
    const carga = await models.Ccarga.findByPk(id);
    if (!carga) throw boom.notFound('Control de carga no existe');
    if (ESTADOS_CERRADA.includes(carga.estado)) {
      throw boom.conflict('La carga ya esta cerrada');
    }
    const parsed = String(nroGuia || '').trim().match(/^\d+$/);
    if (!parsed) throw boom.badRequest('Número de guía inválido');
    const mov = await this.buscarGuia(nroGuia);
    if (!mov) {
      throw boom.badRequest(`La guía ${nroGuia} no existe en el sistema`);
    }
    const d = this.datosGuia(mov);
    const total = d.total_piezas && d.total_piezas > 0 ? d.total_piezas : 1;
    let creados = 0;
    for (let i = 1; i <= total; i++) {
      const codNorm = `RCS-${nroGuia}-${String(i).padStart(2, '0')}`;
      const existe = await models.Ccargab.findOne({
        where: { cod_control_carga: id, codigo: codNorm },
      });
      if (existe) continue;
      await models.Ccargab.create({
        cod_control_carga: id,
        cod_movimiento: d.cod_movimiento,
        nro_documento: String(nroGuia),
        nro_bulto: i,
        codigo: codNorm,
        destino: d.destino,
        escaneado: false,
        estado_bulto: 'PENDIENTE',
      });
      creados++;
    }
    if (carga.via !== 'OFICINA') await carga.update({ via: 'OFICINA' });
    return { creados, total, guia: d };
  }

  async deleteBulto(cargaId, bultoId, usuario) {
    const carga = await models.Ccarga.findByPk(cargaId);
    if (!carga) throw boom.notFound('Control de carga no existe');
    // Solo quien creó la carga puede quitarle bultos
    if (usuario && carga.usuario && carga.usuario !== usuario) {
      throw boom.forbidden('Solo quien creó la carga puede quitar bultos');
    }
    const bulto = await models.Ccargab.findOne({
      where: { id: bultoId, cod_control_carga: cargaId },
    });
    if (!bulto) throw boom.notFound('Bulto no existe en esta carga');
    await bulto.destroy();
    const n = await models.Ccargab.count({
      where: { cod_control_carga: cargaId },
    });
    if (n === 0 && carga.estado === 'EN PROCESO') {
      await carga.update({ estado: 'ABIERTA' });
    }
    return { id: bultoId, bultos_restantes: n };
  }

  async cerrar(id, estado, usuario) {
    const carga = await models.Ccarga.findByPk(id);
    if (!carga) throw boom.notFound('Control de carga no existe');
    const nEscaneados = await models.Ccargab.count({
      where: { cod_control_carga: id, escaneado: true },
    });
    if (nEscaneados === 0) {
      throw boom.badRequest(
        'No se puede cerrar una carga sin bultos escaneados'
      );
    }
    const permitidos = ['CERRADA COMPLETA', 'CERRADA CON FALTANTES'];
    const nuevo = permitidos.includes(estado) ? estado : 'CERRADA COMPLETA';
    const rta = await carga.update({ estado: nuevo });
    return rta;
  }

  async update(id, changes) {
    const carga = await models.Ccarga.findByPk(id);
    if (!carga) throw boom.notFound('Control de carga no existe');
    const rta = await carga.update(changes);
    return rta;
  }

  async delete(id, usuario) {
    const carga = await models.Ccarga.findByPk(id);
    if (!carga) throw boom.notFound('Control de carga no existe');
    // Solo quien creó la carga puede eliminarla
    if (usuario && carga.usuario && carga.usuario !== usuario) {
      throw boom.forbidden('Solo quien creó la carga puede eliminarla');
    }
    await carga.destroy();
    return { id };
  }
}

module.exports = ControlCargaService;
