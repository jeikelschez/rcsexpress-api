const { Bancos, BancosSchema } = require('./bancos.model');
const { Paises, PaisesSchema } = require('./paises.model');
const { Estados, EstadosSchema } = require('./estados.model');
const { Ciudades, CiudadesSchema } = require('./ciudades.model');
const { Agencias, AgenciasSchema } = require('./agencias.model');
const { Roles, RolesSchema } = require('./roles.model');
const { Objetos, ObjetosSchema } = require('./objetos.model');
const { Permisos, PermisosSchema } = require('./permisos.model');
const { Usuarios, UsuariosSchema } = require('./usuarios.model');

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

  Paises.associate(sequelize.models);
  Estados.associate(sequelize.models);
  Ciudades.associate(sequelize.models);
  Agencias.associate(sequelize.models);
  Roles.associate(sequelize.models);
  Permisos.associate(sequelize.models);
  Usuarios.associate(sequelize.models);
}

module.exports = setupModels;
