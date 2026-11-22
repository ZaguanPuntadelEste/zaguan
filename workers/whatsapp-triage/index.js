/**
 * Cloudflare Worker: WhatsApp Triage 14 Verticales · ZAGUÁN Propiedades
 * Motor determinista Multi-Turno (O1..O7 / D1..D7), objeciones reales, Meta Ads + Google Search,
 * cruces latentes (ej. D7 -> O5 Santa Mónica) y Poka-Yoke físico de Mar (0 fugas de Cocina/Bóveda).
 */

const LINKS_URL = "https://zaguanpropiedades.com/links/";
const LA_FORTUNA_URL = "https://zaguanpropiedades.com/alquileres/la-fortuna-agata/";
const SANTA_MONICA_URL = "https://zaguanpropiedades.com/propiedades/santa-monica-casa-hormigon/";
const ALQUILERES_URL = "https://zaguanpropiedades.com/alquileres/";
const PROYECTOS_URL = "https://zaguanpropiedades.com/proyectos/";

export const ARBOL_ESTRATEGICO_SEMAFORO = {
  FAMILIA_A_ALQUILER_ANUAL: {
    codigo: "D2",
    tipo_ficha: "TIPO_2_FRANJA_GRIS_DOBLE_FICHA",
    ejemplo: "La Fortuna · Av. Ágata ($U 30.000/mes)",
    reglas_freno: [
      "1 solo link oficial de la ficha (prohibido enviar 2 links ni pin GPS de Google Maps).",
      "Prohibido decir 'coordinar la visita con el dueño' (coordina Zaguán).",
      "Cero choclo repitiendo todo el texto abajo del link.",
      "T0 hace 1 sola pregunta filtro (aseguradora o día). Cantidad de personas y datos van en Turno 2."
    ],
    tiempos: {
      T0_INMEDIATO: `Con esa aseguradora calificás para La Fortuna ($U 30.000/mes con gastos comunes, Wi-Fi, cochera y mascota pequeña).\nAcá ves fotos y ficha: ${LA_FORTUNA_URL}\nQué día y horario te sirve visitar esta semana?`,
      T1_AMARILLO_20_MIN: "Si todavía estás tramitando la aseguradora o necesitás ver qué documentación pide Porto, Sura, Mapfre o Santander, avisame y te paso el requisito en 2 líneas.",
      T2_NARANJA_24_HS: "Hola, buenas tardes. Te consulto corto por el apartamento de 2 dormitorios a estrenar en La Fortuna ($U 30.000 con gastos comunes, Wi-Fi y cochera incluidos, listo para mudarse ya): estamos armando los horarios de visita para este martes; contás con garantía aseguradora (Porto, Sura, Mapfre o Santander), o buscás con otra garantía / en otra zona?",
      TURNO_2_CALIFICADO: "Impecable. Para cuántas personas sería el alquiler y qué día y franja horaria te queda cómodo para ir a verlo?",
    },
  },
  FAMILIA_B_COMPRA_LOTE_PROYECTO: {
    codigo: "D3..D7 / O5",
    tipo_ficha: "TIPO_2_FRANJA_GRIS_DOBLE_FICHA_CON_BOVEDA_PRIVADA",
    ejemplo: "Santa Mónica · Proyecto en construcción (USD 160.000)",
    reglas_freno: [
      "Ticket USD 160.000 en botones del anuncio; 0 promesa de ubicación exacta y 0 Padrón público en T0.",
      "Usar el video completo (2m31s) y la cédula catastral como anzuelo tras filtrar intención y fondos en USD.",
      "En T2 activar el cruce latente D7 <-> O4/O1 (terreno libre vs. obra base ahorrando 12 meses de construcción)."
    ],
    tiempos: {
      T0_INMEDIATO: `Te comparto la ficha pública de Santa Mónica (lote propio 348 m², 201 m² en hormigón armado frente a la Laguna, USD 160.000): ${SANTA_MONICA_URL}\nPara pasarte el video completo de 2m31s y la cédula catastral: lo evaluás para vivienda propia o para inversión?`,
      T1_AMARILLO_30_MIN: "Viste el adelanto en la ficha de Santa Mónica? Si contás con fondos en USD para evaluar compra directa, avisame y te paso el video de 2m31s y el croquis por acá.",
      T2_NARANJA_24_HS: "Te consulto corto: te interesa que te envíe el video completo y el croquis de Santa Mónica (USD 160.000), o estás buscando terreno libre / casa terminada?",
      TURNO_2_CALIFICADO: "La propiedad suma lote propio de 348 m² en régimen común, 201 m² edificados en hormigón armado y Cédula Catastral con DJCU vigente (23/01/2025, válida 5 años) lista para regularizar hasta diciembre de 2027. Te enviamos el video completo y croquis; qué día te sirve coordinar visita?",
    },
  },
  FAMILIA_C_POZO_DESARROLLADORA: {
    codigo: "D1 / O7",
    tipo_ficha: "TIPO_1_ABIERTA_FICHA_UNICA",
    ejemplo: "Betania IV / Nostrum Roosevelt / More Atlántico / Golden Rise / EVE Tower",
    reglas_freno: [
      "Ficha única abierta salvo Golden Rise (valores USD solo en privado 1 a 1; nunca en anuncio público).",
      "1 link a /proyectos/ + pregunta de tipología y cuotas en obra; pedir Nombre y Apellido en visitas por protección 60 días."
    ],
    tiempos: {
      T0_INMEDIATO: `Podés ver los 5 desarrollos en pozo activos hoy (desde USD 79.800 en Maldonado y Punta del Este) en ${PROYECTOS_URL}\nQué tipología buscás (1, 2 o 3 dormitorios) y necesitás financiar en cuotas durante la obra?`,
      T1_AMARILLO_30_MIN: "Querés que te arme la comparativa directa de 2 unidades en obra con gastos de ocupación incluidos según tu tope de anticipo?",
      T2_NARANJA_24_HS: "Seguimos con listas vigentes en Punta del Este y Maldonado desde USD 79.800. Si me pasás tu rango de anticipo, te mando las 2 opciones con mejor retorno neto.",
      TURNO_2_CALIFICADO: "Excelente. Comprás como residente o desde el exterior (para pasarte los costos totales de cierre y dejar hecho el pre-registro formal con tu nombre)? Qué día te queda cómodo para verlo?",
    },
  },
  FAMILIA_D_DUENO_DIRECTO_CAPTACION: {
    codigo: "O1..O6",
    tipo_ficha: "CAPTACION_FRANJA_GRIS_SIN_EXCLUSIVIDAD",
    ejemplo: "Propietarios de Marketplace, Gallito e InfoCasas",
    reglas_freno: [
      "Prohibido mencionar %, honorarios o comisión en el 1° contacto en frío.",
      "Prohibido enviar URL de ficha pública individual al dueño ni antes ni después.",
      "Garantías aseguradoras solo si es alquiler (O6), nunca en ventas (O1..O5)."
    ],
    tiempos: {
      T0_INMEDIATO: "Hola, cómo estás? Te escribe Mar, de ZAGUÁN Propiedades. Trabajamos en Punta del Este y Maldonado con publicación abierta sin exclusividad y filtro previo de interesados antes de cada visita. Tu propiedad sigue disponible para confirmarnos barrio y valor pretendido?",
      T1_AMARILLO_2_HS: "Si te queda más cómodo, podés mandarme un audio corto contándome metros, estado y condiciones principales de tu propiedad para cruzarlo con búsquedas activas hoy.",
      T2_NARANJA_24_HS: "Seguimos recibiendo consultas en la zona. Cuando puedas pasame esos datos mínimos y la sumamos a nuestra carpeta abierta sin exclusividad.",
      TURNO_2_CALIFICADO: "Recibido. Para armar nuestra carpeta interna (cuidando los datos sensibles antes de publicar), podés enviarnos por acá el PDF catastral / DJCU si lo tenés a mano, video de recorrido y confirmarnos qué horarios sirven para visitas?",
    },
  },
};

