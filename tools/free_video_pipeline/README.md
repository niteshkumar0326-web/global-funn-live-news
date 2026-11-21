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

## 4. Publishing
- Upload long videos and Shorts through YouTube Studio first: https://studio.youtube.com/
- YouTube privacy (private/unlisted/public), title, audience declaration, and schedule must be checked before publishing.
- Publer Free currently advertises 3 social accounts (excluding X) and 10 scheduled posts per account. Bulk CSV scheduling is a paid feature. Confirm current limits before relying on it.

## Important limitations
- Edge TTS needs internet and is a free-access fallback, not a guaranteed permanent API or offline voice engine. It does not reproduce vidIQ's Bunty voice.
- FFmpeg and Python do the editing locally; this computer must stay on while rendering.
- This toolkit does not upload or publish by itself. YouTube Studio remains the reliable free publishing route until a tested, authorized API workflow is configured.
- Never publish unverified market figures. Refresh data and sources immediately before narration; label AI-generated illustrations clearly.
