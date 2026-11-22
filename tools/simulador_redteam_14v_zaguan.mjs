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
import { clasificarYResponder } from '../workers/whatsapp-triage/index.js';

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
  makeHtmlAuditScenario('SIM-40', 'QA Web · La Fortuna Doble Punta (+ IVA)', 'alquileres/la-fortuna-agata/index.html', {
    mustInclude: ['1 mes de alquiler + IVA', '$U 30.000'],
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
  makeHtmlAuditScenario('SIM-43', 'QA Web · Santa Mónica Bóveda Privada', 'propiedades/santa-monica-casa-hormigon/index.html', {
    mustInclude: ['USD 160.000', '348', '201'],
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
    id: 'SIM-48', bloque: 'Doble Punta · Consulta Comprador', turno: 'T1 · Comisión Venta', contexto: 'santa_monica',
    input: 'Cuánto es la comisión inmobiliaria si compro Santa Mónica o un pozo?',
    mustInclude: ['3% + IVA'],
    mustNotInclude: ['sin IVA', 'bóveda privada'],
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
    id: 'SIM-52', bloque: 'La Fortuna · Rescate Lunes Invita Martes', turno: 'T2 · SLA 24hs Lunes 10 AM', contexto: 'la_fortuna',
    etapa: 'T2_NARANJA_24_HS',
    input: 'Quiero recibir la ficha completa y ubicación exacta de La Fortuna',
    mustInclude: ['buen lunes', 'mañana martes', '30.000'],
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
    mustInclude: ['sin exclusividad', 'Porto, Sura o Mapfre'],
    mustNotInclude: ['zaguanpropiedades.com/alquileres/', '%', 'comisión', 'honorarios'],
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
