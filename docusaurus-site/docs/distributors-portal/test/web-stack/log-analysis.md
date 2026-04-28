# Análisis de Logs en Vivo

> **Cómo funciona**: Cuando me pidas *"analiza los logs"*, *"qué está pasando ahora"* o similar, conecto al servidor, interpreto los logs y actualizo esta página. Tu navegador se refresca solo (hot-reload de MkDocs).

---

##  Última actualización

**Fecha del análisis**: 2026-04-27 15:38 (CEST)  
**Hora del servidor**: 2026-04-27 15:38:08 CEST  
**Periodo analizado**: hoy (27/Abr) hasta las 15:38

---

##  Resumen ejecutivo

:::tip[Estado general: Saludable]
El portal está operativo. Sin errores críticos en las últimas horas. Última petición útil registrada: **12:53** (hace ~2h45min). Actualmente el servidor está en reposo (sin tráfico activo).
:::

| Métrica | Valor |
|---------|-------|
| Última petición de usuario | 12:53:08 |
| Última sesión Drupal | 10:34 (usuario `CAPRIS`) |
| Errores críticos hoy | 0 |
| Warnings PHP hoy | 2 (no críticos) |
| Errores Apache recientes | Antiguos (enero), no nuevos |

---

##  Actividad de usuarios (sesiones Drupal)

| Hora | Usuario | Acción |
|------|---------|--------|
| 10:34 | `CAPRIS` | **Login** (Session opened) |
| 10:34 | `CAPRIS` | **Logout** (Session closed) |
| 09:57 | `CAPRIS` | **Login** |
| 09:57 | `BEIJING_HAIX` | **Logout** |

> **Observación**: Solo 2 usuarios activos hoy. `BEIJING_HAIX` (China) y `CAPRIS` han usado el portal por la mañana. Sin actividad desde las 12:53.

---

##  Última navegación registrada (12:35)

Reconstrucción de la última sesión completa:

```mermaid
graph LR
    A[References<br>12:34:45] --> B[Logout<br>12:34:49]
    B --> C[Login<br>12:34:54]
    C --> D[Home e-business<br>12:34:57]
    D --> E[References<br>12:34:59]
    E --> F[Orders<br>12:35:01]
    F --> G[Import order<br>0404513057<br>12:35:03]
    G --> H[Basket<br>12:35:06]
    H --> I[Offers<br>12:35:12]
```

**Pedido importado**: `#0404513057` (a las 12:35:03)

A partir de 12:53 solo se ven peticiones de `*.js.map` (DevTools del navegador abierto, no actividad real).

---

##  Errores y warnings

### Apache (sin errores nuevos)

Los últimos errores Apache son de **enero 2026** (no hay nuevos desde entonces):

- ❌ `AH00690: no acceptable variant: .../themes/custom/wleb_bootstrap/css/style` — referencia rota a CSS
- ❌ `AH01276: Cannot serve directory .../core/misc/icons/e32700/` — directorio de iconos sin index

:::info[No es urgente]
Son errores cosméticos de configuración antigua. No afectan a la operación.
:::

### PHP / Drupal (warnings recurrentes)

Los mismos problemas se repiten cada día:

| # | Tipo | Frecuencia | Mensaje |
|---|------|-----------|---------|
| 1 | PHP Warning | Cada login | `file_get_contents(libraries/moment/min/moment.min.js): No such file or directory` |
| 2 | PHP Warning | Cada login | `file_get_contents(libraries/moment/locale/zh-cn.js): No such file or directory` |
| 3 | Webform Notice | Cada carga | `Options carrier do not exist` |
| 4 | Webform Notice | Cada carga | `Options customer_drafts do not exist` |
| 5 | PHP Notice | A veces | `Trying to access array offset on value of type null in Drupal\wleb_ws\UserService->getAccess() línea 111` |

:::warning[Acción recomendada]
- **#1, #2**: Falta la librería **Moment.js** en `/srv/www/htdocs/distributors_portal_test/web/libraries/moment/`. Hay que instalarla.
- **#3, #4**: Webforms con opciones referenciadas que no existen en la BD.
- **#5**: Bug en módulo custom `wleb_ws/src/UserService.php:111` — falta validar null antes de acceder al array.
:::

---

##  Estadísticas rápidas

| Concepto | Valor |
|----------|-------|
| Sesiones únicas hoy | 2 (CAPRIS, BEIJING_HAIX) |
| Pedidos importados al carrito | 3 (`#0404589236`, `#0404537325`, `#0404513057`) |
| Pico de actividad | 12:34 - 12:35 |
| Estado actual | 😴 Inactivo |

---

##  Historial de sesiones

- **2026-04-27 15:38** — Análisis actual
- _(no hay análisis anteriores)_

---

##  Tipos de análisis disponibles

| Tipo | Qué hace | Ejemplo |
|------|----------|---------|
| **Actividad de usuario** | Reconstruye qué páginas visitó | "Qué hizo CAPRIS hoy" |
| **Errores recientes** | Lista errores PHP / Apache / Drupal | "Errores del último día" |
| **Performance** | Detecta peticiones lentas o picos | "Hay alguna petición lenta?" |
| **Seguridad** | Busca 401/403, ataques | "Hay intentos de intrusión?" |
| **SAP integración** | Analiza llamadas a `erpqas.werfen.com` | "Cómo va la integración SAP?" |

---

##  Fuentes consultadas en este análisis

- `tail -50 /var/log/apache2/access_log`
- `tail -10 /var/log/apache2/distributors_portal_test-error_log`
- `drush watchdog:show --count=10`

> Ver [logs.md](logs.md) para el mapa completo de logs.
