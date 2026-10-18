#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/generate_config.py
exec python3 -m http.server "${PORT:-8080}"
