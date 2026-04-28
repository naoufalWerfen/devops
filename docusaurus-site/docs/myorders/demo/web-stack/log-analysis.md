---
sidebar_label: "📊 Análisis en Vivo"
title: "MyOrders DEMO — Análisis de Logs"
---

# Análisis de Logs — MyOrders DEMO

**Servidor**: WEBAPPSPROD (`10.120.204.93`)  
**Período analizado**: 23 abril – 27 abril 2026  
**Recogida de datos**: 27 abril 2026, 17:46 CEST

## Resumen ejecutivo

| Métrica | Valor |
|---------|-------|
| Errores Nginx (error.log) | **201** errores `[error]` |
| Warnings PHP-FPM | **~100** (pool busy + max_children) |
| Warnings MariaDB | **50** conexiones abortadas |
| Logs Symfony (var/log) | **0** archivos (redirigidos a stderr) |
| Escaneos detectados | **3** (Nmap + RecordedFuture) |

## Hallazgo 1 — ZQAU_USER_FROM_CLIENTE flooding

:::danger Impacto: Alto — Ruido en logs + fuga de información
:::

**Descripción**: El proceso de SSO login genera múltiples mensajes `[ZQAU_USER_FROM_CLIENTE]` por cada autenticación. Estos mensajes PHP van a `stderr` y acaban en el `error.log` de Nginx como errores de FastCGI.

**Patrón**:
```
FastCGI sent in stderr: "PHP message: [ZQAU_USER_FROM_CLIENTE] 
  Attempting to get username for customer: 0000XXXXXX
  Response for customer 0000XXXXXX: username=XXXXXXX, 
  full response: {"E_USERNAME":"XXXXXXX"}"
```

**Estadísticas** (23 abril 2026, 07:00–09:30):
- ~**50+ logins** con ZQAU traces
- Clientes con username "NOT FOUND": ~**12 intentos** (customer IDs: 111687, 112216, 114135, 427536, 405565, 427555, 428313, 427532, 117291, 427540, etc.)
- Clientes resueltos OK: HOSPIMAX, GLOBALSCIENT, BIOCELL_MEDI, GANPATI, VINGMED AB, PANOR, MEDTECH_CORP, LABWAY, COSI, etc.

**Diagnóstico**:
- El código PHP usa `error_log()` o escribe a stderr para tracing de la integración SAP (BAPI `ZQAU_USER_FROM_CLIENTE`)
- Esto NO debería ir a error.log: es logging de nivel DEBUG/INFO
- Los "NOT FOUND" pueden indicar clientes no migrados al nuevo sistema SAP

**Remediación**:
1. Mover el logging de ZQAU a un canal Monolog dedicado (ej. `sap_integration`)
2. Configurar nivel `INFO` o `DEBUG` en vez de stderr
3. Investigar los customer IDs con "NOT FOUND" en SAP

---

## Hallazgo 2 — PHP-FPM pool saturado

:::warning Impacto: Alto — Degradación de rendimiento
:::

**Descripción**: PHP-FPM alcanza repetidamente el límite `pm.max_children = 10`, causando esperas y degradación del servicio.

**Frecuencia** (2-22 abril 2026):

| Tipo de warning | Ocurrencias |
|-----------------|-------------|
| `seems busy, spawning X children` | ~40 veces |
| `server reached pm.max_children (10)` | ~20 veces |
| `child exited on signal 9 (SIGKILL)` | 2 veces |

**Eventos destacados**:
- **3 abril 14:35**: Spawning escalado hasta 32 children, child SIGKILL tras 46s
- **8 abril 23:32**: Spawning cascada (8→16→32→max_children) en 3 segundos
- **15 abril 23:46**: Misma cascada de saturación
- **21 abril 10:12–21:21**: 10 eventos de saturación en un solo día

**Diagnóstico**:
- Con `pm.max_children = 10` y 1 vCPU, el servidor se satura fácilmente
- Los SIGKILL sugieren workers colgados (timeout OOM o deadlock)
- La media de ocurrencias es **~3-4 saturaciones por día**

**Remediación**:
1. Aumentar `pm.max_children` a 15-20 (verificar RAM disponible)
2. Ajustar `pm.start_servers`, `pm.min_spare_servers`, `pm.max_spare_servers`
3. Considerar `pm = ondemand` en vez de `dynamic` para liberar memoria en idle
4. Evaluar ampliación a 2+ vCPUs

---

## Hallazgo 3 — build/app.js 404 en panels de administración

:::warning Impacto: Medio — Funcionalidad admin degradada
:::

**Descripción**: Los paneles EasyAdmin generan 404 para `/build/app.js` tanto en demo como producción.

**Evidencia**:
```
# PROD - 23 abril 10:10-10:15 (4 hits)
newmyordersadmin.werfen.com → GET /build/app.js → 404

# DEMO - 24 abril 13:32 (2 hits)
admin-orders-demo.werfen.com → GET /build/app.js → 404
```

**Diagnóstico**: Webpack Encore no se ejecutó en el último deploy de ordersbackoffice. El template Twig referencia `build/app.js` pero el directorio `build/` no contiene el archivo compilado.

**Remediación**: Añadir `npm run build` al proceso de deploy (Ansistrano) del ordersbackoffice.

