#!/usr/bin/env python3
"""
Poka-Yoke Mecánico · 1 - ZAGUÁN
Árbitro ciego (PASS / FAIL) para validar textos de Mar/WhatsApp/Ads y placas visuales
antes de entregar a Ariana o publicar.
"""
import argparse
import os
import re
import sys


VALID_VERTICALS = {
    "O1", "O2", "O3", "O4", "O5", "O6", "O7",
    "D1", "D2", "D3", "D4", "D5", "D6", "D7",
    "BIENVENIDA_PASIVA",
}

ZAGUAN_ALLOWED_HEX = [
    "#F3EFE6", "#F3F0E8", "#B7D6E0", "#162A3E", "#123B4A",
    "#081521", "#0A1E28", "#1B5463", "#0F2738", "#16374D",
    "#52606D", "#A3B3C2", "#9FB3C8", "#D4CCBD", "#F5F7FA",
    "#FFFFFF", "#000000", "#1C1917",
]
ZAGUAN_ALLOWED_RGB = [
    (int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16))
    for h in ZAGUAN_ALLOWED_HEX
]


def _closest_palette_dist(r: int, g: int, b: int) -> float:
    return min(
        ((r - ar) ** 2 + (g - ag) ** 2 + (b - ab) ** 2) ** 0.5
        for ar, ag, ab in ZAGUAN_ALLOWED_RGB
    )


def audit_text(text: str, vertical: str, primer_contacto: bool = False) -> list[str]:
    errs = []
    v = vertical.upper().strip()
    if v not in VALID_VERTICALS:
        errs.append(f"Vertical inválida '{vertical}'. Válidas: {sorted(VALID_VERTICALS)}")
        return errs

    if "¿" in text or "¡" in text:
        errs.append("Signo de apertura prohibido ('¿' o '¡') en texto de Zaguán/WhatsApp.")

    mente_matches = re.findall(r"\b[a-záéíóúüñ]{3,}mente\b", text, re.IGNORECASE)
    if mente_matches:
        errs.append(f"Adverbio terminado en '-mente' prohibido: {', '.join(sorted(set(mente_matches)))}")

    if re.search(r"\bencajar\b", text, re.IGNORECASE):
        errs.append("Palabra prohibida detectada: 'encajar'.")

    if primer_contacto and re.search(r"(comisi[oó]n|honorarios?|\d+\s*%)", text, re.IGNORECASE):
        errs.append("Prohibido mencionar '%', comisión u honorarios en 1° contacto.")

    # Garantía aseguradora únicamente en O6 y D2
    if v not in {"O6", "D2"}:
        gar_match = re.search(
            r"\b(garant[ií]a\s+aseguradora|porto\s+seguro|sura|mapfre|anda|cgn)\b",
            text,
            re.IGNORECASE,
        )
        if gar_match:
            errs.append(
                f"Garantía de alquiler ('{gar_match.group(0)}') mezclada en vertical '{v}' (solo aplica a O6/D2)."
            )

    # Candado de Franja Gris: prohibido entregar URL pública de ficha individual a dueño (O1..O6)
    if re.match(r"^O[1-6]$", v):
        ficha_urls = re.findall(
            r"https?://zaguanpropiedades\.com/(?:alquileres|ventas|proyectos)/[a-z0-9-]+/?",
            text,
            re.IGNORECASE,
        )
        if ficha_urls:
            errs.append(
                f"CANDADO DE FRANJA GRIS violado: se intentó enviar URL pública de ficha ({', '.join(ficha_urls)}) al propietario '{v}'."
            )

    # Bienvenida pasiva: prohibido prometer atención humana inmediata falsa
    if v == "BIENVENIDA_PASIVA":
        if re.search(
            r"(mientras te respondo|c[oó]mo podemos ayudarte|contame qu[eé] est[aá]s buscando,\s*as[ií] te paso|respondemos en el acto)",
            text,
            re.IGNORECASE,
        ):
            errs.append(
                "BIENVENIDA_PASIVA inválida: promete respuesta humana inmediata en lugar de derivar a autoservicio (/links/)."
            )
        if "zaguanpropiedades.com" not in text.lower():
            errs.append("BIENVENIDA_PASIVA inválida: falta link vivo de autoservicio a zaguanpropiedades.com.")

    # Horarios internos del propietario (SOLO agenda interna de Ariana — prohibido en público)
    owner_sched = re.search(
        r"\b(?:desde\s+las\s+\d{1,2}|todos\s+los\s+d[ií]as\s+desde|\d{1,2}:00\s*hs|\d{1,2}\s*hs\+?)",
        text,
        re.IGNORECASE,
    )
    if owner_sched:
        errs.append(
            f"FUGA DE HORARIO INTERNO DEL DUEÑO ('{owner_sched.group(0)}'): "
            "la disponibilidad del propietario es solo para agenda interna; en público usar 'con cita previa'."
        )

    return errs


