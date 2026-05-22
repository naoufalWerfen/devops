SELECT jp.name AS project, jj.app_name, jj.deploy_type, jj.is_active
FROM jenkins_jobs jj
JOIN jenkins_projects jp ON jj.project_id = jp.id
WHERE jp.name IN ('myClaims','myOrders')
ORDER BY jp.name, jj.is_active DESC, jj.app_name;
