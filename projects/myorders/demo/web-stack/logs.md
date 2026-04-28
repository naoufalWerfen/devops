# Mapa de Logs — WEBAPPSPROD

**Servidor**: `10.120.204.93` (WEBAPPSPROD)  
**Fecha**: 27 abril 2026  
**OS**: SLES 15 SP6

---

## Arquitectura de logging

```mermaid
graph TD
    CLIENT[Cliente HTTP] -->|HTTPS| NGINX[Nginx 1.21.5]
    NGINX -->|FastCGI :9000| PHPFPM[PHP-FPM 8.1]
    PHPFPM --> SYMFONY[Symfony 6.1]
    SYMFONY --> MARIADB[MariaDB 10.11.9]

    NGINX -->|access| NACCESS[/var/log/nginx/access.log]
    NGINX -->|error| NERROR[/var/log/nginx/error.log]
    PHPFPM -->|error| FPMERR[/var/log/php-fpm.log]
    SYMFONY -->|monolog stderr| NERROR
    MARIADB -->|error| DBERR[/var/log/mysql/mysqld.log]

    style NACCESS fill:#2196F3,color:white
    style NERROR fill:#FF5722,color:white
    style FPMERR fill:#FF9800,color:white
    style DBERR fill:#9C27B0,color:white
```

> ⚠️ **Monolog → stderr**: En producción, Symfony Monolog está configurado con `path: php://stderr`, lo que envía **todos los logs de aplicación al error.log de Nginx** a través de FastCGI. No hay archivos de log Symfony separados.

---

## Logs del sistema

### Nginx

| Archivo | Ruta | Tamaño actual | Descripción |
|---------|------|---------------|-------------|
| `access.log` | `/var/log/nginx/access.log` | 29 KB | Accesos HTTP actuales |
| `error.log` | `/var/log/nginx/error.log` | 151 KB | Errores + stderr de PHP-FPM/Symfony |
| Archivos rotados | `/var/log/nginx/access.log-YYYYMMDD*` | ~57 MB total | Histórico desde dic 2025 |
| Error rotados | `/var/log/nginx/error.log-YYYYMMDD*` | ~6.5 MB total | Histórico con compresión xz |

**Formato access.log**:
```
$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"
```

### PHP-FPM

| Archivo | Ruta | Tamaño | Descripción |
|---------|------|--------|-------------|
| `php-fpm.log` | `/var/log/php-fpm.log` | 542 KB | Pool warnings, child processes |

**Configuración**: `/etc/php8/fpm/php-fpm.conf`  
**Pool**: `www` (pm.max_children = 10)

### MariaDB

| Archivo | Ruta | Tamaño | Descripción |
|---------|------|--------|-------------|
| `mysqld.log` | `/var/log/mysql/mysqld.log` | Activo | Errores y warnings de BD |
| Archivos rotados | `/var/log/mysql/mysqld.log-YYYYMMDD.xz` | Comprimidos | Histórico |

**Configuración**: `/etc/my.cnf`
- `log-error = /var/log/mysql/mysqld.log`
- Slow query log: **deshabilitado** (`# slow_query_log=1`)
- Binary log: **deshabilitado** (`# log_bin=mysql-bin`)

### Systemd / Syslog

| Fuente | Comando | Contenido |
|--------|---------|-----------|
| Journal Nginx | `journalctl -u nginx` | Start/stop/restart del servicio |
| Journal PHP-FPM | `journalctl -u php-fpm` | Errores Symfony via stderr |
| Journal MariaDB | `journalctl -u mariadb` | (sin entradas recientes) |
| Messages | `/var/log/messages` | SSH sessions, systemd events |

---

## Logs de aplicación (Symfony)

### Configuración Monolog

| Entorno | Handler | Tipo | Destino | Nivel |
|---------|---------|------|---------|-------|
| **prod** | main | `fingers_crossed` → nested | `php://stderr` | error → debug |
| **prod** | console | console | stdout | info |
| **prod** | deprecation | stream | `php://stderr` | warning |
| **dev** | main | stream | `var/log/dev.log` | info |
| **test** | main | `fingers_crossed` → nested | `var/log/test.log` | error → debug |

