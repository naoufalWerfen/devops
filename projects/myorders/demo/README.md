# MyOrders DEMO — WEBAPPSPROD

**Servidor**: 10.120.204.93  
**OS**: SLES 15 SP6  
**Entorno**: Demo (comparte servidor con Producción)

## Documentación disponible

| Área | Doc | Descripción |
|------|-----|-------------|
| 🖥️ Infraestructura | [server-info/](server-info/) | Hardware, red, servicios, puertos |
| 🌐 Web Stack | [web-stack/](web-stack/) | Nginx, PHP-FPM, Symfony, MariaDB |
| 🔧 DevOps | [devops/](devops/) | Ansistrano, CI/CD, testing |
| 🛡️ Seguridad | [cybersecurity/](cybersecurity/) | Hallazgos y auditoría |

## Alertas activas

- 🔴 Firewall abierto (iptables sin reglas)
- 🔴 Demo y Producción en el mismo servidor
- 🔴 PHP 8.1 EOL, Symfony 6.1 EOL, Nginx 1.21.5 obsoleto
- 🔴 Fuga de datos SAP en logs
- 🟡 Disco al 81%, PHP-FPM saturado (max_children=10)
