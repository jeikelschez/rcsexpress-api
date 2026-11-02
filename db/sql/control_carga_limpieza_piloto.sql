-- =====================================================================
-- Control de Carga — limpieza antes de arrancar el piloto
-- Borra TODOS los controles de carga (son de prueba) y reinicia la
-- numeración. No toca guías, costos ni ninguna otra tabla.
-- Correr DESPUÉS de control_carga_v2.sql.
-- =====================================================================

DELETE FROM `control_carga_guias`;
DELETE FROM `control_carga_bultos`;
DELETE FROM `control_carga`;

ALTER TABLE `control_carga_guias` AUTO_INCREMENT = 1;
ALTER TABLE `control_carga_bultos` AUTO_INCREMENT = 1;
ALTER TABLE `control_carga` AUTO_INCREMENT = 1;

-- Verificación: todo en 0
SELECT (SELECT COUNT(*) FROM `control_carga`) AS controles,
       (SELECT COUNT(*) FROM `control_carga_bultos`) AS bultos,
       (SELECT COUNT(*) FROM `control_carga_guias`) AS guias;