export const BANCO_RESPUESTAS_ESTANDAR = [
  { id: "LF-B1", area: "La Fortuna · Meta Ads", titulo: "Botón 1 · Ya tiene póliza aseguradora", contexto: "la_fortuna", ejemploInput: "Tengo Porto, Sura, Mapfre o Santander: quiero ver ficha y visitar" },
  { id: "LF-B2", area: "La Fortuna · Meta Ads", titulo: "Botón 2 · Ingresos para tramitar aseguradora", contexto: "la_fortuna", ejemploInput: "Tengo ingresos para tramitar aseguradora y quiero ver la ficha" },
  { id: "LF-B3", area: "La Fortuna · Meta Ads", titulo: "Botón 3 · ANDA/CGN u otra zona", contexto: "la_fortuna", ejemploInput: "Busco con ANDA/CGN, en otra zona o tengo propiedad para publicar" },
  { id: "LF-CITA", area: "La Fortuna · Turno 2", titulo: "Propone día y hora de visita", contexto: "la_fortuna", ejemploInput: "Puedo ir el martes a las 16 hs" },
  { id: "LF-GC", area: "La Fortuna · Objeción", titulo: "Cuánto son los gastos comunes / qué incluye", contexto: "la_fortuna", ejemploInput: "Cuánto son los gastos comunes aparte del alquiler?" },
  { id: "LF-MASC", area: "La Fortuna · Objeción", titulo: "Mascota mediana o grande", contexto: "la_fortuna", ejemploInput: "Tengo un perro mediano, aceptan mascotas?" },
  { id: "LF-DIR", area: "La Fortuna · Objeción", titulo: "Pide dirección exacta y número de puerta", contexto: "la_fortuna", ejemploInput: "Me pasás la dirección exacta y el número de puerta para pasar a verlo?" },
  { id: "LF-REQ", area: "La Fortuna · Objeción", titulo: "Requisitos y costos de ingreso (+ IVA)", contexto: "la_fortuna", ejemploInput: "Cuánto piden de depósito o comisión para entrar y qué requisitos piden?" },
  { id: "LF-PAR", area: "La Fortuna · Turno 2", titulo: "Suma ingresos de pareja para aseguradora", contexto: "la_fortuna", ejemploInput: "Con mi pareja sumamos $U 95.000 en recibos, llegamos para Porto o Sura?" },
  { id: "LF-TEMP", area: "Alquiler · Borde", titulo: "Pregunta por verano / quincena", contexto: "general", ejemploInput: "Lo alquilan solo por enero o quincena de verano?" },
  { id: "SM-B1", area: "Santa Mónica · Meta Ads", titulo: "Botón 1 · Compra contado USD 160.000", contexto: "santa_monica", ejemploInput: "Evalúo compra contado USD 160.000: quiero video 2m31s y padrón" },
  { id: "SM-B2", area: "Santa Mónica · Meta Ads", titulo: "Botón 2 · Compara lote vs obra", contexto: "santa_monica", ejemploInput: "Comparo lote vs. obra (USD 160.000): pido video 2m31s y croquis" },
  { id: "SM-OBRA", area: "Santa Mónica · Turno 2", titulo: "Qué le falta terminar a la obra", contexto: "santa_monica", ejemploInput: "Qué le falta terminar exactamente a la obra de Santa Mónica?" },
  { id: "SM-PLAN", area: "Santa Mónica · Turno 2", titulo: "Planos aprobados, DJCU 2027 y banco", contexto: "santa_monica", ejemploInput: "Tiene planos aprobados o acepta préstamo de banco?" },
  { id: "SM-VID", area: "Santa Mónica · Turno 2", titulo: "Calificado pide video 2m31s y cédula", contexto: "santa_monica", ejemploInput: "Lo evalúo para vivienda propia, cuento con los USD y quiero ver el video completo" },
  { id: "SM-OFE", area: "Santa Mónica · Objeción", titulo: "Contraoferta USD 135.000 / Permuta", contexto: "santa_monica", ejemploInput: "Tengo USD 135.000 cash hoy por la casa de Santa Mónica, aceptan?" },
  { id: "VTA-HON", area: "Compra · Deriva a Andon", titulo: "Consulta de comisión (deriva sin % fijo en bot)", contexto: "santa_monica", ejemploInput: "Cuánto es la comisión inmobiliaria si compro Santa Mónica o un pozo?" },
  { id: "POZO-BET", area: "Google Search · Pozo", titulo: "Presupuesto desde USD 79.800 (Betania IV)", contexto: "pozo", ejemploInput: "Busco apartamento en pozo en Maldonado desde USD 80.000 con cuotas" },
  { id: "POZO-BET-TIP", area: "Google Search · Pozo", titulo: "Betania IV tipologías (1D/2D/3D + cochera inc.)", contexto: "pozo", ejemploInput: "Qué precios y cocheras tienen 1, 2 y 3 dormitorios en Betania IV?" },
  { id: "POZO-LEY", area: "Google Search · Pozo", titulo: "Ley 18.795 (Nostrum y More Atlántico)", contexto: "pozo", ejemploInput: "Qué opciones tenés con exoneración de impuestos Ley 18.795 en Roosevelt?" },
  { id: "POZO-GO", area: "Google Search · Pozo", titulo: "Gastos de ocupación y conexión", contexto: "pozo", ejemploInput: "Cuánto son los gastos de ocupación y conexión aparte del precio de lista?" },
  { id: "POZO-EXT", area: "Google Search · Pozo", titulo: "Comprador argentino / exterior", contexto: "pozo", ejemploInput: "Soy argentino y quiero saber si puedo comprar y firmar desde Buenos Aires" },
  { id: "COM-LOC", area: "Google Search · Comercial", titulo: "Busca local comercial u oficina (D6)", contexto: "general", ejemploInput: "Necesito alquilar un local comercial u oficina en Maldonado o Punta del Este" },
  { id: "DUE-HON", area: "Dueños · Turno 2", titulo: "Dueño pregunta cómo trabajan y cuánto cobran", contexto: "dueno", ejemploInput: "Cómo trabajan ustedes y cuánto cobran de comisión si venden mi propiedad?" },
  { id: "DUE-VTA", area: "Dueños · Venta Casa", titulo: "Dueño pasa metros/USD y pregunta qué fotos enviar", contexto: "dueno", ejemploInput: "Tengo mi casa en venta en Maldonado, son 120 metros, pido USD 140.000, qué fotos necesitan?" },
];

const VERTICAL_SPECS = {
  O1: {
    intent: "OFERTA_CASA",
    capa1: ["Ubicación / barrio", "Metros de terreno y edificados", "Precio en USD", "Estado documental / títulos", "Si acepta banco o permuta"],
    capa2: ["Quién construyó y características estructurales", "Antigüedad real", "Planos y papeles del padrón en PDF", "Video completo si está en etapa constructiva"],
    cruces: ["D3", "D7"],
  },
  O2: {
    intent: "OFERTA_APTO",
    capa1: ["Edificio / torre y zona", "Metros propios y terraza", "Gastos comunes mensuales", "Cochera / baulera", "Precio en USD"],
    capa2: ["Orientación y piso", "Estado de títulos o deuda", "Si está vacío o con renta vigente"],
    cruces: ["D4", "D1"],
  },
  O3: {
    intent: "OFERTA_COMERCIAL",
    capa1: ["Zona / frente comercial", "Metros de planta y altura", "Habilitación y potencia eléctrica", "Precio USD o canon mensual"],
    capa2: ["Planos e instalaciones en PDF", "Gastos comunes / cargas", "Si admite gastronomía, consultorio o estudio"],
    cruces: ["D6", "O6"],
  },
  O4: {
    intent: "OFERTA_LOTE",
    capa1: ["Padrón y ubicación exacta", "Metros totales, frente y fondo", "Precio en USD", "Servicios en puerta (OSE, UTE, saneamiento)"],
    capa2: ["FOT / FOS / retiros y altura permitida", "Estado legal y títulos del terreno en PDF", "Si admite proyecto llave en mano"],
    cruces: ["D5", "D7", "O7"],
  },
  O5: {
    intent: "OFERTA_PROYECTO_CONSTRUCCION",
    capa1: ["Ubicación / entorno frente a la Laguna / costa", "Avance real de obra y qué incluye", "Precio en USD y forma de pago", "Metraje de terreno y construcción base"],
    capa2: ["Memoria estructural (cálculo vientos oceánicos)", "Croquis base", "Antigüedad por audio", "Permisos / papeles en PDF", "Video completo de recorrido"],
    cruces: ["D7", "D3"],
  },
  O6: {
    intent: "OFERTA_ALQUILER",
    capa1: ["Canon mensual en $U o USD", "Qué incluye (gastos comunes, Wi-Fi, consumos)", "Garantías aceptadas y rechazadas (Porto, Sura, Mapfre, Santander, ANDA, depósito)", "Mascotas y plazo"],
    capa2: ["Llaves y horarios de visita", "Condiciones especiales", "Video de recorrido"],
    cruces: ["D2", "D3", "D4"],
  },
  O7: {
    intent: "OFERTA_DESARROLLADORA_POZO",
    capa1: ["Lista vigente y precio Desde USD", "Cronograma de cuotas", "Gastos de ocupación (%)", "Fecha de entrega"],
    capa2: ["Beneficios Ley 18.795", "Protocolo de pre-registro de clientes", "Disponibilidad por tipología"],
    cruces: ["D1", "D4", "D3"],
  },
  D1: {
    intent: "DEMANDA_POZO",
    capa1: ["Objetivo (renta vs. vivienda)", "Presupuesto y anticipo USD", "Necesidad de cuotas en obra", "Zona preferida"],
    capa2: ["Residencia local vs. exterior", "Interés en exoneraciones Ley 18.795"],
    cruces: ["O7", "O5"],
  },
  D2: {
    intent: "DEMANDA_ALQUILER",
    capa1: ["Zona deseada", "Cantidad de dormitorios", "Tope mensual en $U o USD", "Garantía aprobada (Porto, Sura, Mapfre, Santander, ANDA, depósito)", "Mascotas"],
    capa2: ["Días/horarios de visita", "Cantidad de personas"],
    cruces: ["O6"],
  },
  D3: {
    intent: "DEMANDA_CASA_HECHA",
    capa1: ["Zona / barrio", "Dormitorios y metros de terreno", "Presupuesto USD y contado vs. banco"],
    capa2: ["Tolerancia a reciclar vs. llave en mano", "Apertura a construcción base O5"],
    cruces: ["O1", "O5", "D7"],
  },
  D4: {
    intent: "DEMANDA_APTO_HECHO",
    capa1: ["Zona / parada", "Dormitorios y cochera", "Tope de gastos comunes", "Presupuesto USD"],
    capa2: ["Vivir todo el año vs. renta", "Apertura a pozo en cuotas O7"],
    cruces: ["O2", "O7"],
  },
  D5: {
    intent: "DEMANDA_LOTE",
    capa1: ["Zona deseada", "Metros mínimos", "Presupuesto USD", "Uso pensado"],
    capa2: ["Horizonte de obra", "Apertura a obra base implantada D7 -> O5"],
    cruces: ["O4", "D7", "O5"],
  },
  D6: {
    intent: "DEMANDA_COMERCIAL",
    capa1: ["Rubro exacto (local, oficina, consultorio, gastronomía)", "Alquiler vs. compra", "Zona y metraje necesario"],
    capa2: ["Vidriera, potencia trifásica, estacionamiento y habilitación"],
    cruces: ["O3", "O6", "O1"],
  },
  D7: {
    intent: "DEMANDA_LATENTE_LOTE_O_CONSTRUCCION_BASE",
    capa1: ["Presupuesto total USD", "Zona de interés (Santa Mónica / La Barra / José Ignacio)", "Uso (vivienda vs. inversión)"],
    capa2: ["Apertura a construcción base sólida en hormigón armado lista para proyectar arriba"],
    cruces: ["O5", "O4", "O1"],
  },
};

