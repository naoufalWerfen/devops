-- Invicti cache tables
-- Stores assets and vulnerabilities locally for fast dashboard loading

CREATE TABLE IF NOT EXISTS invicti_assets (
  id            UUID PRIMARY KEY,
  name          TEXT NOT NULL,
  asset_type    TEXT,          -- target, repository, project
  url           TEXT,
  environment   TEXT,
  business_impact TEXT,
  origin_types  TEXT[],        -- dast, sast, sca, container
  is_demo       BOOLEAN DEFAULT FALSE,
  raw           JSONB,
  synced_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invicti_vulnerabilities (
  id              UUID PRIMARY KEY,
  asset_id        UUID REFERENCES invicti_assets(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  severity        TEXT,        -- critical, high, medium, low, info
  status          TEXT,        -- open, fixed, ignored, etc.
  confirmed       BOOLEAN DEFAULT FALSE,
  is_retestable   BOOLEAN DEFAULT FALSE,
  cvss3_score     REAL,
  cvss3_vector    TEXT,
  cwe             TEXT[],
  cve             TEXT[],
  source_system   TEXT,
  first_seen      TIMESTAMPTZ,
  last_seen       TIMESTAMPTZ,
  url             TEXT,
  parameter       TEXT,
  raw             JSONB,
  synced_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invicti_sync_log (
  id          SERIAL PRIMARY KEY,
  started_at  TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  assets_count    INT DEFAULT 0,
  vulns_count     INT DEFAULT 0,
  status      TEXT DEFAULT 'running',  -- running, success, error
  error       TEXT
);

CREATE INDEX IF NOT EXISTS idx_invicti_vulns_severity ON invicti_vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_invicti_vulns_status ON invicti_vulnerabilities(status);
CREATE INDEX IF NOT EXISTS idx_invicti_vulns_asset ON invicti_vulnerabilities(asset_id);

-- CWE enrichment cache (from cwe-api.mitre.org)
CREATE TABLE IF NOT EXISTS cwe_cache (
  cwe_id        TEXT PRIMARY KEY,       -- e.g. 'CWE-918'
  name          TEXT,
  description   TEXT,
  extended_desc TEXT,
  likelihood    TEXT,
  mitigations   JSONB,                  -- PotentialMitigations array
  consequences  JSONB,                  -- CommonConsequences array
  detection     JSONB,                  -- DetectionMethods array
  examples      JSONB,                  -- ObservedExamples array
  attack_patterns TEXT[],               -- CAPEC IDs
  raw           JSONB,
  fetched_at    TIMESTAMPTZ DEFAULT NOW()
);