---

## Hallazgo 4 — VendorsPortal PHP warnings

:::caution Impacto: Medio — Errores silenciosos en producción
:::

**Descripción**: El VendorsPortal genera warnings de PHP por acceso a offsets de arrays null.

**Archivos afectados**:
```
vendorsportal/src/Controller/PendingInvoices/PendingInvoicesController.php → líneas 39-40
vendorsportal/src/Controller/Payments/PaymentsController.php → líneas 39-40
```

**Frecuencia**: 4 ocurrencias el 23 abril (08:43, 09:04, 09:08, 09:18)

**Diagnóstico**: Los controladores intentan acceder a `$array['key']` cuando `$array` es `null`. Probablemente la respuesta de SAP/API no devuelve datos esperados.

**Remediación**:
1. Añadir null check: `$data['key'] ?? null`
2. Validar la respuesta de la API antes de acceder a los offsets

---

## Hallazgo 5 — MariaDB conexiones abortadas (patrón crónico)

:::info Impacto: Bajo-Medio — Indica problemas de conectividad persistente
:::

**Descripción**: Conexiones abortadas de forma regular entre junio 2025 y abril 2026.

**Patrón**:
```
Aborted connection XXXXX to db: 'orders_demo' user: 'ordersdemo' 
  host: 'localhost' (Got an error reading communication packets)
```

**Estadísticas**:

| Período | DB | Frecuencia |
|---------|----|-----------|
| Jun 2025 | orders_demo | ~2/día (como reloj: cada ~11h) |
| Jul-Dic 2025 | orders + orders_demo | Esporádico |
| Ene-Abr 2026 | orders + orders_demo | 1-2/mes |
| Nov 2025 | — | Login fallido `mhernandez2`, conexiones sin autenticar |

**Diagnóstico**:
- Las conexiones regulares cada ~11h (jun 2025) sugieren un cron job o health check con timeout
- El intento fallido de `mhernandez2` (nov 2025) fue un acceso legítimo fallido (contraseña incorrecta)
- Las conexiones "unauthenticated" (nov 2025, mar 2026) son intentos de conexión que se cerraron antes de autenticar

**Remediación**:
1. Revisar configuración de `wait_timeout` y `interactive_timeout` en MariaDB
2. Verificar que la app gestiona correctamente el connection pooling
3. Investigar el cron job que causa desconexiones regulares

---

## Hallazgo 6 — track-and-trace ruta ROT13

:::info Impacto: Bajo — Ruta no encontrada
:::

**Descripción**: Una petición a `track-and-trace.werfen.com/beqre-genpxrq/` genera 404.

**Análisis**: La URL `/beqre-genpxrq/` decodificada con ROT13 es `/order-tracked/`. Esto sugiere que el frontend o un enlace externo envía URLs ofuscadas que el backend no soporta.

**Remediación**: Verificar si el frontend genera URLs ROT13 y asegurar que el backend las decodifica correctamente.

---

## Hallazgo 7 — RecordedFuture crawler

:::info Impacto: Informativo — Actividad de threat intelligence
:::

**Descripción**: El 27 abril a las 15:29, un crawler de "RecordedFuture Global Inventory Crawler" accedió desde `10.250.8.10`.

**Evidencia**:
```
GET / → 302
GET /admin/E/list → 302
GET /E/login → 200
```

**Diagnóstico**: RecordedFuture es un servicio legítimo de threat intelligence que escanea servicios expuestos a Internet. La IP interna sugiere que pasa por un proxy corporativo.

---

## Hallazgo 8 — Nginx service kill timeout

:::caution Impacto: Bajo — Indicador de procesos colgados
:::

**Descripción**: El 17 abril, el reinicio de Nginx requirió SIGKILL después de que `stop-sigterm` superara el timeout.

```
Apr 17 11:13:27 — Stopping nginx...
Apr 17 11:13:32 — State 'stop-sigterm' timed out. Killing.
Apr 17 11:13:32 — Killing process 12361 (nginx) with signal SIGKILL
Apr 17 11:13:33 — nginx.service: Failed with result 'timeout'
```

**Diagnóstico**: Un worker Nginx estaba procesando una request larga o estaba bloqueado esperando upstream (PHP-FPM). Combinado con las saturaciones de PHP-FPM, indica un sistema bajo estrés.

---

## Tabla resumen de hallazgos

| # | Hallazgo | Severidad | Componente | Estado |
|---|----------|-----------|------------|--------|
| 1 | ZQAU flooding en error.log | 🔴 Alto | Nginx/PHP | Activo |
| 2 | PHP-FPM pool saturado (max=10) | 🔴 Alto | PHP-FPM | Crónico |
| 3 | build/app.js 404 admin panels | 🟡 Medio | Ordersbackoffice | Activo |
| 4 | VendorsPortal PHP null warnings | 🟡 Medio | VendorsPortal | Activo |
| 5 | MariaDB conexiones abortadas | 🟡 Medio | MariaDB | Crónico |
| 6 | ROT13 route en track-and-trace | 🟢 Bajo | Orderstracking | Esporádico |
| 7 | RecordedFuture crawler | ℹ️ Info | — | Normal |
| 8 | Nginx SIGKILL en restart | 🟢 Bajo | Nginx | Esporádico |
