#!/usr/bin/env bash
set -Eeuo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
env_file="${project_dir}/.env.production"
compose_file="${project_dir}/compose.prod.yaml"

cd "${project_dir}"

if [[ ! -f "${env_file}" ]]; then
  echo "Missing ${env_file}. Copy .env.production.example and fill the secrets first." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not accessible. Run this script with sudo or ask the server administrator for Docker access." >&2
  exit 1
fi

compose=(docker compose --env-file "${env_file}" -f "${compose_file}")

"${compose[@]}" config --quiet
"${compose[@]}" build web
"${compose[@]}" up -d web proxy
"${compose[@]}" ps

echo
echo "Deployment started. Check the public endpoint and logs before declaring it complete."

