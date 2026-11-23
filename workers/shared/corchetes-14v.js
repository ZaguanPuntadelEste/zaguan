/**
 * Matriz Deterministica 14 Verticales [CORCHETES] + Pre-Ficha + Boveda Filter
 * Proyecto: 1 - ZAGUAN (zaguanpropiedades.com)
 * Regla madre: Extraer SIEMPRE de lo ya escrito por el propietario antes de pedir [CORCHETES],
 * nunca filtrar datos de Boveda Privada (padron, manzana, carpeta, calle exacta, maps, telefono dueno,
 * honorarios internos) hacia payloads publicos, cola_ag o Aprobalo Cloud.
 */

export const ZAGUAN_CUENTA_ID = "0d9bb9b9-5348-4a2a-a0c9-b5ca64f9c5cb";

export const MATRIZ_14V = {
  O1: {
    codigo: "O1",
    operacion: "Venta",
    nombre: "Venta casa o apartamento usado (dueno directo)",
    capa1: ["zona_barrio", "precio_usd", "dormitorios", "superficie_m2", "titulos_regla"],
    capa2: ["contribucion_primaria", "ocupacion_entrega", "acepta_banco", "fotos_video", "disponibilidad_visitas"],
    cruce: "Compradores calificados D1/D4 buscando casa o apartamento pronto en Maldonado y Punta del Este.",
  },
  O2: {
    codigo: "O2",
    operacion: "Venta con renta",
    nombre: "Venta propiedad con renta o contrato vigente",
    capa1: ["zona_barrio", "precio_usd", "renta_mensual", "vencimiento_contrato", "garantia_vigente"],
    capa2: ["rendimiento_bruto", "gastos_comunes", "titulos_regla", "fotos_video", "disponibilidad_visitas"],
    cruce: "Inversores D6/D7 buscando renta inmediata comprobable en USD o UYU.",
  },
  O3: {
    codigo: "O3",
    operacion: "Venta terreno",
    nombre: "Venta terreno o lote propio",
    capa1: ["zona_barrio", "precio_usd", "superficie_m2", "frente_metros", "servicios_zona"],
    capa2: ["fot_fos_altura", "nivel_relleno", "titulos_regla", "fotos_video", "disponibilidad_visitas"],
    cruce: "Compradores de lote y constructores locales evaluando terreno propio vs. obra iniciada (O5).",
  },
  O4: {
    codigo: "O4",
    operacion: "Venta comercial",
    nombre: "Venta o alquiler local comercial, deposito o galpon",
    capa1: ["zona_barrio", "precio_publicado", "superficie_m2", "rubros_habilitados", "frente_vidriera"],
    capa2: ["potencia_trifasica", "gastos_comunes", "titulos_regla", "fotos_video", "disponibilidad_visitas"],
    cruce: "Operadores comerciales e inversores buscando renta corporativa en ejes urbanos de Maldonado.",
  },
  O5: {
    codigo: "O5",
    operacion: "Venta proyecto",
    nombre: "Venta obra iniciada, estructura o proyecto en construccion",
    capa1: ["zona_barrio", "precio_usd", "superficie_m2", "avance_obra", "planos_permisos"],
    capa2: ["costo_estimado_terminacion", "plazo_decreto_obra", "titulos_regla", "fotos_video", "disponibilidad_visitas"],
    cruce: "Cruce D7 <-> O5: captar compradores de terreno ofreciendoles estructura firme ya levantada.",
  },
  O6: {
    codigo: "O6",
    operacion: "Alquiler anual",
    nombre: "Alquiler anual vivienda dueno directo",
    capa1: ["zona_barrio", "precio_uyu", "dormitorios", "garantias_aceptadas", "gastos_comunes"],
    capa2: ["acepta_mascotas", "acepta_menores", "amoblado", "plazo_contrato", "disponibilidad_visitas"],
    cruce: "Demanda D2 filtrada previamente con garantia aseguradora (Porto, Sura, Mapfre, Santander).",
  },
  O7: {
    codigo: "O7",
    operacion: "Pozo / Obra nueva",
    nombre: "Desarrolladoras B2B y proyectos en pozo o estreno",
    capa1: ["zona_barrio", "precio_desde_usd", "tipologias_disponibles", "fecha_entrega", "gastos_ocupacion"],
    capa2: ["forma_pago_cuotas", "ley_vivienda_promovida", "amenidades", "material_comercial", "disponibilidad_visitas"],
    cruce: "Inversores locales y del exterior D6/D7 + compradores estreno con reserva temprana.",
  },
  D1: { codigo: "D1", operacion: "Compra vivienda", nombre: "Demanda compra casa o apartamento pronto", capa1: ["zona_barrio", "presupuesto_usd", "dormitorios", "forma_pago"], capa2: ["plazo_mudanza", "cochera"], cruce: "Oferta O1/O2." },
  D2: { codigo: "D2", operacion: "Alquiler anual", nombre: "Demanda alquiler anual vivienda", capa1: ["zona_barrio", "presupuesto_uyu", "dormitorios", "garantia_aseguradora"], capa2: ["mascotas", "menores", "fecha_ingreso"], cruce: "Oferta O6." },
  D3: { codigo: "D3", operacion: "Alquiler temporal", nombre: "Demanda estadia o temporada", capa1: ["zona_barrio", "fechas", "huespedes", "presupuesto"], capa2: ["mascotas", "distancia_playa"], cruce: "Derivacion o filtro estancia." },
  D4: { codigo: "D4", operacion: "Compra lote", nombre: "Demanda terreno o casa con terreno", capa1: ["zona_barrio", "presupuesto_usd", "superficie_minima"], capa2: ["uso_previsto", "permisos"], cruce: "Oferta O3/O5." },
  D5: { codigo: "D5", operacion: "Comercial", nombre: "Demanda local o deposito", capa1: ["zona_barrio", "operacion", "superficie_m2", "rubro"], capa2: ["presupuesto", "acceso_carga"], cruce: "Oferta O4." },
  D6: { codigo: "D6", operacion: "Inversion renta", nombre: "Inversor buscando renta anual", capa1: ["zona_barrio", "capital_usd", "renta_objetivo"], capa2: ["plazo_horizonte", "moneda"], cruce: "Oferta O2/O7." },
  D7: { codigo: "D7", operacion: "Pozo / Proyecto", nombre: "Inversor pozo u obra en curso", capa1: ["zona_barrio", "capital_usd", "entrega_esperada"], capa2: ["contado_o_cuotas", "exoneracion_impositiva"], cruce: "Oferta O5/O7." },
};

