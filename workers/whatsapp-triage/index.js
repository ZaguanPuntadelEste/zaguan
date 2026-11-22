/**
 * Cloudflare Worker: WhatsApp Triage 14 Verticales · ZAGUÁN Propiedades
 * Motor determinista de clasificación (O1..O7 / D1..D7), detección de faltantes en 2 capas,
 * cruces latentes (ej. D7 -> O5 Santa Mónica) y Poka-Yoke de Mar + Candado de Franja Gris.
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
      "T0 hace 1 sola pregunta filtro (garantía aseguradora). Cantidad de personas y día van recién en Turno 2."
    ],
    tiempos: {
      T0_INMEDIATO: `Con esa aseguradora calificás para el apartamento a estrenar de 2 dormitorios en La Fortuna ($U 30.000/mes con gastos comunes, Wi-Fi, cochera fija y mascota pequeña).\nAcá tenés las fotos y condiciones completas: ${LA_FORTUNA_URL}\nQué día y horario te queda cómodo ir a verlo esta semana?`,
      T1_AMARILLO_20_MIN: "Si todavía estás tramitando la aseguradora o necesitás ver qué documentación pide Porto, Sura, Mapfre o Santander, avisame y te paso el requisito en 2 líneas.",
      T2_NARANJA_24_HS: "Hola, buen lunes. Te consulto corto por el apartamento de La Fortuna: contás con garantía aseguradora (Porto, Sura, Mapfre o Santander) para coordinar visita esta semana, o estás buscando con otra garantía / en otra zona?",
      TURNO_2_CALIFICADO: "Impecable. Para cuántas personas sería el alquiler y qué día y franja horaria te queda cómodo para ir a verlo?",
    },
  },
  FAMILIA_B_COMPRA_LOTE_PROYECTO: {
    codigo: "D3..D7 / O5",
    tipo_ficha: "TIPO_2_FRANJA_GRIS_DOBLE_FICHA_CON_BOVEDA_PRIVADA",
    ejemplo: "Santa Mónica · Proyecto en construcción (USD 160.000)",
    reglas_freno: [
      "Ticket USD 160.000 en los botones del anuncio; 0 promesa de 'ubicación exacta' y 0 Padrón público en T0.",
      "Usar el video completo (2m31s) y la cédula catastral de Bóveda Privada como filtro de intención/liquidez antes de entregar.",
      "En T2 activar el cruce latente D7 <-> O4/O1 (terreno libre vs. obra base ahorrando 12 meses de construcción)."
    ],
    tiempos: {
      T0_INMEDIATO: `Te comparto la ficha pública de Santa Mónica (lote propio 348 m², 201 m² en hormigón armado frente a la Laguna, USD 160.000): ${SANTA_MONICA_URL}\nPara pasarte el video completo de 2m31s y los datos catastrales con decreto vigente hasta dic. 2027: lo evaluás para vivienda propia o para inversión?`,
      T1_AMARILLO_30_MIN: "Viste el adelanto en la ficha de Santa Mónica? Si contás con fondos en USD para evaluar compra directa, avisame y te paso el video de 2m31s y el croquis por acá.",
      T2_NARANJA_24_HS: "Te consulto corto: te interesa que te envíe el video completo y el croquis de Santa Mónica (USD 160.000), o estás buscando terreno libre / casa terminada?",
      TURNO_2_CALIFICADO: "Los datos catastrales (según Bóveda Privada D1/PDF verificado) corresponden a terreno propio de 348 m² en régimen común, con 201 m² construidos en hormigón armado y DJCU vigente. Acá tenés el croquis base y el video completo del recorrido. Querés coordinar visita esta semana?",
    },
  },
  FAMILIA_C_POZO_DESARROLLADORA: {
    codigo: "D1 / O7",
    tipo_ficha: "TIPO_1_ABIERTA_FICHA_UNICA",
    ejemplo: "Betania IV / Nostrum Roosevelt / More Atlántico / Golden Rise / EVE Tower",
    reglas_freno: [
      "Ficha única 100% abierta (el desarrollador protege al cliente por protocolo de pre-registro).",
      "1 link a /proyectos/ + pregunta de tipología y necesidad de cuotas en obra."
    ],
    tiempos: {
      T0_INMEDIATO: `Podés ver los 5 desarrollos en pozo activos hoy (desde USD 79.800 en Maldonado y Punta del Este) en ${PROYECTOS_URL}\nQué tipología buscás (1, 2 o 3 dormitorios) y necesitás financiar en cuotas durante la obra?`,
      T1_AMARILLO_30_MIN: "Querés que te arme la comparativa directa de 2 unidades en obra con gastos de ocupación incluidos según tu tope de anticipo?",
      T2_NARANJA_24_HS: "Seguimos con listas vigentes en Punta del Este y Maldonado desde USD 79.800. Si me pasás tu rango de anticipo, te mando las 2 opciones con mejor retorno neto.",
      TURNO_2_CALIFICADO: "Excelente. Comprás como residente o desde el exterior (para pasarte los costos totales de cierre y dejar hecho el pre-registro formal)? Qué día te queda cómodo para verlo?",
    },
  },
  FAMILIA_D_DUENO_DIRECTO_CAPTACION: {
    codigo: "O1..O6",
    tipo_ficha: "CAPTACION_FRANJA_GRIS_SIN_EXCLUSIVIDAD",
    ejemplo: "Propietarios de Marketplace, Gallito e InfoCasas",
    reglas_freno: [
      "Prohibido mencionar %, honorarios o comisión en el 1° contacto.",
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

const VERTICAL_SPECS = {
  O1: {
    intent: "OFERTA_CASA",
    capa1: ["Ubicación / barrio", "Metros de terreno y edificados", "Precio en USD", "Estado documental / títulos", "Si acepta banco o permuta"],
    capa2: ["Quién construyó y características estructurales (ej. humedad, vientos oceánicos)", "Antigüedad real", "Planos y papeles del padrón en PDF", "Video completo si la casa está en etapa constructiva"],
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
    capa1: ["Zona / frente comercial", "Metros de planta y altura", "Habilitación y potencia eléctrica", "Precio en USD (o canon si alquila)"],
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
    capa1: ["Ubicación / entorno (ej. frente a laguna / costa)", "Avance real de obra y qué incluye", "Precio en USD y forma de pago por avance", "Metraje de terreno y construcción base"],
    capa2: ["Memoria estructural (ej. cálculo para vientos oceánicos y autoría)", "Croquis base del proyecto posible", "Antigüedad / fecha de inicio (audio)", "Permisos BPS / Intendencia y papeles en PDF", "Video completo de recorrido (clave cuando la foto fija muestra obra gris)"],
    cruces: ["D7", "D3"],
  },
  O6: {
    intent: "OFERTA_ALQUILER",
    capa1: ["Canon mensual en $U o USD", "Qué incluye (gastos comunes, Wi-Fi, consumos)", "Garantías aceptadas y rechazadas (Porto, Sura, Mapfre, Santander, ANDA, depósito)", "Mascotas y plazo"],
    capa2: ["Quién tiene llaves y horarios de visita", "Condiciones especiales del dueño", "Si cuenta con video de recorrido"],
    cruces: ["D2", "D3", "D4"],
  },
  O7: {
    intent: "OFERTA_DESARROLLADORA_POZO",
    capa1: ["Lista vigente y precio Desde USD", "Cronograma de cuotas (reserva, compromiso, obra, ocupación)", "Gastos de ocupación (%)", "Fecha de entrega"],
    capa2: ["Beneficios Ley 18.795", "Protocolo de pre-registro de interesados", "Disponibilidad por tipología"],
    cruces: ["D1", "D4", "D3"],
  },
  D1: {
    intent: "DEMANDA_POZO",
    capa1: ["Objetivo (renta vs. vivienda)", "Presupuesto y anticipo disponible en USD", "Necesidad de cuotas en obra / post-ocupación", "Zona preferida (Maldonado / Roosevelt / Brava)"],
    capa2: ["Residencia fiscal (local vs. exterior para estructuración notarial)", "Interés en exoneraciones Ley 18.795"],
    cruces: ["O7", "O5"],
  },
  D2: {
    intent: "DEMANDA_ALQUILER",
    capa1: ["Zona deseada", "Cantidad de dormitorios", "Tope mensual en $U o USD", "Garantía aprobada (Porto, Sura, Mapfre, Santander, ANDA, depósito)", "Fecha de ingreso y mascotas"],
    capa2: ["Disponibilidad de días/horarios para visita presencial", "Cantidad de personas"],
    cruces: ["O6"],
  },
  D3: {
    intent: "DEMANDA_CASA_HECHA",
    capa1: ["Zona / barrio (todo el año vs. verano)", "Dormitorios y metros de terreno", "Presupuesto USD y forma de pago (contado / banco)"],
    capa2: ["Tolerancia a reciclar vs. llave en mano", "Apertura a construcción avanzada / proyecto base (cruce O5)"],
    cruces: ["O1", "O5", "D7"],
  },
  D4: {
    intent: "DEMANDA_APTO_HECHO",
    capa1: ["Zona / parada", "Dormitorios y cochera", "Tope de gastos comunes", "Presupuesto USD y forma de pago"],
    capa2: ["Uso (vivir todo el año vs. renta)", "Apertura a entrega próxima en pozo con cuotas (cruce O7)"],
    cruces: ["O2", "O7"],
  },
  D5: {
    intent: "DEMANDA_LOTE",
    capa1: ["Zona deseada", "Metros mínimos", "Presupuesto USD", "Uso pensado (casa propia vs. desarrollo)"],
    capa2: ["Horizonte de inicio de obra", "Si evalúa construcción base ya implantada o casa a demoler/reciclar (cruce D7 -> O5)"],
    cruces: ["O4", "D7", "O5"],
  },
  D6: {
    intent: "DEMANDA_COMERCIAL",
    capa1: ["Rubro exacto (local, oficina, consultorio, gastronomía)", "Operación (alquiler vs. compra)", "Zona y metraje necesario"],
    capa2: ["Requisitos técnicos (vidriera, trifásica, estacionamiento, habilitación)"],
    cruces: ["O3", "O6", "O1"],
  },
  D7: {
    intent: "DEMANDA_LATENTE_LOTE_O_CONSTRUCCION_BASE",
    capa1: ["Presupuesto total (tierra + obra)", "Zona de interés (ej. Santa Mónica / La Barra / José Ignacio / Maldonado)", "Urgencia de uso o mudanza"],
    capa2: ["Apertura a tomar construcción base sólida lista para proyectar arriba (ahorra 12 meses de obra/permisos) o propiedad a reciclar/demoler"],
    cruces: ["O5", "O4", "O1"],
  },
};

function matchesAny(txt, patterns) {
  return patterns.some((p) => txt.includes(p));
}

export function clasificarVertical14(rawText) {
  const t = (rawText || "").toLowerCase();

  // Botones exactos de Meta Ads La Fortuna (ZAG-ALQ-05 · V2 Auto-Calificadores)
  if (
    t.includes("tengo porto, sura, mapfre o santander")
    || t.includes("tengo garantía aseguradora")
    || t.includes("tengo garantia aseguradora")
  ) {
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
  if (t.includes("busco en otra zona o tengo propiedad para publicar")) {
    return { vertical: "D2", subtipo: "TRIAJE_DUAL_OPCION_3" };
  }

  const esOferta = matchesAny(t, [
    "tengo propiedad", "tengo una propiedad", "tengo un depto", "tengo un apto",
    "tengo una casa", "tengo un terreno", "tengo un lote", "tengo un local",
    "para publicar", "quiero publicar", "habilito", "soy dueño", "soy dueno",
    "soy dueña", "soy duena", "alquilo mi", "vendo mi", "para darte", "ofrezco",
    "nos da pozo", "somos desarrolladora",
  ]);

  if (esOferta) {
    if (matchesAny(t, ["desarrolladora", "edificio en pozo", "torre en pozo"])) return { vertical: "O7", subtipo: "INBOUND_DESARROLLADORA" };
    if (matchesAny(t, ["alquilar", "alquiler", "inquilino", "alquilo"])) return { vertical: "O6", subtipo: "INBOUND_DUENO_ALQUILER" };
    if (matchesAny(t, ["a construir", "construccion base", "construcción base", "obra gris", "en obra", "proyecto de construccion", "proyecto de construcción", "santa monica", "santa mónica"])) {
      return { vertical: "O5", subtipo: "INBOUND_PROYECTO_CONSTRUCCION" };
    }
    if (matchesAny(t, ["terreno", "lote", "padrón", "padron"])) return { vertical: "O4", subtipo: "INBOUND_LOTE" };
    if (matchesAny(t, ["local", "oficina", "consultorio", "galpón", "galpon", "comercial"])) return { vertical: "O3", subtipo: "INBOUND_COMERCIAL" };
    if (matchesAny(t, ["apto", "apartamento", "depto", "departamento", "monoambiente"])) return { vertical: "O2", subtipo: "INBOUND_APTO" };
    return { vertical: "O1", subtipo: "INBOUND_CASA" };
  }

  // Demanda
  if (matchesAny(t, ["alquiler", "alquilo", "alquilar", "renta anual", "la fortuna", "ágata", "agata", "garantía", "garantia"])) {
    return { vertical: "D2", subtipo: "DEMANDA_ALQUILER_GENERAL" };
  }
  if (matchesAny(t, ["pozo", "betania", "nostrum", "more atlántico", "more atlantico", "golden rise", "eve tower", "cuotas de obra"])) {
    return { vertical: "D1", subtipo: "DEMANDA_POZO" };
  }
  if (matchesAny(t, ["local", "oficina", "consultorio", "negocio", "comercial"])) {
    return { vertical: "D6", subtipo: "DEMANDA_COMERCIAL" };
  }
  if (matchesAny(t, ["terreno", "lote", "para construir", "tirar abajo", "demoler", "a construir", "santa monica", "santa mónica", "laguna", "josé ignacio", "jose ignacio", "la barra"])) {
    const esLatente = matchesAny(t, ["para construir", "proyecto", "tirar abajo", "demoler", "reciclar", "santa monica", "santa mónica", "laguna", "la barra", "josé ignacio", "jose ignacio"]);
    return { vertical: esLatente ? "D7" : "D5", subtipo: esLatente ? "LATENTE_LOTE_PROYECTO" : "DEMANDA_LOTE" };
  }
  if (matchesAny(t, ["apto", "apartamento", "depto", "departamento", "monoambiente"])) {
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

  // Poka-Yoke: jamás incluir garantía en ventas/lotes/obras
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

  // 1. Eliminar apertura ¿ y ¡
  if (/[¿¡]/.test(out)) {
    out = out.replace(/[¿¡]/g, "");
  }

  // 2. Candado de Franja Gris: si el destinatario es dueño (O1..O6), bloquear links públicos de fichas individuales
  const esDueno = /^O[1-6]$/.test(vertical);
  if (esDueno) {
    const fichaUrlRe = /https?:\/\/zaguanpropiedades\.com\/(?:alquileres|ventas|proyectos|propiedades)\/[a-z0-9-]+\/?/gi;
    if (fichaUrlRe.test(out)) {
      violaciones.push("CANDADO_FRANJA_GRIS_URL_PUBLICA_A_DUENO");
      out = out.replace(fichaUrlRe, LINKS_URL);
    }
  }

  // 3. Candado de Demanda (D*): prohibido enviar pin GPS crudo, mencionar "con el dueño" o mandar 2+ links en T0
  if (/^D[1-7]$/.test(vertical)) {
    if (/(maps\.google\.com|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(out)) {
      violaciones.push("PIN_GPS_CRUDO_PROHIBIDO_EN_T0");
    }
    if (/con el due[nñ]o/i.test(out)) {
      violaciones.push("MENCION_DUENO_PROHIBIDA_EN_DEMANDA");
    }
    const urls = out.match(/https?:\/\/[^\s]+/gi) || [];
    if (etapaSla === "T0_INMEDIATO" && urls.length > 1) {
      violaciones.push("DOS_O_MAS_LINKS_EN_T0");
    }
  }

  // 4. Prohibido preguntar garantías en ventas (O1..O5, O7, D1, D3..D7)
  if (!["O6", "D2"].includes(vertical) && /\b(porto|sura|mapfre|anda|cgn|garant[ií]a aseguradora)\b/i.test(out)) {
    violaciones.push("GARANTIA_EN_VERTICAL_NO_ALQUILER");
  }

  // 5. Linter SÍ/NO: cero adverbios en -mente y cero "encajar"
  if (/\b[a-záéíóúüñ]+mente\b/i.test(out)) {
    violaciones.push("ADVERBIO_MENTE");
  }
  if (/\bencajar\b/i.test(out)) {
    violaciones.push("PALABRA_PROHIBIDA_ENCAJAR");
  }

  // 6. Prohibido prometer respuesta inmediata, saludo genérico o cierre pasivo en seguimiento
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
  if (subtipo === "TRIAJE_DUAL_OPCION_3") return "TRIAJE_DUAL";
  if (vertical === "D2") return "FAMILIA_A_ALQUILER_ANUAL";
  if (["D3", "D4", "D5", "D6", "D7"].includes(vertical)) return "FAMILIA_B_COMPRA_LOTE_PROYECTO";
  if (vertical === "D1") return "FAMILIA_C_POZO_DESARROLLADORA";
  if (/^O[1-6]$/.test(vertical)) return "FAMILIA_D_DUENO_DIRECTO_CAPTACION";
  return "FAMILIA_A_ALQUILER_ANUAL";
}

export function clasificarYResponder(rawText, etapaSla = "T0_INMEDIATO") {
  const { vertical, subtipo } = clasificarVertical14(rawText);
  const spec = VERTICAL_SPECS[vertical] || VERTICAL_SPECS.D2;
  const analisis = detectarFaltantes(vertical, rawText);
  const familia = seleccionarFamiliaArbol(vertical, subtipo);
  const arbol = ARBOL_ESTRATEGICO_SEMAFORO[familia] || null;
  let replyText = "";
  let alertaAndon = false;
  let motivoAndon = "";
  let esPasiva = false;

  if (subtipo === "LA_FORTUNA_VISITA_FILTRADA") {
    replyText =
      "Con esa aseguradora calificás para el apartamento a estrenar de 2 dormitorios en La Fortuna ($U 30.000/mes con gastos comunes, Wi-Fi, cochera fija y mascota pequeña).\n" +
      `Acá tenés las fotos y condiciones completas: ${LA_FORTUNA_URL}\n` +
      "Qué día y horario te queda cómodo ir a verlo esta semana?";
    alertaAndon = true;
    motivoAndon = "Lead Meta Ads La Fortuna ya declaró aseguradora activa (Botón 1): listo para coordinar visita (MP-12).";
  } else if (subtipo === "LA_FORTUNA_INGRESOS_TRAMITE") {
    replyText =
      `Acá ves fotos y condiciones de La Fortuna ($U 30.000/mes con gastos comunes, Wi-Fi y cochera): ${LA_FORTUNA_URL}\n` +
      "Porto, Sura, Mapfre y Santander aprueban en 24 a 48 hs con recibo o certificación de ingresos. Querés que te indique qué te piden para pre-aprobarla y visitar?";
    alertaAndon = true;
    motivoAndon = "Lead Meta Ads La Fortuna calificable con ingresos (Botón 2): acompañar pre-aprobación aseguradora.";
  } else if (subtipo === "LA_FORTUNA_OTRA_GARANTIA") {
    replyText =
      "En La Fortuna se trabaja con póliza de aseguradora, aunque relevamos opciones en otras zonas y garantías de Maldonado además de publicar propiedades con difusión abierta.\n" +
      "Buscás alquilar en otro barrio o rango (indicanos zona, garantía y tope), o tenés una propiedad para publicar?";
    alertaAndon = true;
    motivoAndon = "Lead Meta Ads Botón 3 (ANDA/CGN/otra zona o captación): derivar a cartera D2 sin quemar La Fortuna.";
  } else if (subtipo === "LA_FORTUNA_FICHA") {
    replyText =
      ARBOL_ESTRATEGICO_SEMAFORO.FAMILIA_A_ALQUILER_ANUAL.tiempos[etapaSla]
      || ARBOL_ESTRATEGICO_SEMAFORO.FAMILIA_A_ALQUILER_ANUAL.tiempos.T0_INMEDIATO;
    if (etapaSla !== "T0_INMEDIATO") {
      alertaAndon = true;
      motivoAndon = `Lead La Fortuna en seguimiento ${etapaSla} (activar rescate 1 pregunta sin repetir 2 links).`;
    }
  } else if (subtipo === "TRIAJE_DUAL_OPCION_3") {
    replyText =
      `Podés ver las opciones disponibles con precios hoy en ${LINKS_URL}\n` +
      "Buscás alquilar/comprar en otra zona, o tenés una propiedad para publicar sin exclusividad?";
    alertaAndon = true;
    motivoAndon = "Lead tocó Opción 3 (otra zona o captación de propiedad); requiere clasificación al responder.";
  } else if (vertical === "D7" || (["D3", "D4", "D5"].includes(vertical) && /santa m[oó]nica|laguna|jos[eé] ignacio/i.test(rawText || ""))) {
    replyText =
      ARBOL_ESTRATEGICO_SEMAFORO.FAMILIA_B_COMPRA_LOTE_PROYECTO.tiempos[etapaSla]
      || ARBOL_ESTRATEGICO_SEMAFORO.FAMILIA_B_COMPRA_LOTE_PROYECTO.tiempos.T0_INMEDIATO;
    alertaAndon = true;
    motivoAndon = "Familia B (Compra / Lote / Proyecto O5) · cruce latente con video 2m31s y Bóveda Privada.";
  } else if (/^O[1-6]$/.test(vertical)) {
    const tiemposD = ARBOL_ESTRATEGICO_SEMAFORO.FAMILIA_D_DUENO_DIRECTO_CAPTACION.tiempos;
    replyText = tiemposD[etapaSla] || tiemposD.T0_INMEDIATO;
    alertaAndon = true;
    motivoAndon = `Familia D · Alta inbound de propietario (${vertical}): pasar a Master CSV y Bienvenida de OKs bajo Candado Franja Gris.`;
  } else if (vertical === "D1") {
    const tiemposC = ARBOL_ESTRATEGICO_SEMAFORO.FAMILIA_C_POZO_DESARROLLADORA.tiempos;
    replyText = tiemposC[etapaSla] || tiemposC.T0_INMEDIATO;
  } else if (vertical === "D2" && subtipo === "DEMANDA_ALQUILER_GENERAL") {
    if (etapaSla !== "T0_INMEDIATO") {
      replyText = ARBOL_ESTRATEGICO_SEMAFORO.FAMILIA_A_ALQUILER_ANUAL.tiempos[etapaSla];
    } else {
      replyText =
        `Podés ver las fichas de alquiler anual activas hoy en ${ALQUILERES_URL}\n` +
        "Contás con garantía de aseguradora aprobada (Porto, Sura, Mapfre o Santander) o buscás con otra garantía en Maldonado?";
    }
  } else if (arbol) {
    replyText = arbol.tiempos[etapaSla] || arbol.tiempos.T0_INMEDIATO;
  } else {
    esPasiva = true;
    replyText =
      "Hola, gracias por comunicarte con ZAGUÁN Propiedades (Punta del Este y Maldonado).\n" +
      `En nuestros accesos podés ver propiedades disponibles, precios y condiciones sin esperar respuesta: ${LINKS_URL}\n` +
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

    // 1. Verificación Webhook Meta (GET)
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

    // 2. Procesamiento de mensajes (POST Meta Webhook o simulación JSON directa)
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
        const resultado = clasificarYResponder(text, etapaSla);

        // Envío por WhatsApp Cloud API / Coexistence si el token está montado y no es simulación
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

        // Notificación Andon hacia webhook / Aprobalo Telegram si está configurado
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
