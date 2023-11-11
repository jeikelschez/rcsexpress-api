const express = require('express');
const logger = require('./../config/logger');

const MmovimientosService = require('./../services/maestroMovimientos.service');
const validatorHandler = require('./../middlewares/validator.handler');
const {
  createMmovimientosSchema,
  updateMmovimientosSchema,
  getMmovimientosSchema,
} = require('./../schemas/maestroMovimientos.schema');
const authenticateJWT = require('./../middlewares/authenticate.handler');

const router = express.Router();
const service = new MmovimientosService();

router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const {
      page,
      limit,
      orderBy,
      orderDirection,
      filter,
      filterValue,
      agencia,
      agencia_transito,
      agencia_dest,
      agencia_dest_transito,
      nro_documento,
      tipo,
      tipo_in,
      desde,
      hasta,
      cliente_orig,
      cliente_dest,
      cliente_orig_exist,
      cliente_part_exist,
      estatus_oper,
      transito,
      estatus_admin_in,
      estatus_admin_ex,
      no_abono,
      tipo_doc_ppal,
      nro_doc_ppal,
      serie_doc_ppal,
      nro_ctrl_doc_ppal,
      nro_ctrl_doc_ppal_new,
      cod_ag_doc_ppal,
      order_pe,
      pagado_en,
      modalidad,
      prefix_nro,
      include_zona,
      no_pagada,
      si_saldo,
    } = req.headers;

    logger.info(si_saldo);

    const cguias = await service.find(
      page,
      limit,
      orderBy,
      orderDirection,
      filter,
      filterValue,
      agencia,
      agencia_transito,
      agencia_dest,
      agencia_dest_transito,
      nro_documento,
      tipo,
      tipo_in,
      desde,
      hasta,
      cliente_orig,
      cliente_dest,
      cliente_orig_exist,
      cliente_part_exist,
      estatus_oper,
      transito,
      estatus_admin_in,
      estatus_admin_ex,
      no_abono,
      tipo_doc_ppal,
      nro_doc_ppal,
      serie_doc_ppal,
      nro_ctrl_doc_ppal,
      nro_ctrl_doc_ppal_new,
      cod_ag_doc_ppal,
      order_pe,
      pagado_en,
      modalidad,
      prefix_nro,
      include_zona,
      no_pagada,
      si_saldo
    );
    res.json(cguias);
  } catch (error) {
    next(error);
  }
});

router.get('/letterPDF', authenticateJWT, async (req, res, next) => {
  try {
    const { data, cliente, contacto, cargo, ciudad } = req.headers;
    const pdfStream = await service.letterPDF(
      data,
      cliente,
      contacto,
      cargo,
      ciudad
    );
    res.status(200).json({
      message: 'PDF Generado',
      base64: pdfStream,
    });
  } catch (error) {
    next(error);
  }
});

router.get(
  '/:id',
  authenticateJWT,
  validatorHandler(getMmovimientosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const mMovimiento = await service.findOne(id);
      res.json(mMovimiento);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  authenticateJWT,
  validatorHandler(createMmovimientosSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newMmovimiento = await service.create(body);
      res.status(201).json(newMmovimiento);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  authenticateJWT,
  validatorHandler(getMmovimientosSchema, 'params'),
  validatorHandler(updateMmovimientosSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const mMovimiento = await service.update(id, body);
      res.json(mMovimiento);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  authenticateJWT,
  validatorHandler(getMmovimientosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.delete(id);
      res.status(201).json({ id });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
