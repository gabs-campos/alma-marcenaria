#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${1:-$ROOT_DIR/config/deploy.env}"
DELETE_REMOTE="${DELETE_REMOTE:-0}"
RUN_MIGRATIONS="${RUN_MIGRATIONS:-1}"
PHP_BIN="${PHP_BIN:-/opt/homebrew/bin/php}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[ERROR] Env file not found: $ENV_FILE"
  exit 1
fi

if ! command -v lftp >/dev/null 2>&1; then
  echo "[ERROR] lftp is not installed. Install with: brew install lftp"
  exit 1
fi

if [[ ! -x "$PHP_BIN" ]]; then
  if command -v php >/dev/null 2>&1; then
    PHP_BIN="$(command -v php)"
  else
    echo "[ERROR] PHP binary not found. Set PHP_BIN or install PHP."
    exit 1
  fi
fi

set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

required_vars=(FTP_HOST FTP_PORT FTP_USER FTP_PASS FTP_REMOTE_DIR DB_HOST DB_PORT DB_NAME DB_USER DB_PASS DB_CHARSET)
for key in "${required_vars[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    echo "[ERROR] Missing required env variable: $key"
    exit 1
  fi
done

if [[ "$RUN_MIGRATIONS" == "1" ]]; then
  echo "[INFO] Running database migrations..."
  "$PHP_BIN" "$ROOT_DIR/scripts/migrate.php" "$ENV_FILE"
fi

echo "[INFO] Starting FTP upload to $FTP_HOST:$FTP_PORT/$FTP_REMOTE_DIR"

LFTP_DELETE_FLAG="--delete"
if [[ "$DELETE_REMOTE" != "1" ]]; then
  LFTP_DELETE_FLAG=""
fi

FTP_PWD="$(lftp -u "$FTP_USER","$FTP_PASS" "ftp://$FTP_HOST:$FTP_PORT" -e "quote PWD; bye" 2>/dev/null || true)"
if [[ "$FTP_REMOTE_DIR" == "public_html" && "$FTP_PWD" == *'"/public_html"'* ]]; then
  echo "[WARN] FTP já inicia em /public_html. Ajustando destino para diretório atual (.)"
  FTP_REMOTE_DIR="."
fi

lftp -u "$FTP_USER","$FTP_PASS" "ftp://$FTP_HOST:$FTP_PORT" <<EOF
set ssl:verify-certificate no
set ftp:passive-mode true
set net:max-retries 2
set net:timeout 20
set net:reconnect-interval-base 5
set net:reconnect-interval-max 30
mkdir -p "$FTP_REMOTE_DIR"
mirror -R $LFTP_DELETE_FLAG \
  --verbose \
  --parallel=3 \
  --exclude-glob .DS_Store \
  --exclude-glob "*.log" \
  --exclude-glob "config/deploy.env" \
  --exclude-glob "config/deploy.env.example" \
  --exclude-glob ".git*" \
  --exclude-glob "README.md" \
  --exclude-glob "terminals" \
  "$ROOT_DIR" "$FTP_REMOTE_DIR"
bye
EOF

echo "[INFO] Deploy finished successfully."
echo "[INFO] Site URL (adjust domain): https://seu-dominio/"
