-- =====================================================================
-- Control de Carga v2 — RCS Express
-- Requiere haber corrido antes control_carga.sql.
-- Correr una sola vez. Sigue siendo aditivo: no toca tablas existentes
-- fuera de control_carga / control_carga_bultos, ni guías, ni costos.
--
--  1) Chofer y vehículo como IDs de catálogo (cod_agente / cod_unidad).
--  2) fecha como DATE (antes texto DD/MM/YYYY).
--  3) Tabla control_carga_guias: candado de guía única en controles activos.
--  4) Menú "Control de carga" en Operaciones + permisos.
-- =====================================================================

-- 1) Chofer y vehículo ---------------------------------------------------
ALTER TABLE `control_carga`
  ADD COLUMN `cod_agente` INT NULL AFTER `cod_agencia`,
  ADD COLUMN `cod_unidad` INT NULL AFTER `cod_agente`,
  ADD KEY `idx_cc_agente` (`cod_agente`),
  ADD KEY `idx_cc_unidad` (`cod_unidad`);

-- Se completan los registros existentes buscando por placa / nombre
UPDATE `control_carga` c
  JOIN `unidades_transporte` u ON u.placas = c.vehiculo
  SET c.cod_unidad = u.id
  WHERE c.cod_unidad IS NULL;

UPDATE `control_carga` c
  JOIN `agentes` a ON TRIM(a.persona_responsable) = TRIM(c.chofer)
                  AND a.cod_agencia = 1
  SET c.cod_agente = a.id
  WHERE c.cod_agente IS NULL;

-- 2) fecha a DATE ---------------------------------------------------------
ALTER TABLE `control_carga` ADD COLUMN `fecha_d` DATE NULL AFTER `fecha`;
UPDATE `control_carga` SET `fecha_d` = STR_TO_DATE(`fecha`, '%d/%m/%Y')
  WHERE `fecha` LIKE '__/__/____';
UPDATE `control_carga` SET `fecha_d` = `fecha`
  WHERE `fecha_d` IS NULL AND `fecha` LIKE '____-__-__';
ALTER TABLE `control_carga` DROP COLUMN `fecha`;
ALTER TABLE `control_carga` CHANGE `fecha_d` `fecha` DATE NULL;
ALTER TABLE `control_carga` ADD KEY `idx_cc_fecha` (`fecha`);

-- 3) Candado de guías -----------------------------------------------------
--    Una fila por guía y control. `activa` = 1 mientras el control está
--    ABIERTA / EN PROCESO y NULL al cerrarse. El índice único
--    (cod_movimiento, activa) impide que una guía esté en dos controles
--    activos a la vez (MySQL permite varios NULL en un índice único).
CREATE TABLE IF NOT EXISTS `control_carga_guias` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cod_control_carga` INT NOT NULL,
  `cod_movimiento` INT NOT NULL,
  `nro_documento` VARCHAR(255) NULL,
  `activa` TINYINT(1) NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ccg_carga_mov` (`cod_control_carga`, `cod_movimiento`),
  UNIQUE KEY `uq_ccg_mov_activa` (`cod_movimiento`, `activa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Se llena con los bultos ya registrados
INSERT IGNORE INTO `control_carga_guias`
  (`cod_control_carga`, `cod_movimiento`, `nro_documento`, `activa`)
SELECT b.cod_control_carga, b.cod_movimiento, MAX(b.nro_documento),
       IF(c.estado IN ('ABIERTA', 'EN PROCESO'), 1, NULL)
  FROM `control_carga_bultos` b
  JOIN `control_carga` c ON c.id = b.cod_control_carga
 WHERE b.cod_movimiento IS NOT NULL
 GROUP BY b.cod_control_carga, b.cod_movimiento, c.estado;

-- Limpieza de bultos huérfanos (de controles eliminados), si los hubiera
DELETE b FROM `control_carga_bultos` b
  LEFT JOIN `control_carga` c ON c.id = b.cod_control_carga
 WHERE c.id IS NULL;

-- 4) Menú y permisos ------------------------------------------------------
INSERT INTO `menus` (`name`, `label`, `level`, `qitem`, `icon`, `url`, `model`, `direct`, `padre`, `order`, `dorder`)
VALUES ('controlcarga', 'Control de carga', 1, 1, 'qr_code_scanner', '/controlcarga', 0, 0, 'operaciones', 4, NULL);

INSERT INTO `menus_acciones` (`cod_menu`, `accion`, `descripcion`) VALUES
('controlcarga', 1, 'Permiso para Acceder al menu de Control de Carga'),
('controlcarga', 2, 'Permiso para Crear Control de Carga'),
('controlcarga', 3, 'Permiso para Actualizar Control de Carga'),
('controlcarga', 4, 'Permiso para Borrar Control de Carga');

-- Se otorgan a los mismos roles que hoy tienen cada acción en Relación de Despacho
INSERT INTO `roles_permisos` (`cod_rol`, `cod_menu_accion`)
SELECT rp.cod_rol, mn.id
  FROM `roles_permisos` rp
  JOIN `menus_acciones` mr ON mr.id = rp.cod_menu_accion
                          AND mr.cod_menu = 'relaciondespacho'
                          AND mr.accion IN (1, 2, 3, 4)
  JOIN `menus_acciones` mn ON mn.cod_menu = 'controlcarga'
                          AND mn.accion = mr.accion;

-- Verificación
SELECT id, cod_agente, cod_unidad, vehiculo, chofer, fecha, estado FROM `control_carga`;
SELECT * FROM `control_carga_guias`;
