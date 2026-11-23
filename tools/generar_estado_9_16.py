#!/usr/bin/env python3
"""
Generador oficial 9:16 (JPG + MP4 animado con música y afade) para Estados WhatsApp / Reels de ZAGUÁN Propiedades.
Uso:
  python3 tools/generar_estado_9_16.py --spec /ruta/spec.json
"""

import argparse
import json
import os
import tempfile
import subprocess
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
SPLIT_Y = 1060

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO_PATH = os.path.join(ROOT, "assets/brand/zaguan-white.png")
AUDIO_DEFAULT = "/Users/arianawajntraub/Desktop/ZAGUAN CLAUDE/audio/Zaguán coN DOS VUELTAS AL INICIO y zaguanpropiedades dicho Y FIN 15segs.wav"
FFMPEG_DEFAULT = "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1"

FONT_BLACK = "/Library/Fonts/Lato-Black.ttf"
FONT_BOLD = "/Library/Fonts/Lato-Bold.ttf"
FONT_REG = "/Library/Fonts/Lato-Regular.ttf"


def fit_cover(img: Image.Image, tw: int, th: int, focus_y: float = 0.45) -> Image.Image:
    iw, ih = img.size
    scale = max(tw / iw, th / ih)
    nw, nh = int(round(iw * scale)), int(round(ih * scale))
    resized = img.resize((nw, nh), Image.LANCZOS)
    x0 = max(0, (nw - tw) // 2)
    y0 = int(max(0, min(nh - th, (nh - th) * focus_y)))
    return resized.crop((x0, y0, x0 + tw, y0 + th))


def wrap_two_lines(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_w: int):
    words = text.strip().split()
    lines = []
    cur = []
    for w in words:
        cand = " ".join(cur + [w])
        if draw.textlength(cand, font=font) <= max_w or not cur:
            cur.append(w)
        else:
            lines.append(" ".join(cur))
            cur = [w]
            if len(lines) == 2:
                break
    if cur and len(lines) < 2:
        lines.append(" ".join(cur))
    return lines[:2]


def build_overlay(spec: dict, scratch_dir: str) -> tuple[str, Image.Image]:
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(ov)

    for y in range(260):
        alpha = int(175 * (1 - y / 260) ** 1.4)
        draw.line([(0, y), (W, y)], fill=(8, 21, 33, alpha))

    for y in range(SPLIT_Y - 140, SPLIT_Y):
        t = (y - (SPLIT_Y - 140)) / 140.0
        alpha = int(255 * (t ** 1.6))
        draw.line([(0, y), (W, y)], fill=(8, 21, 33, alpha))

    draw.rectangle([(0, SPLIT_Y), (W, H)], fill=(8, 21, 33, 255))
    draw.line([(0, SPLIT_Y), (W, SPLIT_Y)], fill=(27, 84, 99, 255), width=3)

    if os.path.isfile(LOGO_PATH):
        logo = Image.open(LOGO_PATH).convert("RGBA")
        target_h = 46
        ratio = target_h / logo.height
        logo_resized = logo.resize((int(round(logo.width * ratio)), target_h), Image.LANCZOS)
        ov.paste(logo_resized, (74, 150), logo_resized)

    f_pill = ImageFont.truetype(FONT_BOLD, 22)
    pill_txt = (spec.get("operacion_badge") or "ALQUILER ANUAL").upper()
    tw = draw.textlength(pill_txt, font=f_pill)
    px0, py0, px1, py1 = W - 74 - tw - 48, 146, W - 74, 198
    draw.rectangle([(px0, py0), (px1, py1)], fill=(18, 59, 74, 240), outline=(45, 118, 138, 255), width=2)
    draw.text((px0 + 24, py0 + 13), pill_txt, font=f_pill, fill=(243, 240, 232, 255))

    f_tag = ImageFont.truetype(FONT_BOLD, 22)
    tag_txt = (spec.get("estado_pill") or f"{spec.get('zona_publica', 'MALDONADO')} · {spec.get('precio_publico', '')}").upper()[:52]
    ttw = draw.textlength(tag_txt, font=f_tag)
    tx0, ty0, tx1, ty1 = 78, SPLIT_Y + 66, min(W - 78, 78 + ttw + 44), SPLIT_Y + 120
    draw.rectangle([(tx0, ty0), (tx1, ty1)], fill=(12, 36, 52, 255), outline=(45, 118, 138, 255), width=2)
    draw.text((tx0 + 22, ty0 + 13), tag_txt, font=f_tag, fill=(243, 240, 232, 255))

    f_head = ImageFont.truetype(FONT_BLACK, 60)
    head_lines = wrap_two_lines(draw, spec.get("estado_titulo") or spec.get("titulo_corto") or "Oportunidad en Maldonado", f_head, W - 156)
    for idx, line in enumerate(head_lines):
        draw.text((78, SPLIT_Y + 158 + idx * 72), line, font=f_head, fill=(243, 240, 232, 255))

    f_sub = ImageFont.truetype(FONT_REG, 32)
    sub_lines = wrap_two_lines(draw, spec.get("estado_subtitulo") or spec.get("resumen_corto") or "", f_sub, W - 156)
    for idx, line in enumerate(sub_lines):
        draw.text((78, SPLIT_Y + 336 + idx * 46), line, font=f_sub, fill=(184, 197, 208, 255))

    bx0, by0, bx1, by1 = 78, SPLIT_Y + 480, W - 78, SPLIT_Y + 572
    draw.rectangle([(bx0, by0), (bx1, by1)], fill=(243, 240, 232, 255))
    f_cta = ImageFont.truetype(FONT_BLACK, 29)
    cta_txt = spec.get("estado_cta") or (
        "Ver ficha y simular garantía · @zaguanpropiedades"
        if "alquiler" in (spec.get("operacion") or "").lower()
        else "Ver ficha y croquis · @zaguanpropiedades"
    )
    draw.text((bx0 + 36, by0 + 28), cta_txt, font=f_cta, fill=(8, 21, 33, 255))
    arrow_font_path = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
    if os.path.isfile(arrow_font_path):
        draw.text((bx1 - 68, by0 + 24), "→", font=ImageFont.truetype(arrow_font_path, 36), fill=(8, 21, 33, 255))

    overlay_path = os.path.join(scratch_dir, "overlay_9_16.png")
    ov.save(overlay_path, "PNG")
    return overlay_path, ov


def build_jpg(lead_photo: str, ov: Image.Image, jpg_out: str):
    lead = Image.open(lead_photo).convert("RGB")
    bg = Image.new("RGB", (W, H), (8, 21, 33))
    top_crop = fit_cover(lead, W, SPLIT_Y + 40, focus_y=0.45)
    bg.paste(top_crop, (0, 0))
    comp = Image.alpha_composite(bg.convert("RGBA"), ov).convert("RGB")
    os.makedirs(os.path.dirname(jpg_out), exist_ok=True)
    comp.save(jpg_out, "JPEG", quality=92)


def build_mp4(photos: list[str], overlay_path: str, mp4_out: str, audio_path: str, ffmpeg_bin: str, scratch_dir: str):
    chosen = (photos * 5)[:5]
    zoom_specs = [
        "z='min(zoom+0.0018,1.14)':x='iw/2-(iw/zoom/2)':y='ih*0.44-(ih/zoom/2)'",
        "z='min(zoom+0.0016,1.12)':x='iw*0.46-(iw/zoom/2)':y='ih*0.42-(ih/zoom/2)'",
        "z='min(zoom+0.0016,1.12)':x='iw*0.54-(iw/zoom/2)':y='ih*0.42-(ih/zoom/2)'",
        "z='min(zoom+0.0015,1.11)':x='iw/2-(iw/zoom/2)':y='ih*0.45-(ih/zoom/2)'",
        "z='min(zoom+0.0015,1.11)':x='iw/2-(iw/zoom/2)':y='ih*0.42-(ih/zoom/2)'",
    ]
    prepped = []
    for idx, p in enumerate(chosen):
        im = Image.open(p).convert("RGB")
        canvas = Image.new("RGB", (W, H), (8, 21, 33))
        top_part = fit_cover(im, W, SPLIT_Y + 80, focus_y=0.42)
        canvas.paste(top_part, (0, 0))
        p_out = os.path.join(scratch_dir, f"scene_{idx}.jpg")
        canvas.save(p_out, "JPEG", quality=95)
        prepped.append(p_out)

    inputs = []
    filter_parts = []
    for idx, p in enumerate(prepped):
        inputs.extend(["-loop", "1", "-t", "2.72", "-i", p])
        filter_parts.append(f"[{idx}:v]scale=1200:2133,zoompan={zoom_specs[idx]}:d=66:s=1080x1920:fps=24,format=rgba[z{idx}];")

    filter_parts.append("[z0][z1]xfade=transition=slideleft:duration=0.4:offset=2.32[x1];")
    filter_parts.append("[x1][z2]xfade=transition=fade:duration=0.4:offset=4.64[x2];")
    filter_parts.append("[x2][z3]xfade=transition=slideleft:duration=0.4:offset=6.96[x3];")
    filter_parts.append("[x3][z4]xfade=transition=fade:duration=0.4:offset=9.28[vidbg];")

    inputs.extend(["-i", overlay_path, "-i", audio_path])
    filter_parts.append("[vidbg][5:v]overlay=0:0:format=auto,format=yuv420p[vout];")
    filter_parts.append("[6:a]atrim=0:12.0,asetpts=PTS-STARTPTS,highpass=f=220,equalizer=f=900:t=q:w=1.2:g=3,afade=t=in:st=0:d=0.45,afade=t=out:st=10.2:d=1.8[aout]")

    os.makedirs(os.path.dirname(mp4_out), exist_ok=True)
    cmd = [
        ffmpeg_bin, "-y",
        *inputs,
        "-filter_complex", "".join(filter_parts),
        "-map", "[vout]",
        "-map", "[aout]",
        "-c:v", "libx264", "-preset", "fast", "-crf", "22",
        "-c:a", "aac", "-b:a", "192k", "-ar", "44100",
        "-movflags", "+faststart",
        "-t", "12.0",
        mp4_out,
    ]
    subprocess.run(cmd, check=True)


def build_feed_4_5(photo_path: str, kicker: str, headline: str, subline: str, badge_top: str, out_path: str, cta_text: str = "Ver ficha completa · ZAGUÁN Propiedades"):
    fw, fh = 1080, 1350
    split = 742
    bg = Image.new("RGB", (fw, fh), (8, 21, 33))
    im = Image.open(photo_path).convert("RGB")
    bg.paste(fit_cover(im, fw, split + 36, focus_y=0.45), (0, 0))

    ov = Image.new("RGBA", (fw, fh), (0, 0, 0, 0))
    draw = ImageDraw.Draw(ov)

    for y in range(210):
        alpha = int(175 * (1 - y / 210) ** 1.4)
        draw.line([(0, y), (fw, y)], fill=(8, 21, 33, alpha))

    for y in range(split - 120, split):
        t = (y - (split - 120)) / 120.0
        alpha = int(255 * (t ** 1.6))
        draw.line([(0, y), (fw, y)], fill=(8, 21, 33, alpha))

    draw.rectangle([(0, split), (fw, fh)], fill=(8, 21, 33, 255))
    draw.line([(0, split), (fw, split)], fill=(27, 84, 99, 255), width=3)

    if os.path.isfile(LOGO_PATH):
        logo = Image.open(LOGO_PATH).convert("RGBA")
        th = 40
        ratio = th / logo.height
        lr = logo.resize((int(round(logo.width * ratio)), th), Image.LANCZOS)
        ov.paste(lr, (72, 68), lr)

    f_pill = ImageFont.truetype(FONT_BOLD, 20)
    btxt = badge_top.upper()[:34]
    tw = draw.textlength(btxt, font=f_pill)
    draw.rectangle([(fw - 72 - tw - 40, 64), (fw - 72, 110)], fill=(18, 59, 74, 240), outline=(45, 118, 138, 255), width=2)
    draw.text((fw - 72 - tw - 20, 75), btxt, font=f_pill, fill=(243, 240, 232, 255))

    f_k = ImageFont.truetype(FONT_BOLD, 22)
    ktxt = kicker.upper()[:56]
    ktw = draw.textlength(ktxt, font=f_k)
    draw.rectangle([(72, split + 74), (min(fw - 72, 72 + ktw + 40), split + 120)], fill=(18, 59, 74, 255), outline=(45, 118, 138, 255), width=1)
    draw.text((92, split + 85), ktxt, font=f_k, fill=(183, 214, 224, 255))

    f_h = ImageFont.truetype(FONT_BLACK, 68)
    for idx, line in enumerate(wrap_two_lines(draw, headline, f_h, fw - 144)):
        draw.text((72, split + 144 + idx * 76), line, font=f_h, fill=(243, 240, 232, 255))

    f_s = ImageFont.truetype(FONT_REG, 38)
    for idx, line in enumerate(wrap_two_lines(draw, subline, f_s, fw - 144)):
        draw.text((72, split + 312 + idx * 46), line, font=f_s, fill=(183, 214, 224, 255))

    bx0, by0, bx1, by1 = 72, split + 448, fw - 72, split + 528
    draw.rectangle([(bx0, by0), (bx1, by1)], fill=(243, 240, 232, 255))
    f_cta = ImageFont.truetype(FONT_BLACK, 28)
    draw.text((bx0 + 30, by0 + 25), (cta_text if "cta_text" in locals() else "Ver ficha completa · ZAGUÁN Propiedades"), font=f_cta, fill=(8, 21, 33, 255))

    comp = Image.alpha_composite(bg.convert("RGBA"), ov).convert("RGB")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    comp.save(out_path, "JPEG", quality=92)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--spec", required=True, help="JSON con datos públicos del estado 9:16 o pack 4 redes")
    parser.add_argument("--pack-4-redes", action="store_true", help="Genera 4 portadas 4:5 (1080x1350) con fotos reales rotadas")
    args = parser.parse_args()

    with open(args.spec, "r", encoding="utf-8") as f:
        spec = json.load(f)

    if args.pack_4_redes:
        cards = spec.get("cards", [])
        out_files = []
        for idx, c in enumerate(cards, start=1):
            build_feed_4_5(
                c["photo"],
                c["kicker"],
                c["headline"],
                c["subline"],
                c.get("badge_top") or spec.get("operacion_badge", "ALQUILER ANUAL"),
                c["out_path"],
                c.get("cta_text") or "Ver ficha completa · ZAGUÁN Propiedades",
            )
            out_files.append(c["out_path"])
        print(json.dumps({"ok": True, "pack_4_redes": out_files}))
        return

    photos_dir = spec["photos_dir"]
    photos = sorted([
        os.path.join(photos_dir, fn)
        for fn in os.listdir(photos_dir)
        if fn.lower().endswith((".jpg", ".jpeg", ".png")) and not fn.startswith(".")
    ])
    if not photos:
        raise SystemExit(f"No hay fotos en {photos_dir}")

    ffmpeg_bin = spec.get("ffmpeg_bin") or FFMPEG_DEFAULT
    audio_path = spec.get("audio_path") or AUDIO_DEFAULT
    jpg_out = spec["jpg_out"]
    mp4_out = spec["mp4_out"]

    with tempfile.TemporaryDirectory() as scratch_dir:
        overlay_path, ov = build_overlay(spec, scratch_dir)
        build_jpg(photos[0], ov, jpg_out)
        build_mp4(photos, overlay_path, mp4_out, audio_path, ffmpeg_bin, scratch_dir)

    print(json.dumps({"ok": True, "jpg": jpg_out, "mp4": mp4_out, "photos_used": len(photos)}))


if __name__ == "__main__":
    main()
