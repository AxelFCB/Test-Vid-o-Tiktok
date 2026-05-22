"""
CLI argument helpers — clip parsing and timestamp conversion.
"""

import re


def parse_timestamp(ts: str) -> float:
    """Convert a timestamp string to seconds. Supports HH:MM:SS, MM:SS, or raw seconds."""
    ts = ts.strip()
    parts = ts.split(":")
    try:
        if len(parts) == 3:
            h, m, s = parts
            return int(h) * 3600 + int(m) * 60 + float(s)
        elif len(parts) == 2:
            m, s = parts
            return int(m) * 60 + float(s)
        else:
            return float(parts[0])
    except ValueError:
        raise ValueError(f"Cannot parse timestamp: '{ts}'")


def parse_clips(clips_str: str) -> list[tuple[float, float]]:
    """
    Parse a clips string like "0:05-0:20,0:45-1:10" into a list of (start, end) tuples in seconds.
    Also supports "00:01:23-00:01:35" style and space around the dash.
    """
    clips = []
    raw_clips = [c.strip() for c in clips_str.split(",") if c.strip()]
    for raw in raw_clips:
        # Split on '-' but be careful with negative numbers (timestamps never negative)
        # Use a regex: <timestamp> - <timestamp>
        m = re.match(r"^(.+?)\s*-\s*(.+)$", raw)
        if not m:
            raise ValueError(f"Expected 'start-end', got: '{raw}'")
        start = parse_timestamp(m.group(1))
        end = parse_timestamp(m.group(2))
        if start >= end:
            raise ValueError(f"Start must be before end in clip '{raw}'")
        clips.append((start, end))
    return clips


def format_duration(seconds: float) -> str:
    """Human-readable duration string."""
    m = int(seconds) // 60
    s = seconds % 60
    return f"{m}m {s:.1f}s"
