const { Bancos, BancosSchema } = require('./bancos.model');
const { Paises, PaisesSchema } = require('./paises.model');
const { Estados, EstadosSchema } = require('./estados.model');
const { Ciudades, CiudadesSchema } = require('./ciudades.model');
const { Agencias, AgenciasSchema } = require('./agencias.model');
const { Roles, RolesSchema } = require('./roles.model');
const { Usuarios, UsuariosSchema } = require('./usuarios.model');
const { Cuentas, CuentasSchema } = require('./cuentas.model');
const { Agentes, AgentesSchema } = require('./agentes.model');
const { Clientes, ClientesSchema } = require('./clientes.model');
const { Municipios, MunicipiosSchema } = require('./municipios.model');
const { Parroquias, ParroquiasSchema } = require('./parroquias.model');
const { Localidades, LocalidadesSchema } = require('./localidades.model');
const { Ayudantes, AyudantesSchema } = require('./ayudantes.model');
const { Zonas, ZonasSchema } = require('./zonas.model');
const { Unidades, UnidadesSchema } = require('./unidades.model');
const { Proveedores, ProveedoresSchema } = require('./proveedores.model');
const { Receptores, ReceptoresSchema } = require('./receptores.model');
const { Tarifas, TarifasSchema } = require('./tarifas.model');
const { Fpos, FposSchema } = require('./fpos.model');
const { Mretenciones, MretencionesSchema } = require('./maestroRetenciones.model');
const { Coperacion, CoperacionSchema } = require('./conceptosOperacion.model');
const { Cfacturacion, CfacturacionSchema } = require('./conceptosFacturacion.model');
const { Tipos, TiposSchema } = require('./tipos.model');
const { Empleados, EmpleadosSchema } = require('./empleados.model');
const { Correlativo, CorrelativoSchema } = require('./controlCorrelativo.model');
const { Cguias, CguiasSchema } = require('./controlGuias.model');
const { Vcontrol, VcontrolSchema } = require('./variableControl.model');
const { Mmovimientos, MmovimientosSchema } = require('./maestroMovimientos.model');
const { Dmovimientos, DmovimientosSchema } = require('./detalleMovimientos.model');
const { Cparticulares, CparticularesSchema } = require('./clientesParticulares.model');
const { Ginutilizadas, GinutilizadasSchema } = require('./guiasInutilizadas.model');
const { Menus, MenusSchema } = require('./menus.model');
const { Acciones, AccionesSchema } = require('./menusAcciones.model');
const { Rpermisos, RpermisosSchema } = require('./rolesPermisos.model');
const { Hdolar, HdolarSchema } = require('./historicoDolar.model');
const { Ccomisiones, CcomisionesSchema } = require('./controlComisiones.model');
const { Costos, CostosSchema } = require('./costosTransporte.model');
const { Dcostos, DcostosSchema } = require('./detalleCostos.model');
const { Dcostosg, DcostosgSchema } = require('./detalleCostosGuias.model');

function setupModels(sequelize) {
  Bancos.init(BancosSchema, Bancos.config(sequelize));
  Paises.init(PaisesSchema, Paises.config(sequelize));
  Estados.init(EstadosSchema, Estados.config(sequelize));
  Ciudades.init(CiudadesSchema, Ciudades.config(sequelize));
  Agencias.init(AgenciasSchema, Agencias.config(sequelize));
  Roles.init(RolesSchema, Roles.config(sequelize));
  Usuarios.init(UsuariosSchema, Usuarios.config(sequelize));
  Cuentas.init(CuentasSchema, Cuentas.config(sequelize));
  Agentes.init(AgentesSchema, Agentes.config(sequelize));
  Clientes.init(ClientesSchema, Clientes.config(sequelize));
  Municipios.init(MunicipiosSchema, Municipios.config(sequelize));
  Parroquias.init(ParroquiasSchema, Parroquias.config(sequelize));
  Localidades.init(LocalidadesSchema, Localidades.config(sequelize));
  Ayudantes.init(AyudantesSchema, Ayudantes.config(sequelize));
  Zonas.init(ZonasSchema, Zonas.config(sequelize));
  Unidades.init(UnidadesSchema, Unidades.config(sequelize));
  Proveedores.init(ProveedoresSchema, Proveedores.config(sequelize));
  Receptores.init(ReceptoresSchema, Receptores.config(sequelize));
  Tarifas.init(TarifasSchema, Tarifas.config(sequelize));
  Fpos.init(FposSchema, Fpos.config(sequelize));
  Mretenciones.init(MretencionesSchema, Mretenciones.config(sequelize));
  Coperacion.init(CoperacionSchema, Coperacion.config(sequelize));
  Cfacturacion.init(CfacturacionSchema, Cfacturacion.config(sequelize));
  Tipos.init(TiposSchema, Tipos.config(sequelize));
  Empleados.init(EmpleadosSchema, Empleados.config(sequelize));
  Correlativo.init(CorrelativoSchema, Correlativo.config(sequelize));
  Cguias.init(CguiasSchema, Cguias.config(sequelize));
  Vcontrol.init(VcontrolSchema, Vcontrol.config(sequelize));
  Mmovimientos.init(MmovimientosSchema, Mmovimientos.config(sequelize));
  Dmovimientos.init(DmovimientosSchema, Dmovimientos.config(sequelize));
  Cparticulares.init(CparticularesSchema, Cparticulares.config(sequelize));
  Ginutilizadas.init(GinutilizadasSchema, Ginutilizadas.config(sequelize));
  Menus.init(MenusSchema, Menus.config(sequelize));
  Acciones.init(AccionesSchema, Acciones.config(sequelize));
  Rpermisos.init(RpermisosSchema, Rpermisos.config(sequelize));
  Hdolar.init(HdolarSchema, Hdolar.config(sequelize));
  Ccomisiones.init(CcomisionesSchema, Ccomisiones.config(sequelize));
  Costos.init(CostosSchema, Costos.config(sequelize));
  Dcostos.init(DcostosSchema, Dcostos.config(sequelize));
  Dcostosg.init(DcostosgSchema, Dcostosg.config(sequelize));

  Paises.associate(sequelize.models);
  Estados.associate(sequelize.models);
  Ciudades.associate(sequelize.models);
  Agencias.associate(sequelize.models);
  Roles.associate(sequelize.models);
  Cuentas.associate(sequelize.models);
  Bancos.associate(sequelize.models);
  Usuarios.associate(sequelize.models);
  Agentes.associate(sequelize.models);
  Ayudantes.associate(sequelize.models);
  Clientes.associate(sequelize.models);
  Municipios.associate(sequelize.models);
  Parroquias.associate(sequelize.models);
  Localidades.associate(sequelize.models);
  Zonas.associate(sequelize.models);
  Proveedores.associate(sequelize.models);
  Mretenciones.associate(sequelize.models);
  Coperacion.associate(sequelize.models);
  Cfacturacion.associate(sequelize.models);
  Tipos.associate(sequelize.models);
  Correlativo.associate(sequelize.models);
  Cguias.associate(sequelize.models);
  Mmovimientos.associate(sequelize.models);
  Dmovimientos.associate(sequelize.models);
  Cparticulares.associate(sequelize.models);
  Ginutilizadas.associate(sequelize.models);
  Menus.associate(sequelize.models);
  Acciones.associate(sequelize.models);
  Rpermisos.associate(sequelize.models);
  Ccomisiones.associate(sequelize.models);
  Costos.associate(sequelize.models);
  Dcostos.associate(sequelize.models);
  Dcostosg.associate(sequelize.models);

  Usuarios.hooks(sequelize.models);
}

module.exports = setupModels;
