---
sidebar_label: "🧪 DEMO"
title: "MyOrders — Entorno DEMO"
---

# Entorno DEMO — MyOrders

## Información del servidor

| | |
|---|---|
| **Hostname** | `WEBAPPSPROD` |
| **IP** | `10.120.204.93` |
| **OS** | SUSE Linux Enterprise Server 15 SP6 |
| **Kernel** | 6.4.0-150600.23.25-default |
| **CPU** | 1 vCPU |
| **RAM** | 15 GB (1.9 GB usada, 13 GB disponible) |
| **Disco** | 146 GB (81% usado — ⚠️ alto) |
| **Deploy user** | `deploy:nginx` |
| **Última auditoría** | 27 abril 2026 |

## Panel de salud

| Servicio | Estado | Detalle |
|----------|--------|---------|
| 🟢 Nginx 1.21.5 | **Activo** | Puertos 80, 8000, 8001, 8002 |
| 🟢 PHP-FPM 8.1 | **Activo** | Puerto 9000 — 4 workers |
| 🟢 MariaDB 10.11.9 | **Activo** | Puerto 3306 (localhost only) |
| 🟡 Apache 2.4.58 | **Inactivo** | Instalado pero sin usar desde 2022 |
| 🟢 SSH | **Activo** | Puerto 22 |
| 🔴 Firewall | **Abierto** | Sin reglas configuradas (iptables vacío) |

## App: MyOrders (orders-app)

| | |
|---|---|
| **Path** | `/srv/www/htdocs/webapps/demo/ordersapp/current/` |
| **Release** | `20260309145344Z` (9 marzo 2026) |
| **Dominio** | `dist-orders-demo.werfen.com` |
| **Doc root** | `apps/orders/orders-app/public/` |
| **Base de datos** | `orders_demo` |

## Documentación

| Sección | Enlace | Contenido | Estado |
|---------|--------|-----------|--------|
| 🖥️ Servidor | [Servidor & Red](server-info/server-overview) | OS, CPU, RAM, disco, red, servicios | ✅ Completo |
| 🌐 Web Stack | [Nginx · PHP · Symfony](web-stack/full-report) | Stack completo, vhosts, config | ✅ Completo |
| 🔧 DevOps | [DevOps & Deploy](devops/) | CI/CD, Ansistrano, Jenkins, estructura | ✅ Completo |
| 🛡️ Seguridad | [Seguridad](cybersecurity/) | Firewall, SSL, hallazgos, escaneos | ✅ Completo |
