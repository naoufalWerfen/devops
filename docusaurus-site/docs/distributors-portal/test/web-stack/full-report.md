# Informe Detallado del Servidor - Distributors Portal Test

**Servidor:** 10.120.204.25  
**Hostname:** DISTRIBUTORSPORTALTEST  
**Fecha del informe:** 27 de abril de 2026  

---

## 1. Información General del Servidor

| Propiedad | Valor |
|-----------|-------|
| **Sistema Operativo** | SUSE Linux Enterprise Server 15 SP6 (SLES 15-SP6) |
| **Kernel** | Linux 6.4.0-150600.23.25-default x86_64 |
| **Hostname** | DISTRIBUTORSPORTALTEST |
| **IP** | 10.120.204.25 |
| **Uptime** | 535 días (al momento del análisis) |
| **Virtualización** | VMware (máquina virtual) |

### 1.1 Hardware (Virtual)

| Recurso | Detalle |
|---------|---------|
| **CPU** | Intel Xeon Gold 5220R @ 2.20GHz (1 vCPU) |
| **RAM Total** | 31 GiB |
| **RAM Usada** | 1.8 GiB |
| **RAM Disponible** | 29 GiB |
| **Swap** | 1.2 GiB (0B usado) |
| **Disco principal** | /dev/sda2 - 38 GB total, 19 GB usado (53%), 17 GB libre |
| **Partición EFI** | /dev/sda1 - 500 MB |

---

## 2. Servicios Web Activos

### 2.1 Resumen de Servicios

| Servicio | Estado | Versión |
|----------|--------|---------|
| **Apache (httpd)** | **ACTIVO** | Apache/2.4.58 (Linux/SUSE) |
| **Nginx** | **INACTIVO** (no instalado) | N/A |
| **PHP** | **ACTIVO** (mod_php) | PHP 7.4.30 (NTS) |
| **MariaDB** | **ACTIVO** | 10.11.9-MariaDB |
| **Postfix (correo)** | ACTIVO | (puerto 25, solo localhost) |
| **SNMP** | ACTIVO | (puerto 199, solo localhost) |
| **SSH** | ACTIVO | Puerto 22 |

### 2.2 Puertos en Escucha

| Puerto | Servicio | Bind Address |
|--------|----------|-------------|
| 22 | SSH (sshd) | 0.0.0.0 y [::] |
| 25 | Postfix (master) | 127.0.0.1 y [::1] |
| 80 | Apache (httpd) - **10 workers** | * (todas las interfaces) |
| 199 | SNMP (snmpd) | 127.0.0.1 |
| 3306 | MariaDB (mysqld) | 127.0.0.1 |
| 10001 | agentid-service | 10.120.204.25 y 127.0.0.1 |

> **Nota:** No hay HTTPS (443) configurado directamente en Apache. El SSL se termina en un **reverse proxy externo** (IP: 212.163.185.1) que conecta al servidor por HTTP en el puerto 80.

---

## 3. Configuración de Apache

### 3.1 Configuración General

- **Archivo principal:** `/etc/apache2/httpd.conf`
- **DocumentRoot por defecto:** `/srv/www/htdocs`
- **ErrorLog global:** `/var/log/apache2/error_log`
- **Listen:** Puerto 80
- **ServerTokens:** ProductOnly
- **ServerSignature:** off
- **TraceEnable:** off
- **LogLevel:** warn
- **MPM:** Por defecto del sistema (prefork, requerido por mod_php)

### 3.2 Módulos Apache Cargados

```
actions, alias, auth_basic, authn_core, authn_file, authz_host, 
authz_groupfile, authz_core, authz_user, autoindex, cgi, dir, env, 
expires, include, log_config, mime, negotiation, setenvif, ssl, 
socache_shmcb, userdir, reqtimeout, rewrite, php7.4, php7
```

### 3.3 Configuración de mod_php7

Archivo: `/etc/apache2/conf.d/mod_php7.conf`

