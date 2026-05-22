"""
Core video processing: trimming, concatenation, aspect-ratio conversion, audio mixing.
All heavy lifting is done via direct ffmpeg subprocess calls for speed.
"""

import os
import subprocess
import tempfile


TIKTOK_WIDTH = 1080
TIKTOK_HEIGHT = 1920


def _ffmpeg(*args, **kwargs) -> subprocess.CompletedProcess:
    """Run ffmpeg with common flags."""
    cmd = ["ffmpeg", "-y"] + list(args)
    result = subprocess.run(cmd, capture_output=True, text=True, **kwargs)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg error:\n{result.stderr[-3000:]}")
    return result


def get_video_info(path: str) -> dict:
    """Return basic info about a video file using ffprobe."""
    cmd = [
        "ffprobe", "-v", "quiet",
        "-print_format", "json",
        "-show_streams", "-show_format",
        path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffprobe failed on {path}:\n{result.stderr}")
    import json
    data = json.loads(result.stdout)
    info = {"duration": float(data["format"].get("duration", 0))}
    for stream in data.get("streams", []):
        if stream.get("codec_type") == "video":
            info["width"] = stream.get("width", 0)
            info["height"] = stream.get("height", 0)
            r = stream.get("r_frame_rate", "30/1").split("/")
            info["fps"] = float(r[0]) / float(r[1]) if len(r) == 2 else 30.0
            break
    return info


def trim_clip(input_path: str, start: float, end: float, output_path: str) -> None:
    """Extract a clip from start to end (seconds) using fast stream-copy then re-encode."""
    duration = end - start
    _ffmpeg(
        "-ss", str(start),
        "-i", input_path,
        "-t", str(duration),
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        "-avoid_negative_ts", "make_zero",
        output_path,
    )


def concat_clips(clip_paths: list[str], output_path: str) -> None:
    """Concatenate multiple video files using ffmpeg concat demuxer."""
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".txt", delete=False, encoding="utf-8"
    ) as f:
        list_path = f.name
        for p in clip_paths:
            abs_path = os.path.abspath(p).replace("\\", "/")
            f.write(f"file '{abs_path}'\n")

    try:
        _ffmpeg(
            "-f", "concat",
            "-safe", "0",
            "-i", list_path,
            "-c", "copy",
            output_path,
        )
    finally:
        os.unlink(list_path)


def convert_to_vertical(input_path: str, output_path: str) -> None:
    """
    Convert any video to 1080x1920 (9:16 TikTok format).
    - If already 9:16: scale to 1080x1920
    - Landscape/square: scale to fit height 1920, crop width to 1080
      (center crop — you can adjust with --no-vertical if not desired)
    """
    info = get_video_info(input_path)
    w = info.get("width", 1920)
    h = info.get("height", 1080)

    if w == 0 or h == 0:
        scale_filter = f"scale={TIKTOK_WIDTH}:{TIKTOK_HEIGHT}"
    elif w / h < 9 / 16:
        # Narrower than 9:16 — pillarbox with blur background
        scale_filter = (
            f"[0:v]scale={TIKTOK_WIDTH}:{TIKTOK_HEIGHT}:force_original_aspect_ratio=increase,"
            f"crop={TIKTOK_WIDTH}:{TIKTOK_HEIGHT}"
        )
    else:
        # Landscape or square — scale height to 1920 and crop width
        scale_filter = (
            f"scale=-2:{TIKTOK_HEIGHT},"
            f"crop={TIKTOK_WIDTH}:{TIKTOK_HEIGHT}"
        )

    _ffmpeg(
        "-i", input_path,
        "-vf", scale_filter,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        output_path,
    )


def mix_audio(
    video_path: str,
    music_path: str,
    output_path: str,
    music_volume: float = 0.20,
    mute_original: bool = False,
) -> None:
    """
    Mix background music into the video's audio track.
    - mute_original: discard original audio and use only music at full volume
    - otherwise: blend music (at music_volume) with original voice audio
    """
    if mute_original:
        # Replace original audio entirely with music track (looped to match video length)
        info = get_video_info(video_path)
        video_dur = info.get("duration", 60)
        _ffmpeg(
            "-i", video_path,
            "-stream_loop", "-1",
            "-i", music_path,
            "-t", str(video_dur),
            "-filter_complex",
            f"[1:a]volume={music_volume:.4f},atrim=0:{video_dur:.3f}[music]",
            "-map", "0:v",
            "-map", "[music]",
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "192k",
            "-shortest",
            output_path,
        )
    else:
        info = get_video_info(video_path)
        video_dur = info.get("duration", 60)
        _ffmpeg(
            "-i", video_path,
            "-stream_loop", "-1",
            "-i", music_path,
            "-t", str(video_dur),
            "-filter_complex",
            (
                f"[1:a]volume={music_volume:.4f},atrim=0:{video_dur:.3f}[music];"
                f"[0:a][music]amix=inputs=2:duration=first:dropout_transition=3[aout]"
            ),
            "-map", "0:v",
            "-map", "[aout]",
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "192k",
            "-shortest",
            output_path,
        )


def extract_audio(video_path: str, audio_path: str) -> None:
    """Extract audio from a video file as a .wav for Whisper."""
    _ffmpeg(
        "-i", video_path,
        "-vn",
        "-acodec", "pcm_s16le",
        "-ar", "16000",
        "-ac", "1",
        audio_path,
    )


def finalize_output(input_path: str, output_path: str) -> None:
    """Re-encode with mobile-optimized settings and faststart flag."""
    _ffmpeg(
        "-i", input_path,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "23",
        "-profile:v", "high",
        "-level", "4.1",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        output_path,
    )
