# GLOBAL FUNN Video Factory (free, bulk, multi-channel)

Ek hi system se: **bulletin (Short + landscape), AI podcast, YouTube bulk upload, 24x7 live stream** —
sab free tools se (Kokoro Hindi voice, ffmpeg, PIL, YouTube Data API). Koi monthly subscription nahi.

## 1. Kaise kaam karta hai

```
spec.json  →  gate (editorial check)  →  Hindi voice  →  cards  →  ffmpeg  →  mp4 + srt + upload.json
                                                                        ├─→ uploader  → YouTube (private / scheduled)
                                                                        └─→ live inbox → 24x7 stream
```

| Cheez | File |
|---|---|
| Saare channels ki setting (rang, voice, tagline, live on/off) | `channels.json` |
| Ek bulletin / podcast ka content | `examples/*.json` (isi format me naye banao) |
| Editorial rules (≥2 source, approval, advice words) | `factory/editorial.py` |
| Bulletin / podcast video | `factory/bulletin.py`, `factory/podcast.py` |
| YouTube upload + quota + schedule | `factory/uploader.py` |
| 24x7 live | `factory/live.py`, `deploy/*.service` |

**Naya channel** = `channels.json` me ek naya block (business, sports, tech, podcast pehle se hain). Naya content =
`queue/` folder me spec `.json` daalo.

## 2. Setup (ek baar)

```bash
cd tools/video_factory
python3 -m venv ../../venv && . ../../venv/bin/activate
pip install -r requirements.txt
python -m factory fetch-font      # Devanagari font
python -m factory fetch-models    # Kokoro Hindi voice (~100 MB, ek baar)
python -m factory doctor          # sab theek hai ya nahi
```

Windows PC par bhi chalta hai (ffmpeg PATH me ho). Server par (Hostinger VPS): ffmpeg + python3-venv install karo.

## 3. Roz ka kaam

```bash
python -m factory render examples/bulletin_live_news.json --formats short,wide   # ek bulletin
python -m factory render examples/podcast_demo.json                               # ek podcast
python -m factory batch queue --feed-live                                         # queue ke saare specs (bulk)
python -m factory upload --schedule --dry-run                                     # pehle dry-run
python -m factory upload --schedule                                               # asli upload
```

Output `out/<channel>/<slug>/` me: `*.mp4`, `*.hi.srt` (Hindi captions), `*.upload.json` (title, description,
chapters, tags, AI-label).

### Spec me kya likhna hai
- `narration` me **digits likh sakte ho** (83,919.71, 720/9, 2.85%) — system khud Hindi shabdon me bolta hai.
- Har story me `sources` ki list (kam se kam 2). 1 source ho to `source_waiver` me wajah likho.
- `review: {"status":"approved","by":"Nitesh"}` — **jab tak ye nahi, video sirf PRIVATE upload hoga.**
- Podcast me `turns` (host A/B), `chapter` = YouTube chapters. Awkward text ho to `say` me bolne wala roop likho.

## 4. YouTube upload (free)

1. Google Cloud Console → naya project → "YouTube Data API v3" ON → OAuth client (Desktop) → `secrets/client_secret.json`.
2. **Apne PC par** (browser chahiye): `python -m factory auth --channel live_news` — Google screen me sahi channel chuno.
   Har channel ke liye ek baar. `secrets/<channel>.token.json` banega (kabhi git me nahi jata).
3. Token files server par copy karo.

**Quota (sach):** default 10,000 units/din per Google project, ek upload ≈ 1,600 → **~6 upload/din per project**.
System khud 6 par ruk jata hai (`ledger.json`). Zyada channels = alag Google project, ya Google se quota-increase form.
Har video par "altered/synthetic content" = Yes automatically.

## 5. 24x7 live (Hostinger VPS)

```bash
export YT_STREAM_KEY_LIVE_NEWS=xxxx-xxxx-xxxx-xxxx     # YouTube Studio → Go Live → Stream key
python -m factory live --channel live_news --prepare-only   # playlist dekho
python -m factory live --channel live_news                  # on air
```
Server par systemd se (`deploy/globalfunn-live.service`): crash ho ya internet jaye to 5 sec me restart.
- Naye approved landscape bulletins `live/<channel>/inbox/` me aate hi 8 min ke andar on air.
- 12 ghante se purani news dobara nahi chalti; kuch na ho to "अगला बुलेटिन थोड़ी देर में" standby card chalta hai (stream kabhi band nahi).
- **Trading bot wale VPS par** CPU limit (60%) lagi hai aur render market hours (9:15–15:30 IST) me nahi hota. Behtar: live ke liye alag chhota VPS.
- Stream key sirf environment me; file/log/git me nahi.

## 6. Sach: limits aur risk

- **Repetitious content:** YouTube same AI clips baar-baar chalne ko "mass-produced" maan sakta hai (monetization risk).
  Isliye har ghante naya bulletin do; purani news mat ghumao.
- **Accuracy:** system facts khud nahi banata. Facts + sources aap (ya research step) dete ho; gate sirf rule check karta hai.
- **Approval:** public/scheduled tabhi jab spec me approval ho. Bina approval = private.
- Anchor abhi stylised card + waveform hai (asli insaan jaisa chehra nahi) — licence safe.
- Real YouTube upload is cloud workspace se test nahi hua (OAuth chahiye); code fake-service tests se verified hai, pehla asli upload `--dry-run` ke baad ek video se karo.

## 7. Tests
```bash
python -m pytest -q tests      # 18 tests, ffmpeg chahiye, Kokoro nahi
```

## Videos me topic wali photos / clips / AI image (naya)

Har story me `visuals` list daalo (examples/bulletin_live_news.json dekho). Slideshow apne aap banta hai:
ek story ki 2-4 photos Ken-Burns zoom + cross-fade ke saath, upar headline card, neeche ticker.
Har photo par chhota label aata hai ("प्रतीकात्मक चित्र", "AI-जनित प्रतीकात्मक चित्र", ya "चित्र: <naam> (<licence>)")
aur credit upload description me khud judta hai.

| type | kya karta hai | key chahiye? |
|------|---------------|--------------|
| `stock` | Pexels, na mile to Pixabay se photo | free API key: `PEXELS_API_KEY`, `PIXABAY_API_KEY` |
| `video` | Pexels/Pixabay se 3-40 sec ka clip | wahi keys |
| `wikimedia` | Wikimedia Commons (sirf CC/public domain, author+licence credit) | nahi |
| `ai` | Pollinations (FLUX) se AI image, hamesha AI label ke saath | nahi |
| `file` | aapki apni / licensed photo ya clip (`credit` zaroor likho) | nahi |

Niyam (AGENTS.md): asli log/asli ghatna wali story me `"real_event": true` likho. Tab AI image **band** ho jaati hai
(gate error deta hai) aur sirf asli credited photo (`wikimedia` / `file`) chalti hai. AI prompt me hamesha "no identifiable
people, no text, no logos" jud jaata hai. Kuch na mile to abstract graphic backdrop lagta hai, render kabhi nahi rukta.

Kahan chalaye: cloud sandbox me photo sites band hain, isliye PC ya VPS par:

```
python -m factory fetch-visuals examples/bulletin_live_news.json      # photos/clips work/visuals me cache
python -m factory render examples/bulletin_live_news.json              # cache se render (GF_OFFLINE=1 ho to net nahi)
```
