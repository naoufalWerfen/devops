-- Eliminar jobs inactivos de myClaims y myOrders
DELETE FROM jenkins_jobs
WHERE is_active = false
  AND project_id IN (
    SELECT id FROM jenkins_projects WHERE name IN ('myClaims', 'myOrders')
  );
