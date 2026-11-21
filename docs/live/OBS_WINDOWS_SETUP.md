# GLOBAL FUNN — OBS Studio Windows Setup

Status: OBS is not yet installed on the creator's Windows PC.
Purpose: prepare a safe first live rehearsal; this guide does not contain stream keys or credentials.

## Step 1 — Install OBS from the official source

Preferred method:
1. Open Windows PowerShell (normal user is sufficient).
2. Run:

   winget install -e --id OBSProject.OBSStudio

3. If Windows asks for confirmation, review the package source and approve the install.
4. Launch OBS Studio from the Start menu.
5. If winget is unavailable, download the Windows installer only from https://obsproject.com/download/ and run it. Do not download OBS from third-party driver/download sites.

OBS official Windows support covers Windows 10 and 11. The OBS project states the software is free/open source with no watermark. Check the official download page for the current release before installing.

## Step 2 — First-run wizard

When OBS opens, use the Auto-Configuration Wizard:
- Choose "Optimize for streaming, recording is secondary" when prompted.
- Select YouTube / YouTube - RTMPS if the service selector is available.
- Let OBS test the computer and network. Accept its recommended settings as a starting point.
- Do not force 1080p or a high bitrate if the wizard recommends lower settings.

## Step 3 — Create a profile and scene collection

Profile name: GLOBAL FUNN — YouTube Live
Scene collection name: GLOBAL FUNN — Hindi News

Create these scenes:
1. 00_STARTING — logo/title, bulletin title and start time.
2. 01_ANCHOR — webcam or presenter video; microphone audio; lower-third.
3. 02_HEADLINES — headline text, source name and update time.
4. 03_INDIA_BUSINESS — original charts, figures and source footnotes.
5. 04_WORLD_TECH — original images/maps with source attribution.
6. 05_EXPLAINER — key points and caveats.
7. 06_CORRECTION — correction text and the affected story.
8. 07_ENDING — next bulletin time and channel handle.

For each scene, use Sources > + to add the relevant Text (GDI+), Image, Media Source, Video Capture Device, and Audio Input Capture. Add only media you own or are licensed to use. Keep text large and readable. Use Studio Mode to preview before switching live.

Initial canvas/output starting point: 1280x720, 30 FPS. Keep the output settings from the Auto-Configuration Wizard initially. Test a private stream and check dropped frames before raising resolution or bitrate.

## Step 4 — Audio

- Select the intended microphone under Settings > Audio or add Audio Input Capture.
- Speak at normal volume and watch the OBS mixer; avoid red clipping.
- Use headphones to prevent speaker echo.
- If no presenter camera/mic is available, use a pre-rendered original bulletin video with its narration as a Media Source. A live bulletin still needs an editor/moderator monitoring it.

## Step 5 — Connect YouTube (keep key secret)

1. Open YouTube Studio: https://studio.youtube.com/
2. Click Create > Go Live, then use the Stream tab or schedule a new stream.
3. In OBS, open Settings > Stream. Prefer the built-in YouTube account connection if offered.
4. If manual RTMPS setup is required, copy the server URL and stream key from YouTube Studio into OBS locally.
5. NEVER paste the stream key into ChatGPT, GitHub, documents, screenshots, or chat. Do not share it with anyone.
6. Keep the first event Private or Unlisted. Wait for the preview and check stream health in Live Control Room before clicking Go Live.

## Step 6 — Private rehearsal acceptance criteria

Run a 10-minute private/unlisted rehearsal:
- [ ] Preview appears in YouTube Live Control Room.
- [ ] Voice is clear and not clipping.
- [ ] No echo, black frames, frozen slides or missing media.
- [ ] Headline and source labels are readable.
- [ ] OBS dropped frames remain stable; no sustained network warning.
- [ ] A moderator can monitor chat.
- [ ] Stream is ended correctly and the recording/archive is visible.

Do not schedule a public broadcast until all checks pass and the editor approves the rundown.

## Troubleshooting

- If the PC is older or struggles: use 1280x720 at 30 FPS and let the wizard choose encoding settings; close unnecessary apps.
- If frames drop: reduce output resolution/FPS or bitrate based on OBS stats and connection stability; test again.
- If there is no sound: check the correct mic/device in Settings > Audio and the mixer meters; check Windows microphone privacy permissions.
- If YouTube preview does not appear: confirm the correct stream destination and key, then check the YouTube Live Control Room connection status.
- Never share a stream key to troubleshoot. Rotate/reset it in YouTube Studio if exposed.

Official references:
- OBS download: https://obsproject.com/download/
- OBS Windows installation: https://obsproject.com/kb/windows-installation
- OBS help portal: https://obsproject.com/help
- YouTube encoder streaming: https://support.google.com/youtube/answer/2907883