```apache
<IfModule mod_php7.c>
    <FilesMatch "\.ph(p[3457]?|tml)$">
        SetHandler application/x-httpd-php
    </FilesMatch>
    <FilesMatch "\.php[3457]?s$">
        SetHandler application/x-httpd-php-source
    </FilesMatch>
    DirectoryIndex index.php7
    DirectoryIndex index.php
</IfModule>
```

> PHP se ejecuta como **módulo de Apache (mod_php7)**, NO como PHP-FPM.

### 3.4 Virtual Hosts Configurados

Se han encontrado **3 Virtual Hosts activos**:

---

#### VHost 1: `distributorstest-php74.werfen.com`

| Propiedad | Valor |
|-----------|-------|
| **Archivo config** | `/etc/apache2/vhosts.d/distributorstest-php74.werfen.com.conf` |
| **ServerName** | `distributorstest-php74.werfen.com` |
| **DocumentRoot** | `/srv/www/htdocs/distributors_portal/production/deploy/current/web` |
| **ErrorLog** | `/var/log/apache2/customerportal-error_log` |
| **Puerto** | 80 |

**Directivas del Directory:**
- RewriteEngine On (para pasar headers de Authorization)
- AllowOverride All
- FallbackResource /index.php
- SetEnvIf Authorization para pasar el header HTTP_AUTHORIZATION

> **Nota:** Este vhost apunta a un directorio de **producción** con estructura de deploy (`deploy/current/web`). Sin embargo, el directorio `/srv/www/htdocs/distributors_portal/` aparece **vacío** en el momento del análisis.

---

#### VHost 2: `distributorstest.werfen.com`

| Propiedad | Valor |
|-----------|-------|
| **Archivo config** | `/etc/apache2/vhosts.d/distributorstest.werfen.com.conf` |
| **ServerName** | `distributorstest.werfen.com` |
| **DocumentRoot** | `/srv/www/htdocs/distributors_portal_test/web` |
| **ErrorLog** | `/var/log/apache2/distributors_portal_test-error_log` |
| **Puerto** | 80 |

**Directivas del Directory:**
- RewriteEngine On (Authorization header passthrough)
- AllowOverride All
- FallbackResource /index.php
- SetEnvIf Authorization

> **Este es el VHost principal** que sirve el proyecto `distributors_portal_test`.

---

#### VHost 3: `ssh.distributors-portal-test.werfen.local`

| Propiedad | Valor |
|-----------|-------|
| **Archivo config** | `/etc/apache2/vhosts.d/ssh.distributors-portal-test.werfen.local.conf` |
| **ServerName** | `ssh.distributors-portal-test.werfen.local` |
| **DocumentRoot** | `/srv/www/htdocs/distributors_portal_test/web` |
| **ErrorLog** | `/var/log/apache2/distributors_portal_test-error_log` |
| **Puerto** | 80 |

> **Mismo DocumentRoot** que VHost 2. Es un alias para acceso interno (red local `.werfen.local`).

---

## 4. Configuración PHP

### 4.1 Versión y Motor

| Propiedad | Valor |
|-----------|-------|
| **Versión PHP** | 7.4.30 |
| **Build date** | Jun 10 2022 |
| **Thread Safety** | NTS (Non Thread Safe) |
| **Zend Engine** | v3.4.0 |
| **OPcache** | Zend OPcache v7.4.30 |

### 4.2 Archivos de Configuración

| Archivo | Ruta |
|---------|------|
| **php.ini (CLI)** | `/etc/php7/cli/php.ini` |
| **Directorio de módulos** | `/etc/php7/conf.d/` |

### 4.3 Módulos PHP Instalados (65 módulos)

```
bcmath, bz2, calendar, Core, ctype, curl, date, dba, dom, enchant, 
exif, fileinfo, filter, ftp, gd, gettext, gmp, hash, iconv, intl, 
json, ldap, libxml, mbstring, mysqli, mysqlnd, odbc, openssl, pcntl, 
pcre, PDO, pdo_mysql, PDO_ODBC, pdo_pgsql, pdo_sqlite, pgsql, Phar, 
posix, readline, Reflection, session, shmop, SimpleXML, snmp, soap, 
sockets, sodium, SPL, sqlite3, standard, sysvmsg, sysvsem, sysvshm, 
tidy, tokenizer, xml, xmlreader, xmlrpc, xmlwriter, xsl, 
Zend OPcache, zip, zlib
```

