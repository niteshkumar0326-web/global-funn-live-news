# GLOBAL FUNN — Live Player and Video Audio Quality Control

## Channel player

- The newsroom Watch Channel route is `/live`.
- It checks the dedicated GLOBAL FUNN Live News channel for an active broadcast first, then its latest public upload.
- If neither is returned, it shows the newest upload from the main GLOBAL FUNN channel and labels it **MAIN CHANNEL BACKUP**.
- A saved sample video is shown only if YouTube cannot return a video. It must never be labelled LIVE.
- The player does not create a YouTube broadcast, configure OBS, or handle a stream key.
- Start the broadcast in YouTube Studio or a permitted encoder. The site can only detect a broadcast after YouTube reports it.
- On mobile, viewers may need to tap Play and Unmute.
- Embed only content the channel owns or is licensed to distribute.

## Video audio quality check (Windows)

Prerequisite: install FFmpeg and ensure both `ffmpeg` and `ffprobe` are on PATH. This utility has not been run on the owner's Windows PC by the assistant.

Analyze a folder without changing the source videos:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\repair-video-audio.ps1 -InputPath "C:\Newsroom\Exports"
```

Create separate normalized review copies:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\repair-video-audio.ps1 -InputPath "C:\Newsroom\Exports" -Normalize
```

The script checks the audio stream, codec, sample rate, channel count, mean and peak level, then creates a CSV report. With `-Normalize`, it creates new H.264/AAC review copies using loudness normalization targets of -16 LUFS integrated and -1.5 dBTP. It skips files with missing or silent/extremely quiet audio. It never overwrites an original source video, excludes its own output folder on repeat runs, and avoids replacing an existing normalized output.

The normalized MP4 contains the primary video stream and first audio stream; separate subtitle or additional audio tracks are not copied. Keep the original source and verify subtitles in your final editor.

**Human QC is mandatory:** listen on headphones and a phone, verify pronunciation, language, clipping/distortion, background noise, lip-sync, picture, captions and source rights. Do not publish merely because the audio check passed.

## Production and publishing limits

The browser workspaces prepare rundowns, scripts, edit lists and media notes. They do not by themselves render a final video, authenticate the Live News channel, schedule a broadcast, or upload/publish content. Those capabilities require the correct channel authorization and a working media/broadcast service. Keep editorial verification and human review before publication.
