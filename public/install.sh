#!/usr/bin/env bash
set -euo pipefail

SCRIPT_PATH="${BASH_SOURCE[0]:-${0:-}}"
if [[ -n "$SCRIPT_PATH" && "$SCRIPT_PATH" != "bash" && "$SCRIPT_PATH" != "-bash" && -e "$SCRIPT_PATH" ]]; then
  ROOT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
else
  ROOT_DIR=""
fi
INSTALL_ROOT="${MOTICLAW_INSTALL_DIR:-${HOME}/.local/share/moticlaw/current}"
BIN_DIR="${MOTICLAW_BIN_DIR:-${HOME}/.local/bin}"
START_MODE="${MOTICLAW_INSTALL_MODE:-auto}"
DRY_RUN="${MOTICLAW_DRY_RUN:-0}"
MANIFEST_URL="${MOTICLAW_RELEASE_MANIFEST_URL:-}"
MANIFEST_FILE="${MOTICLAW_RELEASE_MANIFEST_FILE:-}"
ARCHIVE_OVERRIDE="${MOTICLAW_RELEASE_ARCHIVE:-}"
PROGRESS_MODE="${MOTICLAW_PROGRESS:-auto}"
INSTALL_TMPDIR=""
INSTALL_STAGE_TOTAL=8
INSTALL_STAGE_INDEX=0

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
progress_enabled() {
  case "${PROGRESS_MODE}" in
    always) return 0 ;;
    never) return 1 ;;
    *) [[ -t 1 || -t 2 ]] ;;
  esac
}
step() {
  INSTALL_STAGE_INDEX=$((INSTALL_STAGE_INDEX + 1))
  info "[${INSTALL_STAGE_INDEX}/${INSTALL_STAGE_TOTAL}] $*"
}
clear_progress_line() {
  if progress_enabled; then
    printf '\r\033[K'
  fi
}
render_progress_bar() {
  local current="$1"
  local total="$2"
  local label="$3"
  local width=28
  local filled=0
  local percent=100
  if [[ "${total}" -gt 0 ]]; then
    if [[ "${current}" -lt 0 ]]; then
      current=0
    elif [[ "${current}" -gt "${total}" ]]; then
      current="${total}"
    fi
    filled=$(( current * width / total ))
    percent=$(( current * 100 / total ))
  fi
  local empty=$(( width - filled ))
  printf '\r\033[K%s [%s%s] %3d%%' \
    "${label}" \
    "$(printf '%*s' "${filled}" '' | tr ' ' '#')" \
    "$(printf '%*s' "${empty}" '' | tr ' ' '-')" \
    "${percent}"
}

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
  local curl_args=(
    --fail
    --location
    --retry 3
    --retry-all-errors
    --retry-delay 2
    --continue-at -
  )
  if progress_enabled; then
    curl_args+=(--progress-bar)
  else
    curl_args+=(--silent --show-error)
  fi
  curl "${curl_args[@]}" "$source_ref" -o "$target_file"
  clear_progress_line
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
    "build": artifact.get("build") or payload.get("build") or {},
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

metadata_field() {
  local metadata_file="$1"
  local field_name="$2"
  if [[ ! -f "$metadata_file" ]]; then
    return 0
  fi
  python3 - <<'PY' "$metadata_file" "$field_name"
from pathlib import Path
import json
import sys

payload = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
value = payload.get(sys.argv[2])
if value is None:
    raise SystemExit(0)
print(value)
PY
}

extract_archive_with_progress() {
  local archive_path="$1"
  local target_dir="$2"
  local label="${3:-解压安装包}"
  local lower_archive
  lower_archive="$(printf '%s' "$archive_path" | tr '[:upper:]' '[:lower:]')"
  local list_flags=""
  local extract_flags=""
  case "$lower_archive" in
    *.tar.gz|*.tgz)
      list_flags="tzf"
      extract_flags="xzf"
      ;;
    *.tar.xz|*.txz)
      list_flags="tJf"
      extract_flags="xJf"
      ;;
    *.tar)
      list_flags="tf"
      extract_flags="xf"
      ;;
    *.zip)
      python3 - <<'PY' "$archive_path" "$target_dir" "$label" "$PROGRESS_MODE"
