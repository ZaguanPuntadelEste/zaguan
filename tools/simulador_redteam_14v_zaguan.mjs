#!/usr/bin/env node
/**
 * Simulador Red-Team Multi-Turno & Auditoría Cruzada (60 Escenarios Reales) · 1 - ZAGUÁN
 * Audita:
 *  - SIM-01..32: Las 14 Verticales (O1..O7 / D1..D7), Turnos 1/2/3, Meta Ads, Google Search y Dueños.
 *  - SIM-33..46: Auditoría cruzada en vivo leyendo HTML públicos reales en disco vs. Motor WhatsApp vs. CSV.
 *  - SIM-47..60: Casos conversacionales de borde (Doble Punta + IVA, pareja, contraoferta, permuta, Betania 2D/3D, visita martes).
 *
 * Uso:
 *   node tools/simulador_redteam_14v_zaguan.mjs [--baseline]
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { clasificarYResponder, aplicarPokaYokeMar, extraerVariablesSilenciosasB2C } from '../workers/whatsapp-triage/index.js';
import { evaluarCorchetesPropietario } from '../workers/shared/corchetes-14v.js';

const REPO_ROOT = '/Users/arianawajntraub/Library/CloudStorage/GoogleDrive-ariana@starunionservicios.com.ar/Mi unidad/zaguan/zaguan-main';
const DRIVE_OUT_60 = join(REPO_ROOT, 'admin/REPORTE_SIMULACION_60_ESCENARIOS.json');
const DESK_OUT_60 = '/Users/arianawajntraub/Desktop/ZAGUAN CLAUDE/REPORTE_SIMULACION_60_ESCENARIOS.json';

function readHtml(rel) {
  const full = join(REPO_ROOT, rel);
  if (!existsSync(full)) return null;
  return readFileSync(full, 'utf8');
}

function makeHtmlAuditScenario(id, bloque, relPath, {
  mustInclude = [],
  mustNotInclude = [],
  mustExistPaths = [],
  mustNotExistPaths = [],
  customCheck = null,
}) {
  return {
    id,
    bloque,
    turno: 'HTML vs. Motor',
    contexto: 'web_html',
    tipo: 'CROSS_AUDIT_HTML',
    input: `Auditoría en disco: ${relPath}`,
    evaluate: () => {
      const errores = [];
      for (const mp of mustNotExistPaths) {
        if (existsSync(join(REPO_ROOT, mp))) {
          errores.push(`ARCHIVO_PRIVADO_EXPUESTO_EN_REPO('${mp}')`);
        }
      }
      for (const ep of mustExistPaths) {
        if (!existsSync(join(REPO_ROOT, ep))) {
          errores.push(`ENLACE_404_FALTANTE('${ep}')`);
        }
      }
      const html = readHtml(relPath);
      if (html === null) {
        errores.push(`FALTA_ARCHIVO('${relPath}')`);
        return { pass: false, errores, replyText: `ERROR: No existe ${relPath}` };
      }
      const low = html.toLowerCase();
      for (const s of mustInclude) {
        if (!low.includes(s.toLowerCase())) errores.push(`FALTA_EN_HTML('${s}')`);
      }
      for (const b of mustNotInclude) {
        if (low.includes(b.toLowerCase())) errores.push(`CONTRADICCION_O_FUGA_EN_HTML('${b}')`);
      }
      if (customCheck) {
        const extra = customCheck(html, low);
        if (Array.isArray(extra)) errores.push(...extra);
      }
      return {
        pass: errores.length === 0,
        errores,
        vertical_detectada: 'QA_HTML',
        subtipo_detectado: errores.length === 0 ? 'CONSISTENCIA_WEB_OK' : 'INCONSISTENCIA_WEB',
        alerta_andon: errores.length > 0,
        replyText: errores.length === 0
          ? `VERIFICADO EN DISCO (${relPath}): sin contradicciones, ${mustInclude.length} invariantes cumplidas.`
          : `FALLOS EN ${relPath}: ${errores.join(' | ')}`,
      };
    },
  };
}

export const ESCENARIOS_60 = [
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
    mustInclude: ['la-fortuna-agata', 'nuestra gestión ZAGUÁN'],
    mustMatch: /ingresos|recibo|certificaci[oó]n|distribuci[oó]n/i,
    mustNotInclude: ['maps.google', 'con el dueño', 'qué día'],
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
    id: 'SIM-08', bloque: 'La Fortuna · Turno 2', turno: 'T2 · Requisitos/Costos ingreso (+ IVA)', contexto: 'la_fortuna',
    input: 'Cuánto piden de depósito o comisión para entrar y qué requisitos piden?',
    mustInclude: ['1 mes de alquiler + IVA'],
    mustMatch: /aseguradora|honorarios|comisi[oó]n|adelantado/i,
    mustNotInclude: ['ANDA aceptada', 'con el dueño', 'sin IVA'],
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
    id: 'SIM-13', bloque: 'Santa Mónica · O5/D7', turno: 'T2 · Responde vivienda/contado', contexto: 'santa_monica',
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

  // BLOQUE 3: GOOGLE SEARCH / POZO O7 / DEMANDA D1
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
    mustMatch: /publicaci[oó]n abierta|garant[ií]a/i,
    mustNotInclude: ['sin exclusividad', '%', 'comisión', 'honorarios', 'zaguanpropiedades.com/alquileres/la-fortuna'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-22', bloque: 'Dueño O1..O5 · Turno 2', turno: 'T2 · Pregunta cuánto cobran', contexto: 'dueno',
    input: 'Cómo trabajan ustedes y cuánto cobran de comisión si venden mi propiedad?',
    mustMatch: /autorizaci[oó]n abierta|a resultado|por escrito/i,
    mustNotInclude: ['sin exclusividad', '%', '3%', 'zaguanpropiedades.com/propiedades/', 'garantía aseguradora', 'franja gris'],
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
    mustMatch: /metros|habilitaci[oó]n|trif[aá]sica|publicaci[oó]n abierta/i,
    mustNotInclude: ['sin exclusividad', '%', 'comisión'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-25', bloque: 'Dueño O4 · Lote', turno: 'T0 · Dueño ofrece terreno', contexto: 'dueno',
    input: 'Vendo mi terreno de 500 m2 en Manantiales, soy dueño directo',
    mustMatch: /padr[oó]n|servicios|frente|publicaci[oó]n abierta/i,
    mustNotInclude: ['sin exclusividad', 'garantía aseguradora', '%', 'comisión'],
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

  // BLOQUE 5: CASOS AMBIGUOS, SEGUIMIENTO Y BORDES
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
    id: 'SIM-30', bloque: 'Borde · Respuesta de audio / llama', turno: 'T2 · Audio / Llama', contexto: 'la_fortuna',
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

  // BLOQUE 6: AUDITORÍA CRUZADA EN DISCO — FICHAS HTML REALES VS. MOTOR VS. FUENTES OFICIALES (SIM-33 a SIM-46)
  makeHtmlAuditScenario('SIM-33', 'QA Web · Betania IV Principal', 'proyectos/betania-iv/index.html', {
    mustInclude: ['Desde USD 79.800', '1 estacionamiento en planta baja incluido', '1,5%', 'Octubre de 2028'],
    mustNotInclude: ['cotizada por separado', 'precio aparte', 'Financiación 95% BHU', 'Subsidio MVOT 30%', 'Ley 18.795'],
    mustExistPaths: [
      'proyectos/betania-iv/1d-40m2/index.html',
      'proyectos/betania-iv/2d-62m2/index.html',
      'proyectos/betania-iv/2d-68m2/index.html',
      'proyectos/betania-iv/2d-68m2-accesible/index.html',
      'proyectos/betania-iv/3d-78m2/index.html',
    ],
  }),
  makeHtmlAuditScenario('SIM-34', 'QA Web · Betania IV 1D 40 m²', 'proyectos/betania-iv/1d-40m2/index.html', {
    mustInclude: ['1 estacionamiento en planta baja incluido', '1,5%', 'Desde USD 79.800'],
    mustNotInclude: ['precio aparte', 'cotizada por separado'],
  }),
  makeHtmlAuditScenario('SIM-35', 'QA Web · Betania IV 2D 62 m²', 'proyectos/betania-iv/2d-62m2/index.html', {
    mustInclude: ['1 estacionamiento en planta baja incluido', '1,5%', 'Desde USD 79.800'],
    mustNotInclude: ['precio aparte', 'cotizada por separado'],
  }),
  makeHtmlAuditScenario('SIM-36', 'QA Web · Betania IV 2D 68 m²', 'proyectos/betania-iv/2d-68m2/index.html', {
    mustInclude: ['1 estacionamiento en planta baja incluido', '1,5%', 'Desde USD 79.800'],
    mustNotInclude: ['precio aparte', 'cotizada por separado'],
  }),
  makeHtmlAuditScenario('SIM-37', 'QA Web · Betania IV 2D 68 m² Accesible', 'proyectos/betania-iv/2d-68m2-accesible/index.html', {
    mustInclude: ['1 estacionamiento en planta baja incluido', '1,5%', 'Desde USD 79.800'],
    mustNotInclude: ['precio aparte', 'cotizada por separado'],
  }),
  makeHtmlAuditScenario('SIM-38', 'QA Web · Betania IV 3D 78 m²', 'proyectos/betania-iv/3d-78m2/index.html', {
    mustInclude: ['1 estacionamiento en planta baja incluido', '1,5%', 'Desde USD 79.800'],
    mustNotInclude: ['precio aparte', 'cotizada por separado'],
  }),
  makeHtmlAuditScenario('SIM-39', 'QA Web · Nota Blog Betania IV', 'novedades-del-este/betania-iv-apartamentos-en-pozo-maldonado/index.html', {
    mustInclude: ['1 plaza de estacionamiento en planta baja dentro del precio'],
    mustNotInclude: ['La cochera y sus condiciones se consultan', 'cotizada por separado'],
  }),
  makeHtmlAuditScenario('SIM-40', 'QA Web · La Fortuna Doble Punta (+ IVA) + Form GA4', 'alquileres/la-fortuna-agata/index.html', {
    mustInclude: ['1 mes de alquiler + IVA', '$U 30.000', 'lf-garantia', 'lf-turno', 'generate_lead'],
    mustNotInclude: ['1 mes de alquiler al momento', 'sin IVA', 'papá de Valentina', '099 925 848'],
  }),
  makeHtmlAuditScenario('SIM-41', 'QA Web · El Tesoro Doble Punta (+ IVA)', 'alquileres/el-tesoro-juana-de-america/index.html', {
    mustInclude: ['1 mes de alquiler + IVA'],
    mustNotInclude: ['1 mes de alquiler al momento', 'sin IVA'],
  }),
  makeHtmlAuditScenario('SIM-42', 'QA Web · Resto Alquileres (+ IVA)', 'alquileres/la-brava-parada-8-3d/index.html', {
    mustInclude: ['1 mes de alquiler + IVA'],
    customCheck: () => {
      const files = [
        'alquileres/roosevelt-cantegril-2d/index.html',
        'alquileres/la-mansa-parada-16-2d/index.html',
        'alquileres/maldonado-residencial-2d/index.html',
        'alquileres/catalogo-extendido-test/la-brava-parada-8-3d/index.html',
        'alquileres/catalogo-extendido-test/roosevelt-cantegril-2d/index.html',
        'alquileres/catalogo-extendido-test/la-mansa-parada-16-2d/index.html',
        'alquileres/catalogo-extendido-test/maldonado-residencial-2d/index.html',
      ];
      const errs = [];
      for (const f of files) {
        const c = readHtml(f);
        if (!c) errs.push(`FALTA_ARCHIVO('${f}')`);
        else if (!c.includes('1 mes de alquiler + IVA')) errs.push(`OMITE_IVA_HONORARIOS('${f}')`);
      }
      return errs;
    },
  }),
  makeHtmlAuditScenario('SIM-43', 'QA Web · Santa Mónica Bóveda Privada + Laguna', 'propiedades/santa-monica-casa-hormigon/index.html', {
    mustInclude: ['USD 160.000', '348', '201', 'Frente a la Laguna'],
    mustNotInclude: ['Padrón 704', 'Manzana 26', 'Carpeta 8', 'María Cristina', 'deuda', 'Casa en construcción'],
  }),
  makeHtmlAuditScenario('SIM-44', 'QA Web · Otros 4 Pozos (Precios & Golden Rise Lock)', 'proyectos/nostrum-roosevelt/index.html', {
    mustInclude: ['USD 107.419', 'Enero de 2030', '4%'],
    customCheck: () => {
      const errs = [];
      const ma = readHtml('proyectos/more-atlantico/index.html') || '';
      if (!ma.includes('139.121') || !ma.includes('5%')) errs.push('DESACOPLE_MORE_ATLANTICO');
      const gr = readHtml('proyectos/golden-rise/index.html') || '';
      if (!gr.includes('USD 139.900') || !gr.includes('Diciembre de 2028')) errs.push('DESACOPLE_GOLDEN_RISE');
      const grSinBase = gr.replaceAll('USD 139.900', '').replaceAll('139900', '');
      if (/\bUSD\s?\d{2,}|\bU\$S\s?\d{2,}/i.test(grSinBase)) errs.push('GOLDEN_RISE_EXPONE_PRECIO_INTERMEDIO');
      const eve = readHtml('proyectos/eve-tower/index.html') || '';
      if (!eve.includes('USD 150.000') || !eve.includes('Diciembre de 2028')) errs.push('DESACOPLE_EVE_TOWER');
      return errs;
    },
  }),
  makeHtmlAuditScenario('SIM-45', 'QA Repo · Bóveda Privada Fuera de Web Pública', 'llms.txt', {
    mustInclude: ['1 estacionamiento en planta baja incluido', '1,5%'],
    mustNotExistPaths: ['admin/FICHAS_PRIVADAS_BOVEDA_ZAGUAN.json'],
    mustNotInclude: ['Padrón 704', 'Manzana 26', 'Torres del Este'],
  }),
  makeHtmlAuditScenario('SIM-46', 'QA Repo · Consistencia Linter & Validador', 'tools/ads/lint_copys.py', {
    mustInclude: ['1 estacionamiento PB incluido'],
    mustNotInclude: ['cochera\\s+incluida'],
    customCheck: () => {
      const val = readHtml('tools/catalog/validate.py') || '';
      return val.includes('cochera incluida') ? ['VAL_PY_OBSOLETO_COCHERA_INCLUIDA'] : [];
    },
  }),

  // BLOQUE 7: CASOS CONVERSACIONALES DE BORDE Y REGLA DOBLE PUNTA (SIM-47 a SIM-60)
  {
    id: 'SIM-47', bloque: 'Doble Punta · Consulta Inquilino', turno: 'T1 · Comisión La Fortuna', contexto: 'la_fortuna',
    input: 'Cuánto cobran de comisión inmobiliaria en La Fortuna?',
    mustInclude: ['1 mes de alquiler + IVA'],
    mustNotInclude: ['sin IVA', 'con el dueño', 'Jorge'],
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL', 'DUENO_TURNO_2_HONORARIOS'],
  },
  {
    id: 'SIM-48', bloque: 'Doble Punta · Consulta Compra (Sin % en Bot)', turno: 'T1 · Deriva a Andon', contexto: 'santa_monica',
    input: 'Cuánto es la comisión inmobiliaria si compro Santa Mónica o un pozo?',
    mustMatch: /condiciones comerciales|por escrito|no enviamos porcentajes/i,
    mustNotInclude: ['%', '3%', 'sin IVA', 'bóveda privada'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL', 'DUENO_TURNO_2_HONORARIOS'],
  },
  {
    id: 'SIM-49', bloque: 'La Fortuna · Pareja Suma Ingresos', turno: 'T2 · Suma recibos', contexto: 'la_fortuna',
    input: 'Con mi pareja sumamos $U 95.000 en recibos, llegamos para Porto o Sura?',
    mustInclude: ['sumar', '24/48', 'la-fortuna-agata'],
    mustMatch: /d[ií]a.*horaria|visitar/i,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-50', bloque: 'La Fortuna · Cita Martes Concreta', turno: 'T2 · Confirma martes + Sura', contexto: 'la_fortuna',
    input: 'Soy Jime, tengo Sura aprobada, puedo ver La Fortuna este martes a las 15 hs?',
    mustMatch: /martes|p[oó]liza aprobada|personas|av\.\s*[aá]gata/i,
    mustNotInclude: ['con el dueño', 'qué aseguradora tenés aprobada'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-51', bloque: 'La Fortuna · Dos Perros Grandes', turno: 'T2 · Objeción mascota grande', contexto: 'la_fortuna',
    input: 'Tengo dos perros grandes, aceptan en La Fortuna?',
    mustMatch: /mascota peque[nñ]a|medianos o grandes|raza/i,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-52', bloque: 'La Fortuna · Rescate Invita Horarios Martes', turno: 'T2 · SLA 24hs', contexto: 'la_fortuna',
    etapa: 'T2_NARANJA_24_HS',
    input: 'Quiero recibir la ficha completa y ubicación exacta de La Fortuna',
    mustInclude: ['buenas tardes', 'a estrenar', 'este martes', '30.000'],
    mustMatch: /aseguradora|otra garant[ií]a/i,
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-53', bloque: 'Santa Mónica · Contraoferta Agresiva', turno: 'T2 · Oferta USD 135k', contexto: 'santa_monica',
    input: 'Tengo USD 135.000 cash hoy por la casa de Santa Mónica, aceptan?',
    mustInclude: ['160.000', '348', '201'],
    mustMatch: /por escrito|recorrer|reposici[oó]n|visita/i,
    mustNotInclude: ['704', 'manzana 26'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-54', bloque: 'Santa Mónica · Permuta', turno: 'T2 · Entrega propiedad', contexto: 'santa_monica',
    input: 'Aceptan apartamento en Montevideo en parte de pago por Santa Mónica?',
    mustInclude: ['160.000', 'contado en USD'],
    mustMatch: /monto l[ií]quido|entrega parcial|viabilidad/i,
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-55', bloque: 'Betania IV · Tipologías 2D/3D y Cochera', turno: 'T1 · Consulta precios internos', contexto: 'pozo',
    input: 'Qué precios y cocheras tienen 1, 2 y 3 dormitorios en Betania IV?',
    mustInclude: ['79.800', '122.400', '133.200', '156.600', '1 estacionamiento en planta baja incluido', '1,5%'],
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-56', bloque: 'Desarrolladora O7 · Objeción Pre-Registro', turno: 'T2 · Protege punta', contexto: 'dueno',
    input: 'Te paso la grilla pero sin protección de punta ni pre-registro',
    mustInclude: ['60 días', 'pre-registro nominal'],
    mustMatch: /nombre.*apellido|anticipo/i,
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-57', bloque: 'Google Search · Comprador Exterior Bilingüe', turno: 'T2 · Reserva a distancia', contexto: 'pozo',
    input: 'Vivo en Buenos Aires y quiero reservar en pozo a distancia',
    mustInclude: ['Poder Especial apostillado', '79.800'],
    mustMatch: /dni|pasaporte/i,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-58', bloque: 'Google Search · Pozo Residencia Fiscal', turno: 'T1 · Umbral UI', contexto: 'pozo',
    input: 'Qué monto mínimo exige la residencia fiscal por inversión en Uruguay?',
    mustInclude: ['3.500.000 UI', '60 días'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-59', bloque: 'Poka-Yoke · Franja Gris O6', turno: 'T0 · Dueño alquila anual', contexto: 'dueno',
    input: 'Alquilo mi casa anual en Maldonado Centro a $U 33.000',
    mustInclude: ['publicación abierta', 'Porto, Sura o Mapfre'],
    mustNotInclude: ['sin exclusividad', 'zaguanpropiedades.com/alquileres/', '%', 'comisión', 'honorarios'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-60', bloque: 'Poka-Yoke · Santa Mónica Cero Fugas Turno 2', turno: 'T2 · Bóveda Privada aislada', contexto: 'santa_monica',
    input: 'Para vivir todo el año, cuento con los USD 160.000 y quiero ver el video completo',
    mustInclude: ['348', '201', 'DJCU vigente', '2027'],
    mustNotInclude: ['Padrón 704', 'Manzana 26', 'Carpeta 8', 'María Cristina', 'bóveda privada', 'franja gris'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-61', bloque: 'La Fortuna · Hola desde Aviso', turno: 'T0 · Saludo directo desde anuncio', contexto: 'la_fortuna',
    input: 'Hola',
    mustInclude: ['la-fortuna-agata', 'utm_source=whatsapp', 'nuestra gestión ZAGUÁN'],
    mustMatch: /apartamento|30\.000/i,
    mustNotInclude: ['zaguanpropiedades.com/links/', 'sin exclusividad', 'qué día'],
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-62', bloque: 'La Fortuna · Caso Lianet T1', turno: 'T1 · Objeción niños y visita previa', contexto: 'la_fortuna',
    input: 'Ya esa yo la fui a ver y me dijeron que el dueño no quería niños',
    mustInclude: ['familias con niños', 'nuestra gestión ZAGUÁN'],
    mustMatch: /apartamento|garant[ií]a aseguradora/i,
    mustNotInclude: ['directamente', 'propietario', 'dueño', 'sin exclusividad'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-63', bloque: 'La Fortuna · Caso Lianet T2', turno: 'T2 · Competencia cita mañana 11 hs', contexto: 'la_fortuna',
    input: 'Estoy en espera de otro apto, mañana a las 11 tengo la cita',
    mustInclude: ['mediodía', 'prioridad'],
    mustMatch: /orden de cierre|11/i,
    mustNotInclude: ['directamente', 'sin exclusividad'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-64', bloque: 'Dueños · Captación Pura', turno: 'T0 · Tengo una casa para publicar', contexto: 'general',
    input: 'Tengo una casa en Maldonado para publicar',
    mustInclude: ['publicación abierta'],
    mustMatch: /venta o alquiler anual/i,
    mustNotInclude: ['sin exclusividad', 'zaguanpropiedades.com/alquileres/', 'zaguanpropiedades.com/links/', '%'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  // BLOQUE 8: MATRIZ BASE D2 ALQUILER ANUAL / INVERNAL · MULTI-TURNO 1->3->2 · ÁRBOL GARANTÍA · 14 CANDADOS (SIM-65 a SIM-76)
  {
    id: 'SIM-65', bloque: 'Rama B · Búsqueda Abierta 2027', turno: 'T1 · Paso 1 Punta del Este $40k', contexto: 'la_fortuna',
    input: 'Busco alquiler anual para el 2027, tendrías opciones? En punta del este, hasta 40mil al mes',
    mustInclude: ['Te damos la bienvenida a Zaguán', 'Punta del Este', '40.000', '2027', 'desde qué mes pensás mudarte y cuántos dormitorios o para cuántas personas buscás?', 'que esté amoblado', 'podemos ayudarte con eso también'],
    mustNotInclude: ['La Fortuna', 'la-fortuna-agata', 'pero', 'bienvenido', 'agendad', 'enero'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-66', bloque: 'Rama B · Multi-Turno Orden 1->3->2', turno: 'T2 · Paso 3 Mascota/Comodidades', contexto: 'general',
    input: 'Sería para mudarnos en abril, somos 2 personas',
    mustInclude: ['Tomamos nota', 'Tenés mascota o hay alguna comodidad que necesites sí o sí, como cochera, patio o que esté amoblado?'],
    mustNotInclude: ['La Fortuna', 'pero', 'solo/sola', 'muebles,'],
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-67', bloque: 'Rama B · Mascota Detalle', turno: 'T2 · Qué mascota tenés', contexto: 'general',
    input: 'Sí, tengo mascota y necesito cochera',
    mustInclude: ['Qué mascota tenés'],
    mustNotInclude: ['qué mascota es', 'casa con patio', 'pero'],
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-68', bloque: 'Rama B · Paso 2 Garantía al Final', turno: 'T3 · Comodidades OK -> Garantía', contexto: 'general',
    input: 'No tengo mascota, necesito cochera y que esté amoblado',
    mustInclude: ['Para dejar tu búsqueda completa:', '*con qué garantía pensás alquilar (podemos ayudarte con eso también)?*'],
    mustNotInclude: ['pero', 'bienvenido'],
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-69', bloque: 'Rama A -> Rama B Automático', turno: 'T1 · Mudanza futura desde La Fortuna', contexto: 'la_fortuna',
    input: 'Busco para mudarme más adelante, mi contrato vence en junio',
    mustInclude: ['Te damos la bienvenida a Zaguán', '*desde qué mes pensás mudarte y cuántos dormitorios o para cuántas personas buscás?*'],
    mustNotInclude: ['La Fortuna', 'la-fortuna-agata', 'pero'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-70', bloque: 'Árbol Garantía · Paso 1 Efectivo/Depósito', turno: 'T2 · Sin garantía previa', contexto: 'general',
    input: 'No tengo garantía, pago solo efectivo o depósito',
    mustInclude: ['una sola persona o combinando ingresos de hasta 4 personas', '*Trabajás en relación de dependencia o de forma independiente?*'],
    mustNotInclude: ['pero'],
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-71', bloque: 'Árbol Garantía · Dependencia', turno: 'T2 · 3 recibos + 30%', contexto: 'general',
    input: 'Trabajo en relación de dependencia en una empresa',
    mustInclude: ['3 recibos de sueldo', 'documento', '30%', 'una sola persona o combinando ingresos de hasta 4 personas'],
    mustNotInclude: ['pero', 'agendado'],
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-72', bloque: 'Árbol Garantía · Independiente', turno: 'T2 · BPS/DGI + Certificación', contexto: 'general',
    input: 'Trabajo de forma independiente con unipersonal',
    mustInclude: ['BPS y DGI al día', 'certificación contable', 'último año', '30%'],
    mustNotInclude: ['pero', 'agendado'],
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-73', bloque: 'Árbol Garantía · Exterior / Notarial', turno: 'T2 · Ingresos exterior', contexto: 'general',
    input: 'Trabajo para afuera y cobro en el exterior',
    mustInclude: ['En Zaguán podemos conformar la garantía con comprobantes y certificado notarial.', '*Contás con facturas a tu nombre y disponés de extractos bancarios que reflejen que el alquiler representa menos de un 30% aprox. de tus ingresos justificables?*'],
    mustNotInclude: ['pero'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-74', bloque: 'Árbol Garantía · Sin Ingresos', turno: 'T2 · Meses de depósito', contexto: 'general',
    input: 'No tengo ingresos demostrables ni recibo de sueldo',
    mustInclude: ['Cuántos meses de depósito podés cubrir'],
    mustNotInclude: ['pero'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-75', bloque: 'Invernal vs. Anual', turno: 'T1 · Contrato marzo a noviembre vs 12 meses', contexto: 'general',
    input: 'Busco alquiler de marzo a noviembre para probar invierno o capaz todo el año',
    mustInclude: ['invernal', 'marzo a noviembre', 'anual', '12 meses', 'dos contratos distintos con valores distintos'],
    mustNotInclude: ['La Fortuna', 'pero'],
    expectAndon: true,
    expectSubtipoNot: ['AUTOSERVICIO_GENERAL'],
  },
  {
    id: 'SIM-76',
    bloque: 'Candados #13/#14/#15 + Negrita Preguntas + Cierre 3Q y Rama B',
    turno: 'Validación Unitaria',
    contexto: 'd2_interno',
    tipo: 'CROSS_AUDIT_HTML',
    input: 'Candados #13/#14/#15 + Presupuesto elástico $40k -> $43k + Negritas + Cierre Rama B',
    evaluate: () => {
      const errores = [];
      const vs = extraerVariablesSilenciosasB2C('Busco alquiler en Punta del Este hasta 40mil para 1 o 2 personas');
      if (vs.presupuesto_declarado !== 40000 || vs.presupuesto_elastico_max !== 43000) errores.push('FALLA_ELASTICO_43000');
      if (vs.modalidad_gc !== 'con_y_sin_gc') errores.push('FALLA_MODALIDAD_GC');
      if (!String(vs.dormitorios_abiertos || '').includes('Monoambiente, 1 y 2 dormitorios')) errores.push('FALLA_DORMS_ABIERTOS');
      if (vs.amoblado_preferencia !== 'amoblado_y_sin_muebles') errores.push('FALLA_AMOBLADO_PREF');

      const badPero = aplicarPokaYokeMar('Tenemos opciones pero en otro barrio.', 'D2');
      if (badPero.pokayoke_pass || !badPero.violaciones.includes('PROHIBIDO_PERO_COMERCIAL')) errores.push('NO_BLOQUEA_PERO');

      const badGen = aplicarPokaYokeMar('Bienvenido, quedás agendado solo/sola. Qué mascota es y necesitás muebles?', 'D2');
      if (badGen.pokayoke_pass) errores.push('NO_BLOQUEA_CANDADO_14');

      const badPar = aplicarPokaYokeMar('Ideal para vos y tus hijos en Punta del Este.', 'D2');
      if (badPar.pokayoke_pass || !badPar.violaciones.includes('PROHIBIDO_ASUMIR_PARENTESCO')) errores.push('NO_BLOQUEA_CANDADO_15');

      const r3Q = clasificarYResponder('Sería para marzo 2027, 2 o 3 dormitorios con cochera en Punta del Este', 'T0_INMEDIATO', 'general', 'whatsapp');
      if (r3Q.subtipo !== 'D2_RAMA_B_CIERRE_3_PREGUNTAS' || !r3Q.pokayoke_pass || !r3Q.replyText.includes('- *buscás que esté amoblado o te da igual?*')) errores.push('FALLA_CIERRE_3Q');

      const rCierre = clasificarYResponder(
        'Para marzo 2027, 2 o 3 dormitorios con cochera en Pinares hasta 40mil, prefiero amoblado no excluyente sirve sin muebles, con 1 perro y garantía depósito o aseguradora',
        'T0_INMEDIATO',
        'general',
        'whatsapp'
      );
      if (
        rCierre.subtipo !== 'D2_RAMA_B_BUSQUEDA_COMPLETA' ||
        !rCierre.pokayoke_pass ||
        /[()]/.test(rCierre.replyText) ||
        rCierre.replyText.includes('\n\n') ||
        !/Clarísimo todo! Ya dejamos armada tu búsqueda para marzo 2027:\n_[^_\n]+_\nNos quedamos atentas y te escribiremos por acá apenas tengamos opciones para vos! \*Cómo es tu nombre para agendar tu búsqueda\?\*/.test(rCierre.replyText)
      ) {
        errores.push('FALLA_CIERRE_RAMA_B_FORMATO');
      }

      return {
        pass: errores.length === 0,
        errores,
        vertical_detectada: 'D2',
        subtipo_detectado: errores.length === 0 ? 'CANDADOS_13_15_Y_SILENCIOSAS_OK' : 'FALLA_MATRIZ_D2',
        alerta_andon: errores.length > 0,
        replyText: errores.length === 0
          ? 'OK: elástico $43.000, con_y_sin_gc, Mono/1D/2D y candados #13-#15 activos.'
          : errores.join(' | '),
      };
    },
  },
  {
    id: 'SIM-77',
    bloque: 'Post-Cierre Nombre Agendado · Saltos Simples \\n',
    turno: 'Nombre Cecilia tras cierre',
    contexto: 'general',
    tipo: 'CROSS_AUDIT_HTML',
    input: 'Cecilia Rial (responde nombre tras D2_RAMA_B_BUSQUEDA_COMPLETA)',
    evaluate: () => {
      const r77 = clasificarYResponder('Cecilia Rial', 'T1_SEGUIMIENTO', 'general', 'whatsapp', {
        leadState: { paso_actual: 'D2_RAMA_B_BUSQUEDA_COMPLETA', rama_conversacion: 'B' },
      });
      const pass = r77.subtipo === 'D2_RAMA_B_NOMBRE_AGENDADO' &&
        r77.pokayoke_pass &&
        !r77.replyText.includes('\n\n') &&
        r77.replyText.includes('Un gusto, Cecilia!\ndejamos asentado tu nombre de contacto.\n') &&
        r77.alerta_andon;
      return { pass, errores: pass ? [] : [`NOMBRE_AGENDADO_FAIL:${r77.subtipo}`], vertical_detectada: 'D2', subtipo_detectado: r77.subtipo, alerta_andon: r77.alerta_andon, replyText: r77.replyText };
    },
  },
  {
    id: 'SIM-78',
    bloque: 'Puerta Abierta Post-Cierre · T_ADD_DETAIL',
    turno: 'Agrega detalle post-cierre sin resetear a T0',
    contexto: 'general',
    tipo: 'CROSS_AUDIT_HTML',
    input: 'Ah, me olvidé de decirte que tenga parrillero',
    evaluate: () => {
      const r78 = clasificarYResponder('Ah, me olvidé de decirte que tenga parrillero', 'T1_SEGUIMIENTO', 'general', 'whatsapp', {
        leadState: {
          nombre: 'Cecilia Rial',
          estado_conversacion: 'busqueda_activa_abierta',
          estado_busqueda: 'caza_activa_hoy',
          hito_expectativa_cliente: '2027-01-15',
          paso_actual: 'BUSQUEDA_ACTIVA_ABIERTA',
          comodidades_pedidas: 'Cochera',
        },
      });
      const pass = r78.subtipo === 'T_ADD_DETAIL' &&
        r78.pokayoke_pass &&
        r78.replyText.includes('Anotado, Cecilia! Ya sumamos parrillero a tu búsqueda activa.') &&
        !r78.replyText.includes('Te damos la bienvenida') &&
        !r78.replyText.includes('\n\n');
      return { pass, errores: pass ? [] : [`T_ADD_DETAIL_FAIL:${r78.subtipo}`], vertical_detectada: 'D2', subtipo_detectado: r78.subtipo, alerta_andon: r78.alerta_andon, replyText: r78.replyText };
    },
  },
  {
    id: 'SIM-79',
    bloque: 'Formato Shift+Enter \\n y Guiones Claros',
    turno: 'Cero renglones en blanco y guiones claros',
    contexto: 'general',
    tipo: 'CROSS_AUDIT_HTML',
    input: 'Verifica Shift+Enter \\n simple y guiones abajo',
    evaluate: () => {
      const r79 = clasificarYResponder('Busco alquiler anual para el 2027 en punta del este hasta 40mil', 'T0_INMEDIATO', 'la_fortuna', 'whatsapp');
      const r3q = clasificarYResponder('Sería para marzo 2027, 2 o 3 dormitorios con cochera en Punta del Este', 'T0_INMEDIATO', 'general', 'whatsapp');
      const pass = r79.pokayoke_pass && !r79.replyText.includes('\n\n') && r79.replyText.includes('- _si tenés mascota') && r3q.replyText.includes('- *tenés mascota?*') && !r3q.replyText.includes('\n\n');
      return { pass, errores: pass ? [] : ['FORMATO_SHIFT_ENTER_FAIL'], vertical_detectada: 'D2', subtipo_detectado: r79.subtipo, alerta_andon: r79.alerta_andon, replyText: r3q.replyText };
    },
  },
  {
    id: 'SIM-80',
    bloque: 'Doble Reloj + Suma Aditiva de Comodidades',
    turno: 'caza_activa_hoy + hito 2027-01-15 + Parrillero sin pisar Cochera',
    contexto: 'general',
    tipo: 'CROSS_AUDIT_HTML',
    input: 'Suma Parrillero y Fondo cercado manteniendo Cochera y Doble Reloj',
    evaluate: () => {
      const vs80 = extraerVariablesSilenciosasB2C('Ah, me olvidé de decirte que tenga parrillero y fondo cercado', {
        nombre: 'Cecilia Rial',
        estado_conversacion: 'busqueda_activa_abierta',
        estado_busqueda: 'caza_activa_hoy',
        hito_expectativa_cliente: '2027-01-15',
        comodidades_pedidas: 'Cochera',
        presupuesto_declarado: 40000,
        presupuesto_elastico_max: 43000,
      });
      const pass = vs80.estado_conversacion === 'busqueda_activa_abierta' &&
        vs80.estado_busqueda === 'caza_activa_hoy' &&
        vs80.hito_expectativa_cliente === '2027-01-15' &&
        vs80.comodidades_pedidas.includes('Cochera') &&
        vs80.comodidades_pedidas.includes('Parrillero') &&
        vs80.comodidades_pedidas.includes('Fondo cercado') &&
        vs80.presupuesto_elastico_max === 43000;
      return { pass, errores: pass ? [] : ['DOBLE_RELOJ_SUMA_ADITIVA_FAIL'], vertical_detectada: 'D2', subtipo_detectado: 'DOBLE_RELOJ_ACTIVO_OK', alerta_andon: false, replyText: `${vs80.comodidades_pedidas} | ${vs80.estado_busqueda} | ${vs80.hito_expectativa_cliente}` };
    },
  },
  // BLOQUE 8: VERIFICADOR DE GARANTÍAS, FORMULARIOS SILENCIOSOS, 5 ACCIONES Y COMET LIVE
  makeHtmlAuditScenario('SIM-81', 'Verificador de Garantías · Simulador Multi-Persona (1–4) y Paleta ZAGUÁN', 'garantias-alquiler/index.html', {
    mustInclude: [
      'Las garantías y pólizas de seguro son evaluadas y emitidas por cada compañía aseguradora',
      'Puerta A',
      'Puerta B',
      'últimos 3 meses de recibos de sueldo',
      'últimos 6 meses de recibos de sueldo',
      'menor a 18 meses',
      'profesional contable',
      '1 a 4 personas solicitantes',
      '+ Sumar solicitante',
      'historia laboral nominada de BPS',
      '1 póliza = 1 contrato',
      'CIERRE_INMEDIATO_CON_GARANTIA_LISTA',
      'verificador_garantias_web',
      'Schema.org',
      'FAQPage'
    ],
    mustNotInclude: ['sin exclusividad', 'encajar', '#10b981', '#25d366', '#ef4444', '#fca5a5', '#6ee7b7', '#22c55e', '#dc2626', '#EEF4F6'],
    mustExistPaths: ['garantias-alquiler/index.html'],
  }),
  makeHtmlAuditScenario('SIM-82', 'Alquiler Anual · Verificador + Captura Silenciosa', 'alquiloanual/index.html', {
    mustInclude: [
      'verificador-garantias',
      'Las garantías y pólizas de seguro son evaluadas y emitidas por cada compañía aseguradora',
      'formulario_web_silencioso',
      '/api/propietarios/web',
      '/api/interesados',
      '3 recibos',
      '6 recibos'
    ],
    mustNotInclude: ['sin exclusividad', 'sin ataduras de exclusividad', 'encajar', '#10b981', '#25d366', '#ef4444'],
  }),
  makeHtmlAuditScenario('SIM-83', 'Cierre Fuga Formularios Web (Búsqueda + Publicar)', 'busqueda-personalizada/index.html', {
    mustInclude: ['https://zaguan-crm-bot.943ari.workers.dev/api/interesados', 'formulario_web_silencioso', 'keepalive:true'],
    customCheck: () => {
      const pubHtml = readHtml('publicar/index.html') || '';
      const errs = [];
      if (!pubHtml.includes('/api/propietarios/web')) errs.push('FALTA_ENDPOINT_PROPIETARIOS_EN_PUBLICAR');
      if (!pubHtml.includes('formulario_web_silencioso')) errs.push('FALTA_CANAL_SILENCIOSO_EN_PUBLICAR');
      return errs;
    },
  }),
  makeHtmlAuditScenario('SIM-84', 'Cabina /admin/ · 5 Acciones + Buscador B2C + Rutina', 'admin/index.html', {
    mustInclude: [
      'rutina-5-acciones-box',
      'MIS 5 ACCIONES DEL DÍA EN ZAGUÁN',
      '/admin/rutina-diaria.html',
      'crmCloudState.interesados_b2c',
      'isPedidoB2C',
      '/scrapeo-total',
      '/ingenieria-social',
      '/reporte-pulso',
      '/ejecutar-ads',
      'tab-pedidos'
    ],
    mustExistPaths: ['admin/rutina-diaria.html', 'PROJECT_LINKTREE.json', 'assets/estados/1_ESTADO_LA_FORTUNA_30K.jpg', 'assets/estados/estados_hoy.json'],
    customCheck: () => {
      const rutHtml = readHtml('admin/rutina-diaria.html') || '';
      const errs = [];
      if (!rutHtml.includes('/api/telegram/estados-hoy')) errs.push('FALTA_API_ESTADOS_EN_RUTINA');
      if (!rutHtml.includes('/api/social-comments')) errs.push('FALTA_API_SOCIAL_EN_RUTINA');
      if (!rutHtml.includes('Ta-8cI-XA1ltr0hwLJGDVx7cW0ra6gJJ')) errs.push('FALTA_LINK_APROBALO_EN_RUTINA');
      return errs;
    },
  }),
  {
    id: 'SIM-85',
    bloque: 'Comet Live Chat · Lead 99 529 203 La Fortuna con Garantía',
    turno: 'T0 · Botón 1 Meta Ads (Hoy 12:12 hs)',
    contexto: 'la_fortuna',
    input: 'Tengo Porto, Sura, Mapfre o Santander: quiero ver ficha y visitar',
    mustInclude: ['la-fortuna-agata', '30.000'],
    mustMatch: /coordinar|visitar|d[ií]a/i,
    mustNotInclude: ['pero ', 'sin exclusividad', 'encajar'],
  },
  {
    id: 'SIM-86',
    bloque: 'SEO/GEO · llms.txt & sitemap.xml con Verificador Garantías',
    turno: 'Verificación de indexación y GEO',
    contexto: 'web_html',
    tipo: 'CROSS_AUDIT_HTML',
    input: 'llms.txt + sitemap.xml incluyen /garantias-alquiler/',
    evaluate: () => {
      const llms = readHtml('llms.txt') || '';
      const sm = readHtml('sitemap.xml') || '';
      const errs = [];
      if (!llms.includes('https://zaguanpropiedades.com/garantias-alquiler/')) errs.push('FALTA_GARANTIAS_EN_LLMS');
      if (!llms.includes('últimos 3 meses') || !llms.includes('últimos 6 meses')) errs.push('FALTA_REGLA_RECIBOS_EN_LLMS');
      if (!sm.includes('https://zaguanpropiedades.com/garantias-alquiler/')) errs.push('FALTA_GARANTIAS_EN_SITEMAP');
      return { pass: errs.length === 0, errores: errs, vertical_detectada: 'GEO_SEO', subtipo_detectado: errs.length ? 'GEO_INCOMPLETO' : 'GEO_GARANTIAS_OK', alerta_andon: errs.length > 0, replyText: errs.length ? errs.join(',') : 'llms.txt + sitemap.xml actualizados con /garantias-alquiler/' };
    },
  },
  {
    id: 'SIM-87',
    bloque: 'Crons 24/7 (08:30 y 19:30 UY) + Redes + Estados en Worker',
    turno: 'Infraestructura Cloudflare Worker',
    contexto: 'worker',
    tipo: 'CROSS_AUDIT_HTML',
    input: 'wrangler.jsonc + src/index.js',
    evaluate: () => {
      const wJson = readFileSync('/Users/arianawajntraub/Desktop/ZAGUAN CLAUDE/cloudflare-crm-worker/wrangler.jsonc', 'utf8');
      const wIdx = readFileSync('/Users/arianawajntraub/Desktop/ZAGUAN CLAUDE/cloudflare-crm-worker/src/index.js', 'utf8');
      const errs = [];
      if (!wJson.includes('30 11 * * *') || !wJson.includes('30 22 * * *')) errs.push('FALTA_CRONS_0830_1930_EN_WRANGLER');
      if (!wIdx.includes('/api/telegram/estados-hoy')) errs.push('FALTA_ESTADOS_HOY_EN_WORKER');
      if (!wIdx.includes('/api/social-comment')) errs.push('FALTA_SOCIAL_COMMENT_EN_WORKER');
      if (!wIdx.includes('/api/propietarios/web')) errs.push('FALTA_PROPIETARIOS_WEB_EN_WORKER');
      if (!wIdx.includes('runCronApertura0830') || !wIdx.includes('runCronCierre1930')) errs.push('FALTA_HANDLERS_CRON');
      return { pass: errs.length === 0, errores: errs, vertical_detectada: 'CLOUDFLARE_WORKER', subtipo_detectado: errs.length ? 'WORKER_INCOMPLETO' : 'WORKER_CRONS_OK', alerta_andon: errs.length > 0, replyText: errs.length ? errs.join(',') : 'Worker con Crons 08:30/19:30 UY, Estados 9:16 y Redes OK' };
    },
  },
  {
    id: 'SIM-88',
    bloque: 'Caso B2C 1→3→2 Post-T0 · Co-solicitantes + D2 Rama B',
    turno: 'Alquiler anual Pinares/Punta del Este',
    contexto: 'general',
    input: 'Busco apartamento de 2 dormitorios en Punta del Este para marzo 2027 hasta $U 40.000',
    mustMatch: /cu[aá]ntas personas|mascota|cochera/i,
    mustNotInclude: ['pero ', 'sola', 'bienvenido', 'agradecida'],
  },
  {
    id: 'SIM-89',
    bloque: 'Poka-Yoke 1° Contacto Propietarios + Anti-Duplicado (/go/wa + JSON)',
    turno: 'T0 Propietarios Marketplace (cero URL, cero frase duplicada, 100% _cursiva_)',
    contexto: 'admin_json',
    tipo: 'CROSS_AUDIT_HTML',
    input: 'prospeccion_viva_4zonas_zaguan.json + worker lintCopyMar',
    evaluate: () => {
      const mpJson = JSON.parse(readFileSync('/Users/arianawajntraub/Library/CloudStorage/GoogleDrive-ariana@starunionservicios.com.ar/Mi unidad/zaguan/zaguan-main/admin/prospeccion_viva_4zonas_zaguan.json', 'utf8'));
      const wIdx = readFileSync('/Users/arianawajntraub/Desktop/ZAGUAN CLAUDE/cloudflare-crm-worker/src/index.js', 'utf8');
      const errs = [];
      for (const it of (mpJson.marketplace_duenos_directos || [])) {
        if (it.carril === '5_cerrado_radar') continue;
        const m = String(it.mensaje_mar || '');
        if (/zaguanpropiedades\.com/i.test(m)) errs.push(`URL_EN_PRIMER_CONTACTO_${it.id}`);
        if (/con\s+autorizaci[oó]n\s+abierta\s+con\s+publicaci[oó]n\s+abierta/i.test(m)) errs.push(`FRASE_DUPLICADA_${it.id}`);
        if (!/_[^_]+_/.test(m)) errs.push(`FALTA_CURSIVA_CORCHETES_${it.id}`);
      }
      if (!wIdx.includes('stripFirstContactUrl')) errs.push('FALTA_STRIP_URL_EN_WORKER');
      return {
        pass: errs.length === 0,
        errores: errs,
        vertical_detectada: 'POKA_YOKE_T0_PROPIETARIOS',
        subtipo_detectado: errs.length ? 'T0_INFECTADO' : 'T0_39_DUENOS_LIMPIOS_OK',
        alerta_andon: errs.length > 0,
        replyText: errs.length ? errs.join(',') : '39/39 dueños Marketplace sin URL en T0, sin frase duplicada y con _cursiva_ en [CORCHETES]',
      };
    },
  },
  {
    id: 'SIM-90',
    bloque: 'Semáforo 3 Niveles + MP-29/MP-33 + Alerta MP-12 + Buscador Ctrl+F San Carlos',
    turno: 'Cierre Operativo Comet <-> D1 <-> /admin/',
    contexto: 'admin_html',
    tipo: 'CROSS_AUDIT_HTML',
    input: 'admin/index.html + prospeccion_viva_4zonas_zaguan.json',
    evaluate: () => {
      const mpJson = JSON.parse(readFileSync('/Users/arianawajntraub/Library/CloudStorage/GoogleDrive-ariana@starunionservicios.com.ar/Mi unidad/zaguan/zaguan-main/admin/prospeccion_viva_4zonas_zaguan.json', 'utf8'));
      const adminHtml = readHtml('admin/index.html') || '';
      const errs = [];
      const list = mpJson.marketplace_duenos_directos || [];
      const findId = (id) => list.find((x) => x.id === id);
      if (findId('MP-29')?.sello_cierre !== 'INMOBILIARIA ENCUBIERTA') errs.push('MP29_NO_ARCHIVADA_INMOBILIARIA');
      if (findId('MP-33')?.sello_cierre !== 'ALQUILADO EN MARKETPLACE') errs.push('MP33_NO_ARCHIVADA_ALQUILADO');
      if (findId('MP-12')?.proximo_toque_tipo !== 'solo_con_visita_confirmada' || findId('MP-12')?.alerta_mar) errs.push('MP12_NO_SILENCIADO_HASTA_VISITA');
      if (findId('MP-27')?.carril !== '5_cerrado_radar') errs.push('MP27_DANILO_NO_CERRADO_RADAR');
      if (findId('MP-27')?.sello_cierre !== 'DECISIÓN FAMILIAR / NO AUTORIZA') errs.push('MP27_SELLO_INCORRECTO');
      if (findId('MP-38')?.carril !== '5_cerrado_radar') errs.push('MP38_VIZCAYA_NO_CERRADA_RADAR');
      if (findId('MP-38')?.sello_cierre !== 'INMOBILIARIA ENCUBIERTA (VIZCAYA)') errs.push('MP38_SELLO_INCORRECTO');
      for (const alId of ['MP-24', 'MP-25', 'MP-31', 'MP-34', 'MP-37']) {
        if (findId(alId)?.nivel_semaforo !== '1B_CON_ALERTA') errs.push(`FALTA_SEMAFORO_AMARILLO_${alId}`);
      }
      if (/all\.slice\(\s*0\s*,\s*18\s*\)/.test(adminHtml)) errs.push('GLOBAL_SEARCH_SIGUE_TRUNCADO_18');
      if (!adminHtml.includes('<option value="San Carlos">')) errs.push('FALTA_ZONA_SAN_CARLOS_FILTRO');
      if (!adminHtml.includes('descartarOwnerDirectoD1') || !adminHtml.includes('focusOwnerCardInRadar')) errs.push('FALTA_BOTON_DESCARTAR_O_FOCUS_RADAR');
      return {
        pass: errs.length === 0,
        errores: errs,
        vertical_detectada: 'ADMIN_SEMAFORO_3_NIVELES',
        subtipo_detectado: errs.length ? 'ADMIN_INCOMPLETO' : 'ADMIN_SEMAFORO_Y_BUSCADOR_OK',
        alerta_andon: errs.length > 0,
        replyText: errs.length ? errs.join(',') : 'Semáforo 3 niveles + MP-29/33/27/38 cerradas + alerta MP-12 + filtro San Carlos + buscador global sin tope OK',
      };
    },
  },
  {
    id: 'SIM-91',
    bloque: 'Zero Comet 9222 + MP-39 Claudia sin re-preguntar aseguradora ni fotos + Caja única en /admin/',
    turno: 'Cierre Operativo Comet & Cabina',
    contexto: 'admin_html',
    tipo: 'CROSS_AUDIT_HTML',
    input: 'tools/ + admin/index.html + workers/shared/corchetes-14v.js (MP-39)',
    evaluate: () => {
      const errs = [];
      if (existsSync(join(REPO_ROOT, 'tools/puente_vivo_comet_wa.mjs'))) {
        errs.push('COMET_SCRIPT_SIGUE_EN_DISCO');
      }
      const mpJson = JSON.parse(readFileSync(join(REPO_ROOT, 'admin/prospeccion_viva_4zonas_zaguan.json'), 'utf8'));
      const mp39 = (mpJson.marketplace_duenos_directos || []).find((x) => x.id === 'MP-39');
      if (!mp39) {
        errs.push('FALTA_MP39_CLAUDIA');
      } else {
        if (!['3_en_conversacion', '4_ficha_activa'].includes(mp39.carril)) errs.push('MP39_NO_EN_CONVERSACION');
        const eval39 = evaluarCorchetesPropietario(mp39, mp39.respuesta_recibida || '');
        if (!eval39?.confirmados?.garantias_aceptadas) errs.push('MP39_NO_CONFIRMA_GARANTIA_DE_AVISO');
        if (!eval39?.confirmados?.dormitorios) errs.push('MP39_NO_CONFIRMA_2D_DE_AVISO');
        if (eval39?.confirmados?.gastos_comunes === 'gastos comunes,') errs.push('MP39_FALSO_MATCH_GASTOS_COMUNES_MAR');
        const preg = String(eval39?.siguiente_pregunta_wa || '').toLowerCase();
        if (/qu[eé]\s+garant[ií]as\s+acept[aá]s/.test(preg)) errs.push('MP39_REPREGUNTA_GARANTIA');
        if (/pasame\s+fotos\s+reales/.test(preg)) errs.push('MP39_PIDE_FOTOS_REALES_EXISTENTES');
      }
      const adminHtml = readHtml('admin/index.html') || '';
      if (!adminHtml.includes("rec.carril === '1_por_contactar' && rec.estado === 'pendiente'")) {
        errs.push('ADMIN_NO_OCULTA_PRIMER_MENSAJE_EN_SEGUIMIENTO');
      }
      if (!adminHtml.includes('aseguradora') || adminHtml.includes('pasame fotos reales de cómo está hoy')) {
        errs.push('ADMIN_SUGERENCIA_MAR_NO_ACTUALIZADA');
      }
      return {
        pass: errs.length === 0,
        errores: errs,
        vertical_detectada: 'ZERO_COMET_Y_MP39_LIMPIA',
        subtipo_detectado: errs.length ? 'MP39_O_COMET_CON_FALLA' : 'ZERO_COMET_CAJA_UNICA_OK',
        alerta_andon: errs.length > 0,
        replyText: errs.length ? errs.join(',') : 'Zero Comet 9222 + MP-39 reconoce aseguradora/2D sin pedir fotos + 1 caja única en /admin/ OK',
      };
    },
  },
  {
    id: 'SIM-92',
    bloque: 'Catálogo Unificado Ventas /propiedades/ + Hub / y /links/ + 0 sin exclusividad',
    turno: 'Web UX/SEO',
    contexto: 'web_publica',
    tipo: 'CROSS_AUDIT_HTML',
    input: 'propiedades/index.html + index.html + links/index.html + 11 páginas',
    evaluate: () => {
      const errs = [];
      const propsHtml = readHtml('propiedades/index.html') || '';
      if (/noindex/i.test(propsHtml) || /http-equiv=["']refresh["']/i.test(propsHtml)) {
        errs.push('PROPIEDADES_SIGUE_CON_NOINDEX_O_REDIRECT');
      }
      if (!propsHtml.includes('Santa Mónica') || !propsHtml.includes('USD 160.000') || !propsHtml.includes('/propiedades/santa-monica-casa-hormigon/')) {
        errs.push('PROPIEDADES_SIN_SANTA_MONICA_160K');
      }
      for (const p of ['/proyectos/betania-iv/', '/proyectos/nostrum-roosevelt/', '/proyectos/more-atlantico/', '/proyectos/eve-tower/', '/proyectos/golden-rise/']) {
        if (!propsHtml.includes(p)) errs.push(`PROPIEDADES_FALTA_POZO_${p}`);
      }
      for (const hub of ['index.html', 'links/index.html']) {
        const h = readHtml(hub) || '';
        if (!h.includes('La Fortuna') || !h.includes('Santa Mónica') || !h.includes('/garantias-alquiler/') || !h.includes('/propiedades/')) {
          errs.push(`HUB_INCOMPLETO_${hub}`);
        }
      }
      const paginas = [
        'index.html', 'links/index.html', 'propiedades/index.html', 'proyectos/index.html',
        'alquileres/index.html', 'alquiloanual/index.html', 'garantias-alquiler/index.html',
        'novedades-del-este/index.html', 'oportunidades/index.html', 'publicar/index.html',
        'busqueda-personalizada/index.html', 'propiedades/santa-monica-casa-hormigon/index.html',
      ];
      for (const f of paginas) {
        const h = readHtml(f) || '';
        if (/sin\s+exclusividad/i.test(h)) errs.push(`SIN_EXCLUSIVIDAD_EN_${f}`);
        if (!h.includes('/propiedades/') || !h.includes('/garantias-alquiler/')) errs.push(`NAV_INCOMPLETO_EN_${f}`);
      }
      return {
        pass: errs.length === 0,
        errores: errs,
        vertical_detectada: 'CATALOGO_VENTAS_Y_NAV_UNIFICADO',
        subtipo_detectado: errs.length ? 'WEB_PUBLICA_INCOMPLETA' : 'PROPIEDADES_Y_HUBS_OK',
        alerta_andon: errs.length > 0,
        replyText: errs.length ? errs.join(',') : 'Catálogo /propiedades/ indexable + Santa Mónica USD 160k + 5 pozos + nav unificado en 11+ páginas OK',
      };
    },
  },
  {
    id: 'SIM-93',
    bloque: 'Simulador Multi-Persona (1–4) + Guía Pilar 8 FAQs en Posición #1 + 6 PDPs enlazados',
    turno: 'Garantías & SEO Pilar',
    contexto: 'garantias_seo',
    tipo: 'CROSS_AUDIT_HTML',
    input: 'garantias-alquiler/index.html + novedades-del-este/ + alquileres/*/',
    evaluate: () => {
      const errs = [];
      const garHtml = readHtml('garantias-alquiler/index.html') || '';
      if (!garHtml.includes('agregarSolicitante') || !garHtml.includes('historia laboral nominada de BPS') || !garHtml.includes('1 póliza = 1 contrato') || !garHtml.includes('veredictoDesbloqueado')) {
        errs.push('GARANTIAS_SIN_SIMULADOR_MULTIPERSONA_COMPLETO');
      }
      const guiaSlug = 'requisitos-garantia-alquiler-anual-uruguay-porto-sura-mapfre-recibos';
      const guiaHtml = readHtml(`novedades-del-este/${guiaSlug}/index.html`) || '';
      if (!guiaHtml || !guiaHtml.includes('8.') || !guiaHtml.includes('historia laboral nominada de BPS') || !guiaHtml.includes('evaluadas y emitidas por cada compañía aseguradora')) {
        errs.push('GUIA_PILAR_8_FAQS_INCOMPLETA');
      }
      const novHtml = readHtml('novedades-del-este/index.html') || '';
      const idxGuia = novHtml.indexOf(guiaSlug);
      const idxLaFortuna = novHtml.indexOf('alquiler-anual-a-estrenar-la-fortuna-maldonado-mudate-ya');
      if (idxGuia === -1 || (idxLaFortuna !== -1 && idxGuia > idxLaFortuna)) {
        errs.push('GUIA_PILAR_NO_EN_POSICION_1_NOVEDADES');
      }
      if (!novHtml.includes('/propiedades/santa-monica-casa-hormigon/')) {
        errs.push('NOVEDADES_SIN_TARJETA_SANTA_MONICA');
      }
      const pdps = [
        'alquileres/la-fortuna-agata/index.html',
        'alquileres/el-tesoro-juana-de-america/index.html',
        'alquileres/maldonado-residencial-2d/index.html',
        'alquileres/la-mansa-parada-16-2d/index.html',
        'alquileres/roosevelt-cantegril-2d/index.html',
        'alquileres/la-brava-parada-8-3d/index.html',
      ];
      for (const p of pdps) {
        const h = readHtml(p) || '';
        if (!h.includes('/garantias-alquiler/?alquiler=') || !h.includes(guiaSlug)) {
          errs.push(`PDP_SIN_ENLACE_SIMULADOR_O_GUIA_${p}`);
        }
      }
      return {
        pass: errs.length === 0,
        errores: errs,
        vertical_detectada: 'SIMULADOR_MULTIPERSONA_Y_GUIA_PILAR',
        subtipo_detectado: errs.length ? 'GARANTIAS_O_LINKS_INCOMPLETOS' : 'SIMULADOR_Y_6_PDPS_OK',
        alerta_andon: errs.length > 0,
        replyText: errs.length ? errs.join(',') : 'Simulador 1–4 personas + Guía 8 FAQs Posición #1 + Santa Mónica en Novedades + 6 PDPs enlazados OK',
      };
    },
  },
  {
    id: 'SIM-94',
    bloque: 'Cierre Integral UX/UI · Header Unificado 1120px + Paleta Mineral + Portada Limpia + Anti-Baba CRM/Telegram',
    turno: 'QA Visual & Cero Ruido',
    contexto: 'qa_cierre_integral',
    tipo: 'CROSS_AUDIT_HTML',
    input: '6 páginas web + ultimas-propiedades + admin + CRM JSON/Worker',
    evaluate: () => {
      const errs = [];
      const hdrJs = readHtml('assets/js/novedades-header.js') || '';
      if (hdrJs.includes('font-size:9px') || !hdrJs.includes('1120')) errs.push('HEADER_JS_NO_UNIFICADO');
      for (const css of ['assets/css/portadas.css', 'assets/css/proyecto-estructura.css', 'assets/css/novedades-del-este.css']) {
        const c = readHtml(css) || '';
        if (!c.includes('1120px')) errs.push(`CSS_SIN_BREAKPOINT_1120_${css}`);
      }
      const paginasMenu = [
        'index.html',
        'propiedades/index.html',
        'alquileres/index.html',
        'garantias-alquiler/index.html',
        'alquiloanual/index.html',
        'novedades-del-este/requisitos-garantia-alquiler-anual-uruguay-porto-sura-mapfre-recibos/index.html',
      ];
      for (const pg of paginasMenu) {
        const h = readHtml(pg) || '';
        if (!h.includes('id="mobile-menu"') && !h.includes('class="mobile-menu"')) errs.push(`FALTA_MOBILE_MENU_${pg}`);
      }
      const guia = readHtml('novedades-del-este/requisitos-garantia-alquiler-anual-uruguay-porto-sura-mapfre-recibos/index.html') || '';
      if (!guia.includes('#E8E4DA') || guia.includes('#EEF4F6') || !guia.includes('ultimas-propiedades-zaguan.js')) {
        errs.push('GUIA_SIN_PALETA_MINERAL_O_LINKING');
      }
      const gar = readHtml('garantias-alquiler/index.html') || '';
      if (!gar.includes('step="1000"') || !gar.includes('ultimas-propiedades-zaguan.js') || /\b[a-záéíóúñü]+mente\b/i.test(gar)) {
        errs.push('GARANTIAS_SIN_STEP_O_CON_MENTE');
      }
      const alq = readHtml('alquiloanual/index.html') || '';
      if (!alq.includes('step="1000"') || !alq.includes('btn--estuario') || /\b[a-záéíóúñü]+mente\b/i.test(alq)) {
        errs.push('ALQUILOANUAL_UX_O_MENTE');
      }
      const prop = readHtml('propiedades/index.html') || '';
      const home = readHtml('index.html') || '';
      if (!prop.includes('portada_limpia_16x10.jpg') || !home.includes('portada_limpia_16x10.jpg')) {
        errs.push('FALTA_PORTADA_LIMPIA_SANTA_MONICA');
      }
      const ultJs = readHtml('assets/js/ultimas-propiedades-zaguan.js') || '';
      if (!ultJs.includes('ZAGUAN_ULTIMAS_PROPIEDADES')) errs.push('FALTA_ULTIMAS_PROPIEDADES_JS');
      const radarRaw = readHtml('admin/prospeccion_viva_4zonas_zaguan.json') || '{}';
      const radar = JSON.parse(radarRaw);
      const mp39 = (radar.marketplace_duenos_directos || []).find((x) => x.id === 'MP-39');
      const mp12 = (radar.marketplace_duenos_directos || []).find((x) => x.id === 'MP-12');
      if (!mp39 || mp39.telefono_directo !== '59894294017' || !['esperando_respuesta_t2', 'ficha_activa'].includes(mp39.estado_envio)) {
        errs.push('MP39_NO_SINCRONIZADO');
      }
      if (!mp12 || mp12.proximo_toque_tipo !== 'solo_con_visita_confirmada' || mp12.alerta_mar) {
        errs.push('MP12_CON_ALERTA_PREMATURA');
      }
      const workerJs = readHtml('../../../../Desktop/ZAGUAN CLAUDE/cloudflare-crm-worker/src/index.js') || '';
      if (workerJs && (!workerJs.includes('sendTgVideo') || !workerJs.includes('solo_con_visita_confirmada') || workerJs.includes('[Beacon ${'))) {
        errs.push('WORKER_TELEGRAM_O_BEACON_FAIL');
      }
      return {
        pass: errs.length === 0,
        errores: errs,
        vertical_detectada: 'QA_INTEGRAL_WEB_CRM_TELEGRAM',
        subtipo_detectado: errs.length ? 'QA_FAIL' : 'CIERRE_INTEGRAL_OK',
        alerta_andon: errs.length > 0,
        replyText: errs.length ? errs.join(',') : 'Header unificado 1120px + Paleta Mineral + Portada limpia 16:10 + 0 -mente + Linking dinámico + MP-39/MP-12 + 2 globos Telegram OK',
      };
    },
  },
  {
    id: 'SIM-95',
    bloque: 'Simulador Conversacional Multi-Turno · IA + Memoria Viva + Auditoría de Coherencia',
    turno: 'Multi-Turno /api/mar/conversar',
    contexto: 'simulador_mar_ia',
    tipo: 'CROSS_AUDIT_HTML',
    input: 'admin/simulador-mar.html + cloudflare-crm-worker/src/index.js',
    evaluate: () => {
      const errs = [];
      const simHtml = readHtml('admin/simulador-mar.html') || '';
      if (!simHtml.includes('/api/mar/conversar')) errs.push('SIMULADOR_NO_CONECTA_CONVERSAR');
      if (!simHtml.includes('MULTI_TURNO_GUIONES') || !simHtml.includes('memoryGrid') || !simHtml.includes('coherenceChecklist')) {
        errs.push('SIMULADOR_SIN_GUIONES_O_MEMORIA_VIVA');
      }
      if (!simHtml.includes('usarPresetEnHiloActual') || !simHtml.includes('journeyNextBar')) {
        errs.push('SIMULADOR_SIN_SEGUIMIENTO_EN_HILO');
      }
      const workerJs = readHtml('../../../../Desktop/ZAGUAN CLAUDE/cloudflare-crm-worker/src/index.js') || '';
      if (workerJs && (!workerJs.includes('handleMarConversar') || !workerJs.includes('auditarCoherenciaYMemoria') || !workerJs.includes('actualizarMemoriaConversacion') || !workerJs.includes('@cf/meta/llama-3.3-70b-instruct-fp8-fast'))) {
        errs.push('WORKER_SIN_MOTOR_IA_MULTITURNO');
      }
      return {
        pass: errs.length === 0,
        errores: errs,
        vertical_detectada: 'SIMULADOR_CONVERSACIONAL_MULTITURNO',
        subtipo_detectado: errs.length ? 'SIMULADOR_FAIL' : 'IA_MEMORIA_COHERENCIA_OK',
        alerta_andon: errs.length > 0,
        replyText: errs.length ? errs.join(',') : 'Simulador multi-turno con /api/mar/conversar + Llama 3.3 Workers AI + memoria acumulativa + auditor de coherencia OK',
      };
    },
  },
];

function evaluarEscenario(esc) {
  if (esc.tipo === 'CROSS_AUDIT_HTML' && typeof esc.evaluate === 'function') {
    const ev = esc.evaluate();
    return {
      id: esc.id,
      bloque: esc.bloque,
      turno: esc.turno,
      contexto: esc.contexto,
      input: esc.input,
      pass: ev.pass,
      errores: ev.errores,
      vertical_detectada: ev.vertical_detectada,
      subtipo_detectado: ev.subtipo_detectado,
      alerta_andon: ev.alerta_andon,
      replyText: ev.replyText,
    };
  }

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
  const resultados = ESCENARIOS_60.map(evaluarEscenario);
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
    writeFileSync(DRIVE_OUT_60, js);
    writeFileSync(DESK_OUT_60, js);
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
