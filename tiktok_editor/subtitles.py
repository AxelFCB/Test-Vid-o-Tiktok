"""
Subtitle generation: Whisper transcription or .srt/.txt parsing,
plus animated word-by-word caption overlay via ffmpeg.
"""

import os
import re
import subprocess
import tempfile


# ---------------------------------------------------------------------------
# SRT helpers
# ---------------------------------------------------------------------------

def _parse_srt_time(t: str) -> float:
    """Parse SRT timestamp '00:01:23,456' to seconds."""
    t = t.replace(",", ".")
    parts = t.split(":")
    h, m, s = int(parts[0]), int(parts[1]), float(parts[2])
    return h * 3600 + m * 60 + s


def parse_srt(path: str) -> list[dict]:
    """
    Parse an .srt file into a list of subtitle entries:
    [{"start": float, "end": float, "text": str}, ...]
    """
    with open(path, encoding="utf-8", errors="replace") as f:
        content = f.read()

    entries = []
    blocks = re.split(r"\n\s*\n", content.strip())
    for block in blocks:
        lines = [l.strip() for l in block.splitlines() if l.strip()]
        if len(lines) < 3:
            continue
        # lines[0] = index, lines[1] = timestamps, lines[2+] = text
        time_match = re.match(
            r"(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})",
            lines[1],
        )
        if not time_match:
            continue
        start = _parse_srt_time(time_match.group(1))
        end = _parse_srt_time(time_match.group(2))
        text = " ".join(lines[2:])
        entries.append({"start": start, "end": end, "text": text})
    return entries


def parse_txt(path: str) -> list[dict]:
    """
    Parse a plain-text subtitle file (one line per subtitle, no timestamps).
    Each line is displayed for ~3 seconds.
    """
    with open(path, encoding="utf-8", errors="replace") as f:
        lines = [l.strip() for l in f if l.strip()]
    entries = []
    t = 0.0
    for line in lines:
        entries.append({"start": t, "end": t + 3.0, "text": line})
        t += 3.0
    return entries


# ---------------------------------------------------------------------------
# Whisper transcription
# ---------------------------------------------------------------------------

def transcribe_with_whisper(audio_path: str, model_name: str = "base") -> list[dict]:
    """
    Run Whisper on an audio file and return word-level segments.
    Returns list of {"start": float, "end": float, "text": str}.
    """
    try:
        import whisper
    except ImportError:
        raise ImportError(
            "openai-whisper is not installed. Run: pip install openai-whisper"
        )

    print(f"  Loading Whisper model '{model_name}'...")
    model = whisper.load_model(model_name)
    print("  Transcribing audio (this may take a while)...")
    result = model.transcribe(audio_path, word_timestamps=True, verbose=False)

    entries = []
    for segment in result.get("segments", []):
        words = segment.get("words", [])
        if words:
            # Group words into small caption chunks (max 4 words per card)
            chunk = []
            chunk_start = None
            for w in words:
                word_text = w.get("word", "").strip()
                if not word_text:
                    continue
                if chunk_start is None:
                    chunk_start = w["start"]
                chunk.append((w["start"], w["end"], word_text))
                if len(chunk) >= 4:
                    entries.append({
                        "start": chunk_start,
                        "end": chunk[-1][1],
                        "text": " ".join(wt for _, _, wt in chunk),
                    })
                    chunk = []
                    chunk_start = None
            if chunk:
                entries.append({
                    "start": chunk_start,
                    "end": chunk[-1][1],
                    "text": " ".join(wt for _, _, wt in chunk),
                })
        else:
            # Fallback: use full segment text
            entries.append({
                "start": segment["start"],
                "end": segment["end"],
                "text": segment["text"].strip(),
            })

    return entries


# ---------------------------------------------------------------------------
# SRT writing
# ---------------------------------------------------------------------------

def _seconds_to_srt_time(s: float) -> str:
    h = int(s) // 3600
    m = (int(s) % 3600) // 60
    sec = s % 60
    return f"{h:02d}:{m:02d}:{sec:06.3f}".replace(".", ",")


