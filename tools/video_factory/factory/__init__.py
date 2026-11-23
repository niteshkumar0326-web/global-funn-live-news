"""GLOBAL FUNN video factory — free, config-driven bulk video production.

Pipeline:  spec.json  ->  gate (editorial checks)  ->  TTS (Kokoro, free)
           ->  cards (PIL)  ->  ffmpeg  ->  mp4 + srt + upload.json
           ->  uploader (YouTube Data API, quota aware)  /  live runner (24x7 RTMP)
"""

__version__ = "0.1.0"
