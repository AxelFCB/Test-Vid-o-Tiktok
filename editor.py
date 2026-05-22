#!/usr/bin/env python3
"""
tiktok-editor: CLI tool for creating 60-second TikTok-ready videos.
"""

import argparse
import sys
import os

from tiktok_editor.cli import parse_clips
from tiktok_editor.pipeline import run_pipeline


def main():
    parser = argparse.ArgumentParser(
        prog="tiktok-editor",
        description="Create 60-second TikTok-ready videos from your footage.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python editor.py --input myvideo.mp4 --clips "0:05-0:20,0:45-1:10"
  python editor.py --input myvideo.mp4 --clips "0:05-0:20" --music song.mp3 --subtitles auto
  python editor.py --input myvideo.mp4 --clips "0:05-0:20" --subtitles captions.srt
  python editor.py --input myvideo.mp4 --clips "0:05-0:20" --music song.mp3 --mute-original
  python editor.py --input myvideo.mp4 --clips "0:05-0:20" --font-size 72 --font-color yellow
        """,
    )

    # Input
    parser.add_argument("--input", required=True, help="Path to the input video file")
    parser.add_argument(
        "--clips",
        required=True,
        help='Comma-separated clip ranges, e.g. "0:05-0:20,0:45-1:10" or "00:01:23-00:01:35"',
    )

    # Audio
    parser.add_argument("--music", help="Path to a background music .mp3 file")
    parser.add_argument(
        "--music-volume",
        type=float,
        default=0.20,
        metavar="VOLUME",
        help="Background music volume 0.0–1.0 (default: 0.20)",
    )
    parser.add_argument(
        "--mute-original",
        action="store_true",
        help="Mute original audio (replace entirely with background music)",
    )

    # Subtitles
    parser.add_argument(
        "--subtitles",
        metavar="auto|FILE",
        help='auto = generate with Whisper; or path to .srt/.txt subtitle file',
    )
    parser.add_argument(
        "--whisper-model",
        default="base",
        choices=["tiny", "base", "small", "medium", "large"],
        help="Whisper model size (default: base)",
    )
    parser.add_argument("--font", default="Arial-Bold", help="Font name (default: Arial-Bold)")
    parser.add_argument("--font-size", type=int, default=70, help="Font size in px (default: 70)")
    parser.add_argument("--font-color", default="white", help="Font color (default: white)")
    parser.add_argument(
        "--outline-color", default="black", help="Text outline color (default: black)"
    )
    parser.add_argument(
        "--subtitle-position",
        default="bottom",
        choices=["bottom", "center", "top"],
        help="Vertical position of subtitles (default: bottom)",
    )

    # Output
    parser.add_argument(
        "--output",
        default=None,
        help="Output file path (default: output/final_<input_name>.mp4)",
    )
    parser.add_argument(
        "--no-vertical",
        action="store_true",
        help="Skip 9:16 conversion and keep original aspect ratio",
    )

    args = parser.parse_args()

    # Validate input file
    if not os.path.isfile(args.input):
        print(f"Error: input file not found: {args.input}", file=sys.stderr)
        sys.exit(1)

    # Validate music file
    if args.music and not os.path.isfile(args.music):
        print(f"Error: music file not found: {args.music}", file=sys.stderr)
        sys.exit(1)

    # Validate subtitles file (when not "auto")
    if args.subtitles and args.subtitles != "auto" and not os.path.isfile(args.subtitles):
        print(f"Error: subtitle file not found: {args.subtitles}", file=sys.stderr)
        sys.exit(1)

    # Validate music volume
    if not (0.0 <= args.music_volume <= 1.0):
        print("Error: --music-volume must be between 0.0 and 1.0", file=sys.stderr)
        sys.exit(1)

    # Parse clips
    try:
        clips = parse_clips(args.clips)
    except ValueError as e:
        print(f"Error parsing --clips: {e}", file=sys.stderr)
        sys.exit(1)

    if not clips:
        print("Error: no valid clips parsed from --clips", file=sys.stderr)
        sys.exit(1)

    # Build output path
    if args.output is None:
        os.makedirs("output", exist_ok=True)
        base = os.path.splitext(os.path.basename(args.input))[0]
        args.output = os.path.join("output", f"final_{base}.mp4")

    run_pipeline(args, clips)


if __name__ == "__main__":
    main()
