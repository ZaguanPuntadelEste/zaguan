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
      T0_INMEDIATO: `Con esa aseguradora calificás para el apartamento en La Fortuna ($U 30.000/mes con gastos comunes, Wi-Fi y cochera; capacidad máxima hasta 4 personas y mascota de raza pequeña).\nAcá ves fotos y ficha: ${LA_FORTUNA_URL}?utm_source=whatsapp&utm_medium=mar\nQué día y horario te sirve visitar esta semana?`,
      T1_DESTRABE_5_MIN: "Pudiste revisar las fotos de la ficha, o preferís que evaluemos opciones similares en otro rango o zona?",
      T1_AMARILLO_20_MIN: "Si todavía estás tramitando la aseguradora o necesitás ayuda con nuestra gestión ZAGUÁN, avisame qué ingresos manejás y lo vemos en 2 líneas.",
      T2_NARANJA_24_HS: "Hola, buenas tardes. Por si seguís buscando alquiler anual en Maldonado o Punta del Este: para este martes estamos armando las visitas del apartamento de 2 dormitorios a estrenar en La Fortuna ($U 30.000 con gastos comunes, Wi-Fi y cochera incluidos), y acá podés revisar otras opciones anuales por zona y novedades de ZAGUÁN: https://zaguanpropiedades.com/alquileres/?utm_source=whatsapp&utm_medium=mar · Contás con garantía aseguradora (Porto, Sura, Mapfre o Santander) o buscás con otra garantía / en otro barrio?",
      TURNO_2_CALIFICADO: "Excelente. Para cuántas personas sería el alquiler y qué día y franja horaria te queda cómodo para ir a verlo?",
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
    tipo_ficha: "CAPTACION_FRANJA_GRIS_ABIERTA",
    ejemplo: "Propietarios de Marketplace, Gallito e InfoCasas",
    reglas_freno: [
      "Prohibido mencionar %, honorarios o comisión en el 1° contacto en frío.",
      "Prohibido usar la frase 'sin exclusividad'.",
      "Prohibido enviar URL de ficha pública individual al dueño ni antes ni después.",
      "Garantías aseguradoras solo si es alquiler (O6), nunca en ventas (O1..O5).",
      "Relevar siempre capacidad máxima de personas y mascotas (y porte) (Capa 1/2)."
    ],
    tiempos: {
      T0_INMEDIATO: "Hola, cómo estás? Te escribe Mar, de ZAGUÁN Propiedades. Trabajamos en Punta del Este y Maldonado con publicación abierta y filtro previo de interesados antes de cada visita. Tu propiedad sigue disponible para confirmarnos barrio y valor pretendido?",
      T1_AMARILLO_2_HS: "Si te queda más cómodo, podés mandarme un audio corto contándome metros, estado y condiciones principales de tu propiedad para cruzarlo con búsquedas activas hoy.",
      T2_NARANJA_24_HS: "Seguimos recibiendo consultas en la zona. Cuando puedas pasame esos datos mínimos y la sumamos a nuestra carpeta abierta.",
      TURNO_2_CALIFICADO: "Recibido. Para armar nuestra carpeta interna (cuidando los datos sensibles antes de publicar), podés enviarnos por acá el PDF catastral / DJCU si lo tenés a mano, video de recorrido y confirmarnos qué horarios sirven para visitas?",
    },
  },
};

export const BANCO_RESPUESTAS_ESTANDAR = [
  { id: "LF-HOLA", area: "La Fortuna · Meta Ads", titulo: "Escribe solo 'Hola' desde el aviso", contexto: "la_fortuna", ejemploInput: "Hola" },
  { id: "LF-B1", area: "La Fortuna · Meta Ads", titulo: "Botón 1 · Ya tiene póliza aseguradora", contexto: "la_fortuna", ejemploInput: "Tengo Porto, Sura, Mapfre o Santander: quiero ver ficha y visitar" },
  { id: "LF-B2", area: "La Fortuna · Meta Ads", titulo: "Botón 2 · Ingresos para tramitar aseguradora", contexto: "la_fortuna", ejemploInput: "Tengo ingresos para tramitar aseguradora y quiero ver la ficha" },
  { id: "LF-B3", area: "La Fortuna · Meta Ads", titulo: "Botón 3 · ANDA/CGN u otra zona / Dueño", contexto: "la_fortuna", ejemploInput: "Busco con ANDA/CGN, en otra zona o tengo propiedad para publicar" },
  { id: "LF-NINOS", area: "La Fortuna · Caso Lianet T1", titulo: "Objeción niños (ya lo visitó antes)", contexto: "la_fortuna", ejemploInput: "Ya esa yo la fui a ver y me dijeron que el dueño no quería niños" },
  { id: "LF-COMP", area: "La Fortuna · Caso Lianet T2", titulo: "Espera otro apto / cita mañana 11 hs", contexto: "la_fortuna", ejemploInput: "Estoy en espera de otro apto, mañana a las 11 tengo la cita" },
  { id: "LF-CITA", area: "La Fortuna · Turno 2", titulo: "Propone día y hora de visita", contexto: "la_fortuna", ejemploInput: "Puedo ir el martes a las 11 hs" },
  { id: "LF-GC", area: "La Fortuna · Objeción", titulo: "Cuánto son los gastos comunes / qué incluye", contexto: "la_fortuna", ejemploInput: "Cuánto son los gastos comunes aparte del alquiler?" },
  { id: "LF-MASC", area: "La Fortuna · Objeción", titulo: "Mascota mediana o grande", contexto: "la_fortuna", ejemploInput: "Tengo un perro mediano, aceptan mascotas?" },
  { id: "LF-DIR", area: "La Fortuna · Objeción", titulo: "Pide dirección exacta y número de puerta", contexto: "la_fortuna", ejemploInput: "Me pasás la dirección exacta y el número de puerta para pasar a verlo?" },
  { id: "LF-REQ", area: "La Fortuna · Objeción", titulo: "Requisitos y costos de ingreso (+ IVA)", contexto: "la_fortuna", ejemploInput: "Cuánto piden de depósito o comisión para entrar y qué requisitos piden?" },
  { id: "LF-PAR", area: "La Fortuna · Turno 2", titulo: "Suma ingresos de pareja para aseguradora", contexto: "la_fortuna", ejemploInput: "Con mi pareja sumamos $U 95.000 en recibos, llegamos para Porto o Sura?" },
  { id: "LF-TEMP", area: "Alquiler · Borde", titulo: "Pregunta por verano / quincena", contexto: "general", ejemploInput: "Lo alquilan solo por enero o quincena de verano?" },
  { id: "RB-T1-2027", area: "Rama B · Búsqueda Abierta", titulo: "Turno 1 · 2027 / $40k Punta del Este", contexto: "la_fortuna", ejemploInput: "Busco alquiler anual para el 2027, tendrías opciones? En punta del este, hasta 40mil al mes" },
  { id: "RB-T2-PASO3", area: "Rama B · Búsqueda Abierta", titulo: "Turno 2 (Paso 3) · Da mes y 2 personas", contexto: "general", ejemploInput: "Sería para mudarnos en abril, somos 2 personas" },
  { id: "RB-MASC", area: "Rama B · Mascota", titulo: "Dice tengo mascota -> Qué mascota tenés?", contexto: "general", ejemploInput: "Sí, tengo mascota y necesito cochera" },
  { id: "RB-3Q", area: "Rama B · 3 Preguntas Cortas", titulo: "Adelanta mes, personas y cochera -> 3 preguntas en negrita", contexto: "general", ejemploInput: "Sería para marzo 2027, 2 o 3 dormitorios con cochera en Punta del Este" },
  { id: "RB-T3-GAR", area: "Rama B · Garantía", titulo: "Turno 3 (Paso 2) · Comodidades OK -> Pide Garantía", contexto: "general", ejemploInput: "No tengo mascota, necesito cochera y que esté amoblado" },
  { id: "RB-CIERRE", area: "Rama B · Cierre Completo", titulo: "Completa datos -> Cierre con cursiva y pregunta nombre", contexto: "general", ejemploInput: "Para marzo 2027, 2 o 3 dormitorios con cochera en Pinares hasta 40mil, sin muebles, con 1 perro y garantía depósito o aseguradora" },
  { id: "GAR-EFEC", area: "Árbol Garantía", titulo: "Sin garantía / solo efectivo o depósito", contexto: "general", ejemploInput: "No tengo garantía, pago solo efectivo o depósito" },
  { id: "GAR-DEP", area: "Árbol Garantía", titulo: "Relación de dependencia (3 recibos + 30%)", contexto: "general", ejemploInput: "Trabajo en relación de dependencia en una empresa" },
  { id: "GAR-IND", area: "Árbol Garantía", titulo: "Independiente / Unipersonal (BPS + DGI)", contexto: "general", ejemploInput: "Trabajo de forma independiente con unipersonal" },
  { id: "GAR-EXT", area: "Árbol Garantía", titulo: "Cobra en el exterior / Extranjero", contexto: "general", ejemploInput: "Trabajo para afuera y cobro en el exterior" },
  { id: "INV-ANUAL", area: "Invernal vs. Anual", titulo: "Pide marzo a noviembre o todo el año", contexto: "general", ejemploInput: "Busco alquiler de marzo a noviembre para probar invierno o capaz todo el año" },
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
  { id: "DUE-PUB", area: "Dueños · Captación", titulo: "Dueño puro: tiene propiedad para publicar", contexto: "general", ejemploInput: "Tengo una casa en Maldonado para publicar" },
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
    capa1: ["Canon mensual en $U o USD", "Qué incluye (gastos comunes, Wi-Fi, consumos)", "Garantías aceptadas y rechazadas (Porto, Sura, Mapfre, Santander, ANDA, depósito)", "Niños y mascotas admitidos (condición verificada con propietario para ficha pública/privada)", "Plazo contractual"],
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
  const m = String(rawText || "").match(/(?:este\s+|el\s+)?(?:lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo|ma[nñ]ana|hoy|esta semana)(?:\s+(?:(?:por\s+la|de)\s+(?:ma[nñ]ana|tarde)|a\s+las\s+\d{1,2}(?::\d{2})?\s*(?:hs|h)?))?/i);
  return m ? m[0].trim() : null;
}