**Módulos clave para Drupal:** mysqli, pdo_mysql, gd, mbstring, json, xml, curl, openssl, intl, zip

---

## 5. Base de Datos - MariaDB

| Propiedad | Valor |
|-----------|-------|
| **Motor** | MariaDB 10.11.9 |
| **Puerto** | 3306 |
| **Bind Address** | 127.0.0.1 (solo local) |
| **Base de datos** | `distributors_portal_test` |
| **Usuario DB** | `distributors_portal_test` |
| **Driver Drupal** | mysql (Drupal\Core\Database\Driver\mysql) |

---

## 6. Proyecto: distributors_portal_test

### 6.1 Información General

| Propiedad | Valor |
|-----------|-------|
| **Ruta** | `/srv/www/htdocs/distributors_portal_test/` |
| **Tamaño en disco** | 267 MB |
| **CMS** | **Drupal 9.4.8** |
| **Template** | drupal/recommended-project |
| **Licencia** | GPL-2.0-or-later |
| **PHP mínimo soportado** | 7.4.0 |
| **PHP recomendado** | 8.0 |
| **Propietario archivos** | deploy:www |
| **Control de versiones** | Git (directorio .git presente) |
| **DDEV** | Configurado (directorio .ddev presente) |
| **Entorno** | **Test** (`'name' => 'test'`) |

### 6.2 Estructura del Proyecto

```
/srv/www/htdocs/distributors_portal_test/
├── .ddev/                  # Configuración DDEV (desarrollo local)
├── .editorconfig
├── .git/                   # Repositorio Git
├── .gitattributes
├── .gitignore
├── composer.json           # Dependencias Composer
├── composer.lock
├── config/                 # Configuración exportada de Drupal
├── vendor/                 # Dependencias de terceros (37 subdirectorios)
└── web/                    # DocumentRoot del sitio (webroot)
    ├── core/               # Core de Drupal 9.4.8
    ├── modules/
    │   ├── contrib/        # Módulos contribuidos
    │   └── custom/         # Módulos personalizados (Werfen)
    ├── themes/
    │   ├── contrib/
    │   └── custom/         # Temas personalizados
    ├── sites/
    │   └── default/
    │       ├── settings.php
    │       └── settings.local.php
    └── .htaccess
```

### 6.3 Dependencias Composer (composer.json)

#### Dependencias principales (require):

| Paquete | Versión | Descripción |
|---------|---------|-------------|
| `drupal/core-recommended` | ^9.1 | Core de Drupal 9 |
| `drupal/address` | ~1.0 | Gestión de direcciones |
| `drupal/admin_toolbar` | ^3.0 | Barra de administración mejorada |
| `drupal/bootstrap` | ^3.23 | Tema Bootstrap |
| `drupal/config_pages` | ^2.9 | Páginas de configuración |
| `drupal/devel` | ^4.1 | Herramientas de desarrollo |
| `drupal/hook_event_dispatcher` | ^2.5 | Dispatcher de eventos/hooks |
| `drupal/page_manager` | 4.0-beta6 | Gestión de páginas |
| `drupal/webform` | ^6.0 | Formularios web |
| `drush/drush` | ^10 | CLI para Drupal |
| `phpoffice/phpspreadsheet` | ^1.17 | Manejo de archivos Excel/Spreadsheet |

### 6.4 Módulos Contribuidos (contrib)

| Módulo | Función |
|--------|---------|
| `address` | Campos de dirección postal |
| `admin_toolbar` | Toolbar de admin mejorado |
| `config_pages` | Configuración por páginas |
| `ctools` | Herramientas para desarrolladores |
| `devel` | Depuración y desarrollo |
| `hook_event_dispatcher` | Sistema de eventos |
| `page_manager` | Gestión de páginas/variantes |
| `webform` | Formularios avanzados |

