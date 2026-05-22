# tiktok-editor

A command-line tool for creating 60-second TikTok-ready videos from your own footage.

## Features

- **Clip trimming & concatenation** — select multiple segments from a source video
- **9:16 vertical format** — auto-crops/resizes to 1080×1920 for TikTok
- **Auto-subtitles** — word-by-word animated captions via Whisper AI
- **Manual subtitles** — load a `.srt` or `.txt` caption file
- **Background music** — mix in an `.mp3` with adjustable volume
- **Duration warnings** — alerts you if your video is over/under 60 seconds
- **Mobile-optimized output** — H.264 MP4 with `faststart` for streaming

---

## Requirements

- Python 3.8+
- **ffmpeg** must be installed and available on your `PATH`

### Install ffmpeg

**macOS** (Homebrew):
```bash
brew install ffmpeg
```

**Windows** (Chocolatey):
```bash
choco install ffmpeg
```

**Ubuntu/Debian**:
```bash
sudo apt install ffmpeg
```

---

## Installation

```bash
git clone https://github.com/your-username/tiktok-editor.git
cd tiktok-editor

# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate       # macOS/Linux
venv\Scripts\activate.bat      # Windows

# Install dependencies
pip install -r requirements.txt
```

> **Note:** `openai-whisper` is only required when using `--subtitles auto`.
> If you don't need Whisper, you can skip it with `pip install moviepy tqdm ffmpeg-python`.

---

## Usage

```
python editor.py --input <video> --clips "<ranges>" [options]
```

### Options

| Flag | Default | Description |
|------|---------|-------------|
| `--input FILE` | *(required)* | Path to source video |
| `--clips RANGES` | *(required)* | Comma-separated clip ranges (see format below) |
| `--music FILE` | — | Background music `.mp3` |
| `--music-volume N` | `0.20` | Music volume 0.0–1.0 |
| `--mute-original` | off | Replace original audio with music entirely |
| `--subtitles auto\|FILE` | — | Auto-generate (Whisper) or load `.srt`/`.txt` |
| `--whisper-model NAME` | `base` | Whisper model: `tiny` `base` `small` `medium` `large` |
| `--font NAME` | `Arial-Bold` | Font name for captions |
| `--font-size N` | `70` | Caption font size in pixels |
| `--font-color COLOR` | `white` | Caption text color |
| `--outline-color COLOR` | `black` | Caption outline color |
| `--subtitle-position` | `bottom` | `bottom` \| `center` \| `top` |
| `--output FILE` | `output/final_<name>.mp4` | Output file path |
| `--no-vertical` | off | Skip 9:16 conversion |

### Clip format

Ranges are comma-separated `start-end` pairs. Timestamps support:

- `MM:SS` — e.g. `1:30`
- `HH:MM:SS` — e.g. `00:01:30`
- Seconds — e.g. `90`

```
"0:05-0:20,0:45-1:10"          # two clips
"00:01:23-00:01:35"             # single clip, HH:MM:SS format
"5-20,45-70"                    # using raw seconds
```

---

## Examples

### Basic — trim clips, no extras

```bash
python editor.py \
  --input myvideo.mp4 \
  --clips "0:05-0:20,0:45-1:10"
```

### Add background music

```bash
python editor.py \
  --input myvideo.mp4 \
  --clips "0:05-0:20,0:45-1:10" \
  --music song.mp3
```

### Add background music at 30% volume

```bash
python editor.py \
  --input myvideo.mp4 \
  --clips "0:05-0:20,0:45-1:10" \
  --music song.mp3 \
  --music-volume 0.30
```

### Replace original audio with music entirely

```bash
python editor.py \
  --input myvideo.mp4 \
  --clips "0:05-0:20,0:45-1:10" \
  --music song.mp3 \
  --mute-original
```

### Auto-generate subtitles with Whisper

```bash
python editor.py \
  --input myvideo.mp4 \
  --clips "0:05-0:20,0:45-1:10" \
  --subtitles auto
```

### Use a larger Whisper model for better accuracy

```bash
python editor.py \
  --input myvideo.mp4 \
  --clips "0:05-0:20,0:45-1:10" \
  --subtitles auto \
  --whisper-model small
```

### Load subtitles from a .srt file

```bash
python editor.py \
  --input myvideo.mp4 \
  --clips "0:05-0:20,0:45-1:10" \
  --subtitles captions.srt
```

### Customize captions

```bash
python editor.py \
  --input myvideo.mp4 \
  --clips "0:05-0:20,0:45-1:10" \
  --subtitles auto \
  --font "Impact" \
  --font-size 80 \
  --font-color yellow \
  --outline-color black \
  --subtitle-position center
```

### Full TikTok workflow

```bash
python editor.py \
  --input myvideo.mp4 \
  --clips "0:05-0:20,0:45-1:10,1:30-1:55" \
  --music trending_song.mp3 \
  --music-volume 0.25 \
  --subtitles auto \
  --whisper-model small \
  --font-size 72 \
  --output output/my_tiktok.mp4
```

---

## Output

Videos are saved to the `output/` folder by default as `final_<inputname>.mp4`.

The final video is:
- **1080×1920** (9:16 vertical)
- **H.264** video, **AAC** audio
- Optimized with `+faststart` for instant streaming on mobile

---

## Whisper model sizes

| Model | Speed | Accuracy | VRAM |
|-------|-------|----------|------|
| `tiny` | fastest | lowest | ~1 GB |
| `base` | fast | good | ~1 GB |
| `small` | medium | better | ~2 GB |
| `medium` | slow | great | ~5 GB |
| `large` | slowest | best | ~10 GB |

The default `base` model is a good balance for most use cases.

---

## Project structure

```
tiktok-editor/
├── editor.py                  # Entry point
├── requirements.txt
├── README.md
├── output/                    # Generated videos land here
└── tiktok_editor/
    ├── __init__.py
    ├── cli.py                 # Argument parsing, timestamp parsing
    ├── video.py               # ffmpeg wrappers (trim, concat, resize, audio)
    ├── subtitles.py           # Whisper transcription + subtitle overlay
    └── pipeline.py            # Main processing pipeline + progress display
```
