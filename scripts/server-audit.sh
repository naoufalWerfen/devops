#!/bin/bash
# ==============================================================================
# server-audit.sh — Auditoría completa de servidor (SOLO LECTURA)
# ==============================================================================
#
# USO:
#   bash server-audit.sh                          → stdout
#   bash server-audit.sh -o WEBAPPSPROD.json      → fichero
#   bash server-audit.sh -n WEBAPPSPROD -e demo   → con nombre y entorno
#
# OPCIONES:
#   -o FILE    Guardar en fichero
#   -n NAME    Nombre del servidor (si no, usa hostname)
#   -e ENV     Entorno: test, demo, prod, staging (default: test)
#
# SEGURIDAD:
#   - NO instala nada
#   - NO modifica nada en el sistema
#   - NO escribe nada excepto el fichero de salida (-o)
#   - NO necesita root (con root detecta más info)
#
# COMPATIBILIDAD: SLES 15+, Ubuntu, Debian, RHEL, CentOS, Alpine
# REQUISITOS:     bash + python3
# ==============================================================================

set -uo pipefail

# --- Args ---
OUTPUT=""
SERVER_NAME=""
ENVIRONMENT="test"

while getopts "o:n:e:" opt; do
  case $opt in
    o) OUTPUT="$OPTARG" ;;
    n) SERVER_NAME="$OPTARG" ;;
    e) ENVIRONMENT="$OPTARG" ;;
    *) echo "Uso: $0 [-o output.json] [-n SERVER_NAME] [-e ENV]" >&2; exit 1 ;;
  esac
done

# Verificar python3
if ! command -v python3 &>/dev/null; then
  echo "ERROR: python3 es necesario para generar JSON valido." >&2
  exit 1
fi

# --- Helpers ---
cmd_exists() { command -v "$1" &>/dev/null; }

extract_version() {
  grep -oP '\d+\.\d+[\.\d]*' | head -1
}

# ==============================================================================
# RECOLECCION: SISTEMA
# ==============================================================================

SCAN_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
HOSTNAME_RAW=$(hostname 2>/dev/null || echo "unknown")
[[ -z "$SERVER_NAME" ]] && SERVER_NAME="$HOSTNAME_RAW"
FQDN=$(hostname -f 2>/dev/null || echo "$HOSTNAME_RAW")

# IP principal
IP_PRIMARY=""
if cmd_exists hostname; then
  IP_PRIMARY=$(hostname -I 2>/dev/null | awk '{print $1}')
fi
if [[ -z "$IP_PRIMARY" ]] && cmd_exists ip; then
  IP_PRIMARY=$(ip -4 route get 1.1.1.1 2>/dev/null | grep -oP 'src \K[\d.]+' || echo "")
fi
[[ -z "$IP_PRIMARY" ]] && IP_PRIMARY="127.0.0.1"

# Todas las IPs
ALL_IPS=$(hostname -I 2>/dev/null | tr ' ' '\n' | grep -v '^$' || echo "$IP_PRIMARY")

# OS
OS_NAME="" ; OS_VERSION="" ; OS_PRETTY="" ; OS_ID=""
if [[ -f /etc/os-release ]]; then
  OS_NAME=$(. /etc/os-release && echo "${NAME:-}")
  OS_VERSION=$(. /etc/os-release && echo "${VERSION:-}")
  OS_PRETTY=$(. /etc/os-release && echo "${PRETTY_NAME:-}")
  OS_ID=$(. /etc/os-release && echo "${ID:-}")
fi
KERNEL=$(uname -r 2>/dev/null || echo "")
ARCH=$(uname -m 2>/dev/null || echo "")

# CPU
CPU_MODEL=$(grep -m1 'model name' /proc/cpuinfo 2>/dev/null | cut -d: -f2 | sed 's/^ *//' || echo "")
CPU_CORES=$(nproc 2>/dev/null || grep -c '^processor' /proc/cpuinfo 2>/dev/null || echo "1")