### 6.5 Módulos Personalizados (custom) - WERFEN

Estos son los módulos desarrollados específicamente para el portal de distribuidores:

| Módulo | Descripción probable | Última modificación |
|--------|---------------------|---------------------|
| **ebusiness** | Módulo principal de e-business/comercio | Oct 2024 |
| **wleb_backorder** | Gestión de pedidos pendientes (backorders) | Jun 2021 |
| **wleb_basket** | Carrito/cesta de compras | Jun 2021 |
| **wleb_core** | Módulo base/core del portal | Jun 2021 |
| **wleb_documentation** | Gestión de documentación | Oct 2024 |
| **wleb_draft** | Borradores de pedidos | Jun 2021 |
| **wleb_offer** | Gestión de ofertas comerciales | Oct 2024 |
| **wleb_order** | Gestión de pedidos | Jun 2021 |
| **wleb_rga** | Devoluciones (Return Goods Authorization) | Jun 2021 |
| **wleb_tracking** | Seguimiento de envíos/pedidos | Abr 2026 (recién modificado) |
| **wleb_user** | Gestión de usuarios del portal | Oct 2024 |
| **wleb_ws** | Web Services / integración SAP | Oct 2024 |

> **Nota:** El prefijo `wleb_` corresponde a "Werfen Lab E-Business".

### 6.6 Tema Personalizado

| Tema | Base | Descripción |
|------|------|-------------|
| **wleb_bootstrap** | Bootstrap 3 (Drupal) | Tema personalizado del portal basado en Bootstrap |

### 6.7 Configuración del Entorno (settings.local.php)

#### Base de Datos
- **Database:** `distributors_portal_test`
- **User:** `distributors_portal_test`
- **Host:** localhost:3306
- **Driver:** MySQL

#### Integración SAP (Web Services)
- **URL del WS SAP:** `erpqas.werfen.com/zsapui5_json` (entorno QAS de SAP)
- **Usuario WS:** ZWEBSERVICE
- **Protocolo:** HTTPS

> El proyecto se integra con SAP ERP mediante web services REST/JSON para funcionalidades de negocio (pedidos, ofertas, tracking, etc.).

#### Configuración de Proxy Inverso
- **Reverse Proxy:** Habilitado (`$settings['reverse_proxy'] = TRUE`)
- **IP del Proxy:** 212.163.185.1
- **URL Base:** `https://distributorstest.werfen.com`
- **HTTPS:** Habilitado vía proxy (el servidor recibe HTTP, el proxy maneja SSL)
- **Header Forwarded:** Configurado

#### Trusted Hosts
```
distributorstest.werfen.com
10.120.204.45
ssh.distributors-portal-test.werfen.local
```

#### Configuración de Organizaciones de Ventas (Werfen)

| Organización | ID |
|-------------|-----|
| China | 167 |
| Hong Kong | 191 |
| Korea | 165 |
| México | 180 |
| Brasil | 176 |
| Japón | 160 |

**Reglas de negocio configuradas:**
- **Sin control de cantidad en ofertas:** México, Japón, Brasil
- **Sin acceso a referencias:** Japón
- **Uso de oferta completa:** China

#### Caché
- **Render cache:** Deshabilitada (`cache.backend.null`)
- **Dynamic page cache:** Deshabilitada (`cache.backend.null`)

> Las cachés están deshabilitadas, lo cual es correcto para un **entorno de test**.

#### Debug
- `wleb_debug = TRUE`

---

## 7. Segundo Proyecto: distributors_portal (Producción)

| Propiedad | Valor |
|-----------|-------|
| **Ruta** | `/srv/www/htdocs/distributors_portal/` |
| **VHost** | `distributorstest-php74.werfen.com` |
| **DocumentRoot** | `/srv/www/htdocs/distributors_portal/production/deploy/current/web` |
| **Estado** | Directorio **vacío** (sin contenido desplegado actualmente) |

