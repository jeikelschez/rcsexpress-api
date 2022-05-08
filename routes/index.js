const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

const BancosRouter = require('./bancos.router');
const PaisesRouter = require('./paises.router');
const EstadosRouter = require('./estados.router');
const CiudadesRouter = require('./ciudades.router');
const AgenciasRouter = require('./agencias.router');
const RolesRouter = require('./roles.router');
const ObjetosRouter = require('./objetos.router');
const PermisosRouter = require('./permisos.router');
const UsuariosRouter = require('./usuarios.router');
const CuentasRouter = require('./cuentas.router');

function routerApi(app) {
  const router = express.Router();

  app.use('/api/v1', router);
  router.use('/bancos', BancosRouter);
  router.use('/paises', PaisesRouter);
  router.use('/estados', EstadosRouter);
  router.use('/ciudades', CiudadesRouter);
  router.use('/agencias', AgenciasRouter);
  router.use('/roles', RolesRouter);
  router.use('/objetos', ObjetosRouter);
  router.use('/permisos', PermisosRouter);
  router.use('/usuarios', UsuariosRouter);
  router.use('/cuentas', CuentasRouter);
  router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

module.exports = routerApi;