# RAM
RAM_TOTAL_KB=$(awk '/^MemTotal:/{print $2}' /proc/meminfo 2>/dev/null || echo "0")
RAM_AVAIL_KB=$(awk '/^MemAvailable:/{print $2}' /proc/meminfo 2>/dev/null || echo "0")
SWAP_TOTAL_KB=$(awk '/^SwapTotal:/{print $2}' /proc/meminfo 2>/dev/null || echo "0")
SWAP_FREE_KB=$(awk '/^SwapFree:/{print $2}' /proc/meminfo 2>/dev/null || echo "0")

# Disco principal (/)
DISK_ROOT=$(df -BG / 2>/dev/null | tail -1 || echo "")
DISK_TOTAL_GB=$(echo "$DISK_ROOT" | awk '{gsub(/G/,"",$2); print $2+0}')
DISK_USED_GB=$(echo "$DISK_ROOT" | awk '{gsub(/G/,"",$3); print $3+0}')
DISK_USAGE_PCT=$(echo "$DISK_ROOT" | awk '{gsub(/%/,"",$5); print $5+0}')

# Uptime
UPTIME_SECS=$(awk '{print int($1)}' /proc/uptime 2>/dev/null || echo "0")
UPTIME_DAYS=$((UPTIME_SECS / 86400))

# ==============================================================================
# RECOLECCION: STACK TECNOLOGICO
# ==============================================================================

# Cada linea: product|label|version|category|path
STACK_ITEMS=()

add_stack() {
  local product="$1" label="$2" version="$3" category="$4" path="${5:-}"
  [[ -z "$version" ]] && return
  STACK_ITEMS+=("${product}|${label}|${version}|${category}|${path}")
}

# --- OS como componente del stack ---
if [[ "$OS_ID" == "sles" ]]; then
  sles_ver=$(echo "$OS_VERSION" | grep -oP '\d+' | head -2 | paste -sd'.')
  [[ -n "$sles_ver" ]] && add_stack "sles" "SLES" "$sles_ver" "os" "/etc/os-release"
elif [[ -n "$OS_ID" ]]; then
  os_ver=$(echo "$OS_VERSION" | extract_version || echo "")
  [[ -n "$os_ver" ]] && add_stack "$OS_ID" "$OS_NAME" "$os_ver" "os" "/etc/os-release"
fi

# --- Lenguajes ---
cmd_exists php     && add_stack "php" "PHP" "$(php -v 2>/dev/null | extract_version)" "language" "$(which php)"
cmd_exists python3 && add_stack "python" "Python" "$(python3 --version 2>/dev/null | extract_version)" "language" "$(which python3)"
cmd_exists node    && add_stack "nodejs" "Node.js" "$(node --version 2>/dev/null | extract_version)" "runtime" "$(which node)"
cmd_exists ruby    && add_stack "ruby" "Ruby" "$(ruby --version 2>/dev/null | extract_version)" "language" "$(which ruby)"
cmd_exists java    && add_stack "java" "Java" "$(java -version 2>&1 | extract_version)" "language" "$(which java)"
cmd_exists go      && add_stack "go" "Go" "$(go version 2>/dev/null | extract_version)" "language" "$(which go)"
cmd_exists perl    && add_stack "perl" "Perl" "$(perl -v 2>/dev/null | grep -oP 'v\K[\d.]+' | head -1)" "language" "$(which perl)"

# --- Servidores web ---
cmd_exists nginx      && add_stack "nginx" "Nginx" "$(nginx -v 2>&1 | extract_version)" "server" "$(which nginx)"
cmd_exists apache2    && add_stack "apache" "Apache HTTP Server" "$(apache2 -v 2>/dev/null | extract_version)" "server" "$(which apache2)"
cmd_exists httpd      && add_stack "apache" "Apache HTTP Server" "$(httpd -v 2>/dev/null | extract_version)" "server" "$(which httpd)"
cmd_exists apache2ctl && ! cmd_exists apache2 && add_stack "apache" "Apache HTTP Server" "$(apache2ctl -v 2>/dev/null | extract_version)" "server" "$(which apache2ctl)"

