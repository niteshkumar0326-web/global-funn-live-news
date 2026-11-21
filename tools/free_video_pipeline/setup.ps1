param(
  [switch]$InstallFfmpeg
)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

Write-Host "GLOBAL FUNN free-first production setup" -ForegroundColor Cyan

if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
  throw "Python launcher 'py' was not found. Install Python 3.11+ from https://www.python.org/downloads/windows/"
}

if (-not (Test-Path ".venv")) {
  py -m venv .venv
}
& ".\.venv\Scripts\python.exe" -m pip install --upgrade pip
& ".\.venv\Scripts\python.exe" -m pip install -r requirements.txt

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
  if ($InstallFfmpeg -and (Get-Command winget -ErrorAction SilentlyContinue)) {
    winget install --id Gyan.FFmpeg.Shared --exact --accept-package-agreements --accept-source-agreements
    Write-Host "FFmpeg installation requested. Reopen PowerShell so PATH refreshes." -ForegroundColor Yellow
  } else {
    Write-Host "FFmpeg is not on PATH. Install a Windows build from https://ffmpeg.org/download.html" -ForegroundColor Yellow
    Write-Host "Then add the extracted bin folder (containing ffmpeg.exe and ffprobe.exe) to PATH."
  }
} else {
  ffmpeg -version | Select-Object -First 1
  ffprobe -version | Select-Object -First 1
}

New-Item -ItemType Directory -Force -Path "output","assets\images" | Out-Null
Write-Host "Setup completed. Put the approved script in script.txt and images in assets\images." -ForegroundColor Green
