#!/bin/bash
# ==============================================================================
# remote-audit.sh — Ejecuta server-audit.sh en servidores remotos via SSH
# ==============================================================================
#
# USO:
#   bash scripts/remote-audit.sh                → menú interactivo
#   bash scripts/remote-audit.sh --all          → todos los servidores
#   bash scripts/remote-audit.sh 1              → solo el servidor 1
#   bash scripts/remote-audit.sh 1,3            → servidores 1 y 3
#
# Requisitos: sshpass (se instala automáticamente si falta)
# ==============================================================================

set -euo pipefail

# ── Colores ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

# ── Rutas ────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUDIT_SCRIPT="${SCRIPT_DIR}/server-audit.sh"
OUTPUT_DIR="${SCRIPT_DIR}/../audits"
REMOTE_TMP="/tmp/server-audit.sh"
SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=10 -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR"

# ── Configuración de servidores (desde fichero externo) ──────────────────────
SERVERS_FILE="${SCRIPT_DIR}/servers.conf"
SERVERS=()

load_servers() {
  if [ ! -f "$SERVERS_FILE" ]; then
    error "No se encuentra el fichero de servidores: ${SERVERS_FILE}"
    error "Crea el fichero con formato: NOMBRE|IP|ENTORNO"
    exit 1
  fi
  while IFS= read -r line; do
    line="${line//$'\r'/}"
    # Ignorar líneas vacías y comentarios
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    SERVERS+=("$line")
  done < "$SERVERS_FILE"
  if [ ${#SERVERS[@]} -eq 0 ]; then
    error "El fichero de servidores está vacío: ${SERVERS_FILE}"
    exit 1
  fi
}

# ── Funciones auxiliares ─────────────────────────────────────────────────────

info()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; }

check_deps() {
  if ! command -v sshpass &>/dev/null; then
    warn "sshpass no está instalado. Instalando..."
    if command -v apt-get &>/dev/null; then
      sudo apt-get update -qq && sudo apt-get install -y -qq sshpass
    elif command -v yum &>/dev/null; then
      sudo yum install -y sshpass
    elif command -v zypper &>/dev/null; then
      sudo zypper install -y sshpass
    else
      error "No se pudo instalar sshpass. Instálalo manualmente."
      exit 1
    fi
  fi
}

show_menu() {
  echo ""
  echo -e "${BOLD}╔══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}║          Auditoría remota de servidores Werfen          ║${NC}"
  echo -e "${BOLD}╚══════════════════════════════════════════════════════════╝${NC}"
  echo ""
  for i in "${!SERVERS[@]}"; do
    IFS='|' read -r name ip env <<< "${SERVERS[$i]}"
    printf "  ${CYAN}%d)${NC}  %-28s  ${YELLOW}%s${NC}  [%s]\n" "$((i+1))" "$name" "$ip" "$env"
  done
  echo ""
  echo -e "  ${CYAN}A)${NC}  Todos los servidores"
  echo ""
}



run_audit() {
  local name="$1" ip="$2" env="$3"
  local output_file="${OUTPUT_DIR}/${name}.json"
  local remote_json="/tmp/${name}.json"

  echo ""
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  info "Servidor: ${BOLD}${name}${NC} (${ip}) — entorno: ${env}"
  echo ""
  echo -e "  ${BOLD}── Credenciales SSH para ${CYAN}${name}${NC} ${YELLOW}${ip}${NC} ──${NC}"
  read -rp "  Usuario: " SSH_USER < /dev/tty
  if [ -z "$SSH_USER" ]; then
    error "El usuario no puede estar vacío"
    return 1
  fi
  read -rsp "  Contraseña: " SSH_PASS < /dev/tty
  echo ""
  if [ -z "$SSH_PASS" ]; then
    error "La contraseña no puede estar vacía"
    return 1
  fi
  export SSHPASS="$SSH_PASS"

  # 1. Subir el script de auditoría
  info "Subiendo server-audit.sh..."
  if ! sshpass -e scp $SSH_OPTS "$AUDIT_SCRIPT" "${SSH_USER}@${ip}:${REMOTE_TMP}" 2>/dev/null; then
    error "No se pudo conectar a ${ip}. Verifica IP/credenciales."
    return 1
  fi
  ok "Script subido"

  # 2. Ejecutar en remoto
  info "Ejecutando auditoría (puede tardar unos segundos)..."
  if ! sshpass -e ssh $SSH_OPTS "${SSH_USER}@${ip}" \
    "bash ${REMOTE_TMP} -n '${name}' -e '${env}' -o '${remote_json}'" 2>/dev/null; then
    error "Error ejecutando la auditoría en ${name}"
    return 1
  fi
  ok "Auditoría completada"

  # 3. Descargar el JSON
  info "Descargando ${name}.json..."
  if ! sshpass -e scp $SSH_OPTS "${SSH_USER}@${ip}:${remote_json}" "$output_file" 2>/dev/null; then
    error "No se pudo descargar el fichero"
    return 1
  fi
  ok "Guardado en: ${output_file}"

  # 4. Limpiar ficheros remotos
  sshpass -e ssh $SSH_OPTS "${SSH_USER}@${ip}" \
    "rm -f '${REMOTE_TMP}' '${remote_json}'" 2>/dev/null || true

  # 5. Resumen rápido
  if command -v python3 &>/dev/null; then
    local stack_count
    stack_count=$(python3 -c "import json; d=json.load(open('${output_file}')); print(len(d.get('stack',[])))" 2>/dev/null || echo "?")
    info "Stack detectado: ${stack_count} componentes"
  fi

  ok "${BOLD}${name}${NC} completado ✓"
  unset SSHPASS
  return 0
}

# ── Main ─────────────────────────────────────────────────────────────────────

main() {
  # Verificar que existe el script de auditoría
  if [ ! -f "$AUDIT_SCRIPT" ]; then
    error "No se encuentra server-audit.sh en ${AUDIT_SCRIPT}"
    exit 1
  fi

  check_deps
  load_servers
  mkdir -p "$OUTPUT_DIR"

  # Parsear argumentos
  local selection=""
  if [ "${1:-}" = "--all" ] || [ "${1:-}" = "-a" ]; then
    selection="all"
  elif [ -n "${1:-}" ]; then
    selection="$1"
  fi

  # Si no hay argumento, mostrar menú
  if [ -z "$selection" ]; then
    show_menu
    read -rp "  Selección (1-${#SERVERS[@]}, A=todos): " choice
    case "${choice,,}" in
      a|all) selection="all" ;;
      *)     selection="$choice" ;;
    esac
  fi

  # Determinar servidores a auditar
  AUDIT_INDICES=()
  if [ "$selection" = "all" ]; then
    for i in "${!SERVERS[@]}"; do
      AUDIT_INDICES+=("$i")
    done
  else
    IFS=',' read -ra parts <<< "$selection"
    for p in "${parts[@]}"; do
      p=$(echo "$p" | tr -d ' ')
      if [[ "$p" =~ ^[0-9]+$ ]] && [ "$p" -ge 1 ] && [ "$p" -le "${#SERVERS[@]}" ]; then
        AUDIT_INDICES+=("$((p-1))")
      else
        error "Selección inválida: $p"
        exit 1
      fi
    done
  fi

  if [ ${#AUDIT_INDICES[@]} -eq 0 ]; then
    error "No se seleccionó ningún servidor"
    exit 1
  fi

  # Ejecutar auditorías
  local total=${#AUDIT_INDICES[@]}
  local success=0
  local failed=0
  local failed_names=()

  for idx in "${AUDIT_INDICES[@]}"; do
    IFS='|' read -r name ip env <<< "${SERVERS[$idx]}"
    if run_audit "$name" "$ip" "$env"; then
      ((success++))
    else
      ((failed++))
      failed_names+=("$name")
    fi
  done

  # Resumen final
  echo ""
  echo -e "${BOLD}══════════════════════════════════════════════════════════════${NC}"
  echo -e "${BOLD}  RESUMEN${NC}"
  echo -e "${BOLD}══════════════════════════════════════════════════════════════${NC}"
  ok "Completados: ${success}/${total}"
  if [ "$failed" -gt 0 ]; then
    error "Fallidos: ${failed} (${failed_names[*]})"
  fi
  echo ""
  info "Ficheros JSON guardados en: ${OUTPUT_DIR}/"
  ls -lh "$OUTPUT_DIR"/*.json 2>/dev/null | awk '{print "        " $NF " (" $5 ")"}'
  echo ""
  info "Para importar, abre ${CYAN}http://localhost:3000/import${NC} y arrastra los ficheros."
  echo ""
}

main "$@"
