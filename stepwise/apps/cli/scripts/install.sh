#!/usr/bin/env bash
# StepWise CLI Native Installer
# Usage: curl -fsSL https://stepwise.run/install.sh | bash

set -e

echo "  🚀 Installing StepWise CLI..."

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

# Normalize architecture to pkg target mappings
if [ "$ARCH" = "x86_64" ] || [ "$ARCH" = "amd64" ]; then
  ARCH="x64"
elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
  ARCH="arm64"
else
  echo "Unsupported architecture: $ARCH"
  exit 1
fi

if [ "$OS" = "darwin" ]; then
  OS="macos"
fi

BINARY_NAME="stepwise-${OS}-${ARCH}"
# In a real environment, you'd replace github.com/.../releases/latest with your actual host!
DOWNLOAD_URL="https://github.com/your-org/stepwise/releases/latest/download/${BINARY_NAME}"
INSTALL_DIR="/usr/local/bin"

echo "  ↓ Downloading for ${OS}-${ARCH}..."

# Download the executable
curl -fsSL "$DOWNLOAD_URL" -o /tmp/stepwise
chmod +x /tmp/stepwise

# Securely move to path
echo "  📦 Moving to ${INSTALL_DIR} (may require sudo)..."
if [ -w "$INSTALL_DIR" ]; then
  mv /tmp/stepwise "$INSTALL_DIR/stepwise"
else
  sudo mv /tmp/stepwise "$INSTALL_DIR/stepwise"
fi

echo ""
echo "  ✅ Installation Complete!"
echo "  Try running: stepwise login"
echo ""
