const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

const BancosRouter = require('./bancos.router');

function routerApi(app) {
  const router = express.Router();

  app.use('/api', router);
  router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use('/api/v1', router);
  router.use('/bancos', BancosRouter);
}

module.exports = routerApi;
