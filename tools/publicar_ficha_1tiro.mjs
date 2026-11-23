#!/usr/bin/env node
/**
 * ZAGUÁN Propiedades — Orquestador de Fábrica 360° en 1 Tiro (Alta + 4 Redes + Ads Al Toque + Baja Total)
 *
 * Modos:
 *   node tools/publicar_ficha_1tiro.mjs --audit ZAG-ALQ-07
 *   node tools/publicar_ficha_1tiro.mjs --init-template /tmp/ficha_nueva.json
 *   node tools/publicar_ficha_1tiro.mjs --pack-redes /ruta/spec.json
 *   node tools/publicar_ficha_1tiro.mjs --publish /ruta/spec.json [--push] [--dry-run]
 *   node tools/publicar_ficha_1tiro.mjs --baja ZAG-ALQ-07 [--borrar-todo] [--push]
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DESKTOP_ROOT = "/Users/arianawajntraub/Desktop/ZAGUAN CLAUDE";
const BOVEDA_PATH = path.join(DESKTOP_ROOT, "FICHAS_PRIVADAS_BOVEDA_ZAGUAN.json");
const PACKS_DESKTOP_DIR = path.join(DESKTOP_ROOT, "packs-redes");
const WORKER_BASE = "https://zaguan-crm-bot.943ari.workers.dev";
const BASE_URL = "https://zaguanpropiedades.com";

const FORBIDDEN_MENTE_RE = /\b[a-záéíóúñ]{4,}mente\b/i;

/**
 * Diccionario oficial de Variables y [CORCHETES] de toda ficha Zaguán.
 * Todo copy, HTML, Estado 9:16, pack de 4 redes y pauta IG Direct toma datos desde acá
 * separando estrictamente capa PÚBLICA vs. BÓVEDA PRIVADA.
 */
export const FICHA_CORCHETES_VARIABLES = {
  capa_publica: [
    "[REF_PUBLICA]",
    "[OPERACION]",
    "[ZONA_PUBLICA]",
    "[PRECIO_BASE]",
    "[GASTOS_COMUNES]",
    "[TOTAL_MENSUAL]",
    "[METROS_M2]",
    "[DORMITORIOS]",
    "[PISO_ORIENTACION]",
    "[EQUIPAMIENTO]",
    "[SEGURIDAD_EDIFICIO]",
    "[ADMISION_NINOS_MASCOTAS]",
    "[COCHERA]",
    "[GARANTIA_ACEPTADA]",
    "[HORARIO_VISITAS]",
    "[URL_FICHA]",
  ],
  capa_boveda_privada: [
    "[ID_CRM]",
    "[DUENO_NOMBRE]",
    "[TELEFONO_DUENO_BOVEDA]",
    "[DIRECCION_PRIVADA_BOVEDA]",
    "[PADRON_MANZANA_CARPETA]",
    "[HONORARIOS_DUENO_PRIVADO]",
    "[OK_DUENO_FECHA]",
  ],
};

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

