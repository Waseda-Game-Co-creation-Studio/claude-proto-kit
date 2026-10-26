#!/usr/bin/env bash
# claude-proto-kit installer for macOS / Linux. Run once per machine; safe to run again.
#   curl -fsSL https://raw.githubusercontent.com/Waseda-Game-Co-creation-Studio/claude-proto-kit/main/install.sh | bash
# Installs whatever is missing (Node.js, Git, pnpm, Claude Code) without needing Homebrew or sudo where possible,
# then registers the proto-kit and Cloudflare plugins for this user, so every folder can use them.
set -eu

have() { command -v "$1" >/dev/null 2>&1; }
say() { printf '\n==> %s\n' "$1"; }

OS="$(uname -s)"
LOCAL="$HOME/.local"
mkdir -p "$LOCAL/bin"
export PATH="$LOCAL/node/bin:$LOCAL/bin:$PATH"

# Add a line to the shell startup files so new terminals find what we installed
persist_path() {
  line="export PATH=\"$1:\$PATH\""
  for rc in "$HOME/.zshrc" "$HOME/.bashrc"; do
    [ -f "$rc" ] || [ "$rc" = "$HOME/.zshrc" -a "$OS" = "Darwin" ] || continue
    grep -qsF "$line" "$rc" || printf '\n%s\n' "$line" >> "$rc"
  done
}

# --- Git --------------------------------------------------------------------
if ! have git; then
  if [ "$OS" = "Darwin" ]; then
    say "Installing Git (Apple Command Line Tools). A dialog will open: click Install."
    xcode-select --install || true
    echo "When that installation has finished, run this installer again."
    exit 0
  elif have apt-get; then
    say "Installing Git"
    sudo apt-get update -y && sudo apt-get install -y git
  elif have dnf; then
    sudo dnf install -y git
  else
    echo "Please install Git with your package manager, then run this again." >&2
    exit 1
  fi
fi

# --- Node.js (latest 22.x LTS, into ~/.local/node) ---------------------------
if ! have node; then
  say "Installing Node.js"
  case "$(uname -m)" in
    arm64|aarch64) arch=arm64 ;;
    *) arch=x64 ;;
  esac
  [ "$OS" = "Darwin" ] && platform=darwin || platform=linux
  version="$(curl -fsSL https://nodejs.org/dist/index.json | grep -o '"version":"v22\.[0-9.]*"' | head -1 | cut -d'"' -f4)"
  tmp="$(mktemp -d)"
  curl -fsSL "https://nodejs.org/dist/$version/node-$version-$platform-$arch.tar.gz" | tar -xz -C "$tmp"
  rm -rf "$LOCAL/node"
  mv "$tmp/node-$version-$platform-$arch" "$LOCAL/node"
  persist_path "$LOCAL/node/bin"
fi

# --- pnpm -------------------------------------------------------------------
if ! have pnpm; then
  say "Installing pnpm"
  npm install -g pnpm || curl -fsSL https://get.pnpm.io/install.sh | sh -
fi

# --- Claude Code ------------------------------------------------------------
if ! have claude; then
  say "Installing Claude Code"
  curl -fsSL https://claude.ai/install.sh | bash
  persist_path "$LOCAL/bin"
fi

# --- Plugins ----------------------------------------------------------------
say "Registering the proto-kit and Cloudflare plugins"
claude plugin marketplace add https://github.com/Waseda-Game-Co-creation-Studio/claude-proto-kit.git || true
claude plugin install proto-kit@claude-proto-kit
claude plugin marketplace add cloudflare/skills || true
claude plugin install cloudflare@cloudflare

# --- Default instructions for Claude in every folder (never overwrite) -------
CLAUDE_MD="$HOME/.claude/CLAUDE.md"
if [ -e "$CLAUDE_MD" ]; then
  echo "Kept your existing $CLAUDE_MD (not changed)."
else
  mkdir -p "$HOME/.claude"
  curl -fsSL -o "$CLAUDE_MD" \
    https://raw.githubusercontent.com/Waseda-Game-Co-creation-Studio/claude-proto-kit/main/home/CLAUDE.md
  echo "Placed default instructions at $CLAUDE_MD (edit it freely)."
fi

echo
echo "Done. Open a NEW terminal, then:"
echo "  1. Type  claude  and log in (first time only)"
echo "  2. Tell Claude what you want, e.g.  \"Make a spinning 3D cube and publish it\""