from pathlib import Path
import os
import sys
import zipfile

archive_path = Path(sys.argv[1])
target_dir = Path(sys.argv[2])
label = sys.argv[3]
mode = sys.argv[4]
interactive = mode == "always" or (mode == "auto" and (sys.stdout.isatty() or sys.stderr.isatty()))


def render(current: int, total: int) -> None:
    if not interactive:
        return
    width = 28
    percent = 100 if total <= 0 else int(current * 100 / total)
    filled = width if total <= 0 else int(current * width / total)
    bar = "#" * filled + "-" * (width - filled)
    sys.stdout.write(f"\r\033[K{label} [{bar}] {percent:3d}%")
    sys.stdout.flush()


with zipfile.ZipFile(archive_path) as zf:
    infos = zf.infolist()
    total = len(infos)
    target_dir.mkdir(parents=True, exist_ok=True)
    for index, info in enumerate(infos, start=1):
        zf.extract(info, target_dir)
        render(index, total)

if interactive:
    sys.stdout.write("\r\033[K")
    sys.stdout.flush()
PY
      return
      ;;
    *)
      fail "不支持的压缩包格式：$archive_path"
      ;;
  esac

  if progress_enabled; then
    local raw_total
    raw_total="$(tar "-${list_flags}" "$archive_path" | wc -l | tr -d '[:space:]')"
    if [[ -n "${raw_total}" && "${raw_total}" -gt 0 ]]; then
      local current=0
      tar "-${extract_flags}" "$archive_path" -C "$target_dir" 2>/dev/null | while IFS= read -r _; do
        current=$((current + 1))
        render_progress_bar "$current" "$raw_total" "$label"
      done
      clear_progress_line
      return
    fi
  fi
  tar "-${extract_flags}" "$archive_path" -C "$target_dir"
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

read_release_build_value() {
  local release_root="$1"
  local key="$2"
  python3 - <<'PY' "$release_root" "$key"
from pathlib import Path
import json
import sys

release_root = Path(sys.argv[1])
key = sys.argv[2]
path = release_root / "web" / "release-build.json"
if not path.exists():
    raise SystemExit(0)
try:
    payload = json.loads(path.read_text(encoding="utf-8"))
except Exception:
    raise SystemExit(0)
value = payload.get(key)
if isinstance(value, str):
    print(value)
PY
}

resolve_node_archive_name() {
  local os="$1"
  local arch="$2"
  local version="$3"
  case "${os}:${arch}" in
    darwin:x64) printf 'node-%s-darwin-x64.tar.gz\n' "$version" ;;
    darwin:arm64) printf 'node-%s-darwin-arm64.tar.gz\n' "$version" ;;
    linux:x64) printf 'node-%s-linux-x64.tar.xz\n' "$version" ;;
    linux:arm64) printf 'node-%s-linux-arm64.tar.xz\n' "$version" ;;
    *) return 1 ;;
  esac
}

