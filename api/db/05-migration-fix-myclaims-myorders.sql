-- ============================================================================
-- Migración: Corregir jobs de myClaims y eliminar myOrderslegacy
-- ============================================================================

BEGIN;

-- ── 1. myClaims — Asegurar que el proyecto existe ──────────────────────────

INSERT INTO jenkins_projects (name)
VALUES ('myClaims')
ON CONFLICT (name) DO NOTHING;

-- ── 2. myClaims — Desactivar TODOS los jobs actuales ───────────────────────

UPDATE jenkins_jobs
SET is_active = false, updated_at = NOW()
WHERE project_id = (SELECT id FROM jenkins_projects WHERE name = 'myClaims');

-- ── 3. myClaims — Insertar los 4 jobs correctos ───────────────────────────

-- myClaims release
INSERT INTO jenkins_jobs
  (project_id, app_name, app_token_name, job_path, build_type, deploy_type, is_active)
VALUES (
  (SELECT id FROM jenkins_projects WHERE name = 'myClaims'),
  'myClaims release',
  'myClaims release',
  'job/myClaims/job/Production%20Environment/job/QA%20Transports/job/Deploy%20release',
  'build',
  'release',
  true
)
ON CONFLICT DO NOTHING;

-- myClaims hotfix
INSERT INTO jenkins_jobs
  (project_id, app_name, app_token_name, job_path, build_type, deploy_type, is_active)
VALUES (
  (SELECT id FROM jenkins_projects WHERE name = 'myClaims'),
  'myClaims hotfix',
  'myClaims hotfix',
  'job/myClaims/job/Production%20Environment/job/QA%20Transports/job/Deploy%20hotfix',
  'build',
  'hotfix',
  true
)
ON CONFLICT DO NOTHING;

-- myClaimsChina hotfix
INSERT INTO jenkins_jobs
  (project_id, app_name, app_token_name, job_path, build_type, deploy_type, is_active)
VALUES (
  (SELECT id FROM jenkins_projects WHERE name = 'myClaims'),
  'myClaimsChina hotfix',
  'myClaimsChina hotfix',
  'job/myClaims/job/Production%20Environment/job/QA%20Transports/job/Deploy%20CN%20hotfix',
  'build',
  'hotfix',
  true
)
ON CONFLICT DO NOTHING;

-- myClaimsChina release
INSERT INTO jenkins_jobs
  (project_id, app_name, app_token_name, job_path, build_type, deploy_type, is_active)
VALUES (
  (SELECT id FROM jenkins_projects WHERE name = 'myClaims'),
  'myClaimsChina release',
  'myClaimsChina release',
  'job/myClaims/job/Production%20Environment/job/QA%20Transports/job/Deploy%20CN%20relase',
  'build',
  'release',
  true
)
ON CONFLICT DO NOTHING;

-- ── 4. myOrders — Eliminar el job "myOrderslegacy legacy" ──────────────────

UPDATE jenkins_jobs
SET is_active = false, updated_at = NOW()
WHERE app_name ILIKE '%legacy%'
  AND project_id = (SELECT id FROM jenkins_projects WHERE name = 'myOrders');

-- ── 5. Verificación ────────────────────────────────────────────────────────
-- Ejecutar después para confirmar:
--   SELECT app_name, deploy_type, job_path, is_active
--   FROM jenkins_jobs
--   WHERE project_id IN (
--     SELECT id FROM jenkins_projects WHERE name IN ('myClaims', 'myOrders')
--   )
--   ORDER BY project_id, app_name;

COMMIT;
