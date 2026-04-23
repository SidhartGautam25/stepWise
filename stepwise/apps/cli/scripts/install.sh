#!/usr/bin/env bash
# StepWise CLI Native Installer
# Usage: curl -fsSL https://stepwise.run/install.sh | bash

set -euo pipefail

echo "Installing StepWise CLI..."

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m | tr '[:upper:]' '[:lower:]')"

case "$ARCH" in
  x86_64|amd64) ARCH="x64" ;;
  aarch64|arm64) ARCH="arm64" ;;
  *)
    echo "Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

case "$OS" in
  darwin) OS="macos" ;;
  linux) OS="linux" ;;
  *)
    echo "Unsupported OS: $OS"
    exit 1
    ;;
esac

BINARY_NAME="stepwise-${OS}-${ARCH}"
DOWNLOAD_URL="https://github.com/your-org/stepwise/releases/latest/download/${BINARY_NAME}"
INSTALL_DIR="${STEPWISE_INSTALL_DIR:-$HOME/.local/bin}"
DEST_PATH="${INSTALL_DIR}/stepwise"
TEMP_PATH="${INSTALL_DIR}/stepwise.tmp"

echo "Downloading ${BINARY_NAME}..."
mkdir -p "$INSTALL_DIR"
rm -f "$TEMP_PATH"
curl -fsSL "$DOWNLOAD_URL" -o "$TEMP_PATH"
chmod +x "$TEMP_PATH"
rm -f "$DEST_PATH"
mv "$TEMP_PATH" "$DEST_PATH"

case ":$PATH:" in
  *":$INSTALL_DIR:"*) ;;
  *)
    PROFILE=""
    if [ -n "${ZSH_VERSION:-}" ]; then
      PROFILE="$HOME/.zshrc"
    elif [ -n "${BASH_VERSION:-}" ]; then
      PROFILE="$HOME/.bashrc"
    elif [ -f "$HOME/.profile" ]; then
      PROFILE="$HOME/.profile"
    else
      PROFILE="$HOME/.profile"
    fi

    if ! grep -qs "$INSTALL_DIR" "$PROFILE" 2>/dev/null; then
      {
        echo ""
        echo "# StepWise CLI"
        echo "export PATH=\"$INSTALL_DIR:\$PATH\""
      } >> "$PROFILE"
    fi

    export PATH="$INSTALL_DIR:$PATH"
    echo "Added ${INSTALL_DIR} to ${PROFILE}."
    ;;
esac

echo ""
echo "Installation complete."
echo "Run: stepwise login"
echo ""
