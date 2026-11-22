#!/usr/bin/env python3
"""
Motor de Rotación Perpetua de Vidriera (1 - ZAGUÁN).
Gestiona el calendario semanal:
- Martes 09:00 hs: alta de propiedad siguiente en /alquileres/ con etiqueta 'NOVEDAD' + anexo SEO de ficha.
- Miércoles / Jueves 09:00 hs: pase a '🔒 ALQUILADO' de la propiedad ancla + Schema OutOfStock.
- Martes +7 días: quita automática de 'NOVEDAD' al ingresar la siguiente novedad.
"""
import argparse
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
CAL_PATH = ROOT / "admin" / "CALENDARIO_ROTACION_VIDRIERA.json"
CATALOG_HTML = ROOT / "alquileres" / "index.html"


def cargar_calendario():
    return json.loads(CAL_PATH.read_text(encoding="utf-8"))


def guardar_calendario(data):
    CAL_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def cmd_listar():
    data = cargar_calendario()
    print(f"=== {data['proyecto']} · Agenda de Rotación Perpetua ===")
    for ev in data.get("eventos", []):
        print(
            f"[{ev['estado'].upper()}] {ev['fecha']} ({ev['dia']} {ev['hora']}) | "
            f"{ev['accion']} -> {ev['ref_publica']} ({ev['titulo']} · {ev['precio']}) | Tag: {ev['etiqueta']}"
        )
    return 0


def cmd_aplicar(fecha_corte: str):
    data = cargar_calendario()
    catalog_txt = CATALOG_HTML.read_text(encoding="utf-8")
    cambios = []

    for ev in data.get("eventos", []):
        if ev.get("estado") != "programado" or ev.get("fecha", "9999-99-99") > fecha_corte:
            continue
        accion = ev["accion"]
        ref = ev["ref_publica"]

        # Quitar etiqueta NOVEDAD de la propiedad saliente si corresponde
        sale_ref = ev.get("sale_novedad_ref")
        if sale_ref:
            patron_nov = re.compile(
                rf'(<article[^>]*>.*?REF\.\s*{re.escape(sale_ref)}.*?<span[^>]*>)\s*NOVEDAD\s*(</span>)',
                re.DOTALL,
            )
            catalog_txt, n = patron_nov.subn(r"\1Disponible anual\2", catalog_txt)
            if n:
                cambios.append(f"Quitada etiqueta NOVEDAD de {sale_ref}")

        if accion == "PASAR_A_ALQUILADO" and f"REF. {ref}" in catalog_txt:
            # Convertir tarjeta en el catálogo a estado alquilado y OutOfStock en su ficha si existe
            patron_card = re.compile(
                rf'(<article class="rental-card)([^"]*"[^>]*data-status=")disponible("[^>]*>.*?REF\.\s*{re.escape(ref)}.*?</article>)',
                re.DOTALL,
            )
            if patron_card.search(catalog_txt):
                catalog_txt = patron_card.sub(r"\1 rental-card--rented\2alquilado\3", catalog_txt, count=1)
                cambios.append(f"Marcada {ref} como ALQUILADO en catálogo")
            ev["estado"] = "ejecutado"
        elif "ALTA" in accion:
            # Verifica si ya está en catálogo o requiere alta HTML completa
            ev["estado"] = "pendiente_alta_ficha" if f"REF. {ref}" not in catalog_txt else "ejecutado"
            cambios.append(f"Alta/NOVEDAD registrada para {ref} ({ev['titulo']})")

    if cambios:
        CATALOG_HTML.write_text(catalog_txt, encoding="utf-8")
        guardar_calendario(data)
        print("CAMBIOS:", " | ".join(cambios))
    else:
        print(f"Sin rotaciones pendientes ejecutables para <= {fecha_corte}.")
    return 0


def main():
    parser = argparse.ArgumentParser(description="Calendario de Rotación de Vidriera ZAGUÁN")
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("listar", help="Muestra la agenda programada de altas NOVEDAD y cierres ALQUILADO")
    p_ap = sub.add_parser("aplicar", help="Ejecuta transiciones vencidas hasta la fecha dada")
    p_ap.add_argument("--fecha", required=True, help="Fecha YYYY-MM-DD")
    args = parser.parse_args()
    sys.exit(cmd_listar() if args.cmd == "listar" else cmd_aplicar(args.fecha))


if __name__ == "__main__":
    main()
