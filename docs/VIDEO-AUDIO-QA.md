# GLOBAL FUNN Live Player and Audio QA

## Live player

- Open `/live` to embed the channel's current YouTube live stream.
- The page does not create a YouTube broadcast or start OBS/FFmpeg.
- A stream must first be scheduled and started in YouTube Studio or a permitted encoder.
- Only embed streams that the channel owns or is licensed to distribute. Do not rebroadcast third-party TV channels without written permission.
- The YouTube player controls playback and sound; on mobile, viewers may need to tap Play and Unmute.

## Diagnose and normalize uploaded videos (Windows)

Prerequisite: install FFmpeg and ensure both `ffmpeg` and `ffprobe` are on PATH.

Analyze without changing source files:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\repair-video-audio.ps1 -InputPath "C:\Newsroom\Exports"
```

Create normalized review copies for files with an audio stream and non-silent measured levels:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\repair-video-audio.ps1 -InputPath "C:\Newsroom\Exports" -Normalize
```

The utility reports missing audio streams, codec, sample rate, channels, mean level and peak level. Normalized review copies use H.264 video and AAC audio with EBU-style loudness normalization targets (-16 LUFS integrated, -1.5 dBTP, 11 LU LRA). It skips files that are silent/extremely quiet rather than amplifying noise. It does not overwrite originals.

**Important:** inspect the output on headphones and a phone before uploading. The report cannot detect every problem (bad pronunciation, distortion, lip-sync drift, noise, wrong language or broken speakers). Compare source and output and keep the original.
