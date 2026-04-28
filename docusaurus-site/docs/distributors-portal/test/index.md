---
sidebar_label: "🧪 TEST"
title: "Distributors Portal — Entorno TEST"
---

# Entorno TEST — Distributors Portal

## Información del servidor

| | |
|---|---|
| **Hostname** | `DISTRIBUTORSPORTALTEST` |
| **IP** | `10.120.204.25` |
| **OS** | SUSE Linux Enterprise Server 15 SP6 |
| **CPU** | 1 vCPU Intel Xeon Gold 5220R @ 2.20GHz |
| **RAM** | 31 GB (1.8 usada) |
| **Disco** | 38 GB (53% usado) |
| **Uptime** | 535 días |
| **Última auditoría** | 27 abril 2026 |

## Panel de salud

| Servicio | Estado | Detalle |
|----------|--------|---------|
| 🟢 Apache (HTTP) | **Activo** | Puerto 80, SSL en reverse proxy externo |
| 🟢 PHP 7.4 | **Activo** | ⚠️ EOL desde nov. 2022 |
| 🟢 Drupal 9 | **Activo** | CMS principal |
| 🟢 MariaDB 10.11 | **Activo** | Solo acceso local (127.0.0.1) |
| 🟢 Postfix | **Activo** | Mail solo localhost |
| 🟡 SNMP | **Activo** | Monitoring en puerto 199 |

## Documentación

| | Sección | Contenido |
|---|---------|-----------|
| 🖥️ | [**Server Info**](server-info/server-overview) | OS, hardware, red, servicios activos |
| 🌐 | [**Web Stack — Full Report**](web-stack/full-report) | Apache config, PHP, Drupal 9, VHosts, estructura |
| 📋 | [**Web Stack — Logs**](web-stack/logs) | Mapa de logs, comandos de diagnóstico |
| 📊 | [**Análisis en Vivo**](web-stack/log-analysis) | Análisis de logs Apache y accesos |
| 🗄️ | [**Database**](database/) | MariaDB config, tablas Drupal, usuarios, backups |
| ⚙️ | [**DevOps**](devops/) | Deploy manual, DDEV, Git, Drush |
| 🛡️ | [**Cybersecurity**](cybersecurity/) | Auditoría de seguridad, firewall, hardening |
