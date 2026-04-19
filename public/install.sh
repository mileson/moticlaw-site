#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_ROOT="${MOTICLAW_INSTALL_DIR:-${HOME}/.local/share/moticlaw/current}"
BIN_DIR="${MOTICLAW_BIN_DIR:-${HOME}/.local/bin}"
START_MODE="${MOTICLAW_INSTALL_MODE:-auto}"
DRY_RUN="${MOTICLAW_DRY_RUN:-0}"
MANIFEST_URL="${MOTICLAW_RELEASE_MANIFEST_URL:-}"
MANIFEST_FILE="${MOTICLAW_RELEASE_MANIFEST_FILE:-}"
ARCHIVE_OVERRIDE="${MOTICLAW_RELEASE_ARCHIVE:-}"
INSTALL_TMPDIR=""

BOLD=$'\033[1m'
GREEN=$'\033[32m'
YELLOW=$'\033[33m'
RED=$'\033[31m'
CYAN=$'\033[36m'
NC=$'\033[0m'

log() { printf '%b\n' "$*"; }
info() { log "${CYAN}[*]${NC} $*"; }
ok() { log "${GREEN}[ok]${NC} $*"; }
warn() { log "${YELLOW}[warn]${NC} $*"; }
fail() { log "${RED}[err]${NC} $*"; exit 1; }

detect_os() {
  case "$(uname -s 2>/dev/null || true)" in
    Darwin) echo "darwin" ;;
    Linux) echo "linux" ;;
    *) echo "unsupported" ;;
  esac
}

detect_arch() {
  case "$(uname -m 2>/dev/null || true)" in
    x86_64|amd64) echo "x64" ;;
    arm64|aarch64) echo "arm64" ;;
    *) echo "unknown" ;;
  esac
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "缺少依赖：$1"
}

resolve_manifest_source() {
  if [[ -n "$MANIFEST_FILE" && -f "$MANIFEST_FILE" ]]; then
    printf '%s\n' "$MANIFEST_FILE"
    return
  fi
  if [[ -n "$MANIFEST_URL" ]]; then
    printf '%s\n' "$MANIFEST_URL"
    return
  fi
  printf '%s\n' "https://moticlaw.com/release-manifest.json"
}

