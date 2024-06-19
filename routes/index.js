const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

const BancosRouter = require('./bancos.router');
const PaisesRouter = require('./paises.router');
const EstadosRouter = require('./estados.router');
const CiudadesRouter = require('./ciudades.router');
const AgenciasRouter = require('./agencias.router');
const RolesRouter = require('./roles.router');
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
const FposRouter = require('./fpos.router');
const MretencionesRouter = require('./maestroRetenciones.router');
const CoperacionRouter = require('./conceptosOperacion.router');
const CfacturacionRouter = require('./conceptosFacturacion.router');
const EmpleadosRouter = require('./empleados.router');
const CorrelativoRouter = require('./controlCorrelativo.router');
const TiposRouter = require('./tipos.router');
const CguiasRouter = require('./controlGuias.router');
const VcontrolRouter = require('./variableControl.router');
const MmovimientosRouter = require('./maestroMovimientos.router');
const DmovimientosRouter = require('./detalleMovimientos.router');
const CparticularesRouter = require('./clientesParticulares.router');
const GinutilizadasRouter = require('./guiasInutilizadas.router');
const MenusRouter = require('./menus.router');
const AccionesRouter = require('./menusAcciones.router');
const RpermisosRouter = require('./rolesPermisos.router');
const HdolarRouter = require('./historicoDolar.router');
const CcomisionesRouter = require('./controlComisiones.router');
const PdfReportsRouter = require('./pdfReports.router');
const ExcelReportsRouter = require('./excelReports.router');
const CostosRouter = require('./costosTransporte.router');
const DcostosRouter = require('./detalleCostos.router');
const DcostosgRouter = require('./detalleCostosGuias.router');
const McobranzasRouter = require('./maestroCobranzas.router');
const DcobranzasRouter = require('./detalleCobranzas.router');
const MctapagarRouter = require('./maestroCtaPagar.router');
const PgeneradosRouter = require('./pagosGenerados.router');
const CislrRouter = require('./controlIslr.router');
const CislrfacRouter = require('./controlIslrFactura.router');
const MbancariosRouter = require('./movimientosBancarios.router');
const ClientesUsuariosRouter = require('./clientesUsuarios.router');
const DgastosRouter = require('./distribucionGastos.router');

function routerApi(app) {
  const router = express.Router();

  app.use('/api/v1', router);
  router.use('/bancos', BancosRouter);
  router.use('/paises', PaisesRouter);
  router.use('/estados', EstadosRouter);
  router.use('/ciudades', CiudadesRouter);
  router.use('/agencias', AgenciasRouter);
  router.use('/roles', RolesRouter);
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
  router.use('/fpos', FposRouter);
  router.use('/mretenciones', MretencionesRouter);
  router.use('/coperacion', CoperacionRouter);
  router.use('/cfacturacion', CfacturacionRouter);
  router.use('/empleados', EmpleadosRouter);
  router.use('/correlativo', CorrelativoRouter);
  router.use('/tipos', TiposRouter);
  router.use('/cguias', CguiasRouter);
  router.use('/vcontrol', VcontrolRouter);
  router.use('/mmovimientos', MmovimientosRouter);
  router.use('/dmovimientos', DmovimientosRouter);
  router.use('/cparticulares', CparticularesRouter);
  router.use('/ginutilizadas', GinutilizadasRouter);
  router.use('/menus', MenusRouter);
  router.use('/acciones', AccionesRouter);
  router.use('/rpermisos', RpermisosRouter);
  router.use('/hdolar', HdolarRouter);
  router.use('/ccomisiones', CcomisionesRouter);
  router.use('/pdfreports', PdfReportsRouter);
  router.use('/excelreports', ExcelReportsRouter);
  router.use('/costos', CostosRouter);
  router.use('/dcostos', DcostosRouter);
  router.use('/dcostosg', DcostosgRouter);
  router.use('/mcobranzas', McobranzasRouter);
  router.use('/dcobranzas', DcobranzasRouter);
  router.use('/mctapagar', MctapagarRouter);
  router.use('/pgenerados', PgeneradosRouter);
  router.use('/cislr', CislrRouter);
  router.use('/cislrfac', CislrfacRouter);
  router.use('/mbancarios', MbancariosRouter);
  router.use('/cusuarios', ClientesUsuariosRouter);
  router.use('/dgastos', DgastosRouter);
  router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

module.exports = routerApi;
