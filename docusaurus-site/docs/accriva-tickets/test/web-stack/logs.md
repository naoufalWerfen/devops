# Logs — Accriva Tickets TEST

**Servidor:** ACCRIVATICKETSTEST (10.120.204.45)  
**Fecha de auditoría:** 2026-04-27

---

##  Mapa de Logs

### Nginx

| Log | Ruta | Formato | Rotación |
|-----|------|---------|----------|
| Access Log | `/var/log/nginx/access.log` | combined | logrotate |
| Error Log | `/var/log/nginx/error.log` | nginx default | logrotate |

:::info[Logging desactivado por defecto]
El `access_log` y `error_log` están **comentados** en `nginx.conf`. Los logs funcionan porque Nginx los escribe por defecto, pero sin formato custom (`main`).
:::

### Node.js API (Winston)

| Log | Ruta | Formato | Tamaño |
|-----|------|---------|--------|
| Info Log | `/srv/www/htdocs/accriva-tickets/services/api/info.log` | JSON | 196 KB |
| Error Log | `/srv/www/htdocs/accriva-tickets/services/api/error.log` | JSON | 3.7 KB |
| RGA Error Log | `/srv/www/htdocs/accriva-tickets/services/api/create_rga_error.log` | JSON | 3 KB |
| RGA Log (vacío) | `/srv/www/htdocs/accriva-tickets/services/api/createrga.log` | — | 0 bytes |

### Systemd Journal

| Log | Comando | Notas |
|-----|---------|-------|
| Node.js service | `journalctl -u accrivanodeapi` | SyslogIdentifier: `accrivaticketsapi` |
| Nginx service | `journalctl -u nginx` | Solo start/stop/reload |
| Apache service | `journalctl -u apache2` | Solo start/stop/reload |

---

##  Comandos de Diagnóstico Rápido

### Nginx

```bash
# Últimas peticiones (access log)
tail -50 /var/log/nginx/access.log

# Errores Nginx
tail -20 /var/log/nginx/error.log

# Peticiones con error (4xx/5xx)
awk '$9 >= 400' /var/log/nginx/access.log | tail -20

# Peticiones a la API
grep '/api/' /var/log/nginx/access.log | tail -20

# Peticiones SSO
grep '/SSO/' /var/log/nginx/access.log | tail -10

# IPs únicas hoy
grep "$(date +%d/%b/%Y)" /var/log/nginx/access.log | awk '{print $1}' | sort -u
```

### Node.js API

```bash
# Últimos logins
grep '"User log on"' /srv/www/htdocs/accriva-tickets/services/api/info.log | tail -10

# Últimos tickets vistos
grep '"Single ticket viewed"' /srv/www/htdocs/accriva-tickets/services/api/info.log | tail -10

# Errores de la API
cat /srv/www/htdocs/accriva-tickets/services/api/error.log | python3 -m json.tool 2>/dev/null | tail -50

# Errores de RGA (Return Goods Authorization)
cat /srv/www/htdocs/accriva-tickets/services/api/create_rga_error.log | tail -10

# Logs en tiempo real (syslog)
journalctl -u accrivanodeapi -f

# Estado del servicio Node.js
systemctl status accrivanodeapi
```

### Estado general

```bash
# Estado de todos los servicios web
systemctl status nginx apache2 accrivanodeapi

# Procesos Node.js
ps aux | grep node

# Conexiones activas al API
ss -tnp | grep :4000

# Conexiones activas a Nginx
ss -tnp | grep -E ':80|:443'

# Uso de memoria del Node.js
ps aux | grep 'node.*index.js' | awk '{print "RSS:", $6/1024, "MB"}'
```

---

##  Análisis de Actividad

### Última actividad detectada

| Fuente | Última entrada | Fecha |
|--------|---------------|-------|
| Nginx access.log | SSO + carga SPA | 2026-04-20 21:34 |
| Node.js info.log | User login (CARDIA) | 2022-01-31 17:05 |
| Node.js error.log | SAP material error | 2019-03-07 18:42 |
| RGA error log | RS creation error | 2019-03-11 12:05 |
| Journalctl (node service) | Sin entradas | — |

:::warning[Logs de aplicación sin actividad desde 2022]
El `info.log` de la API no registra actividad desde **enero 2022**. Sin embargo, el `access.log` de Nginx muestra acceso SSO en **abril 2026**. Esto podría indicar:

- El servicio Node.js se reinició y el log se rotó (pero pesa 196KB con datos de 2022)
- Los usuarios acceden a la SPA pero no llegan a interactuar con la API
- Posible problema de logging (Winston no está escribiendo)
:::

### Usuarios históricos detectados en logs

| Usuario | Última actividad | Acciones |
|---------|-----------------|----------|
| CARDIA | 2022-01-31 | Login + view ticket |
| TRANSMED1 | 2022-01-21 | Login + view ticket |
| AXON | 2022-01-18 | Login + view ticket |
| VINGMED | 2022-01-18 | Login + view ticket |

### Errores recurrentes

| Error | Frecuencia | Última vez | Severidad |
|-------|-----------|------------|-----------|
| Material `000A1000E-INTCC` not defined for sales org.169 | 14 veces | 2019-03-07 | Error |
| Material `000ELITEINTC` does not exist in plant AA02 | 1 vez | 2019-03-11 | Error |

:::info[Errores históricos resueltos]
Todos los errores en los logs de la API son de **2019** — problemas de configuración de materiales en SAP. No se han producido errores nuevos (o el logging dejó de funcionar).
:::

---

##  Scan de actividad sospechosa (Nginx)

El access log muestra peticiones de escaneo desde `10.120.202.4` (red interna):

```
GET /ui/login.action          ← Intento de acceso a Confluence/Jira
GET /admin/login.jsp          ← Intento de acceso a panel admin
GET /wcd/top.xml              ← Fingerprinting de impresoras
GET /gaia_docs                ← Fingerprinting
GET /camera/index.html        ← Fingerprinting de cámaras IP
```

Todas estas peticiones devuelven **200** porque Nginx reescribe todo a `index.html` (la SPA React). No hay riesgo real, pero indica que un **scanner de vulnerabilidades** (probablemente Qualys) está probando el servidor desde la red interna.
