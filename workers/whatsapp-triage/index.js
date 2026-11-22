/**
 * Cloudflare Worker: WhatsApp Triage 14 Verticales · ZAGUÁN Propiedades
 * Motor determinista de clasificación (O1..O7 / D1..D7), detección de faltantes en 2 capas,
 * cruces latentes (ej. D7 -> O5 Santa Mónica) y Poka-Yoke de Mar + Candado de Franja Gris.
 */

const LINKS_URL = "https://zaguanpropiedades.com/links/";
const LA_FORTUNA_URL = "https://zaguanpropiedades.com/alquileres/la-fortuna-agata/";
const ALQUILERES_URL = "https://zaguanpropiedades.com/alquileres/";
const PROYECTOS_URL = "https://zaguanpropiedades.com/proyectos/";

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

  // Botones exactos de Meta Ads La Fortuna (ZAG-ALQ-05)
  if (t.includes("tengo garantía aseguradora") || t.includes("tengo garantia aseguradora")) {
    return { vertical: "D2", subtipo: "LA_FORTUNA_VISITA_FILTRADA" };
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

export function aplicarPokaYokeMar(texto, vertical, esRespuestaPasiva = false) {
  let out = String(texto || "").trim();
  const violaciones = [];

  // 1. Eliminar apertura ¿ y ¡
  if (/[¿¡]/.test(out)) {
    out = out.replace(/[¿¡]/g, "");
  }

  // 2. Candado de Franja Gris: si el destinatario es dueño (O1..O6), bloquear links públicos de fichas individuales
  const esDueno = /^O[1-6]$/.test(vertical);
  if (esDueno) {
    const fichaUrlRe = /https?:\/\/zaguanpropiedades\.com\/(?:alquileres|ventas|proyectos)\/[a-z0-9-]+\/?/gi;
    if (fichaUrlRe.test(out)) {
      violaciones.push("CANDADO_FRANJA_GRIS_URL_PUBLICA_A_DUENO");
      out = out.replace(fichaUrlRe, LINKS_URL);
    }
  }

  // 3. Prohibido preguntar garantías en ventas (O1..O5, O7, D1, D3..D7)
  if (!["O6", "D2"].includes(vertical) && /\b(porto|sura|mapfre|anda|cgn|garant[ií]a aseguradora)\b/i.test(out)) {
    violaciones.push("GARANTIA_EN_VERTICAL_NO_ALQUILER");
  }

  // 4. Linter SÍ/NO: cero adverbios en -mente y cero "encajar"
  if (/\b[a-záéíóúüñ]+mente\b/i.test(out)) {
    violaciones.push("ADVERBIO_MENTE");
  }
  if (/\bencajar\b/i.test(out)) {
    violaciones.push("PALABRA_PROHIBIDA_ENCAJAR");
  }

  // 5. Prohibido prometer respuesta inmediata o saludo genérico en bienvenida pasiva
  if (esRespuestaPasiva && /\b(mientras te respondo|c[oó]mo podemos ayudarte|contame qu[eé] est[aá]s buscando,\s*as[ií] te paso)\b/i.test(out)) {
    violaciones.push("PROMESA_FALSA_ATENCION_INMEDIATA");
  }

  return {
    texto: out,
    pokayoke_pass: violaciones.length === 0,
    violaciones,
  };
}

export function clasificarYResponder(rawText) {
  const { vertical, subtipo } = clasificarVertical14(rawText);
  const spec = VERTICAL_SPECS[vertical] || VERTICAL_SPECS.D2;
  const analisis = detectarFaltantes(vertical, rawText);
  let replyText = "";
  let alertaAndon = false;
  let motivoAndon = "";
  let esPasiva = false;

  if (subtipo === "LA_FORTUNA_VISITA_FILTRADA") {
    replyText =
      "Excelente. Te confirmo los datos reales del apartamento de 2 dormitorios a estrenar en La Fortuna (Av. Ágata, Maldonado):\n" +
      "• Valor mensual: $U 30.000 (gastos comunes y Wi-Fi de alta velocidad incluidos; luz y agua aparte).\n" +
      "• Comodidades: living-comedor con balcón al frente, cochera fija dentro del predio y admite mascota pequeña.\n" +
      "• Garantía: aseguradora (Porto Seguro, Sura, Mapfre o Santander; el propietario no trabaja con ANDA).\n\n" +
      `Ficha y fotos: ${LA_FORTUNA_URL}\n` +
      "Indicanos qué aseguradora tenés aprobada y qué día y franja horaria te sirve para coordinar la visita.";
    alertaAndon = true;
    motivoAndon = "Lead de Meta Ads La Fortuna con garantía aseguradora listo para coordinar visita con Jorge (MP-12).";
  } else if (subtipo === "LA_FORTUNA_FICHA") {
    replyText =
      "Te comparto la ficha completa del apartamento de 2 dormitorios a estrenar en Barrio La Fortuna (Av. Ágata, Maldonado):\n" +
      "• Precio: $U 30.000 / mes con gastos comunes y Wi-Fi incluidos (UTE y OSE aparte).\n" +
      "• Detalles: balcón al frente, baño en porcelanato, cochera fija y acepta mascota pequeña.\n" +
      "• Condiciones: contrato anual con garantía aseguradora (Porto, Sura, Mapfre o Santander; no ANDA).\n\n" +
      `Ver ficha y fotos: ${LA_FORTUNA_URL}\n` +
      "Si contás con garantía aseguradora y te sirve el rango, dejanos qué día buscás visitarlo.";
  } else if (subtipo === "TRIAJE_DUAL_OPCION_3") {
    replyText =
      "Para avanzar sin esperas, elegí tu camino directo:\n\n" +
      `• Si buscás alquilar o comprar en otra zona: entrá a nuestros accesos con precios y fichas disponibles hoy en ${LINKS_URL} y dejanos zona, tipología y presupuesto.\n` +
      "• Si tenés una propiedad para vender o alquilar: contanos zona, tipo de propiedad y valor pretendido (trabajamos sin exclusividad).";
    alertaAndon = true;
    motivoAndon = "Lead tocó Opción 3 (otra zona o captación de propiedad); requiere revisión tras respuesta.";
  } else if (vertical === "D7") {
    replyText =
      "Además de lotes libres, tenemos una opción de construcción base en hormigón lista para proyectar arriba frente a la laguna en Santa Mónica (llegando a José Ignacio), a USD 160.000:\n" +
      "• Estructura calculada para vientos oceánicos y croquis base para completar tu proyecto sin arrancar de cero.\n" +
      "• Contamos con video completo de recorrido para ver la obra real y el entorno frente a la laguna.\n\n" +
      `Si buscás comparar también otras opciones en el territorio, mirá ${LINKS_URL} y decinos si querés que te enviemos el video completo.`;
    alertaAndon = true;
    motivoAndon = "Cruce latente D7 -> O5 activado (lote/proyecto -> construcción base Santa Mónica con video).";
  } else if (vertical === "O5") {
    replyText =
      "Recibido. Para ordenar la ficha interna de tu proyecto de construcción (trabajamos sin exclusividad y cuidamos la difusión antes de publicar), necesitamos relevar estos puntos:\n" +
      `1. ${analisis.faltantes_capa_1.join("\n2. ")}\n` +
      "Además, si tenés video completo de recorrido, memoria constructiva (ej. estructura para vientos), antigüedad/avance o papeles del terreno en PDF, podés mandarlos por acá.";
    alertaAndon = true;
    motivoAndon = "Alta inbound de proyecto de construcción (O5): activar detector Capa 2 y Bienvenida de OKs (bajo Candado Franja Gris).";
  } else if (/^O[1-6]$/.test(vertical)) {
    replyText =
      "Recibido. Trabajamos con publicación abierta sin exclusividad, filtrando interesados antes de coordinar visitas.\n" +
      `Para evaluar y ordenar el material de tu propiedad, envianos:\n• ${analisis.faltantes_capa_1.slice(0, 4).join("\n• ")}`;
    alertaAndon = true;
    motivoAndon = `Alta inbound de propietario (${vertical}): pasar a Planilla Master y Bienvenida de OKs.`;
  } else if (vertical === "D1") {
    replyText =
      `Podés ver los 5 desarrollos en pozo activos hoy (desde USD 79.800 en Maldonado y eje Roosevelt / Playa Brava) en ${PROYECTOS_URL}.\n` +
      "Dejanos tipología (1, 2 o 3 dormitorios), objetivo (renta o vivienda) y si necesitás cuotas durante la obra para enviarte planos y costos totales de cierre.";
  } else if (vertical === "D2" && subtipo === "DEMANDA_ALQUILER_GENERAL") {
    replyText =
      `Podés ver las fichas de alquiler anual activas hoy en ${ALQUILERES_URL} (incluyendo 2 dormitorios a estrenar en La Fortuna a $U 30.000 con GC y Wi-Fi incluidos).\n` +
      "Si buscás otra zona o rango, dejanos barrio, dormitorios, presupuesto y garantía aprobada (Porto, Sura, Mapfre, Santander o ANDA).";
  } else {
    esPasiva = true;
    replyText =
      "Hola, gracias por comunicarte con ZAGUÁN Propiedades (Punta del Este y Maldonado).\n" +
      `En nuestros accesos directos podés ver propiedades disponibles, precios y condiciones sin esperar respuesta: ${LINKS_URL}\n` +
      "Si ya tenés una consulta puntual o una propiedad para publicar, dejá los detalles por acá.";
  }

  const pk = aplicarPokaYokeMar(replyText, vertical, esPasiva);

  return {
    ok: true,
    vertical_14: vertical,
    subtipo,
    intent: spec.intent,
    replyText: pk.texto,
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

        const resultado = clasificarYResponder(text);

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
