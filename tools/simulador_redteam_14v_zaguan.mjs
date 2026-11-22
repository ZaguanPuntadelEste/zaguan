#!/usr/bin/env node
/**
 * Simulador Red-Team Multi-Turno (32 Escenarios Reales) · 1 - ZAGUÁN
 * Audita las 14 Verticales (O1..O7 / D1..D7), Turnos 1/2/3, objeciones reales,
 * consultas de Meta Ads, Google Search y respuestas de dueños directos.
 *
 * Uso:
 *   node tools/simulador_redteam_14v_zaguan.mjs [--baseline]
 */
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { clasificarYResponder } from '../workers/whatsapp-triage/index.js';

const DRIVE_OUT = '/Users/arianawajntraub/Library/CloudStorage/GoogleDrive-ariana@starunionservicios.com.ar/Mi unidad/zaguan/zaguan-main/admin/REPORTE_SIMULACION_32_ESCENARIOS.json';
const DESK_OUT = '/Users/arianawajntraub/Desktop/ZAGUAN CLAUDE/REPORTE_SIMULACION_32_ESCENARIOS.json';

export const ESCENARIOS_32 = [
  // BLOQUE 1: META ADS LA FORTUNA (D2 · Turnos 1, 2, 3 + Objeciones)
  {
    id: 'SIM-01', bloque: 'La Fortuna · Meta Ads', turno: 'T0 · Botón 1', contexto: 'la_fortuna',
    input: 'Tengo Porto, Sura, Mapfre o Santander: quiero ver ficha y visitar',
    mustInclude: ['la-fortuna-agata', '30.000'],
    mustMatch: /d[ií]a.*horario|visitar/i,
    mustNotInclude: ['maps.google', 'con el dueño'],
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-02', bloque: 'La Fortuna · Meta Ads', turno: 'T0 · Botón 2', contexto: 'la_fortuna',
    input: 'Tengo ingresos para tramitar aseguradora y quiero ver la ficha',
    mustInclude: ['la-fortuna-agata', '24/48'],
    mustMatch: /pre-aprobar|ingresos/i,
    mustNotInclude: ['maps.google', 'con el dueño'],
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-03', bloque: 'La Fortuna · Meta Ads', turno: 'T0 · Botón 3', contexto: 'la_fortuna',
    input: 'Busco con ANDA/CGN, en otra zona o tengo propiedad para publicar',
    mustInclude: ['aseguradora'],
    mustMatch: /barrio|rango|tope|propiedad/i,
    mustNotInclude: ['la-fortuna-agata'],
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-04', bloque: 'La Fortuna · Turno 2', turno: 'T2 · Cita/Agenda', contexto: 'la_fortuna',
    input: 'Puedo ir el martes a las 16 hs',
    mustMatch: /visita|personas|martes|horario|confirm/i,
    mustNotInclude: ['Gracias por comunicarte con ZAGUÁN', 'links/'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-05', bloque: 'La Fortuna · Turno 2', turno: 'T2 · Objeción GC', contexto: 'la_fortuna',
    input: 'Cuánto son los gastos comunes aparte del alquiler?',
    mustInclude: ['30.000', 'gastos comunes'],
    mustMatch: /incluidos|wi-fi|ute|ose/i,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-06', bloque: 'La Fortuna · Turno 2', turno: 'T2 · Mascota', contexto: 'la_fortuna',
    input: 'Tengo un perro mediano, aceptan mascotas?',
    mustMatch: /mascota peque[nñ]a|tama[nñ]o|raza|consultar/i,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-07', bloque: 'La Fortuna · Turno 2', turno: 'T2 · Dirección exacta', contexto: 'la_fortuna',
    input: 'Me pasás la dirección exacta y el número de puerta para pasar a verlo?',
    mustMatch: /av\.\s*[aá]gata|la fortuna|coordinar|visita/i,
    mustNotInclude: ['maps.google', '-34.886', 'con el dueño'],
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-08', bloque: 'La Fortuna · Turno 2', turno: 'T2 · Requisitos/Costos ingreso', contexto: 'la_fortuna',
    input: 'Cuánto piden de depósito o comisión para entrar y qué requisitos piden?',
    mustMatch: /aseguradora|honorarios|comisi[oó]n|adelantado|1 mes/i,
    mustNotInclude: ['ANDA aceptada', 'con el dueño'],
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },

  // BLOQUE 2: SANTA MÓNICA / PROYECTO O5 / CRUCE D7 (Meta + Web + Turno 2)
  {
    id: 'SIM-09', bloque: 'Santa Mónica · O5/D7', turno: 'T0 · Botón 1 USD 160k', contexto: 'santa_monica',
    input: 'Evalúo compra contado USD 160.000: quiero video 2m31s y padrón',
    mustInclude: ['santa-monica-casa-hormigon', '160.000'],
    mustMatch: /2m31s|vivienda|inversi[oó]n/i,
    mustNotInclude: ['704', 'manzana 26', 'carpeta 8'],
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-10', bloque: 'Santa Mónica · O5/D7', turno: 'T0 · Botón 2 Cruce Lote', contexto: 'santa_monica',
    input: 'Comparo lote vs. obra (USD 160.000): pido video 2m31s y croquis',
    mustInclude: ['santa-monica-casa-hormigon', '160.000'],
    mustMatch: /usd|fondos|contado|video/i,
    mustNotInclude: ['704', 'manzana 26'],
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-11', bloque: 'Santa Mónica · O5/D7', turno: 'T2 · Qué falta de obra', contexto: 'santa_monica',
    input: 'Qué le falta terminar exactamente a la obra de Santa Mónica?',
    mustMatch: /hormig[oó]n armado|aberturas|revestimientos|terminaciones|cerramientos/i,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-12', bloque: 'Santa Mónica · O5/D7', turno: 'T2 · Planos / Banco / Decreto', contexto: 'santa_monica',
    input: 'Tiene planos aprobados o acepta préstamo de banco?',
    mustMatch: /djcu|regularizar|2027|contado/i,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-13', bloque: 'Santa Mónica · O5/D7', turno: 'T2 · Responde viviendo/contado', contexto: 'santa_monica',
    input: 'Lo evalúo para vivienda propia, cuento con los USD y quiero ver el video completo',
    mustMatch: /c[eé]dula catastral|348\s*m|201\s*m|video completo|visita/i,
    mustNotInclude: ['bóveda privada', 'franja gris', 'maría cristina'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-14', bloque: 'Cruce Latente D7 -> O5', turno: 'T0 · Busca lote José Ignacio', contexto: 'general',
    input: 'Busco terreno cerca de José Ignacio o La Barra para empezar a construir',
    mustInclude: ['santa-monica-casa-hormigon'],
    mustMatch: /348|hormig[oó]n|laguna/i,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },

  // BLOQUE 3: GOOGLE SEARCH / POZO O7 / DEMANDA D1 (Sin miedo a prender Search)
  {
    id: 'SIM-15', bloque: 'Google Search · Pozo D1', turno: 'T0 · Presupuesto bajo', contexto: 'pozo',
    input: 'Busco apartamento en pozo en Maldonado desde USD 80.000 con cuotas',
    mustInclude: ['Betania IV', '79.800'],
    mustMatch: /24 cuotas|1,5%/i,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-16', bloque: 'Google Search · Pozo D1', turno: 'T0 · Ley 18.795 Vivienda Promovida', contexto: 'pozo',
    input: 'Qué opciones tenés con exoneración de impuestos Ley 18.795 en Roosevelt?',
    mustInclude: ['Nostrum Roosevelt', 'More Atlántico'],
    mustMatch: /itp|irpf|patrimonio/i,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-17', bloque: 'Google Search · Pozo D1', turno: 'T2 · Gastos de ocupación', contexto: 'pozo',
    input: 'Cuánto son los gastos de ocupación y conexión aparte del precio de lista?',
    mustMatch: /1,5%|4%|5%|ocupaci[oó]n/i,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-18', bloque: 'Google Search · Pozo D1', turno: 'T2 · Comprador exterior / argentino', contexto: 'pozo',
    input: 'Soy argentino y quiero saber si puedo comprar y firmar desde Buenos Aires',
    mustMatch: /exterior|notarial|reserva|escritura|distancia/i,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-19', bloque: 'Google Search · D4 Apto usado vs Pozo', turno: 'T0 · Busca apto en Brava', contexto: 'general',
    input: 'Quiero comprar un apartamento en Playa Brava cerca del mar',
    mustMatch: /EVE Tower|150.000|financiaci[oó]n|proyectos/i,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-20', bloque: 'Google Search · D6 Comercial', turno: 'T0 · Busca local', contexto: 'general',
    input: 'Necesito alquilar un local comercial u oficina en Maldonado o Punta del Este',
    mustMatch: /rubro|metr|trif[aá]sica|alquiler|compra/i,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },

  // BLOQUE 4: RESPUESTAS DE DUEÑOS DIRECTOS / PROSPECCIÓN (O1..O7)
  {
    id: 'SIM-21', bloque: 'Dueño O6 · Captación Alquiler', turno: 'T0 · Dueño escribe', contexto: 'dueno',
    input: 'Tengo una casa en Pinares para alquilar todo el año, pido $U 35.000',
    mustMatch: /sin exclusividad|garant[ií]a/i,
    mustNotInclude: ['%', 'comisión', 'honorarios', 'zaguanpropiedades.com/alquileres/la-fortuna'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-22', bloque: 'Dueño O1..O5 · Turno 2', turno: 'T2 · Pregunta cuánto cobran', contexto: 'dueno',
    input: 'Cómo trabajan ustedes y cuánto cobran de comisión si venden mi propiedad?',
    mustMatch: /sin exclusividad|honorarios|3%|mes/i,
    mustNotInclude: ['zaguanpropiedades.com/propiedades/', 'garantía aseguradora', 'franja gris'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-23', bloque: 'Dueño O1 · Venta Casa', turno: 'T2 · Dueño manda datos', contexto: 'dueno',
    input: 'Tengo mi casa en venta en Maldonado, son 120 metros, pido USD 140.000, qué fotos necesitan?',
    mustMatch: /pdf|video|recorrido|t[ií]tulos|horarios/i,
    mustNotInclude: ['garantía aseguradora', 'Porto', 'ANDA', 'zaguanpropiedades.com/propiedades/'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-24', bloque: 'Dueño O3 · Comercial', turno: 'T0 · Dueño ofrece local', contexto: 'dueno',
    input: 'Soy dueño de un local comercial en el centro de Maldonado para alquilar o vender',
    mustMatch: /metros|habilitaci[oó]n|trif[aá]sica|sin exclusividad/i,
    mustNotInclude: ['%', 'comisión'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-25', bloque: 'Dueño O4 · Lote', turno: 'T0 · Dueño ofrece terreno', contexto: 'dueno',
    input: 'Vendo mi terreno de 500 m2 en Manantiales, soy dueño directo',
    mustMatch: /padr[oó]n|servicios|frente|sin exclusividad/i,
    mustNotInclude: ['garantía aseguradora', '%', 'comisión'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-26', bloque: 'Dueño O7 · Desarrolladora', turno: 'T0 · Desarrolladora', contexto: 'dueno',
    input: 'Somos desarrolladora con edificio nuevo en pozo en Roosevelt y queremos sumarnos',
    mustMatch: /lista|cuotas|ocupaci[oó]n|pre-registro/i,
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },

  // BLOQUE 5: CASOS AMBIGUOS, SEGUIMIENTO Y BORDES (Anti-Fallbacks Ciegos)
  {
    id: 'SIM-27', bloque: 'Borde · Saludo frío', turno: 'T0 · Solo Hola', contexto: 'general',
    input: 'Buen día',
    mustInclude: ['zaguanpropiedades.com/links/'],
    mustNotInclude: ['mientras te respondo', 'cómo podemos ayudarte'],
  },
  {
    id: 'SIM-28', bloque: 'Borde · Cita en Santa Mónica', turno: 'T2 · Propone día compra', contexto: 'santa_monica',
    input: 'Puedo pasar el viernes de mañana a conocer el terreno y la obra',
    mustMatch: /viernes|ma[nñ]ana|visita|coordinar|nombre/i,
    mustNotInclude: ['Gracias por comunicarte con ZAGUÁN', 'Porto'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-29', bloque: 'Borde · Pide precio sin decir qué', turno: 'T1 · Pregunta suelta', contexto: 'la_fortuna',
    input: 'Cuánto sale por mes y qué incluye?',
    mustInclude: ['30.000', 'gastos comunes'],
    mustMatch: /wi-fi|aseguradora/i,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-30', bloque: 'Borde · Respuesta de audio / no puede hablar', contexto: 'la_fortuna', turno: 'T2 · Audio / Llama',
    input: 'Se puede llamar o mandar un audio para consultar por el apartamento?',
    mustMatch: /audio|whatsapp|escrita|ac[aá]/i,
    mustNotInclude: ['Gracias por comunicarte con ZAGUÁN'],
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-31', bloque: 'Borde · Cierre negativo educado', turno: 'T2 · Ya consiguió', contexto: 'la_fortuna',
    input: 'Muchas gracias, ya señé otro apartamento ayer',
    mustMatch: /gracias|avisarnos|b[uú]squeda|futuro/i,
    mustNotInclude: ['garantía aseguradora', 'Qué día'],
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-32', bloque: 'Borde · Alquiler temporada vs anual', turno: 'T1 · Pregunta verano', contexto: 'general',
    input: 'Lo alquilan solo por enero o quincena de verano?',
    mustMatch: /anual|contrato de 1 a[nñ]o|todo el a[nñ]o/i,
    mustNotInclude: ['Gracias por comunicarte con ZAGUÁN'],
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
];

function evaluarEscenario(esc) {
  const etapa = esc.etapa || 'T0_INMEDIATO';
  const res = clasificarYResponder(esc.input, etapa, esc.contexto);
  const txt = res.replyText || '';
  const low = txt.toLowerCase();
  const errores = [];

  if (!res.pokayoke_pass) {
    errores.push(`POKA_YOKE_FAIL: ${(res.pokayoke_violaciones || []).join(',')}`);
  }
  for (const s of (esc.mustInclude || [])) {
    if (!low.includes(s.toLowerCase())) errores.push(`FALTA_TEXTO('${s}')`);
  }
  if (esc.mustMatch && !esc.mustMatch.test(txt)) {
    errores.push(`NO_CONTESTA_LO_PREGUNTADO(${esc.mustMatch})`);
  }
  for (const b of (esc.mustNotInclude || [])) {
    if (low.includes(b.toLowerCase())) errores.push(`TEXTO_PROHIBIDO('${b}')`);
  }
  if (esc.expectAndon && !res.alerta_andon) {
    errores.push('FALTA_ALERTA_ANDON');
  }
  for (const sn of (esc.expectSubtipoNot || [])) {
    if (res.subtipo === sn) errores.push(`CAYO_EN_SUBTIPO_GENERICO('${sn}')`);
  }

  return {
    id: esc.id,
    bloque: esc.bloque,
    turno: esc.turno,
    contexto: esc.contexto,
    input: esc.input,
    pass: errores.length === 0,
    errores,
    vertical_detectada: res.vertical_14,
    subtipo_detectado: res.subtipo,
    alerta_andon: res.alerta_andon,
    replyText: txt,
  };
}

export function correrSimulacion() {
  const resultados = ESCENARIOS_32.map(evaluarEscenario);
  const pasaron = resultados.filter((r) => r.pass).length;
  const fallaron = resultados.filter((r) => !r.pass);
  return {
    fecha: new Date().toISOString(),
    total: resultados.length,
    pasaron,
    fallaron_count: fallaron.length,
    tasa_exito: `${Math.round((pasaron / resultados.length) * 100)}%`,
    fallos_resumen: fallaron.map((f) => ({
      id: f.id,
      bloque: f.bloque,
      input: f.input,
      subtipo_detectado: f.subtipo_detectado,
      errores: f.errores,
      reply_obtenido: f.replyText.slice(0, 140),
    })),
    resultados,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const rep = correrSimulacion();
  const isBaseline = process.argv.includes('--baseline');
  if (!isBaseline) {
    const js = JSON.stringify(rep, null, 2);
    writeFileSync(DRIVE_OUT, js);
    writeFileSync(DESK_OUT, js);
  }
  console.log(JSON.stringify({
    modo: isBaseline ? 'BASELINE_ANTES_DE_ARREGLAR' : 'POST_CORRECCION',
    total: rep.total,
    pasaron: rep.pasaron,
    fallaron: rep.fallaron_count,
    tasa_exito: rep.tasa_exito,
    primeros_fallos: rep.fallos_resumen.slice(0, 8),
  }, null, 2));
  if (!isBaseline && rep.fallaron_count > 0) process.exit(1);
}
