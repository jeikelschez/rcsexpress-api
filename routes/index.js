const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

const BancosRouter = require('./bancos.router');
const PaisesRouter = require('./paises.router');
const EstadosRouter = require('./estados.router');
const CiudadesRouter = require('./ciudades.router');
const AgenciasRouter = require('./agencias.router');

function routerApi(app) {
  const router = express.Router();

  app.use('/api/v1', router);
  router.use('/bancos', BancosRouter);
  router.use('/paises', PaisesRouter);
  router.use('/estados', EstadosRouter);
  router.use('/ciudades', CiudadesRouter);
  router.use('/agencias', AgenciasRouter);
  router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

module.exports = routerApi;
