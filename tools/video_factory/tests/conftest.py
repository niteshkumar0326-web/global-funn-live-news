import os
import sys
from pathlib import Path

os.environ.setdefault("GF_TTS", "tone")          # no Kokoro needed in tests
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
