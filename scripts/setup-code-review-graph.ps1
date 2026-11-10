$ErrorActionPreference = "Stop"

Write-Host "GLOBAL FUNN - Code Review Graph setup" -ForegroundColor Cyan

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

Write-Host "Installing Claude Code project MCP configuration and update hooks..." -ForegroundColor Yellow
uvx code-review-graph install --platform claude-code --yes

Write-Host "Building the local code graph (first run may take a little time)..." -ForegroundColor Yellow
uvx code-review-graph build
uvx code-review-graph status

Write-Host "Setup complete. Restart Claude Code and run /mcp to confirm code-review-graph is connected." -ForegroundColor Green
