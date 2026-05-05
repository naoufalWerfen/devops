-- ============================================================================
-- DevOps Dashboard — Schema inicial
-- ============================================================================

-- Servidores físicos / VMs
CREATE TABLE IF NOT EXISTS servers (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL UNIQUE,
  hostname      VARCHAR(120),
  ip            VARCHAR(45),
  os            VARCHAR(100),
  os_version    VARCHAR(50),
  cpu           VARCHAR(200),
  cpu_count     INT,
  ram_gb        DECIMAL(10,2),
  disk_gb       DECIMAL(10,2),
  disk_usage_pct DECIMAL(5,2),
  uptime_days   INT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Proyectos / aplicaciones
CREATE TABLE IF NOT EXISTS projects (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL UNIQUE,
  label         VARCHAR(200),
  description   TEXT,
  server_id     INT REFERENCES servers(id) ON DELETE SET NULL,
  environment   VARCHAR(50),
  url           VARCHAR(500),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Componentes del stack tecnológico por proyecto o servidor
CREATE TABLE IF NOT EXISTS stack_components (
  id              SERIAL PRIMARY KEY,
  project_id      INT REFERENCES projects(id) ON DELETE CASCADE,
  product         VARCHAR(100) NOT NULL,   -- nombre en endoflife.date (nodejs, php…)
  product_label   VARCHAR(200),            -- etiqueta legible (Node.js, PHP…)
  current_version VARCHAR(50) NOT NULL,
  category        VARCHAR(50),             -- language, framework, server, database, os
  server_id       INT REFERENCES servers(id) ON DELETE CASCADE,
  path            VARCHAR(500),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, product)
);

-- Datos EOL obtenidos de endoflife.date
CREATE TABLE IF NOT EXISTS eol_status (
  id              SERIAL PRIMARY KEY,
  product         VARCHAR(100) NOT NULL,
  cycle           VARCHAR(50) NOT NULL,
  release_date    DATE,
  eol_date        DATE,
  is_eol          BOOLEAN,
  latest_version  VARCHAR(50),
  latest_date     DATE,
  is_lts          BOOLEAN,
  eoas_date       DATE,
  is_eoas         BOOLEAN,
  is_maintained   BOOLEAN,
  fetched_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product, cycle)
);

-- Log de sincronizaciones
CREATE TABLE IF NOT EXISTS sync_log (
  id          SERIAL PRIMARY KEY,
  started_at  TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  status      VARCHAR(20) DEFAULT 'running',
  details     JSONB
);
