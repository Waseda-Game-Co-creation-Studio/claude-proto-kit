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

if (((-not (Have node)) -or (-not (Have git))) -and (-not (Have winget))) {
  Write-Host 'winget (App Installer) was not found. Install "App Installer" from the Microsoft Store, then run this again.'
  return
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

# Default instructions for Claude in every folder (beginner-friendly). Never overwrite an existing file.
$claudeDir = Join-Path $HOME '.claude'
$claudeMd = Join-Path $claudeDir 'CLAUDE.md'
if (Test-Path $claudeMd) {
  Write-Host "Kept your existing $claudeMd (not changed)."
} else {
  New-Item -ItemType Directory -Force $claudeDir | Out-Null
  Invoke-WebRequest -UseBasicParsing -OutFile $claudeMd `
    -Uri 'https://raw.githubusercontent.com/Waseda-Game-Co-creation-Studio/claude-proto-kit/main/home/CLAUDE.md'
  Write-Host "Placed default instructions at $claudeMd (edit it freely)."
}

Write-Host ''
Write-Host 'Done. Open a NEW PowerShell window, then:'
Write-Host '  1. Type  claude  and log in (first time only)'
Write-Host '  2. Tell Claude what you want, e.g.  "Make a spinning 3D cube and publish it"'