# --- Bases de datos ---
if cmd_exists mysql || cmd_exists mariadb; then
  db_ver=$(mysql --version 2>/dev/null || mariadb --version 2>/dev/null || echo "")
  db_v=$(echo "$db_ver" | extract_version)
  if echo "$db_ver" | grep -qi mariadb; then
    add_stack "mariadb" "MariaDB" "$db_v" "database" "$(which mysql 2>/dev/null || which mariadb)"
  elif [[ -n "$db_v" ]]; then
    add_stack "mysql" "MySQL" "$db_v" "database" "$(which mysql)"
  fi
fi
cmd_exists psql         && add_stack "postgresql" "PostgreSQL" "$(psql --version 2>/dev/null | extract_version)" "database" "$(which psql)"
cmd_exists mongod       && add_stack "mongodb" "MongoDB" "$(mongod --version 2>/dev/null | extract_version)" "database" "$(which mongod)"
cmd_exists redis-server && add_stack "redis" "Redis" "$(redis-server --version 2>/dev/null | extract_version)" "database" "$(which redis-server)"
cmd_exists sqlite3      && add_stack "sqlite" "SQLite" "$(sqlite3 --version 2>/dev/null | extract_version)" "database" "$(which sqlite3)"

# --- Frameworks (busqueda en disco, solo lectura) ---
# Buscar en rutas tipicas de servidores web
SEARCH_PATHS="/var/www /srv /opt /home"
COMPOSER_LOCKS=$(find $SEARCH_PATHS -maxdepth 5 -name "composer.lock" -not -path "*/vendor/*" -type f 2>/dev/null | head -10)
PACKAGE_JSONS=$(find $SEARCH_PATHS -maxdepth 5 -name "package.json" -not -path "*/node_modules/*" -not -path "*/vendor/*" -type f 2>/dev/null | head -10)

# Funcion helper: buscar paquete en composer.lock
composer_pkg_version() {
  local lockfile="$1" pkg="$2"
  grep -A2 "\"${pkg}\"" "$lockfile" 2>/dev/null | grep '"version"' | extract_version
}

# Funcion helper: buscar paquete en package.json
npm_pkg_version() {
  local pkgfile="$1" pkg="$2"
  grep "\"${pkg}\"" "$pkgfile" 2>/dev/null | head -1 | extract_version
}

# Symfony — via bin/console, composer.lock o composer.json
sf_found=false
for cl in $COMPOSER_LOCKS; do
  dir=$(dirname "$cl")
  sf_v=""
  # Intentar bin/console primero (version exacta en runtime)
  if [[ -f "${dir}/bin/console" ]]; then
    sf_v=$(php "${dir}/bin/console" --version 2>/dev/null | extract_version)
  fi
  # Fallback a composer.lock
  if [[ -z "$sf_v" ]]; then
    sf_v=$(composer_pkg_version "$cl" "symfony/framework-bundle")
  fi
  if [[ -n "$sf_v" ]]; then
    add_stack "symfony" "Symfony" "$sf_v" "framework" "$cl"
    sf_found=true
  fi
done

# Laravel
for cl in $COMPOSER_LOCKS; do
  lv=$(composer_pkg_version "$cl" "laravel/framework")
  [[ -n "$lv" ]] && add_stack "laravel" "Laravel" "$lv" "framework" "$cl"
done

# Drupal — via drush o composer.lock
dv=""
cmd_exists drush && dv=$(drush status --field=drupal-version 2>/dev/null || echo "")
if [[ -z "$dv" ]]; then
  for cl in $COMPOSER_LOCKS; do
    dv=$(composer_pkg_version "$cl" "drupal/core")
    [[ -n "$dv" ]] && break
  done
fi
[[ -n "$dv" ]] && add_stack "drupal" "Drupal" "$dv" "framework" "$(which drush 2>/dev/null || echo composer.lock)"

# WordPress — via wp-includes/version.php
for wpv in $(find $SEARCH_PATHS -maxdepth 5 -path "*/wp-includes/version.php" -type f 2>/dev/null | head -5); do
  wp_ver=$(grep "\$wp_version\s*=" "$wpv" 2>/dev/null | extract_version)
  [[ -n "$wp_ver" ]] && add_stack "wordpress" "WordPress" "$wp_ver" "framework" "$wpv"
