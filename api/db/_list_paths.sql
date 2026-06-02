SELECT jp.name AS project, jj.app_name, jj.job_path
FROM jenkins_jobs jj
JOIN jenkins_projects jp ON jj.project_id = jp.id
WHERE jp.name IN ('myClaims','myOrders') AND jj.is_active = true
ORDER BY jp.name, jj.app_name;