fetch_to_file() {
  local source_ref="$1"
  local target_file="$2"
  mkdir -p "$(dirname "$target_file")"
  if [[ -f "$source_ref" ]]; then
    cp "$source_ref" "$target_file"
    return
  fi
  if [[ "$source_ref" == file://* ]]; then
    cp "${source_ref#file://}" "$target_file"
    return
  fi
  curl -fsSL "$source_ref" -o "$target_file"
}

sha256_file() {
  local file="$1"
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$file" | awk '{print $1}'
  else
    shasum -a 256 "$file" | awk '{print $1}'
  fi
}

read_manifest_artifact() {
  local manifest_path="$1"
  local platform_key="$2"
  python3 - <<'PY' "$manifest_path" "$platform_key"
from pathlib import Path
import json
import sys

manifest_path = Path(sys.argv[1])
platform_key = sys.argv[2]
payload = json.loads(manifest_path.read_text(encoding="utf-8"))
artifacts = payload.get("artifacts") or {}
artifact = artifacts.get(platform_key)
if not artifact:
    raise SystemExit(f"artifact_not_found:{platform_key}")
archive = artifact.get("archive") or {}
checksum = artifact.get("checksum") or {}
print(json.dumps({
    "version": payload.get("version"),
    "channel": payload.get("channel"),
    "archive": archive,
    "checksum": checksum,
}, ensure_ascii=False))
PY
}

resolve_ref_from_manifest() {
  local manifest_source="$1"
  local manifest_dir="$2"
  local ref="$3"
  if [[ -z "$ref" ]]; then
    return 1
  fi
  if [[ "$ref" == http://* || "$ref" == https://* || "$ref" == file://* ]]; then
    printf '%s\n' "$ref"
    return
  fi
  if [[ -f "$ref" ]]; then
    printf '%s\n' "$ref"
    return
  fi
  if [[ "$manifest_source" == http://* || "$manifest_source" == https://* ]]; then
    local base="${manifest_source%/*}"
    printf '%s/%s\n' "$base" "$ref"
    return
  fi
  printf '%s/%s\n' "$manifest_dir" "$ref"
}

sync_tree() {
  local source_dir="$1"
  local target_dir="$2"
  mkdir -p "$target_dir"
  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete \
      --exclude '/data/' \
      --exclude '/logs/' \
      --exclude '/run/' \
      --exclude '/env/.env' \
      "${source_dir}/" "${target_dir}/"
  else
    find "$target_dir" -mindepth 1 -maxdepth 1 ! -name data ! -name logs ! -name run ! -name env -exec rm -rf {} +
    cp -R "${source_dir}/." "$target_dir/"
  fi
  mkdir -p "$target_dir/data"
  if [[ -d "$source_dir/data/preset_agent_marketplace" ]]; then
    rm -rf "$target_dir/data/preset_agent_marketplace"
    cp -R "$source_dir/data/preset_agent_marketplace" "$target_dir/data/preset_agent_marketplace"
  fi
}

ensure_env_file() {
  local env_example="$1/env/.env.example"
  local env_file="$1/env/.env"
  mkdir -p "$(dirname "$env_file")"
  [[ -f "$env_file" ]] || cp "$env_example" "$env_file"
}

upsert_env() {
  local file="$1"
  local key="$2"
  local value="$3"
  python3 - <<'PY' "$file" "$key" "$value"
from pathlib import Path
import sys
path = Path(sys.argv[1])
key = sys.argv[2]
value = sys.argv[3]
lines = path.read_text(encoding="utf-8").splitlines() if path.exists() else []
prefix = f"{key}="
updated = False
new_lines = []
for line in lines:
    if line.startswith(prefix):
        new_lines.append(f"{key}={value}")
        updated = True
    else:
        new_lines.append(line)
if not updated:
    new_lines.append(f"{key}={value}")
path.write_text("\n".join(new_lines).rstrip() + "\n", encoding="utf-8")
PY
}

install_cli_wrapper() {
  local install_root="$1"
  mkdir -p "$BIN_DIR"
  cat > "${BIN_DIR}/moticlaw" <<EOF
#!/usr/bin/env bash
set -euo pipefail
ENV_FILE="${install_root}/env/.env"
if [[ -f "\${ENV_FILE}" ]]; then
  set -a
  source "\${ENV_FILE}"
  set +a
fi
exec "${install_root}/bin/moticlawctl" "\$@"
EOF
  chmod +x "${BIN_DIR}/moticlaw"
}

render_systemd_unit() {
  local template="$1"
  local target="$2"
  local install_root="$3"
  local env_file="$4"
  sed \
    -e "s#@INSTALL_ROOT@#${install_root}#g" \
    -e "s#@ENV_FILE@#${env_file}#g" \
    "$template" > "$target"
}

install_systemd_user_units() {
  local install_root="$1"
  local env_file="$2"
  local unit_root="${HOME}/.config/systemd/user"
  mkdir -p "$unit_root"
  render_systemd_unit "${ROOT_DIR}/deploy/systemd/user/moticlaw-api.service.tmpl" "${unit_root}/moticlaw-api.service" "$install_root" "$env_file"
  render_systemd_unit "${ROOT_DIR}/deploy/systemd/user/moticlaw-web.service.tmpl" "${unit_root}/moticlaw-web.service" "$install_root" "$env_file"
  cp "${ROOT_DIR}/deploy/systemd/user/moticlaw.target" "${unit_root}/moticlaw.target"
  systemctl --user daemon-reload
  systemctl --user enable --now moticlaw.target
  if command -v loginctl >/dev/null 2>&1; then
    loginctl enable-linger "$USER" >/dev/null 2>&1 || warn "无法自动启用 linger；注销后 user service 可能不会保活。"
  fi
}

stop_detached_mode() {
  local install_root="$1"
  for file in "${install_root}/run/api.pid" "${install_root}/run/web.pid"; do
    if [[ -f "$file" ]]; then
      pid="$(tr -d '[:space:]' < "$file")"
      if [[ -n "${pid}" ]]; then
        kill "$pid" 2>/dev/null || true
        sleep 1
        kill -9 "$pid" 2>/dev/null || true
      fi
      rm -f "$file"
    fi
  done
}

start_detached_mode() {
  local install_root="$1"
  local env_file="$2"
  stop_detached_mode "$install_root"
  mkdir -p "${install_root}/logs" "${install_root}/run"
  set -a
  source "$env_file"
  set +a
  nohup "${install_root}/deploy/linux/run-api.sh" >> "${install_root}/logs/install-api.log" 2>&1 &
  echo $! > "${install_root}/run/api.pid"
  nohup "${install_root}/deploy/linux/run-web.sh" >> "${install_root}/logs/install-web.log" 2>&1 &
  echo $! > "${install_root}/run/web.pid"
}

resolve_start_mode() {
  local os="$1"
  if [[ "${START_MODE}" != "auto" ]]; then
    printf '%s\n' "${START_MODE}"
    return
  fi
  if [[ "${os}" == "linux" ]] && command -v systemctl >/dev/null 2>&1 && systemctl --user show-environment >/dev/null 2>&1; then
    printf '%s\n' "systemd-user"
    return
  fi
  printf '%s\n' "detached"
}

wait_for_http() {
  local url="$1"
  local timeout_sec="${2:-60}"
  local deadline=$((SECONDS + timeout_sec))
  while [[ "$SECONDS" -lt "$deadline" ]]; do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  return 1
}

main() {
  local os arch platform_key manifest_source manifest_base_dir manifest_path manifest_json archive_ref archive_sha archive_path extract_dir env_file start_mode version channel
  os="$(detect_os)"
  [[ "${os}" != "unsupported" ]] || fail "仅支持 macOS / Linux。"
  arch="$(detect_arch)"
  platform_key="${os}-${arch}"
  need_cmd python3
  need_cmd curl
  need_cmd tar

  manifest_source="$(resolve_manifest_source)"
  INSTALL_TMPDIR="$(mktemp -d)"
  trap 'rm -rf "${INSTALL_TMPDIR}"' EXIT
  manifest_path="${INSTALL_TMPDIR}/release-manifest.json"
  fetch_to_file "$manifest_source" "$manifest_path"
  if [[ "$manifest_source" == http://* || "$manifest_source" == https://* ]]; then
    manifest_base_dir=""
  else
    manifest_base_dir="$(cd "$(dirname "$manifest_source")" && pwd)"
  fi
  manifest_json="$(read_manifest_artifact "$manifest_path" "$platform_key")"
  version="$(python3 - <<'PY' "$manifest_json"
import json, sys
print(json.loads(sys.argv[1]).get("version") or "unknown")
PY
)"
  channel="$(python3 - <<'PY' "$manifest_json"
import json, sys
print(json.loads(sys.argv[1]).get("channel") or "release")
PY
)"

  if [[ -n "$ARCHIVE_OVERRIDE" ]]; then
    archive_ref="$ARCHIVE_OVERRIDE"
    archive_sha=""
  else
    archive_ref="$(python3 - <<'PY' "$manifest_json"
import json, sys
payload = json.loads(sys.argv[1])
archive = payload.get("archive") or {}
print(archive.get("url") or archive.get("relative_path") or archive.get("filename") or "")
PY
)"
    archive_sha="$(python3 - <<'PY' "$manifest_json"
import json, sys
payload = json.loads(sys.argv[1])
archive = payload.get("archive") or {}
print(archive.get("sha256") or "")
PY
)"
  fi
  [[ -n "$archive_ref" ]] || fail "release manifest 中缺少 archive 信息。"
  archive_ref="$(resolve_ref_from_manifest "$manifest_source" "$manifest_base_dir" "$archive_ref")"
  archive_path="${INSTALL_TMPDIR}/release.tar.gz"
  fetch_to_file "$archive_ref" "$archive_path"
  if [[ -n "$archive_sha" ]]; then
    actual_sha="$(sha256_file "$archive_path")"
    [[ "$actual_sha" == "$archive_sha" ]] || fail "archive checksum 校验失败。"
  fi

  start_mode="$(resolve_start_mode "$os")"
  info "${BOLD}MotiClaw Native Installer${NC}"
  info "Manifest:      ${manifest_source}"
  info "Channel:       ${channel}"
  info "Version:       ${version}"
  info "Platform:      ${platform_key}"
  info "Install root:  ${INSTALL_ROOT}"
  info "Start mode:    ${start_mode}"

  if [[ "${DRY_RUN}" == "1" ]]; then
    warn "dry-run 模式，仅打印动作"
    exit 0
  fi

  extract_dir="${INSTALL_TMPDIR}/extracted"
  mkdir -p "$extract_dir"
  tar -xzf "$archive_path" -C "$extract_dir"
  sync_tree "$extract_dir" "$INSTALL_ROOT"

  env_file="${INSTALL_ROOT}/env/.env"
  ensure_env_file "$INSTALL_ROOT"
  upsert_env "$env_file" "MOTICLAW_HOME" "$INSTALL_ROOT"
  [[ -n "${MOTICLAW_API_HOST:-}" ]] && upsert_env "$env_file" "MOTICLAW_API_HOST" "${MOTICLAW_API_HOST}"
  [[ -n "${MOTICLAW_API_PORT:-}" ]] && upsert_env "$env_file" "MOTICLAW_API_PORT" "${MOTICLAW_API_PORT}"
  [[ -n "${MOTICLAW_WEB_HOST:-}" ]] && upsert_env "$env_file" "MOTICLAW_WEB_HOST" "${MOTICLAW_WEB_HOST}"
  [[ -n "${MOTICLAW_WEB_PORT:-}" ]] && upsert_env "$env_file" "MOTICLAW_WEB_PORT" "${MOTICLAW_WEB_PORT}"
  local effective_api_host="${MOTICLAW_API_HOST:-127.0.0.1}"
  local effective_api_port="${MOTICLAW_API_PORT:-8088}"
  upsert_env "$env_file" "OPENCLAW_API_BASE" "http://${effective_api_host}:${effective_api_port}"
  upsert_env "$env_file" "OPENCLAW_PROXY_BASE" "http://${effective_api_host}:${effective_api_port}"
  install_cli_wrapper "$INSTALL_ROOT"

  if [[ "$start_mode" == "systemd-user" ]]; then
    install_systemd_user_units "$INSTALL_ROOT" "$env_file"
  else
    start_detached_mode "$INSTALL_ROOT" "$env_file"
  fi

  set -a
  source "$env_file"
  set +a

  wait_for_http "http://${MOTICLAW_API_HOST:-127.0.0.1}:${MOTICLAW_API_PORT:-8088}/healthz" 90 || fail "后端未在预期时间内启动。"
  wait_for_http "http://${MOTICLAW_WEB_HOST:-127.0.0.1}:${MOTICLAW_WEB_PORT:-3000}/login" 90 || fail "前端未在预期时间内启动。"

  ok "安装完成"
  log ""
  log "后续命令："
  log "  ${BOLD}moticlaw status${NC}"
  log "  ${BOLD}moticlaw open${NC}"
  log "  ${BOLD}moticlaw version${NC}"
  log ""
  log "若 ${BIN_DIR} 不在 PATH，请手动加入。"
}

main "$@"
