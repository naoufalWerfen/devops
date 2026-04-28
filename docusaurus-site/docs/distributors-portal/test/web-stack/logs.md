# Mapa de Logs — Distributors Portal (TEST)

> **Servidor**: 10.120.204.25 (DISTRIBUTORSPORTALTEST)  
> **Última revisión**: 2026-04-27  
> **Objetivo**: Saber rápidamente dónde buscar cuando algo falla.

---

## Guía Rápida de Diagnóstico

| Problema | Dónde mirar primero | Comando rápido |
|----------|---------------------|----------------|
| Página en blanco / 500 | Apache error log del vhost | `tail -100 /var/log/apache2/distributors_portal_test-error_log` |
| Error PHP en la aplicación | Drupal watchdog (dblog) | `cd /srv/www/htdocs/distributors_portal_test && vendor/bin/drush watchdog:show --count=20` |
| Página lenta | Apache access log | `tail -200 /var/log/apache2/access_log` |
| MariaDB no arranca | MySQL error log | `tail -50 /var/log/mysql/mysqld.log` |
| Servidor no responde | Syslog / journal | `journalctl -xe --since "1 hour ago"` |
| Disco lleno | Ver uso general | `df -h && du -sh /var/log/*` |

---

## 1. Apache (httpd)

**Directorio**: `/var/log/apache2/`  
**Log level**: `warn` (configurado en `/etc/sysconfig/apache2` → `APACHE_LOGLEVEL`)  
**Formato access**: `combined` (configurado en `/etc/sysconfig/apache2` → `APACHE_ACCESS_LOG`)

### Archivos activos

| Archivo | Qué contiene | Tamaño actual |
|---------|-------------|---------------|
| `access_log` | Todas las peticiones HTTP (combined format) | ~2.2 MB |
| `distributors_portal_test-error_log` | Errores del vhost principal (distributorstest.werfen.com) | ~143 KB |
| `customerportal-error_log` | Errores del vhost legacy (distributorstest-php74.werfen.com) | ~216 KB |
| `error_log` | Errores globales de Apache | ~143 KB |

### Comandos útiles

```bash
# Ver últimos errores del portal
tail -50 /var/log/apache2/distributors_portal_test-error_log

# Ver errores en tiempo real
tail -f /var/log/apache2/distributors_portal_test-error_log

# Buscar errores 500 en access log
grep '" 500 ' /var/log/apache2/access_log

# Buscar errores 404
grep '" 404 ' /var/log/apache2/access_log | tail -20

# Ver IPs con más peticiones
awk '{print $1}' /var/log/apache2/access_log | sort | uniq -c | sort -rn | head -10

# Ver logs comprimidos antiguos
xzcat /var/log/apache2/distributors_portal_test-error_log-20260118.xz | less
```

### Rotación (logrotate)

- **Configuración**: `/etc/logrotate.d/apache2`
- **Access logs**: rotan cuando superan **4 MB**, compresión xz, retención **365 días** / 99 rotaciones
- **Error logs**: rotan cuando superan **1 MB**, misma política
- **Post-rotación**: `systemctl reload apache2.service`

---

## 2. PHP

**Versión**: PHP 7.4.30 (mod_php, NO PHP-FPM)  
**Config Apache**: `/etc/php7/apache2/php.ini`  
**Config CLI**: `/etc/php7/cli/php.ini`

### Configuración actual

| Directiva | Valor | Fichero |
|-----------|-------|---------|
| `display_errors` | `Off` | apache2/php.ini y cli/php.ini |
| `log_errors` | `On` | apache2/php.ini y cli/php.ini |
| `error_log` | No definido (comentado) | Ambos |
| `log_errors_max_len` | `1024` | Ambos |

> **Nota**: Al no tener `error_log` definido y usar mod_php, los errores PHP van al **ErrorLog de Apache** del vhost correspondiente → `/var/log/apache2/distributors_portal_test-error_log`

### Comandos útiles

```bash
# Ver configuración PHP activa (desde CLI)
php -i | grep -i error

# Ver errores PHP (van al error log de Apache)
grep "PHP" /var/log/apache2/distributors_portal_test-error_log | tail -20

# Ver errores PHP en tiempo real
tail -f /var/log/apache2/distributors_portal_test-error_log | grep "PHP"
```

---

## 3. Drupal (watchdog / dblog)

**Módulo activo**: `Database Logging (dblog)` — Enabled (core)  
**Almacenamiento**: Base de datos MariaDB, tabla `watchdog`

> Drupal **NO** usa syslog. Los logs de aplicación van a la tabla `watchdog` en la BD.

### Comandos útiles (Drush)

