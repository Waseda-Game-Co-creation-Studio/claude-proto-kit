# claude-proto-kit installer for Windows. Run once per PC; safe to run again.
#   irm https://raw.githubusercontent.com/Waseda-Game-Co-creation-Studio/claude-proto-kit/main/install.ps1 | iex
# Installs Node.js, Git, pnpm and Claude Code if missing, then the proto-kit and Cloudflare plugins at user level,
# so every repository can use them without any per-repo setup.

function Have($name) { [bool](Get-Command $name -ErrorAction SilentlyContinue) }
function Refresh-Path {
  $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
              [Environment]::GetEnvironmentVariable('Path', 'User') + ';' +
              "$HOME\.local\bin"
}
function Winget-Install($id) {
  winget install -e --id $id --accept-source-agreements --accept-package-agreements
  Refresh-Path
}

if (-not (Have node)) { Winget-Install 'OpenJS.NodeJS.LTS' }
if (-not (Have git))  { Winget-Install 'Git.Git' }
if (-not (Have pnpm)) { npm install -g pnpm; Refresh-Path }
if (-not (Have claude)) {
  Invoke-RestMethod https://claude.ai/install.ps1 | Invoke-Expression
  Refresh-Path
}

claude plugin marketplace add https://github.com/Waseda-Game-Co-creation-Studio/claude-proto-kit.git
claude plugin install proto-kit@claude-proto-kit
claude plugin marketplace add cloudflare/skills
claude plugin install cloudflare@cloudflare

Write-Host ''
Write-Host 'Done. Next:'
Write-Host '  1. Log in:  claude   and   npx wrangler login   (approve in the browser within 2 minutes)'
Write-Host '  2. Open any folder (even an empty one) in Claude Code and type:  /new web hello'
Write-Host '     The folder is set up automatically the first time.'