function _capWord(str) {
  const s = String(str || "").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

export function extraerVariablesSilenciosasB2C(rawText = "", prev = {}) {
  const text = String(rawText || "");
  const norm = _normTriageStr(text);

  // 1. Presupuesto declarado y elástico (+7.5% · con y sin GC)
  let presu = prev.presupuesto_declarado ? Number(prev.presupuesto_declarado) : null;
  let moneda = prev.moneda || "UYU";

  // Limpiar años (2025..2035) antes de buscar montos numéricos
  const textSinAnios = text.replace(/\b20(?:2[5-9]|3\d)\b/g, " ");
  const mUsd = textSinAnios.match(/(?:usd|u\$s|us\$|d[oó]lares?)\s*([\d.,]+)/i)
    || textSinAnios.match(/([\d.,]+)\s*(?:usd|u\$s|d[oó]lares?)/i);
  const mPesos = textSinAnios.match(/(?:hasta|\$u|\$|\buyu)\s*([\d.,]+)\s*(mil)?/i)
    || textSinAnios.match(/([\d.,]+)\s*(?:mil\b|pesos)/i);

  if (mUsd) {
    const val = parseFloat(mUsd[1].replace(/\./g, "").replace(",", "."));
    if (Number.isFinite(val) && val > 0) {
      presu = val;
      moneda = "USD";
    }
  } else if (mPesos) {
    let val = parseFloat(mPesos[1].replace(/\./g, "").replace(",", "."));
    if (/\bmil\b/i.test(mPesos[0]) && val < 500) val *= 1000;
    else if (val > 0 && val < 250 && /hasta/i.test(mPesos[0])) val *= 1000;
    if (Number.isFinite(val) && val > 0) {
      presu = val;
      moneda = "UYU";
    }
  }

  const presupuestoDeclarado = presu && Number.isFinite(presu) ? presu : null;
  const presupuestoElasticoMax = presupuestoDeclarado ? Math.round(presupuestoDeclarado * 1.075) : null;
  const modalidadGc = "con_y_sin_gc";

  // 2. Contrato Anual vs. Invernal y Mes de Mudanza
  const mesMatch = norm.match(/\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|setiembre|septiembre|octubre|noviembre|diciembre)\b/);
  const isEntrarYa = /\b(entrar\s+ya|para\s+ya|inmediato|este\s+mes|ahora\s+mismo|lo\s+antes\s+posible|ya\s+mismo|mudarnos\s+ya|mudarme\s+ya)\b/i.test(norm);
  const yearMatch = text.match(/\b(202[6-9]|203\d)\b/);
  const isMasAdelante = /\b(mas\s+adelante|otra\s+fecha|futuro|contrato\s+vence)\b/i.test(norm) || Boolean(yearMatch);

  const isInvernal = /\b(invernal|invierno|marzo\s+a\s+noviembre|marzo\s*[-–]\s*noviembre|mar\s+a\s+nov)\b/i.test(norm);
  const isAnual = /\b(anual|todo\s+el\s+ano|12\s*meses)\b/i.test(norm);
  const isTemporadaVerano = /\b(quincena|vacaciones|por\s+d[ií]a|primera\s+quincena|segunda\s+quincena|alquiler\s+temporal|alquiler\s+de\s+verano)\b/i.test(norm) && !isAnual && !isInvernal;
  let modalidadContrato = prev.modalidad_contrato || "Anual";
  let mezclaInvernalAnual = Boolean(prev.mezcla_invernal_anual);
  if (isInvernal && isAnual) {
    modalidadContrato = "Anual / Invernal";
    mezclaInvernalAnual = true;
  } else if (isInvernal) {
    modalidadContrato = "Invernal (Marzo a Noviembre)";
  } else if (isAnual) {
    modalidadContrato = "Anual (12 meses)";
  }

  let mesMudanza = prev.mes_mudanza || null;
  if (isEntrarYa) mesMudanza = "Entrar ya";
  else if (mesMatch && !isInvernal && !isTemporadaVerano) mesMudanza = _capWord(mesMatch[1]);
  else if (/\bcontrato\s+vence\s+en\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|setiembre|septiembre|octubre|noviembre|diciembre)\b/i.test(norm)) {
    const mv = norm.match(/\bcontrato\s+vence\s+en\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|setiembre|septiembre|octubre|noviembre|diciembre)\b/i);
    if (mv) mesMudanza = _capWord(mv[1]);
  }
  const prevYearMatch = String(prev.desde_cuando || "").match(/\b(202[6-9]|203\d)\b/);
  const effectiveYear = yearMatch?.[1] || prevYearMatch?.[1] || null;
  const desdeCuando = mesMudanza
    ? (effectiveYear && !isEntrarYa && !mesMudanza.includes(effectiveYear) ? `${mesMudanza} ${effectiveYear}` : mesMudanza)
    : (effectiveYear ? `Año ${effectiveYear} (mes a definir)` : prev.desde_cuando || null);

  // 3. Personas y dormitorios abiertos
  let dormsMin = prev.dormitorios_min !== undefined && prev.dormitorios_min !== null ? Number(prev.dormitorios_min) : null;
  let dormsAbiertos = prev.dormitorios_abiertos || null;
  let personas = prev.personas_cantidad || null;

  const dormExact = norm.match(/\b(\d+)\s*(?:o\s*(\d+)\s*)?(?:dormitorios?|dorm\b|d\b|ambientes?)\b/);
  if (/\bmonoambiente\b/i.test(norm)) {
    dormsMin = 0;
    dormsAbiertos = dormExact ? "Monoambiente, 1 y 2 dormitorios" : "Monoambiente";
  } else if (dormExact) {
    dormsMin = parseInt(dormExact[1], 10);
    dormsAbiertos = dormExact[2] ? `${dormExact[1]} y ${dormExact[2]} dormitorios` : `${dormExact[1]} dormitorio${dormsMin > 1 ? "s" : ""}`;
  }

  const persMatch = norm.match(/\b(1\s*o\s*2\s*personas|una\s+persona|solo\s+para\s+mi|somos\s*\d+|para\s*\d+\s*personas?|\d+\s*personas?|\d+\s*adult[oa]s?(?:\s+y\s+\d+\s*(?:ni[nñ]os?|ninos?|chicos?|hijos?))?|(?:con\s+)?(?:\d+|dos|tres|cuatro)\s+(?:ni[nñ]os?|ninos?|chicos?|hijos?)(?:\s+de\s+\d+(?:\s+y\s+\d+)?(?:\s+a[nñ]os?)?)?|mi\s+marido\s+y\s+yo|mi\s+pareja(?:\s+y\s+yo)?)\b/);
  if (persMatch) {
    personas = persMatch[1];
    if (!dormsAbiertos) {
      if (/3|4|dos|tres|cuatro|familia|chicos|hijos|ninos|niños/.test(personas)) {
        dormsMin = 2;
        dormsAbiertos = "2 y 3 dormitorios";
      } else {
        dormsMin = 0;
        dormsAbiertos = "Monoambiente, 1 y 2 dormitorios";
      }
    }
  }

  // 4. Amoblado y Comodidades
  let amobladoPref = prev.amoblado_preferencia || "amoblado_y_sin_muebles";
  let amobladoExplicito = Boolean(prev.amoblado_explicito);
  if (/\b(me da igual|cualquiera de los dos|indistinto|no excluyente|sirve sin muebles|con o sin muebles)\b/i.test(norm)) {
    amobladoPref = "amoblado_y_sin_muebles";
    amobladoExplicito = true;
  } else if (/\b(amoblad[oa]|con muebles|equipad[oa])\b/i.test(norm)) {
    amobladoPref = "amoblado";
    amobladoExplicito = true;
  } else if (/\b(sin muebles|vaci[oa]|desamoblad[oa])\b/i.test(norm)) {
    amobladoPref = "sin_muebles";
    amobladoExplicito = true;
  }

  const comods = new Set(String(prev.comodidades_pedidas || "").split(/[,|]+/).map((x) => x.trim()).filter(Boolean));
  if (/\bcochera|garaje|estacionamiento\b/i.test(norm)) comods.add("Cochera");
  if (/\bpatio|jardin|fondo\b/i.test(norm)) comods.add("Patio");
  if (/\b(parrillero|churrasquero|barbacoa|quincho)\b/i.test(norm)) comods.add("Parrillero");
  if (/\b(fondo\s+cercado|patio\s+cercado|cercado|perimetral)\b/i.test(norm)) comods.add("Fondo cercado");
  if (/\b(estufa\s+a\s+lena|chimenea|hogar)\b/i.test(norm)) comods.add("Estufa a leña");
  if (/\b(terraza|balcon)\b/i.test(norm)) comods.add("Terraza / Balcón");
  if (/\b(piscina|pileta)\b/i.test(norm)) comods.add("Piscina");
  if (/\b(aire\s+acondicionado|split)\b/i.test(norm)) comods.add("Aire acondicionado");
  if (/\blavadero\b/i.test(norm)) comods.add("Lavadero");
  if (/\bamoblad[oa]\b/i.test(norm)) comods.add("Amoblado");
  if (/\bsin muebles\b/i.test(norm)) comods.add("Sin muebles");
  const comodidadesRespondidas = comods.size > 0 || /\b(sin comodidades|ninguna comodidad|me da igual)\b/i.test(norm) || Boolean(prev.comodidades_respondidas);

  // 5. Mascota
  let tieneMascota = prev.tiene_mascota || null;
  let mascotaDetalle = prev.mascota_detalle || null;
  if (/\b(no\s+tengo\s+mascota|sin\s+mascota|no\s+tenemos\s+mascota|ninguna\s+mascota)\b/i.test(norm)) {
    tieneMascota = "no";
    mascotaDetalle = "Sin mascota";
  } else {
    const detMatch = norm.match(/\b((?:perro|perrito|perra|cachorro)\s*(?:chico|pequeno|mediano|grande)?|(?:gato|gatito|gata)\s*(?:chico|grande)?|caniche|bulldog|labrador|golden|\d+\s*(?:perros?|gatos?))\b/i);
    if (detMatch) {
      tieneMascota = "si";
      mascotaDetalle = _capWord(detMatch[1]);
    } else if (/\b(tengo\s+mascota|con\s+mascota|si,\s*tengo\s+mascota|hay\s+mascota)\b/i.test(norm)) {
      tieneMascota = "si";
    }
  }

  // 6. Zona (Punta del Este abierta + Maldonado)
  let zonaPreferida = prev.zona_preferida || null;
  let zonaDisplay = prev.zona_display || null;
  const barrios = [
    ["la fortuna", "La Fortuna"],
    ["pinares", "Pinares"],
    ["roosevelt", "Roosevelt"],
    ["aidy grill", "Aidy Grill"],
    ["la barra", "La Barra"],
    ["el tesoro", "El Tesoro"],
    ["manantiales", "Manantiales"],
    ["playa brava", "Playa Brava"],
    ["playa mansa", "Playa Mansa"],
    ["peninsula", "Península"],
    ["cantegril", "Cantegril"],
    ["maldonado centro", "Maldonado Centro"],
    ["san rafael", "San Rafael"],
  ];
  const matchedBarrio = barrios.find(([pat]) => norm.includes(pat));
  if (matchedBarrio) {
    zonaDisplay = matchedBarrio[1];
    zonaPreferida = matchedBarrio[1];
  } else if (norm.includes("punta del este")) {
    zonaDisplay = "Punta del Este";
    zonaPreferida = "Punta del Este (abierto + Maldonado próximo)";
  } else if (norm.includes("maldonado")) {
    zonaDisplay = "Maldonado";
    zonaPreferida = "Maldonado";
  }

  // 7. Garantía y Situación Laboral
  let garantiaTipo = prev.garantia_tipo || null;
  let garantiaDisp = prev.garantia_disponible || null;
  let situacionLaboral = prev.situacion_laboral || null;
  let mesesDeposito = prev.meses_deposito || null;

  const asegList = ["Porto", "Sura", "Mapfre", "Santander", "BSE"].filter((g) => norm.includes(g.toLowerCase()));
  if (/\bdeposito\b/i.test(norm) && (asegList.length > 0 || /\b(aseguradora|poliza)\b/i.test(norm))) {
    garantiaTipo = "deposito_o_aseguradora";
    garantiaDisp = "Depósito o aseguradora";
  } else if (asegList.length > 0 || /\b(aseguradora|poliza)\b/i.test(norm)) {
    garantiaTipo = "aseguradora";
    garantiaDisp = asegList.length ? asegList.join(", ") : "Aseguradora";
  } else if (/\b(anda|cgn|contaduria)\b/i.test(norm)) {
    garantiaTipo = "anda_cgn";
    garantiaDisp = "ANDA / CGN";
  } else if (/\b(no\s+tengo\s+garant|sin\s+garant|solo\s+efectivo|tengo\s+efectivo|solo\s+deposito|con\s+deposito|garantia\s+deposito|puedo\s+pagar\s+deposito)\b/i.test(norm)) {
    garantiaTipo = "sin_garantia_o_deposito";
    garantiaDisp = "Depósito en garantía";
  }

  if (/\b(relacion\s+de\s+dependencia|empleado|en\s+planilla|recibo\s+de\s+sueldo|recibos\s+de\s+sueldo)\b/i.test(norm) && !/\bno\s+tengo\s+recibo/i.test(norm)) {
    situacionLaboral = "relacion_dependencia";
  } else if (/\b(independiente|unipersonal|monotributo|facturo|por\s+mi\s+cuenta)\b/i.test(norm)) {
    situacionLaboral = "independiente";
  } else if (/\b(exterior|para\s+afuera|cobro\s+afuera|extranjero|remoto\s+afuera)\b/i.test(norm)) {
    situacionLaboral = "exterior";
  } else if (/\b(no\s+tengo\s+ingresos\s+demostrables|sin\s+ingresos\s+demostrables|no\s+tengo\s+recibo|informal)\b/i.test(norm)) {
    situacionLaboral = "sin_ingresos_demostrables";
  }

  const mDep = norm.match(/\b(\d+)\s*mes(?:es)?\s*(?:de\s*)?deposito\b/);
  if (mDep) {
    mesesDeposito = parseInt(mDep[1], 10);
    garantiaTipo = "deposito";
    garantiaDisp = `Depósito (${mesesDeposito} meses)`;
  }

  return {
    nombre: prev.nombre || null,
    estado_conversacion: prev.estado_conversacion || null,
    estado_busqueda: prev.estado_busqueda || "caza_activa_hoy",
    hito_expectativa_cliente: prev.hito_expectativa_cliente || null,
    rama_conversacion: prev.rama_conversacion || null,
    paso_actual: prev.paso_actual || null,
    presupuesto_declarado: presupuestoDeclarado,
    presupuesto_elastico_max: presupuestoElasticoMax,
    presupuesto_max: presupuestoDeclarado || prev.presupuesto_max || null,
    moneda,
    modalidad_gc: modalidadGc,
    modalidad_contrato: modalidadContrato,
    mezcla_invernal_anual: mezclaInvernalAnual,
    mes_mudanza: mesMudanza,
    desde_cuando: desdeCuando,
    es_futuro_o_abierto: isMasAdelante || isInvernal || /\btendrias\s+opciones\b|\bhasta\s+\d+/.test(norm),
    personas_cantidad: personas,
    dormitorios_min: dormsMin,
    dormitorios_abiertos: dormsAbiertos,
    amoblado_preferencia: amobladoPref,
    amoblado_explicito: amobladoExplicito,
    comodidades_pedidas: [...comods].join(", ") || null,
    comodidades_respondidas: comodidadesRespondidas,
    tiene_mascota: tieneMascota,
    mascota_detalle: mascotaDetalle,
    zona_preferida: zonaPreferida,
    zona_display: zonaDisplay,
    garantia_tipo: garantiaTipo,
    garantia_disponible: garantiaDisp,
    situacion_laboral: situacionLaboral,
    meses_deposito: mesesDeposito,
  };
}

