# Server Overview — WEBAPPSPROD

**IP:** 10.120.204.93  
**Hostname:** WEBAPPSPROD  
**Fecha de auditoría:** 2026-04-27

---

## Sistema Operativo

| Parámetro | Valor |
|-----------|-------|
| **Distribución** | SUSE Linux Enterprise Server 15 SP6 |
| **Kernel** | `6.4.0-150600.23.25-default` (x86_64) |
| **Arquitectura** | x86_64 |

---

## Hardware / Virtualización

| Parámetro | Valor |
|-----------|-------|
| **Plataforma** | VMware (open-vm-tools) |
| **CPU** | 1 vCPU |
| **RAM Total** | 15 GB |
| **RAM Usada** | 1.9 GB |
| **RAM Disponible** | ~13 GB (con buff/cache) |
| **Shared memory** | 378 MB |

> ⚠️ **Solo 1 vCPU** para servir múltiples aplicaciones web en demo y producción. Considerar escalar a 2-4 vCPUs.

---

## Almacenamiento

| Filesystem | Tamaño | Usado | Disponible | Uso% | Montaje |
|------------|--------|-------|------------|------|---------|
| `/dev/sda` | 146 GB | 113 GB | 27 GB | **81%** | `/` |

> ⚠️ **Disco al 81%** — Recomendado limpiar releases antiguas y rotar logs. Monitorizar y planificar antes de llegar al 90%.

---

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

---

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

---

## Software instalado

| Software | Versión | Estado |
|----------|---------|--------|
| Nginx | 1.21.5 | ⚠️ Obsoleto (dic 2021) |
| Apache | 2.4.58 | Instalado, no activo |
| PHP | 8.1.23 (cli + FPM) | ⚠️ EOL (31 dic 2025) |
| Node.js | 20.15.1 | ✅ |
| MariaDB | 10.11.9 | ✅ LTS hasta feb 2028 |
| Python | 3.6.15 | ⚠️ EOL |

---

## Seguridad de red

### Firewall (iptables)

> 🔴 **CRÍTICO — Firewall completamente abierto**
> No hay reglas de firewall. Las tres cadenas (INPUT, FORWARD, OUTPUT) están en política ACCEPT sin reglas.

```
Chain INPUT (policy ACCEPT) — sin reglas
Chain FORWARD (policy ACCEPT) — sin reglas
Chain OUTPUT (policy ACCEPT) — sin reglas
```

### Cron jobs

| Job | Descripción |
|-----|-------------|
| `azcmagent_autoupgrade` | Auto-update del agente Azure Arc |

---

## Estructura de aplicaciones en el servidor

```
/srv/www/htdocs/webapps/
├── demo/
│   ├── ordersapp/         ← MyOrders (portal pedidos)
│   ├── ordersbackoffice/  ← Admin panel (EasyAdmin)
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
