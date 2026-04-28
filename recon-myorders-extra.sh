#!/bin/bash
SERVER="10.120.204.93"
PASS="gjG7RCcQ8v2N"
SSH="sshpass -p $PASS ssh -o StrictHostKeyChecking=no root@$SERVER"
OUT="/var/www/devops/recon-myorders-extra.txt"

echo "=== NGINX CONFIGS ===" > $OUT
$SSH 'find /etc/nginx -maxdepth 3 -name "*.conf" -type f 2>/dev/null' >> $OUT 2>&1

echo "=== NGINX MAIN CONF ===" >> $OUT
$SSH 'cat /etc/nginx/nginx.conf 2>/dev/null' >> $OUT 2>&1

echo "=== NGINX VHOSTS ===" >> $OUT
$SSH 'cat /etc/nginx/vhosts.d/*.conf 2>/dev/null' >> $OUT 2>&1

echo "=== APP README ===" >> $OUT
$SSH 'cat /srv/www/htdocs/webapps/demo/ordersapp/current/README.md 2>/dev/null' >> $OUT 2>&1

echo "=== SRC STRUCTURE ===" >> $OUT
$SSH 'find /srv/www/htdocs/webapps/demo/ordersapp/current/src -maxdepth 2 -type d 2>/dev/null' >> $OUT 2>&1

echo "=== CONFIG FILES ===" >> $OUT
$SSH 'ls -la /srv/www/htdocs/webapps/demo/ordersapp/current/config/ 2>/dev/null' >> $OUT 2>&1
$SSH 'ls -la /srv/www/htdocs/webapps/demo/ordersapp/current/config/packages/ 2>/dev/null' >> $OUT 2>&1

echo "=== DEPLOYMENT ===" >> $OUT
$SSH 'ls -la /srv/www/htdocs/webapps/demo/ordersapp/current/deployment/ 2>/dev/null' >> $OUT 2>&1

echo "=== MAKEFILE ===" >> $OUT
$SSH 'cat /srv/www/htdocs/webapps/demo/ordersapp/current/Makefile 2>/dev/null' >> $OUT 2>&1

echo "=== ENV DEFAULT ===" >> $OUT
$SSH 'cat /srv/www/htdocs/webapps/demo/ordersapp/current/.env.default 2>/dev/null' >> $OUT 2>&1

echo "=== TEMPLATES ===" >> $OUT
$SSH 'find /srv/www/htdocs/webapps/demo/ordersapp/current/templates -maxdepth 2 -type d 2>/dev/null' >> $OUT 2>&1

echo "=== APPS DIR ===" >> $OUT
$SSH 'ls -la /srv/www/htdocs/webapps/demo/ordersapp/current/apps/ 2>/dev/null' >> $OUT 2>&1

echo "=== MARIADB VERSION ===" >> $OUT
$SSH 'mysql --version 2>/dev/null' >> $OUT 2>&1

echo "=== MARIADB DATABASES ===" >> $OUT
$SSH 'mysql -e "SHOW DATABASES;" 2>/dev/null' >> $OUT 2>&1

echo "DONE" >> $OUT
echo "Extra recon complete."
