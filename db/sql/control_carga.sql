-- =====================================================================
-- Control de Carga (fase almacén) — RCS Express
-- 100% aditivo: crea 2 tablas nuevas, 1 rol y 2 usuarios de prueba.
-- NO modifica ninguna tabla/vista/proceso existente.
-- Correr una sola vez sobre la base de datos del sistema.
-- =====================================================================

-- 1) Tabla cabecera -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `control_carga` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cod_agencia` INT NOT NULL,
  `vehiculo` VARCHAR(255) NULL,
  `chofer` VARCHAR(255) NULL,
  `fecha` VARCHAR(255) NULL,
  `estado` VARCHAR(255) NOT NULL DEFAULT 'ABIERTA',
  `via` VARCHAR(255) NOT NULL DEFAULT 'ALMACEN',
  `cod_costo` INT NULL,
  `usuario` VARCHAR(255) NULL,
  `observacion` VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cc_agencia` (`cod_agencia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) Tabla detalle (bultos) --------------------------------------------
CREATE TABLE IF NOT EXISTS `control_carga_bultos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cod_control_carga` INT NOT NULL,
  `cod_movimiento` INT NULL,
  `nro_documento` VARCHAR(255) NULL,
  `nro_bulto` INT NULL,
  `codigo` VARCHAR(255) NOT NULL,
  `destino` VARCHAR(255) NULL,
  `escaneado` TINYINT(1) NOT NULL DEFAULT 1,
  `estado_bulto` VARCHAR(255) NOT NULL DEFAULT 'OK',
  `fecha_hora` VARCHAR(255) NULL,
  `usuario` VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ccb_carga` (`cod_control_carga`),
  UNIQUE KEY `uq_ccb_carga_codigo` (`cod_control_carga`, `codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3) Rol nuevo ----------------------------------------------------------
--    (cod_agencia = 1 = agencia principal; cambiar si aplica)
INSERT INTO `roles` (`descripcion`, `cod_agencia`) VALUES ('OPERADOR DE CARGA', 1);
SET @rol := LAST_INSERT_ID();

-- 4) Usuarios de prueba -------------------------------------------------
--    OJO: credenciales de PRUEBA (password: Admin123*). Cambiá la clave
--    o eliminá estos usuarios en producción.
INSERT INTO `usuarios` (`login`, `password`, `nombre`, `activo`, `cod_agencia`, `cod_rol`) VALUES
('operador',  '$2a$10$/x8znFE98em68mnJx00SE.s.EkJDspO52RdYPKo6q6JkIqZ.2KPTe', 'Operador de Carga 1', '1', 1, @rol),
('operador2', '$2a$10$ukUYK1s5.VvskwSWgSImxecujioTSirA1x1Z6Uh1KFvQK4lfYSDvq', 'Operador de Carga 2', '1', 1, @rol);

-- Verificación del rol creado:
SELECT id, descripcion FROM `roles` WHERE descripcion = 'OPERADOR DE CARGA';
