# ==============================================================================
# Werfen DevOps Dashboard — Makefile
# ==============================================================================
# Prerequisitos: nvm con Node.js 20 instalado (WSL Ubuntu 20.04)
# ==============================================================================

SHELL := /bin/bash
NVM_INIT := export NVM_DIR=$$HOME/.nvm; . $$NVM_DIR/nvm.sh; nvm use 20 > /dev/null 2>&1
SITE_DIR := docusaurus-site
PORT := 3000

.DEFAULT_GOAL := help

# --- Docusaurus ---

.PHONY: install
install: ## Instalar dependencias de Docusaurus
	cd $(SITE_DIR) && $(NVM_INIT) && npm install

.PHONY: dev
dev: ## Arrancar Docusaurus en modo desarrollo (hot reload)
	@kill $$(lsof -t -i:$(PORT)) 2>/dev/null || true
	cd $(SITE_DIR) && $(NVM_INIT) && npx docusaurus start --host 0.0.0.0 --port $(PORT)

.PHONY: build
build: ## Compilar el sitio estático (build/)
	cd $(SITE_DIR) && $(NVM_INIT) && npx docusaurus build

.PHONY: serve
serve: build ## Build + servir el sitio en :3000
	@kill $$(lsof -t -i:$(PORT)) 2>/dev/null || true
	cd $(SITE_DIR) && $(NVM_INIT) && npx docusaurus serve --host 0.0.0.0 --port $(PORT)

.PHONY: stop
stop: ## Parar el servidor Docusaurus
	@kill $$(lsof -t -i:$(PORT)) 2>/dev/null && echo "Servidor parado" || echo "No hay servidor en :$(PORT)"

.PHONY: clear
clear: ## Limpiar cache de Docusaurus (.docusaurus/)
	cd $(SITE_DIR) && $(NVM_INIT) && npx docusaurus clear

# --- Git ---

.PHONY: status
status: ## Ver estado de git
	git status -sb

.PHONY: log
log: ## Últimos 10 commits
	git log --oneline -10

.PHONY: diff
diff: ## Ver cambios pendientes
	git diff --stat

.PHONY: commit
commit: ## Commit interactivo (uso: make commit m="mensaje")
	git add -A && git commit -m "$(m)"

# --- Documentación ---

.PHONY: stats
stats: ## Estadísticas de documentación
	@echo "=== Docusaurus docs ==="
	@find $(SITE_DIR)/docs -name '*.md' | wc -l | xargs -I{} echo "  Ficheros .md: {}"
	@find $(SITE_DIR)/docs -name '*.md' -exec cat {} + | wc -l | xargs -I{} echo "  Líneas total: {}"
	@echo ""
	@echo "=== Projects ==="
	@find projects -name '*.md' | wc -l | xargs -I{} echo "  Ficheros .md: {}"
	@find projects -name '*.md' -exec cat {} + | wc -l | xargs -I{} echo "  Líneas total: {}"
	@echo ""
	@echo "=== Por proyecto ==="
	@for p in projects/*/; do \
		count=$$(find $$p -name '*.md' -exec cat {} + 2>/dev/null | wc -l); \
		echo "  $$(basename $$p): $$count líneas"; \
	done

.PHONY: tree
tree: ## Árbol de documentación
	@echo "=== Docusaurus docs ==="
	@find $(SITE_DIR)/docs -name '*.md' | sort | sed 's|$(SITE_DIR)/docs/||'
	@echo ""
	@echo "=== Projects ==="
	@find projects -name '*.md' | sort

# --- Utilidades ---

.PHONY: ports
ports: ## Ver puertos en uso
	ss -tlnp 2>/dev/null || netstat -tlnp

.PHONY: disk
disk: ## Espacio en disco
	df -h / | tail -1

# --- Docker (API + PostgreSQL) ---

.PHONY: up
up: ## Levantar API + PostgreSQL con Docker Compose
	docker compose up -d --build

.PHONY: down
down: ## Parar contenedores Docker
	docker compose down

.PHONY: logs
logs: ## Ver logs de los contenedores
	docker compose logs -f --tail=50

.PHONY: api-logs
api-logs: ## Ver logs solo de la API
	docker compose logs -f --tail=50 api

.PHONY: chat-logs
chat-logs: ## Ver logs del chatbot AI en tiempo real
	docker exec -it devops-api sh -c "mkdir -p /logs && touch /logs/chat.log && tail -f /logs/chat.log"

.PHONY: db-shell
db-shell: ## Abrir shell psql en la base de datos
	docker compose exec db psql -U devops devops_dashboard

.PHONY: sync
sync: ## Forzar sincronización con endoflife.date
	@curl -s -X POST http://localhost:3001/api/sync | python3 -m json.tool 2>/dev/null || curl -s -X POST http://localhost:3001/api/sync

.PHONY: api-status
api-status: ## Verificar estado de la API
	@curl -s http://localhost:3001/api/health | python3 -m json.tool 2>/dev/null || echo "API no disponible"

.PHONY: full
full: up dev ## Levantar todo (Docker + Docusaurus)

.PHONY: help
help: ## Mostrar esta ayuda
	@echo ""
	@echo "  Werfen DevOps Dashboard"
	@echo "  ======================="
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""
