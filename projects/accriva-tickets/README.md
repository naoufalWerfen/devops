# Accriva Tickets

Portal de gestión de tickets de reparación y RGA (Return Goods Authorization) para distribuidores Accriva de Werfen.

## Entornos

| Entorno | Servidor | Estado |
|---------|----------|--------|
| [test](test/README.md) | 10.120.204.45 | Documentado |

## Tecnología Principal

- **Frontend:** React 16 (SPA)
- **Backend:** Node.js + Express (API middleware)
- **Integración:** SAP ERP (Web Services SOAP/REST)
- **Reverse Proxy:** Nginx 1.14
- **Web Server secundario:** Apache 2.4 (legacy)
- **Base de Datos:** Sin DB local — datos en SAP

## Repositorio

- **GitHub:** `Werfen-D-A/accriva-tickets`
- **Monorepo:** Frontend (`client/`) + Backend (`services/api/`) en el mismo repo