function matchesAny(txt, patterns) {
  return patterns.some((p) => txt.includes(p));
}

function extraerFranjaVisita(rawText) {
  const m = String(rawText || "").match(/(?:el\s+)?(?:lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo|ma[nñ]ana|hoy|esta semana)(?:\s+(?:de\s+(?:ma[nñ]ana|tarde)|a\s+las\s+\d{1,2}(?::\d{2})?\s*(?:hs|h)?))?/i);
  return m ? m[0].trim() : "el horario que propusiste";
}

export function clasificarVertical14(rawText, contextoPropiedad = "general") {
  const t = (rawText || "").toLowerCase();
  const ctx = (contextoPropiedad || "general").toLowerCase();

  // 0. Cierre negativo / rechazo educado ("ya señé", "ya alquilé", "ya conseguí")
  if (matchesAny(t, ["ya señé", "ya señe", "ya alquilé", "ya alquile", "ya conseguí", "ya consegui", "ya compré", "ya compre", "ya vendí", "ya vendi", "no me interesa"])) {
    const v = ctx === "dueno" ? "O6" : (ctx === "santa_monica" ? "D3" : "D2");
    return { vertical: v, subtipo: "CIERRE_NEGATIVO_EDUCADO" };
  }

  // 1. Botones exactos Meta Ads La Fortuna (ZAG-ALQ-05)
  if (t.includes("tengo porto, sura, mapfre o santander") || t.includes("tengo garantía aseguradora") || t.includes("tengo garantia aseguradora")) {
    return { vertical: "D2", subtipo: "LA_FORTUNA_VISITA_FILTRADA" };
  }
  if (t.includes("tengo ingresos para tramitar aseguradora")) {
    return { vertical: "D2", subtipo: "LA_FORTUNA_INGRESOS_TRAMITE" };
  }
  if (t.includes("busco con anda/cgn") || t.includes("busco con anda, cgn") || t.includes("tengo anda, cgn")) {
    return { vertical: "D2", subtipo: "LA_FORTUNA_OTRA_GARANTIA" };
  }
  if (t.includes("ficha completa y ubicación exacta de la fortuna") || t.includes("ficha completa y ubicacion exacta de la fortuna")) {
    return { vertical: "D2", subtipo: "LA_FORTUNA_FICHA" };
  }

  // 2. Botones exactos Meta Ads Santa Mónica (ZAG-VTA-01)
  if (t.includes("evalúo compra contado usd 160.000") || t.includes("evaluo compra contado usd 160.000")) {
    return { vertical: "D7", subtipo: "SANTA_MONICA_BOTON_1" };
  }
  if (t.includes("comparo lote vs. obra") || t.includes("comparo lote vs obra")) {
    return { vertical: "D7", subtipo: "SANTA_MONICA_BOTON_2" };
  }

  if (matchesAny(t, ["busco en otra zona o tengo propiedad", "busco en otra zona o presupuesto, o tengo propiedad"])) {
    return { vertical: "D2", subtipo: "TRIAJE_DUAL_OPCION_3" };
  }

  // 3. Ingreso de Propietarios / Desarrolladoras (O1..O7) — ANTES de objeciones de demanda
  // Distinguir explícitamente dueño vendedor/arrendador vs comprador/inquilino que pregunta comisión!
  const pareceCompradorOInquilino = matchesAny(t, ["si compro", "para comprar", "si alquilo", "para alquilar", "en la fortuna", "santa mónica", "santa monica", "un pozo"]);
  const esOfertaExplicita = matchesAny(t, [
    "tengo propiedad", "tengo una propiedad", "tengo un depto", "tengo un apto",
    "tengo una casa", "tengo mi casa", "tengo un terreno", "tengo un lote",
    "tengo un local", "soy dueño", "soy dueno", "soy dueña", "soy duena",
    "alquilo mi", "vendo mi", "en venta mi", "para publicar", "quiero publicar",
    "habilito", "para darte", "ofrezco mi", "nos da pozo", "somos desarrolladora",
    "queremos sumarnos", "protección de punta", "proteccion de punta", "sin registro",
    "puedo darte la grilla", "te paso la grilla",
  ]) || (!pareceCompradorOInquilino && matchesAny(t, [
    "cómo trabajan ustedes", "como trabajan ustedes",
    "venden mi propiedad", "alquilan mi propiedad",
  ]));
  const esTurno2Dueno = ctx === "dueno" && matchesAny(t, ["cómo trabajan", "como trabajan", "cuánto cobran", "cuanto cobran", "honorarios", "comisión", "comision", "qué fotos", "que fotos", "protección", "proteccion", "pre-registro", "grilla"]);

  if (esOfertaExplicita || esTurno2Dueno) {
    if (matchesAny(t, ["protección de punta", "proteccion de punta", "sin protección", "sin proteccion", "pre-registro", "grilla"]) && !matchesAny(t, ["somos desarrolladora", "queremos sumarnos"])) {
      return { vertical: "O7", subtipo: "O7_OBJECION_PREREGISTRO" };
    }
    if (matchesAny(t, ["desarrolladora", "edificio en pozo", "torre en pozo", "edificio nuevo en pozo"])) {
      return { vertical: "O7", subtipo: "INBOUND_DESARROLLADORA" };
    }
    if (matchesAny(t, ["cómo trabajan", "como trabajan", "cuánto cobran", "cuanto cobran", "honorarios", "comisión", "comision"])) {
      return { vertical: "O1", subtipo: "DUENO_TURNO_2_HONORARIOS" };
    }
    if (matchesAny(t, ["local", "oficina", "consultorio", "galpón", "galpon", "comercial"])) {
      return { vertical: "O3", subtipo: "INBOUND_COMERCIAL" };
    }
    if (matchesAny(t, ["terreno", "lote", "padrón", "padron"])) {
      return { vertical: "O4", subtipo: "INBOUND_LOTE" };
    }
    if (matchesAny(t, ["a construir", "construccion base", "construcción base", "obra gris", "proyecto de construccion", "proyecto de construcción"])) {
      return { vertical: "O5", subtipo: "INBOUND_PROYECTO_CONSTRUCCION" };
    }
    if (matchesAny(t, ["alquilar", "alquiler", "inquilino", "alquilo"]) && !t.includes("vendo")) {
      return { vertical: "O6", subtipo: "INBOUND_DUENO_ALQUILER" };
    }
    if (matchesAny(t, ["qué fotos", "que fotos", "son 120", "pido usd", "metros, pido"])) {
      return { vertical: "O1", subtipo: "DUENO_TURNO_2_CAPA2" };
    }
    if (matchesAny(t, ["apto", "apartamento", "depto", "departamento", "monoambiente"])) {
      return { vertical: "O2", subtipo: "INBOUND_APTO" };
    }
    return { vertical: "O1", subtipo: "INBOUND_CASA" };
  }

  // 4. Objeciones y Turnos 2/3 específicos de Santa Mónica (O5 / D7)
  if (matchesAny(t, ["qué le falta terminar", "que le falta terminar", "falta terminar", "le falta a la obra", "obra de santa m"])) {
    return { vertical: "D7", subtipo: "SANTA_MONICA_QUE_FALTA_OBRA" };
  }
  if (matchesAny(t, ["planos aprobados", "préstamo de banco", "prestamo de banco", "crédito hipotecario", "credito hipotecario", "regularizar", "djcu"]) && (ctx === "santa_monica" || matchesAny(t, ["santa m", "obra", "planos", "banco"]))) {
    return { vertical: "D7", subtipo: "SANTA_MONICA_PLANOS_DECRETO" };
  }
  if ((ctx === "santa_monica" || matchesAny(t, ["santa m", "laguna", "obra"])) && matchesAny(t, ["permuta", "parte de pago", "apto en montevideo", "propiedad en parte"])) {
    return { vertical: "D7", subtipo: "SANTA_MONICA_PERMUTA" };
  }
  if ((ctx === "santa_monica" || matchesAny(t, ["santa m"])) && matchesAny(t, ["te doy usd", "ofrezco usd", "bajan el precio", "contraoferta", "135.000", "140.000", "cash hoy"])) {
    return { vertical: "D7", subtipo: "SANTA_MONICA_CONTRAOFERTA" };
  }
  if ((ctx === "santa_monica" || matchesAny(t, ["santa m", "video completo", "video 2m31s"])) && matchesAny(t, ["vivienda propia", "para vivir", "para inversión", "para inversion", "cuento con los usd", "fondos en usd", "quiero ver el video completo"])) {
    return { vertical: "D7", subtipo: "SANTA_MONICA_TURNO_2_BOVEDA_VIDEO" };
  }

  // 4b. Consultas explícitas de honorarios / comisión al comprador o inquilino (Regla de Doble Punta + IVA)
  if (matchesAny(t, ["comisión inmobiliaria", "comision inmobiliaria", "honorarios inmobiliarios", "cuánto cobran de comisión", "cuanto cobran de comision", "cuánto es la comisión", "cuanto es la comision", "cuánto cobran por"]) && ctx !== "dueno") {
    if (ctx === "la_fortuna" || matchesAny(t, ["la fortuna", "alquilar", "alquiler"])) {
      return { vertical: "D2", subtipo: "LA_FORTUNA_REQUISITOS_INGRESO" };
    }
    return { vertical: ctx === "santa_monica" ? "D7" : "D1", subtipo: "DEMANDA_HONORARIOS_COMPRA" };
  }

  // 5. Google Search / Pozo D1 y objeciones financieras (ANTES de citas genéricas)
  if (matchesAny(t, ["betania"]) && matchesAny(t, ["2 dormitorios", "3 dormitorios", "62", "68", "78", "cochera", "estacionamiento", "tipologías", "tipologias", "listado", "qué precios", "que precios"])) {
    return { vertical: "D1", subtipo: "BETANIA_TIPOLOGIAS_PRECIOS" };
  }
  if (matchesAny(t, ["gastos de ocupación", "gastos de ocupacion", "gastos de conexión", "gastos de conexion"])) {
    return { vertical: "D1", subtipo: "POZO_GASTOS_OCUPACION" };
  }
  if (matchesAny(t, ["argentino", "exterior", "buenos aires", "desde argentina", "no residente", "a distancia", "firmar desde"])) {
    return { vertical: "D1", subtipo: "POZO_COMPRA_EXTERIOR" };
  }
  if (matchesAny(t, ["residencia fiscal", "3.500.000 ui"])) {
    return { vertical: "D1", subtipo: "POZO_RESIDENCIA_FISCAL" };
  }
  if (matchesAny(t, ["18.795", "18795", "vivienda promovida", "exoneración de impuestos", "exoneracion de impuestos"])) {
    return { vertical: "D1", subtipo: "POZO_LEY_18795" };
  }
  if (matchesAny(t, ["pozo", "betania", "nostrum", "more atlántico", "more atlantico", "golden rise", "eve tower", "cuotas de obra", "80.000", "79.800"])) {
    return { vertical: "D1", subtipo: "DEMANDA_POZO" };
  }

  // 6. Objeciones específicas de Alquiler / La Fortuna (D2)
  if (matchesAny(t, ["enero", "quincena", "verano", "temporada", "por día", "por dia", "vacaciones"])) {
    return { vertical: "D2", subtipo: "OBJECION_TEMPORADA_VS_ANUAL" };
  }
  if (matchesAny(t, ["con mi pareja", "sumamos", "entre los dos", "sueldos conjuntos", "recibos de sueldo"]) && matchesAny(t, ["porto", "sura", "mapfre", "santander", "llegamos", "alcanza", "calific"])) {
    return { vertical: "D2", subtipo: "LA_FORTUNA_SUMA_INGRESOS_PAREJA" };
  }
  if (matchesAny(t, ["mascota", "perro", "gato"])) {
    return { vertical: "D2", subtipo: "LA_FORTUNA_OBJECION_MASCOTA" };
  }
  if (matchesAny(t, ["dirección exacta", "direccion exacta", "número de puerta", "numero de puerta", "qué calle", "que calle", "ubicación exacta", "ubicacion exacta"])) {
    return { vertical: "D2", subtipo: "LA_FORTUNA_DIRECCION_PUERTA" };
  }
  if (matchesAny(t, ["depósito", "deposito", "comisión para entrar", "comision para entrar", "qué requisitos", "que requisitos", "cuánto piden", "cuanto piden"])) {
    return { vertical: "D2", subtipo: "LA_FORTUNA_REQUISITOS_INGRESO" };
  }
  if (matchesAny(t, ["gastos comunes", "aparte del alquiler", "qué incluye", "que incluye", "cuánto sale por mes", "cuanto sale por mes"]) || (ctx === "la_fortuna" && matchesAny(t, ["cuánto sale", "cuanto sale", "precio", "valor"]))) {
    return { vertical: "D2", subtipo: "LA_FORTUNA_OBJECION_GC_INCLUYE" };
  }
  if (matchesAny(t, ["audio", "llamar", "llamada", "teléfono", "telefono"])) {
    return { vertical: ctx === "santa_monica" ? "D7" : "D2", subtipo: "CANAL_AUDIO_WHATSAPP" };
  }

  // 7. Propuestas de visita / día y hora (después de validar intents de pozo/objeciones)
  if (
    /\b(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo|ma[nñ]ana|esta semana|pr[oó]xima semana)\b/i.test(t)
    || /\b\d{1,2}\s*(?:hs|horas|:00|:30)\b/i.test(t)
    || /\b(puedo ir|puedo pasar|ir a ver|coordinar visita)\b/i.test(t)
  ) {
    if (ctx === "santa_monica" || matchesAny(t, ["terreno", "obra", "santa m", "laguna"])) {
      return { vertical: "D7", subtipo: "TURNO_2_VISITA_SANTA_MONICA" };
    }
    if (ctx === "pozo") {
      return { vertical: "D1", subtipo: "TURNO_2_VISITA_POZO" };
    }
    return { vertical: "D2", subtipo: "TURNO_2_VISITA_LA_FORTUNA" };
  }

  // 8. Demanda general por vertical (Comercial D6 ANTES de Alquiler D2 para no mezclar "alquilar local"!)
  if (matchesAny(t, ["local comercial", "local", "oficina", "consultorio", "negocio", "galpón", "galpon"])) {
    return { vertical: "D6", subtipo: "DEMANDA_COMERCIAL" };
  }
  if (matchesAny(t, ["alquiler", "alquilo", "alquilar", "renta anual", "la fortuna", "ágata", "agata", "garantía", "garantia"])) {
    return { vertical: "D2", subtipo: "DEMANDA_ALQUILER_GENERAL" };
  }
  if (matchesAny(t, ["terreno", "lote", "para construir", "tirar abajo", "demoler", "a construir", "santa monica", "santa mónica", "laguna", "josé ignacio", "jose ignacio", "la barra"])) {
    const esLatente = matchesAny(t, ["para construir", "proyecto", "tirar abajo", "demoler", "reciclar", "santa monica", "santa mónica", "laguna", "la barra", "josé ignacio", "jose ignacio"]);
    return { vertical: esLatente ? "D7" : "D5", subtipo: esLatente ? "LATENTE_LOTE_PROYECTO" : "DEMANDA_LOTE" };
  }
  if (matchesAny(t, ["apto", "apartamento", "depto", "departamento", "monoambiente"])) {
    if (t.includes("brava")) return { vertical: "D4", subtipo: "DEMANDA_APTO_BRAVA_CRUCE_POZO" };
    return { vertical: "D4", subtipo: "DEMANDA_APTO" };
  }
  if (matchesAny(t, ["casa", "vivienda", "vivir"])) {
    return { vertical: "D3", subtipo: "DEMANDA_CASA" };
  }

  return { vertical: "D2", subtipo: "AUTOSERVICIO_GENERAL" };
}