done

# Magento — via composer.lock
for cl in $COMPOSER_LOCKS; do
  mg=$(composer_pkg_version "$cl" "magento/product-community-edition")
  [[ -z "$mg" ]] && mg=$(composer_pkg_version "$cl" "magento/product-enterprise-edition")
  [[ -n "$mg" ]] && add_stack "magento" "Magento" "$mg" "framework" "$cl"
done

# Twig (motor de plantillas Symfony)
for cl in $COMPOSER_LOCKS; do
  tw=$(composer_pkg_version "$cl" "twig/twig")
  [[ -n "$tw" ]] && add_stack "twig" "Twig" "$tw" "framework" "$cl"
done

# Doctrine ORM
for cl in $COMPOSER_LOCKS; do
  dc=$(composer_pkg_version "$cl" "doctrine/orm")
  [[ -n "$dc" ]] && add_stack "doctrine" "Doctrine ORM" "$dc" "framework" "$cl"
done

# React
for pj in $PACKAGE_JSONS; do
  rv=$(npm_pkg_version "$pj" '"react"')
  [[ -n "$rv" ]] && add_stack "react" "React" "$rv" "framework" "$pj"
done

# Angular
for pj in $PACKAGE_JSONS; do
  av=$(npm_pkg_version "$pj" '"@angular/core"')
  [[ -n "$av" ]] && add_stack "angular" "Angular" "$av" "framework" "$pj"
done

# Vue.js
for pj in $PACKAGE_JSONS; do
  vv=$(npm_pkg_version "$pj" '"vue"')
  [[ -n "$vv" ]] && add_stack "vue" "Vue.js" "$vv" "framework" "$pj"
done

# Next.js
for pj in $PACKAGE_JSONS; do
  nv=$(npm_pkg_version "$pj" '"next"')
  [[ -n "$nv" ]] && add_stack "nextjs" "Next.js" "$nv" "framework" "$pj"
done

# Express
for pj in $PACKAGE_JSONS; do
  ev=$(npm_pkg_version "$pj" '"express"')
  [[ -n "$ev" ]] && add_stack "express" "Express" "$ev" "framework" "$pj"
done

# jQuery
for pj in $PACKAGE_JSONS; do
  jq_v=$(npm_pkg_version "$pj" '"jquery"')
  [[ -n "$jq_v" ]] && add_stack "jquery" "jQuery" "$jq_v" "framework" "$pj"
done

# TypeScript
for pj in $PACKAGE_JSONS; do
  ts_v=$(npm_pkg_version "$pj" '"typescript"')
  [[ -n "$ts_v" ]] && add_stack "typescript" "TypeScript" "$ts_v" "language" "$pj"
done

# Webpack
for pj in $PACKAGE_JSONS; do
  wp_v=$(npm_pkg_version "$pj" '"webpack"')
  [[ -n "$wp_v" ]] && add_stack "webpack" "Webpack" "$wp_v" "tool" "$pj"
done

# Django (Python)
for req in $(find $SEARCH_PATHS -maxdepth 4 -name "requirements.txt" -type f 2>/dev/null | head -5); do
  dj=$(grep -i '^django==' "$req" 2>/dev/null | extract_version)
  [[ -n "$dj" ]] && add_stack "django" "Django" "$dj" "framework" "$req"
done

# Flask (Python)
for req in $(find $SEARCH_PATHS -maxdepth 4 -name "requirements.txt" -type f 2>/dev/null | head -5); do
  fl=$(grep -i '^flask==' "$req" 2>/dev/null | extract_version)
  [[ -n "$fl" ]] && add_stack "flask" "Flask" "$fl" "framework" "$req"
done

# Spring Boot (Java)
for pom in $(find $SEARCH_PATHS -maxdepth 4 -name "pom.xml" -type f 2>/dev/null | head -5); do
  sb=$(grep -A1 'spring-boot-starter-parent' "$pom" 2>/dev/null | grep '<version>' | extract_version)
  [[ -n "$sb" ]] && add_stack "spring-boot" "Spring Boot" "$sb" "framework" "$pom"
