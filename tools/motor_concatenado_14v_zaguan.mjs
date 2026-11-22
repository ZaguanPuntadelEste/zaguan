#!/usr/bin/env node
/**
 * Motor Concatenado 14 Verticales + Radar Abierto sin Login · 1 - ZAGUÁN
 * Uso:
 *   node motor_concatenado_14v_zaguan.mjs --concatenar
 *   node motor_concatenado_14v_zaguan.mjs --barrer-portales
 */
import { readFileSync, writeFileSync } from 'node:fs';

const CSV_DRIVE = '/Users/arianawajntraub/Library/CloudStorage/GoogleDrive-ariana@starunionservicios.com.ar/Mi unidad/zaguan/zaguan-main/admin/MASTER_PUBLICACIONES_Y_OKS_ZAGUAN.csv';
const OUT_DRIVE = '/Users/arianawajntraub/Library/CloudStorage/GoogleDrive-ariana@starunionservicios.com.ar/Mi unidad/zaguan/zaguan-main/admin/CONOCIMIENTO_CONCATENADO_14V_ZAGUAN.json';
const OUT_DESK = '/Users/arianawajntraub/Desktop/ZAGUAN CLAUDE/CONOCIMIENTO_CONCATENADO_14V_ZAGUAN.json';
const RADAR_OUT = '/Users/arianawajntraub/Library/CloudStorage/GoogleDrive-ariana@starunionservicios.com.ar/Mi unidad/zaguan/zaguan-main/admin/radar_portales_abiertos.json';
const RADAR_OUT_DESK = '/Users/arianawajntraub/Desktop/ZAGUAN CLAUDE/radar_portales_abiertos.json';

function parseCSV(text) {
  const clean = text.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    const next = clean[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\r' && next === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
    } else if (ch === '\n' || ch === '\r') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  const headers = rows[0] || [];
  return rows.slice(1).filter((r) => r.length >= 2 && r.some((x) => x.trim())).map((r) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h.trim()] = (r[idx] || '').trim();
    });
    return obj;
  });
}

function extractVerticalCode(v14) {
  const txt = String(v14 || '');
  if (/\bO5\b/.test(txt)) return 'O5';
  if (/\bO7\b/.test(txt) && /\bO4\b/.test(txt)) return 'O4';
  const m = txt.match(/\b([OD][1-7])\b/);
  return m ? m[1] : 'O1';
}