> ℹ️ **Logs vacíos en entorno demo**: Los directorios `var/log/` de todas las aplicaciones **están vacíos**, confirmando que el entorno demo ejecuta en modo `prod` de Symfony y los logs van a stderr (capturados por Nginx):
>
> ```
> /srv/www/htdocs/webapps/demo/ordersapp/current/var/log/         → vacío
> /srv/www/htdocs/webapps/demo/ordersbackoffice/current/var/log/  → vacío
> /srv/www/htdocs/webapps/demo/orderstracking/current/var/log/    → vacío
> /srv/www/htdocs/webapps/demo/regulatory-portal/current/var/log/ → vacío
> /srv/www/htdocs/webapps/demo/rga/current/var/log/               → vacío
> ```

---

## Rotación de logs

### Nginx (logrotate)

```ini
/var/log/nginx/*.log {
    compress           # Compresión xz
    dateext            # Sufijo con fecha YYYYMMDD
    maxage 365         # Retener 365 días
    rotate 99          # Máximo 99 archivos
    size=+4096k        # Rotar cuando supera 4 MB
    missingok          # No error si falta el archivo
    notifempty         # No rotar si está vacío
    delaycompress      # Comprimir en la siguiente rotación
    lastaction
      nginx -s reopen  # Reabrir archivos de log
    endscript
}
```

### Otros servicios con logrotate

`azuremonitoragent` · `chrony` · `firewalld` · `mariadb` · `nginx` · `rsync` · `samba` · `snapper` · `syslog` · `zypp-history`

---

## Acceso a logs

### Comandos útiles

```bash
# Últimos errores de Nginx
tail -100 /var/log/nginx/error.log

# Logs PHP-FPM (pool busy / max_children)
tail -100 /var/log/php-fpm.log

# MariaDB warnings
tail -50 /var/log/mysql/mysqld.log

# Journal de Symfony via PHP-FPM stderr
journalctl -u php-fpm --since "1 hour ago" --no-pager

# Búsqueda de errores por dominio
grep "newmyorders.werfen.com" /var/log/nginx/error.log | tail -20

# Contar errores por tipo
grep -c "\[error\]" /var/log/nginx/error.log

# Access log por código HTTP
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn
```

### Dominios y sus logs

Todos los dominios comparten los mismos archivos de log Nginx:

| Dominio | App | Entorno |
|---------|-----|---------|
| `newmyorders.werfen.com` | orders-app | PROD |
| `orders-demo.werfen.com` | orders-app | DEMO |
| `newmyordersadmin.werfen.com` | ordersbackoffice | PROD |
| `admin-orders-demo.werfen.com` | ordersbackoffice | DEMO |
| `track-and-trace.werfen.com` | orderstracking | PROD |
| `myclaims.werfen.com` | rga | PROD |
| `vendorsportal.werfen.com` | vendorsportal | PROD |
| `caseportal.werfen.com` | caseportal | PROD |

> ⚠️ **Filtrado necesario**: Al no haber separación de logs por vhost, es necesario filtrar por dominio (`server:`) en el error.log para aislar problemas de una aplicación específica.

---

## Recomendaciones

| Prioridad | Recomendación |
|-----------|---------------|
| 🔴 Alta | Separar logs por vhost con `error_log` y `access_log` individuales |
| 🔴 Alta | Habilitar Symfony file logging (`var/log/prod.log`) además de stderr |
| 🟡 Media | Activar slow query log en MariaDB para detectar queries lentas |
| 🟡 Media | Habilitar binary log para point-in-time recovery |
| 🟢 Baja | Centralizar logs con ELK/Loki para monitorización |
| 🟢 Baja | Añadir alertas automáticas para `pm.max_children` y errores 5xx |
