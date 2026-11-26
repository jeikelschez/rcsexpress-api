-- Índices para que el escaneo del Control de Carga sea rápido.
--
-- maestro_de_movimientos solo tenía índice por (cod_agencia, nro_documento,
-- t_de_documento): buscar una guía por su número recorría la tabla completa
-- (~1 s por escaneo con ~100 mil guías).
-- control_carga_bultos se busca por código para impedir que un bulto esté
-- escaneado en dos cargas.
--
-- Solo agrega índices: no cambia datos. Se puede correr con la app en uso.

CREATE INDEX idx_mm_nro_documento ON maestro_de_movimientos (nro_documento);
CREATE INDEX idx_ccb_codigo ON control_carga_bultos (codigo);

-- Para revertir:
-- DROP INDEX idx_mm_nro_documento ON maestro_de_movimientos;
-- DROP INDEX idx_ccb_codigo ON control_carga_bultos;