const MATRIZ_14V = {
  O1: {
    dolor: 'Vender sin atarse a exclusividad y filtrar curiosos sin fondos reales.',
    capa1: ['Ubicación exacta / padrón', 'Metros de terreno y edificados', 'Precio en USD', 'Estado de títulos / planos', 'Banco o permuta'],
    capa2: ['Quién construyó y calidad estructural (humedad, aberturas, vientos)', 'Antigüedad real (audio)', 'Documentación en PDF'],
    cruce: 'D3 (compra casa hecha) + D7 (lote que acepta casa a reciclar o demoler)',
  },
  O2: {
    dolor: 'Defender precio por m2 frente a torres vecinas y aclarar gastos comunes reales.',
    capa1: ['Edificio y piso / orientación', 'Metros propios y terraza', 'Gastos comunes mensuales', 'Cochera / baulera', 'Precio USD'],
    capa2: ['Estado documental / títulos PDF', 'Si tiene renta vigente o está vacío'],
    cruce: 'D4 (compra apto hecho) + D1 (vender usado para pasar a pozo)',
  },
  O3: {
    dolor: 'Colocar activo comercial o galpón con rubro e infraestructura habilitada.',
    capa1: ['Metros de salón y frente', 'Habilitación municipal y trifásica', 'Gastos comunes / cargas', 'Precio USD o canon'],
    capa2: ['Planos en PDF', 'Usos admitidos (gastronomía, consultorio, depósito)'],
    cruce: 'D6 (busca local/oficina) + O6 (alquiler si no cierra venta rápida)',
  },
  O4: {
    dolor: 'Demostrar edificabilidad real y papeles limpios para dar liquidez al padrón.',
    capa1: ['Padrón y manzana', 'Metros totales y frente/fondo', 'Servicios en puerta (OSE/UTE/saneamiento)', 'Precio USD'],
    capa2: ['FOT/FOS/retiros permitidos', 'Títulos y planos en PDF'],
    cruce: 'D5 (busca lote) + D7 (busca lote y evalúa obra base o demolición)',
  },
  O5: {
    dolor: 'Mostrar el valor de una construcción base o proyecto en curso que en foto fija parece obra gris.',
    capa1: ['Ubicación y entorno (ej. frente a laguna / costa)', 'Metros y avance real de obra', 'Precio USD y forma de pago'],
    capa2: ['Memoria estructural y autoría (ej. cálculo para vientos oceánicos)', 'Croquis base proyectable', 'Antigüedad por audio', 'Permisos BPS/Intendencia y papeles en PDF', 'Video completo de recorrido'],
    cruce: 'D7 (busca lote y descubre proyecto base listo para continuar arriba sin arrancar de cero) + D3',
  },
  O6: {
    dolor: 'Evitar impagos, destrozos y visitas en vano sin respaldo.',
    capa1: ['Canon mensual en $U o USD', 'Qué incluye (GC, Wi-Fi, consumos)', 'Garantías aceptadas y rechazadas (Porto, Sura, Mapfre, Santander, ANDA, depósito)', 'Mascotas y plazo'],
    capa2: ['Quién tiene llaves y horarios', 'Condiciones de ajuste y video de recorrido'],
    cruce: 'D2 (inquilinos filtrados con garantía aprobada) + D3/D4 (si evalúa vender luego)',
  },
  O7: {
    dolor: 'Registrar interesados bajo protocolo oficial de desarrolladora y mostrar gastos reales de cierre.',
    capa1: ['Lista vigente Desde USD', 'Cronograma de cuotas', 'Gastos de ocupación (%)', 'Fecha de entrega'],
    capa2: ['Exoneraciones Ley 18.795', 'Reglas de pre-registro de clientes'],
    cruce: 'D1 (inversor pozo) + D4 (comprador de usado que conviene financiar en cuotas de obra)',
  },
  D2: {
    dolor: 'Falta de alquiler anual estable en Maldonado/PDE y demora de respuestas.',
    capa1: ['Zona deseada', 'Dormitorios y tope mensual', 'Garantía aprobada (Porto, Sura, Mapfre, Santander, ANDA)', 'Fecha de ingreso y mascotas'],
    capa2: ['Franja horaria para visita', 'Cantidad de ocupantes'],
    cruce: 'O6 (inventario anual real como ZAG-ALQ-05 La Fortuna)',
  },
};

