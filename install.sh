#!/usr/bin/env bash
# claude-proto-kit installer for macOS / Linux. Run once per machine; safe to run again.
#   curl -fsSL https://raw.githubusercontent.com/Waseda-Game-Co-creation-Studio/claude-proto-kit/main/install.sh | bash
# Installs Node.js, Git, pnpm and Claude Code if missing, then the proto-kit and Cloudflare plugins at user level,
# so every repository can use them without any per-repo setup.
set -eu

have() { command -v "$1" >/dev/null 2>&1; }

if [ "$(uname)" = "Darwin" ] && have brew; then
  have node || brew install node
  have git  || brew install git
fi
if ! have node || ! have git; then
  echo "Please install Node.js (20.19+ or 22.13+) and Git, then run this again." >&2
  exit 1
fi

have pnpm || npm install -g pnpm
if ! have claude; then
  curl -fsSL https://claude.ai/install.sh | bash
fi
export PATH="$HOME/.local/bin:$PATH"

claude plugin marketplace add https://github.com/Waseda-Game-Co-creation-Studio/claude-proto-kit.git || true
claude plugin install proto-kit@claude-proto-kit
claude plugin marketplace add cloudflare/skills || true
claude plugin install cloudflare@cloudflare

echo
echo "Done. Next:"
echo "  1. Log in:  claude   and   npx wrangler login   (approve in the browser within 2 minutes)"
echo "  2. Open any folder (even an empty one) in Claude Code and type:  /new web hello"
echo "     The folder is set up automatically the first time."
