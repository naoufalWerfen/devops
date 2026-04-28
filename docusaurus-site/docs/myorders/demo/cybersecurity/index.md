---
sidebar_label: "🛡️ Seguridad"
title: "MyOrders DEMO — Seguridad"
---

# Auditoría de Seguridad — MyOrders DEMO

**Servidor**: WEBAPPSPROD (`10.120.204.93`)  
**Fecha de auditoría**: 27 abril 2026  
**Entorno**: Demo (también aloja producción)

## Resumen de hallazgos

| Severidad | Cantidad | Detalle |
|-----------|----------|---------|
| 🔴 **Crítico** | 2 | Firewall abierto, servidor compartido demo/prod |
| 🟠 **Alto** | 3 | Nmap scan, build/app.js 404, server_tokens on |
| 🟡 **Medio** | 3 | Disco 81%, 1 vCPU, Apache legacy |
| 🟢 **Bajo** | 2 | Logging config, crontab mínimo |

## Hallazgos detallados

### 🔴 CRÍTICO — Firewall completamente abierto

**Descripción**: No hay reglas de firewall (iptables) configuradas en el servidor. Las tres cadenas (INPUT, FORWARD, OUTPUT) están en política ACCEPT.

**Impacto**: Cualquier servicio en cualquier puerto es accesible desde la red sin restricción.

**Evidencia**:
```
Chain INPUT (policy ACCEPT) — 0 reglas
Chain FORWARD (policy ACCEPT) — 0 reglas
Chain OUTPUT (policy ACCEPT) — 0 reglas
```

**Recomendación**:
1. Configurar reglas iptables/firewalld para permitir solo puertos necesarios (22, 80, 443)
2. Restringir acceso a puertos internos (8000-8002, 9000, 3306) a localhost/red interna
3. Implementar rate limiting para SSH

---

### 🔴 CRÍTICO — Demo y Producción en el mismo servidor

**Descripción**: El servidor `WEBAPPSPROD` aloja tanto los entornos de **demo** como de **producción** de todas las aplicaciones MyOrders.

**Impacto**: Un fallo o ataque al entorno demo podría afectar directamente a producción.

**Evidencia**:
```
/srv/www/htdocs/webapps/demo/ordersapp/     ← Demo
/srv/www/htdocs/webapps/prod/ordersapp/     ← Producción
```

**Recomendación**: Separar los entornos en servidores o contenedores independientes.

---

### 🟠 ALTO — Escaneo Nmap detectado

**Descripción**: El 25/04/2026 a las 06:49 se detectó un escaneo de seguridad (Nmap) desde la IP `212.163.185.1` (reverse proxy) contra `caseportal.werfen.com`.

**Impacto**: Indica actividad de reconocimiento contra el servidor. Las rutas probadas incluyen: `/owa/`, `/webui`, `/HNAP1`, `/sdk`, `/versa/login`, `/cgi-bin/info.cgi`, `/+CSCOE+/logon.html`, `/dana-na/`, `/api/v1/check-version`, `/Account/Login`, etc.

**Evidencia**: 20+ errores 404 en nginx error.log con patrones típicos de herramientas de escaneo.

**Recomendación**:
1. Investigar si el scan fue autorizado (auditoría interna) o no
2. Implementar rate limiting en Nginx
3. Añadir fail2ban o similar para detectar/bloquear scans

---

### 🟠 ALTO — build/app.js retorna 404 en admin panels

**Descripción**: Los paneles de administración (EasyAdmin) tanto en demo como en producción generan errores porque el archivo `/build/app.js` no se encuentra.

**Impacto**: Funcionalidad JavaScript del admin panel no funciona correctamente.

**Evidencia**:
```
# Demo
admin-orders-demo.werfen.com/build/app.js → 404
# Prod
newmyordersadmin.werfen.com/build/app.js → 404
```

**Recomendación**: Ejecutar `npm run build` o `yarn build` en el directorio ordersbackoffice para compilar los assets de Webpack Encore.

---

### 🟠 ALTO — server_tokens habilitado

**Descripción**: Nginx tiene `server_tokens on` en los vhosts de orders-app, lo que expone la versión del servidor en las respuestas HTTP.

**Impacto**: Facilita a un atacante identificar vulnerabilidades específicas de la versión.

**Recomendación**: Cambiar a `server_tokens off` en todos los vhosts.

---

### 🟡 MEDIO — Disco al 81%

**Descripción**: El disco raíz del servidor está al 81% de capacidad (113 de 146 GB).

**Impacto**: Riesgo de quedarse sin espacio en disco, lo que causaría caídas de servicio.

**Recomendación**:
1. Limpiar releases antiguas en `/srv/www/htdocs/webapps/*/releases/`
2. Rotar y comprimir logs
3. Monitorizar uso de disco con alertas

---

### 🟡 MEDIO — Solo 1 vCPU

**Descripción**: El servidor tiene solo 1 vCPU para servir múltiples aplicaciones web en demo y producción.

**Impacto**: Rendimiento limitado bajo carga, especialmente con PHP-FPM, MariaDB y Nginx compitiendo por CPU.

**Recomendación**: Considerar escalar a 2-4 vCPUs.

---

### 🟡 MEDIO — Apache instalado pero inactivo

**Descripción**: Apache 2.4.58 está instalado pero no tiene un servicio activo. Los últimos logs son de abril 2023.

**Impacto**: Software innecesario aumenta la superficie de ataque.

**Recomendación**: Desinstalar Apache si no se usa, o al menos deshabilitarlo completamente.

---

### 🟢 BAJO — CSP solo en producción

**Descripción**: Solo el vhost de producción (`newmyorders.werfen.com`) tiene headers de `Content-Security-Policy`. Los vhosts de demo no los tienen.

**Recomendación**: Aplicar los mismos headers de seguridad en todos los entornos.

---

### 🟢 BAJO — Sin backup automatizado visible

**Descripción**: Solo se detectó un crontab de Azure Arc auto-upgrade. No se ven jobs de backup de base de datos o archivos.

**Recomendación**: Verificar que existe un sistema de backup (posiblemente gestionado externamente) y documentarlo.

## Headers de seguridad (Producción)

El vhost de producción incluye estos headers (el de demo no):

| Header | Valor |
|--------|-------|
| **Cache-Control** | `no-store, no-cache, must-revalidate, private` |
| **Content-Security-Policy** | default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net, code.jquery.com, cdn.datatables.net, wlpiwik01.werfen.com; style-src 'self' 'unsafe-inline' cdn.datatables.net, use.fontawesome.com; font-src 'self' use.fontawesome.com; connect-src 'self' wlpiwik01.werfen.com; img-src 'self' data: cdn.datatables.net wlpiwik01.werfen.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' *.werfen.com |

:::info Nota sobre 'unsafe-inline'
El CSP permite `script-src 'unsafe-inline'`, lo que reduce la protección contra XSS. Considerar migrar a nonces o hashes para scripts inline.
:::
