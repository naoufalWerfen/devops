# Ciberseguridad — MyOrders DEMO

**Servidor:** WEBAPPSPROD (10.120.204.93)  
**Fecha de auditoría:** 2026-04-27  
**Entorno:** Demo (también aloja producción)

---

## Resumen Ejecutivo

> 🔴 **Estado general: ALTO RIESGO** — Se han identificado **5 hallazgos críticos**, **4 de riesgo alto**, **4 de riesgo medio** y **3 de riesgo bajo**. Los hallazgos más graves son el stack obsoleto (PHP 8.1 EOL, Symfony 6.1 EOL), el firewall abierto y la fuga de datos SAP en logs.

| Severidad | Cantidad | Hallazgos |
|-----------|----------|-----------|
| 🔴 Crítico | 5 | Firewall abierto, demo/prod compartido, PHP 8.1 EOL, Symfony 6.1 EOL, fuga datos SAP |
| 🟠 Alto | 4 | Monolog stderr, sin rate limiting, server_tokens on, sin WAF |
| 🟡 Medio | 4 | CSP unsafe-inline, slow query log off, binary log off, PHP warnings en prod |
| 🟢 Bajo | 3 | Logs compartidos, RecordedFuture crawler, sin health endpoint |

---

## Hallazgos Críticos

### 1. Firewall completamente abierto

**Severidad:** 🔴 Crítico

No hay reglas de firewall (iptables) configuradas. Las tres cadenas (INPUT, FORWARD, OUTPUT) están en política ACCEPT.

```
Chain INPUT (policy ACCEPT) — 0 reglas
Chain FORWARD (policy ACCEPT) — 0 reglas
Chain OUTPUT (policy ACCEPT) — 0 reglas
```

**Impacto**: Cualquier servicio en cualquier puerto es accesible desde la red sin restricción.

**Recomendación**:
1. Configurar reglas iptables/firewalld para permitir solo puertos necesarios (22, 80, 443)
2. Restringir acceso a puertos internos (8000-8002, 9000, 3306) a localhost/red interna
3. Implementar rate limiting para SSH

---

### 2. Demo y Producción en el mismo servidor

**Severidad:** 🔴 Crítico

El servidor `WEBAPPSPROD` aloja tanto los entornos de **demo** como de **producción** de todas las aplicaciones MyOrders.

```
/srv/www/htdocs/webapps/demo/ordersapp/     ← Demo
/srv/www/htdocs/webapps/prod/ordersapp/     ← Producción
```

**Impacto**: Un fallo o ataque al entorno demo podría afectar directamente a producción.

**Recomendación**: Separar los entornos en servidores o contenedores independientes.

---

### 3. PHP 8.1 — End of Life

**Severidad:** 🔴 Crítico

PHP 8.1 alcanzó su fin de vida el **31 de diciembre de 2025**. No se publican parches de seguridad desde hace 4 meses. Cualquier vulnerabilidad descubierta queda sin corregir.

**Recomendación**: Migrar a PHP 8.2 (soporte hasta dic 2026) o PHP 8.3 (soporte hasta dic 2027).

---

### 4. Symfony 6.1 — Sin soporte desde enero 2023

**Severidad:** 🔴 Crítico

Symfony 6.1 es una versión non-LTS cuyo soporte finalizó en **enero 2023**. Lleva más de **3 años sin actualizaciones de seguridad**.

**Recomendación**: Migrar a Symfony 6.4 LTS (soporte hasta nov 2027) o Symfony 7.x.

---

### 5. Fuga de datos SAP en logs

**Severidad:** 🔴 Crítico

Cada login SSO genera mensajes en el error.log de Nginx con customer IDs, nombres de usuario y respuestas JSON completas de la API SAP.

```
[ZQAU_USER_FROM_CLIENTE] Response for customer 0000321227: 
  username=HOSPIMAX, full response: {"E_USERNAME":"HOSPIMAX"}
```

**Riesgo**: Violación GDPR — datos de clientes en texto plano accesibles a cualquiera con lectura del error.log.

**Recomendación**: Cambiar nivel de log a DEBUG, ofuscar customer IDs, revisar retención de logs.

---

## Hallazgos de riesgo alto

