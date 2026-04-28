#!/bin/bash
# Read-only reconnaissance script for MyOrders server
# NO changes are made to the remote server

SERVER="10.120.204.93"
PASS="gjG7RCcQ8v2N"
SSH="sshpass -p $PASS ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 root@$SERVER"
OUT="/var/www/devops/recon-myorders-output.txt"

echo "=== SERVER INFO ===" > $OUT
$SSH hostname >> $OUT 2>&1

echo "=== OS ===" >> $OUT
$SSH "cat /etc/os-release | head -5" >> $OUT 2>&1

echo "=== KERNEL ===" >> $OUT
$SSH uname -r >> $OUT 2>&1

echo "=== CPU ===" >> $OUT
$SSH nproc >> $OUT 2>&1

echo "=== RAM ===" >> $OUT
$SSH "free -h | head -2" >> $OUT 2>&1

echo "=== DISK ===" >> $OUT
$SSH "df -h / | tail -1" >> $OUT 2>&1

echo "=== UPTIME ===" >> $OUT
$SSH "uptime -p" >> $OUT 2>&1

echo "=== WEB SERVER ===" >> $OUT
$SSH "which nginx apache2 httpd apache2ctl 2>/dev/null; nginx -v 2>&1; apache2ctl -v 2>&1; httpd -v 2>&1" >> $OUT 2>&1

echo "=== APP DIR ===" >> $OUT
$SSH "ls -la /srv/www/htdocs/webapps/demo/ordersapp/current/" >> $OUT 2>&1

echo "=== PACKAGE JSON ===" >> $OUT
$SSH "cat /srv/www/htdocs/webapps/demo/ordersapp/current/package.json 2>/dev/null | head -30" >> $OUT 2>&1

echo "=== COMPOSER JSON ===" >> $OUT
$SSH "cat /srv/www/htdocs/webapps/demo/ordersapp/current/composer.json 2>/dev/null | head -30" >> $OUT 2>&1

echo "=== PHP VERSION ===" >> $OUT
$SSH "php -v 2>/dev/null | head -1" >> $OUT 2>&1

echo "=== NODE VERSION ===" >> $OUT
$SSH "node -v 2>/dev/null" >> $OUT 2>&1

echo "=== PYTHON VERSION ===" >> $OUT
$SSH "python3 --version 2>/dev/null" >> $OUT 2>&1

echo "=== JAVA VERSION ===" >> $OUT
$SSH "java -version 2>&1 | head -1" >> $OUT 2>&1

echo "=== DOTNET VERSION ===" >> $OUT
$SSH "dotnet --version 2>/dev/null" >> $OUT 2>&1

echo "=== VHOST CONFIG ===" >> $OUT
$SSH "grep -rl 'ordersapp\|myorders\|demo' /etc/apache2/vhosts.d/ /etc/nginx/conf.d/ /etc/httpd/conf.d/ 2>/dev/null | head -5" >> $OUT 2>&1
$SSH "grep -rl 'ordersapp\|myorders\|demo' /etc/apache2/sites-enabled/ /etc/apache2/sites-available/ 2>/dev/null | head -5" >> $OUT 2>&1

echo "=== VHOST CONTENT ===" >> $OUT
$SSH "cat /etc/apache2/vhosts.d/*.conf 2>/dev/null; cat /etc/nginx/conf.d/*.conf 2>/dev/null" >> $OUT 2>&1

echo "=== APP STRUCTURE ===" >> $OUT
$SSH "find /srv/www/htdocs/webapps/demo/ordersapp/current/ -maxdepth 2 -type f | head -50" >> $OUT 2>&1

echo "=== APP DIRS ===" >> $OUT
$SSH "find /srv/www/htdocs/webapps/demo/ordersapp/current/ -maxdepth 2 -type d" >> $OUT 2>&1

echo "=== SERVICES ===" >> $OUT
$SSH "systemctl list-units --type=service --state=running 2>/dev/null | grep -iE 'apache|nginx|httpd|node|pm2|mysql|mariadb|postgres|redis|docker' " >> $OUT 2>&1

echo "=== LISTENING PORTS ===" >> $OUT
$SSH "ss -tlnp | head -20" >> $OUT 2>&1

echo "=== RECENT LOGS ===" >> $OUT
$SSH "tail -30 /var/log/apache2/error_log 2>/dev/null; tail -30 /var/log/apache2/error.log 2>/dev/null; tail -30 /var/log/nginx/error.log 2>/dev/null; tail -30 /var/log/httpd/error_log 2>/dev/null" >> $OUT 2>&1

echo "=== ACCESS LOGS ===" >> $OUT
$SSH "tail -20 /var/log/apache2/access_log 2>/dev/null; tail -20 /var/log/apache2/access.log 2>/dev/null" >> $OUT 2>&1

echo "=== SSL CERTS ===" >> $OUT
$SSH "ls -la /etc/apache2/ssl* /etc/ssl/certs/*.pem /etc/pki/tls/certs/*.pem 2>/dev/null | head -10" >> $OUT 2>&1

echo "=== FIREWALL ===" >> $OUT
$SSH "iptables -L -n 2>/dev/null | head -20; firewall-cmd --list-all 2>/dev/null" >> $OUT 2>&1

echo "=== CRONTAB ===" >> $OUT
$SSH "crontab -l 2>/dev/null; ls /etc/cron.d/ 2>/dev/null" >> $OUT 2>&1

echo "=== DEMO DIR SIBLINGS ===" >> $OUT
$SSH "ls -la /srv/www/htdocs/webapps/demo/" >> $OUT 2>&1

echo "=== ORDERSAPP PARENT ===" >> $OUT
$SSH "ls -la /srv/www/htdocs/webapps/demo/ordersapp/" >> $OUT 2>&1

echo "DONE" >> $OUT
echo "Recon complete. Output saved to $OUT"
