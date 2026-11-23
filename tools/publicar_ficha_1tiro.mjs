#!/usr/bin/env node
/**
 * ZAGUÁN Propiedades — Orquestador de Fábrica en 1 Tiro (Publicación Completa)
 *
 * Modos:
 *   node tools/publicar_ficha_1tiro.mjs --audit ZAG-ALQ-07
 *   node tools/publicar_ficha_1tiro.mjs --init-template /tmp/ficha_nueva.json
 *   node tools/publicar_ficha_1tiro.mjs --publish /tmp/ficha_nueva.json [--push] [--dry-run]
 *
 * Al ejecutar --publish, produce en 1 sola corrida:
 *   1. Validación Poka-Yoke: cero dirección exacta / dueño / padrón en textos públicos + cero adverbios -mente.
 *   2. Bóveda Privada (FICHAS_PRIVADAS_BOVEDA_ZAGUAN.json) actualizada sin exponer en git público.
 *   3. Copia/validación de fotos reales (desde ZIP o carpeta) hacia assets/images/propiedades/<slug>/.
 *   4. Generación de Ficha Pública HTML (/alquileres/<slug>/index.html o /propiedades/<slug>/index.html)
 *      con Schema.org JSON-LD, Open Graph, Simulador de Garantías y Widget Pedidos Abiertos.
 *   5. Generación 9:16 JPG + MP4 animado con música y afade (assets/estados/) + estados_hoy.json.
 *   6. Alta automática en Home/Blog (assets/js/ultimas-propiedades-zaguan.js), Catálogo (/alquileres/ o /propiedades/),
 *      Simulador (/garantias-alquiler/), sitemap.xml y llms.txt.
 *   7. Con --push: commit + push origin main + chequeo 200 OK live + ping IndexNow + envío automático a Telegram.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const BOVEDA_PATH = "/Users/arianawajntraub/Desktop/ZAGUAN CLAUDE/FICHAS_PRIVADAS_BOVEDA_ZAGUAN.json";
const WORKER_BASE = "https://zaguan-crm-bot.943ari.workers.dev";
const BASE_URL = "https://zaguanpropiedades.com";

const FORBIDDEN_MENTE_RE = /\b[a-záéíóúñ]{4,}mente\b/i;

function parseArgs(argv) {
  const out = { flags: {}, positional: [] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const k = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) out.flags[k] = true;
      else {
        out.flags[k] = next;
        i++;
      }
    } else {
      out.positional.push(a);
    }
  }
  return out;
}

function readUtf8(relOrAbs) {
  const p = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(ROOT, relOrAbs);
  return fs.readFileSync(p, "utf8");
}

function writeUtf8(relOrAbs, content) {
  const p = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(ROOT, relOrAbs);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
}

function slugifyUpper(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .toUpperCase();
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function assertPublicSafety(spec) {
  const publicBlob = [
    spec.titulo_h1,
    spec.subtitulo,
    spec.titulo_corto,
    spec.detalle_card,
    spec.zona_publica,
    spec.estado_titulo,
    spec.estado_subtitulo,
    spec.copy_estado_1_linea,
    spec.llms_resumen,
  ]
    .filter(Boolean)
    .join(" · ");

  const mMente = publicBlob.match(FORBIDDEN_MENTE_RE);
  if (mMente) {
    throw new Error(`Linter SÍ/NO: adverbio terminado en -mente prohibido en copy público ("${mMente[0]}").`);
  }

  const forbiddenPrivates = [
    spec.privado?.telefono_wa,
    spec.privado?.padron,
    spec.privado?.manzana,
    spec.privado?.carpeta,
    spec.privado?.direccion_exacta,
    ...(spec.privado?.terminos_prohibidos_en_publico || []),
  ]
    .map((x) => String(x || "").trim())
    .filter((x) => x.length >= 4);

  const lowerPub = publicBlob.toLowerCase();
  for (const secret of forbiddenPrivates) {
    if (lowerPub.includes(secret.toLowerCase())) {
      throw new Error(`Candado Franja Gris / Bóveda violado: el dato privado "${secret}" apareció en texto público.`);
    }
  }
}

function ingestPhotos(spec, photosDir) {
  fs.mkdirSync(photosDir, { recursive: true });
  if (spec.fotos_zip && fs.existsSync(spec.fotos_zip)) {
    const tmpUnpack = fs.mkdtempSync("/tmp/zaguan_unpack_");
    execFileSync("unzip", ["-o", spec.fotos_zip, "-d", tmpUnpack], { stdio: "pipe" });
    const rawFiles = fs
      .readdirSync(tmpUnpack)
      .filter((f) => /\.(jpe?g|png)$/i.test(f) && !f.startsWith("."))
      .sort();
    rawFiles.forEach((f, idx) => {
      const dest = path.join(photosDir, `foto_${String(idx + 1).padStart(2, "0")}.jpg`);
      fs.copyFileSync(path.join(tmpUnpack, f), dest);
    });
    fs.rmSync(tmpUnpack, { recursive: true, force: true });
  } else if (spec.fotos_carpeta && fs.existsSync(spec.fotos_carpeta)) {
    const rawFiles = fs
      .readdirSync(spec.fotos_carpeta)
      .filter((f) => /\.(jpe?g|png)$/i.test(f) && !f.startsWith("."))
      .sort();
    rawFiles.forEach((f, idx) => {
      const dest = path.join(photosDir, `foto_${String(idx + 1).padStart(2, "0")}.jpg`);
      if (!fs.existsSync(dest)) fs.copyFileSync(path.join(spec.fotos_carpeta, f), dest);
    });
  }

  const finalPhotos = fs
    .readdirSync(photosDir)
    .filter((f) => /\.(jpe?g|png)$/i.test(f) && !f.startsWith("."))
    .sort();
  if (!finalPhotos.length) {
    throw new Error(`No hay fotos reales en ${photosDir}. Cargá fotos_zip o fotos_carpeta.`);
  }
  return finalPhotos;
}

function buildRentalPdpHtml(spec, photos) {
  const slug = spec.slug;
  const relPath = `/alquileres/${slug}/`;
  const canonical = `${BASE_URL}${relPath}`;
  const totalUyu = Number(spec.total_uyu || spec.precio_uyu || 30000);
  const baseUyu = Number(spec.precio_uyu || totalUyu);
  const gcUyu = Number(spec.gc_uyu || 0);
  const simHref = `/garantias-alquiler/?alquiler=${totalUyu}&propiedad=${encodeURIComponent(slug)}`;
  const waMsg = encodeURIComponent(
    `Hola Mar, consulto por el alquiler anual Ref. ${spec.ref_publica} (${spec.titulo_corto}).`
  );
  const waUrl = `https://wa.me/59898712064?text=${waMsg}`;
  const leadPhotoUrl = `${BASE_URL}/assets/images/propiedades/${spec.fotos_slug || slug}/${photos[0]}`;

  const badgesHtml = (spec.badges || [`REF. ${spec.ref_publica}`, `ALQUILER ANUAL · ${spec.zona_publica.toUpperCase()}`])
    .map((b, i) => `<span class="badge ${i === 1 ? "badge-primary" : i === 2 ? "badge-green" : "badge-outline"}">${escapeHtml(b)}</span>`)
    .join("\n          ");

  const galleryImgsJson = JSON.stringify(
    photos.map((p, i) => ({
      src: `/assets/images/propiedades/${spec.fotos_slug || slug}/${p}`,
      alt: `${spec.titulo_corto} · foto ${i + 1}`,
    }))
  );

  const thumbsHtml = photos
    .map(
      (p, idx) =>
        `<button type="button" class="thumb${idx === 0 ? " active" : ""}" onclick="setSlide(${idx})" style="border:0;padding:0;background:transparent;"><img src="/assets/images/propiedades/${spec.fotos_slug || slug}/${p}" alt="Vista ${idx + 1} de ${escapeHtml(spec.titulo_corto)}" loading="${idx < 3 ? "eager" : "lazy"}"></button>`
    )
    .join("\n          ");

  const specsCards = (spec.ficha_tecnica || [])
    .map(
      (it) =>
        `<div style="background:rgba(15,29,43,0.7);border:1px solid rgba(148,163,184,0.22);border-radius:10px;padding:12px 14px;"><span style="display:block;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#9FB7C5;">${escapeHtml(it.k)}</span><strong style="font-size:14.5px;color:#F8FAFC;">${escapeHtml(it.v)}</strong></div>`
    )
    .join("\n          ");

  const highlightsHtml = (spec.destacados || [])
    .map((d) => `<li style="margin-bottom:8px;">${escapeHtml(d)}</li>`)
    .join("\n          ");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#081521">
  <title>${escapeHtml(spec.seo_title || spec.titulo_h1)} | ZAGUÁN Propiedades</title>
  <meta name="description" content="${escapeHtml(spec.seo_description || spec.subtitulo)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_UY">
  <meta property="og:site_name" content="ZAGUÁN Propiedades">
  <meta property="og:title" content="${escapeHtml(spec.seo_title || spec.titulo_h1)}">
  <meta property="og:description" content="${escapeHtml(spec.seo_description || spec.subtitulo)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${leadPhotoUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${leadPhotoUrl}">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="stylesheet" href="/assets/css/proyecto.css">
  <link rel="stylesheet" href="/assets/css/proyecto-estructura.css">
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Apartment",
    name: spec.titulo_h1,
    description: spec.subtitulo,
    url: canonical,
    image: leadPhotoUrl,
    numberOfRooms: Number(spec.dormitorios || 2),
    address: { "@type": "PostalAddress", addressLocality: spec.zona_publica, addressCountry: "UY" },
    offers: { "@type": "Offer", price: baseUyu, priceCurrency: "UYU", availability: "https://schema.org/InStock" },
  })}</script>
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-KTKLTW5T');</script>
  <style>
    body { background:#081521; color:#F3F0E8; }
    .pdp-wrap { max-width:1120px; margin:0 auto; padding:96px 20px 64px; }
    .badges-row { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; }
    .badge { font-size:11px; font-weight:700; padding:5px 10px; border-radius:999px; letter-spacing:.05em; }
    .badge-outline { border:1px solid rgba(183,214,224,.35); color:#B7D6E0; }
    .badge-primary { background:#123B4A; color:#F3F0E8; }
    .badge-green { background:rgba(22,163,74,.2); border:1px solid rgba(22,163,74,.5); color:#86EFAC; }
    .gallery-lead { position:relative; border-radius:14px; overflow:hidden; background:#0D1E2E; aspect-ratio:16/10; margin:18px 0 12px; }
    .gallery-lead img { width:100%; height:100%; object-fit:cover; display:block; }
    .gallery-thumbs { display:grid; grid-template-columns:repeat(auto-fill,minmax(92px,1fr)); gap:8px; margin-bottom:24px; }
    .gallery-thumbs .thumb img { width:100%; height:72px; object-fit:cover; border-radius:8px; opacity:.75; border:2px solid transparent; }
    .gallery-thumbs .thumb.active img { opacity:1; border-color:#FCD34D; }
    .cta-box { background:#0F1F2E; border:1px solid rgba(212,175,55,.35); border-radius:14px; padding:20px; margin:20px 0; }
  </style>
</head>
<body>
  <header class="site-header" id="site-header">
    <div class="container header-inner">
      <a class="brand" href="/" aria-label="ZAGUÁN, inicio"><img class="brand-logo brand-logo--white" src="/assets/brand/zaguan-white.png" alt="ZAGUÁN"><img class="brand-logo brand-logo--black" src="/assets/brand/zaguan-black.png" alt=""></a>
      <nav class="main-nav" aria-label="Navegación principal"><a href="/alquileres/">Alquiler anual</a><a href="/propiedades/">Venta</a><a href="/proyectos/">Pozo</a><a href="/garantias-alquiler/">Verificador de garantías</a><a href="/novedades-del-este/">Novedades del Este</a></nav>
    </div>
  </header>
  <main class="pdp-wrap" id="contenido">
    <div class="badges-row">${badgesHtml}</div>
    <h1 style="font-size:clamp(24px,3.2vw,36px);line-height:1.18;margin:0 0 10px;">${escapeHtml(spec.titulo_h1)}</h1>
    <p style="font-size:16px;color:#CBD5E1;line-height:1.55;margin:0 0 18px;">${escapeHtml(spec.subtitulo)}</p>
    <div class="cta-box">
      <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:12px;">
        <div>
          <strong style="font-size:28px;color:#FFFFFF;">$U ${baseUyu.toLocaleString("de-DE")}</strong>
          <span style="color:#CBD5E1;">/ mes ${gcUyu ? `+ $U ${gcUyu.toLocaleString("de-DE")} gastos comunes` : "(gastos comunes incluidos)"}</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;">
          <a href="${simHref}" style="background:#F3F0E8;color:#081521;font-weight:700;padding:11px 16px;border-radius:8px;text-decoration:none;">Simular garantía en 30 segundos →</a>
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="background:#16A34A;color:#FFFFFF;font-weight:700;padding:11px 16px;border-radius:8px;text-decoration:none;">📲 Consultar visita por WhatsApp</a>
        </div>
      </div>
    </div>
    <div class="gallery-lead"><img id="main-img" src="/assets/images/propiedades/${spec.fotos_slug || slug}/${photos[0]}" alt="${escapeHtml(spec.titulo_corto)}"></div>
    <div class="gallery-thumbs">${thumbsHtml}</div>
    <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin:22px 0;">${specsCards}</section>
    <section style="margin:24px 0;"><h2 style="font-size:20px;margin-bottom:10px;">Qué destacamos de esta propiedad</h2><ul style="padding-left:20px;color:#E2E8F0;line-height:1.6;">${highlightsHtml}</ul></section>
    <div id="zaguan-pedido-abierto-box" data-contexto="${escapeHtml(spec.contexto_crm || "general")}" data-operacion="Alquiler Anual" data-zona="${escapeHtml(spec.zona_publica)}" data-titulo="${escapeHtml(spec.titulo_corto)}"></div>
  </main>
  <script>
    const SLIDES = ${galleryImgsJson};
    function setSlide(i) {
      const s = SLIDES[i]; if (!s) return;
      document.getElementById('main-img').src = s.src;
      document.getElementById('main-img').alt = s.alt;
      document.querySelectorAll('.gallery-thumbs .thumb').forEach((el, idx) => el.classList.toggle('active', idx === i));
    }
  </script>
  <script src="/assets/js/pedidos-abiertos-widget.js" defer></script>
  <script src="/assets/js/novedades-header.js?v=20261123" defer></script>
</body>
</html>`;
}

function updateUltimasPropiedades(spec, relPath, dryRun) {
  const file = "assets/js/ultimas-propiedades-zaguan.js";
  let content = readUtf8(file);
  if (content.includes(`href: '${relPath}'`)) return { updated: false, reason: "ya presente" };

  const isVenta = /venta|compra|pozo/i.test(spec.operacion || "");
  const anchor = isVenta ? "venta: [" : "alquiler: [";
  const newEntryObj = isVenta
    ? `{
        titulo_corto: ${JSON.stringify(spec.titulo_corto)},
        href: '${relPath}',
        badge: ${JSON.stringify(spec.badge_home || "Venta directa · Disponible")},
        precio: ${JSON.stringify(spec.precio_publico)},
        detalle: ${JSON.stringify(spec.resumen_corto)},
        fecha_ingreso: '${new Date().toISOString().slice(0, 10)}'
      },`
    : `{
        titulo_corto: ${JSON.stringify(spec.titulo_corto)},
        href: '${relPath}',
        badge: ${JSON.stringify(spec.badge_home || "Alquiler anual · Nuevo ingreso")},
        precio: ${JSON.stringify(spec.precio_home || `$U ${Number(spec.total_uyu || spec.precio_uyu).toLocaleString("de-DE")} / mes`)},
        detalle: ${JSON.stringify(spec.resumen_corto)},
        alquiler_uyu: ${Number(spec.total_uyu || spec.precio_uyu)},
        fecha_ingreso: '${new Date().toISOString().slice(0, 10)}'
      },`;

  if (!content.includes(anchor)) throw new Error(`No se encontró ${anchor} en ${file}`);
  content = content.replace(anchor, `${anchor}\n      ${newEntryObj}`);
  if (!dryRun) writeUtf8(file, content);
  return { updated: true };
}

function updateGarantiasSim(spec, dryRun) {
  if (/venta|compra|pozo/i.test(spec.operacion || "")) return { updated: false, reason: "venta" };
  const file = "garantias-alquiler/index.html";
  let content = readUtf8(file);
  const slugKey = `'${spec.slug}':`;
  if (content.includes(slugKey)) return { updated: false, reason: "ya presente" };
  const marker = "const PROP_MAP = {";
  if (!content.includes(marker)) throw new Error(`No se encontró PROP_MAP en ${file}`);
  content = content.replace(marker, `${marker}\n      '${spec.slug}': ${JSON.stringify(spec.titulo_simulador || spec.titulo_corto)},`);
  if (!dryRun) writeUtf8(file, content);
  return { updated: true };
}

function updateSitemap(fullUrl, dryRun) {
  const file = "sitemap.xml";
  let content = readUtf8(file);
  if (content.includes(`<loc>${fullUrl}</loc>`)) return { updated: false, reason: "ya presente" };
  const hoy = new Date().toISOString().slice(0, 10);
  const block = `  <url>\n    <loc>${fullUrl}</loc>\n    <lastmod>${hoy}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.90</priority>\n  </url>\n`;
  if (!content.includes("</urlset>")) throw new Error("No se encontró </urlset> en sitemap.xml");
  content = content.replace("</urlset>", `${block}</urlset>`);
  if (!dryRun) writeUtf8(file, content);
  return { updated: true };
}

function updateLlmsTxt(spec, fullUrl, dryRun) {
  const file = "llms.txt";
  let content = readUtf8(file);
  if (content.includes(fullUrl)) return { updated: false, reason: "ya presente" };
  const isVenta = /venta|compra|pozo/i.test(spec.operacion || "");
  const line = `- REF. ${spec.ref_publica} · ${spec.titulo_corto} (${spec.llms_resumen || spec.resumen_corto}): ${fullUrl}`;
  const anchor = isVenta ? "## Catálogo Unificado de Venta Directa y Pozo (/propiedades/)" : "- Catálogo completo con filtro por zona y ordenamiento por precio: https://zaguanpropiedades.com/alquileres/";
  if (!content.includes(anchor)) {
    content = content.trimEnd() + `\n${line}\n`;
  } else {
    content = content.replace(anchor, `${anchor}\n${line}`);
  }
  if (!dryRun) writeUtf8(file, content);
  return { updated: true };
}

function updateCatalogoAlquileres(spec, relPath, photos, dryRun) {
  if (/venta|compra|pozo/i.test(spec.operacion || "")) return { updated: false, reason: "es venta" };
  const file = "alquileres/index.html";
  let content = readUtf8(file);
  if (content.includes(relPath)) return { updated: false, reason: "ya presente" };

  const totalUyu = Number(spec.total_uyu || spec.precio_uyu || 30000);
  const baseUyu = Number(spec.precio_uyu || totalUyu);
  const gcTxt = spec.gc_uyu ? `+ $U ${Number(spec.gc_uyu).toLocaleString("de-DE")} GC` : "GC incluidos";
  const imgRel = `/assets/images/propiedades/${spec.fotos_slug || spec.slug}/${photos[0]}`;
  const waHref = `https://wa.me/59898712064?text=${encodeURIComponent(
    `Hola Mar, consulto por el alquiler anual Ref. ${spec.ref_publica} (${spec.titulo_corto}). Ficha: ${BASE_URL}${relPath}`
  )}`;

  const cardHtml = `          <!-- ${spec.ref_publica} · ${spec.titulo_corto} -->
          <article class="rental-card" data-price-uyu="${totalUyu}" data-status="disponible" data-currency="pesos" data-bedrooms="${spec.dormitorios || 2}d" data-zone="${escapeHtml(spec.zone_filter || "maldonado")}" data-features="${escapeHtml(spec.features_filter || "estrenar ascensor")}" data-keywords="${escapeHtml(`${spec.ref_publica} ${spec.titulo_corto} ${spec.zona_publica} ${totalUyu} disponible`.toLowerCase())}">
            <a class="rental-card-media-link" href="${relPath}" aria-label="Ver ficha completa ${escapeHtml(spec.titulo_corto)}">
              <img src="${imgRel}" alt="${escapeHtml(spec.titulo_corto)}" loading="lazy">
              <span class="rental-badge">${escapeHtml(spec.zona_publica)}</span>
              <span class="rental-badge--green">${escapeHtml(spec.badge_card || "Nuevo ingreso")}</span>
            </a>
            <div class="rental-card-body">
              <div>
                <div class="rental-ref">REF. ${escapeHtml(spec.ref_publica)}</div>
                <div class="rental-price">$U ${baseUyu.toLocaleString("de-DE")} <small>/ mes · ${escapeHtml(gcTxt)}</small></div>
                <a class="rental-title-link" href="${relPath}">
                  <h3 class="rental-title">${escapeHtml(spec.titulo_corto)}</h3>
                </a>
                <p class="rental-desc">${escapeHtml(spec.resumen_corto)}</p>
              </div>
              <div class="rental-actions">
                <a href="${relPath}" class="btn-action btn-action--primary">Ver ficha completa →</a>
                <a href="${waHref}" class="btn-action btn-action--outline" target="_blank" rel="noopener noreferrer">Consultar</a>
              </div>
            </div>
          </article>`;

  const gridAnchor = '<div class="rentals-grid" id="rentals-grid">';
  if (!content.includes(gridAnchor)) throw new Error("No se encontró #rentals-grid en alquileres/index.html");
  content = content.replace(gridAnchor, `${gridAnchor}\n${cardHtml}`);

  const ldItem = `{
            "@type": "ListItem",
            "position": 1,
            "url": "${BASE_URL}${relPath}",
            "name": ${JSON.stringify(spec.titulo_h1)},
            "description": ${JSON.stringify(spec.subtitulo)}
          },`;
  const ldAnchor = '"itemListElement": [';
  if (content.includes(ldAnchor)) content = content.replace(ldAnchor, `${ldAnchor}\n          ${ldItem}`);

  if (!dryRun) writeUtf8(file, content);
  return { updated: true };
}

function updateBoveda(spec, fullUrl, dryRun) {
  if (!fs.existsSync(BOVEDA_PATH)) return { updated: false, reason: "bóveda no encontrada" };
  const boveda = JSON.parse(fs.readFileSync(BOVEDA_PATH, "utf8"));
  boveda.fichas = boveda.fichas || [];
  const idx = boveda.fichas.findIndex((f) => f.ref_publica === spec.ref_publica || (spec.id_crm && f.id_crm === spec.id_crm));
  const record = {
    id_crm: spec.id_crm || spec.ref_publica,
    ref_publica: spec.ref_publica,
    vertical_14: spec.vertical_14 || "O6 · Dueño Alquila Anual",
    estado_publicacion: "4_ficha_activa",
    url_publica_sin_contacto: fullUrl,
    nota_confidencial_franja_gris: "PROHIBIDO enviar la URL pública al propietario. La ficha es activo exclusivo para captar y filtrar demanda.",
    contacto_privado: spec.privado || {},
    condiciones_privadas_confirmadas: spec.condiciones_privadas || {},
  };
  if (idx >= 0) boveda.fichas[idx] = { ...boveda.fichas[idx], ...record };
  else boveda.fichas.push(record);
  boveda.actualizado = new Date().toISOString();
  if (!dryRun) fs.writeFileSync(BOVEDA_PATH, JSON.stringify(boveda, null, 2), "utf8");
  return { updated: true };
}

function updateEstadosHoy(spec, fullUrl, jpgRel, mp4Rel, dryRun) {
  const file = "assets/estados/estados_hoy.json";
  const js = JSON.parse(readUtf8(file));
  js.estados_activos = (js.estados_activos || []).filter((e) => e.ref_publica !== spec.ref_publica);
  js.estados_activos.unshift({
    id: `ESTADO-${slugifyUpper(spec.slug)}`,
    ref_publica: spec.ref_publica,
    titulo: spec.estado_titulo || spec.titulo_corto,
    imagen_9_16: `${BASE_URL}/${jpgRel}`,
    video_9_16: `${BASE_URL}/${mp4Rel}`,
    ficha_url: `${fullUrl}?utm_source=whatsapp_status&utm_medium=estado_9_16`,
    copy_1_linea: spec.copy_estado_1_linea || `${spec.titulo_corto} · ${spec.precio_publico || ""} · ${fullUrl}`,
  });
  js.updated_at = new Date().toISOString();
  if (!dryRun) writeUtf8(file, JSON.stringify(js, null, 2));
  return { updated: true };
}

function auditExisting(needle) {
  const estados = JSON.parse(readUtf8("assets/estados/estados_hoy.json")).estados_activos || [];
  const ultimas = readUtf8("assets/js/ultimas-propiedades-zaguan.js");
  const alquileresHtml = readUtf8("alquileres/index.html");
  const propiedadesHtml = readUtf8("propiedades/index.html");
  const simHtml = readUtf8("garantias-alquiler/index.html");
  const sitemap = readUtf8("sitemap.xml");
  const llms = readUtf8("llms.txt");
  const boveda = fs.existsSync(BOVEDA_PATH) ? JSON.parse(fs.readFileSync(BOVEDA_PATH, "utf8")).fichas || [] : [];

  const bov = boveda.find((f) => f.ref_publica === needle || (f.url_publica_sin_contacto || "").includes(needle));
  const est = estados.find((e) => e.ref_publica === needle || (e.ficha_url || "").includes(needle));
  const pubUrl = bov?.url_publica_sin_contacto || bov?.url_publica_sin_padron || est?.ficha_url?.split("?")[0] || "";
  const urlPath = pubUrl.replace(BASE_URL, "");
  const pdpExists = urlPath ? fs.existsSync(path.join(ROOT, urlPath.replace(/^\//, ""), "index.html")) : false;
  const jpgPath = est?.imagen_9_16 ? path.join(ROOT, est.imagen_9_16.replace(`${BASE_URL}/`, "")) : "";
  const mp4Path = est?.video_9_16 ? path.join(ROOT, est.video_9_16.replace(`${BASE_URL}/`, "")) : "";
  const slug = urlPath.split("/").filter(Boolean).pop() || needle;

  const checks = {
    ref: bov?.ref_publica || est?.ref_publica || needle,
    url: pubUrl || null,
    boveda_privada: Boolean(bov),
    ficha_html: pdpExists,
    catalogo_web: Boolean(urlPath && (alquileresHtml.includes(urlPath) || propiedadesHtml.includes(urlPath))),
    home_y_blog_recientes: Boolean(urlPath && ultimas.includes(urlPath)),
    simulador_garantias: Boolean(!urlPath.startsWith("/propiedades/") && simHtml.includes(slug)),
    estado_9_16_jpg: Boolean(jpgPath && fs.existsSync(jpgPath)),
    estado_9_16_mp4: Boolean(mp4Path && fs.existsSync(mp4Path)),
    estados_hoy_json: Boolean(est),
    sitemap_xml: Boolean(pubUrl && sitemap.includes(pubUrl)),
    llms_txt: Boolean(pubUrl && llms.includes(pubUrl)),
  };
  const allOk = Object.entries(checks)
    .filter(([k]) => k !== "ref" && k !== "url")
    .every(([, v]) => v === true);
  console.log(JSON.stringify({ ok: allOk, checks }, null, 2));
  if (!allOk) process.exit(2);
}

async function runPublish(specPath, flags) {
  const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
  const dryRun = Boolean(flags["dry-run"]);
  assertPublicSafety(spec);

  const isVenta = /venta|compra|pozo/i.test(spec.operacion || "");
  const section = isVenta ? "propiedades" : "alquileres";
  const relPath = `/${section}/${spec.slug}/`;
  const fullUrl = `${BASE_URL}${relPath}`;
  const photosRel = `assets/images/propiedades/${spec.fotos_slug || spec.slug}`;
  const photosDir = path.join(ROOT, photosRel);

  const photos = ingestPhotos(spec, photosDir);
  const estadoPrefix = spec.estado_prefijo || "4";
  const upperTag = slugifyUpper(spec.estado_slug || spec.slug);
  const jpgRel = `assets/estados/${estadoPrefix}_ESTADO_${upperTag}.jpg`;
  const mp4Rel = `assets/estados/${estadoPrefix}_VIDEO_ESTADO_${upperTag}.mp4`;

  const pdpHtmlPath = `${section}/${spec.slug}/index.html`;
  if (!fs.existsSync(path.join(ROOT, pdpHtmlPath)) || flags.overwrite) {
    if (isVenta) {
      throw new Error("Para fichas de Venta creá o pasá la HTML específica y ejecutá con catálogo ya creado.");
    }
    const html = buildRentalPdpHtml(spec, photos);
    if (!dryRun) writeUtf8(pdpHtmlPath, html);
  }

  if (!dryRun) {
    const pySpecPath = `/tmp/estado_spec_${upperTag}.json`;
    fs.writeFileSync(
      pySpecPath,
      JSON.stringify({
        ...spec,
        photos_dir: photosDir,
        jpg_out: path.join(ROOT, jpgRel),
        mp4_out: path.join(ROOT, mp4Rel),
      }),
      "utf8"
    );
    execFileSync("python3", [path.join(__dirname, "generar_estado_9_16.py"), "--spec", pySpecPath], { stdio: "inherit" });
    fs.rmSync(pySpecPath, { force: true });
  }

  const res = {
    dryRun,
    boveda: updateBoveda(spec, fullUrl, dryRun),
    ultimas: updateUltimasPropiedades(spec, relPath, dryRun),
    catalogo: updateCatalogoAlquileres(spec, relPath, photos, dryRun),
    simulador: updateGarantiasSim(spec, dryRun),
    estados: updateEstadosHoy(spec, fullUrl, jpgRel, mp4Rel, dryRun),
    sitemap: updateSitemap(fullUrl, dryRun),
    llms: updateLlmsTxt(spec, fullUrl, dryRun),
  };

  if (flags.push && !dryRun) {
    execFileSync("git", ["-C", ROOT, "add", "-A"], { stdio: "inherit" });
    execFileSync("git", ["-C", ROOT, "commit", "-m", `feat(zaguan): ficha 1-tiro ${spec.ref_publica} (${spec.slug}) + estado 9:16 + indexacion`], { stdio: "inherit" });
    execFileSync("git", ["-C", ROOT, "push", "origin", "main"], { stdio: "inherit" });

    let liveOk = false;
    for (let i = 0; i < 12; i++) {
      const [rPage, rMp4] = await Promise.all([
        fetch(fullUrl).catch(() => ({ status: 0 })),
        fetch(`${BASE_URL}/${mp4Rel}`, { method: "HEAD" }).catch(() => ({ status: 0 })),
      ]);
      if (rPage.status === 200 && rMp4.status === 200) {
        liveOk = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 5000));
    }
    res.live_http_200 = liveOk;

    if (liveOk) {
      const tgResp = await fetch(`${WORKER_BASE}/api/telegram/estados-hoy?enviar=1&ref=${encodeURIComponent(spec.ref_publica)}`, {
        method: "POST",
      }).then((r) => r.json()).catch((e) => ({ ok: false, error: String(e) }));
      res.telegram_dispatch = tgResp;
    }
  }

  console.log(JSON.stringify({ ok: true, ref: spec.ref_publica, url: fullUrl, res }, null, 2));
}

const args = parseArgs(process.argv);
if (args.flags.audit) {
  auditExisting(args.flags.audit === true ? args.positional[0] : args.flags.audit);
} else if (args.flags["init-template"]) {
  const dest = args.flags["init-template"];
  const tpl = {
    id_crm: "MP-XX",
    ref_publica: "ZAG-ALQ-08",
    slug: "ejemplo-apartamento-maldonado",
    operacion: "Alquiler Anual",
    operacion_badge: "ALQUILER ANUAL",
    titulo_h1: "Alquiler anual 2 dormitorios en Maldonado con balcón y cochera",
    subtitulo: "Apartamento luminoso de 2 dormitorios en zona céntrica de Maldonado.",
    titulo_corto: "Maldonado 2D con cochera ($U 30.000/mes)",
    resumen_corto: "2 dormitorios luminosos con cochera fija y gastos comunes bajos.",
    zona_publica: "Centro, Maldonado",
    precio_uyu: 30000,
    gc_uyu: 3500,
    total_uyu: 33500,
    precio_publico: "$U 30.000 + $U 3.500 GC",
    dormitorios: 2,
    fotos_zip: "/ruta/al/WhatsApp.zip",
    estado_prefijo: "4",
    estado_slug: "EJEMPLO_MALDONADO",
    estado_pill: "CENTRO MALDONADO · $U 30.000 + $U 3.500 GC",
    estado_titulo: "Maldonado: 2 dormitorios con cochera",
    estado_subtitulo: "Luminoso, cerca de servicios. Garantía aseguradora.",
    copy_estado_1_linea: "ALQUILER ANUAL · MALDONADO | 2 dormitorios con cochera · $U 30.000 + $U 3.500 GC · https://zaguanpropiedades.com/alquileres/ejemplo-apartamento-maldonado/",
    privado: {
      dueno: "Nombre propietario",
      telefono_wa: "+598 99 000 000",
      direccion_exacta: "Calle X esq Y (SOLO BOVEDA)",
      disponibilidad_visitas: "A confirmar",
    },
  };
  fs.writeFileSync(dest, JSON.stringify(tpl, null, 2), "utf8");
  console.log(`Plantilla escrita en ${dest}`);
} else if (args.flags.publish) {
  await runPublish(args.flags.publish, args.flags);
} else {
  console.log("Uso:\n  node tools/publicar_ficha_1tiro.mjs --audit ZAG-ALQ-07\n  node tools/publicar_ficha_1tiro.mjs --init-template /tmp/spec.json\n  node tools/publicar_ficha_1tiro.mjs --publish /tmp/spec.json [--push] [--dry-run]");
}