### 6. Escaneo Nmap detectado

**Severidad:** 🟠 Alto

El 25/04/2026 a las 06:49 se detectó un escaneo Nmap desde `212.163.185.1` contra `caseportal.werfen.com`. Rutas probadas: `/owa/`, `/webui`, `/HNAP1`, `/sdk`, `/versa/login`, `/cgi-bin/info.cgi`, etc. (~20 rutas en 90 segundos).

También se detectó un segundo scan contra `myclaims.werfen.com` (23 abril) con ~30 rutas.

**Recomendación**: Implementar rate limiting, fail2ban, verificar con seguridad si los scans son autorizados.

---

### 7. SSO Login sin rate limiting

**Severidad:** 🟠 Alto

Decenas de logins SSO por minuto sin control de velocidad. Permite enumeración de usuarios y brute force de tokens.

**Recomendación**: `limit_req_zone` en Nginx + Symfony RateLimiter.

---

### 8. server_tokens habilitado

**Severidad:** 🟠 Alto

`server_tokens on;` en vhosts expone `Server: nginx/1.21.5`.

**Recomendación**: `server_tokens off;` en `nginx.conf`.

---

### 9. Sin WAF

**Severidad:** 🟠 Alto

No hay ModSecurity, cloud WAF ni ninguna capa de protección. Los escaneos llegaron sin ser bloqueados.

**Recomendación**: ModSecurity con OWASP CRS o Cloud WAF.

---

## Hallazgos de riesgo medio

### 10. Disco al 81%

1 vCPU para múltiples apps en demo y producción. PHP-FPM alcanza `pm.max_children = 10` regularmente.

### 11. CSP con 'unsafe-inline'

El CSP de producción permite `script-src 'unsafe-inline'`, reduciendo protección contra XSS.

### 12. Slow query log y binary log deshabilitados

Sin detección de queries lentas ni auditoría de cambios en BD.

### 13. PHP warnings en producción

VendorsPortal genera warnings que exponen rutas internas del servidor.

---

## Hallazgos de riesgo bajo

### 14. Logs compartidos entre vhosts

8 dominios comparten un único `error.log` y `access.log`.

### 15. build/app.js 404 en admin panels

Webpack Encore no compilado en ordersbackoffice (demo y prod).

### 16. Sin endpoint de health check

`/health`, `/status`, `/api/version` retornan 404.

---

## Headers de seguridad (Producción)

El vhost de producción incluye estos headers (el de demo no):

| Header | Valor |
|--------|-------|
| **Cache-Control** | `no-store, no-cache, must-revalidate, private` |
| **Content-Security-Policy** | default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net, code.jquery.com, cdn.datatables.net, wlpiwik01.werfen.com; style-src 'self' 'unsafe-inline' cdn.datatables.net, use.fontawesome.com; font-src 'self' use.fontawesome.com; connect-src 'self' wlpiwik01.werfen.com; img-src 'self' data: cdn.datatables.net wlpiwik01.werfen.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' *.werfen.com |

> ⚠️ El CSP permite `script-src 'unsafe-inline'`. Considerar migrar a nonces o hashes para scripts inline.

---

## Plan de remediación priorizado

| Prioridad | Acción | Esfuerzo | Impacto |
|-----------|--------|----------|---------|
| 1 | Migrar PHP 8.1 → 8.3 | Alto | Crítico — EOL sin parches |
| 2 | Migrar Symfony 6.1 → 6.4 LTS | Alto | Crítico — 3 años sin seguridad |
| 3 | Configurar firewall iptables | Medio | Crítico — Todo abierto |
| 4 | Separar demo/prod | Alto | Crítico — Riesgo compartido |
| 5 | Mover ZQAU logging a Monolog channel | Bajo | Alto — Fuga datos GDPR |
| 6 | Implementar rate limiting login | Bajo | Alto — Previene brute force |
| 7 | `server_tokens off` | Bajo | Medio — Quick win |
| 8 | Actualizar Nginx 1.21.5 → 1.26.x | Medio | Medio — CVEs conocidos |
| 9 | Implementar WAF | Medio | Alto — Protección web |
| 10 | Migrar CSP a nonces | Medio | Medio — Protección XSS |
