#!/usr/bin/env bash
#
# Load autocomplete data into Redis after containers are running.
# Uses the /secret/boot and /secret/feed-data API endpoints.
#
# Usage:
#   ./scripts/load-data.sh                    # from host (API at localhost:3001)
#   ./scripts/load-data.sh http://web1:3001   # from another container (Docker network)
#
# Requires: curl, ADMIN_KEY (from .env or environment)

set -e

# --- Config ---
API_BASE="${1:-http://127.0.0.1:3001}"
ADMIN_KEY="${ADMIN_KEY:-A8E6YziXl3RmoYAq1LjIH8f8LZtEbrDDsOEqAs8i}"

# All data categories (matches src/core/db/data/*.txt)
CATEGORIES=(
  a b c d e f g h i j k l m n o p q r s t u v w x y z
  0
  words_lowercase
  urban_d urban_e urban_f urban_g urban_h urban_i urban_j urban_k urban_l
)

# --- Helpers ---
log() { echo "[load-data] $*"; }
curl_auth() {
  curl -sf -H "Authorization: Bearer ${ADMIN_KEY}" "$@"
}

# --- Wait for API ---
wait_for_api() {
  log "Waiting for API at ${API_BASE}..."
  local max=60
  local n=0
  while ! curl -sf -o /dev/null "${API_BASE}/" 2>/dev/null; do
    n=$((n + 1))
    if [ "$n" -ge "$max" ]; then
      log "API did not become ready in time"
      exit 1
    fi
    sleep 2
    log "Retry $n/$max..."
  done
  log "API ready."
}

# --- Load one category ---
load_category() {
  local cat="$1"
  log "Boot + feed: $cat"
  curl_auth -s "${API_BASE}/secret/boot/${cat}" > /dev/null || true
  curl_auth -s "${API_BASE}/secret/feed-data/${cat}" > /dev/null || true
}

# --- Main ---
main() {
  if [ -f .env ]; then
    set -a
    # shellcheck source=/dev/null
    source .env
    set +a
  fi

  wait_for_api

  for cat in "${CATEGORIES[@]}"; do
    load_category "$cat"
  done

  log "Done."
}

main "$@"
