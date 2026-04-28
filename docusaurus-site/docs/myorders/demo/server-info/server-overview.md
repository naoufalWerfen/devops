---
sidebar_label: "Servidor & Red"
title: "MyOrders DEMO — Servidor & Red"
---

# Servidor & Red — WEBAPPSPROD

## Información general

| Propiedad | Valor |
|-----------|-------|
| **Hostname** | `WEBAPPSPROD` |
| **IP** | `10.120.204.93` |
| **OS** | SUSE Linux Enterprise Server 15 SP6 |
| **Kernel** | `6.4.0-150600.23.25-default` |
| **CPU** | 1 vCPU |
| **RAM** | 15 GB total — 1.9 GB usada — 13 GB disponible (buff/cache) |
| **Disco** | 146 GB total — 113 GB usado — 27 GB libre (**81%**) |
| **Shared memory** | 378 MB |

:::warning Disco al 81%
El disco raíz está al 81% de capacidad (113 de 146 GB). Recomendado monitorizar y planificar limpieza de releases antiguas o logs.
:::

## Servicios activos

| Servicio | Puerto | Estado | Proceso |
|----------|--------|--------|---------|
| **Nginx** | 80, 8000, 8001, 8002 | 🟢 Activo | `nginx` (master + worker) |
| **PHP-FPM** | 9000 | 🟢 Activo | `php-fpm` (4 workers) |
| **MariaDB** | 3306 | 🟢 Activo | `mysqld` (localhost only) |
| **SSH** | 22 | 🟢 Activo | `sshd` |
| **Postfix** | 25 | 🟢 Activo | `master` (localhost only) |
| **Azure Arc** | 10001, 12563, 13005 | 🟢 Activo | `agentid-service`, `amacoreagent` |
| **Azure HIMDS** | 40342-40344 | 🟢 Activo | `himds`, `arcproxy` |
| **Metrics Extension** | 4316, 4317 | 🟢 Activo | `MetricsExtensio` |
| **Apache** | — | 🟡 Inactivo | Instalado (2.4.58) pero sin servicio activo |

## Puertos en escucha

```
LISTEN 0.0.0.0:22     → sshd
LISTEN 0.0.0.0:80     → nginx (vhosts principales)
LISTEN 0.0.0.0:8000   → nginx (welisten)
LISTEN 0.0.0.0:8001   → nginx (vendorsportal)
LISTEN 0.0.0.0:8002   → nginx (middlewareadp)
LISTEN 127.0.0.1:25   → postfix (localhost)
LISTEN 127.0.0.1:3306 → mariadb (localhost)
LISTEN 127.0.0.1:9000 → php-fpm
LISTEN 10.120.204.93:10001 → Azure agentid-service
```

## Software instalado

| Software | Versión |
|----------|---------|
| Nginx | 1.21.5 |
| Apache | 2.4.58 (instalado, no activo) |
| PHP | 8.1.23 (cli + FPM) |
| Node.js | 20.15.1 |
| MariaDB | 10.11.9 |
| Python | 3.6.15 |

## Seguridad de red

### Firewall (iptables)

:::danger Firewall completamente abierto
No hay reglas de firewall configuradas. Las tres cadenas (INPUT, FORWARD, OUTPUT) están en política ACCEPT sin ninguna regla.
:::

```
Chain INPUT (policy ACCEPT) — sin reglas
Chain FORWARD (policy ACCEPT) — sin reglas
Chain OUTPUT (policy ACCEPT) — sin reglas
```

### Cron jobs

| Job | Descripción |
|-----|-------------|
| `azcmagent_autoupgrade` | Auto-update del agente Azure Arc |

## Estructura de aplicaciones en el servidor

```
/srv/www/htdocs/webapps/
├── demo/
│   ├── ordersapp/         ← MyOrders (este proyecto)
│   ├── ordersbackoffice/  ← Admin panel
│   ├── orderstracking/    ← Order tracking
│   ├── myclaims/          ← Claims management
│   ├── regulatory-portal/ ← Regulatory docs
│   └── rga/               ← Return goods
├── prod/
│   ├── ordersapp/         ← Producción
│   ├── ordersbackoffice/
│   └── orderstracking/
├── caseportal/
├── vendorsportal/
├── welisten/
├── middlewareadp/
└── websites/
```