def write_srt(entries: list[dict], path: str) -> None:
    """Write a list of subtitle entries to an .srt file."""
    with open(path, "w", encoding="utf-8") as f:
        for i, e in enumerate(entries, 1):
            f.write(f"{i}\n")
            f.write(f"{_seconds_to_srt_time(e['start'])} --> {_seconds_to_srt_time(e['end'])}\n")
            f.write(f"{e['text']}\n\n")


# ---------------------------------------------------------------------------
# ffmpeg subtitle overlay (word-by-word animated style)
# ---------------------------------------------------------------------------

def build_subtitle_filter(
    entries: list[dict],
    font: str = "Arial-Bold",
    font_size: int = 70,
    font_color: str = "white",
    outline_color: str = "black",
    position: str = "bottom",
    video_width: int = 1080,
    video_height: int = 1920,
) -> str:
    """
    Build an ffmpeg drawtext filter chain that mimics TikTok animated captions.
    Each caption chunk appears word-by-word with a highlight effect.
    """
    if not entries:
        return ""

    # Vertical position
    if position == "bottom":
        y_expr = f"h-{font_size * 4}"
    elif position == "center":
        y_expr = "(h-text_h)/2"
    else:  # top
        y_expr = str(font_size * 2)

    outline_width = max(2, font_size // 18)

    parts = []
    for e in entries:
        start = e["start"]
        end = e["end"]
        text = e["text"].replace("'", "\\'").replace(":", "\\:").replace(",", "\\,")
        # Each entry: full text shown between start and end
        part = (
            f"drawtext=font='{font}'"
            f":fontsize={font_size}"
            f":fontcolor={font_color}"
            f":bordercolor={outline_color}"
            f":borderw={outline_width}"
            f":text='{text}'"
            f":x=(w-text_w)/2"
            f":y={y_expr}"
            f":enable='between(t,{start:.3f},{end:.3f})'"
        )
        parts.append(part)

    return ",".join(parts)


def overlay_subtitles_ffmpeg(
    input_video: str,
    output_video: str,
    entries: list[dict],
    font: str = "Arial-Bold",
    font_size: int = 70,
    font_color: str = "white",
    outline_color: str = "black",
    position: str = "bottom",
) -> None:
    """Burn subtitles into the video using ffmpeg drawtext filters."""
    subtitle_filter = build_subtitle_filter(
        entries,
        font=font,
        font_size=font_size,
        font_color=font_color,
        outline_color=outline_color,
        position=position,
    )

    if not subtitle_filter:
        # No subtitles — just copy
        subprocess.run(
            ["ffmpeg", "-y", "-i", input_video, "-c", "copy", output_video],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return

    cmd = [
        "ffmpeg", "-y",
        "-i", input_video,
        "-vf", subtitle_filter,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "192k",
        output_video,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        # If drawtext filter fails (e.g. font not found), fall back to libass .srt subtitles
        print("  Warning: drawtext filter failed, falling back to .srt overlay")
        _overlay_srt_fallback(input_video, output_video, entries)


def _overlay_srt_fallback(input_video: str, output_video: str, entries: list[dict]) -> None:
    """Fallback: burn subtitles using libass + temporary .srt file."""
    with tempfile.NamedTemporaryFile(suffix=".srt", delete=False, mode="w", encoding="utf-8") as f:
        srt_path = f.name
        write_srt(entries, srt_path)

    try:
        # Escape path for ffmpeg filter
        escaped = srt_path.replace("\\", "/").replace(":", "\\:")
        cmd = [
            "ffmpeg", "-y",
            "-i", input_video,
            "-vf", f"subtitles='{escaped}'",
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "23",
            "-c:a", "aac",
            "-b:a", "192k",
            output_video,
        ]
        subprocess.run(cmd, check=True, capture_output=True)
    finally:
        os.unlink(srt_path)