function resolveVars(spec, fullUrl) {
  const baseUyu = Number(spec.precio_uyu || spec.total_uyu || 0);
  const gcUyu = Number(spec.gc_uyu || 0);
  const totalUyu = Number(spec.total_uyu || baseUyu + gcUyu);
  const precioBaseFmt = baseUyu ? `$U ${baseUyu.toLocaleString("de-DE")}/mes` : spec.precio_publico || "Consultar";
  const gcFmt = gcUyu ? `$U ${gcUyu.toLocaleString("de-DE")} (${spec.gc_incluye || "según edificio"})` : "Incluidos";
  const totalFmt = totalUyu ? `$U ${totalUyu.toLocaleString("de-DE")}/mes` : precioBaseFmt;
  return {
    REF_PUBLICA: spec.ref_publica,
    OPERACION: spec.operacion || "Alquiler anual",
    ZONA_PUBLICA: spec.zona_publica || "Maldonado",
    PRECIO_BASE: precioBaseFmt,
    GASTOS_COMUNES: gcFmt,
    TOTAL_MENSUAL: totalFmt,
    METROS_M2: spec.superficie_m2 || "A confirmar",
    DORMITORIOS: String(spec.dormitorios || 2),
    PISO_ORIENTACION: spec.piso_orientacion || "Luminoso",
    EQUIPAMIENTO: spec.equipamiento || "Aire y calefón instalados",
    SEGURIDAD_EDIFICIO: spec.seguridad || "Edificio con cámaras",
    ADMISION_NINOS_MASCOTAS: spec.admision || "A confirmar",
    COCHERA: spec.cochera || "Consultar opciones",
    GARANTIA_ACEPTADA: spec.garantias || "Garantía aseguradora (Porto Seguro, Sura, Mapfre o Santander)",
    HORARIO_VISITAS: spec.horario_visitas || "A coordinar",
    URL_FICHA: fullUrl,
  };
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

function lcFirst(s) {
  const txt = String(s || "");
  return txt ? txt.charAt(0).toLowerCase() + txt.slice(1) : txt;
}

function lintSocialText(txt, { allowUrl = true } = {}) {
  if (/[¿¡]/.test(txt)) throw new Error(`Linter SÍ/NO: signo ¿/¡ prohibido en copy: ${txt.slice(0, 80)}`);
  const mMente = txt.match(FORBIDDEN_MENTE_RE);
  if (mMente) throw new Error(`Linter SÍ/NO: adverbio "${mMente[0]}" prohibido en copy: ${txt.slice(0, 80)}`);
  if (/\bno\s+(?:solo|es|se\s+trata|necesit)/i.test(txt)) {
    throw new Error(`Linter SÍ/NO: negación por contraste prohibida en copy: ${txt.slice(0, 80)}`);
  }
  if (!allowUrl && /https?:\/\/|wa\.me\//i.test(txt)) {
    throw new Error(`Linter Instagram/TikTok: URL cruda prohibida en copy: ${txt.slice(0, 80)}`);
  }
  return txt;
}

/**
 * Genera el PAQUETE DE 4 PUBLICACIONES DE REDES (mismas fotos reales, cambiando
 * foto de portada 4:5 y ángulo/CTA) + configuración IG Direct Al Toque (5 días / 72h corte).
 */
function build4SocialPostsAndAds(spec, photos, photosDir, fullUrl, mp4Rel, dryRun) {
  const v = resolveVars(spec, fullUrl);
  const pickPhoto = (idx) => path.join(photosDir, photos[idx % photos.length]);
  const packDesktop = path.join(PACKS_DESKTOP_DIR, spec.ref_publica);
  const packWebRel = `assets/packs/${spec.ref_publica}`;
  const packWebDir = path.join(ROOT, packWebRel);

  const pieces = [
    {
      num: 1,
      codigo: `${spec.ref_publica}-P1`,
      tema: `Pieza 1 · ${v.ZONA_PUBLICA}: ${v.DORMITORIOS} dormitorios a ${v.PRECIO_BASE} + GC con agua incluida`,
      cover_photo_local: pickPhoto(0),
      cover_filename: "01-portada-precio-visita.jpg",
      badge_top: "ALQUILER ANUAL",
      kicker: `${v.ZONA_PUBLICA} · REF. ${v.REF_PUBLICA}`,
      headline: `${v.DORMITORIOS} dormitorios en ${v.ZONA_PUBLICA}: ${v.PRECIO_BASE}`,
      subline: `Gastos comunes $U 5.000 (agua inc.). ${v.HORARIO_VISITAS}.`,
      cta_card: "Pedir visita por WhatsApp · ZAGUÁN Propiedades",
      instagram_copy: lintSocialText(
        `Buscás alquiler anual claro en ${v.ZONA_PUBLICA} sin sorpresas en el monto final?\n\n` +
          `Unidad de ${v.DORMITORIOS} dormitorios (${v.METROS_M2}) en ${v.PISO_ORIENTACION}: ${v.PRECIO_BASE} + ${v.GASTOS_COMUNES}. ${v.EQUIPAMIENTO}. ${v.ADMISION_NINOS_MASCOTAS}.\n\n` +
          `Pedinos visita ${lcFirst(v.HORARIO_VISITAS)} escribiendo "VISITA" por mensaje privado o tocando el enlace directo de WhatsApp en nuestra biografía.\n\n` +
          `#Maldonado #AlquilerAnual #PuntaDelEste #ZaguanPropiedades`,
        { allowUrl: false }
      ),
      tiktok_copy: lintSocialText(
        `Alquiler anual ${v.DORMITORIOS} dormitorios en ${v.ZONA_PUBLICA}: ${v.PRECIO_BASE} + ${v.GASTOS_COMUNES}. ${v.PISO_ORIENTACION}. ${v.ADMISION_NINOS_MASCOTAS}. Escribí VISITA o tocá el link de nuestra bio para coordinar.`,
        { allowUrl: false }
      ),
      facebook_copy: lintSocialText(
        `Alquiler anual en ${v.ZONA_PUBLICA} · ${v.DORMITORIOS} dormitorios (${v.METROS_M2})\n\n` +
          `Valor: ${v.PRECIO_BASE} + ${v.GASTOS_COMUNES}. ${v.PISO_ORIENTACION}, ${lcFirst(v.EQUIPAMIENTO)}, ${lcFirst(v.SEGURIDAD_EDIFICIO)}. ${v.ADMISION_NINOS_MASCOTAS}.\n` +
          `${v.GARANTIA_ACEPTADA}.\n\n` +
          `Reservá tu visita (${v.HORARIO_VISITAS}) desde la ficha oficial: ${fullUrl}`
      ),
      linkedin_copy: lintSocialText(
        `Disponible en cartera activa de ZAGUÁN Propiedades (${v.REF_PUBLICA}): apartamento de ${v.DORMITORIOS} dormitorios (${v.METROS_M2}) en ${v.ZONA_PUBLICA} para contrato anual.\n\n` +
          `Condiciones publicadas de frente: ${v.PRECIO_BASE} más gastos comunes (${v.GASTOS_COMUNES}), edificio con ascensor y cámaras. ${v.GARANTIA_ACEPTADA}.\n\n` +
          `Ver ficha técnica completa: ${fullUrl}`
      ),
      youtube_title: lintSocialText(`${v.ZONA_PUBLICA} ${v.DORMITORIOS}D · ${v.PRECIO_BASE} · ${v.REF_PUBLICA}`).slice(0, 98),
    },
    {
      num: 2,
      tema: `Pieza 2 · Sol de invierno, puestas de sol y aire/calefón ya instalados (${v.REF_PUBLICA})`,
      codigo: `${spec.ref_publica}-P2`,
      cover_photo_local: pickPhoto(2),
      cover_filename: "02-portada-luz-confort.jpg",
      badge_top: "SOL DE INVIERNO",
      kicker: `PISO 4 NORTE · ${v.ZONA_PUBLICA}`,
      headline: "Sol de invierno y sombra fresca en verano",
      subline: "Aire y calefón incluidos. Simulá tu garantía.",
      cta_card: "Simular garantía gratis · ZAGUÁN Propiedades",
      instagram_copy: lintSocialText(
        `Orientación Norte real: entra el sol en invierno en los dormitorios y tenés atardecer en el living y la cocina.\n\n` +
          `Son ${v.METROS_M2} listos para mudarse: queda instalado aire acondicionado y calefón, con ${lcFirst(v.SEGURIDAD_EDIFICIO)} y doble ventanal de vidrio al frente. ${v.COCHERA}.\n\n` +
          `Comprobá hoy si tu póliza califica tocando nuestro enlace del perfil o escribiendo "GARANTÍA" por WhatsApp desde la bio.\n\n` +
          `#MaldonadoCentro #AlquilerMaldonado #ViviendaUruguay #ZaguanPropiedades`,
        { allowUrl: false }
      ),
      tiktok_copy: lintSocialText(
        `Sol en invierno al Norte y sombra fresca en verano: ${v.DORMITORIOS} dormitorios (${v.METROS_M2}) en ${v.ZONA_PUBLICA} con aire y calefón listos. Simulá tu garantía desde el link de la bio.`,
        { allowUrl: false }
      ),
      facebook_copy: lintSocialText(
        `Luz Norte real en invierno y aire acondicionado + calefón ya instalados en ${v.ZONA_PUBLICA}.\n\n` +
          `Piso 4 por ascensor (${v.METROS_M2}, 2 dormitorios en parquet), lavadero definido y doble ventanal al frente. ${v.PRECIO_BASE} + ${v.GASTOS_COMUNES}.\n\n` +
          `Ver fotos reales y simular tu garantía aseguradora en 30 segundos: ${fullUrl}`
      ),
      linkedin_copy: lintSocialText(
        `En ZAGUÁN Propiedades publicamos unidades anuales con historial real verificado: ${v.DORMITORIOS} dormitorios en ${v.ZONA_PUBLICA}, ${v.PISO_ORIENTACION}, doble ventanal al frente y aire + calefón listos.\n\n` +
          `Ficha completa y simulador multi-persona de requisitos aseguradores: ${fullUrl}`
      ),
      youtube_title: lintSocialText(`Luz Norte 2D en ${v.ZONA_PUBLICA} · ${v.PRECIO_BASE} · ZAGUÁN`).slice(0, 98),
    },
    {
      num: 3,
      codigo: `${spec.ref_publica}-P3`,
      tema: `Pieza 3 · Acepta niños y mascotas, cámaras y lavadero definido (${v.REF_PUBLICA})`,
      cover_photo_local: pickPhoto(3),
      cover_filename: "03-portada-familia-mascotas.jpg",
      badge_top: "NIÑOS Y MASCOTAS",
      kicker: `EDIFICIO SEGURO · CÁMARAS`,
      headline: "Acepta niños y mascotas en edificio con cámaras",
      subline: "Cocina definida y lavadero. Visitas desde 16 hs.",
      cta_card: "Consultar horarios de visita · ZAGUÁN Propiedades",
      instagram_copy: lintSocialText(
        `Te cuesta encontrar apartamento anual céntrico donde acepten niños y mascotas?\n\n` +
          `Este 2 dormitorios en ${v.ZONA_PUBLICA} suma cocina definida con terraza lavadero, buena ventilación, doble ventanal al frente y edificio seguro con cámaras.\n\n` +
          `Te mandamos los detalles completos y coordinamos visita ${lcFirst(v.HORARIO_VISITAS)}: escribinos "FICHA" por privado o al WhatsApp del perfil.\n\n` +
          `#MascotasBienvenidas #MaldonadoUruguay #AlquilerAnual #ZaguanPropiedades`,
        { allowUrl: false }
      ),
      tiktok_copy: lintSocialText(
        `Acepta niños y mascotas en ${v.ZONA_PUBLICA}: ${v.DORMITORIOS} dormitorios con cocina definida, terraza lavadero y cámaras en el edificio. Escribí FICHA para ver fotos y horarios desde las 16 hs.`,
        { allowUrl: false }
      ),
      facebook_copy: lintSocialText(
        `Apartamento 2 dormitorios en ${v.ZONA_PUBLICA} que acepta niños y mascotas.\n\n` +
          `Edificio seguro con ascensor y cámaras, terraza lavadero, aire acondicionado y calefón incluidos (${v.PRECIO_BASE} + ${v.GASTOS_COMUNES}).\n\n` +
          `Mirá todas las fotos y reservá horario de visita desde las 16 hs acá: ${fullUrl}`
      ),
      linkedin_copy: lintSocialText(
        `Un diferencial clave de esta unidad en ${v.ZONA_PUBLICA}: contrato anual formal que acepta niños y mascotas, edificio con cámaras, cocina definida con lavadero. ${v.GARANTIA_ACEPTADA}.\n\n` +
          `Detalles y ficha: ${fullUrl}`
      ),
      youtube_title: lintSocialText(`Alquiler 2D ${v.ZONA_PUBLICA} acepta niños y mascotas · ${v.REF_PUBLICA}`).slice(0, 98),
    },
    {
      num: 4,
      codigo: `${spec.ref_publica}-P4`,
      tema: `Pieza 4 · Reel 9:16 + Filtro Aseguradora y Pauta IG Direct Al Toque (${v.REF_PUBLICA})`,
      cover_photo_local: pickPhoto(1),
      cover_filename: "04-portada-aseguradora-ads.jpg",
      badge_top: "PORTO · SURA · MAPFRE",
      kicker: `ASEGURADORA PRIVADA · VISITAS 16 HS+`,
      headline: "Tenés Porto, Sura, Mapfre o Santander? Visitalo ya",
      subline: `${v.PRECIO_BASE} + ${v.GASTOS_COMUNES}. Respuesta directa con Mar.`,
      cta_card: "Escribir ahora por WhatsApp · ZAGUÁN Propiedades",
      instagram_copy: lintSocialText(
        `Contás con garantía aseguradora o recibos continuos en BPS y querés mudarte ya en ${v.ZONA_PUBLICA}?\n\n` +
          `Recorré en video este 2 dormitorios Piso 4 Norte: ${v.PRECIO_BASE} + ${v.GASTOS_COMUNES}. Visitas disponibles ${lcFirst(v.HORARIO_VISITAS)}.\n\n` +
          `Tocá el botón de WhatsApp en nuestra biografía o comentá "ALQUILER" para pasarte la ficha y coordinar esta semana.\n\n` +
          `#PortoSeguro #Sura #GarantiaDeAlquiler #Maldonado #ZaguanPropiedades`,
        { allowUrl: false }
      ),
      tiktok_copy: lintSocialText(
        `Recorrido en video · ${v.DORMITORIOS} dormitorios en ${v.ZONA_PUBLICA} con garantía Porto, Sura, Mapfre o Santander. ${v.PRECIO_BASE} + ${v.GASTOS_COMUNES}. Visitas desde las 16 hs, link en el perfil.`,
        { allowUrl: false }
      ),
      facebook_copy: lintSocialText(
        `Recorrido en video · Alquiler anual 2D en ${v.ZONA_PUBLICA} (${v.PRECIO_BASE} + ${v.GASTOS_COMUNES}).\n\n` +
          `${v.GARANTIA_ACEPTADA}. Consultá o agendá visita ${lcFirst(v.HORARIO_VISITAS)} en la ficha oficial: ${fullUrl}`
      ),
      linkedin_copy: lintSocialText(
        `Video presentación de alquiler anual (${v.REF_PUBLICA}) en ${v.ZONA_PUBLICA}. Proceso precalificado con aseguradora y visitas ágiles todos los días desde las 16 hs.\n\n` +
          `Ficha completa: ${fullUrl}`
      ),
      youtube_title: lintSocialText(`Video 2D ${v.ZONA_PUBLICA} con aseguradora · ${v.REF_PUBLICA}`).slice(0, 98),
    },
  ];

  const adsConfig = {
    cuenta_publicitaria: "Zaguán ADS (act_1946619906468438 · BM Zaguán Punta)",
    canal_ejecucion: "Instagram Direct (In-App / Web) — estandar ig-directo-real-estate",
    objetivo_pantalla: "Visit your website",
    special_ad_category: "Housing (Vivienda)",
    publico: `Create your own · Maldonado y Punta del Este (+15 km), 24 a 52 años`,
    duracion_ciclo: "5 días (corte de control 72 hs si consume > $U 800 sin consultas WhatsApp)",
    url_destino_web_200_ok: fullUrl,
    destino_whatsapp_directo: `https://wa.me/59898712064?text=${encodeURIComponent(
      `Hola Mar, vi el anuncio de ${v.ZONA_PUBLICA} (${v.REF_PUBLICA} · ${v.PRECIO_BASE} + ${v.GASTOS_COMUNES}). Quiero la ficha y horarios de visita.`
    )}`,
    botones_whatsapp_calificadores_80c: [
      "Tengo Porto, Sura, Mapfre o Santander: quiero ver ficha y visitar",
      "Tengo ingresos para tramitar aseguradora y quiero simular garantía",
      "Busco en otra zona o con depósito / tengo propiedad para publicar",
    ],
    comentario_precio_publico_ig: `El alquiler es de ${v.PRECIO_BASE} más ${v.GASTOS_COMUNES} de gastos comunes. Tocá el botón del anuncio o el enlace de nuestro perfil para enviarte la ficha completa.`,
    piezas_a_rotar: pieces.map((p) => ({
      codigo: p.codigo,
      portada_url: `${BASE_URL}/${packWebRel}/${p.cover_filename}`,
      tema: p.tema,
    })),
    video_reel_9_16: `${BASE_URL}/${mp4Rel}`,
  };

  if (!dryRun) {
    fs.mkdirSync(packDesktop, { recursive: true });
    fs.mkdirSync(packWebDir, { recursive: true });

    const pyPackSpec = `/tmp/pack4_${slugifyUpper(spec.ref_publica)}.json`;
    const cardsPayload = pieces.map((p) => ({
      photo: p.cover_photo_local,
      badge_top: p.badge_top,
      kicker: p.kicker,
      headline: p.headline,
      subline: p.subline,
      cta_text: p.cta_card,
      out_path: path.join(packWebDir, p.cover_filename),
    }));
    fs.writeFileSync(pyPackSpec, JSON.stringify({ operacion_badge: "ALQUILER ANUAL", cards: cardsPayload }), "utf8");
    execFileSync("python3", [path.join(__dirname, "generar_estado_9_16.py"), "--pack-4-redes", "--spec", pyPackSpec], {
      stdio: "inherit",
    });
    fs.rmSync(pyPackSpec, { force: true });

    // Replicar portadas + copias + Ads Al Toque en escritorio packs-redes/<REF>/
    for (const p of pieces) {
      fs.copyFileSync(path.join(packWebDir, p.cover_filename), path.join(packDesktop, p.cover_filename));
    }
    const mdDoc = [
      `# PAQUETE COMPLETO 360° · ${spec.ref_publica} (${spec.titulo_corto})`,
      ``,
      `## Variables y [CORCHETES] usados`,
      "```json",
      JSON.stringify(v, null, 2),
      "```",
      ``,
      `## Configuración Ads Al Toque (IG Direct · Vivienda)`,
      `- Objetivo: ${adsConfig.objetivo_pantalla}`,
      `- Destino WhatsApp: ${adsConfig.destino_whatsapp_directo}`,
      `- Destino Web: ${adsConfig.url_destino_web_200_ok}`,
      `- Corte 72 hs: ${adsConfig.duracion_ciclo}`,
      `- Respuesta comentario "¿Precio?": ${adsConfig.comentario_precio_publico_ig}`,
      ``,
      ...pieces.flatMap((p) => [
        `## ${p.codigo} — ${p.tema}`,
        `- Portada 4:5: ${BASE_URL}/${packWebRel}/${p.cover_filename}`,
        `### Instagram (0 URLs crudas)`,
        p.instagram_copy,
        `### TikTok (0 URLs crudas)`,
        p.tiktok_copy,
        `### Facebook`,
        p.facebook_copy,
        `### LinkedIn`,
        p.linkedin_copy,
        `### YouTube (<=100 car)`,
        p.youtube_title,
        ``,
      ]),
    ].join("\n");

    fs.writeFileSync(path.join(packDesktop, "PAQUETE_4_REDES_Y_ADS.json"), JSON.stringify({ variables: v, adsConfig, pieces }, null, 2), "utf8");
    fs.writeFileSync(path.join(packDesktop, "PAQUETE_4_REDES_Y_ADS.md"), mdDoc, "utf8");
    fs.writeFileSync(path.join(packWebDir, "ads_y_4_piezas.json"), JSON.stringify({ variables: v, adsConfig, pieces }, null, 2), "utf8");
  }

  return {
    pack_desktop: packDesktop,
    pack_web_url: `${BASE_URL}/${packWebRel}/`,
    portadas_urls: pieces.map((p) => `${BASE_URL}/${packWebRel}/${p.cover_filename}`),
    adsConfig,
    pieces,
  };
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
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="background:#123B4A;color:#F3F0E8;border:1px solid rgba(243,240,232,0.45);font-weight:700;padding:11px 16px;border-radius:8px;text-decoration:none;">📲 Consultar visita por WhatsApp</a>
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

function updateAlquiloAnual(spec, relPath, photos, dryRun) {
  if (/venta|compra|pozo/i.test(spec.operacion || "")) return { updated: false, reason: "es venta" };
  const file = "alquiloanual/index.html";
  let content = readUtf8(file);
  if (content.includes(relPath)) return { updated: false, reason: "ya presente" };

  const baseUyu = Number(spec.precio_uyu || spec.total_uyu || 30000);
  const gcTxt = spec.gc_uyu ? `+ $U ${Number(spec.gc_uyu).toLocaleString("de-DE")} GC` : "GC incluidos";
  const imgRel = `/assets/images/propiedades/${spec.fotos_slug || spec.slug}/${photos[0]}`;
  const waHref = `https://wa.me/59898712064?text=${encodeURIComponent(
    `Hola Mar, quiero coordinar visita para ${spec.titulo_corto} (Ref. ${spec.ref_publica}).`
  )}`;

  const showcaseCard = `          <!-- ${spec.ref_publica} · ${spec.titulo_corto} -->
          <article data-ref="${escapeHtml(spec.ref_publica)}" style="background:var(--estuario); color:var(--bone); border:1px solid rgba(243,240,232,0.25); border-radius:14px; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between;">
            <div style="aspect-ratio:16/10; overflow:hidden; position:relative;">
              <img src="${imgRel}" alt="${escapeHtml(spec.titulo_corto)}" style="width:100%; height:100%; object-fit:cover;">
              <span style="position:absolute; top:12px; left:12px; background:var(--bone); color:var(--bigua); font-weight:800; font-size:11px; padding:3px 8px; border-radius:4px; text-transform:uppercase;">${escapeHtml(spec.zona_publica)}</span>
              <span style="position:absolute; top:12px; right:12px; background:#B7D6E0; color:#081521; font-weight:800; font-size:11px; padding:3px 8px; border-radius:4px;">${escapeHtml(spec.badge_card || "Nuevo ingreso")}</span>
            </div>
            <div style="padding:22px; display:flex; flex-direction:column; flex:1; justify-content:space-between; gap:16px;">
              <div>
                <div style="font-family:'Archivo',sans-serif; font-size:28px; font-weight:700; color:var(--bone);">$U ${baseUyu.toLocaleString("de-DE")} <small style="font-size:14px; font-weight:500; opacity:0.8; font-family:'Inter',sans-serif;">/ mes ${escapeHtml(gcTxt)}</small></div>
                <h3 style="font-size:19px; color:var(--bone); margin:6px 0;">${escapeHtml(spec.titulo_corto)}</h3>
                <p style="font-size:13.5px; opacity:0.9; line-height:1.5;">${escapeHtml(spec.resumen_corto)}</p>
              </div>
              <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <a href="${relPath}" class="btn btn--light" style="flex:1;">Ver ficha completa →</a>
                <a href="${waHref}" class="btn btn--dark" target="_blank" rel="noopener noreferrer" style="flex:1; background:var(--bigua); border-color:var(--bigua); color:var(--bone);">Coordinar visita</a>
              </div>
            </div>
          </article>`;

  const compactCard = `        <div data-ref="${escapeHtml(spec.ref_publica)}" style="background:#123B4A; border:1px solid rgba(243,240,232,0.18); border-radius:16px; padding:24px; margin-bottom:24px; display:flex; gap:20px; align-items:center; flex-wrap:wrap;">
          <img src="${imgRel}" alt="${escapeHtml(spec.titulo_corto)}" style="width:140px; height:105px; object-fit:cover; border-radius:10px; border:1px solid rgba(255,255,255,0.1);">
          <div style="flex:1; min-width:240px;">
            <div style="display:flex; gap:8px; margin-bottom:6px; flex-wrap:wrap;">
              <span style="background:#F3F0E8; color:#081521; font-weight:800; font-size:11px; padding:3px 8px; border-radius:4px; text-transform:uppercase;">${escapeHtml(spec.badge_card || "Nuevo ingreso")}</span>
              <span style="background:rgba(183,214,224,0.18); color:#B7D6E0; font-weight:700; font-size:11px; padding:3px 8px; border-radius:4px;">${escapeHtml(spec.zona_publica)}</span>
            </div>
            <h3 style="font-size:19px; color:#F3F0E8; font-family:'Archivo',sans-serif; margin-bottom:4px;">${escapeHtml(spec.titulo_corto)}</h3>
            <p style="font-size:14px; color:#A3B3C2; margin-bottom:10px;">${escapeHtml(spec.resumen_corto)} <strong>$U ${baseUyu.toLocaleString("de-DE")} / mes</strong>.</p>
            <a href="${relPath}" style="display:inline-flex; align-items:center; gap:6px; background:#F3F0E8; color:#081521; font-weight:700; font-size:13px; padding:8px 16px; border-radius:8px;">Ver ficha completa con fotos ↗</a>
          </div>
        </div>`;

  const gridAnchor = '<div class="triage-grid triage-grid-alquileres">';
  if (!content.includes(gridAnchor)) throw new Error("No se encontró .triage-grid-alquileres en alquiloanual/index.html");
  content = content.replace(gridAnchor, `${gridAnchor}\n${showcaseCard}`);

  const compactAnchor = "<!-- Unidad Destacada";
  if (content.includes(compactAnchor)) {
    content = content.replace(compactAnchor, `${compactCard}\n\n        ${compactAnchor}`);
  }

  if (!dryRun) writeUtf8(file, content);
  return { updated: true };
}

function updateHomeIndex(spec, relPath, dryRun) {
  const file = "index.html";
  let content = readUtf8(file);
  if (content.includes(relPath)) return { updated: false, reason: "ya presente" };

  const isVenta = /venta|compra|pozo/i.test(spec.operacion || "");
  const baseUyu = Number(spec.precio_uyu || spec.total_uyu || 0);
  const priceLabel = isVenta ? (spec.precio_publico || "Consultar") : `$U ${baseUyu.toLocaleString("de-DE")}${spec.gc_uyu ? " + GC" : ""}`;
  const icon = isVenta ? "🌊" : "🏠";

  const ldOffer = `{
        "@type": "Offer",
        "name": ${JSON.stringify(spec.titulo_corto)},
        "description": ${JSON.stringify(spec.resumen_corto || spec.subtitulo)},
        "priceCurrency": ${JSON.stringify(isVenta ? "USD" : "UYU")},
        "price": ${JSON.stringify(String(baseUyu || spec.precio_usd || "0"))},
        "availability": "https://schema.org/InStock",
        "url": "${BASE_URL}${relPath}"
      },`;
  const ldAnchor = '"itemListElement": [';
  if (content.includes(ldAnchor)) content = content.replace(ldAnchor, `${ldAnchor}\n      ${ldOffer}`);

  const stripAnchor = '<div class="home-star-strip" aria-label="Destacados en 1 toque">';
  if (content.includes(stripAnchor)) {
    const btnHtml = `  <a class="hs-btn" data-ref="${escapeHtml(spec.ref_publica)}" href="${relPath}"><span>${icon} ${escapeHtml(spec.titulo_corto)} · ${escapeHtml(priceLabel)}</span><span>→</span></a>`;
    content = content.replace(stripAnchor, `${stripAnchor}\n${btnHtml}`);
  }

  if (!dryRun) writeUtf8(file, content);
  return { updated: true };
}

function updateLinksIndex(spec, relPath, dryRun) {
  const file = "links/index.html";
  let content = readUtf8(file);
  if (content.includes(relPath)) return { updated: false, reason: "ya presente" };

  const isVenta = /venta|compra|pozo/i.test(spec.operacion || "");
  const icon = isVenta ? "🌊" : "🏠";
  const starAnchor = '<div class="star-row" aria-label="Oportunidades estrella">';
  if (content.includes(starAnchor)) {
    const linkHtml = `        <a class="star-btn" data-ref="${escapeHtml(spec.ref_publica)}" href="${relPath}">\n          <span>${icon} ${escapeHtml(spec.titulo_corto)}</span><span>→</span>\n        </a>`;
    content = content.replace(starAnchor, `${starAnchor}\n${linkHtml}`);
  }

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

/**
 * BAJA TOTAL EN 1 TIRO (--baja <REF_O_SLUG> [--borrar-todo] [--push]):
 * Saca la propiedad de absolutamente todos los listados, home, blog, catálogo, simulador,
 * estados 9:16, sitemap.xml, llms.txt y (con --borrar-todo) elimina carpetas y packs locales.
 */
async function runBajaTotal(needle, flags) {
  const dryRun = Boolean(flags["dry-run"]);
  const borrarTodo = Boolean(flags["borrar-todo"]);
  const boveda = fs.existsSync(BOVEDA_PATH) ? JSON.parse(fs.readFileSync(BOVEDA_PATH, "utf8")) : { fichas: [] };
  const estadosPath = "assets/estados/estados_hoy.json";
  const estadosJs = JSON.parse(readUtf8(estadosPath));

  const bov = (boveda.fichas || []).find(
    (f) =>
      String(f.ref_publica || "").toLowerCase() === needle.toLowerCase() ||
      (f.url_publica_sin_contacto || "").includes(needle) ||
      (f.id_crm || "").toLowerCase() === needle.toLowerCase()
  );
  const est = (estadosJs.estados_activos || []).find(
    (e) =>
      String(e.ref_publica || "").toLowerCase() === needle.toLowerCase() ||
      (e.ficha_url || "").includes(needle)
  );

  const ref = bov?.ref_publica || est?.ref_publica || needle.toUpperCase();
  const fullUrl = (bov?.url_publica_sin_contacto || bov?.url_publica_sin_padron || est?.ficha_url || "").split("?")[0];
  const relPath = fullUrl ? fullUrl.replace(BASE_URL, "") : (needle.startsWith("/") ? needle : `/alquileres/${needle}/`);
  const slug = relPath.split("/").filter(Boolean).pop() || needle;

  const log = { ref, slug, relPath, dryRun, borrarTodo, cambios: {} };

  // 1. Quitar de estados_hoy.json
  const prevEstCount = (estadosJs.estados_activos || []).length;
  estadosJs.estados_activos = (estadosJs.estados_activos || []).filter(
    (e) => e.ref_publica !== ref && !(e.ficha_url || "").includes(slug)
  );
  if (estadosJs.estados_activos.length !== prevEstCount) {
    estadosJs.updated_at = new Date().toISOString();
    if (!dryRun) writeUtf8(estadosPath, JSON.stringify(estadosJs, null, 2));
    log.cambios.estados_hoy = "eliminado";
  }

  // 2. Quitar de ultimas-propiedades-zaguan.js (Home y Blog)
  let ult = readUtf8("assets/js/ultimas-propiedades-zaguan.js");
  const ultRe = new RegExp(`\\s*\\{[^{}]*href:\\s*'[^']*${slug}[^']*'[^{}]*\\},?`, "g");
  if (ultRe.test(ult)) {
    ult = ult.replace(ultRe, "").replace(/,\s*\]/g, "\n    ]");
    if (!dryRun) writeUtf8("assets/js/ultimas-propiedades-zaguan.js", ult);
    log.cambios.ultimas_propiedades = "eliminado";
  }

  // 3. Quitar de alquileres/index.html
  let alq = readUtf8("alquileres/index.html");
  const cardRe = new RegExp(`(?:\\s*<!--[^>]*${ref}[^>]*-->)?\\s*<article class="rental-card"[\\s\\S]*?${slug}[\\s\\S]*?</article>`, "g");
  const ldRe = new RegExp(`\\s*\\{\\s*"@type":\\s*"ListItem",[\\s\\S]*?${slug}[\\s\\S]*?\\},?`, "g");
  if (cardRe.test(alq) || ldRe.test(alq)) {
    alq = alq.replace(cardRe, "").replace(ldRe, "").replace(/,\s*\]/g, "\n        ]");
    if (!dryRun) writeUtf8("alquileres/index.html", alq);
    log.cambios.catalogo_alquileres = "eliminado";
  }

  // 3b. Quitar de alquiloanual/index.html, index.html (Home) y links/index.html
  let alqAnual = readUtf8("alquiloanual/index.html");
  const refBlockRe = new RegExp(`(?:\\s*<!--[^>]*${ref}[^>]*-->)?\\s*<(article|div)[^>]*data-ref=["']${ref}["'][\\s\\S]*?</\\1>`, "g");
  const prevAlqAnual = alqAnual;
  alqAnual = alqAnual.replace(refBlockRe, "");
  if (alqAnual !== prevAlqAnual) {
    if (!dryRun) writeUtf8("alquiloanual/index.html", alqAnual);
    log.cambios.alquiloanual = "eliminado";
  }

  let homeHtml = readUtf8("index.html");
  const prevHome = homeHtml;
  const offerRe = new RegExp(`\\s*\\{\\s*"@type":\\s*"Offer",[\\s\\S]*?${slug}[\\s\\S]*?\\},?`, "g");
  const hsBtnRe = new RegExp(`\\s*<a class="hs-btn[^"]*"[^>]*href="[^"]*${slug}[^"]*"[^>]*>[\\s\\S]*?</a>`, "g");
  homeHtml = homeHtml.replace(offerRe, "").replace(/,\s*\]/g, "\n    ]").replace(hsBtnRe, "");
  if (homeHtml !== prevHome) {
    if (!dryRun) writeUtf8("index.html", homeHtml);
    log.cambios.home_index = "eliminado";
  }

  let linksHtml = readUtf8("links/index.html");
  const prevLinks = linksHtml;
  const starBtnRe = new RegExp(`\\s*<a class="star-btn[^"]*"[^>]*href="[^"]*${slug}[^"]*"[^>]*>[\\s\\S]*?</a>`, "g");
  linksHtml = linksHtml.replace(starBtnRe, "");
  if (linksHtml !== prevLinks) {
    if (!dryRun) writeUtf8("links/index.html", linksHtml);
    log.cambios.links_hub = "eliminado";
  }

  // 4. Quitar de garantias-alquiler/index.html
  let sim = readUtf8("garantias-alquiler/index.html");
  const simRe = new RegExp(`\\s*'${slug}':[^\\n]*\\n?`, "g");
  if (simRe.test(sim)) {
    sim = sim.replace(simRe, "\n");
    if (!dryRun) writeUtf8("garantias-alquiler/index.html", sim);
    log.cambios.simulador_garantias = "eliminado";
  }

  // 5. Quitar de sitemap.xml
  let sm = readUtf8("sitemap.xml");
  const smRe = new RegExp(`\\s*<url>\\s*<loc>[^<]*${slug}[^<]*</loc>[\\s\\S]*?</url>`, "g");
  if (smRe.test(sm)) {
    sm = sm.replace(smRe, "");
    if (!dryRun) writeUtf8("sitemap.xml", sm);
    log.cambios.sitemap = "eliminado";
  }

  // 6. Quitar de llms.txt
  let llms = readUtf8("llms.txt");
  const llmsRe = new RegExp(`^.*(?:${ref}|${slug}).*\\n?`, "gm");
  if (llmsRe.test(llms)) {
    llms = llms.replace(llmsRe, "");
    if (!dryRun) writeUtf8("llms.txt", llms);
    log.cambios.llms_txt = "eliminado";
  }

  // 7. Borrar carpeta pública HTML, packs 4 redes y estados si --borrar-todo
  if (borrarTodo && !dryRun) {
    const pubFolder = path.join(ROOT, relPath.replace(/^\//, ""));
    if (relPath && relPath.length > 5 && fs.existsSync(pubFolder)) {
      fs.rmSync(pubFolder, { recursive: true, force: true });
      log.cambios.carpeta_pdp = `eliminada (${pubFolder})`;
    }
    for (const dir of [path.join(ROOT, "assets/packs", ref), path.join(PACKS_DESKTOP_DIR, ref)]) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        log.cambios[`pack_${path.basename(path.dirname(dir))}`] = `eliminado (${dir})`;
      }
    }
    if (est?.imagen_9_16) {
      const pJpg = path.join(ROOT, est.imagen_9_16.replace(`${BASE_URL}/`, ""));
      if (fs.existsSync(pJpg)) fs.rmSync(pJpg, { force: true });
    }
    if (est?.video_9_16) {
      const pMp4 = path.join(ROOT, est.video_9_16.replace(`${BASE_URL}/`, ""));
      if (fs.existsSync(pMp4)) fs.rmSync(pMp4, { force: true });
    }
  }

  // 8. Marcar baja en Bóveda Privada (conservando historial del propietario con estado_publicacion = 'baja_total')
  if (bov && !dryRun) {
    bov.estado_publicacion = "baja_total";
    bov.fecha_baja = new Date().toISOString();
    boveda.actualizado = new Date().toISOString();
    fs.writeFileSync(BOVEDA_PATH, JSON.stringify(boveda, null, 2), "utf8");
    log.cambios.boveda = "marcada baja_total";
  }

  log.pendientes_nube = [
    `Pausar anuncio en Instagram/Meta Ads para ${ref} si tenía pauta prendida`,
    `Cancelar/archivar en Aprobalo Cloud las piezas con tema '${ref}'`,
    bov?.id_crm ? `Confirmar sello en CRM Worker para ${bov.id_crm}` : null,
  ].filter(Boolean);

  if (flags.push && !dryRun) {
    execFileSync("git", ["-C", ROOT, "add", "-A"], { stdio: "inherit" });
    execFileSync("git", ["-C", ROOT, "commit", "-m", `chore(zaguan): baja total 1-tiro ${ref} (${slug})`], { stdio: "inherit" });
    execFileSync("git", ["-C", ROOT, "push", "origin", "main"], { stdio: "inherit" });
  }

  console.log(JSON.stringify({ ok: true, action: "baja_total", ...log }, null, 2));
}

