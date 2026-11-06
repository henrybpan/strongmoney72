"""Fill audio durations into index.template.html and write index.html, then check every local link."""
import pathlib
import re
import subprocess

ROOT = pathlib.Path(__file__).parent


def duration(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    )
    return round(float(out.stdout) / 60)


def main():
    html = (ROOT / "index.template.html").read_text()
    html = re.sub(
        r"\{\{([a-z0-9-]+)\}\}",
        lambda m: f"{duration(ROOT / 'audio' / (m.group(1) + '.m4a'))} min",
        html,
    )
    (ROOT / "index.html").write_text(html)
    links = re.findall(r'(?:href|src)="((?:docs|audio|letters|assets)/[^"]+|styles\.css|app\.js|favicon\.svg)"', html)
    missing = [link for link in links if not (ROOT / link).is_file()]
    if missing:
        raise SystemExit(f"Missing files: {missing}")
    print(f"index.html written, {len(links)} local links OK")


if __name__ == "__main__":
    main()
