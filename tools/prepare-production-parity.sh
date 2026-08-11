#!/usr/bin/env sh
set -eu
repo_root="$(CDPATH= cd -- "$(dirname -- "$0")/.." 2>/dev/null && pwd)"
exec node "$repo_root/tools/prepare-production-parity.mjs"