def audit_image(path: str) -> list[str]:
    errs = []
    if not os.path.isfile(path):
        return [f"Archivo no encontrado: {path}"]

    try:
        from PIL import Image
    except ImportError:
        return ["Falta librería Pillow (PIL) para inspeccionar dimensiones y píxeles."]

    with Image.open(path) as im:
        w, h = im.size
        if (w, h) not in {(1080, 1350), (1080, 1920), (1000, 1000), (1200, 1200)}:
            errs.append(
                f"Dimensión fuera de estándar Zaguán: {w}x{h} (permitido: 1080x1350, 1080x1920, 1000x1000 o 1200x1200)."
            )

        rgb = im.convert("RGB")
        px = rgb.load()
        # Auditar franja de marca/texto inferior (55% hacia abajo): detectar píxeles gráficos planos o saturados fuera de paleta oficial
        y_start = int(h * 0.55)
        sampled = 0
        off_palette_flat = 0
        off_palette_saturated = 0
        off_samples = []
        for y in range(y_start, h - 2, 3):
            for x in range(0, w - 2, 3):
                sampled += 1
                r, g, b = px[x, y]
                nr, ng, nb = px[x + 2, y]
                dist = _closest_palette_dist(r, g, b)
                is_flat_graphic = abs(r - nr) <= 2 and abs(g - ng) <= 2 and abs(b - nb) <= 2
                chroma = max(r, g, b) - min(r, g, b)
                if dist > 42:
                    if is_flat_graphic:
                        off_palette_flat += 1
                        if len(off_samples) < 4:
                            off_samples.append(f"#{r:02X}{g:02X}{b:02X}")
                    elif chroma > 95 and max(r, g, b) > 190 and dist > 55:
                        off_palette_saturated += 1
                        if len(off_samples) < 4:
                            off_samples.append(f"#{r:02X}{g:02X}{b:02X}")

        if sampled > 0 and (off_palette_flat / sampled > 0.04 or off_palette_saturated > 35):
            errs.append(
                f"Colores fuera de la paleta oficial de Zaguán en zona gráfica ({', '.join(sorted(set(off_samples)))}). "
                "Usar lo que SÍ existe en la identidad Zaguán: crema #F3EFE6, celeste #B7D6E0, azul profundo #162A3E / #0A1E28 y blanco #FFFFFF."
            )

    return errs


