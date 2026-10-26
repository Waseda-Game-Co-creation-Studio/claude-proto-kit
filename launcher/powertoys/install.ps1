# PowerToys Run 用ランチャーをビルドして配置し、PowerToys を再起動する。
# 実行: powershell -ExecutionPolicy Bypass -File .\install.ps1
$ErrorActionPreference = 'Stop'

$ptDir = @("$env:LOCALAPPDATA\PowerToys", "$env:ProgramFiles\PowerToys") |
  Where-Object { Test-Path "$_\Wox.Plugin.dll" } | Select-Object -First 1
if (-not $ptDir) { Write-Host 'PowerToys が見つからないのでランチャーはスキップします。'; exit 0 }
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue) -or -not (& dotnet --list-sdks 2>$null)) { Write-Host '.NET SDK が無いのでランチャーはスキップします。'; exit 0 }

$out = Join-Path $env:TEMP 'claude-launcher-build'
dotnet build "$PSScriptRoot\ClaudeLauncher.csproj" -c Release -o $out "-p:PowerToysDir=$ptDir" --nologo -v q
if ($LASTEXITCODE -ne 0) { throw 'ランチャーのビルドに失敗しました。' }

# 読み込み中の DLL は上書きできないので、PowerToys を止めてから入れ替える
$ptExe = Join-Path $ptDir 'PowerToys.exe'
Get-Process -Name 'PowerToys*' -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

$dest = "$env:LOCALAPPDATA\Microsoft\PowerToys\PowerToys Run\Plugins\ClaudeLauncher"
New-Item -ItemType Directory -Force $dest | Out-Null
Copy-Item "$out\Community.PowerToys.Run.Plugin.ClaudeLauncher.dll", "$out\plugin.json" $dest -Force
Copy-Item "$out\Images" $dest -Recurse -Force

Start-Process $ptExe
Write-Host "ランチャーを配置しました: $dest"