const BRACKET_META = {
  zona_barrio: {
    label: "Zona o barrio",
    pregunta: "la zona exacta de referencia para el aviso (barrio o balneario, reservando la calle)",
  },
  precio_usd: {
    label: "Precio en USD",
    pregunta: "el valor de publicacion en USD",
  },
  precio_uyu: {
    label: "Alquiler mensual en $U",
    pregunta: "el alquiler mensual pretendido en pesos uruguayos",
  },
  precio_publicado: {
    label: "Precio de publicacion",
    pregunta: "el valor pretendido de publicacion",
  },
  precio_desde_usd: {
    label: "Precio base en USD",
    pregunta: "el valor desde en USD de la lista vigente",
  },
  dormitorios: {
    label: "Dormitorios y banos",
    pregunta: "cantidad de dormitorios y banos",
  },
  superficie_m2: {
    label: "Metros totales y edificados",
    pregunta: "los metros totales del lote y los metros edificados",
  },
  frente_metros: {
    label: "Medidas frente y fondo",
    pregunta: "las medidas aproximadas de frente y fondo",
  },
  services_check: {
    label: "Servicios en puerta",
    pregunta: "si ya cuenta con UTE, OSE y saneamiento en la puerta",
  },
  servicios_zona: {
    label: "Servicios en la puerta",
    pregunta: "que servicios pasan por la puerta (UTE, OSE, saneamiento o fibra)",
  },
  garantias_aceptadas: {
    label: "Garantias aceptadas",
    pregunta: "que garantias aceptan (trabajamos con aseguradoras Porto, Sura, Mapfre o Santander)",
  },
  gastos_comunes: {
    label: "Gastos comunes",
    pregunta: "si tiene gastos comunes y de cuanto son",
  },
  acepta_mascotas: {
    label: "Mascotas",
    pregunta: "si admite mascotas",
  },
  acepta_menores: {
    label: "Integrantes / ninos",
    pregunta: "si es apto para ninos o cuantas personas maximo",
  },
  amoblado: {
    label: "Mobiliario",
    pregunta: "si se entrega amoblado o vacio",
  },
  plazo_contrato: {
    label: "Plazo contractual",
    pregunta: "plazo minimo de contrato (1 o 2 anos)",
  },
  titulos_regla: {
    label: "Documentacion en regla",
    pregunta: "si la documentacion y planos estan al dia para escriturar",
  },
  avance_obra: {
    label: "Avance de obra y estructura",
    pregunta: "que porcentaje de obra y estructura ya esta ejecutado",
  },
  planos_permisos: {
    label: "Planos y permisos",
    pregunta: "si cuenta con planos aprobados y calculo estructural",
  },
  renta_mensual: {
    label: "Renta actual",
    pregunta: "cual es la renta mensual vigente y en que moneda",
  },
  vencimiento_contrato: {
    label: "Vencimiento de contrato",
    pregunta: "cuando vence el contrato de alquiler vigente",
  },
  garantia_vigente: {
    label: "Garantia del inquilino",
    pregunta: "que garantia respalda al inquilino actual",
  },
  rubros_habilitados: {
    label: "Rubros y destino",
    pregunta: "que rubros comerciales estan habilitados",
  },
  frente_vidriera: {
    label: "Frente o vidriera",
    pregunta: "cuantos metros de frente o vidriera a la calle tiene",
  },
  tipologias_disponibles: {
    label: "Tipologias vigentes",
    pregunta: "que tipologias quedan disponibles hoy",
  },
  fecha_entrega: {
    label: "Fecha estimada de entrega",
    pregunta: "fecha estimada de entrega de obra",
  },
  gastos_ocupacion: {
    label: "Gastos de ocupacion",
    pregunta: "porcentaje de gastos de ocupacion y alhajamiento",
  },
  ocupacion_entrega: {
    label: "Disponibilidad de entrega",
    pregunta: "si esta pronta para entregar o habitada",
  },
  disponibilidad_visitas: {
    label: "Dias y horarios de visita",
    pregunta: "que dias y horarios te quedan comodos para coordinar visitas con interesados filtrados",
  },
  fotos_video: {
    label: "Material visual",
    pregunta: "si ya contas con fotos claras o video recorrido para armar la ficha",
  },
};