```bash
cd /srv/www/htdocs/distributors_portal_test

# Ver últimos 20 mensajes del watchdog
vendor/bin/drush watchdog:show --count=20

# Filtrar solo errores
vendor/bin/drush watchdog:show --severity=error --count=20

# Filtrar solo warnings
vendor/bin/drush watchdog:show --severity=warning --count=20

# Filtrar por tipo (php, cron, system, webform, etc.)
vendor/bin/drush watchdog:show --type=php --count=20

# Ver detalle de un mensaje específico (por ID)
vendor/bin/drush watchdog:show --extended --id=1150874

# Buscar texto en mensajes
vendor/bin/drush watchdog:show --count=50 | grep "SAP"
```

### Errores recientes conocidos (2026-04-27)

- **PHP Warning**: `file_get_contents(libraries/moment/locale/zh-cn.js)` — falta la librería Moment.js
- **PHP Warning**: `file_get_contents(libraries/moment/min/moment.min.js)` — misma causa
- **Webform Notice**: "Options carrier do not exist" — opciones de formulario no encontradas

---

## 4. MariaDB

**Versión**: 10.11.9  
**Config**: `/etc/my.cnf`

### Archivos de log

| Archivo | Qué contiene | Tamaño |
|---------|-------------|--------|
| `/var/log/mysql/mysqld.log` | Errores del servidor MariaDB | ~18 KB |
| `/var/log/mysqld_multi.log` | Multi-instancia (no en uso) | — |

### Configuración relevante

```ini
# /etc/my.cnf
log-error = /var/log/mysql/mysqld.log
# slow_query_log = 1                    # DESACTIVADO
# slow_query_log_file = /var/log/mysql/mysqld_slow.log  # DESACTIVADO
# log_bin = mysql-bin                   # DESACTIVADO (no hay replicación)
```

### Comandos útiles

```bash
# Ver últimos errores de MariaDB
tail -50 /var/log/mysql/mysqld.log

# Ver si hay queries lentas (slow query log está desactivado, pero se puede activar temporalmente)
# mysql -e "SET GLOBAL slow_query_log = 1; SET GLOBAL long_query_time = 2;"

# Ver estado general
mysql -e "SHOW STATUS LIKE 'Uptime'; SHOW STATUS LIKE 'Threads%'; SHOW STATUS LIKE 'Questions';"

# Ver procesos activos
mysql -e "SHOW PROCESSLIST;"

# Ver tamaño de la base de datos
mysql -e "SELECT table_schema, ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.tables WHERE table_schema = 'distributors_portal_test' GROUP BY table_schema;"
```

### Rotación

- **Configuración**: `/etc/logrotate.d/mariadb`
- Logs rotados con compresión xz (archivos más antiguos desde 2024)

---

## 5. Sistema Operativo

### Syslog

| Archivo | Contenido | Tamaño |
|---------|-----------|--------|
| `/var/log/messages` | Mensajes generales del sistema | ~62 KB |
| `/var/log/warn` | Warnings y errores del sistema | ~1.6 MB |

### Journald (systemd)

- **Uso en disco**: 295 MB
- **Persistencia**: activa

### Comandos útiles

```bash
# Ver mensajes del sistema recientes
tail -50 /var/log/messages

# Ver warnings del sistema
tail -50 /var/log/warn

# Journal - últimas entradas
journalctl --since "1 hour ago"

# Journal - solo Apache
journalctl -u apache2 --since "1 hour ago"

# Journal - solo MariaDB
journalctl -u mariadb --since "1 hour ago"

# Journal - solo errores
journalctl -p err --since "24 hours ago"

# Ver uso de disco de journals
journalctl --disk-usage
```

---

## 6. Cron

- **Crontab de root**: Vacío (sin tareas programadas)
- **Drupal cron**: Se ejecuta vía web (no hay crontab configurado para Drush cron)

```bash
# Ver crontab de root
crontab -l

# Ver todos los crontabs del sistema
ls -la /var/spool/cron/tabs/

# Ejecutar Drupal cron manualmente
cd /srv/www/htdocs/distributors_portal_test && vendor/bin/drush cron
```

---

## 7. Logrotate — Servicios con rotación configurada

```
/etc/logrotate.d/
├── apache2        ← Access y error logs
├── mariadb        ← mysqld.log
├── syslog         ← messages, warn
├── bootlog
├── chrony
├── firewalld
├── iscsiuio
├── net-snmp
├── pbl
├── rsync
├── samba
├── snapper
├── wtmp
├── xdm
├── zypp-history.lr
├── zypp-refresh.lr
└── zypper.lr
```

---

## Resumen: Flujo de errores

```
Usuario → Proxy (212.163.185.1, SSL) → Apache :80
                                         │
                                         ├─ access_log (todas las peticiones)
                                         ├─ distributors_portal_test-error_log (errores HTTP + PHP)
                                         │
                                         └─ PHP (mod_php) → Drupal
                                              │
                                              ├─ Errores PHP → Apache error_log del vhost
                                              └─ Watchdog (dblog) → MariaDB tabla 'watchdog'
                                                                      │
                                                                      └─ drush watchdog:show

MariaDB → /var/log/mysql/mysqld.log
Sistema → /var/log/messages, /var/log/warn, journalctl
```
