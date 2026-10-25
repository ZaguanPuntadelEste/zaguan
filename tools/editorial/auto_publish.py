#!/usr/bin/env python3
"""
ZAGUÁN Propiedades — Publicador Editorial Automatizado (Novedades del Este)
Publica automáticamente la siguiente nota programada en catalog/editorial_queue.json
según la fecha actual (o con --next para forzar la próxima en cola), y actualiza:
1. /novedades-del-este/<slug>/index.html
2. /novedades-del-este/index.html
3. /assets/js/proyecto.js
4. /catalog/developments/<project_id>.json
5. /proyectos/* y /sitemap.xml (vía tools/site_sync/generate.py)
"""

import os
import sys
import json
import argparse
import subprocess
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
QUEUE_PATH = os.path.join(ROOT, "catalog", "editorial_queue.json")
NOV_DIR = os.path.join(ROOT, "novedades-del-este")


def render_article(item: dict) -> str:
    slug = item["slug"]
    title = item["title"]
    meta_title = item["meta_title"]
    meta_desc = item["meta_desc"]
    eyebrow = item["eyebrow"]
    lead = item["lead"]
    pub_date = item["publish_date"]
    hero_img = item["hero_img"]
    property_id = item["project_id"]
    canonical = f"https://zaguanpropiedades.com/novedades-del-este/{slug}/"
    og_img = f"https://zaguanpropiedades.com{hero_img}"

    schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": "https://zaguanpropiedades.com/#organization",
                "name": "ZAGUÁN Propiedades",
                "url": "https://zaguanpropiedades.com/",
                "logo": {"@type": "ImageObject", "url": "https://zaguanpropiedades.com/assets/brand/zaguan-black.png"}
            },
            {
                "@type": "BlogPosting",
                "@id": f"{canonical}#article",
                "mainEntityOfPage": {"@type": "WebPage", "@id": canonical},
                "headline": title,
                "description": meta_desc,
                "datePublished": pub_date,
                "dateModified": pub_date,
                "inLanguage": "es-UY",
                "image": [og_img],
                "author": {"@id": "https://zaguanpropiedades.com/#organization"},
                "publisher": {"@id": "https://zaguanpropiedades.com/#organization"},
                "articleSection": "Novedades del Este"
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://zaguanpropiedades.com/"},
                    {"@type": "ListItem", "position": 2, "name": "Novedades del Este", "item": "https://zaguanpropiedades.com/novedades-del-este/"},
                    {"@type": "ListItem", "position": 3, "name": title, "item": canonical}
                ]
            }
        ]
    }
    facts_html = "".join(f'<div class="fact"><span>{k}</span><strong>{v}</strong></div>' for k, v in item.get("facts", []))
    wa_url = f"https://wa.me/59898712064?text=Hola%2C%20le%C3%AD%20la%20nota%20{slug}%20en%20Novedades%20del%20Este%20y%20quiero%20consultar."
    cta_link = f"/proyectos/{property_id}/"

    return f"""<!doctype html>
<html lang="es-UY"><head>
<script>(function(w,d,s,l,i){{w[l]=w[l]||[];w[l].push({{'gtm.start':new Date().getTime(),event:'gtm.js'}});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);}})(window,document,'script','dataLayer','GTM-KTKLTW5T');</script>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#081521">
<title>{meta_title}</title><meta name="description" content="{meta_desc}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="{canonical}">
<link rel="icon" href="/favicon.ico" sizes="any"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<meta property="og:type" content="article"><meta property="og:locale" content="es_UY"><meta property="og:site_name" content="ZAGUÁN Propiedades"><meta property="og:title" content="{title}"><meta property="og:description" content="{meta_desc}"><meta property="og:url" content="{canonical}"><meta property="og:image" content="{og_img}"><meta property="article:section" content="Novedades del Este"><meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/novedades-del-este.css">
<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
</head><body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KTKLTW5T" height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>
<a class="skip" href="#contenido">Ir al contenido</a><header class="site-header" id="site-header"><div class="container header-inner"><a class="brand" href="/" aria-label="ZAGUÁN, inicio"><img class="brand-logo brand-logo--white" src="/assets/brand/zaguan-white.png" alt="ZAGUÁN"><img class="brand-logo brand-logo--black" src="/assets/brand/zaguan-black.png" alt=""></a><nav class="main-nav" aria-label="Navegación principal"><a href="/proyectos/">Proyectos</a><a href="/novedades-del-este/" aria-current="page">Novedades del Este</a><a href="/busqueda-personalizada/#formulario">Búsqueda personalizada</a><a href="/publicar/">Publicar propiedad</a><a href="{wa_url}" target="_blank" rel="noopener noreferrer">Contactanos por WhatsApp</a></nav><nav class="language-nav" aria-label="Selector de idioma"><a href="/novedades-del-este/{slug}/" lang="es" aria-current="page">ES</a><a href="/en/" lang="en">EN</a><a href="/pt/" lang="pt">PT</a></nav><button class="menu-toggle" id="menu-toggle" type="button" aria-label="Abrir menú" aria-controls="mobile-menu" aria-expanded="false"><span></span><span></span><span></span></button></div><nav class="mobile-menu" id="mobile-menu" aria-label="Menú móvil"><div class="container mobile-menu-inner"><a href="/proyectos/">Proyectos</a><a href="/novedades-del-este/" aria-current="page">Novedades del Este</a><a href="/busqueda-personalizada/#formulario">Búsqueda personalizada</a><a href="/publicar/">Publicar propiedad</a><a href="{wa_url}" target="_blank" rel="noopener noreferrer">Contactanos por WhatsApp</a></div></nav></header>
<main id="contenido"><article><header class="hero"><div class="container"><nav class="breadcrumbs" aria-label="Ruta"><a href="/">Inicio</a> / <a href="/novedades-del-este/">Novedades del Este</a></nav><p class="eyebrow" id="novedades">{eyebrow}</p><h1>{title}</h1><p class="lead">{lead}</p><p class="byline">Por ZAGUÁN Propiedades · Publicado el {pub_date}</p></div></header><section class="facts" aria-label="Datos clave"><div class="container facts-grid">{facts_html}</div></section><div class="container article-layout"><div class="article-body">
<figure><img src="{hero_img}" alt="{title}" fetchpriority="high" decoding="async"><figcaption>Imagen ilustrativa del proyecto comercializado por ZAGUÁN Propiedades.</figcaption></figure>
{item["body_html"]}
<section class="cta" aria-label="Consulta comercial"><p class="eyebrow">ZAGUÁN Propiedades · Punta del Este · Maldonado</p><h2>Consultá unidades y condiciones con ZAGUÁN.</h2><p>Pedí planos, disponibilidad actualizada y el esquema completo de pagos.</p><a class="button button--light" href="{cta_link}" data-cta="{property_id}-ficha">Ver ficha del proyecto</a><a class="button" href="{wa_url}" target="_blank" rel="noopener noreferrer" data-cta="{property_id}-whatsapp">Contactanos por WhatsApp</a></section>
<p class="source-note">Base editorial: información comercial y memoria técnica aportadas a ZAGUÁN Propiedades. Las imágenes de proyecto son ilustrativas. Disponibilidad, precio y condiciones se presentan para la unidad consultada.</p>
</div><aside aria-label="Navegación"><nav class="toc"><p>Accesos directos</p><a href="{cta_link}">Ver ficha del proyecto</a><a href="/proyectos/">Todos los proyectos</a><a href="/novedades-del-este/">Novedades del Este</a></nav></aside></div></article></main>
<footer class="site-footer"><div class="container footer-inner"><a href="/" aria-label="ZAGUÁN, inicio"><img class="footer-logo" src="/assets/brand/zaguan-white.png" alt="ZAGUÁN"></a><nav class="footer-links" aria-label="Pie de página"><a href="/proyectos/">Proyectos</a><a href="/novedades-del-este/">Novedades del Este</a><a href="{wa_url}" target="_blank" rel="noopener noreferrer">Contactanos por WhatsApp</a><a href="/privacidad/">Privacidad</a><a href="/aviso-legal/">Aviso legal</a></nav></div></footer>
<script src="/assets/js/novedades-header.js"></script>
</body></html>"""


