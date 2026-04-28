---
sidebar_label: "🧪 TEST"
title: "Accriva Tickets — Entorno TEST"
---

# Entorno TEST — Accriva Tickets

## Información del servidor

| | |
|---|---|
| **Hostname** | `ACCRIVATICKETSTEST` |
| **IP** | `10.120.204.45` |
| **OS** | SUSE Linux Enterprise Server 15 SP1 |
| **CPU** | 1 vCPU Intel Xeon Gold 5220R @ 2.20GHz |
| **RAM** | 7.5 GB |
| **Uptime** | 739 días |
| **Última auditoría** | 27 abril 2026 |

## Panel de salud

| Servicio | Estado | Detalle |
|----------|--------|---------|
| 🟢 Nginx (reverse proxy) | **Activo** | Sirve frontend y proxea `/api/*` a :4000 |
| 🔴 Node.js API (:4000) | **Caído** | Crash loop cada 10s — `/usr/local/bin/node` no existe |
| 🟡 PM2 | **Inactivo** | Daemon arrancado Nov 2024, sin procesos |
| 🟡 Apache (:8080) | **Legacy** | Activo pero sin uso real |
| 🔴 SSL | **Expirado** | Certificado expirado desde 2020 |
| 🟡 Swap | **90%** | Solo 165 MB libres de 2 GB |

## Documentación

| | Sección | Contenido |
|---|---------|-----------|
| 🖥️ | [**Server Info**](server-info/server-overview) | OS, hardware, red, 32 servicios activos, diagrama de red |
| 🌐 | [**Web Stack — Full Report**](web-stack/full-report) | Nginx config, Node.js Express API, React SPA, Apache, SSO flow |
| 📋 | [**Web Stack — Logs**](web-stack/logs) | Mapa de logs, comandos de diagnóstico, últimas actividades |
| 📊 | [**Análisis en Vivo**](web-stack/log-analysis) | Logs de los últimos 20 min (27/04/2026): crash loop, sesión SSO |
| ⚙️ | [**DevOps**](devops/) | GitHub repo, deploy manual, Docker dev, systemd, backups |
| 🛡️ | [**Cybersecurity**](cybersecurity/) | 13 hallazgos, plan de remediación priorizado |
