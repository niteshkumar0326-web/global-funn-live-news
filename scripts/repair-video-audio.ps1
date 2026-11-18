[CmdletBinding()]
param(
  [Parameter(Mandatory=$true,Position=0)]
  [ValidateNotNullOrEmpty()]
  [string]$InputPath,
  [string]$OutputDirectory = "",
  [switch]$Normalize
)

$ErrorActionPreference = "Stop"
$videoExtensions = @(".mp4",".mov",".mkv",".webm",".m4v",".avi")

function Find-Tool([string]$Name) {
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $cmd) { throw "$Name was not found. Install FFmpeg (ffmpeg + ffprobe) and add its bin folder to PATH." }
  return $cmd.Source
}

$ffmpeg = Find-Tool "ffmpeg"
$ffprobe = Find-Tool "ffprobe"
if (-not (Test-Path -LiteralPath $InputPath)) { throw "Input path not found: $InputPath" }

$resolvedInput = (Resolve-Path -LiteralPath $InputPath).Path
$inputItem = Get-Item -LiteralPath $resolvedInput
$items = if ($inputItem.PSIsContainer) {
  @(Get-ChildItem -LiteralPath $resolvedInput -Recurse -File | Where-Object { $videoExtensions -contains $_.Extension.ToLowerInvariant() })
} else {
  if ($videoExtensions -notcontains $inputItem.Extension.ToLowerInvariant()) { throw "Unsupported video extension: $($inputItem.Extension)" }
  @($inputItem)
}
if ($items.Count -eq 0) { throw "No supported video files found." }

if (-not $OutputDirectory) {
  $parent = if ($inputItem.PSIsContainer) { $resolvedInput } else { Split-Path -Parent $resolvedInput }
  $OutputDirectory = Join-Path $parent "audio-qc-output"
}
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

$report = foreach ($file in $items) {
  Write-Host "`nChecking: $($file.Name)" -ForegroundColor Cyan
  $probeText = & $ffprobe -v error -show_entries "format=duration:stream=index,codec_type,codec_name,sample_rate,channels,channel_layout" -of json "$($file.FullName)" 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "ffprobe failed for $($file.Name)"
    [pscustomobject]@{File=$file.Name;DurationSeconds="";AudioCodec="";SampleRate="";Channels="";MeanVolumeDb="";PeakVolumeDb="";Status="FAIL: ffprobe could not read file";Output=""}
    continue
  }

  $probe = ($probeText -join "`n") | ConvertFrom-Json
  $audio = @($probe.streams | Where-Object { $_.codec_type -eq "audio" })
  $duration = if ($probe.format.duration) { [math]::Round([double]$probe.format.duration,2) } else { "" }

  if ($audio.Count -eq 0) {
    Write-Warning "NO AUDIO STREAM — cannot repair by normalization."
    [pscustomobject]@{File=$file.Name;DurationSeconds=$duration;AudioCodec="NONE";SampleRate="";Channels="";MeanVolumeDb="";PeakVolumeDb="";Status="FAIL: no audio stream";Output=""}
    continue
  }

  $audioInfo = $audio[0]
  $measureText = & $ffmpeg -hide_banner -i "$($file.FullName)" -map 0:a:0 -af volumedetect -f null NUL 2>&1
  $measure = $measureText -join "`n"
  $meanMatch = [regex]::Match($measure,'mean_volume:\\s*(-?inf|-?[0-9.]+) dB')
  $peakMatch = [regex]::Match($measure,'max_volume:\\s*(-?inf|-?[0-9.]+) dB')
  $mean = if ($meanMatch.Success) { $meanMatch.Groups[1].Value } else { "unknown" }
  $peak = if ($peakMatch.Success) { $peakMatch.Groups[1].Value } else { "unknown" }
  $status = "PASS: audio stream detected"
  $output = ""

  if ($mean -eq "-inf" -or ($mean -match '^-?[0-9.]+$' -and [double]$mean -lt -50)) {
    $status = "FAIL: audio is silent or extremely quiet; do not normalize noise blindly"
    Write-Warning $status
  } elseif ($mean -eq "unknown") {
    $status = "CHECK: audio stream exists but level analysis was unavailable"
  } else {
    Write-Host "Audio: $($audioInfo.codec_name), $($audioInfo.sample_rate) Hz, $($audioInfo.channels) channel(s); mean $mean dB; peak $peak dB" -ForegroundColor Green
  }

  if ($Normalize -and $status -like "PASS:*") {
    $base = [IO.Path]::GetFileNameWithoutExtension($file.Name)
    $candidate = Join-Path $OutputDirectory ($base + "_audio_repaired.mp4")
    if (Test-Path -LiteralPath $candidate) {
      $suffix = Get-Date -Format "yyyyMMdd-HHmmss"
      $candidate = Join-Path $OutputDirectory ($base + "_audio_repaired_" + $suffix + ".mp4")
    }
    $output = $candidate
    & $ffmpeg -n -hide_banner -i "$($file.FullName)" -map 0:v:0 -map 0:a:0 -map_metadata 0 -c:v libx264 -preset veryfast -crf 21 -pix_fmt yuv420p -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:a aac -b:a 192k -movflags +faststart "$output"
    if ($LASTEXITCODE -ne 0) {
      $status = "FAIL: normalization/export failed"
      $output = ""
    } else {
      $status = "PASS: normalized review copy created; listen and inspect before upload"
      Write-Host "Created: $candidate" -ForegroundColor Green
    }
  }

  [pscustomobject]@{File=$file.Name;DurationSeconds=$duration;AudioCodec=$audioInfo.codec_name;SampleRate=$audioInfo.sample_rate;Channels=$audioInfo.channels;MeanVolumeDb=$mean;PeakVolumeDb=$peak;Status=$status;Output=$output}
}

$reportPath = Join-Path $OutputDirectory "audio-qc-report.csv"
$report | Export-Csv -NoTypeInformation -Encoding UTF8 -Path $reportPath
Write-Host "`nAudio QC report: $reportPath" -ForegroundColor Yellow
$report | Format-Table -AutoSize
