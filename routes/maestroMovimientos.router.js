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
      agenciaTransito,
      agenciaDest,
      agenciaDestTransito,
      nroDocumento,
      tipo,
      tipoIn,
      desde,
      hasta,
      clienteOrig,
      clienteDest,
      clienteOrigExist,
      clientePartExist,
      estatusOper,
      transito,
      estatusAdminIn,
      estatusAdminEx,
      noAbono,
      tipoDocPpal,
      nroDocPpal,
      serieDocPpal,
      nroCtrlDocPpal,
      nroCtrlDocPpalNew,
      codAgDocPpal,
      orderPe,
      pagadoEn,
      modalidad,
      prefixNro,
      includeZona,
      noPagada,
      siSaldo,
    } = req.headers;

    logger.info(JSON.stringify(req.headers));

    const cguias = await service.find(
      page,
      limit,
      orderBy,
      orderDirection,
      filter,
      filterValue,
      agencia,
      agenciaTransito,
      agenciaDest,
      agenciaDestTransito,
      nroDocumento,
      tipo,
      tipoIn,
      desde,
      hasta,
      clienteOrig,
      clienteDest,
      clienteOrigExist,
      clientePartExist,
      estatusOper,
      transito,
      estatusAdminIn,
      estatusAdminEx,
      noAbono,
      tipoDocPpal,
      nroDocPpal,
      serieDocPpal,
      nroCtrlDocPpal,
      nroCtrlDocPpalNew,
      codAgDocPpal,
      orderPe,
      pagadoEn,
      modalidad,
      prefixNro,
      includeZona,
      noPagada,
      siSaldo
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
