#!/usr/bin/env bash
set -Eeuo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
env_file="${project_dir}/.env.production"
compose_file="${project_dir}/compose.prod.yaml"
backup_dir="${BACKUP_DIR:-${project_dir}/.backups}"
timestamp="$(date +%Y%m%d-%H%M%S)"

cd "${project_dir}"
mkdir -p "${backup_dir}"

if [[ ! -f "${env_file}" ]]; then
  echo "Missing ${env_file}." >&2
  exit 1
fi

compose=(docker compose --env-file "${env_file}" -f "${compose_file}")
postgres_user="$(sed -n 's/^POSTGRES_USER=//p' "${env_file}" | tail -n 1)"

if [[ -z "${postgres_user}" ]]; then
  echo "POSTGRES_USER is missing from ${env_file}." >&2
  exit 1
fi

"${compose[@]}" exec -T postgres pg_dumpall --clean --if-exists --username "${postgres_user}" \
  > "${backup_dir}/database-${timestamp}.sql"

docker run --rm \
  --volume scs-company-profile_cms-media:/data:ro \
  --volume "${backup_dir}:/backup" \
  alpine:3.22 \
  tar -czf "/backup/media-${timestamp}.tar.gz" -C /data .

echo "Backup saved in ${backup_dir}."

