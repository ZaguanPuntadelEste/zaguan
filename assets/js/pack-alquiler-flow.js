/* ZAGUÁN Propiedades — Flujo móvil 4 rayitas Story (Vuelta 2) + Captación cruzada + Log D1 */
(function () {
  var CRM_BASE = 'https://zaguan-crm-bot.943ari.workers.dev';
  var WA_PHONE = '59898712064';
  var CONSENT_VERSION = 'ley18331-btn-v2';

  function makeSessionId() {
    return 'S-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
  }

  function escHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function pushDataLayer(payload) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    if (typeof window.gtag === 'function') {
      window.gtag('event', payload.event, payload);
    }
  }

  window.ZaguanPackFlow = {
    mount: function (opts) {
      var root = document.getElementById(opts.rootId || 'zg-pack-flow-root');
      if (!root) return;

      var params = new URLSearchParams(window.location.search);
      var sessionId = makeSessionId();
      var baseValor = Number(opts.valorMensual || 30000);
      var ingAlto = Math.max(90000, Math.round((baseValor * 3.16) / 5000) * 5000);
      var ingMedio = 65000;

      var flujoCerrado = false;
      var leftToWhatsApp = false;
      var hiddenAt = 0;

      var state = {
        modo: 'visita', // 'visita' | 'captacion_cruzada'
        step: 1,        // 1..4 (visita) | 1..3 (captacion_cruzada)
        plazo: '',      // sin preselección muda
        mascota: '',
        personas: '',
        garantia: '',
        garantiaLabel: '',
        andaBridge: false,
        showAndaBridge: false,
        ingresos: '',
        escala2: '',
        showEscala2: false,
        outcome: 'WHATSAPP_CALIFICADO', // 'WHATSAPP_CALIFICADO' | 'BUSQUEDA_REGISTRADA'
        reasonKey: '',
        motivoDesvio: '',
        nombre: '',
        whatsapp: '',
        savedLeadId: '',
        showPrivacy: false,
        submitted: false,
        validationMsg: '',
        cruzadaZona: '',
        cruzadaComodidades: [],
        cruzadaPlazo: '',
        cruzadaHogar: '',
        cruzadaRespaldo: '',
        cruzadaRango: ''
      };

      function resetToStep1(resetOpts) {
        var o = resetOpts || {};
        if (o.newSession) sessionId = makeSessionId();
        state.modo = 'visita';
        state.step = 1;
        state.plazo = '';
        state.mascota = '';
        state.personas = '';
        state.garantia = '';
        state.garantiaLabel = '';
        state.andaBridge = false;
        state.showAndaBridge = false;
        state.ingresos = '';
        state.escala2 = '';
        state.showEscala2 = false;
        state.outcome = 'WHATSAPP_CALIFICADO';
        state.reasonKey = '';
        state.motivoDesvio = '';
        state.showPrivacy = false;
        state.submitted = false;
        state.validationMsg = '';
        state.savedLeadId = '';
        state.cruzadaZona = '';
        state.cruzadaComodidades = [];
        state.cruzadaPlazo = '';
        state.cruzadaHogar = '';
        state.cruzadaRespaldo = '';
        state.cruzadaRango = '';
        if (!o.keepContact) {
          state.nombre = '';
          state.whatsapp = '';
        }
        render();
      }

      function syncHiddenLegacy() {
        var gEl = document.getElementById(opts.garantiaFieldId || 'lf-garantia');
        var iEl = document.getElementById(opts.ingresosFieldId || 'lf-ingresos');
        if (gEl) {
          if (state.garantia === 'poliza') gEl.value = 'poliza';
          else if (state.garantia === 'ingresos') gEl.value = 'dependiente';
          else if (state.garantia === 'anda_cgn' || state.garantia === 'otra') gEl.value = 'otra';
        }
        if (iEl) {
          if (state.ingresos === 'ok' || state.escala2 === 'si') iEl.value = 'ok_100k';
          else if (state.ingresos === 'cerca') iEl.value = 'cerca';
          else if (state.ingresos === 'bajo') iEl.value = 'bajo';
        }
      }

      function syncMobileBottomBar() {
        var mobBtn = document.getElementById('btn-wa-mobile');
        var mobLbl = document.getElementById('btn-wa-mobile-label');
        if (!mobBtn || !mobLbl) return;
        if (state.modo === 'visita' && state.step === 4 && state.outcome === 'WHATSAPP_CALIFICADO' && state.nombre) {
          mobBtn.href = buildQualifiedWaUrl();
          mobBtn.target = '_blank';
          mobBtn.rel = 'noopener noreferrer';
          mobLbl.textContent = 'Abrir WhatsApp con Mar →';
        } else {
          mobBtn.href = '#reservar-visita';
          mobBtn.target = '_self';
          mobBtn.removeAttribute('rel');
          mobLbl.textContent = 'Coordinar visita →';
        }
      }

      function formatIngAlto() {
        return '$U ' + ingAlto.toLocaleString('de-DE');
      }

      function buildSummaryText() {
        if (state.modo === 'captacion_cruzada') {
          var coms = state.cruzadaComodidades.length ? state.cruzadaComodidades.join(', ') : 'sin restricción especial';
          return [state.cruzadaZona || 'Zona a definir', coms, state.cruzadaHogar, state.cruzadaPlazo, state.cruzadaRespaldo, state.cruzadaRango].filter(Boolean).join(' · ');
        }
        return [state.personas, state.mascota, state.plazo, state.garantiaLabel || state.garantia].filter(Boolean).join(' · ');
      }

      function sendSilentLog(paso, resultado, consentFlag) {
        var payload = {
          session_id: sessionId,
          slug: opts.slug,
          ref_publica: opts.refPublica,
          modo: state.modo,
          paso_alcanzado: paso,
          resultado: resultado || 'en_curso',
          consentimiento: consentFlag ? 1 : 0,
          nombre: consentFlag ? state.nombre : undefined,
          utm_source: params.get('utm_source') || '(directo)',
          texto_resumen: buildSummaryText(),
          respuestas: {
            plazo: state.plazo || undefined,
            mascota: state.mascota || undefined,
            personas: state.personas || undefined,
            garantia: state.garantia || undefined,
            anda_bridge: state.andaBridge || undefined,
            ingresos: state.ingresos || undefined,
            escala_2: state.escala2 || undefined,
            motivo_desvio: state.motivoDesvio || undefined,
            cruzada_zona: state.cruzadaZona || undefined,
            cruzada_comodidades: state.cruzadaComodidades.length ? state.cruzadaComodidades.join(', ') : undefined,
            cruzada_hogar: state.cruzadaHogar || undefined,
            cruzada_plazo: state.cruzadaPlazo || undefined,
            cruzada_respaldo: state.cruzadaRespaldo || undefined,
            cruzada_rango: state.cruzadaRango || undefined
          }
        };
        try {
          fetch(CRM_BASE + '/api/ficha-intento', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true
          }).catch(function () {});
        } catch (e) {}
      }

      function buildQualifiedWaUrl() {
        var saludoNombre = state.nombre ? ', soy ' + state.nombre : '';
        var garTxt = state.garantia === 'poliza'
          ? 'póliza pre-aprobada (aseguradora)'
          : (state.escala2 === 'si'
            ? '1 o 2 ingresos formales más 1 co-firmante con recibo limpio que firma el contrato para tramitar aseguradora'
            : '1 o 2 ingresos formales (+' + formatIngAlto() + ' líquidos, historial limpio) para tramitar aseguradora');
        var msg = '[VISITA CALIFICADA] Hola Mar' + saludoNombre + '. Quiero coordinar visita por ' +
          opts.tituloCorto + ' (' + opts.precioTexto + '). Perfil validado: ' +
          (state.personas || '1 persona o pareja') + ', ' + (state.mascota || 'sin mascotas').toLowerCase() +
          ', mudanza ' + (state.plazo || 'dentro de 30 días').toLowerCase() + ', respaldo: ' + garTxt +
          '. Qué día y horario podemos ir a verlo?';
        return 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(msg);
      }

      function buildCruzadaWaUrl() {
        var saludoNombre = state.nombre ? ', soy ' + state.nombre : '';
        var coms = state.cruzadaComodidades.length ? state.cruzadaComodidades.join(', ') : 'distribución abierta';
        var msg = '[BÚSQUEDA PRIORITARIA] Hola Mar' + saludoNombre + '. Busco alquiler anual en ' +
          (state.cruzadaZona || 'Maldonado / Punta del Este') + ' (' + coms + ', ' +
          (state.cruzadaHogar || 'hogar') + ', mudanza ' + (state.cruzadaPlazo || 'a definir').toLowerCase() +
          ', respaldo: ' + (state.cruzadaRespaldo || 'aseguradora') + ', rango ' + (state.cruzadaRango || 'a definir') +
          '). Qué opciones tenés para evaluar?';
        return 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(msg);
      }

      function buildExtraReqWaUrl() {
        var resumenCorto = buildSummaryText();
        var msg = '[SEGUIMIENTO / REQUISITO EXTRA] Hola Mar, soy ' + (state.nombre || 'cliente') +
          '. Recién dejé registrada mi búsqueda desde ' + opts.tituloCorto +
          (resumenCorto ? ' (' + resumenCorto + ')' : '') + ' y quiero sumar este detalle: ';
        return 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(msg);
      }

      function animateAndGo(btnEl, fn) {
        if (btnEl && btnEl.classList) btnEl.classList.add('is-tapped');
        setTimeout(fn, 170);
      }

      function evaluateCruzadaOutcome() {
        var hasHighNeed = state.cruzadaComodidades.some(function (c) {
          return /amoblado|patio|3\+ dormitorios/i.test(c);
        });
        var irrealLaBarra = state.cruzadaZona === 'La Barra / Manantiales' && state.cruzadaRango === 'Hasta $U 35.000/mes' && hasHighNeed;
        if (irrealLaBarra) {
          return {
            outcome: 'BUSQUEDA_REGISTRADA',
            reasonKey: 'cruzada_realidad',
            motivo: 'En La Barra / Manantiales ese tipo de propiedad se mueve en rangos en USD; guardamos tu pedido y podemos cruzar alternativas en Maldonado'
          };
        }
        if (state.cruzadaRespaldo === 'Sin garantía tradicional aún') {
          return {
            outcome: 'BUSQUEDA_REGISTRADA',
            reasonKey: 'garantia',
            motivo: 'Guardamos tu búsqueda para avisarte apenas ingrese una propiedad compatible con tu modalidad de respaldo'
          };
        }
        if (state.cruzadaPlazo === 'Más adelante') {
          return {
            outcome: 'BUSQUEDA_REGISTRADA',
            reasonKey: 'plazo',
            motivo: 'Como buscás mudarte más adelante, te avisamos con prioridad cerca de tu fecha según disponibilidad activa'
          };
        }
        return { outcome: 'WHATSAPP_CALIFICADO', reasonKey: '', motivo: '' };
      }

      function getSavedReasonExplanation() {
        if (state.reasonKey === 'plazo') {
          return 'Como buscás mudarte más adelante, te avisamos con prioridad cerca de tu fecha según disponibilidad activa.';
        }
        if (state.reasonKey === 'espacio_mascota') {
          return 'Esta unidad no se adapta a la cantidad de personas o mascotas que marcaste, así que te anotamos para opciones con esa comodidad.';
        }
        if (state.reasonKey === 'anda_cgn') {
          return 'Esta propiedad opera con aseguradora privada; dejamos tu pedido guardado para avisarte apenas ingrese una unidad compatible con ANDA o Contaduría.';
        }
        if (state.reasonKey === 'cruzada_realidad') {
          return state.motivoDesvio;
        }
        return 'Esta propiedad trabaja con póliza aprobada de aseguradora; guardamos tu búsqueda para avisarte cuando ingrese una opción acorde o si sumás co-firmante.';
      }

      function checkStep1ReadyAndAdvance(triggerBtn) {
        if (!state.plazo || !state.mascota || !state.personas) return;
        animateAndGo(triggerBtn, function () {
          state.motivoDesvio = '';
          state.reasonKey = '';
          if (state.personas === '5 o más personas') {
            state.outcome = 'BUSQUEDA_REGISTRADA';
            state.reasonKey = 'espacio_mascota';
            state.motivoDesvio = 'Este apartamento admite hasta 4 personas';
            state.step = 4;
            sendSilentLog(4, 'BUSQUEDA_REGISTRADA_CUPO', false);
          } else if (state.mascota === '2 mascotas o perro grande') {
            state.outcome = 'BUSQUEDA_REGISTRADA';
            state.reasonKey = 'espacio_mascota';
            state.motivoDesvio = 'Esta unidad es en piso 1 con balcón al frente (admite 1 mascota chica)';
            state.step = 4;
            sendSilentLog(4, 'BUSQUEDA_REGISTRADA_MASCOTA', false);
          } else if (state.plazo !== 'Dentro de 30 días') {
            state.outcome = 'BUSQUEDA_REGISTRADA';
            state.reasonKey = 'plazo';
            state.motivoDesvio = 'Esta unidad está pronta para ingresar ahora';
            state.step = 4;
            sendSilentLog(4, 'BUSQUEDA_REGISTRADA_PLAZO', false);
          } else {
            state.step = 2;
            sendSilentLog(1, 'en_curso', false);
          }
          render();
        });
      }

      function getPrevSummaryVisita() {
        if (state.step === 2) {
          return { stepTo: 1, text: state.personas + ' · ' + state.mascota + ' · ' + state.plazo };
        }
        if (state.step === 3) {
          return {
            stepTo: 2,
            text: state.andaBridge ? 'Validar aseguradora con recibos (consulta ANDA/CGN)' : '1 o 2 ingresos formales'
          };
        }
        if (state.step === 4) {
          if (state.motivoDesvio) {
            return { stepTo: state.garantia ? 2 : 1, text: state.motivoDesvio };
          }
          if (state.garantia === 'poliza') {
            return { stepTo: 2, text: 'Póliza pre-aprobada · ' + state.personas };
          }
          if (state.escala2 === 'si') {
            return { stepTo: 3, text: 'Suma co-firmante con recibo limpio que firma el contrato' };
          }
          return { stepTo: 3, text: formatIngAlto() + '+ con 1 o 2 ingresos formales' };
        }
        return null;
      }

      function renderStoryBars(total, current) {
        var html = '<div class="zg-tf-stories" style="grid-template-columns:repeat(' + total + ',1fr);" aria-hidden="true">';
        for (var i = 1; i <= total; i++) {
          var cls = i < current ? 'is-done' : (i === current ? 'is-active' : '');
          html += '<div class="zg-tf-story-track ' + cls + '"><div class="zg-tf-story-fill"></div></div>';
        }
        html += '</div>';
        return html;
      }

      function renderSavedCardHtml() {
        var html = '<div class="zg-saved-card">';
        html += '<span class="zg-saved-badge">✓ BÚSQUEDA GUARDADA</span>';
        html += '<div class="zg-tf-q">Listo, ' + escHtml(state.nombre) + ': ya agendamos tu búsqueda</div>';
        html += '<div class="zg-tf-sub">' + escHtml(getSavedReasonExplanation()) + '</div>';
        html += '<div class="zg-saved-summary">';
        html += '<div><strong>Lo que cargaste:</strong> ' + escHtml(buildSummaryText()) + '</div>';
        html += '<div><strong>WhatsApp agendado:</strong> ' + escHtml(state.whatsapp) + '</div>';
        html += '<button type="button" class="zg-edit-saved-btn" id="zg-edit-saved-btn">✎ Corregir algún dato</button>';
        html += '</div>';
        html += '<div class="zg-extra-wa-block">';
        html += '<div class="zg-extra-wa-title">Querés aclarar mes exacto, otro barrio, mascota o si vendés antes de alquilar?</div>';
        html += '<button type="button" class="zg-cta-secondary" id="zg-extra-req-wa-btn">Sumar un requisito extra por WhatsApp (opcional) →</button>';
        html += '<div class="zg-wa-preaviso"><span class="zg-wa-dot"></span><span>Se abrirá tu WhatsApp con tu ficha de búsqueda para que escribas lo que necesites.</span></div>';
        html += '</div>';
        html += '<button type="button" class="zg-new-consult-btn" id="zg-new-consult-btn">↺ Empezar una consulta nueva</button>';
        html += '</div>';
        return html;
      }

      function renderSearchSaveForm(legalText) {
        var html = '<div class="zg-input-stack">';
        html += '<div><label for="zg-tf-nombre">Tu nombre *</label><input type="text" id="zg-tf-nombre" placeholder="Ej. Martín" value="' + escHtml(state.nombre) + '"></div>';
        html += '<div><label for="zg-tf-wa">Tu WhatsApp *</label><input type="tel" id="zg-tf-wa" placeholder="099 123 456" value="' + escHtml(state.whatsapp) + '"></div>';
        html += '<div class="zg-legal-pill">' + escHtml(legalText) + ' <button type="button" class="zg-privacy-btn" id="zg-privacy-toggle">Privacidad</button></div>';
        if (state.showPrivacy) {
          html += '<div class="zg-privacy-drawer">Ley 18.331 (Uruguay): Zaguán Propiedades registra tu búsqueda solo para avisarte cuando ingrese una unidad compatible. Sin cesión a terceros. Baja en todo momento por WhatsApp al +598 98 712 064.</div>';
        }
        if (state.validationMsg) {
          html += '<div class="zg-alert-inline">' + escHtml(state.validationMsg) + '</div>';
        }
        html += '<button type="button" class="zg-cta-primary" id="zg-save-search-btn">Aceptar y guardar mi búsqueda →</button>';
        html += '</div>';
        return html;
      }

      function renderVisitaMode() {
        var prev = getPrevSummaryVisita();
        var html = '';

        html += '<div class="zg-tf-top">';
        html += '<span class="zg-tf-kicker">Coordinar visita · 4 toques</span>';
        html += '<span class="zg-tf-step-meta"><span class="zg-tf-step-count">Paso ' + state.step + ' de 4</span>';
        if (state.step > 1) {
          html += ' · <button type="button" class="zg-reset-top-btn" id="zg-reset-top">↺ Empezar de nuevo</button>';
        }
        html += '</span></div>';
        html += renderStoryBars(4, state.step);
        html += '<div class="zg-tf-stage">';

        if (prev && !state.submitted) {
          html += '<button type="button" class="zg-tf-prev" data-go-step="' + prev.stepTo + '">';
          html += '<span>Respondiste: <strong>' + escHtml(prev.text) + '</strong></span>';
          html += '<span class="zg-tf-prev-edit">Cambiar ↺</span>';
          html += '</button>';
        }

        html += '<div class="zg-tf-current">';

        if (state.step === 1) {
          html += '<div class="zg-tf-q">Quiénes vivirían acá y cuándo buscás mudarte?</div>';
          html += '<div class="zg-tf-sub">Marcá las 3 filas abajo y avanzás en automático.</div>';

          html += '<div class="zg-tf-sublabel">1. Fecha estimada de mudanza</div>';
          html += '<div class="zg-chip-row">';
          ['Dentro de 30 días', 'Más adelante (otro mes)'].forEach(function (pl) {
            html += '<button type="button" class="zg-chip' + (state.plazo === pl ? ' is-selected' : '') + '" data-plazo="' + escHtml(pl) + '">' + escHtml(pl) + '</button>';
          });
          html += '</div>';

          html += '<div class="zg-tf-sublabel">2. Mascotas</div>';
          html += '<div class="zg-chip-row">';
          ['Sin mascotas', '1 mascota chica', '2 mascotas o perro grande'].forEach(function (mc) {
            html += '<button type="button" class="zg-chip' + (state.mascota === mc ? ' is-selected' : '') + '" data-mascota="' + escHtml(mc) + '">' + escHtml(mc) + '</button>';
          });
          html += '</div>';

          html += '<div class="zg-tf-sublabel">3. Cuántas personas vivirían acá</div>';
          html += '<div class="zg-opt-list">';
          ['1 persona o pareja', '3 a 4 personas', '5 o más personas'].forEach(function (pe) {
            html += '<button type="button" class="zg-opt-btn' + (state.personas === pe ? ' is-selected' : '') + '" data-personas="' + escHtml(pe) + '"><span>' + escHtml(pe) + '</span><span class="zg-opt-arrow">→</span></button>';
          });
          html += '</div>';
        } else if (state.step === 2) {
          html += '<div class="zg-tf-q">Con qué respaldo pensás alquilar?</div>';
          html += '<div class="zg-tf-sub">Esta unidad trabaja con aseguradora privada (no necesitás tener la póliza emitida antes de visitar; se tramita si te gusta).</div>';
          html += '<div class="zg-opt-list">';
          html += '<button type="button" class="zg-opt-btn" data-gar="ingresos"><span>1 o 2 ingresos formales<span class="zg-opt-sub">Recibo en BPS, jubilación o unipersonal +1 año con contador</span></span><span class="zg-opt-arrow">→</span></button>';
          html += '<button type="button" class="zg-opt-btn" data-gar="poliza"><span>Ya cuento con póliza pre-aprobada<span class="zg-opt-sub">Porto, Sura, Mapfre, Santander o BSE</span></span><span class="zg-opt-arrow">→</span></button>';
          html += '<button type="button" class="zg-opt-btn' + (state.showAndaBridge ? ' is-selected' : '') + '" data-gar="anda_cgn"><span>Tengo ANDA o Contaduría (CGN)<span class="zg-opt-sub">Con recibo limpio — validamos aseguradora o unidades acordes</span></span><span class="zg-opt-arrow">→</span></button>';
          html += '<button type="button" class="zg-opt-btn" data-gar="otra"><span>Cobro sin recibo formal o estoy en Clearing</span><span class="zg-opt-arrow">→</span></button>';
          html += '</div>';

          if (state.showAndaBridge) {
            html += '<div class="zg-escala2-box">';
            html += '<div class="zg-escala2-title">Puente rápido · Teniendo recibo limpio</div>';
            html += '<div class="zg-escala2-desc">Si tenés recibo para ANDA o Contaduría, con ese mismo recibo solés aprobar Porto o Sura en 24 hs. Qué preferís hacer?</div>';
            html += '<div class="zg-opt-list">';
            html += '<button type="button" class="zg-opt-btn" data-anda-bridge="si"><span>Evaluar aseguradora privada con mis recibos</span><span class="zg-opt-arrow">→</span></button>';
            html += '<button type="button" class="zg-opt-btn" data-anda-bridge="no"><span>Buscar solo unidades que acepten ANDA o CGN</span><span class="zg-opt-arrow">→</span></button>';
            html += '</div></div>';
          }
        } else if (state.step === 3) {
          html += '<div class="zg-tf-q">En qué rango están los ingresos formales?</div>';
          html += '<div class="zg-tf-sub">Sumando quienes firman el contrato (~30% del valor del alquiler sobre historial limpio).</div>';
          html += '<div class="zg-opt-list">';
          html += '<button type="button" class="zg-opt-btn" data-ing="ok"><span>' + escHtml(formatIngAlto()) + ' o más líquidos por mes</span><span class="zg-opt-arrow">→</span></button>';
          html += '<button type="button" class="zg-opt-btn' + (state.showEscala2 && state.ingresos === 'cerca' ? ' is-selected' : '') + '" data-ing="cerca"><span>Entre $U ' + ingMedio.toLocaleString('de-DE') + ' y $U ' + (ingAlto - 1000).toLocaleString('de-DE') + ' por mes<span class="zg-opt-sub">Opción de sumar co-firmante</span></span><span class="zg-opt-arrow">→</span></button>';
          html += '<button type="button" class="zg-opt-btn' + (state.showEscala2 && state.ingresos === 'bajo' ? ' is-selected' : '') + '" data-ing="bajo"><span>Menos de $U ' + ingMedio.toLocaleString('de-DE') + ' individuales<span class="zg-opt-sub">Consultamos si sumás co-firmante</span></span><span class="zg-opt-arrow">→</span></button>';
          html += '</div>';

          if (state.showEscala2) {
            html += '<div class="zg-escala2-box">';
            html += '<div class="zg-escala2-title">Escala 2 · Sumar co-firmante</div>';
            html += '<div class="zg-escala2-desc">Para alcanzar el tope de la aseguradora podés sumar 1 familiar o co-firmante con recibo limpio (toda persona que aporta recibo firma el contrato). Contás con alguien para sumar?</div>';
            html += '<div class="zg-opt-list">';
            html += '<button type="button" class="zg-opt-btn" data-escala2="si"><span>Sí, sumamos 1 co-firmante con recibo limpio que firma el contrato</span><span class="zg-opt-arrow">→</span></button>';
            html += '<button type="button" class="zg-opt-btn" data-escala2="no"><span>Por ahora contamos solo con este ingreso</span><span class="zg-opt-arrow">→</span></button>';
            html += '</div></div>';
          }
        } else if (state.step === 4) {
          if (state.outcome === 'WHATSAPP_CALIFICADO') {
            var greet = state.nombre ? ('Listo, ' + escHtml(state.nombre) + ': ') : '';
            html += '<div class="zg-tf-q">' + greet + 'cumplís los requisitos para visitar ' + escHtml(opts.tituloCorto) + '</div>';
            html += '<div class="zg-tf-sub">Escribí tu nombre de pila para armar tu consulta y coordinar horario con Mar.</div>';
            html += '<div class="zg-input-stack">';
            html += '<div><label for="zg-tf-nombre">Tu nombre *</label><input type="text" id="zg-tf-nombre" placeholder="Ej. Lucía" value="' + escHtml(state.nombre) + '"></div>';
            html += '<div class="zg-wa-preaviso"><span class="zg-wa-dot"></span><span>Se abrirá tu WhatsApp con la consulta armada para que la revises antes de enviar.</span></div>';
            if (state.validationMsg) {
              html += '<div class="zg-alert-inline">' + escHtml(state.validationMsg) + '</div>';
            }
            html += '<button type="button" class="zg-cta-primary" id="zg-wa-go-btn">Aceptar y abrir WhatsApp con Mar →</button>';
            html += '<div class="zg-legal-note">Al tocar el botón aceptás que Zaguán use tus respuestas solo para atender esta consulta de alquiler (Ley 18.331). <button type="button" class="zg-privacy-btn" id="zg-privacy-toggle">Privacidad</button></div>';
            if (state.showPrivacy) {
              html += '<div class="zg-privacy-drawer">Ley 18.331 (Uruguay): Zaguán Propiedades usa estas respuestas solo para coordinar visitas y validar búsquedas de alquiler, sin cesión a terceros. Baja por WhatsApp al +598 98 712 064.</div>';
            }
            html += '</div>';
          } else if (state.submitted) {
            html += renderSavedCardHtml();
          } else {
            html += '<div class="zg-tf-q">' + escHtml(state.motivoDesvio || 'Guardá tu búsqueda para avisarte') + '</div>';
            html += '<div class="zg-tf-sub">' + escHtml(getSavedReasonExplanation()) + '</div>';
            html += renderSearchSaveForm('Al guardar autorizás a Zaguán Propiedades a registrar tu nombre y celular solo para avisarte cuando ingrese un alquiler acorde, sin cesión a terceros (Ley 18.331).');
          }
        }

        html += '</div>'; // .zg-tf-current

        if (state.step === 1) html += '<div class="zg-tf-next">Siguiente: Modalidad de garantía</div>';
        else if (state.step === 2) html += '<div class="zg-tf-next">Siguiente: Ingresos formales</div>';
        else if (state.step === 3) html += '<div class="zg-tf-next">Siguiente: Tu nombre y coordinación</div>';

        html += '</div>'; // .zg-tf-stage

        if (!state.submitted) {
          html += '<button type="button" class="zg-cruzada-trigger" id="zg-open-cruzada">Buscás amoblado, patio u otra zona (La Barra / Punta del Este)? Contanos acá →</button>';
        }
        return html;
      }

      function renderCruzadaMode() {
        var html = '';
        html += '<div class="zg-tf-top">';
        html += '<button type="button" class="zg-back-link" id="zg-back-visita">← Volver a esta unidad</button>';
        html += '<span class="zg-tf-step-meta"><span class="zg-tf-step-count">Búsqueda ' + state.step + ' de 3</span>';
        if (state.step > 1) {
          html += ' · <button type="button" class="zg-reset-top-btn" id="zg-reset-top">↺ Empezar de nuevo</button>';
        }
        html += '</span></div>';
        html += renderStoryBars(3, state.step);
        html += '<div class="zg-tf-stage">';

        if (state.step > 1 && !state.submitted) {
          var prevTxt = state.step === 2
            ? ((state.cruzadaZona || '') + (state.cruzadaComodidades.length ? ' · ' + state.cruzadaComodidades.join(', ') : ''))
            : ([state.cruzadaZona, state.cruzadaHogar, state.cruzadaPlazo, state.cruzadaRespaldo].filter(Boolean).join(' · '));
          html += '<button type="button" class="zg-tf-prev" data-go-cruzada="' + (state.step - 1) + '">';
          html += '<span>Respondiste: <strong>' + escHtml(prevTxt) + '</strong></span>';
          html += '<span class="zg-tf-prev-edit">Cambiar ↺</span></button>';
        }

        html += '<div class="zg-tf-current">';
        if (state.step === 1) {
          html += '<div class="zg-tf-q">En qué zona buscás y qué comodidades priorizás?</div>';
          html += '<div class="zg-tf-sub">Elegí tu zona principal y combiná lo que necesitás para la mudanza.</div>';

          html += '<div class="zg-tf-sublabel">1. Zona preferida</div>';
          html += '<div class="zg-chip-row">';
          ['La Barra / Manantiales', 'Punta del Este', 'Maldonado (otros barrios)', 'Solanas / Punta Ballena / Piriápolis'].forEach(function (zn) {
            html += '<button type="button" class="zg-chip' + (state.cruzadaZona === zn ? ' is-selected' : '') + '" data-czona="' + escHtml(zn) + '">' + escHtml(zn) + '</button>';
          });
          html += '</div>';

          html += '<div class="zg-tf-sublabel">2. Qué priorizás (podés marcar varias)</div>';
          html += '<div class="zg-chip-row">';
          ['Amoblado', 'Sin muebles', 'Patio o planta baja', '3+ dormitorios', 'Cochera'].forEach(function (cm) {
            var active = state.cruzadaComodidades.indexOf(cm) !== -1;
            html += '<button type="button" class="zg-chip' + (active ? ' is-selected' : '') + '" data-ccom="' + escHtml(cm) + '">' + escHtml(cm) + '</button>';
          });
          html += '</div>';

          if (state.validationMsg) {
            html += '<div class="zg-alert-inline">' + escHtml(state.validationMsg) + '</div>';
          }
          html += '<button type="button" class="zg-cta-primary" id="zg-cruzada-p1-next">Siguiente →</button>';
        } else if (state.step === 2) {
          html += '<div class="zg-tf-q">Cuándo se mudan, quiénes son y con qué respaldo alquilan?</div>';
          html += '<div class="zg-tf-sub">Marcá las 3 filas abajo para ajustar el filtro de cartera.</div>';

          html += '<div class="zg-tf-sublabel">1. Fecha estimada de mudanza</div>';
          html += '<div class="zg-chip-row">';
          ['Dentro de 30 días', 'Próximos 60 días', 'Más adelante'].forEach(function (pl) {
            html += '<button type="button" class="zg-chip' + (state.cruzadaPlazo === pl ? ' is-selected' : '') + '" data-cplazo="' + escHtml(pl) + '">' + escHtml(pl) + '</button>';
          });
          html += '</div>';

          html += '<div class="zg-tf-sublabel">2. Quiénes se mudan</div>';
          html += '<div class="zg-chip-row">';
          ['1 persona o pareja', 'Familia con hijos', 'Con mascotas'].forEach(function (hg) {
            html += '<button type="button" class="zg-chip' + (state.cruzadaHogar === hg ? ' is-selected' : '') + '" data-chogar="' + escHtml(hg) + '">' + escHtml(hg) + '</button>';
          });
          html += '</div>';

          html += '<div class="zg-tf-sublabel">3. Respaldo de garantía</div>';
          html += '<div class="zg-opt-list">';
          ['Aseguradora / Recibos limpios', 'ANDA o Contaduría (CGN)', 'Mudanza desde el exterior / Empresa', 'Sin garantía tradicional aún'].forEach(function (rs) {
            html += '<button type="button" class="zg-opt-btn' + (state.cruzadaRespaldo === rs ? ' is-selected' : '') + '" data-crespaldo="' + escHtml(rs) + '"><span>' + escHtml(rs) + '</span><span class="zg-opt-arrow">→</span></button>';
          });
          html += '</div>';
        } else if (state.step === 3) {
          if (!state.cruzadaRango) {
            html += '<div class="zg-tf-q">Hasta qué valor mensual te queda cómodo evaluar?</div>';
            html += '<div class="zg-tf-sub">Lo usamos solo para filtrar zona y comodidades reales de mercado.</div>';
            html += '<div class="zg-opt-list">';
            ['Hasta $U 35.000/mes', '$U 35.000 a $U 55.000/mes', 'USD 1.200 a USD 1.600/mes', 'Más de USD 1.600/mes'].forEach(function (rg) {
              html += '<button type="button" class="zg-opt-btn" data-cruzada-rango="' + escHtml(rg) + '"><span>' + escHtml(rg) + '</span><span class="zg-opt-arrow">→</span></button>';
            });
            html += '</div>';
          } else {
            var ev = evaluateCruzadaOutcome();
            state.outcome = ev.outcome;
            state.reasonKey = ev.reasonKey;
            state.motivoDesvio = ev.motivo;
            if (ev.outcome === 'BUSQUEDA_REGISTRADA') {
              if (state.submitted) {
                html += renderSavedCardHtml();
              } else {
                html += '<div class="zg-tf-q">Dejá tu búsqueda registrada para avisarte</div>';
                html += '<div class="zg-tf-sub">' + escHtml(ev.motivo) + '.</div>';
                html += renderSearchSaveForm('Al guardar autorizás a Zaguán Propiedades a registrar tu nombre y celular solo para avisarte cuando ingrese una opción acorde, sin cesión a terceros (Ley 18.331).');
              }
            } else {
              html += '<div class="zg-tf-q">' + (state.nombre ? ('Listo, ' + escHtml(state.nombre) + ': ') : '') + 'buscamos en ' + escHtml(state.cruzadaZona) + '</div>';
              html += '<div class="zg-tf-sub">Rango cómodo: <strong>' + escHtml(state.cruzadaRango) + '</strong> · ' + escHtml(state.cruzadaRespaldo) + '. Dejá tu nombre para abrir WhatsApp prioritario con Mar.</div>';
              html += '<div class="zg-input-stack">';
              html += '<div><label for="zg-tf-nombre">Tu nombre *</label><input type="text" id="zg-tf-nombre" placeholder="Ej. Valeria" value="' + escHtml(state.nombre) + '"></div>';
              html += '<div class="zg-wa-preaviso"><span class="zg-wa-dot"></span><span>Se abrirá tu WhatsApp con tu pedido armado para que lo revises antes de enviar.</span></div>';
              if (state.validationMsg) {
                html += '<div class="zg-alert-inline">' + escHtml(state.validationMsg) + '</div>';
              }
              html += '<button type="button" class="zg-cta-primary" id="zg-cruzada-wa-btn">Aceptar y abrir WhatsApp prioritario →</button>';
              html += '<div class="zg-legal-note">Al tocar el botón aceptás que Zaguán use tus respuestas solo para atender esta búsqueda de alquiler (Ley 18.331). <button type="button" class="zg-privacy-btn" id="zg-privacy-toggle">Privacidad</button></div>';
              if (state.showPrivacy) {
                html += '<div class="zg-privacy-drawer">Ley 18.331 (Uruguay): Zaguán Propiedades guarda tu búsqueda solo para presentarte propiedades compatibles, sin cesión a terceros. Baja por WhatsApp al +598 98 712 064.</div>';
              }
              html += '</div>';
            }
          }
        }
        html += '</div>';

        if (state.step === 1) html += '<div class="zg-tf-next">Siguiente: Plazo, hogar y respaldo</div>';
        else if (state.step === 2) html += '<div class="zg-tf-next">Siguiente: Rango mensual cómodo</div>';

        html += '</div>';
        return html;
      }

      function render() {
        root.innerHTML = '<div class="zg-tf-shell">' + (state.modo === 'captacion_cruzada' ? renderCruzadaMode() : renderVisitaMode()) + '</div>';
        syncHiddenLegacy();
        syncMobileBottomBar();
        bindEvents();
      }

      function bindEvents() {
        var resetTopBtn = document.getElementById('zg-reset-top');
        if (resetTopBtn) {
          resetTopBtn.addEventListener('click', function () {
            flujoCerrado = false;
            leftToWhatsApp = false;
            resetToStep1({ newSession: true, keepContact: false });
          });
        }

        root.querySelectorAll('[data-go-step]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.step = Number(el.getAttribute('data-go-step')) || 1;
            state.validationMsg = '';
            state.submitted = false;
            state.showEscala2 = false;
            state.showAndaBridge = false;
            render();
          });
        });

        root.querySelectorAll('[data-plazo]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.plazo = el.getAttribute('data-plazo');
            render();
            checkStep1ReadyAndAdvance(root.querySelector('[data-plazo="' + state.plazo.replace(/"/g, '\\"') + '"]'));
          });
        });

        root.querySelectorAll('[data-mascota]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.mascota = el.getAttribute('data-mascota');
            render();
            checkStep1ReadyAndAdvance(root.querySelector('[data-mascota="' + state.mascota.replace(/"/g, '\\"') + '"]'));
          });
        });

        root.querySelectorAll('[data-personas]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.personas = el.getAttribute('data-personas');
            render();
            checkStep1ReadyAndAdvance(root.querySelector('[data-personas="' + state.personas.replace(/"/g, '\\"') + '"]'));
          });
        });

        root.querySelectorAll('[data-gar]').forEach(function (el) {
          el.addEventListener('click', function () {
            var g = el.getAttribute('data-gar');
            state.garantia = g;
            state.motivoDesvio = '';
            state.reasonKey = '';
            state.showEscala2 = false;
            state.andaBridge = false;
            if (g === 'anda_cgn') {
              state.showAndaBridge = true;
              sendSilentLog(2, 'anda_cgn_puente_abierto', false);
              render();
              return;
            }
            state.showAndaBridge = false;
            animateAndGo(el, function () {
              if (g === 'ingresos') {
                state.garantiaLabel = '1 o 2 ingresos formales';
                state.step = 3;
                sendSilentLog(2, 'en_curso', false);
              } else if (g === 'poliza') {
                state.garantiaLabel = 'Póliza pre-aprobada';
                state.ingresos = 'ok';
                state.outcome = 'WHATSAPP_CALIFICADO';
                state.step = 4;
                sendSilentLog(3, 'califico_poliza', false);
              } else {
                state.garantiaLabel = 'Sin recibo formal o con Clearing';
                state.ingresos = 'bajo';
                state.outcome = 'BUSQUEDA_REGISTRADA';
                state.reasonKey = 'garantia';
                state.motivoDesvio = 'Este propietario alquila solo con póliza de aseguradora privada';
                state.step = 4;
                sendSilentLog(4, 'BUSQUEDA_REGISTRADA_GARANTIA', false);
              }
              render();
            });
          });
        });

        root.querySelectorAll('[data-anda-bridge]').forEach(function (el) {
          el.addEventListener('click', function () {
            var ans = el.getAttribute('data-anda-bridge');
            animateAndGo(el, function () {
              state.showAndaBridge = false;
              if (ans === 'si') {
                state.andaBridge = true;
                state.garantia = 'ingresos';
                state.garantiaLabel = 'Recibos limpios (consulta ANDA/CGN)';
                state.step = 3;
                sendSilentLog(2, 'anda_puente_aseguradora', false);
              } else {
                state.garantia = 'anda_cgn';
                state.garantiaLabel = 'ANDA o Contaduría (CGN)';
                state.outcome = 'BUSQUEDA_REGISTRADA';
                state.reasonKey = 'anda_cgn';
                state.motivoDesvio = 'Buscamos opciones compatibles con ANDA o Contaduría (CGN)';
                state.step = 4;
                sendSilentLog(4, 'BUSQUEDA_REGISTRADA_ANDA_CGN', false);
              }
              render();
            });
          });
        });

        root.querySelectorAll('[data-ing]').forEach(function (el) {
          el.addEventListener('click', function () {
            var ing = el.getAttribute('data-ing');
            state.ingresos = ing;
            state.escala2 = '';
            state.motivoDesvio = '';
            state.reasonKey = '';
            if (ing === 'cerca' || ing === 'bajo') {
              state.showEscala2 = true;
              sendSilentLog(3, 'escala_2_abierta_' + ing, false);
              render();
              return;
            }
            animateAndGo(el, function () {
              state.showEscala2 = false;
              state.outcome = 'WHATSAPP_CALIFICADO';
              state.step = 4;
              sendSilentLog(3, 'califico_ingresos', false);
              render();
            });
          });
        });

        root.querySelectorAll('[data-escala2]').forEach(function (el) {
          el.addEventListener('click', function () {
            var ans = el.getAttribute('data-escala2');
            state.escala2 = ans;
            animateAndGo(el, function () {
              if (ans === 'si') {
                state.garantiaLabel = 'Ingresos + 1 co-firmante firmante';
                state.outcome = 'WHATSAPP_CALIFICADO';
                state.step = 4;
                sendSilentLog(3, 'califico_escala_2', false);
              } else {
                state.outcome = 'BUSQUEDA_REGISTRADA';
                state.reasonKey = 'garantia';
                state.motivoDesvio = 'La aseguradora requiere ' + formatIngAlto() + ' líquidos o sumar co-firmante';
                state.step = 4;
                sendSilentLog(4, 'BUSQUEDA_REGISTRADA_ESCALA2_NO', false);
              }
              render();
            });
          });
        });

        var nombreIn = document.getElementById('zg-tf-nombre');
        if (nombreIn) {
          nombreIn.addEventListener('input', function () {
            state.nombre = nombreIn.value.trim();
            var qEl = root.querySelector('.zg-tf-q');
            if (qEl && state.outcome === 'WHATSAPP_CALIFICADO' && state.modo === 'visita') {
              qEl.textContent = (state.nombre ? ('Listo, ' + state.nombre + ': ') : '') + 'cumplís los requisitos para visitar ' + opts.tituloCorto;
            }
            syncMobileBottomBar();
          });
        }

        var waIn = document.getElementById('zg-tf-wa');
        if (waIn) {
          waIn.addEventListener('input', function () {
            state.whatsapp = waIn.value.trim();
          });
        }

        var privBtn = document.getElementById('zg-privacy-toggle');
        if (privBtn) {
          privBtn.addEventListener('click', function () {
            state.showPrivacy = !state.showPrivacy;
            render();
          });
        }

        var waGoBtn = document.getElementById('zg-wa-go-btn');
        if (waGoBtn) {
          waGoBtn.addEventListener('click', function () {
            if (!state.nombre) {
              state.validationMsg = 'Escribí tu nombre arriba para personalizar tu consulta.';
              render();
              return;
            }
            state.validationMsg = '';
            waGoBtn.textContent = 'Abriendo tu WhatsApp con la consulta lista…';
            waGoBtn.disabled = true;
            flujoCerrado = true;
            leftToWhatsApp = true;
            sendSilentLog(4, 'WHATSAPP_CALIFICADO', true);
            var leadPayload = {
              event: 'generate_lead',
              property_id: opts.refPublica,
              property_name: opts.tituloCorto,
              garantia_tipo: state.garantia || 'poliza',
              escala_2: state.escala2 || 'no_aplica',
              consent_version: CONSENT_VERSION,
              lead_calificado: true,
              cta_location: 'typeform_4_rayitas_v2',
              value: opts.valorMensual || 30000,
              currency: 'UYU'
            };
            if (typeof opts.onLead === 'function') opts.onLead(leadPayload);
            else pushDataLayer(leadPayload);
            window.open(buildQualifiedWaUrl(), '_blank', 'noopener,noreferrer');
          });
        }

        var saveBtn = document.getElementById('zg-save-search-btn');
        if (saveBtn) {
          saveBtn.addEventListener('click', function () {
            var digits = String(state.whatsapp || '').replace(/\D/g, '');
            if (!state.nombre || digits.length < 8) {
              state.validationMsg = 'Completá tu nombre y un WhatsApp válido de al menos 8 dígitos.';
              render();
              return;
            }
            if (/^09/.test(digits)) digits = '598' + digits.slice(1);
            else if (digits.length === 8) digits = '598' + digits;
            saveBtn.disabled = true;
            saveBtn.textContent = 'Guardando búsqueda…';

            var esCruzada = state.modo === 'captacion_cruzada';
            var payload = esCruzada
              ? {
                  id: state.savedLeadId || undefined,
                  nombre: state.nombre,
                  telefono: digits,
                  tipo_operacion: 'Alquiler Anual',
                  zona_preferida: state.cruzadaZona,
                  desde_cuando: state.cruzadaPlazo,
                  personas_cantidad: state.cruzadaHogar,
                  garantia_disponible: state.cruzadaRespaldo,
                  comodidades_pedidas: state.cruzadaComodidades.join(', '),
                  consent_version: CONSENT_VERSION,
                  consent_timestamp: new Date().toISOString(),
                  canal: 'captacion_cruzada_web',
                  propiedad_interes: opts.tituloCorto,
                  contexto: 'general',
                  texto: '[ALERTA PASIVA D1] Búsqueda guardada (' + buildSummaryText() + ' · Motivo: ' + state.motivoDesvio + ')'
                }
              : {
                  id: state.savedLeadId || undefined,
                  nombre: state.nombre,
                  telefono: digits,
                  tipo_operacion: 'Alquiler Anual',
                  zona_preferida: 'Maldonado',
                  desde_cuando: state.plazo,
                  personas_cantidad: state.personas,
                  tiene_mascota: state.mascota,
                  garantia_disponible: state.garantiaLabel || state.garantia || 'A evaluar',
                  consent_version: CONSENT_VERSION,
                  consent_timestamp: new Date().toISOString(),
                  canal: 'web_ficha_filtro',
                  propiedad_interes: opts.tituloCorto,
                  contexto: 'general',
                  texto: '[ALERTA PASIVA D1] Registro desde filtro en ' + opts.tituloCorto + ': ' + buildSummaryText() + ' (' + state.motivoDesvio + ')'
                };

            sendSilentLog(esCruzada ? 3 : 4, 'BUSQUEDA_REGISTRADA', true);
            fetch(CRM_BASE + '/api/interesados', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            }).then(function (r) { return r.json(); }).then(function (out) {
              if (out && out.id) state.savedLeadId = out.id;
              state.submitted = true;
              state.validationMsg = '';
              flujoCerrado = true;
              render();
            }).catch(function () {
              state.validationMsg = 'No pudimos guardar en este instante. Probá de nuevo en un segundo.';
              render();
            });
          });
        }

        var editSavedBtn = document.getElementById('zg-edit-saved-btn');
        if (editSavedBtn) {
          editSavedBtn.addEventListener('click', function () {
            state.submitted = false;
            state.step = 1;
            state.validationMsg = '';
            flujoCerrado = false;
            if (state.modo === 'captacion_cruzada') state.cruzadaRango = '';
            render();
          });
        }

        var extraReqWaBtn = document.getElementById('zg-extra-req-wa-btn');
        if (extraReqWaBtn) {
          extraReqWaBtn.addEventListener('click', function () {
            extraReqWaBtn.textContent = 'Abriendo tu WhatsApp con la ficha lista…';
            extraReqWaBtn.disabled = true;
            flujoCerrado = true;
            leftToWhatsApp = true;
            sendSilentLog(state.modo === 'captacion_cruzada' ? 3 : 4, 'REQUISITO_EXTRA_WHATSAPP', true);
            window.open(buildExtraReqWaUrl(), '_blank', 'noopener,noreferrer');
          });
        }

        var newConsultBtn = document.getElementById('zg-new-consult-btn');
        if (newConsultBtn) {
          newConsultBtn.addEventListener('click', function () {
            flujoCerrado = false;
            leftToWhatsApp = false;
            resetToStep1({ newSession: true, keepContact: false });
          });
        }

        var openCruzadaBtn = document.getElementById('zg-open-cruzada');
        if (openCruzadaBtn) {
          openCruzadaBtn.addEventListener('click', function () {
            state.modo = 'captacion_cruzada';
            state.step = 1;
            state.submitted = false;
            state.cruzadaRango = '';
            state.validationMsg = '';
            flujoCerrado = false;
            sendSilentLog(1, 'cruzada_iniciada', false);
            render();
          });
        }

        var backVisBtn = document.getElementById('zg-back-visita');
        if (backVisBtn) {
          backVisBtn.addEventListener('click', function () {
            state.modo = 'visita';
            state.step = 1;
            state.submitted = false;
            state.validationMsg = '';
            flujoCerrado = false;
            render();
          });
        }

        root.querySelectorAll('[data-go-cruzada]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.step = Number(el.getAttribute('data-go-cruzada')) || 1;
            if (state.step < 3) state.cruzadaRango = '';
            state.submitted = false;
            state.validationMsg = '';
            render();
          });
        });

        root.querySelectorAll('[data-czona]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.cruzadaZona = el.getAttribute('data-czona');
            state.validationMsg = '';
            render();
          });
        });

        root.querySelectorAll('[data-ccom]').forEach(function (el) {
          el.addEventListener('click', function () {
            var val = el.getAttribute('data-ccom');
            var idx = state.cruzadaComodidades.indexOf(val);
            if (idx !== -1) {
              state.cruzadaComodidades.splice(idx, 1);
            } else {
              if (val === 'Amoblado') {
                state.cruzadaComodidades = state.cruzadaComodidades.filter(function (x) { return x !== 'Sin muebles'; });
              } else if (val === 'Sin muebles') {
                state.cruzadaComodidades = state.cruzadaComodidades.filter(function (x) { return x !== 'Amoblado'; });
              }
              state.cruzadaComodidades.push(val);
            }
            render();
          });
        });

        var p1NextBtn = document.getElementById('zg-cruzada-p1-next');
        if (p1NextBtn) {
          p1NextBtn.addEventListener('click', function () {
            if (!state.cruzadaZona) {
              state.validationMsg = 'Elegí primero la zona principal donde buscás alquilar.';
              render();
              return;
            }
            state.validationMsg = '';
            state.step = 2;
            sendSilentLog(1, 'cruzada_paso1', false);
            render();
          });
        }

        function checkCruzadaStep2AndAdvance(btnEl) {
          if (!state.cruzadaPlazo || !state.cruzadaHogar || !state.cruzadaRespaldo) return;
          animateAndGo(btnEl, function () {
            state.step = 3;
            sendSilentLog(2, 'cruzada_paso2', false);
            render();
          });
        }

        root.querySelectorAll('[data-cplazo]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.cruzadaPlazo = el.getAttribute('data-cplazo');
            render();
            checkCruzadaStep2AndAdvance(root.querySelector('[data-cplazo="' + state.cruzadaPlazo.replace(/"/g, '\\"') + '"]'));
          });
        });

        root.querySelectorAll('[data-chogar]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.cruzadaHogar = el.getAttribute('data-chogar');
            render();
            checkCruzadaStep2AndAdvance(root.querySelector('[data-chogar="' + state.cruzadaHogar.replace(/"/g, '\\"') + '"]'));
          });
        });

        root.querySelectorAll('[data-crespaldo]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.cruzadaRespaldo = el.getAttribute('data-crespaldo');
            render();
            checkCruzadaStep2AndAdvance(root.querySelector('[data-crespaldo="' + state.cruzadaRespaldo.replace(/"/g, '\\"') + '"]'));
          });
        });

        root.querySelectorAll('[data-cruzada-rango]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.cruzadaRango = el.getAttribute('data-cruzada-rango');
            animateAndGo(el, function () {
              sendSilentLog(3, 'cruzada_paso3', false);
              render();
            });
          });
        });

        var cruzWaBtn = document.getElementById('zg-cruzada-wa-btn');
        if (cruzWaBtn) {
          cruzWaBtn.addEventListener('click', function () {
            if (!state.nombre) {
              state.validationMsg = 'Escribí tu nombre arriba antes de abrir WhatsApp.';
              render();
              return;
            }
            state.validationMsg = '';
            cruzWaBtn.textContent = 'Abriendo tu WhatsApp con la consulta lista…';
            cruzWaBtn.disabled = true;
            flujoCerrado = true;
            leftToWhatsApp = true;
            sendSilentLog(3, 'CAPTACION_CRUZADA', true);
            fetch(CRM_BASE + '/api/interesados', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                nombre: state.nombre,
                tipo_operacion: 'Alquiler Anual',
                zona_preferida: state.cruzadaZona,
                desde_cuando: state.cruzadaPlazo,
                personas_cantidad: state.cruzadaHogar,
                garantia_disponible: state.cruzadaRespaldo,
                comodidades_pedidas: state.cruzadaComodidades.join(', '),
                consent_version: CONSENT_VERSION,
                consent_timestamp: new Date().toISOString(),
                estado_busqueda: 'caza_activa_hoy',
                canal: 'captacion_cruzada_web',
                propiedad_interes: opts.tituloCorto,
                contexto: 'general',
                texto: '[BÚSQUEDA PRIORITARIA] ' + buildSummaryText()
              }),
              keepalive: true
            }).catch(function () {});
            var cruzLeadPayload = {
              event: 'generate_lead',
              lead_source: 'captacion_cruzada_atributos',
              property_id: opts.refPublica,
              zona: state.cruzadaZona,
              rango: state.cruzadaRango,
              consent_version: CONSENT_VERSION,
              lead_calificado: true
            };
            if (typeof opts.onLead === 'function') opts.onLead(cruzLeadPayload);
            else pushDataLayer(cruzLeadPayload);
            window.open(buildCruzadaWaUrl(), '_blank', 'noopener,noreferrer');
          });
        }
      }

      if (!root.dataset.zgLifecycleBound) {
        root.dataset.zgLifecycleBound = '1';
        document.addEventListener('visibilitychange', function () {
          if (document.visibilityState === 'hidden') {
            hiddenAt = Date.now();
            if (leftToWhatsApp) flujoCerrado = true;
          } else if (document.visibilityState === 'visible') {
            var awayTooLong = hiddenAt && (Date.now() - hiddenAt > 180000);
            if (flujoCerrado || awayTooLong) {
              leftToWhatsApp = false;
              flujoCerrado = false;
              hiddenAt = 0;
              resetToStep1({ newSession: true, keepContact: false });
            } else {
              hiddenAt = 0;
            }
          }
        });

        window.addEventListener('pageshow', function (ev) {
          if (ev.persisted || flujoCerrado || leftToWhatsApp || state.step === 4 || state.submitted) {
            leftToWhatsApp = false;
            flujoCerrado = false;
            hiddenAt = 0;
            resetToStep1({ newSession: true, keepContact: false });
          }
        });
      }

      render();
    }
  };
})();
