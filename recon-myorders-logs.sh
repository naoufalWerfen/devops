#!/bin/bash
# Read-only log collection from MyOrders DEMO server
# NO changes made to the remote server

SERVER="10.120.204.93"
PASS="gjG7RCcQ8v2N"
SSH="sshpass -p $PASS ssh -o StrictHostKeyChecking=no root@$SERVER"
OUT="/var/www/devops/recon-myorders-logs.txt"

echo "=== LOG COLLECTION START $(date) ===" > $OUT

echo "=== NGINX ERROR LOG (last 100) ===" >> $OUT
$SSH 'tail -100 /var/log/nginx/error.log 2>/dev/null' >> $OUT 2>&1

echo "=== NGINX ACCESS LOG (last 100) ===" >> $OUT
$SSH 'tail -100 /var/log/nginx/access.log 2>/dev/null' >> $OUT 2>&1

echo "=== SYMFONY DEMO LOG (last 100) ===" >> $OUT
$SSH 'tail -100 /srv/www/htdocs/webapps/demo/ordersapp/current/var/log/dev.log 2>/dev/null' >> $OUT 2>&1

echo "=== SYMFONY PROD LOG (last 100) ===" >> $OUT
$SSH 'tail -100 /srv/www/htdocs/webapps/demo/ordersapp/current/var/log/prod.log 2>/dev/null' >> $OUT 2>&1

echo "=== PHP-FPM LOG (last 100) ===" >> $OUT
$SSH 'tail -100 /var/log/php-fpm.log 2>/dev/null; tail -100 /var/log/php8/fpm/php-fpm.log 2>/dev/null; tail -100 /var/log/php-fpm/error.log 2>/dev/null; tail -100 /var/log/php-fpm/www-error.log 2>/dev/null' >> $OUT 2>&1

echo "=== PHP ERROR LOG ===" >> $OUT
$SSH 'tail -100 /var/log/php_errors.log 2>/dev/null; tail -100 /var/log/php-error.log 2>/dev/null' >> $OUT 2>&1

echo "=== FIND PHP-FPM LOGS ===" >> $OUT
$SSH 'find /var/log -name "*php*" -type f 2>/dev/null' >> $OUT 2>&1

echo "=== PHP-FPM CONFIG (log path) ===" >> $OUT
$SSH 'grep -r "error_log\|slowlog\|access.log" /etc/php8/fpm/php-fpm.conf /etc/php8/fpm/pool.d/ 2>/dev/null; grep -r "error_log\|slowlog\|access.log" /etc/php-fpm.conf /etc/php-fpm.d/ 2>/dev/null' >> $OUT 2>&1

echo "=== MARIADB LOG (last 50) ===" >> $OUT
$SSH 'tail -50 /var/log/mysql/mysqld.log 2>/dev/null; tail -50 /var/log/mysql/error.log 2>/dev/null; tail -50 /var/log/mariadb/mariadb.log 2>/dev/null' >> $OUT 2>&1

echo "=== FIND MARIADB LOGS ===" >> $OUT
$SSH 'find /var/log -name "*mysql*" -o -name "*maria*" 2>/dev/null' >> $OUT 2>&1

echo "=== MARIADB CONFIG (log path) ===" >> $OUT
$SSH 'grep -r "log" /etc/my.cnf /etc/my.cnf.d/ 2>/dev/null | grep -v "^#"' >> $OUT 2>&1

echo "=== SYSLOG / MESSAGES (last 50) ===" >> $OUT
$SSH 'tail -50 /var/log/messages 2>/dev/null' >> $OUT 2>&1

echo "=== SYSTEMD JOURNAL - NGINX (last 30) ===" >> $OUT
$SSH 'journalctl -u nginx --no-pager -n 30 2>/dev/null' >> $OUT 2>&1

echo "=== SYSTEMD JOURNAL - PHP-FPM (last 30) ===" >> $OUT
$SSH 'journalctl -u php-fpm --no-pager -n 30 2>/dev/null' >> $OUT 2>&1

echo "=== SYSTEMD JOURNAL - MARIADB (last 30) ===" >> $OUT
$SSH 'journalctl -u mariadb --no-pager -n 30 2>/dev/null' >> $OUT 2>&1

echo "=== LOG FILE SIZES ===" >> $OUT
$SSH 'ls -lh /var/log/nginx/ 2>/dev/null; echo "---"; ls -lh /srv/www/htdocs/webapps/demo/ordersapp/current/var/log/ 2>/dev/null; echo "---"; find /var/log -name "*php*" -exec ls -lh {} \; 2>/dev/null' >> $OUT 2>&1

echo "=== LOGROTATE CONFIG ===" >> $OUT
$SSH 'cat /etc/logrotate.d/nginx 2>/dev/null; echo "---"; ls /etc/logrotate.d/ 2>/dev/null' >> $OUT 2>&1

echo "=== NGINX ERROR LOG STATS (last 24h patterns) ===" >> $OUT
$SSH 'grep -c "error" /var/log/nginx/error.log 2>/dev/null; echo "total errors"; grep -oP "\[error\]|\[warn\]|\[crit\]|\[alert\]|\[emerg\]" /var/log/nginx/error.log 2>/dev/null | sort | uniq -c | sort -rn' >> $OUT 2>&1

echo "=== SYMFONY LOG LEVELS ===" >> $OUT
$SSH 'grep -oP "\w+\.\w+:" /srv/www/htdocs/webapps/demo/ordersapp/current/var/log/dev.log 2>/dev/null | sort | uniq -c | sort -rn | head -20; echo "---"; grep -oP "\w+\.\w+:" /srv/www/htdocs/webapps/demo/ordersapp/current/var/log/prod.log 2>/dev/null | sort | uniq -c | sort -rn | head -20' >> $OUT 2>&1

echo "=== ORDERSBACKOFFICE LOGS ===" >> $OUT
$SSH 'tail -50 /srv/www/htdocs/webapps/demo/ordersbackoffice/current/var/log/dev.log 2>/dev/null; tail -50 /srv/www/htdocs/webapps/demo/ordersbackoffice/current/var/log/prod.log 2>/dev/null' >> $OUT 2>&1

echo "=== ORDERSTRACKING LOGS ===" >> $OUT
$SSH 'tail -50 /srv/www/htdocs/webapps/demo/orderstracking/current/var/log/dev.log 2>/dev/null; tail -50 /srv/www/htdocs/webapps/demo/orderstracking/current/var/log/prod.log 2>/dev/null' >> $OUT 2>&1

echo "=== ALL APP LOG DIRS ===" >> $OUT
$SSH 'for d in /srv/www/htdocs/webapps/demo/*/current/var/log/; do echo "==$d=="; ls -lh "$d" 2>/dev/null; done' >> $OUT 2>&1

echo "=== MONOLOG CONFIG ===" >> $OUT
$SSH 'cat /srv/www/htdocs/webapps/demo/ordersapp/current/config/packages/monolog.yaml 2>/dev/null' >> $OUT 2>&1

echo "DONE" >> $OUT
echo "Log collection complete."
