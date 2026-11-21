# GLOBAL FUNN — Free-first video pipeline

This local Windows workflow avoids paid AI voice credits for routine Hindi narration.

## Stack
- Hindi male TTS: Microsoft Edge TTS voice `hi-IN-MadhurNeural` (online service; not the proprietary vidIQ Bunty voice).
- Video assembly: FFmpeg / FFprobe (free, open source).
- Orchestration: Python.
- Publishing: YouTube Studio first; Publer Free can be tested for a small multi-platform queue.

## 1. Install
Open PowerShell in this folder:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install --upgrade pip
py -m pip install -r requirements.txt
```

Install an FFmpeg Windows build and add its `bin` folder to PATH:
https://ffmpeg.org/download.html

Close and reopen PowerShell, then verify:
```powershell
ffmpeg -version
ffprobe -version
```

## 2. Create narration
Put the approved Hindi script in `script.txt`, then run:
```powershell
py tts.py --input script.txt --output output/narration.mp3 --voice hi-IN-MadhurNeural
```

Other supported Hindi option: `hi-IN-SwaraNeural`.

## 3. Assemble a video
Put approved images (JPG/PNG/WebP) in `assets/images/` in the intended order.
Then run:
```powershell
py render.py --audio output/narration.mp3 --images assets/images --output output/global-funn-long.mp4 --format landscape
```

For a Short:
```powershell
py render.py --audio output/short-01.mp3 --images assets/short-01 --output output/short-01.mp4 --format vertical
```

Optional subtitles:
```powershell
py render.py --audio output/narration.mp3 --images assets/images --srt captions.srt --output output/global-funn-long.mp4 --format landscape
```

The renderer makes a simple image-led video, adds the narration, scales/crops to the requested frame, and optionally burns in an SRT file. It does not invent footage, facts, or subtitles. Review every export before upload.

## 4. Upload through YouTube API (optional)
For an authorized upload workflow, create a Google Cloud project, enable YouTube Data API v3, create OAuth credentials for a Desktop app, and save the downloaded JSON as `client_secrets.json` in this folder. Keep this file and the generated `token.json` private; both are excluded by `.gitignore`.

Then run:
```powershell
py youtube_upload.py --video output/global-funn-long.mp4 --title "Video title" --description "Video description" --tags "India,markets,GLOBAL FUNN"
```

Uploads default to **private**. To schedule, pass `--publish-at 2026-12-01T10:00:00Z` (UTC); YouTube requires a private video for scheduled publication. Do not use `--privacy public` unless the final video has been reviewed and the creator explicitly approves public release. Check processing and final status in YouTube Studio: https://studio.youtube.com/

- Publer Free currently advertises 3 social accounts (excluding X) and 10 scheduled posts per account. Bulk CSV scheduling is a paid feature. Confirm current limits before relying on it.

## Important limitations
- Edge TTS needs internet and is a free-access fallback, not a guaranteed permanent API or offline voice engine. It does not reproduce vidIQ's Bunty voice.
- FFmpeg and Python do the editing locally; this computer must stay on while rendering.
- The YouTube uploader is optional and requires the channel owner's own Google Cloud OAuth setup. YouTube Studio remains the simplest manual fallback. No credentials are stored in this repository.
- Never publish unverified market figures. Refresh data and sources immediately before narration; label AI-generated illustrations clearly.