function auditExisting(needle) {
  const estados = JSON.parse(readUtf8("assets/estados/estados_hoy.json")).estados_activos || [];
  const ultimas = readUtf8("assets/js/ultimas-propiedades-zaguan.js");
  const alquileresHtml = readUtf8("alquileres/index.html");
  const alquiloAnualHtml = readUtf8("alquiloanual/index.html");
  const homeHtml = readUtf8("index.html");
  const linksHtml = readUtf8("links/index.html");
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
  const ref = bov?.ref_publica || est?.ref_publica || needle;
  const packWeb = path.join(ROOT, "assets/packs", ref);
  const packDesktop = path.join(PACKS_DESKTOP_DIR, ref);
  const slug = urlPath.split("/").filter(Boolean).pop() || needle;
  const smallCountsRe = /Todas\s*\(\d+\)|Mostrando\s+\d+|5\s+desarrollos|5\s+proyectos|5\s+edificios|6\s+en\s+cartera|4\s+disponibles/i;

  const checks = {
    ref,
    url: pubUrl || null,
    boveda_privada: Boolean(bov),
    ficha_html: pdpExists,
    catalogo_web: Boolean(urlPath && (alquileresHtml.includes(urlPath) || propiedadesHtml.includes(urlPath))),
    alquiloanual_web: urlPath.startsWith("/propiedades/") ? true : Boolean(urlPath && alquiloAnualHtml.includes(urlPath)),
    home_index: Boolean(urlPath && homeHtml.includes(urlPath)),
    links_hub: Boolean(urlPath && linksHtml.includes(urlPath)),
    home_y_blog_recientes: Boolean(urlPath && ultimas.includes(urlPath)),
    simulador_garantias: Boolean(!urlPath.startsWith("/propiedades/") && simHtml.includes(slug)),
    estado_9_16_jpg: Boolean(jpgPath && fs.existsSync(jpgPath)),
    estado_9_16_mp4: Boolean(mp4Path && fs.existsSync(mp4Path)),
    estados_hoy_json: Boolean(est),
    pack_4_redes_y_ads: Boolean(
      fs.existsSync(path.join(packWeb, "ads_y_4_piezas.json")) &&
        fs.existsSync(path.join(packDesktop, "PAQUETE_4_REDES_Y_ADS.json"))
    ),
    sitemap_xml: Boolean(pubUrl && sitemap.includes(pubUrl)),
    llms_txt: Boolean(pubUrl && llms.includes(pubUrl)),
    sin_contadores_chicos: !smallCountsRe.test(alquileresHtml + alquiloAnualHtml + homeHtml + linksHtml + propiedadesHtml),
  };
  const allOk = Object.entries(checks)
    .filter(([k]) => k !== "ref" && k !== "url")
    .every(([, v]) => v === true);
  console.log(JSON.stringify({ ok: allOk, checks }, null, 2));
  if (!allOk) process.exit(2);
}