function validarPokaYokeTexto(texto, vertical) {
  const violaciones = [];
  if (/[¿¡]/.test(texto)) violaciones.push('SIGNOS_APERTURA');
  if (/\b[a-záéíóúüñ]{3,}mente\b/i.test(texto)) violaciones.push('ADVERBIO_MENTE');
  if (/\bencajar\b/i.test(texto)) violaciones.push('PALABRA_ENCAJAR');
  if (!['O6', 'D2'].includes(vertical) && /\b(porto\s+seguro|sura|mapfre|anda|cgn|garant[ií]a\s+aseguradora)\b/i.test(texto)) {
    violaciones.push('GARANTIA_EN_VERTICAL_VENTA');
  }
  if (/^O[1-6]$/.test(vertical) && /https?:\/\/zaguanpropiedades\.com\/(?:alquileres|ventas|proyectos|propiedades)\/[a-z0-9-]+/i.test(texto)) {
    violaciones.push('CANDADO_FRANJA_GRIS_URL_FICHA');
  }
  if (/^D[1-7]$/.test(vertical)) {
    if (/(maps\.google\.com|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(texto)) violaciones.push('PIN_GPS_CRUDO_EN_T0');
    if (/con el due[nñ]o/i.test(texto)) violaciones.push('MENCION_DUENO_EN_DEMANDA');
    const urls = texto.match(/https?:\/\/[^\s]+/gi) || [];
    if (urls.length > 1) violaciones.push('MAS_DE_UN_LINK_EN_T0');
  }
  return { pass: violaciones.length === 0, violaciones };
}

function primerNombre(nombre) {
  const clean = String(nombre || '').replace(/\(.*?\)/g, '').trim();
  const tok = clean.split(/\s+/)[0] || '';
  if (!tok || /^(contacto|equipo|departamento|canal|ficha|ven[ií]|maquinasgym)/i.test(tok)) return '';
  return tok;
}

function construirConcatenado(row) {
  const vCode = extractVerticalCode(row.vertical_14);
  const meta = MATRIZ_14V[vCode] || MATRIZ_14V.O1;
  const telDigits = String(row.telefono_wa || '').replace(/\D+/g, '');
  const nombre = primerNombre(row.nombre_persona);
  const saludo = nombre ? `Hola ${nombre}, cómo estás?` : 'Hola, cómo estás?';
  const zona = row.zona_barrio || 'Maldonado';
  const precio = row.precio_publicado || 'valor publicado';

  let guionWa = '';
  let anguloRedes = '';
  let anguloAds = {
    publico: `${zona} + Punta del Este (25 a 55 años)`,
    gancho: '',
    botones_wa: [],
  };
  let cruceLatente = meta.cruce;
  let alertaAndon = false;
  let motivoAndon = '';

  if (row.id_registro === 'MP-12') {
    guionWa = `${saludo} Te chequeo corto por el apto en La Fortuna ($U 30.000 GC y Wi-Fi inc.): seguimos filtrando interesados con garantía aseguradora aprobada (sin ANDA). Sigue libre para coordinar visita esta semana?`;
    anguloRedes = 'Carrusel/Secuencia 4:5 La Fortuna: destacar $U 30.000 con GC y Wi-Fi incluidos + cochera fija + pet-friendly.';
    anguloAds = {
      publico: 'Maldonado + Punta del Este (+17 km), 24 a 45 años',
      gancho: 'Apartamento 2 dormitorios a estrenar en La Fortuna a $U 30.000 con gastos comunes y Wi-Fi incluidos.',
      botones_wa: [
        'Tengo garantía aseguradora y quiero coordinar visita',
        'Quiero recibir la ficha completa y ubicación exacta de La Fortuna',
        'Busco en otra zona o tengo propiedad para publicar',
      ],
    };
    alertaAndon = true;
    motivoAndon = 'Campaña activa en Zaguán ADS; controlar visitas y vigencia cada 7 días.';
  } else if (row.id_registro === 'MP-16') {
    guionWa = `${saludo} Soy Mar, de ZAGUÁN Propiedades. Para completar el respaldo de tu casa en Santa Mónica (USD 160.000) con estructura para vientos oceánicos y croquis frente a la laguna, confirmame si ya sumamos el video de recorrido y los papeles del padrón para filtrarte compradores reales.`;
    anguloRedes = 'Reel/Carrusel 4:5 + Video completo Santa Mónica (llegando a José Ignacio): explicar en portada que es construcción base en hormigón con croquis frente a laguna para proyectar sin arrancar de cero.';
    anguloAds = {
      publico: 'Compradores e inversores de lotes y casas en La Barra, Manantiales, José Ignacio y Montevideo (28 a 60 años)',
      gancho: 'Buscás armar tu proyecto frente a la laguna en Santa Mónica, llegando a José Ignacio? Mirá esta construcción base con croquis proyectable y video completo.',
      botones_wa: [
        'Quiero ver el video completo y la ubicación en Santa Mónica',
        'Busco lote o proyecto para construir en La Barra / José Ignacio',
        'Tengo propiedad para vender en la zona',
      ],
    };
    cruceLatente = 'Cruce maestro D7 <-> O5: captar a quien busca terreno en Santa Mónica / José Ignacio ofreciéndole construcción base sólida calculada para vientos oceánicos (ahorra 12 meses de obra).';
    alertaAndon = true;
    motivoAndon = 'Caso escuela Capa 2 multimodal (vientos oceánicos, croquis, video, audio antigüedad, PDF terreno).';
  } else if (vCode === 'O6') {
    guionWa = `${saludo} Te escribe Mar, de ZAGUÁN Propiedades. Vi tu propiedad en alquiler anual en ${zona} (${precio}). Trabajamos sin exclusividad filtrando garantía aseguradora aprobada (Porto, Sura o Mapfre) antes de coordinar visitas. Sigue disponible para confirmarte qué garantías aceptás y si incluye gastos comunes?`;
    anguloRedes = `Ficha / Story 9:16 Alquiler Anual en ${zona}: precio transparente ${precio} + filtro de garantía claro.`;
    anguloAds = {
      publico: `${zona} y alrededores (+17 km), 24 a 48 años`,
      gancho: `Alquiler anual en ${zona} (${precio}). Requisitos claros y visitas coordinadas por WhatsApp.`,
      botones_wa: [
        `Tengo garantía aseguradora y consulto por ${zona}`,
        'Busco alquiler anual en otra zona de Maldonado',
        'Tengo propiedad para alquilar sin exclusividad',
      ],
    };
  } else if (vCode === 'O7') {
    guionWa = `${saludo} Soy Mar, de ZAGUÁN Propiedades. Trabajamos obra nueva en Punta del Este y Maldonado con desglose de gastos de ocupación y pre-registro formal. Seguimos con disponibilidad vigente en ${row.titulo_o_activo} para validar listas y planos?`;
    anguloRedes = `Reel/Carrusel obra nueva ${row.titulo_o_activo} (${zona}): precio público ${precio} + esquema de cuotas y beneficios reales.`;
    anguloAds = {
      publico: 'Inversores Uruguay / Argentina / Brasil interesados en Punta del Este y Maldonado (30 a 62 años)',
      gancho: `${row.titulo_o_activo} en ${zona}: ${precio}. Financiación y costos totales de cierre sin sorpresas.`,
      botones_wa: [
        `Quiero planos y cuotas de ${row.titulo_o_activo}`,
        'Busco inversión en pozo Ley 18.795',
        'Quiero asesoramiento notarial para comprar desde el exterior',
      ],
    };
  } else if (row.id_registro === 'MP-65' || row.id_registro === 'MP-66') {
    guionWa = `${saludo} Pudiste ver las fotos de La Fortuna? Decime si te sirve la condición de garantía aseguradora (Porto, Sura, Mapfre o Santander) para agendarte visita esta semana, o si buscás con otra garantía / en otra zona de Maldonado así te paso alternativas.`;
    anguloRedes = 'Reorientar pauta y bienvenida WA La Fortuna: 1 solo link web + 1 sola pregunta filtro (garantía aseguradora) en T0; personas y día recién en Turno 2.';
    anguloAds = {
      publico: 'Maldonado + Punta del Este (+17 km), 24 a 45 años',
      gancho: 'Alquiler anual en La Fortuna ($U 30.000 GC y Wi-Fi inc.). 1 link + 1 pregunta filtro.',
      botones_wa: ['Tengo garantía aseguradora y quiero coordinar visita', 'Quiero recibir la ficha completa de La Fortuna', 'Busco en otra zona o con otra garantía'],
    };
    cruceLatente = 'Rescate T1/T2 La Fortuna -> O6 alternativas en Maldonado si el lead tiene ANDA o presupuesto distinto.';
    alertaAndon = true;
    motivoAndon = `Lead real de hoy (${row.id_registro} · ${row.nombre_persona}) clavó visto tras T0 largo con 2 links; listo para rescate en 1 clic.`;
  } else if (vCode === 'D2') {
    guionWa = `${saludo} Gracias por consultar en ZAGUÁN. Para pasarte opciones activas en ${zona} (${precio}), contás con garantía de aseguradora aprobada (Porto, Sura, Mapfre o Santander) o buscás con otra garantía?`;
    anguloRedes = `Placa informativa de demanda alquiler anual en ${zona}: claridad de requisitos y garantías aceptadas.`;
    anguloAds = {
      publico: `${zona} (+17 km), 24 a 45 años`,
      gancho: `Alquiler anual en ${zona} (${precio}). Consultá disponibilidad real hoy.`,
      botones_wa: ['Tengo garantía aseguradora y busco visita', 'Busco en otra zona', 'Tengo propiedad para publicar'],
    };
  } else {
    guionWa = `${saludo} Te escribe Mar, de ZAGUÁN Propiedades. Vi tu propiedad en venta en ${zona} (${precio}). Trabajamos sin exclusividad y pre-calificamos compradores con respaldo notarial local. Sigue disponible para confirmar metros, documentación y detalles constructivos?`;
    anguloRedes = `Carrusel territorial ${zona}: destacar potencial constructivo, metros y ubicación real (${precio}).`;
    anguloAds = {
      publico: `Compradores en ${zona}, Punta del Este y Montevideo (28 a 60 años)`,
      gancho: `Oportunidad en ${zona} (${precio}). Consultá ficha técnica y documentación por WhatsApp.`,
      botones_wa: [
        `Quiero más detalles de ${zona}`,
        'Busco casa, terreno o proyecto en la zona',
        'Tengo propiedad para publicar sin exclusividad',
      ],
    };
  }

  const pk = validarPokaYokeTexto(guionWa, vCode);
  const waLink = telDigits.length >= 8 ? `https://wa.me/${telDigits}?text=${encodeURIComponent(guionWa)}` : '';
  if (row.ok_bienvenida === 'pendiente_bienvenida' && row.estado_crm === 'respondio') {
    alertaAndon = true;
    motivoAndon = 'Propietario respondió; falta correr Bienvenida de OKs y Capa 2.';
  }

  return {
    id_registro: row.id_registro,
    vertical_code: vCode,
    vertical_14: row.vertical_14,
    nombre_persona: row.nombre_persona,
    telefono_wa: telDigits,
    zona_barrio: zona,
    titulo_o_activo: row.titulo_o_activo,
    precio_publicado: precio,
    estado_crm: row.estado_crm,
    ok_bienvenida: row.ok_bienvenida,
    candado_franja_gris: /^O[1-6]$/.test(vCode),
    dolor_detectado: meta.dolor,
    faltantes_capa_1: meta.capa1,
    faltantes_capa_2: meta.capa2,
    condiciones_actuales: row.condiciones_y_faltantes,
    concatenado_4_salidas: {
      '1_guion_whatsapp_mar': guionWa,
      link_wa_me_1clic: waLink,
      '2_angulo_redes_aprobalo': anguloRedes,
      '3_angulo_pauta_ads': anguloAds,
      '4_cruce_latente_x_y': cruceLatente,
    },
    alerta_andon: alertaAndon,
    motivo_andon: motivoAndon,
    pokayoke_pass: pk.pass,
    pokayoke_violaciones: pk.violaciones,
  };
}

function detectarVerticalDesdeAviso(titulo, url, verticalBase) {
  const t = `${titulo || ''} ${url || ''}`.toLowerCase();
  if (/local|comercial|galp[oó]n|oficina/.test(t)) return 'O3';
  if (/terreno|lote|padr[oó]n/.test(t)) return 'O4';
  if (/alquiler/.test(t)) return 'O6';
  if (/apartamento|depto|ph\b/.test(t)) return 'O2';
  if (/casa|chalet/.test(t)) return 'O1';
  return verticalBase || 'O1';
}

function esPosibleInmobiliaria(publicante, texto) {
  const pub = String(publicante || '').toLowerCase();
  const body = String(texto || '').toLowerCase();
  return (
    /(inmobiliaria|propiedades|real estate|bienes ra[ií]ces|broker|negocios inmobiliarios|estudio|remax|sotheby|century|colegas|honorarios inmobiliarios)/i.test(pub)
    || /\b(somos inmobiliaria|comisi[oó]n inmobiliaria|colegas consultar)\b/i.test(body)
  );
}

function armarPrimerContactoPortal(ficha) {
  const vCode = ficha.vertical_code;
  const zona = ficha.zona || 'Maldonado';
  const precio = ficha.precio || 'valor publicado';
  if (vCode === 'O6') {
    return `Hola, cómo estás? Te escribe Mar, de ZAGUÁN Propiedades. Vi tu publicación de alquiler anual en ${zona} (${precio}). Trabajamos sin exclusividad filtrando garantía aseguradora aprobada (Porto, Sura o Mapfre) antes de coordinar visitas. Sigue disponible para confirmarte qué garantías aceptás y si incluye gastos comunes?`;
  }
  if (vCode === 'O3') {
    return `Hola, cómo estás? Te escribe Mar, de ZAGUÁN Propiedades. Vi tu local/espacio comercial en ${zona} (${precio}). Trabajamos sin exclusividad acercando clientes calificados por rubro. Sigue disponible para confirmarte metros reales, trifásica y usos admitidos?`;
  }
  return `Hola, cómo estás? Te escribe Mar, de ZAGUÁN Propiedades. Vi tu propiedad en ${zona} (${precio}). Trabajamos sin exclusividad y pre-calificamos interesados con respaldo notarial local. Sigue disponible para confirmar metros, ubicación exacta y documentación?`;
}

async function fetchTextSafe(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    signal: AbortSignal.timeout(12000),
  });
  return { status: res.status, html: await res.text() };
}

