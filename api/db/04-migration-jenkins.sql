-- ============================================================================
-- Migración: Jenkins Transport Jobs
-- ============================================================================

-- Proyectos/grupos de Jenkins
CREATE TABLE IF NOT EXISTS jenkins_projects (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs individuales de transporte
CREATE TABLE IF NOT EXISTS jenkins_jobs (
  id              SERIAL PRIMARY KEY,
  project_id      INTEGER REFERENCES jenkins_projects(id) ON DELETE CASCADE,
  app_name        VARCHAR(200) NOT NULL,
  app_token_name  VARCHAR(100) NOT NULL,
  job_path        TEXT NOT NULL,
  build_type      VARCHAR(30) DEFAULT 'build',
  deploy_type     VARCHAR(20),
  sap_id          INTEGER,
  requires_cab    BOOLEAN DEFAULT false,
  result_url      TEXT,
  transport_url   TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Historial de builds
CREATE TABLE IF NOT EXISTS jenkins_builds (
  id            SERIAL PRIMARY KEY,
  job_id        INTEGER REFERENCES jenkins_jobs(id) ON DELETE CASCADE,
  build_number  INTEGER,
  status        VARCHAR(20),
  started_at    TIMESTAMPTZ,
  duration_ms   INTEGER,
  triggered_by  VARCHAR(100),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Gestión de tokens (solo metadatos, NUNCA el valor)
CREATE TABLE IF NOT EXISTS jenkins_tokens (
  id             SERIAL PRIMARY KEY,
  token_name     VARCHAR(100) NOT NULL,
  env_var        VARCHAR(100),
  integration    VARCHAR(50),
  published_at   DATE,
  expires_at     DATE,
  is_active      BOOLEAN DEFAULT true
);
