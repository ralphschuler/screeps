#!/usr/bin/env bash
set -euo pipefail

cd "${SCREEPS_HOME:-/screeps}"
mkdir -p "${SCREEPS_LOGDIR:-/screeps/logs}"

# Initialize official world data before writing CI .screepsrc; init exits early
# when .screepsrc already exists.
if [ ! -s "${SCREEPS_DB:-/screeps/db.json}" ]; then
  rm -f .screepsrc "${SCREEPS_DB:-/screeps/db.json}"
  printf '%s\n' "${STEAM_KEY:-ci-offline-private-server-key}" | npx screeps init >/tmp/screeps-init.log 2>&1
fi

cat > .screepsrc <<EOF
[server]
host = 0.0.0.0
port = ${SCREEPS_PORT:-21025}
cli_host = 0.0.0.0
cli_port = ${SCREEPS_CLI_PORT:-21026}
password = ${SCREEPS_CLI_PASSWORD:-ci-password}
EOF

exec npx screeps start \
  --host 0.0.0.0 \
  --port "${SCREEPS_PORT:-21025}" \
  --cli_host 0.0.0.0 \
  --cli_port "${SCREEPS_CLI_PORT:-21026}" \
  --password "${SCREEPS_CLI_PASSWORD:-ci-password}" \
  --db "${SCREEPS_DB:-/screeps/db.json}" \
  --logdir "${SCREEPS_LOGDIR:-/screeps/logs}" \
  --modfile "${SCREEPS_MODFILE:-/screeps/mods.ci.json}" \
  --assetdir "${SCREEPS_ASSETDIR:-/usr/local/lib/node_modules/screeps/node_modules/@screeps/launcher/init_dist/assets}" \
  "$@"