function parseGallitoItem(html, url, verticalBase) {
  const rawTitle = ((html.match(/<title>([^<]+)<\/title>/i) || [])[1] || '').split('|')[0].trim();
  const metaDesc = ((html.match(/<meta\s+name="description"\s+content="([^"]+)"/i) || [])[1] || '').trim();
  let ldObj = {};
  for (const m of html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(m[1]);
      if (parsed?.['@graph']) {
        const page = parsed['@graph'].find((x) => x['@type'] === 'WebPage') || {};
        const listing = parsed['@graph'].find((x) => x['@type'] === 'RealEstateListing') || {};
        ldObj = { ...page, ...listing };
        break;
      }
    } catch {}
  }
  const titulo = ldObj.name || rawTitle || 'Aviso Gallito';
  const descripcion = ldObj.description || metaDesc;
  const priceMatch = `${titulo} ${descripcion} ${html.slice(0, 60000)}`.match(/\b(USD|U\$S|\$U|UYU)\s*[\d.,]{2,12}/i);
  const phones = [...new Set((html.match(/\b09\d[\s-]?\d{3}[\s-]?\d{3}\b/g) || []).map((p) => p.replace(/[\s-]+/g, '')))].filter(
    (p) => !['099123456'].includes(p)
  );
  const vCode = detectarVerticalDesdeAviso(titulo, url, verticalBase);
  const descartado = esPosibleInmobiliaria(ldObj?.author?.name || '', `${titulo} ${descripcion}`);
  return {
    portal: 'Gallito',
    url,
    titulo,
    precio: priceMatch ? priceMatch[0].trim() : 'Consultar',
    zona: (titulo.match(/\ben\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,2})/) || [])[1] || 'Maldonado',
    publicante: ldObj?.author?.name || 'Sin especificar en ficha',
    descartado_por_inmobiliaria: descartado,
    vertical_code: vCode,
    celulares_uy: phones.slice(0, 3),
    descripcion_breve: descripcion.slice(0, 220),
  };
}