async function runPublish(specPath, flags, { packOnly = false } = {}) {
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
  const jpgRel = spec.estado_jpg_rel || `assets/estados/${estadoPrefix}_ESTADO_${upperTag}.jpg`;
  const mp4Rel = spec.estado_mp4_rel || `assets/estados/${estadoPrefix}_VIDEO_ESTADO_${upperTag}.mp4`;

  const socialOut = build4SocialPostsAndAds(spec, photos, photosDir, fullUrl, mp4Rel, dryRun);
  if (packOnly) {
    console.log(JSON.stringify({ ok: true, ref: spec.ref_publica, socialOut }, null, 2));
    return;
  }

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
    alquiloanual: updateAlquiloAnual(spec, relPath, photos, dryRun),
    home_index: updateHomeIndex(spec, relPath, dryRun),
    links_hub: updateLinksIndex(spec, relPath, dryRun),
    simulador: updateGarantiasSim(spec, dryRun),
    estados: updateEstadosHoy(spec, fullUrl, jpgRel, mp4Rel, dryRun),
    social_4_piezas_y_ads: socialOut.portadas_urls,
    sitemap: updateSitemap(fullUrl, dryRun),
    llms: updateLlmsTxt(spec, fullUrl, dryRun),
  };

  if (flags.push && !dryRun) {
    execFileSync("git", ["-C", ROOT, "add", "-A"], { stdio: "inherit" });
    execFileSync("git", ["-C", ROOT, "commit", "-m", `feat(zaguan): ficha 360 1-tiro ${spec.ref_publica} (${spec.slug}) + 4 redes + Ads + indexacion`], { stdio: "inherit" });
    execFileSync("git", ["-C", ROOT, "push", "origin", "main"], { stdio: "inherit" });

    let liveOk = false;
    for (let i = 0; i < 12; i++) {
      const [rPage, rMp4, rPack] = await Promise.all([
        fetch(fullUrl).catch(() => ({ status: 0 })),
        fetch(`${BASE_URL}/${mp4Rel}`, { method: "HEAD" }).catch(() => ({ status: 0 })),
        fetch(socialOut.portadas_urls[0], { method: "HEAD" }).catch(() => ({ status: 0 })),
      ]);
      if (rPage.status === 200 && rMp4.status === 200 && rPack.status === 200) {
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
} else if (args.flags.baja) {
  await runBajaTotal(args.flags.baja === true ? args.positional[0] : args.flags.baja, args.flags);
} else if (args.flags["pack-redes"]) {
  await runPublish(args.flags["pack-redes"] === true ? args.positional[0] : args.flags["pack-redes"], args.flags, { packOnly: true });
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
    gc_incluye: "agua OSE incluida",
    total_uyu: 33500,
    precio_publico: "$U 30.000 + $U 3.500 GC",
    superficie_m2: "~55 m²",
    piso_orientacion: "Piso 4 orientación Norte",
    equipamiento: "Aire acondicionado y calefón instalados",
    seguridad: "Edificio con ascensor y cámaras",
    admision: "Acepta niños y mascotas",
    cochera: "Cocheras en alquiler en el edificio",
    garantias: "Garantía aseguradora (Porto Seguro, Sura, Mapfre o Santander)",
    horario_visitas: "Desde las 16:00 hs todos los días",
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
  fs.writeFileSync(dest, JSON.stringify({ variables_corchetes_referencia: FICHA_CORCHETES_VARIABLES, ...tpl }, null, 2), "utf8");
  console.log(`Plantilla escrita en ${dest}`);
} else if (args.flags.publish) {
  await runPublish(args.flags.publish, args.flags);
} else {
  console.log(
    "Uso:\n" +
      "  node tools/publicar_ficha_1tiro.mjs --audit ZAG-ALQ-07\n" +
      "  node tools/publicar_ficha_1tiro.mjs --init-template /tmp/spec.json\n" +
      "  node tools/publicar_ficha_1tiro.mjs --pack-redes /ruta/spec.json\n" +
      "  node tools/publicar_ficha_1tiro.mjs --publish /ruta/spec.json [--push] [--dry-run]\n" +
      "  node tools/publicar_ficha_1tiro.mjs --baja ZAG-ALQ-07 [--borrar-todo] [--push]"
  );
}