// Claves y patrones estrictamente restringidos a Boveda Privada (Candado anti-puenteo)
export const BOVEDA_FORBIDDEN_KEYS = new Set([
  "padron",
  "padrón",
  "manzana",
  "carpeta",
  "calle",
  "calle_exacta",
  "puerta",
  "numero_puerta",
  "altura",
  "direccion_exacta",
  "maps_url",
  "google_maps",
  "google_maps_url",
  "coordenadas",
  "lat",
  "lng",
  "telefono",
  "telefono_wa",
  "whatsapp_dueno",
  "celular_dueno",
  "email_dueno",
  "nombre_completo_dueno",
  "documento",
  "ci",
  "rut",
  "honorarios",
  "comision",
  "comision_privada",
  "comision_interna",
  "acuerdo_honorarios",
  "boveda",
  "boveda_privada",
  "pdf_privado",
  "archivo_boveda",
  "internalNotes",
  "internal_notes",
  "supplierName",
]);

function scrubSensitiveString(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/\bPadr[oó]n\s*(?:N[°º]?\s*)?\d+[A-Za-z0-9/-]*/gi, "[Padrón reservado en bóveda]")
    .replace(/\bManzana\s*(?:N[°º]?\s*)?\d+[A-Za-z0-9/-]*/gi, "[Manzana reservada]")
    .replace(/\bCarpeta\s*(?:N[°º]?\s*)?\d+[A-Za-z0-9/-]*/gi, "[Carpeta privada]")
    .replace(/\bCalle\s+[A-ZÁÉÍÓÚÑ][^\n,;]{2,42}/gi, "zona de referencia reservada")
    .replace(/https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps|www\.google\.com\/maps|maps\.google\.com)[^\s"'<>]*/gi, "[Ubicación exacta reservada hasta visita]")
    .replace(/(?:\+?598\s*9?\d[\d\s-]{6,10}|09\d[\d\s-]{6,8})/g, "[Contacto privado Zaguán]")
    .replace(/comisi[oó]n\s*(?:pactada|interna|acordada)?\s*[:=]?\s*\d+(?:[.,]\d+)?\s*%/gi, "")
    .replace(/\bhonorarios\s*[:=]?\s*\d+(?:[.,]\d+)?\s*%?/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function filtrarPayloadPublicoSinBoveda(input, depth = 0) {
  if (depth > 8 || input == null) return input;
  if (typeof input === "string") return scrubSensitiveString(input);
  if (Array.isArray(input)) {
    return input.map((item) => filtrarPayloadPublicoSinBoveda(item, depth + 1));
  }
  if (typeof input === "object") {
    const out = {};
    for (const [k, v] of Object.entries(input)) {
      const kLower = String(k || "").toLowerCase().trim();
      if (
        BOVEDA_FORBIDDEN_KEYS.has(k) ||
        BOVEDA_FORBIDDEN_KEYS.has(kLower) ||
        /^(padron|padrón|manzana|carpeta|calle|direccion_exacta|maps|telefono|celular|whatsapp_dueno|honorarios|comision|boveda)/i.test(kLower)
      ) {
        continue;
      }
      out[k] = filtrarPayloadPublicoSinBoveda(v, depth + 1);
    }
    return out;
  }
  return input;
}

export function detectarVerticalPropietario(row = {}, extraTexto = "") {
  const combined = `${row.vertical_14 || ""} ${row.tipo_operacion || ""} ${row.tipo_contacto || ""} ${row.categoria || ""} ${row.titulo_o_activo || ""} ${row.publicacion_titulo || ""} ${row.precio_publicado || ""} ${row.precio_texto || ""} ${row.notas || ""} ${row.notas_internas || ""} ${extraTexto || ""}`.toLowerCase();
  const explicitMatch = String(row.vertical_14 || "").match(/\b([OD][1-7])\b/i);
  if (explicitMatch) {
    const code = explicitMatch[1].toUpperCase();
    if (MATRIZ_14V[code]) return code;
  }
  if (/desarrolladora|pozo|preventa|torre|edificio\s+a\s+estrenar|betania|obra\s+nueva|gastos\s+de\s+ocupaci[oó]n/i.test(combined)) return "O7";
  if (/obra\s+iniciada|en\s+construcci[oó]n|estructura\s+levantada|hormig[oó]n|santa\s+m[oó]nica|decreto\s+dic|proyecto\s+avanzado/i.test(combined)) return "O5";
  if (/alquiler\s+anual|alquilo|la\s+fortuna|garant[ií]a\s+aseguradora|gastos\s+comunes|\$u\s*\d+/i.test(combined) && !/venta|usd\s*[4-9]\d{4}|usd\s*\d{6}/i.test(combined)) return "O6";
  if (/local\s+comercial|dep[oó]sito|galp[oó]n|oficina|rubro\s+comercial|sal[oó]n\s+comercial/i.test(combined)) return "O4";
  if (/terreno|lote\s+propio|fracci[oó]n|solar\s+bald[ií]o|frente\s+y\s+fondo/i.test(combined) && !/dormitorio|casa\s+de|apto\s+de/i.test(combined)) return "O3";
  if (/con\s+renta|alquilada\s+actualmente|inquilino\s+vigente|contrato\s+vigente/i.test(combined)) return "O2";
  if (/alquiler/i.test(combined) && !/venta|usd/i.test(combined)) return "O6";
  return "O1";
}

function primerNombrePersona(nombre) {
  const clean = String(nombre || "").replace(/\(.*?\)/g, "").trim();
  const tok = clean.split(/\s+/)[0] || "";
  if (!tok || /^(contacto|equipo|propietario|dueno|dueño|ficha|inmobiliaria)/i.test(tok)) return "";
  return tok;
}

function extractFactValue(corpus, regex, formatter) {
  const m = corpus.match(regex);
  if (!m) return "";
  return formatter ? formatter(m) : m[0].trim();
}

export function extraerCorchetesDesdeTexto(propietario = {}, extraTexto = "", vertical = "O1") {
  let prevSaved = {};
  try {
    if (propietario.corchetes_json) {
      prevSaved = typeof propietario.corchetes_json === "string"
        ? JSON.parse(propietario.corchetes_json)
        : (propietario.corchetes_json || {});
    }
  } catch {
    prevSaved = {};
  }

  const tituloIn = propietario.titulo_o_activo || propietario.publicacion_titulo;
  const zonaIn = propietario.zona_barrio || propietario.empresa_o_zona;
  const precioIn = propietario.precio_publicado || propietario.precio_texto;
  const rawCorpus = [
    tituloIn,
    zonaIn,
    precioIn,
    propietario.tipo_operacion,
    propietario.notas,
    propietario.notas_internas,
    propietario.respuesta_recibida,
    propietario.mensaje_mar,
    propietario.dormitorios !== null && propietario.dormitorios !== undefined ? `${propietario.dormitorios} dormitorios` : "",
    propietario.garantias_aceptadas,
    propietario.gastos_comunes_incluidos ? "gastos comunes incluidos" : "",
    propietario.acepta_mascota,
    extraTexto,
  ]
    .filter(Boolean)
    .join(" · ");

  const c = { ...(prevSaved.confirmados || prevSaved || {}) };
  if (zonaIn) {
    c.zona_barrio = c.zona_barrio || zonaIn;
  }

  // Precio USD / UYU
  const usdVal = extractFactValue(rawCorpus, /(?:usd|u\$s|us\$)\s*([\d.,]{4,12})/i, (m) => `USD ${m[1]}`);
  const uyuVal = extractFactValue(rawCorpus, /(?:\$u|\$|\buyu)\s*([\d.,]{4,10})/i, (m) => `$U ${m[1]}`);
  if (usdVal) {
    c.precio_usd = usdVal;
    c.precio_desde_usd = c.precio_desde_usd || usdVal;
    c.precio_publicado = c.precio_publicado || usdVal;
  }
  if (uyuVal && !usdVal) {
    c.precio_uyu = uyuVal;
    c.precio_publicado = c.precio_publicado || uyuVal;
  }
  if (precioIn && !c.precio_publicado) {
    c.precio_publicado = precioIn;
    if (/usd|u\$s/i.test(precioIn)) c.precio_usd = c.precio_usd || precioIn;
    else if (/\$|uyu/i.test(precioIn)) c.precio_uyu = c.precio_uyu || precioIn;
  }

  // Dormitorios / Banos
  const dorms = extractFactValue(rawCorpus, /\b(\d+|monoambiente)\s*(?:dorm(?:itorio)?s?|ambientes?|hab(?:itaciones)?)\b/i);
  if (dorms) c.dormitorios = dorms;

  // Superficie m2
  const m2 = extractFactValue(rawCorpus, /\b(\d{2,5})\s*(?:m2|m²|mts2|metros(?:\s+cuadrados)?)\b/i, (m) => `${m[1]} m2`);
  if (m2) c.superficie_m2 = m2;

  // Medidas lote
  const frente = extractFactValue(rawCorpus, /\b(\d+(?:[.,]\d+)?\s*(?:x|\*)\s*\d+(?:[.,]\d+)?|frente\s*(?:de)?\s*\d+\s*m)/i);
  if (frente) c.frente_metros = frente;

  // Servicios lote
  if (/\b(ute|ose|saneamiento|agua|luz|fibra|servicios\s+en\s+puerta|todos\s+los\s+servicios)\b/i.test(rawCorpus)) {
    c.servicios_zona = extractFactValue(rawCorpus, /(?:con|servicios[^.,;]*|ute[^.,;]*|ose[^.,;]*)/i) || "Servicios confirmados por propietario";
  }

  // Garantias
  if (/\b(porto|sura|mapfre|santander|aseguradora|bhu|anda|cgn|garant[ií]a\s+(?:de\s+)?alquiler|solo\s+aseguradora)\b/i.test(rawCorpus)) {
    const gs = [];
    if (/porto/i.test(rawCorpus)) gs.push("Porto");
    if (/sura/i.test(rawCorpus)) gs.push("Sura");
    if (/mapfre/i.test(rawCorpus)) gs.push("Mapfre");
    if (/santander/i.test(rawCorpus)) gs.push("Santander");
    if (/aseguradora/i.test(rawCorpus) && gs.length === 0) gs.push("Aseguradora aprobada");
    if (/anda/i.test(rawCorpus)) gs.push("ANDA");
    if (/cgn/i.test(rawCorpus)) gs.push("CGN");
    c.garantias_aceptadas = gs.join(", ") || "Aseguradora";
  }

  // Gastos comunes
  const gc = extractFactValue(rawCorpus, /(?:gastos\s+comunes|gc)\s*(?:incluidos|inc\.?|de)?\s*(?:\$u?|\$)?\s*[\d.,]*/i);
  if (gc) c.gastos_comunes = gc;
  else if (/sin\s+gastos\s+comunes|exento\s+de\s+gc/i.test(rawCorpus)) c.gastos_comunes = "Gastos comunes cero / propios";

  // Mascotas / Menores / Amoblado / Plazo
  if (/pet[-\s]?friendly|acepta\s+mascotas|con\s+mascota|admite\s+mascotas/i.test(rawCorpus)) c.acepta_mascotas = "Admite mascotas";
  else if (/mascotas?\s+(?:a\s+consultar|chicas?|peque[nñ]as?|en\s+evaluaci[oó]n)/i.test(rawCorpus)) c.acepta_mascotas = "Mascota pequena a evaluar";
  if (/ni[nñ]os|menores|familia|apto\s+familia/i.test(rawCorpus)) c.acepta_menores = "Apto familia y ninos";
  if (/amoblado|equipado|con\s+muebles|full\s+muebles/i.test(rawCorpus)) c.amoblado = "Amoblado completo";
  else if (/sin\s+muebles|vacio|desocupado/i.test(rawCorpus)) c.amoblado = "Sin muebles";
  const plazo = extractFactValue(rawCorpus, /\b(1\s*a[nñ]o|2\s*a[nñ]os|anual|plazo\s+\d+\s*(?:meses|a[nñ]os))\b/i);
  if (plazo) c.plazo_contrato = plazo;

  // Documentacion / titulos / obra
  if (/t[ií]tulos\s+al\s+d[ií]a|listo\s+para\s+escriturar|escritura|con\s+planos|aprobado|al\s+d[ií]a|bps|bps\s+al\s+d[ií]a/i.test(rawCorpus)) {
    c.titulos_regla = "Documentacion al dia reportada";
  }
  if (/(\d+%|estructura|platea|losa|hormig[oó]n|avance|terminado|a\s+estrenar)/i.test(rawCorpus)) {
    c.avance_obra = extractFactValue(rawCorpus, /(?:estructura|platea|losa|hormig[oó]n|\d+%\s*(?:de\s+obra|avanzado)|en\s+construcci[oó]n|a\s+estrenar)/i) || "Avance declarado";
  }
  if (/planos|calculo\s+estructural|c[aá]lculo|permiso\s+de\s+construcci[oó]n/i.test(rawCorpus)) {
    c.planos_permisos = "Planos y permisos declarados";
  }

  // Renta / comercial / obra nueva
  if (/\brenta\s+(?:de\s+)?(?:usd|\$u?)\s*[\d.,]+/i.test(rawCorpus)) {
    c.renta_mensual = extractFactValue(rawCorpus, /\brenta\s+(?:de\s+)?(?:usd|\$u?)\s*[\d.,]+/i);
  }
  if (/tipolog[ií]a|unidades|monoambiente|1\s+y\s+2\s+dorm/i.test(rawCorpus)) {
    c.tipologias_disponibles = extractFactValue(rawCorpus, /(?:tipolog[ií]as?[^.,;]+|\d+\s*(?:a|y)\s*\d+\s*dormitorios?|unidades\s+disponibles[^.,;]+)/i) || "Tipologias vigentes";
  }
  if (/entrega\s+(?:inmediata|202\d|en\s+\d+\s+meses|diciembre|marzo)/i.test(rawCorpus)) {
    c.fecha_entrega = extractFactValue(rawCorpus, /entrega\s+[^.,;]{3,35}/i);
  }
  if (/ocupaci[oó]n|alhajamiento/i.test(rawCorpus)) {
    c.gastos_ocupacion = extractFactValue(rawCorpus, /(?:gastos\s+de\s+ocupaci[oó]n|alhajamiento)[^.,;]{0,30}/i) || "Gastos de ocupacion informados";
  }

  // Visitas y material visual
  if (/visita|coordinar|lunes|martes|miercoles|miércoles|jueves|viernes|sabado|sábado|tarde|ma[nñ]ana\s+de|horario/i.test(rawCorpus)) {
    c.disponibilidad_visitas = extractFactValue(rawCorpus, /(?:visitas?[^.,;]{3,50}|coordinar[^.,;]{3,40}|horarios?[^.,;]{3,40})/i) || "Horarios de visita informados";
  }
  if (/foto|fotos|video|carpeta\s+visual|envio\s+material/i.test(rawCorpus)) {
    c.fotos_video = "Material fotografico o video disponible";
  }

  // Compatibilidad por operacion
  if (vertical === "O6" && !c.precio_uyu && c.precio_usd) c.precio_uyu = c.precio_usd;
  if (vertical !== "O6" && !c.precio_usd && c.precio_publicado) c.precio_usd = c.precio_publicado;

  return c;
}

function textoLimpioPokaYoke(texto) {
  let t = String(texto || "").trim();
  t = t
    .replace(/\bsin exclusividad\b/gi, "con publicación abierta")
    .replace(/\bexclusividad\b/gi, "publicación abierta")
    .replace(
      /\b(unicamente|únicamente|exclusivamente|solamente|directamente|actualmente|rapidamente|rápidamente|exactamente|realmente|totalmente|previamente|inmediatamente|frecuentemente|eventualmente|normalmente|generalmente|seguramente)\b/gi,
      (m) => {
        const rep = {
          directamente: "en directo",
          unicamente: "solo",
          únicamente: "solo",
          solamente: "solo",
          exclusivamente: "de forma directa",
          actualmente: "hoy",
          rapidamente: "al instante",
          rápidamente: "al instante",
          exactamente: "en detalle",
          realmente: "de verdad",
          totalmente: "al 100%",
          previamente: "antes",
          inmediatamente: "al instante",
          frecuentemente: "seguido",
          eventualmente: "según demanda",
          normalmente: "por lo general",
          generalmente: "por lo general",
          seguramente: "de seguro",
        };
        return rep[m.toLowerCase()] || "hoy";
      }
    )
    .replace(/\bno\s+te\s+preocupes\b/gi, "quedate tranquilo")
    .replace(/\bno\s+dudes\b/gi, "escribime")
    .replace(/\bno\s+trabajamos\s+con\b/gi, "priorizamos")
    .replace(/\bsin\s+costo\b/gi, "bonificado")
    .replace(/\bsin\s+compromiso\b/gi, "en forma abierta")
    .replace(/\bsin\s+intermediarios\b/gi, "con trato directo")
    .replace(/\bsin\s+datos\s+de\s+b[oó]veda\b/gi, "con privacidad resguardada");
  return t.replace(/[ \t]{2,}/g, " ").trim();
}

export function evaluarCorchetesPropietario(propietario = {}, extraTexto = "") {
  const vertical = detectarVerticalPropietario(propietario, extraTexto);
  const spec = MATRIZ_14V[vertical] || MATRIZ_14V.O1;
  const confirmados = extraerCorchetesDesdeTexto(propietario, extraTexto, vertical);

  // En prospeccion/captacion inicial pedimos Capa 1 completa para poder armar el Resumen Pre-Ficha sin trancar.
  const requeridos = spec.capa1;
  const faltantes = [];
  for (const key of requeridos) {
    if (!confirmados[key] || String(confirmados[key]).trim() === "") {
      const meta = BRACKET_META[key] || { label: key, pregunta: key.replace(/_/g, " ") };
      faltantes.push({ key, label: meta.label, pregunta: meta.pregunta });
    }
  }

  const faltantesCapa2 = [];
  for (const key of spec.capa2) {
    if (!confirmados[key] || String(confirmados[key]).trim() === "") {
      const meta = BRACKET_META[key] || { label: key, pregunta: key.replace(/_/g, " ") };
      faltantesCapa2.push({ key, label: meta.label, pregunta: meta.pregunta });
    }
  }

  const totalReq = requeridos.length || 1;
  const cubiertos = totalReq - faltantes.length;
  const porcentaje = Math.round((cubiertos / totalReq) * 100);

  const nombre = primerNombrePersona(propietario.nombre_persona || propietario.nombre);
  const saludo = nombre ? `Hola ${nombre}` : "Hola";
  const zonaPublica = filtrarPayloadPublicoSinBoveda(confirmados.zona_barrio || propietario.empresa_o_zona || "Maldonado");
  const tituloPublico = filtrarPayloadPublicoSinBoveda(propietario.titulo_o_activo || propietario.publicacion_titulo || `${spec.operacion} en ${zonaPublica}`);

  let siguientePreguntaWa = "";
  if (faltantes.length > 0) {
    const pedirLista = faltantes.slice(0, 3).map((f) => f.pregunta);
    siguientePreguntaWa = textoLimpioPokaYoke(
      `${saludo}, gracias por confirmar sobre ${tituloPublico} en ${zonaPublica}. ` +
      `Para completar la ficha pública y avanzar con interesados reales filtrados, pasame por favor ${pedirLista.join(" + ")}.\n\n` +
      `_Trabajamos con publicación abierta de propietario y coordinamos visitas solo con interesados calificados._`
    );
  }

  let resumenPreFicha = "";
  if (faltantes.length === 0) {
    const lineasDatos = [];
    for (const key of [...spec.capa1, ...spec.capa2]) {
      if (confirmados[key]) {
        const meta = BRACKET_META[key] || { label: key };
        lineasDatos.push(`• ${meta.label}: ${filtrarPayloadPublicoSinBoveda(String(confirmados[key]))}`);
      }
    }
    const extraOpcionales = faltantesCapa2.length > 0
      ? `\n\nSi querés sumar algún detalle extra antes de salir (por ejemplo ${faltantesCapa2.slice(0, 2).map((x) => x.label.toLowerCase()).join(" o ")}), decime y lo agregamos.`
      : "";

    resumenPreFicha = textoLimpioPokaYoke(
      `${saludo}, armé este borrador público de tu ficha para publicar en ZAGUÁN Propiedades:\n\n` +
      `Operación: ${spec.operacion} · Zona de referencia: ${zonaPublica}\n` +
      `${lineasDatos.join("\n")}\n\n` +
      `La calle exacta, el padrón y tus datos quedan resguardados en privado hasta agendar visita filtrada.` +
      `${extraOpcionales}\n\n` +
      `Respondeme con un "Sí" o "Confirmo" así la dejamos publicada hoy mismo.`
    );
  }

  return {
    vertical_14: vertical,
    operacion: spec.operacion,
    confirmados: filtrarPayloadPublicoSinBoveda(confirmados),
    faltantes,
    faltantes_capa2: faltantesCapa2,
    corchetes_faltantes: faltantes.length,
    porcentaje_completo: porcentaje,
    siguiente_pregunta_wa: siguientePreguntaWa,
    resumen_pre_ficha: resumenPreFicha,
    listo_para_pre_ficha: faltantes.length === 0,
  };
}

export function construirPayloadBorradorAprobalo(propietario = {}, evalResult = {}) {
  const safeProp = filtrarPayloadPublicoSinBoveda(propietario);
  const safeEval = filtrarPayloadPublicoSinBoveda(evalResult);
  const zona = safeEval?.confirmados?.zona_barrio || safeProp.zona_barrio || safeProp.empresa_o_zona || "Maldonado";
  const precio = safeEval?.confirmados?.precio_usd || safeEval?.confirmados?.precio_uyu || safeEval?.confirmados?.precio_publicado || safeProp.precio_publicado || safeProp.precio_texto || "Valor a consultar";
  const op = safeEval?.operacion || "Propiedad destacada";
  const titulo = safeProp.titulo_o_activo || safeProp.publicacion_titulo || `${op} en ${zona}`;

  const bullets = Object.entries(safeEval?.confirmados || {})
    .filter(([k]) => !/^(fotos_video|disponibilidad_visitas)$/.test(k))
    .slice(0, 5)
    .map(([k, v]) => `• ${(BRACKET_META[k]?.label || k)}: ${v}`)
    .join("\n");

  const copyIG = textoLimpioPokaYoke(
    `${op} en ${zona} · ${precio}\n\n` +
    `${titulo}\n\n` +
    `${bullets}\n\n` +
    `Escribinos por mensaje directo o toca el enlace en nuestra bio para coordinar visita calificada.\n\n` +
    `#ZaguanPropiedades #Maldonado #PuntaDelEste #BienesRaicesUruguay`
  );

  const copyFB = textoLimpioPokaYoke(
    `${op} en ${zona} · ${precio}\n\n` +
    `${titulo}\n\n` +
    `${bullets}\n\n` +
    `Consultanos por WhatsApp para recibir ficha completa y agendar visita con respaldo profesional.`
  );

  return {
    cuenta: "Zaguán",
    cuenta_id: ZAGUAN_CUENTA_ID,
    origen: "fuga5_confirmacion_dueno",
    piezas: [
      {
        titulo: `${op} · ${zona} · ${precio}`,
        vertical: safeEval?.vertical_14 || "O1",
        formato: "Carrusel 4:5",
        plataforma_objetivo: "instagram_facebook",
        estado: "borrador",
        copy_instagram: copyIG,
        copy_facebook: copyFB,
        notas_internas: `Generado tras confirmación del propietario (${safeProp.id || "prop"}) con privacidad de bóveda resguardada.`,
      },
    ],
  };
}

export default {
  ZAGUAN_CUENTA_ID,
  MATRIZ_14V,
  BOVEDA_FORBIDDEN_KEYS,
  filtrarPayloadPublicoSinBoveda,
  detectarVerticalPropietario,
  extraerCorchetesDesdeTexto,
  evaluarCorchetesPropietario,
  construirPayloadBorradorAprobalo,
};
