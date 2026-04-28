<!--
## Sync Impact Report
- Version change: 0.0.0 → 1.0.0 (initial ratification)
- Added principles: I. Read-Only, II. Zero Credentials, III. Structured Documentation, IV. Multi-Project Multi-Environment, V. Auditability
- Added sections: Project Structure, Documentation Workflow
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ no changes needed (generic)
  - .specify/templates/spec-template.md ✅ no changes needed (generic)
  - .specify/templates/tasks-template.md ✅ no changes needed (generic)
- Follow-up TODOs: none
-->

# DevOps Documentation Hub Constitution

## Core Principles

### I. Read-Only Operations (NON-NEGOTIABLE)

NUNCA se DEBE modificar, crear o eliminar archivos, configuraciones,
servicios o datos en ningún servidor remoto. Toda interacción con
servidores DEBE ser exclusivamente de lectura y consulta.

- Los comandos SSH ejecutados DEBEN ser solo de lectura: `cat`, `ls`,
  `grep`, `systemctl status`, `df`, `free`, `ss`, `php -v`, etc.
- Está PROHIBIDO ejecutar: `rm`, `mv`, `cp`, `sed -i`, `systemctl start/stop/restart`,
  `apt/zypper install`, `chmod`, `chown`, o cualquier comando que altere el estado.
- Si un análisis requiere modificar algo para diagnosticar, se DEBE
  documentar como recomendación, nunca ejecutar directamente.

**Rationale:** Este repositorio es un observatorio pasivo. La seguridad
y estabilidad de los servidores en producción/test/demo es prioritaria.

### II. Zero Credentials in Repository (NON-NEGOTIABLE)

NUNCA se DEBEN almacenar contraseñas, tokens, claves API, certificados
privados, hashes de salt ni cualquier tipo de credencial en archivos
versionados.

- Las credenciales necesarias para acceder a servidores se DEBEN solicitar
  al usuario en tiempo de ejecución.
- Los archivos de documentación DEBEN usar placeholders donde aparecerían
  credenciales: `<PASSWORD>`, `<API_KEY>`, `<TOKEN>`.
- El `.gitignore` DEBE incluir patrones que bloqueen archivos de credenciales.
- Si accidentalmente se commitea una credencial, se DEBE rotar inmediatamente
  y limpiar el historial de git.

**Rationale:** El repositorio se publica en Git. Cualquier credencial
commiteada queda expuesta en el historial de forma permanente.

### III. Structured Documentation

Toda documentación DEBE seguir la estructura jerárquica definida del
proyecto y DEBE estar en formato Markdown.

- Cada informe DEBE incluir: fecha de análisis, servidor/IP, y versión
  de las herramientas documentadas.
- Las tablas DEBEN usarse para datos comparativos o de inventario.
- Los bloques de código DEBEN usarse para configuraciones y comandos.
- Cada archivo DEBE tener un propósito claro y único (single responsibility).
- Los nombres de archivo DEBEN ser descriptivos y en `kebab-case`.

**Rationale:** La consistencia en la documentación permite la navegación
rápida y la comparación entre entornos.

### IV. Multi-Project Multi-Environment Architecture

La estructura del repositorio DEBE soportar múltiples proyectos, cada
uno con múltiples entornos, de forma escalable.

- Estructura obligatoria: `projects/<proyecto>/<entorno>/<área>/`
- Áreas estándar por entorno: `server-info/`, `web-stack/`, `devops/`,
  `cybersecurity/`, `database/`
- Cada proyecto DEBE tener un `README.md` con tabla de entornos.
- Cada entorno DEBE tener un `README.md` con índice de documentación.
- Se PUEDEN añadir áreas adicionales según las necesidades del proyecto.

**Rationale:** Una estructura predecible permite automatizar la generación
y actualización de informes, y facilita el onboarding de nuevos miembros.

### V. Auditability and Traceability

Toda documentación DEBE ser trazable y auditable.

- Cada informe DEBE incluir la fecha exacta de recolección de datos.
- Los cambios significativos DEBEN reflejarse en commits descriptivos.
- Se DEBE mantener un historial de cambios detectable en cada entorno.
- Las observaciones y alertas (EOL, vulnerabilidades, misconfiguraciones)
  DEBEN documentarse explícitamente con nivel de severidad.

**Rationale:** La documentación de infraestructura pierde valor si no se
sabe cuándo fue generada o si los datos siguen siendo válidos.

## Project Structure

```
devops/                             # Raíz del repositorio
├── .specify/                       # Configuración Spec Kit
│   └── memory/
│       └── constitution.md         # Este archivo
├── .gitignore                      # Excluye credenciales y temporales
├── projects/                       # Carpeta raíz de todos los proyectos
│   ├── README.md                   # Índice general de proyectos
│   └── <nombre-proyecto>/          # Un directorio por proyecto
│       ├── README.md               # Descripción del proyecto + tabla de entornos
│       └── <entorno>/              # test | demo | prod | staging
│           ├── README.md           # Índice de documentación del entorno
│           ├── server-info/        # OS, hardware, red, servicios
│           ├── web-stack/          # Apache/Nginx, PHP, CMS, VHosts
│           ├── devops/             # CI/CD, deploy, scripts, monitorización
│           ├── cybersecurity/      # Auditorías, CVEs, hardening, compliance
│           └── database/           # Motor, config, esquemas, backups
```

Entornos válidos: `test`, `demo`, `prod`, `staging`, `dev`, `uat`.
Se PUEDEN definir entornos adicionales según necesidad.

## Documentation Workflow

### Proceso de auditoría de un servidor

1. **Solicitar credenciales** al usuario (nunca almacenar).
2. **Conectar por SSH** en modo solo lectura.
3. **Recopilar información** por área (server-info, web-stack, etc.).
4. **Generar documentación** en Markdown dentro de la estructura correcta.
5. **Revisar** que no haya credenciales en los archivos generados.
6. **Commit** con mensaje descriptivo.

### Convenciones de commits

```
docs(<proyecto>/<entorno>): <descripción>
```

Ejemplos:
- `docs(distributors-portal/test): initial server and web stack audit`
- `docs(distributors-portal/prod): update PHP version after upgrade`
- `chore: add new project skeleton for customer-portal`

## Governance

- Esta constitución es el documento rector del repositorio. Todas las
  contribuciones DEBEN cumplir con los principios aquí definidos.
- Las modificaciones a esta constitución requieren:
  1. Propuesta documentada con justificación.
  2. Incremento de versión según semver (MAJOR/MINOR/PATCH).
  3. Actualización de la fecha de última enmienda.
- Todo PR DEBE ser verificado contra los principios I (Read-Only) y
  II (Zero Credentials) antes de merge.
- Ante ambigüedad, la seguridad (principio II) tiene prioridad absoluta.

**Version**: 1.0.0 | **Ratified**: 2026-04-27 | **Last Amended**: 2026-04-27
