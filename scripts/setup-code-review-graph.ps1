$ErrorActionPreference = "Stop"

Write-Host "GLOBAL FUNN - Token Saver + Code Intelligence setup" -ForegroundColor Cyan

if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
  throw "Python launcher 'py' not found. Install Python 3.10+ and reopen PowerShell."
}

py -m pip install --user --upgrade uv
$scripts = py -c "import sysconfig; print(sysconfig.get_path('scripts', 'nt_user'))"
if ($scripts -and (Test-Path $scripts)) {
  $env:Path = "$scripts;$env:Path"
  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  if (($userPath -split ";") -notcontains $scripts) {
    [Environment]::SetEnvironmentVariable("Path", (($userPath.TrimEnd(";") + ";" + $scripts).Trim(";")), "User")
  }
}
if (-not (Get-Command uvx -ErrorAction SilentlyContinue)) {
  throw "uvx was not found after installing uv. Close and reopen PowerShell, then run this script again."
}

# RTK compresses terminal command output before Claude Code reads it.
if (Get-Command winget -ErrorAction SilentlyContinue) {
  if (-not (Get-Command rtk -ErrorAction SilentlyContinue)) {
    Write-Host "Installing RTK command-output compressor..." -ForegroundColor Yellow
    winget install --id rtk-ai.rtk --exact --silent --accept-package-agreements --accept-source-agreements
  }
  $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
  if (Get-Command rtk -ErrorAction SilentlyContinue) {
    rtk init -g --hook-only
    rtk --version
  } else {
    Write-Warning "RTK installation was not detected in this PowerShell session. Reopen PowerShell and run: rtk init -g --hook-only"
  }
} else {
  Write-Warning "winget not found. Install RTK manually from https://github.com/rtk-ai/rtk then run: rtk init -g --hook-only"
}

Write-Host "Installing Code Review Graph local index..." -ForegroundColor Yellow
uvx code-review-graph install --platform claude-code --yes
uvx code-review-graph build
uvx code-review-graph status

Write-Host "Context Saver is configured in the repository .mcp.json and will be fetched by npx when Claude Code starts." -ForegroundColor Yellow
Write-Host "Restart Claude Code, open this repository, and run /mcp to check code-review-graph and context-saver." -ForegroundColor Green