done

# .NET Runtime
if cmd_exists dotnet; then
  dn=$(dotnet --version 2>/dev/null)
  [[ -n "$dn" ]] && add_stack "dotnet" ".NET" "$dn" "runtime" "$(which dotnet)"
fi

# --- Herramientas ---
cmd_exists docker   && add_stack "docker-engine" "Docker" "$(docker --version 2>/dev/null | extract_version)" "tool" "$(which docker)"
cmd_exists git      && add_stack "git" "Git" "$(git --version 2>/dev/null | extract_version)" "tool" "$(which git)"
cmd_exists composer && add_stack "composer" "Composer" "$(composer --version 2>/dev/null | extract_version)" "tool" "$(which composer)"
cmd_exists npm      && add_stack "npm" "npm" "$(npm --version 2>/dev/null)" "tool" "$(which npm)"
cmd_exists openssl  && add_stack "openssl" "OpenSSL" "$(openssl version 2>/dev/null | extract_version)" "tool" "$(which openssl)"
cmd_exists curl     && add_stack "curl" "cURL" "$(curl --version 2>/dev/null | head -1 | extract_version)" "tool" "$(which curl)"

# ==============================================================================
# RECOLECCION: SERVICIOS ACTIVOS
# ==============================================================================

SERVICES_DATA=""
if cmd_exists systemctl; then
  SERVICES_DATA=$(systemctl list-units --type=service --state=active --no-pager --no-legend 2>/dev/null \
    | awk '{sub(/\.service/,"",$1); print $1"|"$3"|"$4}' \
    | head -60)
fi

# ==============================================================================
# RECOLECCION: PUERTOS
# ==============================================================================

