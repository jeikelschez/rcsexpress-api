const { Bancos, BancosSchema } = require('./bancos.model');
const { Paises, PaisesSchema } = require('./paises.model');
const { Estados, EstadosSchema } = require('./estados.model');
const { Ciudades, CiudadesSchema } = require('./ciudades.model');
const { Agencias, AgenciasSchema } = require('./agencias.model');
const { Roles, RolesSchema } = require('./roles.model');
const { Objetos, ObjetosSchema } = require('./objetos.model');
const { Permisos, PermisosSchema } = require('./permisos.model');
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

function setupModels(sequelize) {
  Bancos.init(BancosSchema, Bancos.config(sequelize));
  Paises.init(PaisesSchema, Paises.config(sequelize));
  Estados.init(EstadosSchema, Estados.config(sequelize));
  Ciudades.init(CiudadesSchema, Ciudades.config(sequelize));
  Agencias.init(AgenciasSchema, Agencias.config(sequelize));
  Roles.init(RolesSchema, Roles.config(sequelize));
  Objetos.init(ObjetosSchema, Objetos.config(sequelize));
  Permisos.init(PermisosSchema, Permisos.config(sequelize));
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

  Paises.associate(sequelize.models);
  Estados.associate(sequelize.models);
  Ciudades.associate(sequelize.models);
  Agencias.associate(sequelize.models);
  Roles.associate(sequelize.models);
  Permisos.associate(sequelize.models);
  Cuentas.associate(sequelize.models);
  Bancos.associate(sequelize.models);
  Usuarios.associate(sequelize.models);
  Agentes.associate(sequelize.models);
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

  Usuarios.hooks(sequelize.models);
}

module.exports = setupModels;
