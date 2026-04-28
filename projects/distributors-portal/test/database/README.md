# Base de Datos — Distributors Portal (TEST)

> **Servidor**: 10.120.204.25  
> **Última revisión**: 2026-04-27

---

## Resumen

| Propiedad | Valor |
|-----------|-------|
| **Motor** | MariaDB 10.11.9 |
| **Puerto** | 3306 (bind 127.0.0.1, solo local) |
| **Base de datos** | `distributors_portal_test` |
| **Tamaño total** | **7.13 GB** |
| **Tablas** | 72 |
| **Engine** | InnoDB (todas) |
| **Charset** | utf8mb4 |
| **Collation** | utf8mb4_unicode_520_ci |
| **Config** | `/etc/my.cnf` |
| **Log errores** | `/var/log/mysql/mysqld.log` |

---

## Configuración principal (my.cnf)

| Parámetro | Valor |
|-----------|-------|
| `max_connections` | 151 |
| `innodb_buffer_pool_size` | 128 MB |
| `innodb_log_file_size` | 96 MB |
| `slow_query_log` | OFF |
| `secure_file_priv` | `/var/lib/mysql-files` |
| `log_bin` | Desactivado (sin replicación) |

### Comandos de consulta

```bash
# Ver configuración actual
mysql -e "SHOW VARIABLES LIKE 'innodb%';"
mysql -e "SHOW VARIABLES LIKE 'max_connections';"

# Ver estado del servidor
mysql -e "SHOW STATUS LIKE 'Threads%'; SHOW STATUS LIKE 'Questions'; SHOW STATUS LIKE 'Slow_queries';"

# Ver procesos activos
mysql -e "SHOW PROCESSLIST;"
```

---

## Tablas principales (por tamaño)

| Tabla | Filas (aprox) | Tamaño | Notas |
|-------|---------------|--------|-------|
| `watchdog` | 790,850 | 4.29 GB | Logs de Drupal (dblog) — **¡ocupa el 60% de la BD!** |
| `key_value_expire` | 68,705 | 2.78 GB | Key-value store con expiración |
| `flood` | 168,478 | 22.59 MB | Protección anti-flood |
| `webform_submission_data` | 40,529 | 8.55 MB | Datos de formularios |
| `locales_target` | 15,402 | 3.69 MB | Traducciones |
| `locales_source` | 12,771 | 3.03 MB | Cadenas fuente |
| `cache_discovery` | 64 | 2.55 MB | Cache |
| `webform_submission` | 2,738 | 2.11 MB | Submissions de webform |
| `cache_container` | 3 | 2.05 MB | Cache |
| `cache_config` | 568 | 1.66 MB | Cache |

### Comandos de consulta

```bash
# Ver todas las tablas con tamaño
mysql distributors_portal_test -e "SELECT table_name, table_rows, ROUND((data_length+index_length)/1024/1024,2) AS size_mb FROM information_schema.tables WHERE table_schema=DATABASE() ORDER BY data_length+index_length DESC;"

# Contar registros en watchdog
mysql distributors_portal_test -e "SELECT COUNT(*) FROM watchdog;"

# Limpiar watchdog (liberar espacio) — con Drush
cd /srv/www/htdocs/distributors_portal_test && vendor/bin/drush watchdog:delete all
```

> **⚠ Observación**: La tabla `watchdog` ocupa **4.29 GB** (60% de la BD). Considerar implementar una política de limpieza periódica o reducir la retención de logs.

---

## Usuarios de MariaDB

| Usuario | Host | Propósito |
|---------|------|-----------|
| `root` | localhost | Administración |
| `distributors_portal_test` | localhost | BD del portal (test) |
| `distributors_portal_production` | localhost | BD producción (si existiera) |
| `audit` | localhost | Auditoría |
| `nhaddouche` | localhost | Dev personal |
| `mhernandez2` | localhost | Dev personal |
| `ojmas` | localhost | Dev personal |
| `sdehesa` | localhost | Dev personal |
| `mysql` | localhost | Sistema |
| `mariadb.sys` | localhost | Sistema |

### Comandos de consulta

```bash
# Ver usuarios
mysql -e "SELECT user, host FROM mysql.user;"

# Ver permisos de un usuario
mysql -e "SHOW GRANTS FOR 'distributors_portal_test'@'localhost';"
```

---

## Backups

| Tipo | Ubicación | Notas |
|------|-----------|-------|
| Dump SQL manual | `/home/deploy/db-backups/` | Último: `distributors_portal_test-10_01_2022.sql` (ene 2022) |
| Dump SQL inicial | `/home/deploy/ebusiness-distributors-portal-drupal-9-php-74.sql` | Import original (~30 MB) |

> **⚠ Observación**: El último backup conocido es de **enero 2022** — más de 4 años. No se detecta ningún sistema de backup automático configurado.

### Comandos útiles

```bash
# Crear backup manual
mysqldump distributors_portal_test > /home/deploy/db-backups/distributors_portal_test-$(date +%Y%m%d).sql

# Crear backup comprimido
mysqldump distributors_portal_test | gzip > /home/deploy/db-backups/distributors_portal_test-$(date +%Y%m%d).sql.gz

# Restaurar backup
mysql distributors_portal_test < /path/to/backup.sql
```
