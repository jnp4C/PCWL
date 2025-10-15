#!/usr/bin/env bash
set -euo pipefail

log() {
  echo "[install-docker] $*"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "Missing required command: $1"
    return 1
  fi
}

install_linux() {
  if ! command -v curl >/dev/null 2>&1; then
    log "curl is required to fetch Docker's convenience script. Install curl and re-run."
    exit 1
  fi

  tmp_script="$(mktemp)"
  trap 'rm -f "$tmp_script"' EXIT

  log "Downloading Docker convenience script..."
  curl -fsSL https://get.docker.com -o "$tmp_script"

  log "Running Docker installation script (requires sudo)..."
  sudo sh "$tmp_script"

  log "Enabling Docker service..."
  if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl enable docker
    sudo systemctl start docker
  fi

  log "Adding current user (${USER}) to docker group..."
  if getent group docker >/dev/null 2>&1; then
    sudo usermod -aG docker "$USER"
    log "Log out/in for group membership to take effect."
  fi
}

install_macos() {
  if command -v brew >/dev/null 2>&1; then
    log "Installing Docker Desktop via Homebrew..."
    brew install --cask docker
    log "Launch Docker Desktop from Applications to finish setup."
  else
    log "Homebrew not found. Install Homebrew or download Docker Desktop manually:"
    log "https://www.docker.com/products/docker-desktop/"
    exit 1
  fi
}

main() {
  if [[ "$(id -u)" -eq 0 ]]; then
    log "Run this script as a regular user with sudo privileges, not root."
    exit 1
  fi

  uname_out="$(uname -s | tr '[:upper:]' '[:lower:]')"
  case "$uname_out" in
    linux*)
      install_linux
      ;;
    darwin*)
      install_macos
      ;;
    *)
      log "Unsupported OS: $uname_out. Install Docker manually from https://docs.docker.com/engine/install/"
      exit 1
      ;;
  esac

  log "Docker installation script completed."
}

main "$@"
