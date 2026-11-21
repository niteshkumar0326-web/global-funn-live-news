from __future__ import annotations

import argparse
import asyncio
from pathlib import Path
import sys

import edge_tts


async def synthesize(text: str, output: Path, voice: str, rate: str, volume: str) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    communicate = edge_tts.Communicate(text, voice, rate=rate, volume=volume)
    await communicate.save(str(output))


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate Hindi narration using Edge TTS.")
    parser.add_argument("--input", required=True, help="UTF-8 text script")
    parser.add_argument("--output", required=True, help="Output MP3 path")
    parser.add_argument("--voice", default="hi-IN-MadhurNeural")
    parser.add_argument("--rate", default="+0%")
    parser.add_argument("--volume", default="+0%")
    args = parser.parse_args()

    source = Path(args.input)
    target = Path(args.output)
    if not source.is_file():
        print(f"Script not found: {source}", file=sys.stderr)
        return 2

    text = source.read_text(encoding="utf-8").strip()
    if not text:
        print("Script is empty.", file=sys.stderr)
        return 2

    try:
        asyncio.run(synthesize(text, target, args.voice, args.rate, args.volume))
    except Exception as exc:
        print(f"TTS failed: {exc}", file=sys.stderr)
        return 1

    if not target.is_file() or target.stat().st_size == 0:
        print("TTS did not create a valid MP3.", file=sys.stderr)
        return 1

    print(f"Created narration: {target.resolve()} ({target.stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