def audit_ficha_html(html_path: str, boveda_path: str | None = None) -> list[str]:
    errs = []
    if not os.path.isfile(html_path):
        return [f"Ficha HTML no encontrada: {html_path}"]

    with open(html_path, "r", encoding="utf-8") as f:
        raw = f.read()
    low = raw.lower()

    m_padron = re.search(
        r"\b(?:Padr[oó]n\s*(?:N[°º]?\s*)?\d+|Manzana\s+Catastral\s+\d+|Carpeta\s*(?:Catastral\s*)?\d+)\b",
        raw,
        re.IGNORECASE,
    )
    if m_padron:
        errs.append(
            f"CANDADO FICHA PRIVADA VS. PÚBLICA: '{m_padron.group(0)}' está expuesto en la web pública. "
            "Debe vivir únicamente en FICHAS_PRIVADAS_BOVEDA_ZAGUAN.json."
        )

    for tc_pat in (
        r"\ben Construcci[oó]n\b",
        r"\bHormig[oó]n Armado\b",
        r"\bTerreno Propio\b",
        r"\bSuperficie Edificada\b",
        r"\bRecorrela en Video\b",
    ):
        m_tc = re.search(tc_pat, raw)
        if m_tc:
            errs.append(f"Title Case anglosajón prohibido en ficha pública: '{m_tc.group(0)}'.")

    if re.search(r"\bcasa en construcci[oó]n\b", low):
        errs.append("Vertical O5 mal nombrada como 'Casa en construcción'. Usar 'Proyecto en construcción'.")

    if ("santa mónica" in low or "hormigón" in low) and "proyecto en construcción" in low:
        faltan_seo = [
            kw for kw in ("proyecto", "lote", "terreno", "santa mónica", "josé ignacio", "laguna")
            if kw not in low
        ]
        if faltan_seo:
            errs.append(f"Racimo SEO/GEO incompleto para proyecto O5: faltan {', '.join(faltan_seo)}.")

    for bad_c in (
        "#10b981", "#2ecc71", "#25d366", "#20ba5a", "#16a34a", "#22c55e",
        "#e74c3c", "#ef4444", "#dc2626", "rgba(16, 185, 129", "rgba(16,185,129",
    ):
        if bad_c in low:
            errs.append(
                f"Color verde o rojo prohibido detectado ({bad_c}). Usar solo paleta oficial Zaguán (el rojo se reserva únicamente al pin 📍)."
            )

    # Protocolo Pre-Pauta obligatorio: GA4/GTM presente en toda ficha pública y operación + generate_lead si hay formulario
    if "g-e3dvx8nwpr" not in low and "gtm-ktkltw5t" not in low:
        errs.append("Falta etiqueta de analítica (G-E3DVX8NWPR o GTM-KTKLTW5T) en ficha pública antes de pautar.")
    if "lf-triage-form" in low:
        if "generate_lead" not in low:
            errs.append("Formulario de pre-calificación sin evento de conversión generate_lead para Google Analytics.")
        if not re.search(r"\b(alquiler\s+anual|venta|pozo)\b", low):
            errs.append("Falta palabra de operación explícita (alquiler anual, venta o pozo) junto al grupo conceptual.")

    # Verificar que exista respaldo en Bóveda Privada para la ficha (Drive admin/ o Desktop ZAGUAN CLAUDE/)
    candidates = [
        boveda_path,
        os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(html_path)), "..", "admin", "FICHAS_PRIVADAS_BOVEDA_ZAGUAN.json")),
        "/Users/arianawajntraub/Library/CloudStorage/GoogleDrive-ariana@starunionservicios.com.ar/Mi unidad/zaguan/zaguan-main/admin/FICHAS_PRIVADAS_BOVEDA_ZAGUAN.json",
        "/Users/arianawajntraub/Desktop/ZAGUAN CLAUDE/FICHAS_PRIVADAS_BOVEDA_ZAGUAN.json",
    ]
    bpath = next((p for p in candidates if p and os.path.isfile(p)), "")
    if not bpath:
        errs.append("Falta archivo de Bóveda Privada FICHAS_PRIVADAS_BOVEDA_ZAGUAN.json en Drive/admin o Desktop/ZAGUAN CLAUDE.")
    else:
        import json
        with open(bpath, "r", encoding="utf-8") as bf:
            bdata = json.load(bf)
        fichas = bdata.get("fichas", [])
        slug = os.path.basename(os.path.dirname(os.path.abspath(html_path)))
        match = [x for x in fichas if slug in (x.get("url_publica_sin_padron") or x.get("url_publica_sin_contacto") or "")]
        if not match:
            errs.append(f"La propiedad '{slug}' no tiene su respaldo guardado en {bpath} ('Nada se puede perder').")

    return errs


def main():
    parser = argparse.ArgumentParser(description="Poka-Yoke mecánico ZAGUÁN (PASS / FAIL)")
    sub = parser.add_subparsers(dest="mode", required=True)

    p_txt = sub.add_parser("texto", help="Valida un mensaje o copy contra los Poka-Yokes de ZAGUÁN")
    p_txt.add_argument("--vertical", required=True, help="O1..O7, D1..D7 o BIENVENIDA_PASIVA")
    p_txt.add_argument("--primer-contacto", action="store_true", help="Activa bloqueo de %% y comisiones")
    p_txt.add_argument("mensaje", help="Texto completo a auditar")

    p_img = sub.add_parser("imagen", help="Valida dimensiones y ausencia de texto amarillo en placas")
    p_img.add_argument("ruta", help="Ruta a imagen JPG o PNG")

    p_html = sub.add_parser("ficha-html", help="Audita una ficha HTML pública contra los 7 Poka-Yokes y la Bóveda Privada")
    p_html.add_argument("ruta", help="Ruta al index.html de la propiedad")
    p_html.add_argument("--boveda", help="Ruta opcional a FICHAS_PRIVADAS_BOVEDA_ZAGUAN.json")

    args = parser.parse_args()
    if args.mode == "texto":
        errs = audit_text(args.mensaje, args.vertical, args.primer_contacto)
    elif args.mode == "imagen":
        errs = audit_image(args.ruta)
    else:
        errs = audit_ficha_html(args.ruta, args.boveda)

    if errs:
        print("FAIL")
        for e in errs:
            print(f"- {e}")
        sys.exit(1)

    print("PASS")
    sys.exit(0)


if __name__ == "__main__":
    main()