ensure_node_runtime() {
  local install_root="$1"
  local os="$2"
  local arch="$3"
  if [[ -x "${install_root}/web/node/bin/node" || -x "${install_root}/web/node/bin/node.exe" ]]; then
    return 0
  fi
  if command -v node >/dev/null 2>&1; then
    return 0
  fi

  local runtime_version runtime_base_url archive_name archive_url archive_path extract_root extracted_dir
  runtime_version="${MOTICLAW_RUNTIME_NODE_VERSION:-$(read_release_build_value "$install_root" "runtime_node_version")}"
  runtime_base_url="${MOTICLAW_RUNTIME_NODE_BASE_URL:-$(read_release_build_value "$install_root" "runtime_node_base_url")}"
  runtime_version="${runtime_version:-v22.17.0}"
  runtime_base_url="${runtime_base_url:-https://nodejs.org/dist}"
  archive_name="$(resolve_node_archive_name "$os" "$arch" "$runtime_version")" || fail "当前平台缺少可下载的 Node 预编译包：${os}-${arch}"
  archive_url="${runtime_base_url%/}/${runtime_version}/${archive_name}"
  archive_path="${INSTALL_TMPDIR}/${archive_name}"

  info "未检测到系统 Node，正在下载官方运行时：${archive_name}"
  fetch_to_file "$archive_url" "$archive_path"

  extract_root="${INSTALL_TMPDIR}/node-runtime"
  rm -rf "$extract_root" "${install_root}/web/node"
  mkdir -p "$extract_root" "${install_root}/web"
  extract_archive_with_progress "$archive_path" "$extract_root" "解压 Node 运行时"
  extracted_dir="$(find "$extract_root" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
  [[ -n "${extracted_dir:-}" ]] || fail "Node 运行时解压失败：${archive_name}"
  mv "$extracted_dir" "${install_root}/web/node"
  [[ -x "${install_root}/web/node/bin/node" ]] || fail "Node 运行时安装失败：未找到 node 可执行文件"
  ok "已安装内置 Node 运行时：$("${install_root}/web/node/bin/node" --version)"
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
  if [[ -n "$ROOT_DIR" && -f "${ROOT_DIR}/deploy/systemd/user/moticlaw-api.service.tmpl" ]]; then
    render_systemd_unit "${ROOT_DIR}/deploy/systemd/user/moticlaw-api.service.tmpl" "${unit_root}/moticlaw-api.service" "$install_root" "$env_file"
    render_systemd_unit "${ROOT_DIR}/deploy/systemd/user/moticlaw-web.service.tmpl" "${unit_root}/moticlaw-web.service" "$install_root" "$env_file"
    cp "${ROOT_DIR}/deploy/systemd/user/moticlaw.target" "${unit_root}/moticlaw.target"
  else
    cat > "${unit_root}/moticlaw-api.service" <<EOF
[Unit]
Description=MotiClaw Local API
After=network.target

[Service]
Type=simple
WorkingDirectory=${install_root}
EnvironmentFile=${env_file}
ExecStart=${install_root}/deploy/linux/run-api.sh
Restart=always
RestartSec=2

[Install]
WantedBy=default.target
EOF
    cat > "${unit_root}/moticlaw-web.service" <<EOF
[Unit]
Description=MotiClaw Local Web
After=network.target moticlaw-api.service
Requires=moticlaw-api.service

[Service]
Type=simple
WorkingDirectory=${install_root}
EnvironmentFile=${env_file}
ExecStart=${install_root}/deploy/linux/run-web.sh
Restart=always
RestartSec=2

[Install]
WantedBy=default.target
EOF
    cat > "${unit_root}/moticlaw.target" <<EOF
[Unit]
Description=MotiClaw Local Stack
Wants=moticlaw-api.service moticlaw-web.service
After=moticlaw-api.service moticlaw-web.service
EOF
  fi
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

start_background_process() {
  local install_root="$1"
  local log_file="$2"
  local pid_file="$3"
  shift 3
  python3 - <<'PY' "$install_root" "$log_file" "$pid_file" "$@"
from pathlib import Path
import os
import subprocess
import sys

cwd = sys.argv[1]
log_path = Path(sys.argv[2])
pid_path = Path(sys.argv[3])
cmd = sys.argv[4:]

log_path.parent.mkdir(parents=True, exist_ok=True)
pid_path.parent.mkdir(parents=True, exist_ok=True)

with log_path.open("ab", buffering=0) as log_file:
    process = subprocess.Popen(
        cmd,
        cwd=cwd,
        env=os.environ.copy(),
        stdin=subprocess.DEVNULL,
        stdout=log_file,
        stderr=subprocess.STDOUT,
        start_new_session=True,
        close_fds=True,
    )

pid_path.write_text(f"{process.pid}\n", encoding="utf-8")
PY
}

start_detached_mode() {
  local install_root="$1"
  local env_file="$2"
  stop_detached_mode "$install_root"
  mkdir -p "${install_root}/logs" "${install_root}/run"
  set -a
  source "$env_file"
  set +a
  start_background_process "$install_root" "${install_root}/logs/install-api.log" "${install_root}/run/api.pid" \
    "${install_root}/deploy/linux/run-api.sh"
  start_background_process "$install_root" "${install_root}/logs/install-web.log" "${install_root}/run/web.pid" \
    "${install_root}/deploy/linux/run-web.sh"
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
  local label="${3:-等待服务启动}"
  local deadline=$((SECONDS + timeout_sec))
  while [[ "$SECONDS" -lt "$deadline" ]]; do
    if curl -fsS "$url" >/dev/null 2>&1; then
      clear_progress_line
      return 0
    fi
    if progress_enabled; then
      local elapsed=$((timeout_sec - (deadline - SECONDS)))
      render_progress_bar "$elapsed" "$timeout_sec" "$label"
    fi
    sleep 1
  done
  clear_progress_line
  return 1
}

main() {
  local os arch platform_key manifest_source manifest_base_dir manifest_path manifest_json archive_ref archive_sha archive_path extract_dir env_file start_mode version channel build_sha build_time build_branch installed_build_sha installed_build_time installed_build_branch installed_platform
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
  step "读取发布清单"
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
  build_sha="$(python3 - <<'PY' "$manifest_json"
import json, sys
payload = json.loads(sys.argv[1])
build = payload.get("build") or {}
print(build.get("git_sha") or "")
PY
)"
  build_time="$(python3 - <<'PY' "$manifest_json"
import json, sys
payload = json.loads(sys.argv[1])
build = payload.get("build") or {}
print(build.get("build_time") or "")
PY
)"
  build_branch="$(python3 - <<'PY' "$manifest_json"
