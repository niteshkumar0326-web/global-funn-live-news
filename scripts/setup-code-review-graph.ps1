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

Write-Host "Installing Headroom local context compression gateway..." -ForegroundColor Yellow
uv tool install --python 3.13 "headroom-ai[all]"
$toolBin = uv tool dir --bin
if ($toolBin -and (Test-Path $toolBin)) {
  $env:Path = "$toolBin;$env:Path"
  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  if (($userPath -split ";") -notcontains $toolBin) {
    [Environment]::SetEnvironmentVariable("Path", (($userPath.TrimEnd(";") + ";" + $toolBin).Trim(";")), "User")
  }
}
if (Get-Command headroom -ErrorAction SilentlyContinue) {
  headroom doctor
  headroom mcp status
} else {
  Write-Warning "Headroom command is not on PATH yet. Reopen PowerShell and run: headroom doctor"
}

Write-Host "Installing Code Review Graph local index..." -ForegroundColor Yellow
uvx code-review-graph install --platform claude-code --yes
uvx code-review-graph build
uvx code-review-graph status

Write-Host "The project .mcp.json registers Headroom + Code Review Graph for Claude Code." -ForegroundColor Yellow
Write-Host "Restart Claude Code and run /mcp to verify both servers." -ForegroundColor Green
Write-Host "Optional full proxy mode: Terminal 1: headroom proxy" -ForegroundColor Cyan
Write-Host 'Terminal 2: $env:ANTHROPIC_BASE_URL="http://127.0.0.1:8787"; claude' -ForegroundColor Cyan
Write-Host "The AI Context Pocket /ai-context is the manual mobile copy/paste bridge; it does not connect to local MCP." -ForegroundColor Green