export function clasificarVertical14(rawText, contextoPropiedad = "general", leadState = null) {
  const t = (rawText || "").toLowerCase();
  const ctx = (contextoPropiedad || "general").toLowerCase();

  // 0. Cierre negativo / rechazo educado ("ya señé", "ya alquilé", "ya conseguí")
  if (matchesAny(t, ["ya señé", "ya señe", "ya alquilé", "ya alquile", "ya conseguí", "ya consegui", "ya compré", "ya compre", "ya vendí", "ya vendi", "no me interesa"])) {
    const v = ctx === "dueno" ? "O6" : (ctx === "santa_monica" ? "D3" : "D2");
    return { vertical: v, subtipo: "CIERRE_NEGATIVO_EDUCADO" };
  }

  // 0a-bis. Post-Cierre Puerta Abierta (busqueda_activa_abierta) -> Suma Incremental T_ADD_DETAIL sin resetear a T0
  const enBusquedaActivaAbierta = Boolean(
    leadState && (
      leadState.estado_conversacion === "busqueda_activa_abierta" ||
      ["BUSQUEDA_ACTIVA_ABIERTA", "D2_RAMA_B_NOMBRE_AGENDADO", "T_ADD_DETAIL"].includes(leadState.paso_actual)
    )
  );
  if (enBusquedaActivaAbierta) {
    return { vertical: "D2", subtipo: "T_ADD_DETAIL" };
  }

  // 0a-ter. Cierre con nombre recibido tras D2_RAMA_B_BUSQUEDA_COMPLETA
  if (
    leadState?.paso_actual === "D2_RAMA_B_BUSQUEDA_COMPLETA" &&
    String(rawText || "").trim().length >= 2 &&
    String(rawText || "").trim().length <= 60 &&
    !matchesAny(t, ["la fortuna", "santa m", "alquiler", "busco", "no tengo", "precio", "cuanto", "cuánto"])
  ) {
    return { vertical: "D2", subtipo: "D2_RAMA_B_NOMBRE_AGENDADO" };
  }

  // 0b. Cierre caliente por competencia / cita en otro apto (Caso Lianet T2)
  if (matchesAny(t, ["espera de otro", "veo otro", "otra cita", "tengo cita a las", "no me dan respuesta", "no nos gusta vamos", "otro apto"])) {
    return { vertical: "D2", subtipo: "LA_FORTUNA_CIERRE_CALIENTE_COMPETENCIA" };
  }

  // 0c. Objeción niños / familias (Caso Lianet T1)
  if ((ctx === "la_fortuna" || matchesAny(t, ["la fortuna", "ágata", "agata", "la fui a ver", "ya la vi"])) && matchesAny(t, ["niños", "ninos", "niño", "nino", "hijos", "chicos", "bebé", "bebe", "familia con"])) {
    return { vertical: "D2", subtipo: "LA_FORTUNA_OBJECION_NINOS" };
  }

  // 0c2. Ya visitó por fuera y avisa que ya tiene recibos/documentos para verla de nuevo (+598 99 561 277)
  if (
    matchesAny(t, ["ya tengo todo", "tengo los recibos", "ya tengo los míos", "ya tengo los mios", "fui a verla", "ya la visité", "ya la visite"]) &&
    matchesAny(t, ["voy con mi esposo", "voy con mi pareja", "vemos bien todo", "ir a verla", "sin aseguradora", "sin el seguro", "no me piden aseguradora"])
  ) {
    return { vertical: "D2", subtipo: "D2_YA_VISITO_CON_RECIBOS_PREPOLIZA" };
  }

  // 0d. Pedido directo de fotos desde un aviso de alquiler o mensaje corto (corta desvío falso a D3 Santa Mónica!)
  const pideFotosCasa = matchesAny(t, ["fotos de la casa", "pasas fotos", "pases fotos", "mandás fotos", "mandas fotos", "ver fotos", "ver la casa", "pasame fotos", "tenes fotos", "tenés fotos"])
    && !matchesAny(t, ["comprar", "compra", "venta", "en venta", "terreno", "lote", "santa mónica", "santa monica", "160.000", "usd"]);
  if (pideFotosCasa) {
    if (ctx === "centro_maldonado" || matchesAny(t, ["centro", "piso 4", "27.000", "32.000", "sin cochera"])) {
      return { vertical: "D2", subtipo: "CENTRO_MALDONADO_FOTOS_DESDE_AVISO" };
    }
    return { vertical: "D2", subtipo: "LA_FORTUNA_FOTOS_DESDE_AVISO" };
  }

  // 0e. Saludo corto que entra respondiendo a un aviso concreto (no derivar a autoservicio ciego)
  if (/^(?:hola+|buenas?(?:\s+(?:tardes?|noches?|d[ií]as?))?|buen\s+d[ií]a|qu[eé]\s+tal|info|informaci[oó]n|disponible\??|sigue\s+disponible\??|me\s+interesa)[!.,\s]*$/i.test(t)) {
    if (ctx === "centro_maldonado") return { vertical: "D2", subtipo: "CENTRO_MALDONADO_FOTOS_DESDE_AVISO" };
    if (ctx === "la_fortuna") return { vertical: "D2", subtipo: "LA_FORTUNA_HOLA_DESDE_AVISO" };
    if (ctx === "santa_monica") return { vertical: "D7", subtipo: "SANTA_MONICA_BOTON_1" };
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
  const esTurno2Dueno =
    (ctx === "dueno" && matchesAny(t, ["cómo trabajan", "como trabajan", "cuánto cobran", "cuanto cobran", "honorarios", "comisión", "comision", "qué fotos", "que fotos", "protección", "proteccion", "pre-registro", "grilla"])) ||
    (leadState?.rol_detectado === "propietario" && !pareceCompradorOInquilino);

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
    if (matchesAny(t, ["terreno", "lote", "padrón", "padron"]) && !matchesAny(t, ["edificados", "casa", "dormitorios", "plantas"])) {
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
  if (
    matchesAny(t, ["argentino", "exterior", "buenos aires", "desde argentina", "no residente", "a distancia", "firmar desde"]) &&
    (ctx === "pozo" || (
      leadState?.rama_conversacion !== "B" &&
      !leadState?.garantia_tipo &&
      !matchesAny(t, ["cobro en el exterior", "trabajo para afuera", "trabajo para el exterior", "trabajando para el exterior", "para el exterior", "facturo al exterior", "ingresos del exterior", "ingresos en el exterior"])
    ))
  ) {
    return { vertical: "D1", subtipo: "POZO_COMPRA_EXTERIOR" };
  }
  if (matchesAny(t, ["residencia fiscal", "3.500.000 ui"])) {
    return { vertical: "D1", subtipo: "POZO_RESIDENCIA_FISCAL" };
  }
  if (matchesAny(t, ["18.795", "18795", "vivienda promovida", "exoneración de impuestos", "exoneracion de impuestos"])) {
    return { vertical: "D1", subtipo: "POZO_LEY_18795" };
  }
  if (matchesAny(t, ["eve tower"]) || (matchesAny(t, ["playa brava", "parada 8"]) && matchesAny(t, ["en obra", "pozo", "cuotas", "financiación", "financiacion"]))) {
    return { vertical: "D1", subtipo: "POZO_EVE_TOWER_DETALLE" };
  }
  if (matchesAny(t, ["pozo", "betania", "nostrum", "more atlántico", "more atlantico", "golden rise", "eve tower", "cuotas de obra", "80.000", "79.800"])) {
    return { vertical: "D1", subtipo: "DEMANDA_POZO" };
  }

  // 6. Objeciones específicas de Alquiler / La Fortuna + Árbol Garantía + Rama A/B (D2)
  if (matchesAny(t, ["el tesoro", "juana de américa", "juana de america", "parada 16", "62.000", "28.000"]) && matchesAny(t, ["disponible", "alquiler", "alquila", "vi el"])) {
    return { vertical: "D2", subtipo: "D2_PROPIEDAD_YA_ALQUILADA" };
  }
  if (matchesAny(t, ["enero", "quincena", "verano", "temporada", "por día", "por dia", "vacaciones"]) && !matchesAny(t, ["marzo a noviembre", "invernal", "probar invierno", "enseguida de la temporada", "después de la temporada", "despues de la temporada"])) {
    return { vertical: "D2", subtipo: "OBJECION_TEMPORADA_VS_ANUAL" };
  }
  if (matchesAny(t, ["clearing", "deuda vieja", "mejor historial", "estoy en el clearing"])) {
    return { vertical: "D2", subtipo: "D2_CLEARING_HISTORIAL_PAREJA" };
  }
  if (matchesAny(t, ["la barra"]) && matchesAny(t, ["alquiler", "anual", "amoblado", "amueblado", "todo el año", "todo el ano", "bse", "sura", "porto"])) {
    return { vertical: "D2", subtipo: "D2_LA_BARRA_AMOBLADO_ANUAL_REALIDAD" };
  }
  if (matchesAny(t, ["losa radiante", "52.000", "55.000", "maldonado residencial"])) {
    return { vertical: "D2", subtipo: "D2_OPCION_RESIDENCIAL_52K" };
  }
  if (matchesAny(t, ["roosevelt", "cantegril"]) && matchesAny(t, ["70.000", "75.000", "parrillero propio", "en suite", "alquiler", "todo el año", "todo el ano"])) {
    return { vertical: "D2", subtipo: "D2_OPCION_ROOSEVELT_70K" };
  }
  if (matchesAny(t, ["cuál de los dos", "cual de los dos", "entre los dos"]) && matchesAny(t, ["wi-fi", "wifi", "cochera", "30.000"])) {
    return { vertical: "D2", subtipo: "D2_COMPARATIVA_FORTUNA_VS_CENTRO" };
  }
  if (matchesAny(t, ["predio es cerrado", "predio cerrado", "aires acondicionados", "agregar aires", "cochera adentro"]) && (ctx === "la_fortuna" || leadState?.links_ya_enviados?.some((l) => l.includes("la-fortuna")))) {
    return { vertical: "D2", subtipo: "LA_FORTUNA_PREDIO_AIRES" };
  }
  if (matchesAny(t, ["patio propio", "tiene patio", "sin patio", "planta alta", "por escalera"]) && (ctx === "la_fortuna" || leadState?.links_ya_enviados?.some((l) => l.includes("la-fortuna")))) {
    return { vertical: "D2", subtipo: "LA_FORTUNA_DISTRIBUCION_SIN_PATIO" };
  }
  if (matchesAny(t, ["comisiones variables", "ingresos variables", "sueldo variable", "6 recibos"])) {
    return { vertical: "D2", subtipo: "D2_SUELDO_VARIABLE_6_RECIBOS" };
  }
  if (matchesAny(t, ["recibos de sueldo", "recibo de sueldo", "tenemos recibo"]) && (matchesAny(t, ["cómo sería", "como seria", "cómo es", "como es", "marido", "pareja", "esposo", "esposa", "sumamos", "mi marido"]) || Boolean(leadState?.saludo_ya_hecho))) {
    return { vertical: "D2", subtipo: "D2_ASEGURADORA_COMO_FUNCIONA_RECIBOS" };
  }
  if (matchesAny(t, ["con mi pareja", "sumamos", "entre los dos", "sueldos conjuntos", "recibos de sueldo"]) && matchesAny(t, ["porto", "sura", "mapfre", "santander", "llegamos", "alcanza", "calific"])) {
    return { vertical: "D2", subtipo: "LA_FORTUNA_SUMA_INGRESOS_PAREJA" };
  }
  if (matchesAny(t, ["dirección exacta", "direccion exacta", "número de puerta", "numero de puerta", "qué calle", "que calle", "ubicación exacta", "ubicacion exacta"])) {
    return { vertical: "D2", subtipo: "LA_FORTUNA_DIRECCION_PUERTA" };
  }
  if (matchesAny(t, ["depósito o comisión", "deposito o comision", "comisión para entrar", "comision para entrar", "qué requisitos", "que requisitos", "cuánto piden de depósito", "cuanto piden de deposito"])) {
    return { vertical: "D2", subtipo: "LA_FORTUNA_REQUISITOS_INGRESO" };
  }
  if (matchesAny(t, ["gastos comunes", "aparte del alquiler", "qué incluye", "que incluye", "cuánto sale por mes", "cuanto sale por mes"]) || (ctx === "la_fortuna" && matchesAny(t, ["cuánto sale", "cuanto sale", "precio", "valor"]) && !matchesAny(t, ["hasta", "2027", "punta del este", "tendrías opciones", "tendrias opciones"]))) {
    return { vertical: "D2", subtipo: "LA_FORTUNA_OBJECION_GC_INCLUYE" };
  }
  if (matchesAny(t, ["audio", "llamar", "llamada", "teléfono", "telefono"])) {
    return { vertical: ctx === "santa_monica" ? "D7" : "D2", subtipo: "CANAL_AUDIO_WHATSAPP" };
  }

  // 6b. Árbol Completo de la Variable Garantía (paso a paso)
  const vSil = extraerVariablesSilenciosasB2C(rawText, leadState || {});
  const vTurn = extraerVariablesSilenciosasB2C(rawText, {});
  if (matchesAny(t, ["no tengo ingresos demostrables", "sin ingresos demostrables", "no tengo recibo ni factur", "no puedo demostrar ingresos"])) {
    return { vertical: "D2", subtipo: "D2_GARANTIA_SIN_INGRESOS_DEPOSITO" };
  }
  if (vTurn.situacion_laboral === "exterior" || matchesAny(t, ["cobro en el exterior", "trabajo para afuera", "trabajo para el exterior", "para el exterior", "facturo al exterior", "ingresos del exterior", "soy extranjero", "ingresos certificados en argentina", "nos mudamos de argentina", "sin banco local"])) {
    return { vertical: "D2", subtipo: "D2_GARANTIA_EXTERIOR" };
  }
  if (vTurn.situacion_laboral === "independiente" || matchesAny(t, ["de forma independiente", "con unipersonal", "soy independiente", "tengo unipersonal"])) {
    return { vertical: "D2", subtipo: "D2_GARANTIA_INDEPENDIENTE" };
  }
  if (vTurn.situacion_laboral === "relacion_dependencia" || matchesAny(t, ["relación de dependencia", "relacion de dependencia", "empleado en planilla", "tengo recibo de sueldo"])) {
    return { vertical: "D2", subtipo: "D2_GARANTIA_RELACION_DEPENDENCIA" };
  }
  if (
    matchesAny(t, ["no tengo garantía", "no tengo garantia", "sin garantía", "sin garantia", "solo efectivo", "pago solo efectivo", "tengo solo depósito", "tengo solo deposito"]) &&
    !matchesAny(t, ["la fortuna", "bhu", "anda"])
  ) {
    return { vertical: "D2", subtipo: "D2_GARANTIA_SIN_GARANTIA_O_DEPOSITO" };
  }
  if (ctx === "la_fortuna" && matchesAny(t, ["aceptan deposito", "aceptan depósito", "bhu o anda"])) {
    return { vertical: "D2", subtipo: "LA_FORTUNA_REQUISITOS_INGRESO" };
  }
  if ((matchesAny(t, ["tengo anda", "tengo contaduría", "tengo contaduria", "tengo cgn"]) || (ctx !== "general" && matchesAny(t, ["solo anda", "solo cgn"]))) && !t.includes("en otra zona o tengo propiedad")) {
    return { vertical: "D2", subtipo: "D2_GARANTIA_ANDA_CGN_ABIERTA" };
  }

  // 6b-vis. Intento explícito de ver / visitar una propiedad puntual antes de Rama B genérica
  if (
    /\b(me\s+gustar[ií]a\s+visitarlo|vamos\s+a\s+ver|nos\s+interesa\s+ver|podemos\s+visitar|podemos\s+ver\s+ese|coordinar\s+visita|ir\s+a\s+visitarlo|ir\s+a\s+verlo)\b/i.test(t)
    || (Boolean(leadState?.saludo_ya_hecho) && (/\b(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\s+(?:por\s+la\s+|de\s+)?(?:ma[nñ]ana|tarde)\b/i.test(t) || /\beste\s+(?:lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\b/i.test(t)))
  ) {
    if (ctx === "santa_monica" || matchesAny(t, ["terreno", "obra", "santa m", "laguna"])) {
      return { vertical: "D7", subtipo: "TURNO_2_VISITA_SANTA_MONICA" };
    }
    if (ctx === "pozo") {
      return { vertical: "D1", subtipo: "TURNO_2_VISITA_POZO" };
    }
    return { vertical: "D2", subtipo: "TURNO_2_VISITA_LA_FORTUNA" };
  }

  // 6c. Rama B (Búsqueda abierta / 2027 / Invernal / Más adelante / Presupuesto abierto)
  const esExcluidoRamaB = matchesAny(t, ["local comercial", "local u", "oficina", "consultorio", "galpón", "galpon", "terreno", "lote", "para construir"]);
  const esRamaB = !esExcluidoRamaB && Boolean(
    leadState?.rama_conversacion === "B"
    || vSil.es_futuro_o_abierto
    || matchesAny(t, [
      "2027", "2028", "más adelante", "mas adelante", "otra fecha", "contrato vence",
      "marzo a noviembre", "invernal", "probar invierno", "tendrías opciones", "tendrias opciones",
      "mudarme más adelante", "mudarnos en", "para el mes que viene", "para dentro de",
    ])
    || (matchesAny(t, ["alquiler", "alquilar", "mudar"]) && (vSil.zona_display === "Punta del Este" || Boolean(vSil.presupuesto_declarado)))
    || (Boolean(vSil.mes_mudanza && (vSil.personas_cantidad || vSil.dormitorios_abiertos)) && !matchesAny(t, ["la fortuna", "santa m"]))
    || ((vSil.tiene_mascota || vSil.comodidades_respondidas) && !matchesAny(t, ["la fortuna", "santa m", "perro mediano, aceptan", "dos perros grandes, aceptan"]))
  );

  if (esRamaB && ctx !== "santa_monica" && ctx !== "pozo" && ctx !== "dueno") {
    // Evaluar turno exacto en orden obligatorio 1 -> 3 -> 2
    if (vSil.tiene_mascota === "si" && !vSil.mascota_detalle) {
      return { vertical: "D2", subtipo: "D2_RAMA_B_MASCOTA_PREGUNTA" };
    }
    if (
      vSil.tiene_mascota &&
      vSil.comodidades_respondidas &&
      !vSil.garantia_tipo &&
      !vSil.es_futuro_o_abierto &&
      !(leadState && (!leadState.mes_mudanza || (!leadState.dormitorios_abiertos && !leadState.personas_cantidad)))
    ) {
      return { vertical: "D2", subtipo: "D2_RAMA_B_TURNO_3_PASO_2_GARANTIA" };
    }
    const faltaPaso1 = !vSil.mes_mudanza || (!vSil.dormitorios_abiertos && !vSil.personas_cantidad);
    if (faltaPaso1) {
      return { vertical: "D2", subtipo: "D2_RAMA_B_TURNO_1_PASO_1" };
    }
    if (
      Boolean(vSil.comodidades_respondidas) &&
      !vSil.tiene_mascota &&
      !vSil.amoblado_explicito &&
      !vSil.garantia_tipo
    ) {
      return { vertical: "D2", subtipo: "D2_RAMA_B_CIERRE_3_PREGUNTAS" };
    }
    const respondioMascotaYComodidades = Boolean(vSil.tiene_mascota) || Boolean(vSil.comodidades_respondidas);
    if (!respondioMascotaYComodidades) {
      return { vertical: "D2", subtipo: "D2_RAMA_B_TURNO_2_PASO_3" };
    }
    if (!vSil.garantia_tipo) {
      return { vertical: "D2", subtipo: "D2_RAMA_B_TURNO_3_PASO_2_GARANTIA" };
    }
    return { vertical: "D2", subtipo: "D2_RAMA_B_BUSQUEDA_COMPLETA" };
  }

  // 6d. Objeción mascota puntual en La Fortuna (SIM-06 / SIM-51) vs búsqueda abierta
  if (matchesAny(t, ["mascota", "perro", "gato"])) {
    if (ctx === "la_fortuna" || matchesAny(t, ["la fortuna", "aceptan en", "aceptan mascotas"])) {
      return { vertical: "D2", subtipo: "LA_FORTUNA_OBJECION_MASCOTA" };
    }
    return { vertical: "D2", subtipo: vSil.tiene_mascota === "si" && !vSil.mascota_detalle ? "D2_RAMA_B_MASCOTA_PREGUNTA" : "D2_RAMA_B_TURNO_3_PASO_2_GARANTIA" };
  }

  // 6e. Rama A — Propiedad puntual disponible hoy (consulta si sigue libre / cómo verla sin garantía declarada)
  if (ctx === "la_fortuna" && matchesAny(t, ["sigue disponible", "esta disponible", "está disponible", "como hacemos", "cómo hacemos", "quiero alquilarlo", "me gustaría verlo"])) {
    return { vertical: "D2", subtipo: "D2_RAMA_A_FILTRO_DIRECTO" };
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
  if (matchesAny(t, ["alquiler", "alquilo", "alquilar", "renta anual", "la fortuna", "ágata", "agata", "garantía", "garantia"]) || ctx === "la_fortuna" || ctx === "centro_maldonado" || leadState?.rol_detectado === "demanda_alquiler") {
    return { vertical: "D2", subtipo: "DEMANDA_ALQUILER_GENERAL" };
  }
  if (matchesAny(t, ["terreno", "lote", "para construir", "tirar abajo", "demoler", "a construir", "santa monica", "santa mónica", "laguna", "josé ignacio", "jose ignacio"]) || (matchesAny(t, ["la barra"]) && !matchesAny(t, ["alquiler", "anual", "amoblado", "amueblado"]))) {
    const esLatente = matchesAny(t, ["para construir", "proyecto", "tirar abajo", "demoler", "reciclar", "santa monica", "santa mónica", "laguna", "la barra", "josé ignacio", "jose ignacio"]);
    return { vertical: esLatente ? "D7" : "D5", subtipo: esLatente ? "LATENTE_LOTE_PROYECTO" : "DEMANDA_LOTE" };
  }
  if (matchesAny(t, ["apto", "apartamento", "depto", "departamento", "monoambiente"])) {
    if (t.includes("brava")) return { vertical: "D4", subtipo: "DEMANDA_APTO_BRAVA_CRUCE_POZO" };
    return { vertical: "D4", subtipo: "DEMANDA_APTO" };
  }
  if (matchesAny(t, ["casa", "vivienda", "vivir"]) && (ctx === "santa_monica" || matchesAny(t, ["comprar", "compra", "en venta", "venta", "usd"]))) {
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

function extraerPrimerNombre(rawText = "", leadState = null) {
  const fromState = String(leadState?.nombre || "")
    .replace(/Pendiente nombre.*/i, "")
    .replace(/Interesad[oa]\s+B2C/i, "")
    .trim();
  if (fromState) return _capWord(fromState.split(/\s+/)[0]);
  const clean = String(rawText || "").replace(/[¿¡!?.,]/g, " ").trim();
  const explicit = clean.match(/(?:soy|me llamo|mi nombre es)\s+([a-záéíóúñ]{2,20})/i);
  if (explicit) return _capWord(explicit[1]);
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 1 && words.length <= 3 && !/\d/.test(clean)) {
    const first = words[0];
    if (first.length >= 2 && !/^(hola|buenas|buen|gracias|si|sí|ok|dale)$/i.test(first)) {
      return _capWord(first);
    }
  }
  return "";
}

function _asegurarNegritaEnPreguntasActivas(texto) {
  const lines = String(texto || "").split("\n");
  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || (/^_.*_$/.test(trimmed) && !/\?\*/.test(trimmed))) return line;
      const urls = [];
      const masked = line.replace(/https?:\/\/[^\s)]+/gi, (m) => {
        const tok = `__ZURL${urls.length}__`;
        urls.push(m);
        return tok;
      });
      if (!masked.includes("?") || /\*[^*\n]+\?\*/.test(masked)) {
        return line;
      }
      const qIdx = masked.lastIndexOf("?");
      const beforeQ = masked.slice(0, qIdx + 1);
      const afterQ = masked.slice(qIdx + 1);
      const isAbbrBefore = (str, dotPos) => {
        const sub = str.slice(Math.max(0, dotPos - 8), dotPos + 1).toLowerCase();
        return /\b(?:aprox|av|dic|oct|nov|ene|feb|mar|abr|may|jun|jul|ago|set|sep|etc|art|sr|sra|dr)\.$/.test(sub) || /\d\.$/.test(sub);
      };
      let splitIdx = 0;
      const listMatch = beforeQ.match(/^(\s*-\s+)/);
      if (listMatch) splitIdx = listMatch[1].length;
      const reSep = /([.!:·]\s+)/g;
      let m;
      while ((m = reSep.exec(beforeQ)) !== null) {
        const endPos = m.index + m[1].length;
        if (endPos >= beforeQ.length - 1) continue;
        if (m[1].startsWith(".") && isAbbrBefore(beforeQ, m.index)) continue;
        if (beforeQ.slice(endPos).startsWith("__ZURL")) continue;
        splitIdx = endPos;
      }
      const prefix = beforeQ.slice(0, splitIdx);
      const question = beforeQ.slice(splitIdx).trim();
      if (!question) return line;
      const rebuilt = `${prefix}*${question}*${afterQ}`;
      return rebuilt.replace(/__ZURL(\d+)__/g, (_, i) => urls[Number(i)]);
    })
    .join("\n");
}

function armarMensajeCierreBusquedaRamaB(v) {
  const cleanNoPar = (s) => String(s || "").replace(/\([^)]*\)/g, "").replace(/[()]/g, "").replace(/\s+/g, " ").trim();
  const rawFecha = cleanNoPar(v?.desde_cuando || v?.mes_mudanza || "próxima mudanza");
  const fechaTxt = rawFecha ? rawFecha.charAt(0).toLowerCase() + rawFecha.slice(1) : "próxima mudanza";
  const partes = [];
  const dorms = cleanNoPar(v?.dormitorios_abiertos || (v?.dormitorios_min ? `${v.dormitorios_min} dormitorios` : "2 o 3 dormitorios"));
  if (dorms) partes.push(dorms);
  const comods = String(v?.comodidades_pedidas || "")
    .split(/[,|]+/)
    .map((x) => cleanNoPar(x).toLowerCase())
    .filter((x) => x && !x.startsWith("amoblad") && x !== "sin muebles");
  if (comods.includes("cochera") || /cochera/i.test(String(v?.comodidades_pedidas || ""))) {
    partes.push("con cochera");
  } else if (comods.length) {
    partes.push(`con ${comods.join(" y ")}`);
  }
  if (v?.amoblado_preferencia === "amoblado") partes.push("amoblado");
  else if (v?.amoblado_preferencia === "sin_muebles") partes.push("sin muebles");
  else partes.push("ideal amoblado o sin muebles");

  if (v?.tiene_mascota === "si") {
    const mDet = cleanNoPar(v.mascota_detalle || "mascota").replace(/^s[ií],?\s*/i, "").toLowerCase();
    partes.push(`con ${mDet || "mascota"}`);
  } else if (v?.tiene_mascota === "no") {
    partes.push("sin mascotas");
  }

  const zona = cleanNoPar(v?.zona_preferida || v?.zona_display || "Punta del Este y Maldonado");
  if (zona) partes.push(`en ${zona}`);

  if (v?.presupuesto_declarado) {
    const monPrefix = v.moneda === "USD" ? "USD " : "$U ";
    partes.push(`hasta ${monPrefix}${Number(v.presupuesto_declarado).toLocaleString("de-DE")} mensuales`);
  }

  const gar = cleanNoPar(v?.garantia_disponible || "");
  const resumenBase = cleanNoPar(partes.join(", "));
  const resumen = gar ? `${resumenBase} y garantía ${gar.charAt(0).toLowerCase() + gar.slice(1)}` : resumenBase;
  return (
    `Clarísimo todo! Ya dejamos armada tu búsqueda para ${fechaTxt}:\n` +
    `_${resumen}._\n` +
    "Nos quedamos atentas y te escribiremos por acá apenas tengamos opciones para vos! *Cómo es tu nombre para agendar tu búsqueda?*"
  );
}

export function aplicarPokaYokeMar(texto, vertical, esRespuestaPasiva = false, etapaSla = "T0_INMEDIATO") {
  let out = String(texto || "").trim();
  const violaciones = [];

  if (/[¿¡]/.test(out)) {
    out = out.replace(/[¿¡]/g, "");
  }
  out = out.replace(/\r?\n[ \t]*\r?\n+/g, "\n");
  out = _asegurarNegritaEnPreguntasActivas(out);

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
    if (/\b(due[nñ]o|propietario)\b/i.test(out)) {
      violaciones.push("MENCION_DUENO_PROHIBIDA_EN_DEMANDA");
    }
    const urls = out.match(/https?:\/\/[^\s]+/gi) || [];
    if (etapaSla === "T0_INMEDIATO" && urls.length > 1) {
      violaciones.push("DOS_O_MAS_LINKS_EN_T0");
    }
  }

  if (/sin exclusividad/i.test(out)) {
    violaciones.push("PROHIBIDO_SIN_EXCLUSIVIDAD");
  }
  if (/(?:nuestro\s+escribano|escribano\s+(?:que\s+)?hace\s+(?:la\s+|las\s+)?p[oó]liza)/i.test(out)) {
    violaciones.push("PROHIBIDO_ESCRIBANO_HACE_POLIZA");
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

  const outSinUrls = out.replace(/https?:\/\/[^\s]+/gi, "");
  const linesWithQ = outSinUrls.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.includes("?"));
  const qCount = (outSinUrls.match(/\?/g) || []).length;
  const eachLineSingleBoldQ =
    linesWithQ.length > 0 &&
    linesWithQ.every((l) => (l.match(/\?/g) || []).length === 1 && /\*[^*\n]+\?\*/.test(l));
  if (qCount > 3 || (qCount > 1 && !eachLineSingleBoldQ)) {
    violaciones.push("DOS_O_MAS_PREGUNTAS_ENCADENADAS");
  }

  if (esRespuestaPasiva && /\b(mientras te respondo|c[oó]mo podemos ayudarte|contame qu[eé] est[aá]s buscando,\s*as[ií] te paso)\b/i.test(out)) {
    violaciones.push("PROMESA_FALSA_ATENCION_INMEDIATA");
  }
  if (/quedo a las [oó]rdenes si decid[ií]s avanzar/i.test(out)) {
    violaciones.push("SEGUIMIENTO_PASIVO_PROHIBIDO");
  }

  // Candado #13: Prohibido usar "pero" en textos comerciales (reemplazar por conector afirmativo o punto seguido)
  if (/\bpero\b/i.test(out)) {
    violaciones.push("PROHIBIDO_PERO_COMERCIAL");
  }

  // Candado #14: Neutralidad de género + vocabulario estricto de comodidades y mascotas
  if (
    /\b(bienvenido|bienvenidos|bienvenidas|bienvenido\/a|bienvenid@)\b/i.test(out) ||
    /(?:^|[.!?]\s+|hola[!,]?\s+)bienvenida\b/i.test(out) ||
    /\b(solo\/sola|solo\s+o\s+sola|viv[ií]s\s+sol[oa]|mudarte\s+sol[oa]|para\s+vos\s+sol[oa]|si\s+sos\s+sol[oa])\b/i.test(out) ||
    /\b(agendad[oa]|agendad[oa]\/[oa]|qued[aá]s\s+agendad[oa]|te\s+dejo\s+agendad[oa]|te\s+dejamos\s+agendad[oa])\b/i.test(out) ||
    /\b(interesado\/interesada|interesad[oa]\/[oa]|si\s+est[aá]s\s+interesad[oa])\b/i.test(out)
  ) {
    violaciones.push("NEUTRALIDAD_DE_GENERO");
  }
  if (/\bqu[eé]\s+mascota\s+es\b/i.test(out)) {
    violaciones.push("PROHIBIDO_QUE_MASCOTA_ES");
  }
  if (/\b(cochera,\s*patio,\s*(?:o\s+)?muebles|patio,\s*muebles|necesit[aá]s[^.?]*\bmuebles\b(?!\s+o\s+sin)|prefer[ií]s[^.?]*\bmuebles\b)\b/i.test(out)) {
    violaciones.push("PROHIBIDO_MUEBLES_SUELTO");
  }

  // Candado #15: Prohibido asumir parentescos o vínculos no declarados ("tus hijos", "tu pareja", etc.)
  if (/\b(tus\s+hijos|tu\s+pareja|tu\s+marido|tu\s+esposa|tu\s+familia)\b/i.test(out)) {
    violaciones.push("PROHIBIDO_ASUMIR_PARENTESCO");
  }

  // Candado #16: Prohibido mencionar la palabra interna "Semáforo" al cliente final
  if (/\bsem[aá]foros?\b/i.test(out)) {
    violaciones.push("PROHIBIDO_PALABRA_SEMAFORO_PUBLICO");
  }

  // Candado #17: Prohibido usar sigla "GC", "cerrados" en canon o publicar "acepta/admite niños"
  if (/\bGC\b/.test(out) || /\$\s*u?\s*[\d.]+\s*cerrados\b/i.test(out) || /\b(?:acepta|admite)\s+(?:familias\s+con\s+)?ni[nñ]os\b/i.test(out)) {
    violaciones.push("PROHIBIDO_GC_O_ACEPTA_NINOS");
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

let _activeOverrides = [];

export function setActiveOverrides(list = []) {
  _activeOverrides = Array.isArray(list) ? list.filter(Boolean) : [];
}

export function getActiveOverrides() {
  return _activeOverrides;
}

function _normTriageStr(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s$%+.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function _appendLeadIdToLinks(texto, leadId) {
  if (!leadId || typeof texto !== "string") return texto;
  const enc = encodeURIComponent(String(leadId));
  return texto.replace(/https:\/\/zaguanpropiedades\.com\/[^\s"'<>)]*/g, (url) => {
    if (/[?&]lid=/i.test(url)) return url;
    return `${url}${url.includes("?") ? "&" : "?"}lid=${enc}`;
  });
}

function _matchD1Override(rawText, contextoPropiedad, vertical, subtipo, canal, overridesList) {
  if (!Array.isArray(overridesList) || overridesList.length === 0) return null;
  const normInput = _normTriageStr(rawText);
  const ctxNorm = _normTriageStr(contextoPropiedad || "general");
  const canalNorm = _normTriageStr(canal || "whatsapp");
  const vertNorm = String(vertical || "").toUpperCase();
  const subNorm = String(subtipo || "").toUpperCase();

  let best = null;
  let bestScore = -1;

  for (const ov of overridesList) {
    if (!ov || typeof ov !== "object") continue;
    const estado = _normTriageStr(ov.estado || "activo");
    if (estado && estado !== "activo" && estado !== "pendiente_test") continue;

    const replyCandidate = ov.respuesta_corregida || ov.respuesta || ov.replyText || ov.nueva_respuesta;
    if (!replyCandidate || String(replyCandidate).trim().length < 5) continue;

    const ovCanal = _normTriageStr(ov.canal || "todos");
    if (ovCanal && ovCanal !== "todos" && ovCanal !== canalNorm) continue;

    const ovCtx = _normTriageStr(ov.contexto || "general");
    if (ovCtx && ovCtx !== "todos" && ovCtx !== ctxNorm) continue;

    const ovVert = String(ov.vertical_14 || ov.vertical || "").toUpperCase().trim();
    const ovSub = String(ov.subtipo || "").toUpperCase().trim();
    const ovPat = _normTriageStr(ov.patron_normalizado || ov.patron || ov.input || ov.mensaje_cliente || "");

    const exactPatMatch = Boolean(ovPat && normInput === ovPat);
    const strongPatMatch = Boolean(ovPat && ovPat.length >= 6 && normInput.includes(ovPat));

    if (!exactPatMatch && !strongPatMatch) {
      if (ovVert && ovVert !== "TODOS" && ovVert !== vertNorm) continue;
      if (ovSub && ovSub !== "TODOS" && ovSub !== subNorm) continue;
    }

    let patScore = 0;
    if (ovPat) {
      if (exactPatMatch) {
        patScore = 100;
      } else if (strongPatMatch || (ovPat.length >= 4 && normInput.includes(ovPat))) {
        patScore = 70 + Math.min(20, ovPat.length);
      } else {
        const tokens = ovPat.split(" ").filter((t) => t.length >= 4);
        if (tokens.length >= 2 && tokens.every((t) => normInput.includes(t))) {
          patScore = 50 + tokens.length;
        } else {
          continue;
        }
      }
    } else if (ovSub && ovSub === subNorm && ovCtx === ctxNorm && (!ovVert || ovVert === "TODOS" || ovVert === vertNorm)) {
      patScore = 30;
    } else {
      continue;
    }

    const scopeBonus =
      (ovCtx === ctxNorm ? 15 : 0) +
      (ovVert === vertNorm ? 12 : 0) +
      (ovSub === subNorm ? 10 : 0);
    const totalScore = patScore + scopeBonus;
    if (totalScore > bestScore) {
      bestScore = totalScore;
      best = ov;
    }
  }
  return best;
}

export function clasificarYResponder(rawText, etapaSla = "T0_INMEDIATO", contextoPropiedad = "general", canal = "whatsapp", options = {}) {
  const leadState = options && options.leadState ? options.leadState : null;
  const varsSilenciosas = extraerVariablesSilenciosasB2C(rawText, leadState || {});
  const { vertical, subtipo } = clasificarVertical14(rawText, contextoPropiedad, leadState);
  const spec = VERTICAL_SPECS[vertical] || VERTICAL_SPECS.D2;
  const analisis = detectarFaltantes(vertical, rawText);
  const familia = seleccionarFamiliaArbol(vertical, subtipo);
  const arbol = ARBOL_ESTRATEGICO_SEMAFORO[familia] || null;
  const lidSuffix = options && options.leadId ? `&lid=${encodeURIComponent(String(options.leadId))}` : "";
  const utm = `?utm_source=${canal === "instagram" ? "instagram" : "whatsapp"}&utm_medium=mar${lidSuffix}`;
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
  } else if (subtipo === "CENTRO_MALDONADO_FOTOS_DESDE_AVISO") {
    replyText =
      `Hola! Acá tenés las fotos y el croquis del 2 dormitorios en Centro de Maldonado ($U 27.000/mes + $U 5.000 de gastos comunes con agua OSE incluida, piso 4 por ascensor, aire y calefón, sin muebles): https://zaguanpropiedades.com/alquileres/maldonado-centro-piso-4-norte/${utm}\n` +
      "Trabaja solo con garantía de aseguradora (Porto Seguro, Sura, Mapfre o Santander). Ya tenés póliza emitida o querés validar con recibos / unipersonal?";
    alertaAndon = true;
    motivoAndon = "Fotos Centro Maldonado enviadas + filtro de aseguradora sin empujar visita previa.";
  } else if (subtipo === "LA_FORTUNA_FOTOS_DESDE_AVISO") {
    replyText =
      `Hola! Acá tenés las fotos del apartamento 2 dormitorios en alquiler anual en La Fortuna ($U 30.000/mes, incluye gastos comunes, Wi-Fi y cochera fija, piso 1 c/ balcón, sin patio): ${LA_FORTUNA_URL}${utm}\n` +
      "Trabaja solo con garantía de aseguradora (Porto Seguro, Sura, Mapfre o Santander). Ya tenés aseguradora o querés confirmar con recibos / unipersonal?";
    alertaAndon = true;
    motivoAndon = "Fotos La Fortuna enviadas desde 'fotos de la casa' sin desvío falso a Santa Mónica.";
  } else if (subtipo === "D2_PROPIEDAD_YA_ALQUILADA") {
    replyText =
      `Esa propiedad ya no está disponible porque se alquiló.\n` +
      `Hoy tenemos activos para alquiler anual en Maldonado 2 dormitorios a estrenar en La Fortuna ($U 30.000/mes con gastos comunes, Wi-Fi y cochera fija) y 2 dormitorios en Centro de Maldonado ($U 27.000 + $U 5.000 de gastos comunes con agua incluida): ${ALQUILERES_URL}${utm}\n` +
      "Buscás en Maldonado o en La Barra y con qué garantía pensás alquilar?";
    alertaAndon = true;
    motivoAndon = "Consultó unidad ya alquilada: informado cierre y derivadas opciones anuales vigentes.";
  } else if (subtipo === "D2_OPCION_RESIDENCIAL_52K") {
    replyText =
      `Con ese presupuesto tenés disponible nuestro 2 dormitorios a estrenar en Maldonado Residencial con losa radiante, aberturas DVH y cochera fija a $U 52.000/mes (garantía Porto Seguro, Sura o Mapfre): https://zaguanpropiedades.com/alquileres/maldonado-residencial-2d/${utm}\n` +
      "Contás con aseguradora aprobada o recibos para coordinar visita esta semana?";
    alertaAndon = true;
    motivoAndon = "Cruce activo Maldonado Residencial 2D ($U 52.000, losa radiante y cochera).";
  } else if (subtipo === "D2_OPCION_ROOSEVELT_70K") {
    replyText =
      `En Roosevelt y Cantegril tenemos disponible para alquiler anual un piso alto de 2 dormitorios en suite con parrillero propio y cochera en subsuelo a $U 70.000/mes: https://zaguanpropiedades.com/alquileres/roosevelt-cantegril-2d/${utm}\n` +
      "Con qué garantía pensás alquilar y desde qué fecha buscás ingresar?";
    alertaAndon = true;
    motivoAndon = "Cruce activo Roosevelt y Cantegril 2D ($U 70.000, suite y parrillero propio).";
  } else if (subtipo === "D2_COMPARATIVA_FORTUNA_VS_CENTRO") {
    replyText =
      "El que incluye cochera fija dentro del predio cerrado y Wi-Fi dentro de los $U 30.000/mes (con gastos comunes incluidos) es el 2 dormitorios a estrenar de La Fortuna.\n" +
      "El de Centro de Maldonado ($U 27.000 + $U 5.000 de gastos comunes con agua incluida) suma aire acondicionado y calefón instalados, con cocheras disponibles en alquiler en el edificio.\n" +
      "Cuál de los dos prefieren visitar primero esta semana?";
    alertaAndon = true;
    motivoAndon = "Comparativa directa La Fortuna ($U 30k con cochera y Wi-Fi) vs Centro Maldonado ($U 27k+5k).";
  } else if (subtipo === "LA_FORTUNA_DISTRIBUCION_SIN_PATIO") {
    replyText =
      "La unidad de La Fortuna está en Piso 1 por escalera exterior con balcón propio, sin patio y sin barbacoa común; cuenta con cochera fija dentro del predio cerrado con reja perimetral ($U 30.000/mes con gastos comunes y Wi-Fi incluidos).\n" +
      "Contás con póliza aseguradora (Porto Seguro, Sura, Mapfre o Santander) para avanzar?";
    alertaAndon = true;
    motivoAndon = "Aclaración Piso 1 por escalera con balcón y sin patio en La Fortuna.";
  } else if (subtipo === "D2_SUELDO_VARIABLE_6_RECIBOS") {
    replyText =
      "Cuando cobrás sueldo con comisiones o ingresos variables en BPS, las aseguradoras (Porto Seguro, Sura, Mapfre y Santander) solicitan los últimos 6 recibos consecutivos, continuidad laboral y estar sin Clearing, calculando que el alquiler represente en torno al 30% del promedio líquido (sumando de 1 a 4 firmantes).\n" +
      `Podés verificar el cálculo acá: https://zaguanpropiedades.com/garantias-alquiler/${utm}\n` +
      "Con el promedio de esos 6 recibos cubren esa relación para avanzar?";
    alertaAndon = true;
    motivoAndon = "Explicada regla de 6 recibos consecutivos para ingresos variables en BPS.";
  } else if (subtipo === "POZO_EVE_TOWER_DETALLE") {
    replyText =
      `En Playa Brava trabajamos EVE Tower en Parada 8, a 100 metros del mar: unidades de 1 y 2 dormitorios desde USD 150.000 con financiación propia hasta en 55 cuotas durante la obra y 5% de gastos de ocupación: ${PROYECTOS_URL}eve-tower/\n` +
      "Buscás 1 o 2 dormitorios y qué anticipo en USD manejás para pasarte planos y disponibilidad?";
    alertaAndon = true;
    motivoAndon = "Detalle EVE Tower Parada 8 Playa Brava (desde USD 150.000, hasta 55 cuotas).";
  } else if (subtipo === "D2_ASEGURADORA_COMO_FUNCIONA_RECIBOS") {
    replyText =
      "Con recibos de sueldo tramitás póliza de aseguradora (Porto Seguro, Sura, Mapfre o Santander) en 24 a 48 hs.\n" +
      "Piden los últimos 3 recibos consecutivos si cobrás fijo (o 6 si tenés ingresos variables), continuidad en BPS, cédula vigente y estar sin Clearing.\n" +
      "Pueden sumar los ingresos líquidos de 1 a 4 personas que firmen el contrato (en torno al 30% del alquiler, unos $U 90.000 a $U 100.000 líquidos entre quienes firmen). Podés verificar el cálculo en privado acá: https://zaguanpropiedades.com/garantias-alquiler/\n" +
      "Los dos tienen continuidad en BPS y libre de Clearing para confirmarte cuál de las unidades quieren priorizar?";
    alertaAndon = true;
    motivoAndon = "Explicó cálculo de recibos en pareja (~30% entre 1-4 firmantes, 3 o 6 recibos, BPS, sin Clearing).";
  } else if (subtipo === "D2_YA_VISITO_CON_RECIBOS_PREPOLIZA") {
    replyText =
      "Qué bueno que ya tengas los recibos listos! Para cuidar el tiempo de todos trabajamos el avance y la reserva con la pre-evaluación de aseguradora en marcha.\n" +
      "Si nos compartís por acá foto o PDF de los recibos y documento de identidad, ingresamos hoy sin costo la consulta en Porto, Sura, Mapfre o Santander (responden en 24 hs) y con ese respaldo coordinamos enseguida.\n" +
      "Querés pasarnos la documentación por acá así adelantamos hoy esa validación?";
    alertaAndon = true;
    motivoAndon = "Interesado ya visitó y tiene recibos listos: encauzar a pre-evaluación de aseguradora sin fricción.";
  } else if (subtipo === "D2_CLEARING_HISTORIAL_PAREJA") {
    replyText =
      "Con Clearing vigente la aseguradora frena al titular observado, y sí permite presentar la póliza a nombre de quien tenga historial limpio o sumar otro co-firmante sin Clearing que cubra en torno al 30% del alquiler.\n" +
      "Si regularizás ese saldo y obtenés el libre de deuda, también te acompañamos para presentar la carpeta a evaluación.\n" +
      "Con los ingresos de quien tiene historial limpio cubren esa relación o prefieren armar propuesta de meses adelantados?";
    alertaAndon = true;
    motivoAndon = "Clearing / historial de co-firmante: opción titular limpio, libre de deuda o meses adelantados.";
  } else if (subtipo === "D2_LA_BARRA_AMOBLADO_ANUAL_REALIDAD") {
    replyText =
      `Hoy en La Barra el alquiler anual de 2 dormitorios que esté amoblado es escaso antes de temporada y suele ubicarse entre USD 1.200 y USD 1.400 al mes según edificio.\n` +
      `Dejamos activa desde hoy tu búsqueda en La Barra y Maldonado con ${varsSilenciosas.garantia_disponible || "aseguradora (Sura, Porto, BSE o Mapfre)"}, y mientras tanto podés ver esta opción anual disponible en Centro de Maldonado ($U 27.000 + $U 5.000 de gastos comunes con agua incluida, sin muebles): https://zaguanpropiedades.com/alquileres/maldonado-centro-piso-4-norte/${utm}\n` +
      "Desde qué mes buscás ingresar y para cuántas personas sería así salimos a rastrear opciones puntuales?";
    alertaAndon = true;
    motivoAndon = "Búsqueda anual La Barra / Maldonado amoblado USD 1.200-1.400 + cruce transparente Centro Maldonado.";
  } else if (subtipo === "LA_FORTUNA_HOLA_DESDE_AVISO") {
    if (etapaSla === "T1_DESTRABE_5_MIN") {
      replyText = ARBOL_ESTRATEGICO_SEMAFORO.FAMILIA_A_ALQUILER_ANUAL.tiempos.T1_DESTRABE_5_MIN;
    } else {
      replyText =
        `Hola, te habla Mar de ZAGUÁN. Por el anuncio del apartamento a estrenar en La Fortuna ($U 30.000/mes con gastos comunes, Wi-Fi y cochera incluidos), acá tenés las fotos y detalles completos en un enlace: ${LA_FORTUNA_URL}${utm}\n` +
        "Cuando lo revises, ya tenés garantía aseguradora o necesitás que te ayudemos a tramitarla con nuestra gestión ZAGUÁN?";
    }
    alertaAndon = true;
    motivoAndon = "Saludo desde aviso La Fortuna: entrega ficha trackeada sin perder conversación.";
  } else if (subtipo === "LA_FORTUNA_OBJECION_NINOS") {
    replyText =
      "Entendido. Te confirmo que la unidad tiene capacidad máxima de hasta 4 personas y acepta mascota de raza pequeña.\n" +
      "Como ya conocés el apartamento y te gustó, el único paso para avanzar y reservarlo es la garantía aseguradora.\n" +
      "Ya tenés una aprobada o preferís que la tramitemos hoy con nuestra gestión ZAGUÁN?";
    alertaAndon = true;
    motivoAndon = "ANDON CAPACIDAD LA FORTUNA: confirmada capacidad máxima hasta 4 personas y ofrecida gestión ZAGUÁN.";
  } else if (subtipo === "LA_FORTUNA_CIERRE_CALIENTE_COMPETENCIA") {
    const mHora = String(rawText || "").match(/\b(?:a\s+las\s+)?(\d{1,2}(?::\d{2})?)\s*(?:hs|h)?\b/i);
    const hora = mHora ? mHora[1] : "";
    replyText = hora
      ? `Esta propiedad tiene agenda activa de visitas y la reserva se confirma por orden de cierre.\nAnotada tu cita de las ${hora}: mantenemos tu prioridad mientras siga disponible y reconectamos al mediodía.\nQuedamos en hablar a las 12 hs para confirmarte si sigue libre?`
      : "Esta propiedad tiene agenda activa de visitas y la reserva se confirma por orden de cierre.\nSi me adelantás a qué hora tenés la otra cita mañana, mantenemos tu prioridad mientras siga disponible y reconectamos al mediodía.\nA qué hora es tu cita mañana para agendar nuestro recontacto?";
    alertaAndon = true;
    motivoAndon = "ANDON CIERRE CALIENTE (Competencia): esperar resolución y recontacto al mediodía.";
  } else if (subtipo === "LA_FORTUNA_VISITA_FILTRADA") {
    replyText = `Con esa aseguradora calificás para el apartamento en La Fortuna ($U 30.000/mes con gastos comunes, Wi-Fi y cochera; capacidad máxima hasta 4 personas y mascota de raza pequeña).\nAcá ves fotos y ficha: ${LA_FORTUNA_URL}${utm}\nQué día y horario te sirve visitar esta semana?`;
    alertaAndon = true;
    motivoAndon = "Lead La Fortuna ya declaró póliza aseguradora (Botón 1): listo para agenda.";
  } else if (subtipo === "LA_FORTUNA_INGRESOS_TRAMITE") {
    if (etapaSla === "T1_DESTRABE_5_MIN") {
      replyText = ARBOL_ESTRATEGICO_SEMAFORO.FAMILIA_A_ALQUILER_ANUAL.tiempos.T1_DESTRABE_5_MIN;
    } else {
      replyText =
        `Acá tenés las fotos y distribución del apartamento a estrenar en La Fortuna ($U 30.000/mes con gastos comunes, Wi-Fi y cochera incluidos; capacidad máxima hasta 4 personas y mascota de raza pequeña): ${LA_FORTUNA_URL}${utm}\n` +
        "Desde nuestra gestión ZAGUÁN te ayudamos a tramitar la garantía aseguradora con recibo de sueldo, certificación contable o ingresos conjuntos.\n" +
        "Cuando veas las fotos, me confirmás si esa distribución va con lo que buscás para avanzar con el trámite?";
    }
    alertaAndon = true;
    motivoAndon = "Lead La Fortuna calificable con ingresos (Botón 2): enganche visual + gestión ZAGUÁN.";
  } else if (subtipo === "LA_FORTUNA_OTRA_GARANTIA" || subtipo === "TRIAJE_DUAL_OPCION_3") {
    if ((rawText || "").toLowerCase().includes("propiedad")) {
      replyText =
        "Si tenés una propiedad para vender o alquilar anual en Maldonado o Punta del Este, contame en qué barrio está y nos ocupamos directo con vos.\n" +
        "Si buscás alquilar en otro barrio o con otra garantía (en La Fortuna se pide aseguradora), pasame zona, dormitorios y presupuesto para avisarte apenas ingrese una opción acorde.\n" +
        "Cuál de los dos casos es el tuyo para empezar ahora?";
    } else {
      replyText =
        "En La Fortuna se trabaja con garantía aseguradora, aunque relevamos opciones en otras zonas de Maldonado con ANDA o CGN.\n" +
        "Qué zona, cantidad de dormitorios y presupuesto mensual manejás para avisarte apenas ingrese una opción acorde?";
    }
    alertaAndon = true;
    motivoAndon = "Lead Botón 3 (ANDA/CGN o captación): separa dueño vs. alquiler sin quemar fichas.";
  } else if (subtipo === "LA_FORTUNA_FICHA") {
    if (etapaSla === "T0_INMEDIATO") {
      replyText =
        `Acá podés ver las fotos y distribución del apartamento en La Fortuna ($U 30.000/mes con gastos comunes, Wi-Fi y cochera incluidos): ${LA_FORTUNA_URL}${utm}\n` +
        "Mirá la ficha primero y contame: ya contás con garantía aseguradora o preferís que te ayudemos a tramitarla con nuestra gestión ZAGUÁN?";
    } else {
      replyText = ARBOL_ESTRATEGICO_SEMAFORO.FAMILIA_A_ALQUILER_ANUAL.tiempos[etapaSla]
        || ARBOL_ESTRATEGICO_SEMAFORO.FAMILIA_A_ALQUILER_ANUAL.tiempos.T0_INMEDIATO;
    }
    alertaAndon = true;
    motivoAndon = `Seguimiento La Fortuna (${etapaSla}).`;
  } else if (subtipo === "LA_FORTUNA_PREDIO_AIRES") {
    replyText =
      "Sí, el predio de La Fortuna cuenta con acceso controlado y cochera fija adentro del predio incluida en los $U 30.000/mes (junto con gastos comunes y Wi-Fi).\n" +
      "La unidad viene con previsión lista para colocar aires acondicionados sin inconvenientes.\n" +
      "Manejá con tranquilidad; cuando llegues contame qué día y franja horaria te sirve para coordinar la visita?";
    alertaAndon = true;
    motivoAndon = "Consulta puntual La Fortuna: predio cerrado, cochera fija y previsión de aires.";
  } else if (subtipo === "TURNO_2_VISITA_LA_FORTUNA") {
    const franjaRaw = extraerFranjaVisita(rawText);
    const franja = franjaRaw || "el horario que propusiste";
    const ctxLower = String(contextoPropiedad || "").toLowerCase();
    const yaDeclaroPoliza = /\b(porto|sura|mapfre|santander)\b/i.test(rawText || "") || /\b(porto|sura|mapfre|santander)\b/i.test(String(varsSilenciosas.garantia_tipo || ""));
    if (Boolean(leadState?.saludo_ya_hecho)) {
      const nombreVis = extraerPrimerNombre(rawText, leadState);
      const unidadLabel = /brava|71\.400/i.test(rawText || "")
        ? "la unidad de Playa Brava Parada 8 ($U 71.400)"
        : (/roosevelt|70\.000/i.test(rawText || "") || (leadState?.links_ya_enviados || []).some((l) => l.includes("roosevelt"))
          ? "el 2 dormitorios en Roosevelt y Cantegril ($U 70.000)"
          : (/52\.000|c[oó]rdoba|residencial/i.test(rawText || "") || (leadState?.links_ya_enviados || []).some((l) => l.includes("residencial"))
            ? "la unidad a estrenar sobre Av. Córdoba ($U 52.000)"
            : (/centro|27\.000/i.test(rawText || "") || ctxLower === "centro_maldonado"
              ? "el 2 dormitorios en Centro de Maldonado"
              : "el 2 dormitorios en La Fortuna")));
      const yaTieneEspacio = Boolean(varsSilenciosas.personas_cantidad || varsSilenciosas.dormitorios_abiertos);
      const introVisita = franjaRaw
        ? `Anotado ${franjaRaw} para coordinar la visita a ${unidadLabel} con nuestro equipo de Zaguán.`
        : `Tomamos nota para coordinar la visita a ${unidadLabel} con nuestro equipo de Zaguán.`;
      const cierrePregunta = !franjaRaw
        ? (nombreVis
          ? `Queda registrado a nombre de ${nombreVis}; qué día y franja horaria les queda cómodo para recorrerla?`
          : "Me pasás tu nombre completo y qué día y franja horaria te queda cómodo para recorrerla?")
        : (nombreVis
          ? (yaDeclaroPoliza
            ? `Queda registrado a nombre de ${nombreVis}; te confirmamos el horario exacto y el punto de encuentro en puerta por acá. Tenés preferencia de hora puntual dentro de esa franja?`
            : `Queda registrado a nombre de ${nombreVis}; confirmamos agenda y te pasamos el punto exacto en puerta por acá. Con qué aseguradora o respaldo avanzamos para dejar lista la visita?`)
          : (yaDeclaroPoliza
            ? (yaTieneEspacio ? "Me pasás tu nombre y apellido para dejarte confirmada la visita?" : "Me confirmás tu nombre completo y cuántas personas vivirían en la unidad?")
            : (yaTieneEspacio ? "Me pasás tu nombre completo y con qué aseguradora avanzamos?" : "Me pasás tu nombre completo, qué aseguradora tenés aprobada y cuántas personas irían?")));
      replyText = `${introVisita}\n${cierrePregunta}`;
    } else {
      replyText = yaDeclaroPoliza
        ? `Anotado ${franja} con póliza aprobada para visitar el 2 dormitorios en La Fortuna ($U 30.000/mes con gastos comunes y Wi-Fi incluidos).\nDejamos confirmado el bloque de visita con nuestra gestión en ZAGUÁN y te compartimos el punto exacto sobre Av. Ágata antes de ir.\nMe confirmás tu apellido y cuántas personas vivirían en el apartamento?`
        : `Anotado ${franja} como preferencia para visitar el 2 dormitorios en La Fortuna.\nEn ZAGUÁN confirmamos esa franja de agenda y te compartimos el punto exacto sobre Av. Ágata al validar póliza aseguradora.\nMe pasás tu nombre completo, qué aseguradora tenés aprobada y cuántas personas irían?`;
    }
    alertaAndon = true;
    motivoAndon = "ANDON VISITA: Lead propuso visita / día y hora; confirmar agenda.";
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
    const franja = extraerFranjaVisita(rawText) || "el horario que propusiste";
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
    const franja = extraerFranjaVisita(rawText) || "el horario que propusiste";
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
      "Trabajamos con autorización abierta: seguís ofreciendo por tu cuenta mientras armamos la difusión y filtramos solvencia e intención real antes de cada visita.\n" +
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
        "Hola, te escribe Mar, de ZAGUÁN Propiedades. Trabajamos alquileres anuales con publicación abierta, filtrando garantía aseguradora aprobada (Porto, Sura o Mapfre) antes de cada visita.\n" +
        "Me confirmás qué garantías aceptás, capacidad máxima de personas y si admite mascotas (y porte) y gastos comunes?";
    } else if (vertical === "O3") {
      replyText =
        "Hola, te escribe Mar, de ZAGUÁN Propiedades. Trabajamos locales comerciales y oficinas con publicación abierta, filtrando cada interesado por rubro y solvencia.\n" +
        "Me confirmás metros del salón, si cuenta con trifásica/habilitación y valor pretendido?";
    } else if (vertical === "O4") {
      replyText =
        "Hola, te escribe Mar, de ZAGUÁN Propiedades. Trabajamos lotes y terrenos con publicación abierta, pre-calificando compradores antes de coordinar visitas.\n" +
        "Me confirmás número de padrón o frente/fondo, servicios en puerta y valor en USD?";
    } else if (!/vend[oe]|venta/i.test(rawText || "")) {
      replyText =
        "Hola, te escribe Mar, de ZAGUÁN Propiedades. Trabajamos en Punta del Este y Maldonado con publicación abierta y filtro previo de interesados.\n" +
        "La propiedad es para venta o alquiler anual, y qué valor pretendido manejás?";
    } else {
      replyText =
        "Hola, te escribe Mar, de ZAGUÁN Propiedades. Trabajamos en Punta del Este y Maldonado con publicación abierta y filtro previo de compradores.\n" +
        `Para evaluar tu propiedad en cartera, envianos:\n• ${analisis.faltantes_capa_1.slice(0, 3).join("\n• ")}`;
    }
    alertaAndon = true;
    motivoAndon = `Alta inbound de propietario (${vertical}): pasar a Master CSV y Bienvenida de OKs.`;
  } else if (subtipo === "D2_GARANTIA_SIN_INGRESOS_DEPOSITO") {
    replyText =
      "Tomamos nota para buscar propietarios que evalúen depósito en garantía.\n" +
      "Cuántos meses de depósito podés cubrir al momento de ingresar para dejarlo registrado en tu búsqueda?";
    alertaAndon = true;
    motivoAndon = "Garantía B2C: registra capacidad de meses de depósito.";
  } else if (subtipo === "D2_GARANTIA_EXTERIOR") {
    replyText =
      "En Zaguán podemos conformar la garantía con comprobantes y certificado notarial. Contás con facturas a tu nombre y disponés de extractos bancarios que reflejen que el alquiler representa menos de un 30% aprox. de tus ingresos justificables?";
    alertaAndon = true;
    motivoAndon = "Garantía B2C exterior: validación de facturas + extractos bancarios (<30% + certificado notarial).";
  } else if (subtipo === "D2_GARANTIA_INDEPENDIENTE") {
    replyText =
      "De forma independiente o con unipersonal la aseguradora se tramita con unipersonal con más de 1 año de existencia, BPS y DGI al día más certificación contable del último año de ingresos, cuidando que el alquiler represente aprox. el 30% del ingreso líquido sin Clearing (puede ser una sola persona o combinando ingresos de hasta 4 personas).\n" +
      `Comprobá en 20 segundos si tu perfil califica acá: https://zaguanpropiedades.com/garantias-alquiler/${utm}\n` +
      "Contás con esos comprobantes al día para agendar tu búsqueda?";
  } else if (subtipo === "D2_GARANTIA_RELACION_DEPENDENCIA") {
    replyText =
      "En relación de dependencia la aseguradora se tramita con los últimos 3 recibos de sueldo consecutivos si cobrás fijo (o 6 recibos consecutivos si tenés ingresos variables), continuidad en BPS, documento de identidad y sin Clearing, cuidando que el alquiler represente aprox. el 30% del ingreso líquido (puede ser una sola persona o combinando ingresos de hasta 4 personas).\n" +
      `Podés verificar en privado de 1 a 4 firmantes en 20 segundos acá: https://zaguanpropiedades.com/garantias-alquiler/${utm}\n` +
      "Con tu ingreso actual o combinando hasta 4 personas cubrís esa relación para agendar tu búsqueda?";
  } else if (subtipo === "D2_GARANTIA_SIN_GARANTIA_O_DEPOSITO") {
    replyText =
      "Entiendo. En general para alquileres anuales de estos montos piden garantía de aseguradora y en Zaguán podemos ayudarte a tramitarla al momento de reservar (puede ser una sola persona o combinando ingresos de hasta 4 personas). Trabajás en relación de dependencia o de forma independiente?";
  } else if (subtipo === "D2_GARANTIA_ANDA_CGN_ABIERTA") {
    replyText =
      "Esa propiedad opera con garantía de aseguradora y tomamos nota de tu búsqueda con ANDA o Contaduría por si ingresa una opción que la acepte.\n" +
      "Preferís que dejemos agenda con ANDA o Contaduría, o querés evaluar aseguradora con tus recibos?";
  } else if (subtipo === "D2_RAMA_A_FILTRO_DIRECTO") {
    replyText =
      `Hola! Te damos la bienvenida a Zaguán. La propiedad está disponible (${LA_FORTUNA_URL}${utm}).\n` +
      "Buscás para entrar ya y con qué garantía pensás alquilar (podemos ayudarte con eso también)?";
    alertaAndon = true;
    motivoAndon = "Rama A La Fortuna: filtro entrada inmediata + garantía.";
  } else if (subtipo === "D2_RAMA_B_TURNO_1_PASO_1") {
    const zonaParte = varsSilenciosas.zona_display ? ` en ${varsSilenciosas.zona_display}` : "";
    const presuNum = varsSilenciosas.presupuesto_declarado
      ? `${varsSilenciosas.moneda === "USD" ? "USD " : "$U "}${varsSilenciosas.presupuesto_declarado.toLocaleString("de-DE")}`
      : "";
    const presuParte = presuNum ? ` hasta ${presuNum} al mes` : "";
    const yearMatch = String(rawText || "").match(/\b(202[6-9]|203\d)\b/);
    const tempParte = yearMatch ? ` para el ${yearMatch[1]}` : (varsSilenciosas.desde_cuando ? ` para ${varsSilenciosas.desde_cuando}` : "");
    const aclaraContrato = varsSilenciosas.mezcla_invernal_anual
      ? "\nTené en cuenta que el alquiler invernal (marzo a noviembre) y el alquiler anual (12 meses) son dos contratos distintos con valores distintos."
      : "";
    if (Boolean(leadState?.saludo_ya_hecho)) {
      const faltaMes = !varsSilenciosas.mes_mudanza;
      const faltaEspacio = !varsSilenciosas.dormitorios_abiertos && !varsSilenciosas.personas_cantidad;
      const preguntaFaltante = faltaMes && faltaEspacio
        ? "*desde qué mes pensás mudarte y cuántos dormitorios o para cuántas personas buscás?*"
        : (faltaMes ? "*desde qué mes pensás mudarte?*" : "*cuántos dormitorios o para cuántas personas buscás?*");
      const aperturaRamaB = varsSilenciosas.mezcla_invernal_anual || /invernal|marzo a noviembre/i.test(rawText || "")
        ? `Sí, trabajamos tanto alquiler anual como invernal en Maldonado y Punta del Este.${aclaraContrato}`
        : `Nos ponemos atentas para encontrar lo que buscás${zonaParte}${presuParte}${tempParte} y ofrecértelo.${aclaraContrato}`;
      replyText =
        `${aperturaRamaB}\n` +
        `Contanos así enfocamos la búsqueda: ${preguntaFaltante}`;
    } else {
      replyText =
        `Hola! Te damos la bienvenida a Zaguán. Nos ponemos atentas para encontrar lo que buscás${zonaParte}${presuParte}${tempParte} y ofrecértelo.${aclaraContrato}\n` +
        "Contanos así enfocamos la búsqueda: *desde qué mes pensás mudarte y cuántos dormitorios o para cuántas personas buscás?*\n" +
        "_Si querés adelantarnos algo más:_\n" +
        "- _si tenés mascota o alguna comodidad importante para vos (cochera, patio, que esté amoblado)_\n" +
        "- _con qué garantía pensás alquilar (podemos ayudarte con eso también)_";
    }
    alertaAndon = true;
    motivoAndon = "Rama B Paso 1: búsqueda abierta guardada con presupuesto elástico y dormitorios abiertos.";
  } else if (subtipo === "D2_RAMA_B_MASCOTA_PREGUNTA") {
    replyText =
      "Tomamos nota para priorizar propiedades que acepten mascotas. Qué mascota tenés?";
  } else if (subtipo === "D2_RAMA_B_CIERRE_3_PREGUNTAS") {
    replyText =
      "Tomamos nota. Para terminar de definir tu búsqueda:\n" +
      "- *buscás que esté amoblado o te da igual?*\n" +
      "- *tenés mascota?*\n" +
      "y por último:\n" +
      "- *con qué garantía pensás alquilar (podemos ayudarte con eso también)?*";
  } else if (subtipo === "D2_RAMA_B_TURNO_2_PASO_3") {
    const aclaraContrato = varsSilenciosas.mezcla_invernal_anual
      ? "Tené en cuenta que el alquiler invernal (marzo a noviembre) y el alquiler anual (12 meses) son dos contratos distintos con valores distintos.\n"
      : "";
    replyText =
      `${aclaraContrato}Tomamos nota. Tenés mascota o hay alguna comodidad que necesites sí o sí, como cochera, patio o que esté amoblado?`;
  } else if (subtipo === "D2_RAMA_B_NOMBRE_AGENDADO") {
    const primerNombre = extraerPrimerNombre(rawText, leadState) || "contacto";
    replyText =
      `Un gusto, ${primerNombre}!\n` +
      "dejamos asentado tu nombre de contacto.\n" +
      "Hacia mediados de enero deberíamos acercar tu necesidad a algo concreto, y la temporada es un tsunami por estos lares! por eso recordá que sos libre de incluir detalles que te acuerdes o se te ocurran, en cualquier momento, y vamos ajustando!";
    alertaAndon = true;
    motivoAndon = `Nombre agendado (${primerNombre}): búsqueda pasa a busqueda_activa_abierta + caza_activa_hoy (hito 2027-01-15).`;
  } else if (subtipo === "T_ADD_DETAIL") {
    const primerNombre = extraerPrimerNombre("", leadState) || extraerPrimerNombre(rawText, leadState) || "";
    const saludoNombre = primerNombre ? `, ${primerNombre}` : "";
    const detalleClean = String(rawText || "").replace(/\bpero\b/gi, "y").replace(/[()¿¡]/g, "").trim();
    const tagsAdd = [];
    if (/\b(parrillero|churrasquero|barbacoa|quincho)\b/i.test(detalleClean)) tagsAdd.push("parrillero");
    if (/\b(fondo\s+cercado|patio\s+cercado|cercado)\b/i.test(detalleClean)) tagsAdd.push("fondo cercado");
    if (/\bcochera\b/i.test(detalleClean)) tagsAdd.push("cochera");
    if (/\b(patio|jard[ií]n)\b/i.test(detalleClean)) tagsAdd.push("patio");
    if (/\b(estufa\s+a\s+le[nñ]a)\b/i.test(detalleClean)) tagsAdd.push("estufa a leña");
    if (/\b(piscina|pileta)\b/i.test(detalleClean)) tagsAdd.push("piscina");
    if (/\b(aire\s+acondicionado|split)\b/i.test(detalleClean)) tagsAdd.push("aire acondicionado");
    const queSumamos = tagsAdd.length ? tagsAdd.join(" y ") : "ese nuevo detalle";
    replyText =
      `Anotado${saludoNombre}! Ya sumamos ${queSumamos} a tu búsqueda activa.\n` +
      "Seguimos cruzando propiedades con tu perfil actualizado y te avisamos por acá apenas tengamos opciones para vos!";
    alertaAndon = true;
    motivoAndon = `T_ADD_DETAIL${primerNombre ? " (" + primerNombre + ")" : ""}: sumó ${queSumamos} sin resetear búsqueda.`;
  } else if (subtipo === "D2_RAMA_B_TURNO_3_PASO_2_GARANTIA") {
    replyText =
      "Para dejar tu búsqueda completa: con qué garantía pensás alquilar (podemos ayudarte con eso también)?";
  } else if (subtipo === "D2_RAMA_B_BUSQUEDA_COMPLETA") {
    replyText = armarMensajeCierreBusquedaRamaB(varsSilenciosas);
    alertaAndon = true;
    motivoAndon = "Rama B completa (Pasos 1-3-2): pasar a Pedidos Abiertos y activar matchmaker.";
  } else if (vertical === "D2" && subtipo === "DEMANDA_ALQUILER_GENERAL") {
    replyText =
      `Podés ver las fichas de alquiler anual activas hoy en ${ALQUILERES_URL}${utm} (incluyendo La Fortuna 2 dormitorios a $U 30.000 con gastos comunes y Wi-Fi incluidos).\n` +
      "Contás con garantía de aseguradora aprobada (Porto, Sura, Mapfre o Santander) o buscás con otra garantía en Maldonado?";
  } else if (subtipo === "AUTOSERVICIO_GENERAL") {
    esPasiva = true;
    replyText =
      "Hola, gracias por comunicarte con ZAGUÁN Propiedades (Punta del Este y Maldonado).\n" +
      `En nuestros accesos directos podés ver propiedades disponibles, precios y condiciones sin esperar respuesta: ${LINKS_URL}${utm}\n` +
      "Si tenés una consulta puntual o una propiedad para publicar, dejá zona y tipo de operación por acá.";
  } else if (arbol) {
    replyText = arbol.tiempos[etapaSla] || arbol.tiempos.T0_INMEDIATO;
  } else {
    esPasiva = true;
    replyText =
      "Hola, gracias por comunicarte con ZAGUÁN Propiedades (Punta del Este y Maldonado).\n" +
      `En nuestros accesos directos podés ver propiedades disponibles, precios y condiciones sin esperar respuesta: ${LINKS_URL}${utm}\n` +
      "Si tenés una consulta puntual o una propiedad para publicar, dejá zona y tipo de operación por acá.";
  }

  const overrideList = Array.isArray(options?.overrides) ? options.overrides : _activeOverrides;
  const matchedOverride = _matchD1Override(rawText, contextoPropiedad, vertical, subtipo, canal, overrideList);
  let verticalFinal = vertical;
  let subtipoFinal = subtipo;
  if (matchedOverride) {
    replyText = String(matchedOverride.respuesta_corregida || matchedOverride.respuesta || matchedOverride.replyText || matchedOverride.nueva_respuesta);
    const ovVert = String(matchedOverride.vertical_14 || matchedOverride.vertical || "").toUpperCase().trim();
    if (ovVert && ovVert !== "TODOS") verticalFinal = ovVert;
    if (matchedOverride.nuevo_subtipo) subtipoFinal = matchedOverride.nuevo_subtipo;
    if (typeof matchedOverride.alerta_andon === "boolean") {
      alertaAndon = matchedOverride.alerta_andon;
    }
    if (matchedOverride.motivo_andon) {
      motivoAndon = matchedOverride.motivo_andon;
    }
  }
  if (options?.leadId) {
    replyText = _appendLeadIdToLinks(replyText, options.leadId);
  }

  const pk = aplicarPokaYokeMar(replyText, verticalFinal, esPasiva, etapaSla);

  return {
    ok: true,
    vertical_14: verticalFinal,
    subtipo: subtipoFinal,
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
    variables_silenciosas: varsSilenciosas,
    override_id: matchedOverride?.id || null,
    override_aplicado: Boolean(matchedOverride),
  };
}

const REDTEAM_50_CONVERSACIONAL = [
  { id: "SIM-01", contexto: "la_fortuna", input: "Tengo Porto, Sura, Mapfre o Santander: quiero ver ficha y visitar", mustInclude: ["la-fortuna-agata", "30.000"], mustMatch: /d[ií]a.*horario|visitar/i, mustNotInclude: ["maps.google", "con el dueño"], expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-02", contexto: "la_fortuna", input: "Tengo ingresos para tramitar aseguradora y quiero ver la ficha", mustInclude: ["la-fortuna-agata", "nuestra gestión ZAGUÁN"], mustMatch: /ingresos|recibo|certificaci[oó]n|distribuci[oó]n/i, mustNotInclude: ["maps.google", "con el dueño", "qué día"], expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-03", contexto: "la_fortuna", input: "Busco con ANDA/CGN, en otra zona o tengo propiedad para publicar", mustInclude: ["aseguradora"], mustMatch: /barrio|rango|tope|propiedad/i, mustNotInclude: ["la-fortuna-agata"], expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-04", contexto: "la_fortuna", input: "Puedo ir el martes a las 16 hs", mustMatch: /visita|personas|martes|horario|confirm/i, mustNotInclude: ["Gracias por comunicarte con ZAGUÁN", "links/"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-05", contexto: "la_fortuna", input: "Cuánto son los gastos comunes aparte del alquiler?", mustInclude: ["30.000", "gastos comunes"], mustMatch: /incluidos|wi-fi|ute|ose/i, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-06", contexto: "la_fortuna", input: "Tengo un perro mediano, aceptan mascotas?", mustMatch: /mascota peque[nñ]a|tama[nñ]o|raza|consultar/i, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-07", contexto: "la_fortuna", input: "Me pasás la dirección exacta y el número de puerta para pasar a verlo?", mustMatch: /av\.\s*[aá]gata|la fortuna|coordinar|visita/i, mustNotInclude: ["maps.google", "-34.886", "con el dueño"], expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-08", contexto: "la_fortuna", input: "Cuánto piden de depósito o comisión para entrar y qué requisitos piden?", mustInclude: ["1 mes de alquiler + IVA"], mustMatch: /aseguradora|honorarios|comisi[oó]n|adelantado/i, mustNotInclude: ["ANDA aceptada", "con el dueño", "sin IVA"], expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-09", contexto: "santa_monica", input: "Evalúo compra contado USD 160.000: quiero video 2m31s y padrón", mustInclude: ["santa-monica-casa-hormigon", "160.000"], mustMatch: /2m31s|vivienda|inversi[oó]n/i, mustNotInclude: ["704", "manzana 26", "carpeta 8"], expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-10", contexto: "santa_monica", input: "Comparo lote vs. obra (USD 160.000): pido video 2m31s y croquis", mustInclude: ["santa-monica-casa-hormigon", "160.000"], mustMatch: /usd|fondos|contado|video/i, mustNotInclude: ["704", "manzana 26"], expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-11", contexto: "santa_monica", input: "Qué le falta terminar exactamente a la obra de Santa Mónica?", mustMatch: /hormig[oó]n armado|aberturas|revestimientos|terminaciones|cerramientos/i, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-12", contexto: "santa_monica", input: "Tiene planos aprobados o acepta préstamo de banco?", mustMatch: /djcu|regularizar|2027|contado/i, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-13", contexto: "santa_monica", input: "Lo evalúo para vivienda propia, cuento con los USD y quiero ver el video completo", mustMatch: /c[eé]dula catastral|348\s*m|201\s*m|video completo|visita/i, mustNotInclude: ["bóveda privada", "franja gris", "maría cristina"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-14", contexto: "general", input: "Busco terreno cerca de José Ignacio o La Barra para empezar a construir", mustInclude: ["santa-monica-casa-hormigon"], mustMatch: /348|hormig[oó]n|laguna/i, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-15", contexto: "pozo", input: "Busco apartamento en pozo en Maldonado desde USD 80.000 con cuotas", mustInclude: ["Betania IV", "79.800"], mustMatch: /24 cuotas|1,5%/i, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-16", contexto: "pozo", input: "Qué opciones tenés con exoneración de impuestos Ley 18.795 en Roosevelt?", mustInclude: ["Nostrum Roosevelt", "More Atlántico"], mustMatch: /itp|irpf|patrimonio/i, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-17", contexto: "pozo", input: "Cuánto son los gastos de ocupación y conexión aparte del precio de lista?", mustMatch: /1,5%|4%|5%|ocupaci[oó]n/i, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-18", contexto: "pozo", input: "Soy argentino y quiero saber si puedo comprar y firmar desde Buenos Aires", mustMatch: /exterior|notarial|reserva|escritura|distancia/i, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-19", contexto: "general", input: "Quiero comprar un apartamento en Playa Brava cerca del mar", mustMatch: /EVE Tower|150.000|financiaci[oó]n|proyectos/i, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-20", contexto: "general", input: "Necesito alquilar un local comercial u oficina en Maldonado o Punta del Este", mustMatch: /rubro|metr|trif[aá]sica|alquiler|compra/i, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-21", contexto: "dueno", input: "Tengo una casa en Pinares para alquilar todo el año, pido $U 35.000", mustMatch: /publicaci[oó]n abierta|garant[ií]a/i, mustNotInclude: ["sin exclusividad", "%", "comisión", "honorarios", "zaguanpropiedades.com/alquileres/la-fortuna"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-22", contexto: "dueno", input: "Cómo trabajan ustedes y cuánto cobran de comisión si venden mi propiedad?", mustMatch: /autorizaci[oó]n abierta|a resultado|por escrito/i, mustNotInclude: ["sin exclusividad", "%", "3%", "zaguanpropiedades.com/propiedades/", "garantía aseguradora", "franja gris"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-23", contexto: "dueno", input: "Tengo mi casa en venta en Maldonado, son 120 metros, pido USD 140.000, qué fotos necesitan?", mustMatch: /pdf|video|recorrido|t[ií]tulos|horarios/i, mustNotInclude: ["garantía aseguradora", "Porto", "ANDA", "zaguanpropiedades.com/propiedades/"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-24", contexto: "dueno", input: "Soy dueño de un local comercial en el centro de Maldonado para alquilar o vender", mustMatch: /metros|habilitaci[oó]n|trif[aá]sica|publicaci[oó]n abierta/i, mustNotInclude: ["sin exclusividad", "%", "comisión"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-25", contexto: "dueno", input: "Vendo mi terreno de 500 m2 en Manantiales, soy dueño directo", mustMatch: /padr[oó]n|servicios|frente|publicaci[oó]n abierta/i, mustNotInclude: ["sin exclusividad", "garantía aseguradora", "%", "comisión"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-26", contexto: "dueno", input: "Somos desarrolladora con edificio nuevo en pozo en Roosevelt y queremos sumarnos", mustMatch: /lista|cuotas|ocupaci[oó]n|pre-registro/i, expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-27", contexto: "general", input: "Buen día", mustInclude: ["zaguanpropiedades.com/links/"], mustNotInclude: ["mientras te respondo", "cómo podemos ayudarte"] },
  { id: "SIM-28", contexto: "santa_monica", input: "Puedo pasar el viernes de mañana a conocer el terreno y la obra", mustMatch: /viernes|ma[nñ]ana|visita|coordinar|nombre/i, mustNotInclude: ["Gracias por comunicarte con ZAGUÁN", "Porto"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-29", contexto: "la_fortuna", input: "Cuánto sale por mes y qué incluye?", mustInclude: ["30.000", "gastos comunes"], mustMatch: /wi-fi|aseguradora/i, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-30", contexto: "la_fortuna", input: "Se puede llamar o mandar un audio para consultar por el apartamento?", mustMatch: /audio|whatsapp|escrita|ac[aá]/i, mustNotInclude: ["Gracias por comunicarte con ZAGUÁN"], expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-31", contexto: "la_fortuna", input: "Muchas gracias, ya señé otro apartamento ayer", mustMatch: /gracias|avisarnos|b[uú]squeda|futuro/i, mustNotInclude: ["garantía aseguradora", "Qué día"], expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-32", contexto: "general", input: "Lo alquilan solo por enero o quincena de verano?", mustMatch: /anual|contrato de 1 a[nñ]o|todo el a[nñ]o/i, mustNotInclude: ["Gracias por comunicarte con ZAGUÁN"], expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-47", contexto: "la_fortuna", input: "Cuánto cobran de comisión inmobiliaria en La Fortuna?", mustInclude: ["1 mes de alquiler + IVA"], mustNotInclude: ["sin IVA", "con el dueño", "Jorge"], expectSubtipoNot: ["AUTOSERVICIO_GENERAL", "DUENO_TURNO_2_HONORARIOS"] },
  { id: "SIM-48", contexto: "santa_monica", input: "Cuánto es la comisión inmobiliaria si compro Santa Mónica o un pozo?", mustMatch: /condiciones comerciales|por escrito|no enviamos porcentajes/i, mustNotInclude: ["%", "3%", "sin IVA", "bóveda privada"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL", "DUENO_TURNO_2_HONORARIOS"] },
  { id: "SIM-49", contexto: "la_fortuna", input: "Con mi pareja sumamos $U 95.000 en recibos, llegamos para Porto o Sura?", mustInclude: ["sumar", "24/48", "la-fortuna-agata"], mustMatch: /d[ií]a.*horaria|visitar/i, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-50", contexto: "la_fortuna", input: "Soy Jime, tengo Sura aprobada, puedo ver La Fortuna este martes a las 15 hs?", mustMatch: /martes|p[oó]liza aprobada|personas|av\.\s*[aá]gata/i, mustNotInclude: ["con el dueño", "qué aseguradora tenés aprobada"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-51", contexto: "la_fortuna", input: "Tengo dos perros grandes, aceptan en La Fortuna?", mustMatch: /mascota peque[nñ]a|medianos o grandes|raza/i, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-52", etapa: "T2_NARANJA_24_HS", contexto: "la_fortuna", input: "Quiero recibir la ficha completa y ubicación exacta de La Fortuna", mustInclude: ["buenas tardes", "a estrenar", "este martes", "30.000"], mustMatch: /aseguradora|otra garant[ií]a/i, expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-53", contexto: "santa_monica", input: "Tengo USD 135.000 cash hoy por la casa de Santa Mónica, aceptan?", mustInclude: ["160.000", "348", "201"], mustMatch: /por escrito|recorrer|reposici[oó]n|visita/i, mustNotInclude: ["704", "manzana 26"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-54", contexto: "santa_monica", input: "Aceptan apartamento en Montevideo en parte de pago por Santa Mónica?", mustInclude: ["160.000", "contado en USD"], mustMatch: /monto l[ií]quido|entrega parcial|viabilidad/i, expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-55", contexto: "pozo", input: "Qué precios y cocheras tienen 1, 2 y 3 dormitorios en Betania IV?", mustInclude: ["79.800", "122.400", "133.200", "156.600", "1 estacionamiento en planta baja incluido", "1,5%"], expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-56", contexto: "dueno", input: "Te paso la grilla pero sin protección de punta ni pre-registro", mustInclude: ["60 días", "pre-registro nominal"], mustMatch: /nombre.*apellido|anticipo/i, expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-57", contexto: "pozo", input: "Vivo en Buenos Aires y quiero reservar en pozo a distancia", mustInclude: ["Poder Especial apostillado", "79.800"], mustMatch: /dni|pasaporte/i, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-58", contexto: "pozo", input: "Qué monto mínimo exige la residencia fiscal por inversión en Uruguay?", mustInclude: ["3.500.000 UI", "60 días"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-59", contexto: "dueno", input: "Alquilo mi casa anual en Maldonado Centro a $U 33.000", mustInclude: ["publicación abierta", "Porto, Sura o Mapfre"], mustNotInclude: ["sin exclusividad", "zaguanpropiedades.com/alquileres/", "%", "comisión", "honorarios"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-60", contexto: "santa_monica", input: "Para vivir todo el año, cuento con los USD 160.000 y quiero ver el video completo", mustInclude: ["348", "201", "DJCU vigente", "2027"], mustNotInclude: ["Padrón 704", "Manzana 26", "Carpeta 8", "María Cristina", "bóveda privada", "franja gris"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-61", contexto: "la_fortuna", input: "Hola", mustInclude: ["la-fortuna-agata", "utm_source=whatsapp", "nuestra gestión ZAGUÁN"], mustMatch: /apartamento|30\.000/i, mustNotInclude: ["zaguanpropiedades.com/links/", "sin exclusividad", "qué día"], expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-62", contexto: "la_fortuna", input: "Ya esa yo la fui a ver y me dijeron que el dueño no quería niños", mustInclude: ["hasta 4 personas", "mascota de raza pequeña", "nuestra gestión ZAGUÁN"], mustMatch: /apartamento|garant[ií]a aseguradora/i, mustNotInclude: ["directamente", "propietario", "dueño", "sin exclusividad"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-63", contexto: "la_fortuna", input: "Estoy en espera de otro apto, mañana a las 11 tengo la cita", mustInclude: ["mediodía", "prioridad"], mustMatch: /orden de cierre|11/i, mustNotInclude: ["directamente", "sin exclusividad"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-64", contexto: "general", input: "Tengo una casa en Maldonado para publicar", mustInclude: ["publicación abierta"], mustMatch: /venta o alquiler anual/i, mustNotInclude: ["sin exclusividad", "zaguanpropiedades.com/alquileres/", "zaguanpropiedades.com/links/", "%"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-65", contexto: "la_fortuna", input: "Busco alquiler anual para el 2027, tendrías opciones? En punta del este, hasta 40mil al mes", mustInclude: ["Te damos la bienvenida a Zaguán", "Punta del Este", "40.000", "2027", "desde qué mes pensás mudarte y cuántos dormitorios o para cuántas personas buscás?", "que esté amoblado", "podemos ayudarte con eso también"], mustNotInclude: ["La Fortuna", "la-fortuna-agata", "pero", "bienvenido", "agendad", "enero"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-66", contexto: "general", input: "Sería para mudarnos en abril, somos 2 personas", mustInclude: ["Tomamos nota", "Tenés mascota o hay alguna comodidad que necesites sí o sí, como cochera, patio o que esté amoblado?"], mustNotInclude: ["La Fortuna", "pero", "solo/sola", "muebles,"], expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-67", contexto: "general", input: "Sí, tengo mascota y necesito cochera", mustInclude: ["Qué mascota tenés"], mustNotInclude: ["qué mascota es", "casa con patio", "pero"], expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-68", contexto: "general", input: "No tengo mascota, necesito cochera y que esté amoblado", mustInclude: ["Para dejar tu búsqueda completa:", "*con qué garantía pensás alquilar (podemos ayudarte con eso también)?*"], mustNotInclude: ["pero", "bienvenido"], expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-69", contexto: "la_fortuna", input: "Busco para mudarme más adelante, mi contrato vence en junio", mustInclude: ["Te damos la bienvenida a Zaguán", "*desde qué mes pensás mudarte y cuántos dormitorios o para cuántas personas buscás?*"], mustNotInclude: ["La Fortuna", "la-fortuna-agata", "pero"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-70", contexto: "general", input: "No tengo garantía, pago solo efectivo o depósito", mustInclude: ["una sola persona o combinando ingresos de hasta 4 personas", "*Trabajás en relación de dependencia o de forma independiente?*"], mustNotInclude: ["pero"], expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-71", contexto: "general", input: "Trabajo en relación de dependencia en una empresa", mustInclude: ["3 recibos de sueldo", "documento", "30%", "una sola persona o combinando ingresos de hasta 4 personas"], mustNotInclude: ["pero", "agendado"], expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-72", contexto: "general", input: "Trabajo de forma independiente con unipersonal", mustInclude: ["BPS y DGI al día", "certificación contable", "último año", "30%"], mustNotInclude: ["pero", "agendado"], expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-73", contexto: "general", input: "Trabajo para afuera y cobro en el exterior", mustInclude: ["En Zaguán podemos conformar la garantía con comprobantes y certificado notarial.", "*Contás con facturas a tu nombre y disponés de extractos bancarios que reflejen que el alquiler representa menos de un 30% aprox. de tus ingresos justificables?*"], mustNotInclude: ["pero"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-74", contexto: "general", input: "No tengo ingresos demostrables ni recibo de sueldo", mustInclude: ["Cuántos meses de depósito podés cubrir"], mustNotInclude: ["pero"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
  { id: "SIM-75", contexto: "general", input: "Busco alquiler de marzo a noviembre para probar invierno o capaz todo el año", mustInclude: ["invernal", "marzo a noviembre", "anual", "12 meses", "dos contratos distintos con valores distintos"], mustNotInclude: ["La Fortuna", "pero"], expectAndon: true, expectSubtipoNot: ["AUTOSERVICIO_GENERAL"] },
];

const REDTEAM_14_INMEMORY_CONTRACTS = [
  { id: "SYS-33", contexto: "pozo", input: "Detalle de Betania IV y estacionamiento", mustInclude: ["79.800", "1 estacionamiento en planta baja incluido", "1,5%"], mustNotInclude: ["cotizada por separado", "precio aparte", "Ley 18.795"] },
  { id: "SYS-34", contexto: "pozo", input: "Tipologia 1D 40m2 en Betania IV", mustInclude: ["79.800", "1 estacionamiento en planta baja incluido", "1,5%"], mustNotInclude: ["precio aparte", "cotizada por separado"] },
  { id: "SYS-35", contexto: "pozo", input: "Tipologia 2D 62m2 en Betania IV", mustInclude: ["122.400", "1 estacionamiento en planta baja incluido"], mustNotInclude: ["precio aparte", "cotizada por separado"] },
  { id: "SYS-36", contexto: "pozo", input: "Tipologia 2D 68m2 en Betania IV", mustInclude: ["133.200", "1 estacionamiento en planta baja incluido"], mustNotInclude: ["precio aparte", "cotizada por separado"] },
  { id: "SYS-37", contexto: "pozo", input: "Apartamento 3D 78m2 en Betania IV con estacionamiento", mustInclude: ["156.600", "1 estacionamiento en planta baja incluido"], mustNotInclude: ["precio aparte", "cotizada por separado"] },
  { id: "SYS-38", contexto: "pozo", input: "Cochera en Betania IV viene aparte?", mustInclude: ["1 estacionamiento en planta baja incluido"], mustNotInclude: ["cotizada por separado", "precio aparte"] },
  { id: "SYS-39", contexto: "pozo", input: "Que entrega y financiacion tiene Betania IV?", mustInclude: ["24 cuotas", "1,5%"], mustNotInclude: ["Subsidio MVOT 30%", "Ley 18.795"] },
  { id: "SYS-40", contexto: "la_fortuna", leadId: "B2C-SYS40", input: "Cuánto piden de depósito o comisión para entrar y qué requisitos piden?", mustInclude: ["1 mes de alquiler + IVA"], mustNotInclude: ["sin IVA", "papá de Valentina", "099 925 848"] },
  { id: "SYS-41", contexto: "la_fortuna", input: "Aceptan deposito o BHU o ANDA en La Fortuna?", mustInclude: ["aseguradora"], mustNotInclude: ["ANDA aceptada", "con el dueño"] },
  { id: "SYS-42", contexto: "la_fortuna", input: "Cuánto cobran de comisión inmobiliaria en La Fortuna?", mustInclude: ["1 mes de alquiler + IVA"], mustNotInclude: ["sin IVA", "1 mes de alquiler al momento"] },
  { id: "SYS-43", contexto: "santa_monica", input: "Quiero saber el padron, manzana y nombre del dueno de Santa Monica", mustInclude: ["santa-monica-casa-hormigon", "160.000"], mustNotInclude: ["Padrón 704", "Manzana 26", "Carpeta 8", "María Cristina", "María Belén", "bóveda privada"] },
  { id: "SYS-44", contexto: "pozo", input: "Qué opciones tenés con exoneración de impuestos Ley 18.795 en Roosevelt?", mustInclude: ["Nostrum Roosevelt", "More Atlántico", "107.419"], mustNotInclude: ["sin IVA"] },
  { id: "SYS-45", contexto: "santa_monica", leadId: "B2C-SYS45", input: "Evalúo compra contado USD 160.000: quiero video 2m31s y padrón", mustInclude: ["santa-monica-casa-hormigon", "lid=B2C-SYS45"], mustNotInclude: ["Padrón 704", "Manzana 26", "Torres del Este", "maps.google", "-34."] },
  { id: "SYS-46", contexto: "dueno", input: "Cómo trabajan ustedes y cuánto cobran de comisión si venden mi propiedad?", mustMatch: /publicaci[oó]n abierta|autorizaci[oó]n abierta/i, mustNotInclude: ["sin exclusividad", "%", "3%"] },
];

export function validarOverrideCandidato(candidateOverride) {
  const errores = [];
  if (!candidateOverride || typeof candidateOverride !== "object") {
    return { pass: false, errores: ["OVERRIDE_VACIO"] };
  }
  const resp = String(
    candidateOverride.respuesta_corregida ||
      candidateOverride.respuesta ||
      candidateOverride.replyText ||
      candidateOverride.nueva_respuesta ||
      ""
  ).trim();
  if (resp.length < 10) errores.push("RESPUESTA_MUY_CORTA");

  const low = resp.toLowerCase();
  const forbiddenBase = [
    "sin exclusividad",
    "padrón 704",
    "padron 704",
    "manzana 26",
    "carpeta 8",
    "maría cristina",
    "maria cristina",
    "maría belén",
    "maria belen",
    "maps.google",
    "goo.gl/maps",
    "-34.886",
    "099 925 848",
    "anda aceptada",
    "sin iva",
    "con el dueño",
    "bóveda privada",
    "franja gris",
    "cotizada por separado",
    "torres del este",
    "qué mascota es",
    "que mascota es",
    "tus hijos",
    "tu pareja",
    "tu marido",
    "tu esposa",
    "tu familia",
  ];
  for (const b of forbiddenBase) {
    if (low.includes(b)) errores.push(`VIOLA_CANDADO_POKA_YOKE('${b}')`);
  }

  const ctx = String(candidateOverride.contexto || "general").toLowerCase();
  const vert = String(candidateOverride.vertical || candidateOverride.vertical_14 || "").toUpperCase();
  if ((ctx === "dueno" || ctx === "santa_monica" || /^O[1-6]$/.test(vert)) && /\b\d+(?:[.,]\d+)?\s*%/.test(resp)) {
    errores.push("VIOLA_CANDADO_NO_PORCENTAJES_EN_BOT_O_DUENOS");
  }

  const probeInput = String(
    candidateOverride.patron_normalizado || candidateOverride.patron || candidateOverride.input || candidateOverride.mensaje_cliente || "consulta de propiedad"
  );
  const res = clasificarYResponder(probeInput, candidateOverride.etapa_sla || "T0_INMEDIATO", ctx, candidateOverride.canal || "whatsapp", {
    overrides: [candidateOverride],
  });
  if (!res.pokayoke_pass) {
    errores.push(`POKA_YOKE_GATE_FAIL(${(res.pokayoke_violaciones || []).join(",")})`);
  }

  return { pass: errores.length === 0, errores };
}

export function runRedTeam64InMemory(candidateOverride = null, existingOverrides = null) {
  const base = Array.isArray(existingOverrides) ? existingOverrides : _activeOverrides;
  const candidateCheck = candidateOverride ? validarOverrideCandidato(candidateOverride) : { pass: true, errores: [] };
  const activePool = candidateOverride ? [...base, { ...candidateOverride, estado: "activo" }] : base;

  const allCases = [...REDTEAM_50_CONVERSACIONAL, ...REDTEAM_14_INMEMORY_CONTRACTS];
  const failed = [];

  if (!candidateCheck.pass) {
    failed.push({ id: "OVERRIDE-PRECHECK", errores: candidateCheck.errores });
  }

  let passedCount = 0;
  for (const esc of allCases) {
    const res = clasificarYResponder(esc.input, esc.etapa || "T0_INMEDIATO", esc.contexto || "general", "whatsapp", {
      overrides: activePool,
      leadId: esc.leadId || null,
    });
    const txt = res.replyText || "";
    const low = txt.toLowerCase();
    const errs = [];
    if (!res.pokayoke_pass) errs.push(`POKA_YOKE_FAIL:${(res.pokayoke_violaciones || []).join(",")}`);
    for (const s of esc.mustInclude || []) {
      if (!low.includes(s.toLowerCase())) errs.push(`FALTA('${s}')`);
    }
    if (esc.mustMatch && !esc.mustMatch.test(txt)) errs.push("NO_MATCH_ESPERADO");
    for (const b of esc.mustNotInclude || []) {
      if (low.includes(b.toLowerCase())) errs.push(`PROHIBIDO('${b}')`);
    }
    if (esc.expectAndon && !res.alerta_andon) errs.push("FALTA_ANDON");
    for (const sn of esc.expectSubtipoNot || []) {
      if (res.subtipo === sn) errs.push(`SUBTIPO_PROHIBIDO('${sn}')`);
    }
    if (errs.length === 0) passedCount++;
    else failed.push({ id: esc.id, errores: errs });
  }

  // SIM-76: Candados #13, #14 y #15 + Negrita en preguntas + Cierre 3 preguntas cortas + Cierre Rama B sin paréntesis ni \n\n
  const vs76 = extraerVariablesSilenciosasB2C("Busco alquiler en Punta del Este hasta 40mil para 1 o 2 personas");
  const p76_1 = aplicarPokaYokeMar("Bienvenida, pero agendado solo/sola qué mascota es cochera, patio, muebles", "D2");
  const p76_15 = aplicarPokaYokeMar("Buscamos una casa ideal para vos y tus hijos o tu familia.", "D2");
  const r3Q = clasificarYResponder("Sería para marzo 2027, 2 o 3 dormitorios con cochera en Punta del Este", "T0_INMEDIATO", "general", "whatsapp");
  const rCierre = clasificarYResponder(
    "Para marzo 2027, 2 o 3 dormitorios con cochera en Pinares hasta 40mil, prefiero amoblado no excluyente sirve sin muebles, con 1 perro y garantía depósito o aseguradora",
    "T0_INMEDIATO",
    "general",
    "whatsapp"
  );
  const sim76Errs = [];
  if (vs76.presupuesto_declarado !== 40000 || vs76.presupuesto_elastico_max !== 43000) sim76Errs.push("ELASTICO_FAIL");
  if (vs76.modalidad_gc !== "con_y_sin_gc") sim76Errs.push("GC_FAIL");
  if (!String(vs76.dormitorios_abiertos || "").includes("Monoambiente, 1 y 2 dormitorios")) sim76Errs.push("DORMS_FAIL");
  if (vs76.amoblado_preferencia !== "amoblado_y_sin_muebles") sim76Errs.push("AMOBLADO_FAIL");
  if (p76_1.pokayoke_pass) sim76Errs.push("CANDADOS_13_14_NO_BLOQUEARON");
  if (p76_15.pokayoke_pass || !p76_15.violaciones.includes("PROHIBIDO_ASUMIR_PARENTESCO")) sim76Errs.push("CANDADO_15_NO_BLOQUEO");
  if (r3Q.subtipo !== "D2_RAMA_B_CIERRE_3_PREGUNTAS" || !r3Q.pokayoke_pass || !r3Q.replyText.includes("- *buscás que esté amoblado o te da igual?*")) sim76Errs.push("CIERRE_3Q_FAIL");
  if (
    rCierre.subtipo !== "D2_RAMA_B_BUSQUEDA_COMPLETA" ||
    !rCierre.pokayoke_pass ||
    /[()]/.test(rCierre.replyText) ||
    rCierre.replyText.includes("\n\n") ||
    !/Clarísimo todo! Ya dejamos armada tu búsqueda para marzo 2027:\n_[^_\n]+_\nNos quedamos atentas y te escribiremos por acá apenas tengamos opciones para vos! \*Cómo es tu nombre para agendar tu búsqueda\?\*/.test(rCierre.replyText)
  ) {
    sim76Errs.push("CIERRE_RAMA_B_FORMATO_FAIL");
  }
  if (sim76Errs.length === 0) passedCount++;
  else failed.push({ id: "SIM-76", errores: sim76Errs });

  // SIM-77: Nombre recibido tras cierre Rama B ("Cecilia") con saltos simples \n sin renglones en blanco
  const r77 = clasificarYResponder("Cecilia Rial", "T1_SEGUIMIENTO", "general", "whatsapp", {
    leadState: { paso_actual: "D2_RAMA_B_BUSQUEDA_COMPLETA", rama_conversacion: "B" },
  });
  if (
    r77.subtipo === "D2_RAMA_B_NOMBRE_AGENDADO" &&
    r77.pokayoke_pass &&
    !r77.replyText.includes("\n\n") &&
    r77.replyText.includes("Un gusto, Cecilia!\ndejamos asentado tu nombre de contacto.\n") &&
    r77.alerta_andon
  ) {
    passedCount++;
  } else {
    failed.push({ id: "SIM-77", errores: [`NOMBRE_AGENDADO_FAIL:${r77.subtipo}`] });
  }

  // SIM-78: T_ADD_DETAIL post-cierre en busqueda_activa_abierta sin resetear a T0 ni re-enviar bienvenida
  const r78 = clasificarYResponder("Ah, me olvidé de decirte que tenga parrillero", "T1_SEGUIMIENTO", "general", "whatsapp", {
    leadState: {
      nombre: "Cecilia Rial",
      estado_conversacion: "busqueda_activa_abierta",
      estado_busqueda: "caza_activa_hoy",
      hito_expectativa_cliente: "2027-01-15",
      paso_actual: "BUSQUEDA_ACTIVA_ABIERTA",
      comodidades_pedidas: "Cochera",
    },
  });
  if (
    r78.subtipo === "T_ADD_DETAIL" &&
    r78.pokayoke_pass &&
    r78.replyText.includes("Anotado, Cecilia! Ya sumamos parrillero a tu búsqueda activa.") &&
    !r78.replyText.includes("Te damos la bienvenida") &&
    !r78.replyText.includes("\n\n")
  ) {
    passedCount++;
  } else {
    failed.push({ id: "SIM-78", errores: [`T_ADD_DETAIL_FAIL:${r78.subtipo}`] });
  }

  // SIM-79: Formato Shift+Enter \n simple y guiones claros abajo sin renglones en blanco en toda respuesta de Mar
  const r79 = clasificarYResponder("Busco alquiler anual para el 2027 en punta del este hasta 40mil", "T0_INMEDIATO", "la_fortuna", "whatsapp");
  if (
    r79.pokayoke_pass &&
    !r79.replyText.includes("\n\n") &&
    r79.replyText.includes("- _si tenés mascota") &&
    r3Q.replyText.includes("- *tenés mascota?*") &&
    !r3Q.replyText.includes("\n\n")
  ) {
    passedCount++;
  } else {
    failed.push({ id: "SIM-79", errores: ["FORMATO_SHIFT_ENTER_FAIL"] });
  }

  // SIM-80: Doble Reloj (caza_activa_hoy + hito 2027-01-15) + Suma aditiva de comodidades sin pisar Cochera
  const vs80 = extraerVariablesSilenciosasB2C("Ah, me olvidé de decirte que tenga parrillero y fondo cercado", {
    nombre: "Cecilia Rial",
    estado_conversacion: "busqueda_activa_abierta",
    estado_busqueda: "caza_activa_hoy",
    hito_expectativa_cliente: "2027-01-15",
    comodidades_pedidas: "Cochera",
    presupuesto_declarado: 40000,
    presupuesto_elastico_max: 43000,
  });
  if (
    vs80.estado_conversacion === "busqueda_activa_abierta" &&
    vs80.estado_busqueda === "caza_activa_hoy" &&
    vs80.hito_expectativa_cliente === "2027-01-15" &&
    vs80.comodidades_pedidas.includes("Cochera") &&
    vs80.comodidades_pedidas.includes("Parrillero") &&
    vs80.comodidades_pedidas.includes("Fondo cercado") &&
    vs80.presupuesto_elastico_max === 43000
  ) {
    passedCount++;
  } else {
    failed.push({ id: "SIM-80", errores: ["DOBLE_RELOJ_SUMA_ADITIVA_FAIL"] });
  }

  // SIM-81 (+598 99 495 954): "Hola me pasas fotos de la casa?!" en alquiler no desvía a D3 Santa Mónica
  const r81 = clasificarYResponder("Hola me pasas fotos de la casa?!", "T0_INMEDIATO", "la_fortuna", "whatsapp");
  if (r81.vertical_14 === "D2" && r81.subtipo === "LA_FORTUNA_FOTOS_DESDE_AVISO" && r81.pokayoke_pass && !r81.replyText.includes("160.000") && !/semáforo|semaforo/i.test(r81.replyText)) {
    passedCount++;
  } else {
    failed.push({ id: "SIM-81", errores: [`SIM81_FAIL:${r81.vertical_14}/${r81.subtipo}`] });
  }

  // SIM-82 (+598 95 518 412): Pareja con recibos de sueldo en Turno 2
  const r82 = clasificarYResponder("Espectaculares! Están re lindos. Mi marido y yo tenemos recibos de sueldo, cómo sería eso?", "T1_SEGUIMIENTO", "la_fortuna", "whatsapp");
  if (r82.vertical_14 === "D2" && r82.subtipo === "D2_ASEGURADORA_COMO_FUNCIONA_RECIBOS" && r82.pokayoke_pass && /3 recibos/.test(r82.replyText) && !/semáforo|semaforo|verde/i.test(r82.replyText)) {
    passedCount++;
  } else {
    failed.push({ id: "SIM-82", errores: [`SIM82_FAIL:${r82.vertical_14}/${r82.subtipo}`] });
  }

  // SIM-83 (+598 95 535 999): La Barra / Maldonado Centro 2D anual amoblado USD 1.200-1.400 + 2 niños + Sura/BSE/Porto
  const r83 = clasificarYResponder("Busco alquiler anual en La Barra o Maldonado Centro, 2 dormitorios amoblado, dos niños de 7 y 12, con Sura BSE o Porto, hasta USD 1400", "T0_INMEDIATO", "general", "whatsapp");
  const vs83 = r83.variables_silenciosas || {};
  if (r83.vertical_14 === "D2" && vs83.moneda === "USD" && vs83.presupuesto_declarado === 1400 && vs83.amoblado_preferencia === "amoblado" && /BSE/.test(vs83.garantia_disponible || "") && r83.pokayoke_pass) {
    passedCount++;
  } else {
    failed.push({ id: "SIM-83", errores: [`SIM83_FAIL:${r83.vertical_14}/${r83.subtipo}/${vs83.moneda}/${vs83.presupuesto_declarado}/${vs83.garantia_disponible}`] });
  }

  // SIM-84 (+598 99 561 277): Ya visitó por fuera y tiene recibos listos -> encauza a pre-evaluación sin fricción
  const r84 = clasificarYResponder("Ya tengo todo. Te parece si mañana voy con mi esposo al apartamento y vemos bien todo? Yo fui a verla y no tenía aseguradora", "T1_SEGUIMIENTO", "la_fortuna", "whatsapp");
  if (r84.vertical_14 === "D2" && r84.subtipo === "D2_YA_VISITO_CON_RECIBOS_PREPOLIZA" && r84.pokayoke_pass && /24 hs/.test(r84.replyText)) {
    passedCount++;
  } else {
    failed.push({ id: "SIM-84", errores: [`SIM84_FAIL:${r84.vertical_14}/${r84.subtipo}`] });
  }

  // SIM-85 (+598 93 828 732): Clearing antiguo + co-firmante con mejor historial
  const r85 = clasificarYResponder("Estoy en el Clearing hace años, mi mujer tiene mejor historial por lo que averigüé", "T1_SEGUIMIENTO", "la_fortuna", "whatsapp");
  if (r85.vertical_14 === "D2" && r85.subtipo === "D2_CLEARING_HISTORIAL_PAREJA" && r85.pokayoke_pass && /historial limpio/.test(r85.replyText)) {
    passedCount++;
  } else {
    failed.push({ id: "SIM-85", errores: [`SIM85_FAIL:${r85.vertical_14}/${r85.subtipo}`] });
  }

  const totalAll = allCases.length + 10;
  const ok = candidateCheck.pass && passedCount === totalAll && failed.length === 0;
  return {
    ok,
    passed: passedCount,
    total: totalAll,
    failed,
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
        const refBlob = `${message?.referral?.headline || ""} ${message?.referral?.body || ""} ${message?.referral?.source_url || ""}`.toLowerCase();
        const inferredCtx = refBlob.includes("fortuna") || refBlob.includes("agata")
          ? "la_fortuna"
          : (refBlob.includes("santa m") || refBlob.includes("hormigon") ? "santa_monica" : "general");
        const contextoPropiedad = body?.contexto_propiedad || inferredCtx;
        const canal = body?.canal || "whatsapp";
        const resultado = clasificarYResponder(text, etapaSla, contextoPropiedad, canal);

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
