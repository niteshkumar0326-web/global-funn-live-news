"""Hindi text helpers: numbers -> spoken words, sentence splitting, display helpers.

Kokoro reads digits badly in Hindi, so every narration goes through speakable()
which converts 83,919.71 -> "तिरासी हज़ार नौ सौ उन्नीस दशमलव सात एक".
Writers can therefore use plain digits in narration.
"""
from __future__ import annotations

import re

_UNDER_100 = (
    "शून्य एक दो तीन चार पाँच छह सात आठ नौ दस ग्यारह बारह तेरह चौदह पंद्रह सोलह सत्रह अठारह उन्नीस "
    "बीस इक्कीस बाईस तेईस चौबीस पच्चीस छब्बीस सत्ताईस अट्ठाईस उनतीस तीस इकतीस बत्तीस तैंतीस चौंतीस पैंतीस "
    "छत्तीस सैंतीस अड़तीस उनतालीस चालीस इकतालीस बयालीस तैंतालीस चवालीस पैंतालीस छियालीस सैंतालीस अड़तालीस "
    "उनचास पचास इक्यावन बावन तिरपन चौवन पचपन छप्पन सत्तावन अट्ठावन उनसठ साठ इकसठ बासठ तिरसठ चौंसठ पैंसठ "
    "छियासठ सड़सठ अड़सठ उनहत्तर सत्तर इकहत्तर बहत्तर तिहत्तर चौहत्तर पचहत्तर छिहत्तर सतहत्तर अठहत्तर उन्यासी "
    "अस्सी इक्यासी बयासी तिरासी चौरासी पचासी छियासी सत्तासी अट्ठासी नवासी नब्बे इक्यानवे बानवे तिरानवे "
    "चौरानवे पचानवे छियानवे सत्तानवे अट्ठानवे निन्यानवे"
).split()
assert len(_UNDER_100) == 100, len(_UNDER_100)


def num_to_hi_words(n: int) -> str:
    """Indian-system number words (hazaar, lakh, crore, arab) for 0 <= n < 10**13."""
    if n < 0:
        return "ऋण " + num_to_hi_words(-n)
    if n < 100:
        return _UNDER_100[n]
    parts: list[str] = []
    units = (
        (10**11, "खरब"),
        (10**9, "अरब"),
        (10**7, "करोड़"),
        (10**5, "लाख"),
        (10**3, "हज़ार"),
    )
    for size, name in units:
        q, n = divmod(n, size)
        if q:
            parts.append(f"{_UNDER_100[q] if q < 100 else num_to_hi_words(q)} {name}")
    q, n = divmod(n, 100)
    if q:
        parts.append(f"{_UNDER_100[q]} सौ")
    if n:
        parts.append(_UNDER_100[n])
    return " ".join(parts)


_NUM_RE = re.compile(r"(?<![\w.])(\d[\d,]*)(?:\.(\d+))?(%?)")


def _num_sub(m: re.Match) -> str:
    whole = int(m.group(1).replace(",", ""))
    out = num_to_hi_words(whole)
    if m.group(2):
        out += " दशमलव " + " ".join(_UNDER_100[int(c)] for c in m.group(2))
    if m.group(3):
        out += " प्रतिशत"
    return out


_ABBREV = {
    "ANI": "ए एन आई",
    "PTI": "पी टी आई",
    "RBI": "आर बी आई",
    "PIB": "पी आई बी",
    "BCCI": "बी सी सी आई",
    "ICC": "आई सी सी",
    "IMD": "आई एम डी",
    "NSE": "एन एस ई",
    "BSE": "बी एस ई",
    "SEBI": "सेबी",
    "GDP": "जी डी पी",
    "AI": "ए आई",
    "IPL": "आई पी एल",
    "PM": "पी एम",
    "UN": "यू एन",
    "USA": "यू एस ए",
    "ISRO": "इसरो",
    "NASA": "नासा",
    "UPI": "यू पी आई",
    "ESPNcricinfo": "ई एस पी एन क्रिकइन्फ़ो",
    "Reuters": "रॉयटर्स",
    "BBC": "बी बी सी",
}
_ABBREV_RE = re.compile(r"\b(" + "|".join(sorted(map(re.escape, _ABBREV), key=len, reverse=True)) + r")\b")


def speakable(text: str) -> str:
    """Prepare narration for the TTS engine (numbers and common acronyms to Hindi words)."""
    t = _ABBREV_RE.sub(lambda m: _ABBREV[m.group(1)], text)
    t = _NUM_RE.sub(_num_sub, t)
    t = t.replace("₹", " रुपये ").replace("&", " और ").replace("•", ", ")
    t = re.sub(r"[ \t]+", " ", t)
    return t.strip()


_SENT_RE = re.compile(r"(?<=[।!?])\s+|(?<=\.)\s+(?=[^\d\s])")


def split_sentences(text: str) -> list[str]:
    """Split narration into sentences (danda, !, ?, or . followed by a word)."""
    parts = [p.strip() for p in _SENT_RE.split(text.replace("\n", " ")) if p.strip()]
    return parts


def srt_time(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