import json, sys
payload = json.loads(sys.argv[1])
build = payload.get("build") or {}
print(build.get("git_branch") or "")
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
  step "下载安装包"
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
  [[ -n "${build_sha:-}" ]] && info "Build SHA:     ${build_sha}"
  [[ -n "${build_branch:-}" ]] && info "Build branch:  ${build_branch}"
  [[ -n "${build_time:-}" ]] && info "Build time:    ${build_time}"

  if [[ "${DRY_RUN}" == "1" ]]; then
    warn "dry-run 模式，仅打印动作"
    exit 0
  fi

  extract_dir="${INSTALL_TMPDIR}/extracted"
  mkdir -p "$extract_dir"
  step "解压安装包"
  extract_archive_with_progress "$archive_path" "$extract_dir" "解压安装包"
  step "同步安装文件"
  sync_tree "$extract_dir" "$INSTALL_ROOT"
  step "检查 Node 运行环境"
  ensure_node_runtime "$INSTALL_ROOT" "$os" "$arch"

  env_file="${INSTALL_ROOT}/env/.env"
  step "写入本地配置"
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

  step "启动本地服务"
  if [[ "$start_mode" == "systemd-user" ]]; then
    install_systemd_user_units "$INSTALL_ROOT" "$env_file"
  else
    start_detached_mode "$INSTALL_ROOT" "$env_file"
  fi

  set -a
  source "$env_file"
  set +a

  step "等待服务就绪"
  wait_for_http "http://${MOTICLAW_API_HOST:-127.0.0.1}:${MOTICLAW_API_PORT:-8088}/healthz" 90 "等待后端启动" || fail "后端未在预期时间内启动。"
  wait_for_http "http://${MOTICLAW_WEB_HOST:-127.0.0.1}:${MOTICLAW_WEB_PORT:-3000}/login" 90 "等待前端启动" || fail "前端未在预期时间内启动。"

  installed_build_sha="$(metadata_field "${INSTALL_ROOT}/release-metadata.json" git_sha)"
  installed_build_time="$(metadata_field "${INSTALL_ROOT}/release-metadata.json" build_time)"
  installed_build_branch="$(metadata_field "${INSTALL_ROOT}/release-metadata.json" git_branch)"
  installed_platform="$(metadata_field "${INSTALL_ROOT}/release-metadata.json" platform)"

  ok "安装完成"
  log ""
  [[ -n "${installed_build_sha:-}" ]] && log "已安装构建：${BOLD}${installed_build_sha}${NC}"
  [[ -n "${installed_build_branch:-}" ]] && log "构建分支：${installed_build_branch}"
  [[ -n "${installed_build_time:-}" ]] && log "构建时间：${installed_build_time}"
  [[ -n "${installed_platform:-}" ]] && log "构建平台：${installed_platform}"
  log ""
  log "后续命令："
  log "  ${BOLD}moticlaw status${NC}"
  log "  ${BOLD}moticlaw open${NC}"
  log "  ${BOLD}moticlaw version${NC}"
  log ""
  log "若 ${BIN_DIR} 不在 PATH，请手动加入。"
}

main "$@"
