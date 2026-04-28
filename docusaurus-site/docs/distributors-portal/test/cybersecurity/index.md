# Ciberseguridad — Distributors Portal (TEST)

> **Servidor**: 10.120.204.25 (DISTRIBUTORSPORTALTEST)  
> **Última revisión**: 2026-04-27  
> **Criticidad**: ⚠ ALTA — Software EOL en producción

---

## Resumen de riesgos

| # | Riesgo | Severidad | Detalle |
|---|--------|-----------|---------|
| 1 | **Drupal 9.4.8 — EOL** | 🔴 CRÍTICO | Fin de vida desde nov 2023. Sin parches de seguridad desde hace >2 años |
| 2 | **PHP 7.4 — EOL** | 🔴 CRÍTICO | Fin de vida desde nov 2022. Sin soporte de seguridad |
| 3 | **Sin backup automático** | 🔴 CRÍTICO | Último backup manual: enero 2022 |
| 4 | **Firewall desactivado** | 🟡 MEDIO | iptables con políticas ACCEPT en todas las chains |
| 5 | **Apache sin HTTPS directo** | 🟡 MEDIO | SSL termina en el proxy reverso, Apache solo escucha :80 |
| 6 | **Sin cron de seguridad** | 🟡 MEDIO | No hay actualizaciones automáticas ni escaneos programados |
| 7 | **Watchdog sin limpieza** | 🟢 BAJO | 790K registros, 4.3 GB — puede contener info sensible |

---

## 1. Versiones de software — Estado EOL

| Software | Versión | EOL | Última versión estable |
|----------|---------|-----|----------------------|
| **Drupal** | 9.4.8 | ✅ Nov 2023 | Drupal 10.3.x / 11.x |
| **PHP** | 7.4.30 | ✅ Nov 2022 | PHP 8.3.x |
| **MariaDB** | 10.11.9 | ❌ Feb 2028 | OK |
| **Apache** | 2.4.58 | ❌ Activo | OK |
| **SLES** | 15 SP6 | ❌ Activo | OK |

### Comandos de verificación

```bash
# Verificar versiones actuales
php -v
mysql --version
httpd -v
cat /etc/os-release

# Drupal
cd /srv/www/htdocs/distributors_portal_test
vendor/bin/drush status | grep "Drupal version"

# Comprobar actualizaciones de seguridad de Drupal
vendor/bin/drush pm:security
```

---

## 2. Firewall

**Estado**: ⚠ Sin reglas activas

```
Chain INPUT (policy ACCEPT)    — Todo el tráfico entrante ACEPTADO
Chain FORWARD (policy ACCEPT)  — Todo el forward ACEPTADO  
Chain OUTPUT (policy ACCEPT)   — Todo el tráfico saliente ACEPTADO
```

- `firewalld`: No responde (posiblemente no instalado o inactivo)
- La seguridad perimetral depende del **proxy reverso** (212.163.185.1) y la red corporativa

### Comandos de consulta

```bash
# Ver reglas iptables
iptables -L -n -v

# Ver estado firewalld
systemctl status firewalld
firewall-cmd --list-all

# Ver puertos abiertos
ss -tlnp
```

---

## 3. Red y acceso

| Elemento | Configuración |
|----------|--------------|
| **Acceso SSH** | root directo (sin sudo) |
| **Puerto SSH** | 22 (default) |
| **Apache** | Solo puerto 80 (HTTP) |
| **SSL/TLS** | Terminación en proxy reverso (212.163.185.1) |
| **MariaDB** | Solo localhost (bind 127.0.0.1) ✅ |
| **Usuarios SSH** | root, deploy + devs personales |

### Comandos de consulta

```bash
# Ver conexiones activas
ss -tlnp

# Ver intentos de acceso fallidos
grep "Failed password" /var/log/messages | tail -20

# Ver últimos accesos
last | head -20

# Ver usuarios conectados ahora
who
```

---

## 4. Permisos de archivos

| Directorio | Propietario | Permisos |
|------------|-------------|----------|
| `/srv/www/htdocs/distributors_portal_test/` | `deploy:www` | Estándar |
| `/var/log/apache2/` | `root:root` | 750 (directorio) |
| `/home/deploy/` | `deploy:users` | Estándar |

### Archivos sensibles

```bash
# Verificar permisos de settings.php
ls -la /srv/www/htdocs/distributors_portal_test/web/sites/default/settings*.php

# Buscar archivos con permisos demasiado abiertos
find /srv/www/htdocs/distributors_portal_test -perm -o+w -type f 2>/dev/null

# Verificar propietario de todo el proyecto
find /srv/www/htdocs/distributors_portal_test -not -user deploy -not -path "*/vendor/*" -type f 2>/dev/null | head -20
```

---

## 5. Apache — Hardening

| Directiva | Valor | Estado |
|-----------|-------|--------|
| `ServerTokens` | ProductOnly | ✅ No revela versión |
| `ServerSignature` | Off | ✅ Sin firma en errores |
| `TraceEnable` | Off | ✅ TRACE desactivado |
| `.htaccess` | Protección Drupal estándar | ✅ Bloquea archivos sensibles |
| `Options` | None (global) | ✅ Sin indexes ni listing |
| `AllowOverride` | None (global), All en vhosts | ⚠ AllowOverride All en vhosts |

### Comandos de consulta

```bash
# Ver configuración de seguridad
grep -iE "ServerTokens|ServerSignature|TraceEnable" /etc/sysconfig/apache2

# Ver headers HTTP
curl -sI http://localhost/ | head -20

# Testear acceso a archivos sensibles
curl -s -o /dev/null -w "%{http_code}" http://localhost/web.config
curl -s -o /dev/null -w "%{http_code}" http://localhost/composer.json
```

---

## 6. Integración SAP — Seguridad

| Parámetro | Valor |
|-----------|-------|
| **Endpoint** | `erpqas.werfen.com/zsapui5_json` (HTTPS) |
| **Entorno** | QAS (no producción) |
| **Protocolo** | HTTPS ✅ |
| **Autenticación** | Usuario ZWEBSERVICE |

> Las credenciales de SAP están en `settings.local.php` en el servidor. No almacenar en este repositorio.

---

## Recomendaciones prioritarias

### 🔴 Urgente

1. **Actualizar Drupal** a 10.x o 11.x — La versión 9.4.8 tiene vulnerabilidades conocidas sin parchear
2. **Actualizar PHP** a 8.2+ — PHP 7.4 no recibe parches de seguridad
3. **Implementar backups automáticos** — Sin backup desde enero 2022

### 🟡 Importante

4. **Configurar firewall** — Activar iptables o firewalld con reglas restrictivas
5. **Limitar acceso SSH** — Desactivar root login directo, usar sudo
6. **Limpiar tabla watchdog** — 790K registros pueden contener info sensible
7. **Activar HTTPS en Apache** — Aunque el proxy lo maneja, defense-in-depth

### 🟢 Mejoras

8. **Configurar fail2ban** — Protección contra fuerza bruta SSH
9. **Auditar usuarios MariaDB** — Verificar permisos mínimos necesarios
10. **Monitorización** — Implementar alertas de disco, CPU, servicios
