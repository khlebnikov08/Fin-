from pathlib import Path
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist-yandex"
OUTPUT = ROOT / "finlife-yandex-game.zip"
MAX_UNPACKED_SIZE = 100 * 1024 * 1024
INVALID_NAME = re.compile(r"[\s\u0400-\u04ff]")


def main() -> None:
    if not (DIST / "index.html").is_file():
        raise SystemExit("Yandex build is missing dist-yandex/index.html; run npm run build:yandex first.")

    files = sorted(path for path in DIST.rglob("*") if path.is_file())
    if sum(path.stat().st_size for path in files) > MAX_UNPACKED_SIZE:
        raise SystemExit("Yandex archive exceeds the 100 MB uncompressed limit.")

    bad_names = [path.relative_to(DIST).as_posix() for path in files if INVALID_NAME.search(path.relative_to(DIST).as_posix())]
    if bad_names:
        raise SystemExit(f"Yandex archive has names with spaces or Cyrillic characters: {bad_names}")

    js_files = [path for path in files if path.suffix == ".js"]
    js_bundle = "\n".join(path.read_text(encoding="utf-8") for path in js_files)
    if "/api/generate-news" in js_bundle or "/api/generate-gameplay-event" in js_bundle:
        raise SystemExit("Yandex build contains a live AI endpoint; interactive AI must stay disabled.")
    if "/sdk.js" not in js_bundle:
        raise SystemExit("Yandex Games SDK loader is missing from the build.")
    for required_sdk_method in ("getPlayer", "getData", "setData", "showFullscreenAdv"):
        if required_sdk_method not in js_bundle:
            raise SystemExit(f"Yandex integration is missing {required_sdk_method}().")

    with zipfile.ZipFile(OUTPUT, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path in files:
            archive.write(path, path.relative_to(DIST).as_posix())

    with zipfile.ZipFile(OUTPUT) as archive:
        names = archive.namelist()
        if names.count("index.html") != 1:
            raise SystemExit("Yandex archive must contain exactly one index.html at its root.")

    print(f"Created {OUTPUT.name}: {OUTPUT.stat().st_size / 1024:.1f} KB compressed, "
          f"{sum(path.stat().st_size for path in files) / 1024 / 1024:.2f} MB unpacked, "
          f"{len(files)} files.")


if __name__ == "__main__":
    main()
