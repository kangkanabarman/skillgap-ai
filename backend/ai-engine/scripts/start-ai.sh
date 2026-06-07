#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
if [ ! -d "venv" ]; then
  echo "Run npm run setup:ai from project root first."
  exit 1
fi
source venv/bin/activate
exec uvicorn ai_server:app --host 127.0.0.1 --port "${AI_PORT:-8001}"
