# Web Stack — MyOrders DEMO

**Servidor:** WEBAPPSPROD (10.120.204.93)  
**Fecha de auditoría:** 2026-04-27

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [full-report.md](full-report.md) | Arquitectura completa: Nginx, PHP-FPM, Symfony, MariaDB, integraciones |
| [logs.md](logs.md) | Mapa de logs: ubicaciones, rotación, monolog, comandos |
| [log-analysis.md](log-analysis.md) | Análisis en vivo: 8 hallazgos (23-27 abril 2026) |
| [security-audit.md](security-audit.md) | Auditoría de seguridad basada en logs: 14 hallazgos |

## Stack

| Capa | Tecnología | Versión | Estado |
|------|-----------|---------|--------|
| Reverse Proxy | Nginx | 1.21.5 | ⚠️ Obsoleto |
| PHP | PHP-FPM | 8.1.23 | ⚠️ EOL |
| Framework | Symfony | 6.1 | ⚠️ EOL |
| Base de datos | MariaDB | 10.11.9 | ✅ LTS |
| Deploy | Ansistrano | — | ✅ |
