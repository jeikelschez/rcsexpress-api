const express = require('express');

const BancosRouter = require('./bancos.router');

function routerApi(app) {
  const router = express.Router();
  app.use('/api/v1', router);
  router.use('/bancos', BancosRouter);
}

module.exports = routerApi;