> Este vhost parece corresponder a una configuración de despliegue (posiblemente con Capistrano o similar por la estructura `deploy/current/web`) pero **no tiene contenido desplegado**.

---

## 8. Diagrama de Arquitectura

```
                    Internet
                       │
                       ▼
            ┌─────────────────────┐
            │   Reverse Proxy     │
            │   212.163.185.1     │
            │   (SSL Termination) │
            │   HTTPS → HTTP      │
            └─────────┬───────────┘
                      │ HTTP :80
                      ▼
            ┌─────────────────────┐
            │  Apache 2.4.58      │
            │  10.120.204.25:80   │
            │  mod_php7 (PHP 7.4) │
            ├─────────────────────┤
            │  VHosts:            │
            │  ├ distributorstest │
            │  │ .werfen.com      │──► /srv/www/htdocs/distributors_portal_test/web
            │  ├ ssh.distributors │
            │  │ -portal-test     │──► /srv/www/htdocs/distributors_portal_test/web
            │  │ .werfen.local    │    (mismo proyecto, acceso interno)
            │  └ distributorstest │
            │    -php74.werfen.com│──► /srv/www/htdocs/distributors_portal/ (vacío)
            └─────────┬───────────┘
                      │
                      ▼
            ┌─────────────────────┐
            │  MariaDB 10.11.9    │
            │  localhost:3306     │
            │  DB: distributors_  │
            │  portal_test        │
            └─────────────────────┘
                      
            ┌─────────────────────┐
            │  SAP ERP (externo)  │
            │  erpqas.werfen.com  │
            │  /zsapui5_json      │
            │  (Web Services)     │
            └─────────────────────┘
```

---

## 9. Resumen Tecnológico

| Capa | Tecnología |
|------|-----------|
| **SO** | SUSE Linux Enterprise Server 15 SP6 |
| **Servidor Web** | Apache 2.4.58 (mod_php) |
| **Lenguaje** | PHP 7.4.30 |
| **CMS** | Drupal 9.4.8 |
| **Base de Datos** | MariaDB 10.11.9 |
| **Tema** | Bootstrap 3 (tema personalizado wleb_bootstrap) |
| **Gestión de dependencias** | Composer |
| **CLI Drupal** | Drush 10 |
| **Integración externa** | SAP ERP vía Web Services REST/JSON |
| **SSL** | Terminado en reverse proxy externo |
| **Entorno** | Test |
| **Desarrollo local** | DDEV configurado |
| **Control de versiones** | Git |

---

## 10. Observaciones y Notas

1. **Drupal 9.4.8 está en End of Life** - Drupal 9 llegó a su fin de vida en noviembre de 2023. Se recomienda migrar a Drupal 10 o superior.

2. **PHP 7.4 está en End of Life** - PHP 7.4 dejó de recibir soporte de seguridad en noviembre de 2022. Se recomienda actualizar a PHP 8.1+.

3. **Nginx instalado pero inactivo** - El paquete nginx parece estar presente pero el servicio está inactivo y el binario no está en el PATH.

4. **Cachés deshabilitadas** - Correcto para un entorno de test, pero no para producción.

5. **Debug activado** - `wleb_debug = TRUE` está activado, apropiado para test.

6. **Sin HTTPS directo** - Apache solo escucha en el puerto 80. Todo el tráfico HTTPS se gestiona a través del reverse proxy.

7. **Proyecto distributors_portal vacío** - El vhost `distributorstest-php74.werfen.com` apunta a un directorio que no tiene contenido desplegado.

8. **El servidor lleva 535 días encendido** - No se ha reiniciado en casi 1.5 años.

9. **Recursos infrautilizados** - El servidor tiene 31 GB de RAM pero solo usa 1.8 GB. El CPU es un solo vCPU.

10. **Integración SAP** - El proyecto se conecta al entorno QAS (Quality Assurance) de SAP, coherente con ser un entorno de test.