def publish_item(item: dict):
    slug = item["slug"]
    out_dir = os.path.join(NOV_DIR, slug)
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(render_article(item))

    # 1. Prepend card into novedades-del-este/index.html
    nov_index_path = os.path.join(NOV_DIR, "index.html")
    if os.path.isfile(nov_index_path):
        with open(nov_index_path, "r", encoding="utf-8") as f:
            nov_html = f.read()
        marker = '<section class="container news-grid" aria-label="Notas publicadas">'
        if marker in nov_html and f"/novedades-del-este/{slug}/" not in nov_html:
            imgs_json = json.dumps(item.get("gallery_imgs", [item["hero_img"]]))
            card_html = f"""\n<article class="news-card"><div data-novedades-gallery data-images='{imgs_json}'><a class="news-cover" href="/novedades-del-este/{slug}/" aria-label="Leer {item['title']}"><img src="{item['hero_img']}" alt="{item['title']}" loading="lazy" decoding="async"></a><div class="gallery-controls"><button class="gallery-direction" data-direction="-1" type="button" aria-label="Imagen anterior">‹</button><span>Imágenes · Deslizá</span><button class="gallery-direction" data-direction="1" type="button" aria-label="Imagen siguiente">›</button></div></div><div class="news-copy"><p class="eyebrow">{item['card_eyebrow']}</p><h2><a href="/novedades-del-este/{slug}/">{item['card_title']}</a></h2><p>{item['card_summary']}</p><a class="button button--plain" href="/novedades-del-este/{slug}/">Leer la nota</a></div></article>"""
            nov_html = nov_html.replace(marker, marker + card_html, 1)
            with open(nov_index_path, "w", encoding="utf-8") as f:
                f.write(nov_html)

    # 2. Add to catalog/developments/<project_id>.json (if running locally)
    dev_path = os.path.join(ROOT, "catalog", "developments", f"{item['project_id']}.json")
    url = f"/novedades-del-este/{slug}/"
    if os.path.isfile(dev_path):
        with open(dev_path, "r", encoding="utf-8") as f:
            dev = json.load(f)
        existing_urls = {a["url"] for a in dev.get("editorial_articles", [])}
        if url not in existing_urls:
            dev.setdefault("editorial_articles", []).insert(0, {
                "url": url,
                "title": item["title"],
                "snippet": item["card_summary"],
                "date_published": item["publish_date"]
            })
            with open(dev_path, "w", encoding="utf-8") as f:
                json.dump(dev, f, indent=2, ensure_ascii=False)

    # 3. Also update sitemap.xml directly (for GitHub Actions cloud runs)
    sitemap_path = os.path.join(ROOT, "sitemap.xml")
    full_loc = f"https://zaguanpropiedades.com{url}"
    if os.path.isfile(sitemap_path):
        with open(sitemap_path, "r", encoding="utf-8") as f:
            sm = f.read()
        if full_loc not in sm and "</urlset>" in sm:
            entry = f"""  <url>
    <loc>{full_loc}</loc>
    <lastmod>{item['publish_date']}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>"""
            sm = sm.replace("</urlset>", entry)
            with open(sitemap_path, "w", encoding="utf-8") as f:
                f.write(sm)

    print(f"Published article: /novedades-del-este/{slug}/ ({item['publish_date']})")


