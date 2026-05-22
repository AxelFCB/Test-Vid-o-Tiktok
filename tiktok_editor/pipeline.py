"""
Main processing pipeline: ties together trimming, concat, aspect-ratio,
audio mixing, and subtitle overlay with a progress display.
"""

import os
import sys
import tempfile

from .cli import format_duration
from .video import (
    trim_clip,
    concat_clips,
    convert_to_vertical,
    mix_audio,
    extract_audio,
    finalize_output,
    get_video_info,
)
from .subtitles import (
    parse_srt,
    parse_txt,
    transcribe_with_whisper,
    overlay_subtitles_ffmpeg,
)


TARGET_DURATION = 60.0
WARN_UNDER = 50.0
WARN_OVER = 75.0


def _step(n: int, total: int, label: str) -> None:
    bar_len = 30
    filled = int(bar_len * n / total)
    bar = "█" * filled + "░" * (bar_len - filled)
    pct = int(100 * n / total)
    sys.stdout.write(f"\r[{bar}] {pct:3d}%  {label:<40}")
    sys.stdout.flush()
    if n == total:
        print()  # newline at 100%


def run_pipeline(args, clips: list[tuple[float, float]]) -> None:
    total_clip_dur = sum(end - start for start, end in clips)

    print("\n╔══════════════════════════════════════╗")
    print("║       TikTok Editor — Processing     ║")
    print("╚══════════════════════════════════════╝\n")
    print(f"  Input       : {args.input}")
    print(f"  Clips       : {len(clips)} clip(s), total {format_duration(total_clip_dur)}")
    if total_clip_dur < WARN_UNDER:
        print(f"  ⚠ Warning   : Total clip duration ({format_duration(total_clip_dur)}) is under {WARN_UNDER}s")
    elif total_clip_dur > WARN_OVER:
        print(f"  ⚠ Warning   : Total clip duration ({format_duration(total_clip_dur)}) exceeds {WARN_OVER}s")
    else:
        print(f"  ✓ Duration  : {format_duration(total_clip_dur)} — good for TikTok")
    print(f"  Output      : {args.output}")
    print()

    # Count pipeline steps
    steps = 1 + len(clips)  # trim steps
    steps += 1  # concat
    steps += (0 if args.no_vertical else 1)  # vertical convert
    steps += (1 if args.music else 0)  # audio mix
    steps += (1 if args.subtitles else 0)  # subtitles
    steps += 1  # finalize
    step_n = [0]

    def advance(label: str) -> None:
        step_n[0] += 1
        _step(step_n[0], steps, label)

    with tempfile.TemporaryDirectory() as tmpdir:

        # ── Step 1+: Trim clips ─────────────────────────────────────────────
        trimmed_paths = []
        for i, (start, end) in enumerate(clips):
            label = f"Trimming clip {i+1}/{len(clips)} ({format_duration(start)} → {format_duration(end)})"
            advance(label)
            out = os.path.join(tmpdir, f"clip_{i:03d}.mp4")
            trim_clip(args.input, start, end, out)
            trimmed_paths.append(out)

        # ── Concat ─────────────────────────────────────────────────────────
        advance("Concatenating clips")
        concat_out = os.path.join(tmpdir, "concat.mp4")
        if len(trimmed_paths) == 1:
            import shutil
            shutil.copy2(trimmed_paths[0], concat_out)
        else:
            concat_clips(trimmed_paths, concat_out)

        current = concat_out

        # ── Vertical conversion ────────────────────────────────────────────
        if not args.no_vertical:
            advance("Converting to 9:16 vertical (1080×1920)")
            vertical_out = os.path.join(tmpdir, "vertical.mp4")
            convert_to_vertical(current, vertical_out)
            current = vertical_out

        # ── Audio mix ─────────────────────────────────────────────────────
        if args.music:
            advance(
                f"Mixing background music (vol={args.music_volume:.0%}"
                + (", muting original" if args.mute_original else "")
                + ")"
            )
            music_out = os.path.join(tmpdir, "with_music.mp4")
            mix_audio(
                current,
                args.music,
                music_out,
                music_volume=args.music_volume,
                mute_original=args.mute_original,
            )
            current = music_out

        # ── Subtitles ─────────────────────────────────────────────────────
        subtitle_entries = None
        if args.subtitles:
            if args.subtitles == "auto":
                advance(f"Transcribing with Whisper ({args.whisper_model})")
                print()  # Whisper prints its own progress below
                audio_wav = os.path.join(tmpdir, "audio.wav")
                extract_audio(current, audio_wav)
                try:
                    subtitle_entries = transcribe_with_whisper(audio_wav, args.whisper_model)
                    print(f"  Found {len(subtitle_entries)} caption segments")
                except ImportError as e:
                    print(f"\n  Warning: {e}\n  Skipping subtitles.")
                    subtitle_entries = None
            elif args.subtitles.lower().endswith(".srt"):
                advance(f"Loading subtitles from {args.subtitles}")
                subtitle_entries = parse_srt(args.subtitles)
                print(f" ({len(subtitle_entries)} segments)")
            else:
                advance(f"Loading subtitles from {args.subtitles}")
                subtitle_entries = parse_txt(args.subtitles)
                print(f" ({len(subtitle_entries)} segments)")

            if subtitle_entries:
                sub_out = os.path.join(tmpdir, "with_subs.mp4")
                print("  Burning subtitles into video...")
                overlay_subtitles_ffmpeg(
                    current,
                    sub_out,
                    subtitle_entries,
                    font=args.font,
                    font_size=args.font_size,
                    font_color=args.font_color,
                    outline_color=args.outline_color,
                    position=args.subtitle_position,
                )
                current = sub_out

        # ── Finalize ──────────────────────────────────────────────────────
        advance("Finalizing output (H.264, mobile-optimized)")
        os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
        finalize_output(current, args.output)

    # Done
    _step(steps, steps, "Done!")

    info = get_video_info(args.output)
    out_dur = info.get("duration", 0)
    size_mb = os.path.getsize(args.output) / (1024 * 1024)

    print(f"\n✓ Output saved : {args.output}")
    print(f"  Resolution   : {info.get('width', '?')}×{info.get('height', '?')}")
    print(f"  Duration     : {format_duration(out_dur)}")
    print(f"  File size    : {size_mb:.1f} MB")
    print()
