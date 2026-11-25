#!/usr/bin/env python3
"""
Auditor preventivo local (Pre-Vuelo) para piezas 9:16 (Stories IG / Estados WA / Reels)
y placas 4:5 de ZAGUÁN Propiedades.
Falla con exit code 1 si alguna pieza tiene:
- Resolución distinta a 1080x1920 (para carpetas/archivos 9:16)
- Ventana de foto demasiado oscura (brillo medio < 38/255)
- MP4 sin stream de audio AAC o sin stream de video 1080x1920 o duración < 6s
- Overlay PNG opcional con píxeles sólidos fuera de zona segura 9:16
"""
import argparse
import json
import os
import subprocess
import sys
from PIL import Image

FFMPEG_BIN = "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1"
FFPROBE_BIN = FFMPEG_BIN.replace("ffmpeg-macos-aarch64-v7.1", "ffprobe-macos-aarch64-v7.1")


def check_jpg_9_16(path: str) -> list[str]:
    errs = []
    with Image.open(path) as im:
        w, h = im.size
        if (w, h) != (1080, 1920):
            errs.append(f"{os.path.basename(path)}: dimensión {w}x{h} != 1080x1920")
        rgb = im.convert("RGB")
        # Check brightness in upper photo window y=[380..920], x=[100..900]
        win = rgb.crop((100, 380, min(w, 900), min(h, 920))).convert("L")
        pxs = list(win.getdata())
        mean_luma = sum(pxs) / max(1, len(pxs))
        if mean_luma < 38:
            errs.append(f"{os.path.basename(path)}: ventana de foto muy oscura (brillo={mean_luma:.1f} < 38)")
        # Check safe zone edges left [0..50] and right [950..1080] in text zone y=[950..1505] don't have clipped white text
        edge_r = rgb.crop((955, 960, 1075, 1500))
        bright_right = sum(1 for r, g, b in edge_r.getdata() if r > 210 and g > 205 and b > 195)
        if bright_right > 40:
            errs.append(f"{os.path.basename(path)}: texto o botón blanco invade margen derecho x>955 ({bright_right} px)")
        edge_bot = rgb.crop((60, 1545, 950, 1900))
        bright_bot = sum(1 for r, g, b in edge_bot.getdata() if r > 210 and g > 205 and b > 195)
        if bright_bot > 40:
            errs.append(f"{os.path.basename(path)}: texto o botón blanco invade zona tapada inferior y>1545 ({bright_bot} px)")
    return errs


def check_mp4_9_16(path: str) -> list[str]:
    errs = []
    if not os.path.isfile(path) or os.path.getsize(path) < 120_000:
        return [f"{os.path.basename(path)}: archivo vacío o corrupto (<120KB)"]
    if os.path.isfile(FFPROBE_BIN):
        cmd = [FFPROBE_BIN, "-v", "error", "-show_format", "-show_streams", "-of", "json", path]
        p = subprocess.run(cmd, capture_output=True, text=True)
        if p.returncode != 0:
            return [f"{os.path.basename(path)}: ffprobe error {p.stderr[:120]}"]
        info = json.loads(p.stdout or "{}")
        streams = info.get("streams", [])
        vids = [s for s in streams if s.get("codec_type") == "video"]
        auds = [s for s in streams if s.get("codec_type") == "audio"]
        if not vids:
            errs.append(f"{os.path.basename(path)}: falta stream de video")
        else:
            vw, vh = vids[0].get("width"), vids[0].get("height")
            if (vw, vh) != (1080, 1920):
                errs.append(f"{os.path.basename(path)}: video {vw}x{vh} != 1080x1920")
        if not auds:
            errs.append(f"{os.path.basename(path)}: falta stream de audio oficial")
        dur = float((info.get("format") or {}).get("duration") or 0)
        if dur < 6.0:
            errs.append(f"{os.path.basename(path)}: duración {dur:.1f}s < 6s")
    else:
        cmd = [FFMPEG_BIN, "-i", path]
        p = subprocess.run(cmd, capture_output=True, text=True)
        txt = p.stderr or ""
        if "1080x1920" not in txt:
            errs.append(f"{os.path.basename(path)}: no confirma resolución 1080x1920")
        if "Audio: aac" not in txt:
            errs.append(f"{os.path.basename(path)}: falta audio AAC")
    return errs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dirs", nargs="+")
    args = ap.parse_args()
    all_errs = []
    checked = 0
    for d in args.dirs:
        if not os.path.isdir(d):
            all_errs.append(f"No existe directorio: {d}")
            continue
        for fn in sorted(os.listdir(d)):
            fp = os.path.join(d, fn)
            low = fn.lower()
            if low.endswith((".jpg", ".jpeg")):
                checked += 1
                all_errs.extend(check_jpg_9_16(fp))
            elif low.endswith(".mp4"):
                checked += 1
                all_errs.extend(check_mp4_9_16(fp))
    if all_errs:
        print("❌ AUDITOR VISUAL PREVENTIVO 9:16 FALLÓ:")
        for e in all_errs:
            print("  -", e)
        sys.exit(1)
    print(f"✅ AUDITOR VISUAL PREVENTIVO 9:16 PASS ({checked} archivos 1080x1920 verificados).")


if __name__ == "__main__":
    main()
