# DevOps — Distributors Portal (TEST)

> **Servidor**: 10.120.204.25 (DISTRIBUTORSPORTALTEST)  
> **Última revisión**: 2026-04-27

---

## Arquitectura de despliegue

```
Internet → Proxy Reverso (212.163.185.1, SSL/443)
              │
              └─→ Apache (10.120.204.25:80)
                    │
                    └─→ Drupal 9.4.8 + PHP 7.4 (mod_php)
                          │
                          └─→ MariaDB 10.11.9 (localhost:3306)
```

---

## Usuario de deploy

| Propiedad | Valor |
|-----------|-------|
| **Usuario** | `deploy` |
| **UID** | 1000 |
| **Grupo** | users (100) |
| **Home** | `/home/deploy/` |
| **SSH** | Tiene directorio `.ssh` configurado |
| **Git** | `.gitconfig` presente |
| **Drush** | `.drush/` configurado |

### Comando de verificación

```bash
id deploy
ls -la /home/deploy/
```

---

## Estructura del proyecto en servidor

```
/srv/www/htdocs/
├── distributors_portal_test/     ← PROYECTO PRINCIPAL (267 MB)
│   ├── web/                      ← DocumentRoot Apache
│   ├── vendor/                   ← Dependencias Composer
│   ├── config/                   ← Configuración exportada
│   ├── .ddev/                    ← Config DDEV (dev local)
│   └── .git/                    ← Repositorio (sin remote)
│
└── distributors_portal/
    └── production/deploy/current/web/  ← Vhost legacy (VACÍO)
```

**Propietario**: `deploy:www`

---

## DDEV (entorno de desarrollo)

Configurado pero **NO activo** en el servidor (DDEV es para desarrollo local).

| Parámetro | Valor |
|-----------|-------|
| **Nombre** | werfen-project-ebusiness-d9 |
| **Tipo** | drupal9 |
| **Docroot** | web |
| **PHP** | 7.4 |
| **Webserver** | nginx-fpm (en DDEV) |
| **MariaDB** | 10.3 (en DDEV) |
| **DDEV version** | v1.16.7 |

### Comando de consulta

```bash
cat /srv/www/htdocs/distributors_portal_test/.ddev/config.yaml
```

---

## Jenkins

- **Directorio**: `/home/deploy/jenkins/workspace/`
- **Estado**: Directorio presente pero no se detecta Jenkins activo en el servidor
- **Posiblemente**: Conectado a un Jenkins externo como agente

### Comando de verificación

```bash
ls -la /home/deploy/jenkins/
systemctl status jenkins 2>/dev/null
```

---

## Scripts operativos

| Script | Ubicación | Función |
|--------|-----------|---------|
| `tail_watchdog.sh` | `/home/scripts/` | Monitoreo en tiempo real de la tabla watchdog (Drupal logs) |

### Ejecutar el monitor de watchdog

```bash
bash /home/scripts/tail_watchdog.sh
# Ctrl+C para salir (ejecuta queries cada 5s)
```

---

## Git

| Propiedad | Valor |
|-----------|-------|
| **Repositorio** | Sí (`.git/` presente) |
| **Remote** | Ninguno configurado |
| **Branch** | No determinado |

### Comandos

```bash
cd /srv/www/htdocs/distributors_portal_test
git log --oneline -10
git status
git remote -v
```

---

## Proceso de deploy actual

> **⚠ No se ha detectado un pipeline CI/CD automatizado activo.**

**Indicios del proceso actual**:
1. Usuario `deploy` accede por SSH
2. Operaciones manuales o semi-manuales sobre el proyecto
3. Jenkins workspace presente pero sin pipeline claro
4. Sin remote Git configurado — no hay pull automático
5. Sin crontab definido — no hay tareas programadas

### Comandos de diagnóstico

```bash
# Ver quién ha accedido recientemente
last deploy | head -10

# Ver historial de comandos del usuario deploy
cat /home/deploy/.bash_history | tail -30

# Ver cambios recientes en el proyecto
find /srv/www/htdocs/distributors_portal_test -mtime -7 -type f | head -20
```

---

## Backups

| Tipo | Ubicación | Último backup |
|------|-----------|---------------|
| DB dump | `/home/deploy/db-backups/` | enero 2022 |
| DB dump inicial | `/home/deploy/` | junio 2021 |

> **⚠ Sin backup automático detectado.** Ver [database/README.md](../database/README.md) para más detalle.

---

## Drupal CLI (Drush)

```bash
cd /srv/www/htdocs/distributors_portal_test

# Cache rebuild
vendor/bin/drush cr

# Estado general
vendor/bin/drush status

# Ejecutar cron
vendor/bin/drush cron

# Ver módulos habilitados
vendor/bin/drush pm:list --status=enabled

# Exportar configuración
vendor/bin/drush config:export

# Importar configuración
vendor/bin/drush config:import
```
