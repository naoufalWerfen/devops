# DevOps Documentation

Documentación centralizada de servidores, proyectos y entornos auditados por el equipo DevOps.

---

## :material-folder-multiple: Proyectos

<div class="grid cards" markdown>

- :material-shopping: **[Distributors Portal](projects/distributors-portal/README.md)**

    Portal e-business B2B para distribuidores Werfen.  
    **Tecnología**: Drupal 9 + PHP 7.4 + MariaDB 10.11  
    **Entornos**: TEST

- :material-ticket-outline: **[Accriva Tickets](projects/accriva-tickets/README.md)**

    Gestión de tickets de reparación y RGA para distribuidores Accriva.  
    **Tecnología**: React 16 + Node.js Express + SAP  
    **Entornos**: TEST

</div>

---

## :material-bullseye-arrow: Principios fundamentales

Este repositorio se rige por la [Constitución del proyecto](constitution.md):

1. :lock: **Operaciones de solo lectura** — nunca se modifica nada en los servidores
2. :key: **Cero credenciales** en el repositorio
3. :books: **Documentación estructurada** por proyecto y entorno
4. :file_folder: **Multi-proyecto / multi-entorno** — estructura escalable
5. :mag: **Auditabilidad y trazabilidad** — todo cambio queda registrado

---

## :material-magnify: Cómo navegar

- Usa el **menú lateral** para explorar por proyecto y entorno
- Usa la **búsqueda** (atajo `S` o `/`) para encontrar términos rápidamente
- Cada entorno contiene áreas: `server-info`, `web-stack`, `database`, `devops`, `cybersecurity`

---

## :material-toolbox: Áreas documentadas

| Área | Qué contiene |
|------|--------------|
| **server-info** | OS, hardware, red, servicios |
| **web-stack** | Apache, PHP, CMS, vhosts + mapa de logs |
| **database** | Motor, tablas, usuarios, backups |
| **devops** | Deploy, CI/CD, scripts, herramientas |
| **cybersecurity** | Riesgos, hardening, recomendaciones |