export function detectarFaltantes(vertical, rawText) {
  const spec = VERTICAL_SPECS[vertical] || VERTICAL_SPECS.D2;
  const t = (rawText || "").toLowerCase();
  const esVenta = ["O1", "O2", "O3", "O4", "O5", "O7", "D1", "D3", "D4", "D5", "D6", "D7"].includes(vertical);

  const faltantesCapa1 = spec.capa1.filter((item) => {
    if (esVenta && /garant[ií]a/i.test(item)) return false;
    if (/precio|usd|\$u/i.test(item) && /(usd|\$u)\s*\d+/i.test(t)) return false;
    return true;
  });

  const faltantesCapa2 = spec.capa2.filter((item) => {
    if (esVenta && /garant[ií]a/i.test(item)) return false;
    if (/ubicaci[oó]n/i.test(item) && t.includes("maps.app.goo.gl")) return false;
    return true;
  });

  return {
    faltantes_capa_1: faltantesCapa1,
    faltantes_capa_2: faltantesCapa2,
    cruces_sugeridos: spec.cruces,
  };
}

export function aplicarPokaYokeMar(texto, vertical, esRespuestaPasiva = false, etapaSla = "T0_INMEDIATO") {
  let out = String(texto || "").trim();
  const violaciones = [];

  if (/[¿¡]/.test(out)) {
    out = out.replace(/[¿¡]/g, "");
  }

  // Candado Cocina vs Vidriera: nunca filtrar términos internos ni datos privados al cliente final
  if (/\b(b[oó]veda privada|franja gris|mar[ií]a bel[eé]n|mar[ií]a cristina|manzana 26|carpeta 8|padr[oó]n 704)\b/i.test(out)) {
    violaciones.push("FUGA_TERMINO_INTERNO_O_PADRON");
  }

  const esDueno = /^O[1-6]$/.test(vertical);
  if (esDueno) {
    const fichaUrlRe = /https?:\/\/zaguanpropiedades\.com\/(?:alquileres|ventas|proyectos|propiedades)\/[a-z0-9-]+\/?/gi;
    if (fichaUrlRe.test(out)) {
      violaciones.push("CANDADO_FRANJA_GRIS_URL_PUBLICA_A_DUENO");
      out = out.replace(fichaUrlRe, LINKS_URL);
    }
  }

  if (/^D[1-7]$/.test(vertical)) {
    if (/(maps\.google\.com|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(out)) {
      violaciones.push("PIN_GPS_CRUDO_PROHIBIDO_EN_T0");
    }
    if (/(con el due[nñ]o|con el propietario)/i.test(out)) {
      violaciones.push("MENCION_DUENO_PROHIBIDA_EN_DEMANDA");
    }
    const urls = out.match(/https?:\/\/[^\s]+/gi) || [];
    if (etapaSla === "T0_INMEDIATO" && urls.length > 1) {
      violaciones.push("DOS_O_MAS_LINKS_EN_T0");
    }
  }

  if (!["O6", "D2"].includes(vertical) && /\b(porto|sura|mapfre|anda|cgn|garant[ií]a aseguradora)\b/i.test(out)) {
    violaciones.push("GARANTIA_EN_VERTICAL_NO_ALQUILER");
  }

  if (/\b[a-záéíóúüñ]{3,}mente\b/i.test(out)) {
    violaciones.push("ADVERBIO_MENTE");
  }
  if (/\bencajar\b/i.test(out)) {
    violaciones.push("PALABRA_PROHIBIDA_ENCAJAR");
  }
  if (/(\b\d+\s*%\s*(?:\+\s*iva|m[aá]s\s+iva)?\s*(?:de\s+)?(?:honorarios|comisi[oó]n)|(?:honorarios|comisi[oó]n)[^\n.]{0,35}\b\d+\s*%)/i.test(out)) {
    violaciones.push("PORCENTAJE_COMISION_EN_BOT");
  }

  const qCount = (out.match(/\?/g) || []).length;
  if (qCount > 1) {
    violaciones.push("DOS_O_MAS_PREGUNTAS_ENCADENADAS");
  }

  if (esRespuestaPasiva && /\b(mientras te respondo|c[oó]mo podemos ayudarte|contame qu[eé] est[aá]s buscando,\s*as[ií] te paso)\b/i.test(out)) {
    violaciones.push("PROMESA_FALSA_ATENCION_INMEDIATA");
  }
  if (/quedo a las [oó]rdenes si decid[ií]s avanzar/i.test(out)) {
    violaciones.push("SEGUIMIENTO_PASIVO_PROHIBIDO");
  }

  return {
    texto: out,
    pokayoke_pass: violaciones.length === 0,
    violaciones,
  };
}

function seleccionarFamiliaArbol(vertical, subtipo) {
  if (subtipo === "AUTOSERVICIO_GENERAL") return "AUTOSERVICIO_GENERAL";
  if (subtipo === "TRIAJE_DUAL_OPCION_3") return "TRIAJE_DUAL";
  if (vertical === "D2") return "FAMILIA_A_ALQUILER_ANUAL";
  if (["D3", "D5", "D7"].includes(vertical)) return "FAMILIA_B_COMPRA_LOTE_PROYECTO";
  if (["D1", "D4"].includes(vertical)) return "FAMILIA_C_POZO_DESARROLLADORA";
  if (vertical === "D6") return "FAMILIA_E_COMERCIAL";
  if (/^O[1-7]$/.test(vertical)) return "FAMILIA_D_DUENO_DIRECTO_CAPTACION";
  return "AUTOSERVICIO_GENERAL";
}

export function clasificarYResponder(rawText, etapaSla = "T0_INMEDIATO", contextoPropiedad = "general") {
  const { vertical, subtipo } = clasificarVertical14(rawText, contextoPropiedad);
  const spec = VERTICAL_SPECS[vertical] || VERTICAL_SPECS.D2;
  const analisis = detectarFaltantes(vertical, rawText);
  const familia = seleccionarFamiliaArbol(vertical, subtipo);
  const arbol = ARBOL_ESTRATEGICO_SEMAFORO[familia] || null;
  let replyText = "";
  let alertaAndon = false;
  let motivoAndon = "";
  let esPasiva = false;

  if (subtipo === "CIERRE_NEGATIVO_EDUCADO") {
    replyText =
      "Gracias por avisarnos. Dejamos cerrada la consulta de esta propiedad sin volver a molestarte.\n" +
      "Si en el futuro retomás la búsqueda o necesitás publicar un inmueble, nos escribís por acá.";
    alertaAndon = true;
    motivoAndon = "Cierre negativo educado: pasar a baja/radar sin insistir.";
  } else if (subtipo === "LA_FORTUNA_VISITA_FILTRADA") {
    replyText = ARBOL_ESTRATEGICO_SEMAFORO.FAMILIA_A_ALQUILER_ANUAL.tiempos.T0_INMEDIATO;
    alertaAndon = true;
    motivoAndon = "Lead La Fortuna ya declaró póliza aseguradora (Botón 1): listo para agenda.";
  } else if (subtipo === "LA_FORTUNA_INGRESOS_TRAMITE") {
    replyText =
      `Acá ves fotos y ficha de La Fortuna ($U 30.000/mes con gastos comunes, Wi-Fi y cochera): ${LA_FORTUNA_URL}\n` +
      "Porto, Sura, Mapfre y Santander aprueban en 24/48 hs con recibo o ingresos. Querés que te indique cómo pre-aprobarla y visitar?";
    alertaAndon = true;
    motivoAndon = "Lead La Fortuna calificable con ingresos (Botón 2): acompañar pre-aprobación.";
  } else if (subtipo === "LA_FORTUNA_OTRA_GARANTIA") {
    replyText =
      "En La Fortuna se trabaja con póliza de aseguradora, aunque relevamos opciones en otras zonas y garantías de Maldonado además de publicar propiedades con difusión abierta.\n" +
      "Buscás alquilar en otro barrio o rango (indicanos zona, garantía y tope), o tenés una propiedad para publicar?";
    alertaAndon = true;
    motivoAndon = "Lead Botón 3 (ANDA/CGN o captación): derivar a D2 sin quemar La Fortuna.";
  } else if (subtipo === "LA_FORTUNA_FICHA") {
    replyText = ARBOL_ESTRATEGICO_SEMAFORO.FAMILIA_A_ALQUILER_ANUAL.tiempos[etapaSla]
      || ARBOL_ESTRATEGICO_SEMAFORO.FAMILIA_A_ALQUILER_ANUAL.tiempos.T0_INMEDIATO;
    alertaAndon = true;
    motivoAndon = `Seguimiento La Fortuna (${etapaSla}).`;
  } else if (subtipo === "TURNO_2_VISITA_LA_FORTUNA") {
    const franja = extraerFranjaVisita(rawText);
    const yaDeclaroPoliza = /\b(porto|sura|mapfre|santander)\b/i.test(rawText || "");
    replyText = yaDeclaroPoliza
      ? `Anotado ${franja} con póliza aprobada para visitar el 2 dormitorios en La Fortuna ($U 30.000/mes con gastos comunes y Wi-Fi incluidos).\nDejamos confirmado el bloque de visita con nuestra gestión en ZAGUÁN y te compartimos el punto exacto sobre Av. Ágata antes de ir.\nMe confirmás tu apellido y cuántas personas vivirían en el apartamento?`
      : `Anotado ${franja} como preferencia para visitar el 2 dormitorios en La Fortuna.\nEn ZAGUÁN confirmamos esa franja de agenda y te compartimos el punto exacto sobre Av. Ágata al validar póliza aseguradora.\nMe pasás tu nombre completo, qué aseguradora tenés aprobada y cuántas personas irían?`;
    alertaAndon = true;
    motivoAndon = "ANDON VISITA: Lead propuso día/hora en La Fortuna; confirmar agenda.";
  } else if (subtipo === "LA_FORTUNA_OBJECION_GC_INCLUYE") {
    replyText =
      "El alquiler de La Fortuna ($U 30.000/mes) ya incluye gastos comunes del predio, Internet Wi-Fi de alta velocidad y cochera fija.\n" +
      "Solo los consumos independientes de UTE (luz) y OSE (agua) van aparte por cuenta del inquilino.\n" +
      "Contás con póliza de aseguradora (Porto, Sura, Mapfre o Santander) para coordinar visita?";
  } else if (subtipo === "LA_FORTUNA_OBJECION_MASCOTA") {
    replyText =
      "Gracias por avisar. El apartamento de La Fortuna ($U 30.000/mes) admite mascota pequeña de porte chico.\n" +
      "Para perros medianos o grandes consultamos raza y peso antes de mover visitas y además relevamos casas con patio en Maldonado.\n" +
      "Me pasás raza o tamaño aproximado junto con tu tope mensual por si sumamos alternativas?";
  } else if (subtipo === "LA_FORTUNA_DIRECCION_PUERTA") {
    replyText =
      "La unidad está sobre Av. Ágata, en Barrio La Fortuna (Maldonado), a 300 metros de San Pablo y con ómnibus a metros hacia el centro y Ruta 39.\n" +
      "Entregamos el punto exacto en puerta al dejar confirmada la visita presencial con nuestro equipo de ZAGUÁN.\n" +
      "Contás con póliza de aseguradora (Porto, Sura, Mapfre o Santander) para coordinar día y horario?";
  } else if (subtipo === "LA_FORTUNA_REQUISITOS_INGRESO") {
    replyText =
      "Para ingresar en La Fortuna se exige garantía de aseguradora aprobada (Porto, Sura, Mapfre o Santander; excluye ANDA y CGN), primer mes por adelantado y 1 mes de alquiler + IVA de comisión inmobiliaria sobre contrato de 1 a 2 años.\n" +
      "Si todavía no tenés póliza emitida, estas aseguradoras aprueban en 24/48 hs con recibo de sueldo o certificación contable de ingresos.\n" +
      "Ya contás con aseguradora aprobada o querés que veamos el trámite de ingreso?";
  } else if (subtipo === "LA_FORTUNA_SUMA_INGRESOS_PAREJA") {
    replyText =
      "Sí, Porto, Sura, Mapfre y Santander permiten sumar los recibos de sueldo de la pareja o núcleo familiar para cubrir el criterio habitual (aprox. 3 veces el canon de $U 30.000/mes), así que con $U 95.000 líquidos califican en 24/48 hs.\n" +
      `Acá ves fotos y ficha de La Fortuna: ${LA_FORTUNA_URL}\n` +
      "Qué día y franja horaria les sirve visitar esta semana?";
  } else if (subtipo === "OBJECION_TEMPORADA_VS_ANUAL") {
    replyText =
      "En esta línea operamos alquileres anuales con contrato estable de 1 a 2 años en Maldonado y Punta del Este.\n" +
      "Si estás buscando radicarte o alquilar todo el año, qué zona, cantidad de dormitorios y garantía manejás?";
  } else if (subtipo === "CANAL_AUDIO_WHATSAPP") {
    replyText =
      "Podés mandarnos un audio o mensaje escrito directo por acá por WhatsApp y te respondemos en el día con la información ordenada.\n" +
      "Contanos en pocas palabras tu consulta o propiedad y lo revisamos.";
    alertaAndon = true;
    motivoAndon = "Lead pidió audio o llamada: revisar mensaje de voz / responder por WA.";
  } else if (subtipo === "SANTA_MONICA_BOTON_1") {
    replyText = ARBOL_ESTRATEGICO_SEMAFORO.FAMILIA_B_COMPRA_LOTE_PROYECTO.tiempos.T0_INMEDIATO;
    alertaAndon = true;
    motivoAndon = "Lead Botón 1 Santa Mónica USD 160.000 (vivienda vs. inversión).";
  } else if (subtipo === "SANTA_MONICA_BOTON_2") {
    replyText =
      `Acá ves la ficha y el croquis proyectable en dos plantas de Santa Mónica (USD 160.000): ${SANTA_MONICA_URL}\n` +
      "Para pasarte el video completo de 2m31s y la cédula catastral con decreto de regularización hasta dic. 2027: contás con fondos en USD para evaluar compra directa?";
    alertaAndon = true;
    motivoAndon = "Lead Botón 2 Santa Mónica (cruce lote vs. obra base USD 160.000).";
  } else if (subtipo === "SANTA_MONICA_QUE_FALTA_OBRA") {
    replyText =
      "La obra tiene la estructura de 201 m² en hormigón armado y ladrillo visto terminada en 2 plantas (calculada por ingeniera civil para vientos oceánicos) más las aberturas de aluminio de planta alta colocadas.\n" +
      "Faltan revestimientos, terminaciones de cocina/baños, instalaciones y cerramientos de planta baja sobre el croquis base (2 suites abajo y estar/terraza panorámica arriba).\n" +
      "Evaluás este proyecto en USD 160.000 para avanzar y recibir el video completo de recorrido por acá?";
  } else if (subtipo === "SANTA_MONICA_PLANOS_DECRETO") {
    replyText =
      "Al ser una obra en curso sin final de obra, no aplica préstamo hipotecario bancario (la operación se plantea al contado en USD).\n" +
      "En documentación cuenta con Cédula Catastral y DJCU vigente (válida por 5 años), lista para presentar planos bajo el decreto vigente de la Intendencia de Maldonado para regularizar sin multas ni recargos y con arquitecto de oficio hasta diciembre de 2027.\n" +
      "Te sirve evaluar compra al contado en USD 160.000 para pasarte el video completo y la documentación técnica por acá?";
  } else if (subtipo === "SANTA_MONICA_CONTRAOFERTA") {
    replyText =
      "El valor publicado es USD 160.000 al contado sobre lote propio de 348 m² frente a la Laguna y 201 m² construidos en hormigón armado ya implantados (calculados por ingeniera civil para vientos oceánicos).\n" +
      "Cualquier propuesta formal en USD la elevamos por escrito después de recorrer la obra para que evalúes el valor de reposición.\n" +
      "Te paso el video completo de 2m31s y la agenda de visita esta semana?";
    alertaAndon = true;
    motivoAndon = "ANDON SANTA MÓNICA: Contraoferta recibida; invitar a visita técnica antes de formalizar.";
  } else if (subtipo === "SANTA_MONICA_PERMUTA") {
    replyText =
      "La operación de Santa Mónica (USD 160.000) está planteada al contado en USD, sin financiación bancaria directa.\n" +
      "Si contás con una diferencia sólida en efectivo USD o querés analizar una entrega parcial, relevamos los datos antes de consultar viabilidad.\n" +
      "Qué monto líquido en USD tenés disponible además de la propiedad?";
    alertaAndon = true;
    motivoAndon = "ANDON SANTA MÓNICA: Consulta de permuta; verificar liquidez en USD antes de consultar.";
  } else if (subtipo === "DEMANDA_HONORARIOS_COMPRA") {
    replyText =
      "Trabajamos con condiciones comerciales y notariales claras de cierre según el tipo de operación e inmueble, por lo que no enviamos porcentajes genéricos por respuesta automática.\n" +
      "Confirmame sobre qué propiedad o proyecto puntual evaluás avanzar así nuestro equipo te pasa el detalle por escrito?";
    alertaAndon = true;
    motivoAndon = "ANDON COMISIÓN VENTA: Cliente preguntó comisión; deriva sin % fijo para ajustar 1 a 1.";
  } else if (subtipo === "BETANIA_TIPOLOGIAS_PRECIOS") {
    replyText =
      `En Betania IV (Fraccionamiento 4H, Maldonado · entrega estimada oct. 2028) las tipologías parten de USD 79.800 (1D 40 m²), USD 122.400 (2D 62 m²), USD 133.200 (2D 68 m² y accesible) y USD 156.600 (3D 87 m² totales), con 50% de anticipo + hasta 24 cuotas, 1,5% de gastos de ocupación y 1 estacionamiento en planta baja incluido en cada unidad: ${PROYECTOS_URL}betania-iv/\n` +
      "Buscás 1, 2 o 3 dormitorios para enviarte el plano de esa planta?";
  } else if (subtipo === "SANTA_MONICA_TURNO_2_BOVEDA_VIDEO") {
    replyText = ARBOL_ESTRATEGICO_SEMAFORO.FAMILIA_B_COMPRA_LOTE_PROYECTO.tiempos.TURNO_2_CALIFICADO;
    alertaAndon = true;
    motivoAndon = "ANDON SANTA MÓNICA TURNO 2: Enviar video completo 2m31s + datos de Bóveda Privada.";
  } else if (subtipo === "TURNO_2_VISITA_SANTA_MONICA") {
    const franja = extraerFranjaVisita(rawText);
    replyText =
      `Anotamos ${franja} como preferencia para recorrer el proyecto en construcción en Santa Mónica (USD 160.000).\n` +
      "En ZAGUÁN confirmamos esa franja de agenda y te compartimos el punto exacto de encuentro junto con la cédula catastral por acá.\n" +
      "Me pasás tu nombre completo para dejarte confirmada la visita?";
    alertaAndon = true;
    motivoAndon = "ANDON VISITA SANTA MÓNICA: Lead propuso día/hora; coordinar con Mar.";
  } else if (subtipo === "POZO_LEY_18795") {
    replyText =
      `Las dos opciones fuertes con Vivienda Promovida Ley 18.795 en Roosevelt son Nostrum Roosevelt (Pda. 19, desde USD 107.419, gastos de ocupación 4%) y More Atlántico (Pda. 22, desde USD 139.121 con certificación LEED, gastos de ocupación 5%; ambos con exoneración de ITP, IRPF/IRAE y Patrimonio por 10 años, cochera opcional): ${PROYECTOS_URL}\n` +
      "Buscás 1 o 2 dormitorios y querés que dejemos hecho el pre-registro formal con tu nombre para pasarte planos y listas vigentes?";
  } else if (subtipo === "POZO_GASTOS_OCUPACION") {
    replyText =
      "Los gastos de ocupación en obra nueva varían según el edificio: Betania IV tiene 1,5% a la entrega; Nostrum Roosevelt y Golden Rise tienen 4%; More Atlántico y EVE Tower tienen 5%.\n" +
      "En todos los casos los incluimos desglosados en nuestra comparativa junto con el costo de cochera (incluida en Betania IV y opcional en los demás).\n" +
      "Qué presupuesto en USD o proyecto puntual estás comparando para mandarte el detalle neto?";
  } else if (subtipo === "POZO_COMPRA_EXTERIOR") {
    replyText =
      "Compradores de Argentina y del exterior operan a distancia con nuestra escribanía aliada mediante boleto de reserva, verificación de ingresos (DNI o Pasaporte + últimos 3 recibos o certificación contable) y Poder Especial apostillado por La Haya para escritura.\n" +
      `Podés ver los 5 desarrollos activos desde USD 79.800 en ${PROYECTOS_URL}\n` +
      "Qué tipología y forma de pago en cuotas buscás para mandarte el desglose notarial completo?";
  } else if (subtipo === "POZO_RESIDENCIA_FISCAL") {
    replyText =
      "Para residencia fiscal por inversión inmobiliaria en Uruguay la normativa exige superar las 3.500.000 UI (aprox. USD 579.000 a 590.000) más 60 días de presencia anual, aunque se puede alcanzar acumulando unidades desde el compromiso inscripto.\n" +
      "Si evaluás una unidad individual como inversión en renta bajo Ley 18.795 o armar un paquete, qué presupuesto total manejás?";
    alertaAndon = true;
    motivoAndon = "Consulta de Residencia Fiscal: evaluar portafolio múltiple con escribanía.";
  } else if (vertical === "D1") {
    replyText =
      `Trabajamos 5 desarrollos en pozo en Maldonado y Punta del Este (incluyendo Betania IV desde USD 79.800 con 50% de anticipo, 24 cuotas, 1 estacionamiento en planta baja incluido y 1,5% de gastos de ocupación): ${PROYECTOS_URL}\n` +
      "Buscás renta o vivienda y qué rango de anticipo en USD manejás para enviarte planos y listas vigentes?";
  } else if (subtipo === "DEMANDA_APTO_BRAVA_CRUCE_POZO") {
    replyText =
      `En Playa Brava tenemos EVE Tower en Parada 8 a 100 metros del mar (referencia desde USD 150.000 con financiación propia hasta 55 cuotas sin interés y 5% de gastos de ocupación), además de opciones en pozo en ${PROYECTOS_URL}\n` +
      "Buscás entrega próxima para vivir todo el año o financiar en obra en USD?";
  } else if (subtipo === "TURNO_2_VISITA_POZO") {
    const franja = extraerFranjaVisita(rawText);
    replyText =
      `Anotado ${franja}. Para confirmar visita o recorrido con la desarrolladora (y cuidar tu pre-registro oficial por 60 días), pasanos tu nombre completo, apellido y correo.\n` +
      "Qué edificio puntual de los 5 querés priorizar?";
    alertaAndon = true;
    motivoAndon = "ANDON VISITA POZO: pedir Nombre y Apellido para pre-registro de desarrolladora.";
  } else if (vertical === "D6") {
    replyText =
      "Relevamos locales comerciales, oficinas y consultorios disponibles en Maldonado y Punta del Este según metraje, vidriera y potencia eléctrica (trifásica o habilitación comercial).\n" +
      "Qué rubro exacto vas a instalar, cuántos metros necesitás y buscás alquiler o compra?";
    alertaAndon = true;
    motivoAndon = "Lead D6 Comercial (Google Search): pasar a Mar para relevamiento de salón/oficina.";
  } else if (vertical === "D7" || (["D3", "D5"].includes(vertical) && /terreno|lote|santa m[oó]nica|laguna|jos[eé] ignacio|la barra|construir/i.test(rawText || ""))) {
    replyText =
      `Además de terrenos libres en esa zona, tenemos en cartera un proyecto en construcción sobre lote propio de 348 m² frente a la Laguna en Santa Mónica (a 7 km de José Ignacio, USD 160.000), con 201 m² en hormigón armado listos para revestir (ahorra 12 meses de obra): ${SANTA_MONICA_URL}\n` +
      "Evaluás arrancar de cero en lote libre o te interesa que te pasemos el video completo de esta estructura base?";
    alertaAndon = true;
    motivoAndon = "Cruce latente D7 -> O5 Santa Mónica activado.";
  } else if (subtipo === "DUENO_TURNO_2_HONORARIOS") {
    replyText =
      "Trabajamos con autorización abierta sin exclusividad: seguís ofreciendo por tu cuenta mientras armamos la difusión y filtramos solvencia e intención real antes de cada visita.\n" +
      "Operamos solo a resultado al concretar con un interesado de ZAGUÁN; las condiciones comerciales se acuerdan por escrito según el tipo de propiedad al armar la ficha interna.\n" +
      "Tu propiedad es para venta o alquiler anual y en qué barrio está?";
    alertaAndon = true;
    motivoAndon = "Dueño en Turno 2 preguntó modalidad y condiciones; derivar sin % fijo para cerrar 1 a 1.";
  } else if (subtipo === "DUENO_TURNO_2_CAPA2") {
    replyText =
      "Para armar la carpeta interna y evitar visitas de curiosos, podés enviarnos por acá fotos o video completo de recorrido, ubicación aproximada, y si tenés PDF de cédula catastral, DJCU o títulos.\n" +
      "Qué días y horarios tenés disponibilidad para mostrarla cuando filtremos un comprador real?";
    alertaAndon = true;
    motivoAndon = "Dueño mandó datos base de venta O1: activar Capa 2 (PDF/video) y Bienvenida de OKs.";
  } else if (subtipo === "O7_OBJECION_PREREGISTRO") {
    replyText =
      "Trabajamos con pre-registro nominal del interesado (nombre, apellido y fecha de envío) con protección de 60 días para ordenar la comercialización sin duplicar citas.\n" +
      "Cada contacto llega filtrado con anticipo en USD confirmado antes de pasártelo; podés enviarnos el enlace o archivo de lista vigente para dar el alta?";
    alertaAndon = true;
    motivoAndon = "ANDON O7: Desarrolladora consulta/objeta pre-registro de punta; validar regla por escrito.";
  } else if (vertical === "O7") {
    replyText =
      "Excelente. En ZAGUÁN trabajamos obra nueva en Punta del Este y Maldonado ordenando listas de precios Desde USD, esquema de cuotas, gastos de ocupación y protocolo de pre-registro de interesados.\n" +
      "Nos pasás el nombre del emprendimiento, carpeta vigente y correo o contacto comercial para coordinar el alta?";
    alertaAndon = true;
    motivoAndon = "Alta inbound de desarrolladora O7: pasar a Master CSV y activar canal.";
  } else if (/^O[1-6]$/.test(vertical)) {
    const tiempoD = ARBOL_ESTRATEGICO_SEMAFORO.FAMILIA_D_DUENO_DIRECTO_CAPTACION.tiempos[etapaSla];
    if (etapaSla !== "T0_INMEDIATO" && tiempoD) {
      replyText = tiempoD;
    } else if (vertical === "O6") {
      replyText =
        "Hola, te escribe Mar, de ZAGUÁN Propiedades. Trabajamos alquileres anuales con publicación abierta sin exclusividad, filtrando garantía aseguradora aprobada (Porto, Sura o Mapfre) antes de cada visita.\n" +
        "Me confirmás qué garantías aceptás y si ese valor incluye gastos comunes?";
    } else if (vertical === "O3") {
      replyText =
        "Hola, te escribe Mar, de ZAGUÁN Propiedades. Trabajamos locales comerciales y oficinas con publicación abierta sin exclusividad, filtrando cada interesado por rubro y solvencia.\n" +
        "Me confirmás metros del salón, si cuenta con trifásica/habilitación y valor pretendido?";
    } else if (vertical === "O4") {
      replyText =
        "Hola, te escribe Mar, de ZAGUÁN Propiedades. Trabajamos lotes y terrenos con publicación abierta sin exclusividad, pre-calificando compradores antes de coordinar visitas.\n" +
        "Me confirmás número de padrón o frente/fondo, servicios en puerta y valor en USD?";
    } else {
      replyText =
        "Hola, te escribe Mar, de ZAGUÁN Propiedades. Trabajamos en Punta del Este y Maldonado con publicación abierta sin exclusividad y filtro previo de compradores.\n" +
        `Para evaluar tu propiedad en cartera, envianos:\n• ${analisis.faltantes_capa_1.slice(0, 3).join("\n• ")}`;
    }
    alertaAndon = true;
    motivoAndon = `Alta inbound de propietario (${vertical}): pasar a Master CSV y Bienvenida de OKs.`;
  } else if (vertical === "D2" && subtipo === "DEMANDA_ALQUILER_GENERAL") {
    replyText =
      `Podés ver las fichas de alquiler anual activas hoy en ${ALQUILERES_URL} (incluyendo La Fortuna 2 dormitorios a $U 30.000 con gastos comunes y Wi-Fi incluidos).\n` +
      "Contás con garantía de aseguradora aprobada (Porto, Sura, Mapfre o Santander) o buscás con otra garantía en Maldonado?";
  } else if (subtipo === "TRIAJE_DUAL_OPCION_3") {
    replyText =
      `Podés ver las opciones disponibles con precios hoy en ${LINKS_URL}\n` +
      "Buscás alquilar o comprar en otra zona, o tenés una propiedad para publicar con difusión abierta?";
    alertaAndon = true;
    motivoAndon = "Lead tocó Opción 3 (otra zona o captación): clasificar respuesta.";
  } else if (subtipo === "AUTOSERVICIO_GENERAL") {
    esPasiva = true;
    replyText =
      "Hola, gracias por comunicarte con ZAGUÁN Propiedades (Punta del Este y Maldonado).\n" +
      `En nuestros accesos directos podés ver propiedades disponibles, precios y condiciones sin esperar respuesta: ${LINKS_URL}\n` +
      "Si tenés una consulta puntual o una propiedad para publicar, dejá zona y tipo de operación por acá.";
  } else if (arbol) {
    replyText = arbol.tiempos[etapaSla] || arbol.tiempos.T0_INMEDIATO;
  } else {
    esPasiva = true;
    replyText =
      "Hola, gracias por comunicarte con ZAGUÁN Propiedades (Punta del Este y Maldonado).\n" +
      `En nuestros accesos directos podés ver propiedades disponibles, precios y condiciones sin esperar respuesta: ${LINKS_URL}\n` +
      "Si tenés una consulta puntual o una propiedad para publicar, dejá zona y tipo de operación por acá.";
  }

  const pk = aplicarPokaYokeMar(replyText, vertical, esPasiva, etapaSla);

  return {
    ok: true,
    vertical_14: vertical,
    subtipo,
    familia_cliente: familia,
    tipo_ficha: arbol?.tipo_ficha || "AUTOSERVICIO_GENERAL",
    etapa_sla: etapaSla,
    intent: spec.intent,
    replyText: pk.texto,
    reglas_freno: arbol?.reglas_freno || [],
    faltantes_capa_1: analisis.faltantes_capa_1,
    faltantes_capa_2: analisis.faltantes_capa_2,
    cruces_sugeridos: analisis.cruces_sugeridos,
    alerta_andon: alertaAndon,
    motivo_andon: motivoAndon,
    pokayoke_pass: pk.pokayoke_pass,
    pokayoke_violaciones: pk.violaciones,
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");
      const expectedToken = env?.META_VERIFY_TOKEN || "zaguan_wh_triage_2026";
      if (mode === "subscribe" && token === expectedToken) {
        return new Response(challenge, { status: 200 });
      }
      return new Response("Zaguán WhatsApp Triage 14V · OK", { status: 200 });
    }

    if (request.method === "POST") {
      try {
        const body = await request.json();
        const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
        const senderPhone = message?.from || body?.phone || "simulado";
        const text = (message?.text?.body || body?.text || "").trim();

        if (!text && !message) {
          return new Response(JSON.stringify({ ok: true, ignored: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        const etapaSla = body?.etapa_sla || "T0_INMEDIATO";
        const contextoPropiedad = body?.contexto_propiedad || "general";
        const resultado = clasificarYResponder(text, etapaSla, contextoPropiedad);

        let metaSent = false;
        if (message && env?.META_WHATSAPP_TOKEN && env?.META_PHONE_NUMBER_ID) {
          const r = await fetch(`https://graph.facebook.com/v21.0/${env.META_PHONE_NUMBER_ID}/messages`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.META_WHATSAPP_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: senderPhone,
              type: "text",
              text: { body: resultado.replyText },
            }),
          });
          metaSent = r.ok;
        }

        if (env?.NOTIFICATION_WEBHOOK && (message || resultado.alerta_andon)) {
          await fetch(env.NOTIFICATION_WEBHOOK, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              timestamp: new Date().toISOString(),
              phone: senderPhone,
              received_text: text,
              ...resultado,
              bot_replied: metaSent,
            }),
          }).catch(() => {});
        }

        return new Response(JSON.stringify({ ...resultado, phone: senderPhone, bot_replied: metaSent }), {
          status: 200,
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: err.message }), {
          status: 500,
          headers: { "content-type": "application/json" },
        });
      }
    }

    return new Response("Method not allowed", { status: 405 });
  },
};