def main():
    parser = argparse.ArgumentParser(description="Auto-publish scheduled Novedades del Este articles.")
    parser.add_argument("--next", action="store_true", help="Force publish the next scheduled article regardless of date.")
    parser.add_argument("--date", type=str, default=datetime.now().strftime("%Y-%m-%d"), help="Reference YYYY-MM-DD date.")
    args = parser.parse_args()

    if not os.path.isfile(QUEUE_PATH):
        print("No editorial queue found.")
        return

    with open(QUEUE_PATH, "r", encoding="utf-8") as f:
        queue = json.load(f)

    published_count = 0
    for item in queue:
        if item.get("status") != "scheduled":
            continue
        if args.next or item["publish_date"] <= args.date:
            publish_item(item)
            item["status"] = "published"
            item["published_at"] = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
            published_count += 1
            if args.next:
                break

    if published_count > 0:
        with open(QUEUE_PATH, "w", encoding="utf-8") as f:
            json.dump(queue, f, indent=2, ensure_ascii=False)
        gen_script = os.path.join(ROOT, "tools", "site_sync", "generate.py")
        if os.path.isfile(gen_script):
            subprocess.run([sys.executable, gen_script], check=True)
        print(f"Successfully published {published_count} article(s) and updated sitemap/project pages.")
    else:
        print(f"No articles due on or before {args.date}. Next scheduled article is ready in queue.")


if __name__ == "__main__":
    main()
