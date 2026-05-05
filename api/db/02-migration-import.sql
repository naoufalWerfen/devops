-- ============================================================================
-- Migración: soporte para importación de server-audit.sh
-- ============================================================================

-- Nuevas columnas en servers
ALTER TABLE servers ADD COLUMN IF NOT EXISTS fqdn VARCHAR(200);
ALTER TABLE servers ADD COLUMN IF NOT EXISTS kernel VARCHAR(100);
ALTER TABLE servers ADD COLUMN IF NOT EXISTS arch VARCHAR(20);
ALTER TABLE servers ADD COLUMN IF NOT EXISTS os_id VARCHAR(50);
ALTER TABLE servers ADD COLUMN IF NOT EXISTS os_pretty VARCHAR(200);
ALTER TABLE servers ADD COLUMN IF NOT EXISTS ram_used_gb DECIMAL(10,2);
ALTER TABLE servers ADD COLUMN IF NOT EXISTS ram_available_gb DECIMAL(10,2);
ALTER TABLE servers ADD COLUMN IF NOT EXISTS swap_total_gb DECIMAL(10,2);
ALTER TABLE servers ADD COLUMN IF NOT EXISTS swap_used_gb DECIMAL(10,2);
ALTER TABLE servers ADD COLUMN IF NOT EXISTS swap_usage_pct DECIMAL(5,2);
ALTER TABLE servers ADD COLUMN IF NOT EXISTS disk_used_gb DECIMAL(10,2);
ALTER TABLE servers ADD COLUMN IF NOT EXISTS environment VARCHAR(50);
ALTER TABLE servers ADD COLUMN IF NOT EXISTS scan_date TIMESTAMPTZ;
ALTER TABLE servers ADD COLUMN IF NOT EXISTS raw_json JSONB;

-- Servicios activos por servidor
CREATE TABLE IF NOT EXISTS server_services (
  id          SERIAL PRIMARY KEY,
  server_id   INT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  state       VARCHAR(50),
  sub         VARCHAR(50),
  UNIQUE(server_id, name)
);

-- Puertos abiertos por servidor
CREATE TABLE IF NOT EXISTS server_ports (
  id          SERIAL PRIMARY KEY,
  server_id   INT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  port        INT NOT NULL,
  process     VARCHAR(200),
  UNIQUE(server_id, port)
);

-- Certificados SSL por servidor
CREATE TABLE IF NOT EXISTS server_ssl_certs (
  id          SERIAL PRIMARY KEY,
  server_id   INT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  file        VARCHAR(500),
  expires     VARCHAR(200),
  subject     VARCHAR(500),
  UNIQUE(server_id, file)
);

-- PHP-FPM pools por servidor
CREATE TABLE IF NOT EXISTS server_phpfpm_pools (
  id            SERIAL PRIMARY KEY,
  server_id     INT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  pool          VARCHAR(100) NOT NULL,
  pm            VARCHAR(50),
  max_children  INT,
  UNIQUE(server_id, pool)
);

-- Vhosts por servidor
CREATE TABLE IF NOT EXISTS server_vhosts (
  id          SERIAL PRIMARY KEY,
  server_id   INT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  hostname    VARCHAR(300) NOT NULL,
  UNIQUE(server_id, hostname)
);

-- Stack vinculado a servidor (además de a proyecto)
ALTER TABLE stack_components ADD COLUMN IF NOT EXISTS server_id INT REFERENCES servers(id) ON DELETE CASCADE;
ALTER TABLE stack_components ADD COLUMN IF NOT EXISTS path VARCHAR(500);

-- Índice para stack por servidor
CREATE INDEX IF NOT EXISTS idx_stack_server ON stack_components(server_id);

-- Unique constraint parcial para stack por servidor
CREATE UNIQUE INDEX IF NOT EXISTS idx_stack_server_product
  ON stack_components(server_id, product) WHERE server_id IS NOT NULL;
