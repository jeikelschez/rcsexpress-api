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
const AgentesRouter = require('./agentes.router');
const MunicipiosRouter = require('./municipios.router');
const ParroquiasRouter = require('./parroquias.router');
const LocalidadesRouter = require('./localidades.router');
const ClientesRouter = require('./clientes.router');
const AyudantesRouter = require('./ayudantes.router');
const ZonasRouter = require('./zonas.router');
const UnidadesRouter = require('./unidades.router');
const ProveedoresRouter = require('./proveedores.router');
const ReceptoresRouter = require('./receptores.router');
const TarifasRouter = require('./tarifas.router');

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
  router.use('/agentes', AgentesRouter);
  router.use('/municipios', MunicipiosRouter);
  router.use('/parroquias', ParroquiasRouter);
  router.use('/localidades', LocalidadesRouter);
  router.use('/clientes', ClientesRouter);
  router.use('/ayudantes', AyudantesRouter);
  router.use('/zonas', ZonasRouter);
  router.use('/unidades', UnidadesRouter);
  router.use('/proveedores', ProveedoresRouter);
  router.use('/receptores', ReceptoresRouter);
  router.use('/tarifas', TarifasRouter);
  router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

module.exports = routerApi;
