# MyOrders

Plataforma de pedidos online de Werfen para distribuidores internacionales. Monorepo Symfony con 8 sub-aplicaciones.

## Entornos

| Entorno | Servidor | Estado |
|---------|----------|--------|
| [demo](demo/README.md) | 10.120.204.93 | Documentado |

## Tecnología Principal

- **Framework:** Symfony 6.1 (monorepo)
- **Lenguaje:** PHP 8.1
- **Servidor Web:** Nginx 1.21.5
- **Base de Datos:** MariaDB 10.11.9
- **Integración:** SAP ERP (BAPIs), LDAP, Sentry, Elasticsearch

## Sub-aplicaciones

| App | Dominio (prod) | Descripción |
|-----|----------------|-------------|
| orders-app | newmyorders.werfen.com | Portal de pedidos principal |
| ordersbackoffice | newmyordersadmin.werfen.com | Panel de administración (EasyAdmin) |
| orderstracking | track-and-trace.werfen.com | Tracking de envíos |
| rga | myclaims.werfen.com | Devoluciones y reclamaciones |
| vendorsportal | vendorsportal.werfen.com | Portal de proveedores |
| caseportal | caseportal.werfen.com | Portal de casos |
| monthlyreport | — | Informes mensuales |
| middlewareadp | — | Middleware ADP |

## Documentación

- [Server Overview](demo/server-info/)
- [Web Stack](demo/web-stack/)
- [DevOps & Deploy](demo/devops/)
- [Seguridad](demo/cybersecurity/)
