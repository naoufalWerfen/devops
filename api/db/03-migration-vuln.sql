-- ============================================================================
-- Migración: estado de vulnerabilidades (OSV.dev + Snyk)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vuln_status (
  id              SERIAL PRIMARY KEY,
  product         VARCHAR(100) NOT NULL,
  version         VARCHAR(50) NOT NULL,
  osv_count       INT DEFAULT 0,
  osv_critical    INT DEFAULT 0,
  osv_high        INT DEFAULT 0,
  osv_medium      INT DEFAULT 0,
  osv_low         INT DEFAULT 0,
  osv_ids         TEXT,
  snyk_total      INT DEFAULT 0,
  snyk_critical   INT DEFAULT 0,
  snyk_high       INT DEFAULT 0,
  snyk_upgrade    VARCHAR(100),
  fetched_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product, version)
);