PORTS_DATA=""
if cmd_exists ss; then
  PORTS_DATA=$(ss -tlnp 2>/dev/null | tail -n +2 | awk '{
    split($4, a, ":");
    port = a[length(a)];
    proc = $6;
    gsub(/.*users:\(\("/, "", proc);
    gsub(/".*/, "", proc);
    print port"|"proc
  }' | sort -t'|' -k1 -un | head -30)
fi

# ==============================================================================
# RECOLECCION: SSL
# ==============================================================================

SSL_DATA=""
if cmd_exists openssl; then
  cert_files=""
  cmd_exists nginx && cert_files=$(nginx -T 2>/dev/null | grep -oP 'ssl_certificate\s+\K[^;]+' | sort -u | head -5)
  for cert in $cert_files; do
    [[ ! -f "$cert" ]] && continue
    expiry=$(openssl x509 -enddate -noout -in "$cert" 2>/dev/null | cut -d= -f2)
    subject=$(openssl x509 -subject -noout -in "$cert" 2>/dev/null | sed 's/subject=//')
    [[ -n "$expiry" ]] && SSL_DATA+="${cert}|${expiry}|${subject}"$'\n'
  done
fi

# ==============================================================================
# RECOLECCION: PHP-FPM
# ==============================================================================

PHPFPM_DATA=""
for pool_conf in $(find /etc/php* /etc/php-fpm* -path "*/pool.d/*.conf" -type f 2>/dev/null | head -5); do
  pool_name=$(grep -oP '(?<=\[).+(?=\])' "$pool_conf" 2>/dev/null | head -1)
  pm=$(grep '^pm\s*=' "$pool_conf" 2>/dev/null | awk -F= '{gsub(/ /,"",$2); print $2}')
  max=$(grep '^pm.max_children' "$pool_conf" 2>/dev/null | awk -F= '{gsub(/ /,"",$2); print $2}')
  [[ -n "$pool_name" ]] && PHPFPM_DATA+="${pool_name}|${pm:-dynamic}|${max:-5}"$'\n'
done

# ==============================================================================
# RECOLECCION: VHOSTS
# ==============================================================================

VHOSTS_DATA=""
if cmd_exists nginx; then
  VHOSTS_DATA=$(nginx -T 2>/dev/null | grep -P '^\s*server_name\s' \
    | awk '{for(i=2;i<=NF;i++) if($i!=";") print $i}' \
    | sort -u | grep -v '_' | head -20)
fi

# ==============================================================================
# GENERAR JSON (python3 garantiza formato valido siempre)
# ==============================================================================

STACK_TEXT=""
for item in "${STACK_ITEMS[@]}"; do
  STACK_TEXT+="${item}"$'\n'
done

# Exportar todo para python3
export _SCAN_DATE="$SCAN_DATE"
export _SERVER_NAME="$SERVER_NAME"
export _HOSTNAME="$HOSTNAME_RAW"
export _FQDN="$FQDN"
export _IP="$IP_PRIMARY"
export _ENVIRONMENT="$ENVIRONMENT"
export _OS_NAME="$OS_NAME"
export _OS_VERSION="$OS_VERSION"
export _OS_PRETTY="$OS_PRETTY"
export _OS_ID="$OS_ID"
export _KERNEL="$KERNEL"
export _ARCH="$ARCH"
export _CPU_MODEL="$CPU_MODEL"
export _CPU_CORES="$CPU_CORES"
export _RAM_TOTAL_KB="$RAM_TOTAL_KB"
export _RAM_AVAIL_KB="$RAM_AVAIL_KB"
export _SWAP_TOTAL_KB="$SWAP_TOTAL_KB"
export _SWAP_FREE_KB="$SWAP_FREE_KB"
export _DISK_TOTAL_GB="${DISK_TOTAL_GB:-0}"
export _DISK_USED_GB="${DISK_USED_GB:-0}"
export _DISK_USAGE_PCT="${DISK_USAGE_PCT:-0}"
export _UPTIME_SECS="$UPTIME_SECS"
export _UPTIME_DAYS="$UPTIME_DAYS"
export _ALL_IPS="$ALL_IPS"
export _STACK="$STACK_TEXT"
export _SERVICES="$SERVICES_DATA"
export _PORTS="$PORTS_DATA"
export _SSL="$SSL_DATA"
export _PHPFPM="$PHPFPM_DATA"
export _VHOSTS="$VHOSTS_DATA"
export _OUTPUT="$OUTPUT"

python3 -c '
import sys, json, os

def safe_int(v, d=0):
    try: return int(v)
    except: return d

def safe_float(v, d=0.0):
    try: return float(v)
    except: return d

def kb_to_gb(kb):
    return round(safe_int(kb) / 1048576, 2)

def parse_pipe_lines(raw, fields):
    items = []
    for line in raw.strip().split("\n"):
        if not line.strip(): continue
        parts = line.split("|")
        item = {}
        for i, f in enumerate(fields):
            item[f] = parts[i] if i < len(parts) else ""
        items.append(item)
    return items

# --- Leer variables de entorno ---
e = os.environ

scan_date    = e.get("_SCAN_DATE", "")
server_name  = e.get("_SERVER_NAME", "")
hostname     = e.get("_HOSTNAME", "")
fqdn         = e.get("_FQDN", "")
ip           = e.get("_IP", "")
environment  = e.get("_ENVIRONMENT", "test")
os_name      = e.get("_OS_NAME", "")
os_version   = e.get("_OS_VERSION", "")
os_pretty    = e.get("_OS_PRETTY", "")
os_id        = e.get("_OS_ID", "")
kernel       = e.get("_KERNEL", "")
arch         = e.get("_ARCH", "")
cpu_model    = e.get("_CPU_MODEL", "")
cpu_cores    = e.get("_CPU_CORES", "1")
ram_total_kb = e.get("_RAM_TOTAL_KB", "0")
ram_avail_kb = e.get("_RAM_AVAIL_KB", "0")
swap_total_kb= e.get("_SWAP_TOTAL_KB", "0")
swap_free_kb = e.get("_SWAP_FREE_KB", "0")
disk_total   = e.get("_DISK_TOTAL_GB", "0")
disk_used    = e.get("_DISK_USED_GB", "0")
disk_pct     = e.get("_DISK_USAGE_PCT", "0")
uptime_secs  = e.get("_UPTIME_SECS", "0")
uptime_days  = e.get("_UPTIME_DAYS", "0")
output_file  = e.get("_OUTPUT", "")

# --- Calcular RAM ---
ram_total = kb_to_gb(ram_total_kb)
ram_avail = kb_to_gb(ram_avail_kb)
ram_used  = round(ram_total - ram_avail, 2)
swap_total = kb_to_gb(swap_total_kb)
swap_free  = kb_to_gb(swap_free_kb)
swap_used  = round(swap_total - swap_free, 2)
swap_pct   = round((swap_used / swap_total * 100), 1) if swap_total > 0 else 0.0

# --- Parse datos pipe-separated ---
all_ips = [x.strip() for x in e.get("_ALL_IPS", "").strip().split("\n") if x.strip()]

stack = []
for line in e.get("_STACK", "").strip().split("\n"):
    if not line.strip(): continue
    p = line.split("|")
    if len(p) >= 4:
        stack.append({
            "product": p[0], "label": p[1], "version": p[2],
            "category": p[3], "path": p[4] if len(p) > 4 else ""
        })

services = parse_pipe_lines(e.get("_SERVICES", ""), ["name", "state", "sub"])
ports_raw = parse_pipe_lines(e.get("_PORTS", ""), ["port", "process"])
ports = [{"port": safe_int(p["port"]), "process": p.get("process", "")} for p in ports_raw]

ssl_certs = parse_pipe_lines(e.get("_SSL", ""), ["file", "expires", "subject"])
phpfpm_raw = parse_pipe_lines(e.get("_PHPFPM", ""), ["pool", "pm", "max_children"])
phpfpm = [{"pool": p["pool"], "pm": p["pm"], "max_children": safe_int(p["max_children"], 5)} for p in phpfpm_raw]
vhosts = [v.strip() for v in e.get("_VHOSTS", "").strip().split("\n") if v.strip()]

# === JSON final ===
data = {
    "schema_version": "1.0",
    "scan_date": scan_date,
    "server": {
        "name": server_name,
        "hostname": hostname,
        "fqdn": fqdn,
        "ip": ip,
        "all_ips": all_ips,
        "environment": environment,
        "os": os_name,
        "os_version": os_version,
        "os_pretty": os_pretty,
        "os_id": os_id,
        "kernel": kernel,
        "arch": arch
    },
    "hardware": {
        "cpu": cpu_model,
        "cpu_count": safe_int(cpu_cores, 1),
        "ram_total_gb": ram_total,
        "ram_used_gb": ram_used,
        "ram_available_gb": ram_avail,
        "swap_total_gb": swap_total,
        "swap_used_gb": swap_used,
        "swap_usage_pct": swap_pct,
        "disk_total_gb": safe_int(disk_total),
        "disk_used_gb": safe_int(disk_used),
        "disk_usage_pct": safe_int(disk_pct)
    },
    "uptime": {
        "seconds": safe_int(uptime_secs),
        "days": safe_int(uptime_days)
    },
    "stack": stack,
    "services": services,
    "listening_ports": ports,
    "ssl_certificates": ssl_certs,
    "php_fpm_pools": phpfpm,
    "vhosts": vhosts
}

out = json.dumps(data, indent=2, ensure_ascii=False)

if output_file:
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(out + "\n")
    print(f"  Servidor:  {server_name} ({ip})", file=sys.stderr)
    print(f"  OS:        {os_pretty}", file=sys.stderr)
    print(f"  Entorno:   {environment}", file=sys.stderr)
    print(f"  Stack:     {len(stack)} componentes", file=sys.stderr)
    print(f"  Servicios: {len(services)} activos", file=sys.stderr)
    print(f"  Guardado:  {output_file}", file=sys.stderr)
else:
    print(out)
' <<< "" # stdin vacio, todo via env

# Resumen final
if [[ -n "$OUTPUT" ]]; then
  echo "" >&2
  echo "Listo. Copia $OUTPUT a tu proyecto devops." >&2
fi