function parseInfoCasasItem(html, url, verticalBase) {
  const ndRaw = (html.match(/<script\s+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/) || [])[1];
  let d = {};
  if (ndRaw) {
    try {
      d = JSON.parse(ndRaw)?.props?.pageProps?.data || {};
    } catch {}
  }
  const titulo = d.title || ((html.match(/<title>([^<]+)<\/title>/i) || [])[1] || '').split('.')[0].trim();
  const publicante = d.owner?.name || d.seller?.name || d.publisher?.name || 'Particular';
  const cur = d.price?.currency?.name === '$' ? '$U' : (d.price?.currency?.name || 'USD');
  const precio = d.price?.amount ? `${cur} ${d.price.amount}` : 'Consultar';
  const zona = d.locations?.neighbourhood?.[0]?.name || d.neighborhood || 'Maldonado';
  const desc = String(d.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const phones = [...new Set(((html + ' ' + JSON.stringify(d.owner || {})).match(/\b09\d[\s-]?\d{3}[\s-]?\d{3}\b/g) || []).map((p) => p.replace(/[\s-]+/g, '')))];
  const vCode = detectarVerticalDesdeAviso(titulo, url, verticalBase);
  const descartado = esPosibleInmobiliaria(publicante, `${titulo} ${desc}`);
  return {
    portal: 'InfoCasas',
    url,
    titulo,
    precio,
    zona,
    publicante,
    descartado_por_inmobiliaria: descartado,
    vertical_code: vCode,
    celulares_uy: phones.slice(0, 3),
    descripcion_breve: desc.slice(0, 220),
  };
}

async function barrerPortalesAbiertos() {
  const consultas = [
    { portal: 'Gallito', url: 'https://www.gallito.com.uy/inmuebles/alquiler/maldonado', vertical: 'O6' },
    { portal: 'Gallito', url: 'https://www.gallito.com.uy/inmuebles/venta/maldonado', vertical: 'O1' },
    { portal: 'Gallito', url: 'https://www.gallito.com.uy/inmuebles/locales-comerciales/maldonado', vertical: 'O3' },
    { portal: 'InfoCasas', url: 'https://www.infocasas.com.uy/alquiler/maldonado/dueno-directo', vertical: 'O6' },
    { portal: 'InfoCasas', url: 'https://www.infocasas.com.uy/venta/maldonado/dueno-directo', vertical: 'O1' },
  ];

  const fichasExtraidas = [];
  const errores = [];

  for (const c of consultas) {
    try {
      const { status, html } = await fetchTextSafe(c.url);
      if (status >= 400) {
        errores.push({ fuente: c.url, http_status: status });
        continue;
      }

      let links = [];
      if (c.portal === 'Gallito') {
        const raw = html.match(/https:\/\/www\.gallito\.com\.uy\/[a-z0-9-]+-inmuebles-\d{6,}/gi) || [];
        links = [...new Set(raw)].slice(0, 4);
      } else {
        const raw = html.match(/\/[a-z0-9-]+\/\d{8,}/g) || [];
        links = [...new Set(raw)]
          .filter((p) => !p.startsWith('/img/') && !p.startsWith('/assets/'))
          .map((p) => `https://www.infocasas.com.uy${p}`)
          .slice(0, 4);
      }

      for (const itemUrl of links) {
        try {
          const itemRes = await fetchTextSafe(itemUrl);
          if (itemRes.status >= 400) continue;
          const ficha = c.portal === 'Gallito'
            ? parseGallitoItem(itemRes.html, itemUrl, c.vertical)
            : parseInfoCasasItem(itemRes.html, itemUrl, c.vertical);

          const meta = MATRIZ_14V[ficha.vertical_code] || MATRIZ_14V.O1;
          const guion = armarPrimerContactoPortal(ficha);
          const pk = validarPokaYokeTexto(guion, ficha.vertical_code);
          const tel = ficha.celulares_uy[0] ? `598${ficha.celulares_uy[0].replace(/^0/, '')}` : '';

          fichasExtraidas.push({
            ...ficha,
            faltantes_capa_1: meta.capa1,
            faltantes_capa_2: meta.capa2,
            guion_whatsapp_mar: guion,
            link_wa_me_1clic: tel ? `https://wa.me/${tel}?text=${encodeURIComponent(guion)}` : '',
            pokayoke_pass: pk.pass,
          });
        } catch (errItem) {
          errores.push({ fuente: itemUrl, error: errItem.message });
        }
      }
    } catch (e) {
      errores.push({ fuente: c.url, error: e.message });
    }
  }

  const aptosDueno = fichasExtraidas.filter((f) => !f.descartado_por_inmobiliaria);
  const descartadosInmob = fichasExtraidas.filter((f) => f.descartado_por_inmobiliaria);

  const payload = {
    fecha: new Date().toISOString(),
    total_avisos_abiertos: fichasExtraidas.length,
    candidatos_limpios_sin_inmobiliaria: aptosDueno.length,
    descartados_inmobiliaria: descartadosInmob.length,
    con_celular_directo: aptosDueno.filter((f) => f.celulares_uy.length > 0).length,
    fichas_candidatas: aptosDueno,
    fichas_descartadas_inmobiliaria: descartadosInmob.map((d) => ({
      portal: d.portal,
      titulo: d.titulo,
      publicante: d.publicante,
      url: d.url,
    })),
    errores,
  };

  const outJson = JSON.stringify(payload, null, 2);
  writeFileSync(RADAR_OUT, outJson);
  writeFileSync(RADAR_OUT_DESK, outJson);
  console.log(JSON.stringify({
    ok: true,
    total_avisos_abiertos: payload.total_avisos_abiertos,
    candidatos_limpios_sin_inmobiliaria: payload.candidatos_limpios_sin_inmobiliaria,
    descartados_inmobiliaria: payload.descartados_inmobiliaria,
    con_celular_directo: payload.con_celular_directo,
    archivo: RADAR_OUT,
  }, null, 2));
}

function runConcatenar() {
  const rawCsv = readFileSync(CSV_DRIVE, 'utf-8');
  const rows = parseCSV(rawCsv);
  const items = rows.map(construirConcatenado);
  const fallos = items.filter((i) => !i.pokayoke_pass);

  const resumenPorVertical = {};
  for (const it of items) {
    resumenPorVertical[it.vertical_code] = (resumenPorVertical[it.vertical_code] || 0) + 1;
  }

  const outObj = {
    proyecto: '1 - ZAGUÁN',
    actualizado: new Date().toISOString(),
    total_registros: items.length,
    pokayoke_aprobados: items.length - fallos.length,
    pokayoke_fallidos: fallos.length,
    resumen_por_vertical: resumenPorVertical,
    items,
  };

  const jsonStr = JSON.stringify(outObj, null, 2);
  writeFileSync(OUT_DRIVE, jsonStr);
  writeFileSync(OUT_DESK, jsonStr);
  console.log(JSON.stringify({
    ok: fallos.length === 0,
    total_registros: outObj.total_registros,
    pokayoke_aprobados: outObj.pokayoke_aprobados,
    pokayoke_fallidos: outObj.pokayoke_fallidos,
    resumen_por_vertical: resumenPorVertical,
  }, null, 2));
  if (fallos.length > 0) process.exit(1);
}

const args = process.argv.slice(2);
if (args.includes('--barrer-portales')) {
  await barrerPortalesAbiertos();
} else {
  runConcatenar();
}
