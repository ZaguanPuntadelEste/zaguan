/* ZAGUÁN Propiedades — Flujo móvil Vuelta 3 (1 pregunta = 1 toque avanza en 150 ms) + Captación cruzada + Log D1 */
(function () {
  var CRM_BASE = 'https://zaguan-crm-bot.943ari.workers.dev';
  var WA_PHONE = '59898712064';
  var CONSENT_VERSION = 'ley18331-btn-v3';

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
      var mascotaPolicy = opts.mascotaPolicy || 'chica';

      var flujoCerrado = false;
      var leftToWhatsApp = false;
      var hiddenAt = 0;

      var state = {
        modo: 'visita', // 'visita' | 'captacion_cruzada'
        step: 1,        // visita: 1..5 preguntas, 6 final | cruzada: 1..4 preguntas, 5 final
        substep: '',    // '' | 'anda_bridge' | 'escala2'
        lastQuestionStep: 1,
        lastSubstep: '',
        plazo: '',
        personas: '',
        mascota: '',
        garantia: '',
        garantiaLabel: '',
        andaBridge: false,
        ingresos: '',
        escala2: '',
        outcome: 'WHATSAPP_CALIFICADO', // 'WHATSAPP_CALIFICADO' | 'BUSQUEDA_REGISTRADA'
        reasonKey: '',
        motivoDesvio: '',
        nombre: '',
        whatsapp: '',
        savedLeadId: '',
        showPrivacy: false,
        submitted: false,
        validationMsg: '',
        invalidNombre: false,
        invalidWa: false,
        cruzadaZona: '',
        cruzadaComodidades: [],
        cruzadaSub: 'plazo', // 'plazo' | 'hogar' | 'respaldo'
        cruzadaPlazo: '',
        cruzadaHogar: '',
        cruzadaRespaldo: '',
        cruzadaRango: ''
      };

      function clearValidation() {
        state.validationMsg = '';
        state.invalidNombre = false;
        state.invalidWa = false;
      }

      function resetToStep1(resetOpts) {
        var o = resetOpts || {};
        if (o.newSession) sessionId = makeSessionId();
        state.modo = 'visita';
        state.step = 1;
        state.substep = '';
        state.lastQuestionStep = 1;
        state.lastSubstep = '';
        state.plazo = '';
        state.personas = '';
        state.mascota = '';
        state.garantia = '';
        state.garantiaLabel = '';
        state.andaBridge = false;
        state.ingresos = '';
        state.escala2 = '';
        state.outcome = 'WHATSAPP_CALIFICADO';
        state.reasonKey = '';
        state.motivoDesvio = '';
        state.showPrivacy = false;
        state.submitted = false;
        state.savedLeadId = '';
        state.cruzadaZona = '';
        state.cruzadaComodidades = [];
        state.cruzadaSub = 'plazo';
        state.cruzadaPlazo = '';
        state.cruzadaHogar = '';
        state.cruzadaRespaldo = '';
        state.cruzadaRango = '';
        clearValidation();
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
        var curNombre = state.nombre;
        var readyVisita = state.modo === 'visita' && state.step === 6 && state.outcome === 'WHATSAPP_CALIFICADO' && curNombre;
        var readyCruzada = state.modo === 'captacion_cruzada' && state.step === 5 && state.outcome === 'WHATSAPP_CALIFICADO' && curNombre;
        if (readyVisita) {
          mobBtn.href = buildQualifiedWaUrl();
          mobBtn.target = '_blank';
          mobBtn.rel = 'noopener noreferrer';
          mobLbl.textContent = 'Abrir WhatsApp con Mar →';
        } else if (readyCruzada) {
          mobBtn.href = buildCruzadaWaUrl();
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
          var coms = state.cruzadaComodidades.length ? state.cruzadaComodidades.join(', ') : 'sin requisito especial';
          return [state.cruzadaZona || 'Zona a definir', coms, state.cruzadaPlazo, state.cruzadaHogar, state.cruzadaRespaldo, state.cruzadaRango].filter(Boolean).join(' · ');
        }
        return [state.plazo, state.personas, state.mascota, state.garantiaLabel || state.garantia].filter(Boolean).join(' · ');
      }

      function sendSilentLog(paso, resultado, consentFlag) {
        var utmSrc = params.get('utm_source') || '';
        var utmCont = params.get('utm_content') || '';
        var utmFull = utmSrc ? (utmCont ? (utmSrc + ' · ' + utmCont) : utmSrc) : '(directo)';
        var isOwnerBrowser = false;
        try { isOwnerBrowser = localStorage.getItem('zg_owner_device') === '1'; } catch (e) {}
        var payload = {
          session_id: sessionId,
          slug: opts.slug,
          ref_publica: opts.refPublica,
          modo: state.modo,
          paso_alcanzado: paso,
          resultado: resultado || (paso === 0 ? 'ficha_abierta' : 'en_curso'),
          consentimiento: consentFlag ? 1 : 0,
          nombre: consentFlag ? state.nombre : undefined,
          es_prueba: isOwnerBrowser || params.get('test') === '1' ? 1 : 0,
          utm_source: utmFull.slice(0, 60),
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
        setTimeout(fn, 150);
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
            motivo: 'En La Barra / Manantiales ese tipo de propiedad se mueve en rangos en USD; guardamos tu pedido para cruzar alternativas en Maldonado'
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
          return 'Este apartamento admite hasta 4 personas y 1 mascota pequeña; agendamos tu búsqueda para avisarte por unidades con la capacidad que buscás.';
        }
        if (state.reasonKey === 'anda_cgn') {
          return 'Esta propiedad opera con aseguradora privada; dejamos tu pedido guardado para avisarte apenas ingrese una unidad compatible con ANDA o Contaduría.';
        }
        if (state.reasonKey === 'cruzada_realidad') {
          return state.motivoDesvio;
        }
        return 'Esta propiedad trabaja con póliza aprobada de aseguradora; guardamos tu búsqueda para avisarte cuando ingrese una opción acorde o si sumás co-firmante.';
      }

      function getPrevControlVisita() {
        if (state.step === 1) return null;
        if (state.step === 2) {
          return { goStep: 1, goSub: '', text: state.plazo };
        }
        if (state.step === 3) {
          return { goStep: 2, goSub: '', text: state.personas + ' · ' + state.plazo };
        }
        if (state.step === 4) {
          if (state.substep === 'anda_bridge') {
            return { goStep: 4, goSub: '', text: 'ANDA o Contaduría (CGN)' };
          }
          return { goStep: 3, goSub: '', text: state.mascota + ' · ' + state.personas };
        }
        if (state.step === 5) {
          if (state.substep === 'escala2') {
            return { goStep: 5, goSub: '', text: 'Ingresos debajo de ' + formatIngAlto() };
          }
          return {
            goStep: 4,
            goSub: state.andaBridge ? 'anda_bridge' : '',
            text: state.andaBridge ? 'Validar aseguradora con recibos (ANDA/CGN)' : '1 o 2 ingresos formales'
          };
        }
        if (state.step === 6) {
          return {
            goStep: state.lastQuestionStep || 1,
            goSub: state.lastSubstep || '',
            text: state.motivoDesvio || buildSummaryText() || 'Tu respuesta anterior'
          };
        }
        return null;
      }

      function getPrevControlCruzada() {
        if (state.step === 1) return null;
        if (state.step === 2) {
          return { goStep: 1, goSub: 'plazo', text: state.cruzadaZona };
        }
        if (state.step === 3) {
          if (state.cruzadaSub === 'plazo') {
            var comTxt = state.cruzadaComodidades.length ? state.cruzadaComodidades.join(', ') : 'Sin requisito especial';
            return { goStep: 2, goSub: 'plazo', text: state.cruzadaZona + ' · ' + comTxt };
          }
          if (state.cruzadaSub === 'hogar') {
            return { goStep: 3, goSub: 'plazo', text: 'Mudanza: ' + state.cruzadaPlazo };
          }
          return { goStep: 3, goSub: 'hogar', text: state.cruzadaHogar };
        }
        if (state.step === 4) {
          return { goStep: 3, goSub: 'respaldo', text: state.cruzadaRespaldo };
        }
        if (state.step === 5) {
          return { goStep: 4, goSub: 'respaldo', text: 'Rango: ' + state.cruzadaRango };
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
        html += '<div><label for="zg-tf-nombre">Tu nombre *</label><input type="text" id="zg-tf-nombre" class="' + (state.invalidNombre ? 'is-invalid' : '') + '" placeholder="Ej. Martín" value="' + escHtml(state.nombre) + '"></div>';
        html += '<div><label for="zg-tf-wa">Tu WhatsApp *</label><input type="tel" id="zg-tf-wa" class="' + (state.invalidWa ? 'is-invalid' : '') + '" placeholder="099 123 456" value="' + escHtml(state.whatsapp) + '"></div>';
        html += '<div class="zg-legal-pill">' + escHtml(legalText) + ' <button type="button" class="zg-privacy-btn" id="zg-privacy-toggle">Privacidad</button></div>';
        if (state.showPrivacy) {
          html += '<div class="zg-privacy-drawer">Ley 18.331 (Uruguay): ZAGUÁN Propiedades registra tu búsqueda solo para avisarte cuando ingrese una unidad compatible. Sin cesión a terceros. Baja en todo momento por WhatsApp al +598 98 712 064.</div>';
        }
        if (state.validationMsg) {
          html += '<div class="zg-alert-inline" role="alert">' + escHtml(state.validationMsg) + '</div>';
        }
        html += '<button type="button" class="zg-cta-primary" id="zg-save-search-btn">Aceptar y guardar mi búsqueda →</button>';
        html += '</div>';
        return html;
      }

      function renderVisitaMode() {
        var prev = getPrevControlVisita();
        var isFinal = state.step === 6;
        var html = '';

        html += '<div class="zg-tf-top">';
        html += '<span class="zg-tf-kicker">Coordinar visita · 1 toque por pantalla</span>';
        html += '<span class="zg-tf-step-meta"><span class="zg-tf-step-count">' + (isFinal ? 'Listo · Último paso' : ('Paso ' + state.step + ' de 5')) + '</span>';
        if (state.step > 1 || state.substep) {
          html += ' · <button type="button" class="zg-reset-top-btn" id="zg-reset-top">↺ Empezar de nuevo</button>';
        }
        html += '</span></div>';
        html += renderStoryBars(5, isFinal ? 6 : state.step);
        html += '<div class="zg-tf-stage">';

        if (prev && !state.submitted) {
          html += '<button type="button" class="zg-tf-prev" data-go-step="' + prev.goStep + '" data-go-sub="' + escHtml(prev.goSub) + '">';
          html += '<span>Elegiste: <strong>' + escHtml(prev.text) + '</strong></span>';
          html += '<span class="zg-tf-prev-edit">Cambiar ↺</span>';
          html += '</button>';
        }

        html += '<div class="zg-tf-current">';

        if (state.step === 1) {
          html += '<div class="zg-tf-q">¿Cuándo planificás mudarte?</div>';
          html += '<div class="zg-tf-sub">Tocá tu opción para pasar al siguiente paso.</div>';
          html += '<div class="zg-opt-list">';
          html += '<button type="button" class="zg-opt-btn" data-plazo="Dentro de 30 días"><span>Dentro de 30 días</span><span class="zg-opt-arrow">→</span></button>';
          html += '<button type="button" class="zg-opt-btn" data-plazo="En 30 a 60 días"><span>En 30 a 60 días</span><span class="zg-opt-arrow">→</span></button>';
          html += '<button type="button" class="zg-opt-btn" data-plazo="Más adelante (otro mes)"><span>Más adelante (otro mes)</span><span class="zg-opt-arrow">→</span></button>';
          html += '</div>';
        } else if (state.step === 2) {
          html += '<div class="zg-tf-q">¿Cuántas personas habitarán el apartamento?</div>';
          html += '<div class="zg-tf-sub">Tocá la cantidad de integrantes de tu hogar.</div>';
          html += '<div class="zg-opt-list">';
          html += '<button type="button" class="zg-opt-btn" data-personas="1 persona o pareja"><span>1 persona o pareja</span><span class="zg-opt-arrow">→</span></button>';
          html += '<button type="button" class="zg-opt-btn" data-personas="3 a 4 personas"><span>3 a 4 personas</span><span class="zg-opt-arrow">→</span></button>';
          html += '<button type="button" class="zg-opt-btn" data-personas="5 o más personas"><span>5 o más personas</span><span class="zg-opt-arrow">→</span></button>';
          html += '</div>';
        } else if (state.step === 3) {
          html += '<div class="zg-tf-q">¿Conviven con mascotas?</div>';
          if (mascotaPolicy === 'edificio_acepta') {
            html += '<div class="zg-tf-sub">El edificio acepta mascotas; confirmamos el detalle al coordinar tu visita.</div>';
            html += '<div class="zg-opt-list">';
            html += '<button type="button" class="zg-opt-btn" data-mascota="Sin mascotas"><span>Sin mascotas</span><span class="zg-opt-arrow">→</span></button>';
            html += '<button type="button" class="zg-opt-btn" data-mascota="1 mascota (edificio pet-friendly)"><span>1 mascota (edificio pet-friendly)</span><span class="zg-opt-arrow">→</span></button>';
            html += '<button type="button" class="zg-opt-btn" data-mascota="2 o más mascotas (consultar reglamento)"><span>2 o más mascotas (consultar reglamento)</span><span class="zg-opt-arrow">→</span></button>';
            html += '</div>';
          } else {
            html += '<div class="zg-tf-sub">Tocá una opción para pasar al respaldo de garantía.</div>';
            html += '<div class="zg-opt-list">';
            html += '<button type="button" class="zg-opt-btn" data-mascota="Sin mascotas"><span>Sin mascotas</span><span class="zg-opt-arrow">→</span></button>';
            html += '<button type="button" class="zg-opt-btn" data-mascota="1 mascota chica"><span>1 mascota chica</span><span class="zg-opt-arrow">→</span></button>';
            html += '<button type="button" class="zg-opt-btn" data-mascota="2 mascotas o perro grande"><span>2 mascotas o perro grande</span><span class="zg-opt-arrow">→</span></button>';
            html += '</div>';
          }
        } else if (state.step === 4) {
          if (state.substep === 'anda_bridge') {
            html += '<div class="zg-tf-q">Con recibo limpio de ANDA o Contaduría solés aprobar Porto o Sura en 24 hs</div>';
            html += '<div class="zg-tf-sub">¿Qué camino preferís tomar con tu recibo?</div>';
            html += '<div class="zg-opt-list">';
            html += '<button type="button" class="zg-opt-btn" data-anda-bridge="si"><span>Evaluar aseguradora privada con mis recibos</span><span class="zg-opt-arrow">→</span></button>';
            html += '<button type="button" class="zg-opt-btn" data-anda-bridge="no"><span>Buscar solo unidades que acepten ANDA o CGN</span><span class="zg-opt-arrow">→</span></button>';
            html += '</div>';
          } else {
            html += '<div class="zg-tf-q">¿Con qué respaldo planificás alquilar?</div>';
            html += '<div class="zg-tf-sub">Esta propiedad opera con aseguradora privada (visitás primero el apartamento y tramitamos la póliza si te gusta).</div>';
            html += '<div class="zg-opt-list">';
            html += '<button type="button" class="zg-opt-btn" data-gar="ingresos"><span>1 o 2 ingresos formales<span class="zg-opt-sub">Recibo en BPS, jubilación o unipersonal +1 año con contador</span></span><span class="zg-opt-arrow">→</span></button>';
            html += '<button type="button" class="zg-opt-btn" data-gar="poliza"><span>Ya cuento con póliza pre-aprobada<span class="zg-opt-sub">Porto Seguro, Sura, Mapfre, Santander o BSE</span></span><span class="zg-opt-arrow">→</span></button>';
            html += '<button type="button" class="zg-opt-btn" data-gar="anda_cgn"><span>Tengo ANDA o Contaduría (CGN)<span class="zg-opt-sub">Con recibo limpio — validamos aseguradora o unidades acordes</span></span><span class="zg-opt-arrow">→</span></button>';
            html += '<button type="button" class="zg-opt-btn" data-gar="otra"><span>Cobro sin recibo formal o estoy en Clearing</span><span class="zg-opt-arrow">→</span></button>';
            html += '</div>';
          }
        } else if (state.step === 5) {
          if (state.substep === 'escala2') {
            html += '<div class="zg-tf-q">¿Contás con 1 familiar o co-firmante con recibo limpio que firme el contrato?</div>';
            html += '<div class="zg-tf-sub">Para alcanzar el tope de la aseguradora podés sumar 1 familiar o co-firmante con recibo limpio (toda persona que aporta recibo firma el contrato).</div>';
            html += '<div class="zg-opt-list">';
            html += '<button type="button" class="zg-opt-btn" data-escala2="si"><span>Sí, sumamos 1 co-firmante en el contrato</span><span class="zg-opt-arrow">→</span></button>';
            html += '<button type="button" class="zg-opt-btn" data-escala2="no"><span>Por ahora contamos solo con este ingreso</span><span class="zg-opt-arrow">→</span></button>';
            html += '</div>';
          } else {
            html += '<div class="zg-tf-q">¿En qué rango están los ingresos líquidos mensuales?</div>';
            html += '<div class="zg-tf-sub">Sumando 1 o 2 ingresos formales de quienes firman el contrato (~30% del alquiler con historial limpio).</div>';
            html += '<div class="zg-opt-list">';
            html += '<button type="button" class="zg-opt-btn" data-ing="ok"><span>' + escHtml(formatIngAlto()) + ' o más líquidos por mes</span><span class="zg-opt-arrow">→</span></button>';
            html += '<button type="button" class="zg-opt-btn" data-ing="cerca"><span>Entre $U ' + ingMedio.toLocaleString('de-DE') + ' y $U ' + (ingAlto - 1000).toLocaleString('de-DE') + ' por mes<span class="zg-opt-sub">Opción de sumar co-firmante</span></span><span class="zg-opt-arrow">→</span></button>';
            html += '<button type="button" class="zg-opt-btn" data-ing="bajo"><span>Menos de $U ' + ingMedio.toLocaleString('de-DE') + ' individuales<span class="zg-opt-sub">Consultamos si sumás co-firmante</span></span><span class="zg-opt-arrow">→</span></button>';
            html += '</div>';
          }
        } else if (state.step === 6) {
          if (state.outcome === 'WHATSAPP_CALIFICADO') {
            var greet = state.nombre ? ('Listo, ' + escHtml(state.nombre) + ': ') : '';
            html += '<div class="zg-tf-q">' + greet + 'cumplís los requisitos para visitar ' + escHtml(opts.tituloCorto) + '</div>';
            html += '<div class="zg-tf-sub">Escribí tu nombre de pila para armar tu consulta y coordinar horario con Mar.</div>';
            html += '<div class="zg-input-stack">';
            html += '<div><label for="zg-tf-nombre">Tu nombre *</label><input type="text" id="zg-tf-nombre" class="' + (state.invalidNombre ? 'is-invalid' : '') + '" placeholder="Ej. Lucía" value="' + escHtml(state.nombre) + '"></div>';
            html += '<div class="zg-wa-preaviso"><span class="zg-wa-dot"></span><span>Se abrirá tu WhatsApp con la consulta armada para que la revises antes de enviar.</span></div>';
            if (state.validationMsg) {
              html += '<div class="zg-alert-inline" role="alert">' + escHtml(state.validationMsg) + '</div>';
            }
            html += '<button type="button" class="zg-cta-primary" id="zg-wa-go-btn">Aceptar y abrir WhatsApp con Mar →</button>';
            html += '<div class="zg-legal-note">Al tocar el botón aceptás que ZAGUÁN use tus respuestas solo para atender esta consulta de alquiler (Ley 18.331). <button type="button" class="zg-privacy-btn" id="zg-privacy-toggle">Privacidad</button></div>';
            if (state.showPrivacy) {
              html += '<div class="zg-privacy-drawer">Ley 18.331 (Uruguay): ZAGUÁN Propiedades usa estas respuestas solo para coordinar visitas y validar búsquedas de alquiler, sin cesión a terceros. Baja por WhatsApp al +598 98 712 064.</div>';
            }
            html += '</div>';
          } else if (state.submitted) {
            html += renderSavedCardHtml();
          } else {
            html += '<div class="zg-tf-q">' + escHtml(state.motivoDesvio || 'Guardá tu búsqueda para avisarte') + '</div>';
            html += '<div class="zg-tf-sub">' + escHtml(getSavedReasonExplanation()) + '</div>';
            html += renderSearchSaveForm('Al guardar autorizás a ZAGUÁN Propiedades a registrar tu nombre y celular solo para avisarte cuando ingrese un alquiler acorde, sin cesión a terceros (Ley 18.331).');
          }
        }

        html += '</div>'; // .zg-tf-current

        if (state.step === 1) html += '<div class="zg-tf-next">Siguiente: Cantidad de personas</div>';
        else if (state.step === 2) html += '<div class="zg-tf-next">Siguiente: Mascotas</div>';
        else if (state.step === 3) html += '<div class="zg-tf-next">Siguiente: Respaldo de garantía</div>';
        else if (state.step === 4 && !state.substep) html += '<div class="zg-tf-next">Siguiente: Ingresos o cierre</div>';
        else if (state.step === 5 && !state.substep) html += '<div class="zg-tf-next">Siguiente: Tu nombre y coordinación</div>';

        html += '</div>'; // .zg-tf-stage

        if (!state.submitted) {
          html += '<button type="button" class="zg-cruzada-trigger" id="zg-open-cruzada">Buscás amoblado, patio u otra zona (La Barra / Punta del Este)? Contanos acá →</button>';
        }
        return html;
      }

      function renderCruzadaMode() {
        var prev = getPrevControlCruzada();
        var isFinal = state.step === 5;
        var html = '';
        html += '<div class="zg-tf-top">';
        html += '<button type="button" class="zg-back-link" id="zg-back-visita">← Volver a esta unidad</button>';
        html += '<span class="zg-tf-step-meta"><span class="zg-tf-step-count">' + (isFinal ? 'Listo · Último paso' : ('Búsqueda ' + state.step + ' de 4')) + '</span>';
        if (state.step > 1) {
          html += ' · <button type="button" class="zg-reset-top-btn" id="zg-reset-top">↺ Empezar de nuevo</button>';
        }
        html += '</span></div>';
        html += renderStoryBars(4, isFinal ? 5 : state.step);
        html += '<div class="zg-tf-stage">';

        if (prev && !state.submitted) {
          html += '<button type="button" class="zg-tf-prev" data-go-cruzada="' + prev.goStep + '" data-go-csub="' + escHtml(prev.goSub) + '">';
          html += '<span>Elegiste: <strong>' + escHtml(prev.text) + '</strong></span>';
          html += '<span class="zg-tf-prev-edit">Cambiar ↺</span></button>';
        }

        html += '<div class="zg-tf-current">';
        if (state.step === 1) {
          html += '<div class="zg-tf-q">¿En qué zona buscás alquiler anual?</div>';
          html += '<div class="zg-tf-sub">Tocá tu zona preferida para elegir comodidades.</div>';
          html += '<div class="zg-opt-list">';
          ['La Barra / Manantiales', 'Punta del Este', 'Maldonado (otros barrios)', 'Solanas / Punta Ballena'].forEach(function (zn) {
            html += '<button type="button" class="zg-opt-btn" data-czona="' + escHtml(zn) + '"><span>' + escHtml(zn) + '</span><span class="zg-opt-arrow">→</span></button>';
          });
          html += '</div>';
        } else if (state.step === 2) {
          html += '<div class="zg-tf-q">¿Qué comodidades priorizás? (opcional)</div>';
          html += '<div class="zg-tf-sub">Podés elegir una o varias opciones, o continuar directo.</div>';
          html += '<div class="zg-chip-row">';
          ['Amoblado', 'Sin muebles', 'Patio o planta baja', '3+ dormitorios', 'Con mascotas', 'Cochera'].forEach(function (cm) {
            var active = state.cruzadaComodidades.indexOf(cm) !== -1;
            html += '<button type="button" class="zg-chip' + (active ? ' is-selected' : '') + '" data-ccom="' + escHtml(cm) + '">' + escHtml(cm) + '</button>';
          });
          html += '</div>';
          var nextComTxt = state.cruzadaComodidades.length ? 'Continuar con lo elegido →' : 'Sin requisito especial · Continuar →';
          html += '<button type="button" class="zg-cta-primary" id="zg-cruzada-com-next">' + nextComTxt + '</button>';
        } else if (state.step === 3) {
          if (state.cruzadaSub === 'hogar') {
            html += '<div class="zg-tf-q">¿Quiénes habitarán la propiedad?</div>';
            html += '<div class="zg-tf-sub">Tocá una opción para pasar al respaldo.</div>';
            html += '<div class="zg-opt-list">';
            ['1 persona o pareja', 'Familia (3 a 4 personas)', '5 o más personas'].forEach(function (hg) {
              html += '<button type="button" class="zg-opt-btn" data-chogar="' + escHtml(hg) + '"><span>' + escHtml(hg) + '</span><span class="zg-opt-arrow">→</span></button>';
            });
            html += '</div>';
          } else if (state.cruzadaSub === 'respaldo') {
            html += '<div class="zg-tf-q">¿Con qué respaldo tenés pensado alquilar?</div>';
            html += '<div class="zg-tf-sub">Tocá el respaldo principal para presentarte opciones reales de mercado.</div>';
            html += '<div class="zg-opt-list">';
            ['Aseguradora / Recibos limpios', 'ANDA o Contaduría (CGN)', 'Mudanza desde el exterior / Empresa', 'Sin garantía tradicional aún'].forEach(function (rs) {
              html += '<button type="button" class="zg-opt-btn" data-crespaldo="' + escHtml(rs) + '"><span>' + escHtml(rs) + '</span><span class="zg-opt-arrow">→</span></button>';
            });
            html += '</div>';
          } else {
            html += '<div class="zg-tf-q">¿Cuándo planificás mudarte?</div>';
            html += '<div class="zg-tf-sub">Tocá tu fecha estimada de mudanza.</div>';
            html += '<div class="zg-opt-list">';
            ['Dentro de 30 días', 'Próximos 60 días', 'Más adelante'].forEach(function (pl) {
              html += '<button type="button" class="zg-opt-btn" data-cplazo="' + escHtml(pl) + '"><span>' + escHtml(pl) + '</span><span class="zg-opt-arrow">→</span></button>';
            });
            html += '</div>';
          }
        } else if (state.step === 4) {
          html += '<div class="zg-tf-q">¿Hasta qué valor mensual tenés previsto?</div>';
          html += '<div class="zg-tf-sub">Lo usamos para seleccionar zona y comodidades acordes a tu búsqueda.</div>';
          html += '<div class="zg-opt-list">';
          ['Hasta $U 35.000/mes', '$U 35.000 a $U 55.000/mes', 'USD 1.200 a USD 1.600/mes', 'Más de USD 1.600/mes'].forEach(function (rg) {
            html += '<button type="button" class="zg-opt-btn" data-cruzada-rango="' + escHtml(rg) + '"><span>' + escHtml(rg) + '</span><span class="zg-opt-arrow">→</span></button>';
          });
          html += '</div>';
        } else if (state.step === 5) {
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
              html += renderSearchSaveForm('Al guardar autorizás a ZAGUÁN Propiedades a registrar tu nombre y celular solo para avisarte cuando ingrese una opción acorde, sin cesión a terceros (Ley 18.331).');
            }
          } else {
            html += '<div class="zg-tf-q">' + (state.nombre ? ('Listo, ' + escHtml(state.nombre) + ': ') : '') + 'buscamos en ' + escHtml(state.cruzadaZona) + '</div>';
            html += '<div class="zg-tf-sub">Rango cómodo: <strong>' + escHtml(state.cruzadaRango) + '</strong> · ' + escHtml(state.cruzadaRespaldo) + '. Dejá tu nombre para abrir WhatsApp prioritario con Mar.</div>';
            html += '<div class="zg-input-stack">';
            html += '<div><label for="zg-tf-nombre">Tu nombre *</label><input type="text" id="zg-tf-nombre" class="' + (state.invalidNombre ? 'is-invalid' : '') + '" placeholder="Ej. Valeria" value="' + escHtml(state.nombre) + '"></div>';
            html += '<div class="zg-wa-preaviso"><span class="zg-wa-dot"></span><span>Se abrirá tu WhatsApp con tu pedido armado para que lo revises antes de enviar.</span></div>';
            if (state.validationMsg) {
              html += '<div class="zg-alert-inline" role="alert">' + escHtml(state.validationMsg) + '</div>';
            }
            html += '<button type="button" class="zg-cta-primary" id="zg-cruzada-wa-btn">Aceptar y abrir WhatsApp prioritario →</button>';
            html += '<div class="zg-legal-note">Al tocar el botón aceptás que ZAGUÁN use tus respuestas solo para atender esta búsqueda de alquiler (Ley 18.331). <button type="button" class="zg-privacy-btn" id="zg-privacy-toggle">Privacidad</button></div>';
            if (state.showPrivacy) {
              html += '<div class="zg-privacy-drawer">Ley 18.331 (Uruguay): ZAGUÁN Propiedades guarda tu búsqueda solo para presentarte propiedades compatibles, sin cesión a terceros. Baja por WhatsApp al +598 98 712 064.</div>';
            }
            html += '</div>';
          }
        }
        html += '</div>';

        if (state.step === 1) html += '<div class="zg-tf-next">Siguiente: Comodidades opcionales</div>';
        else if (state.step === 2) html += '<div class="zg-tf-next">Siguiente: Plazo, hogar y respaldo</div>';
        else if (state.step === 3) html += '<div class="zg-tf-next">Siguiente: Rango mensual cómodo</div>';

        html += '</div>';
        return html;
      }

      function focusFirstInvalid() {
        if (!state.validationMsg) return;
        var target = document.querySelector('#zg-pack-flow-root .is-invalid') || document.querySelector('#zg-pack-flow-root .zg-alert-inline');
        if (target && typeof target.focus === 'function') {
          target.focus();
          if (typeof target.scrollIntoView === 'function') {
            try { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
          }
        }
      }

      function render() {
        root.innerHTML = '<div class="zg-tf-shell">' + (state.modo === 'captacion_cruzada' ? renderCruzadaMode() : renderVisitaMode()) + '</div>';
        syncHiddenLegacy();
        syncMobileBottomBar();
        bindEvents();
        focusFirstInvalid();
      }

      function goToFinal(outcome, reasonKey, motivoDesvio, fromStep, fromSubstep) {
        state.outcome = outcome;
        state.reasonKey = reasonKey || '';
        state.motivoDesvio = motivoDesvio || '';
        state.lastQuestionStep = fromStep;
        state.lastSubstep = fromSubstep || '';
        state.substep = '';
        state.step = 6;
        clearValidation();
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
            state.substep = el.getAttribute('data-go-sub') || '';
            state.submitted = false;
            clearValidation();
            render();
          });
        });

        root.querySelectorAll('[data-plazo]').forEach(function (el) {
          el.addEventListener('click', function () {
            var val = el.getAttribute('data-plazo');
            state.plazo = val;
            animateAndGo(el, function () {
              if (val !== 'Dentro de 30 días') {
                goToFinal('BUSQUEDA_REGISTRADA', 'plazo', 'Esta unidad está pronta para ingresar ahora', 1, '');
                sendSilentLog(1, 'BUSQUEDA_REGISTRADA_PLAZO', false);
              } else {
                state.step = 2;
                state.substep = '';
                clearValidation();
                sendSilentLog(1, 'en_curso', false);
              }
              render();
            });
          });
        });

        root.querySelectorAll('[data-personas]').forEach(function (el) {
          el.addEventListener('click', function () {
            var val = el.getAttribute('data-personas');
            state.personas = val;
            animateAndGo(el, function () {
              if (val === '5 o más personas') {
                goToFinal('BUSQUEDA_REGISTRADA', 'espacio_mascota', 'Este apartamento admite hasta 4 personas', 2, '');
                sendSilentLog(2, 'BUSQUEDA_REGISTRADA_CUPO', false);
              } else {
                state.step = 3;
                state.substep = '';
                clearValidation();
                sendSilentLog(2, 'en_curso', false);
              }
              render();
            });
          });
        });

        root.querySelectorAll('[data-mascota]').forEach(function (el) {
          el.addEventListener('click', function () {
            var val = el.getAttribute('data-mascota');
            state.mascota = val;
            animateAndGo(el, function () {
              if (mascotaPolicy !== 'edificio_acepta' && val === '2 mascotas o perro grande') {
                goToFinal('BUSQUEDA_REGISTRADA', 'espacio_mascota', 'Esta unidad en piso 1 con terraza al frente admite hasta 1 mascota pequeña', 3, '');
                sendSilentLog(3, 'BUSQUEDA_REGISTRADA_MASCOTA', false);
              } else {
                state.step = 4;
                state.substep = '';
                clearValidation();
                sendSilentLog(3, 'en_curso', false);
              }
              render();
            });
          });
        });

        root.querySelectorAll('[data-gar]').forEach(function (el) {
          el.addEventListener('click', function () {
            var g = el.getAttribute('data-gar');
            state.garantia = g;
            state.andaBridge = false;
            animateAndGo(el, function () {
              clearValidation();
              if (g === 'anda_cgn') {
                state.substep = 'anda_bridge';
                sendSilentLog(4, 'anda_cgn_puente_abierto', false);
              } else if (g === 'ingresos') {
                state.garantiaLabel = '1 o 2 ingresos formales';
                state.substep = '';
                state.step = 5;
                sendSilentLog(4, 'en_curso', false);
              } else if (g === 'poliza') {
                state.garantiaLabel = 'Póliza pre-aprobada';
                state.ingresos = 'ok';
                goToFinal('WHATSAPP_CALIFICADO', '', '', 4, '');
                sendSilentLog(6, 'WHATSAPP_CALIFICADO_LISTA_POLIZA', false);
              } else {
                state.garantiaLabel = 'Sin recibo formal o con Clearing';
                state.ingresos = 'bajo';
                goToFinal('BUSQUEDA_REGISTRADA', 'garantia', 'Esta propiedad opera con póliza de aseguradora privada', 4, '');
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
              clearValidation();
              if (ans === 'si') {
                state.andaBridge = true;
                state.garantia = 'ingresos';
                state.garantiaLabel = 'Recibos limpios (consulta ANDA/CGN)';
                state.substep = '';
                state.step = 5;
                sendSilentLog(4, 'anda_puente_aseguradora', false);
              } else {
                state.garantia = 'anda_cgn';
                state.garantiaLabel = 'ANDA o Contaduría (CGN)';
                goToFinal('BUSQUEDA_REGISTRADA', 'anda_cgn', 'Buscamos opciones compatibles con ANDA o Contaduría (CGN)', 4, 'anda_bridge');
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
            animateAndGo(el, function () {
              clearValidation();
              if (ing === 'cerca' || ing === 'bajo') {
                state.substep = 'escala2';
                sendSilentLog(5, 'escala_2_abierta_' + ing, false);
              } else {
                goToFinal('WHATSAPP_CALIFICADO', '', '', 5, '');
                sendSilentLog(5, 'califico_ingresos', false);
              }
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
                goToFinal('WHATSAPP_CALIFICADO', '', '', 5, 'escala2');
                sendSilentLog(5, 'califico_escala_2', false);
              } else {
                goToFinal('BUSQUEDA_REGISTRADA', 'garantia', 'La aseguradora requiere ' + formatIngAlto() + ' líquidos o sumar co-firmante', 5, 'escala2');
                sendSilentLog(5, 'BUSQUEDA_REGISTRADA_ESCALA2_NO', false);
              }
              render();
            });
          });
        });

        var nombreIn = document.getElementById('zg-tf-nombre');
        if (nombreIn) {
          nombreIn.addEventListener('input', function () {
            state.nombre = nombreIn.value.trim();
            if (state.nombre) {
              state.invalidNombre = false;
              nombreIn.classList.remove('is-invalid');
            }
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
            if (state.whatsapp.replace(/\D/g, '').length >= 8) {
              state.invalidWa = false;
              waIn.classList.remove('is-invalid');
            }
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
            var curNombre = ((document.getElementById('zg-tf-nombre') || {}).value || state.nombre || '').trim();
            state.nombre = curNombre;
            if (!curNombre) {
              state.validationMsg = 'Completá tu nombre, por favor.';
              state.invalidNombre = true;
              render();
              return;
            }
            clearValidation();
            waGoBtn.textContent = 'Abriendo tu WhatsApp con la consulta lista…';
            waGoBtn.disabled = true;
            flujoCerrado = true;
            leftToWhatsApp = true;
            sendSilentLog(6, 'WHATSAPP_CALIFICADO', true);
            var leadPayload = {
              event: 'generate_lead',
              property_id: opts.refPublica,
              property_name: opts.tituloCorto,
              garantia_tipo: state.garantia || 'poliza',
              escala_2: state.escala2 || 'no_aplica',
              consent_version: CONSENT_VERSION,
              lead_calificado: true,
              cta_location: 'typeform_5_rayitas_v3',
              value: opts.valorMensual || 30000,
              currency: 'UYU'
            };
            if (typeof opts.onLead === 'function') opts.onLead(leadPayload);
            else pushDataLayer(leadPayload);
            syncMobileBottomBar();
            window.open(buildQualifiedWaUrl(), '_blank', 'noopener,noreferrer');
          });
        }

        var saveBtn = document.getElementById('zg-save-search-btn');
        if (saveBtn) {
          saveBtn.addEventListener('click', function () {
            var curNombre = ((document.getElementById('zg-tf-nombre') || {}).value || state.nombre || '').trim();
            var curWa = ((document.getElementById('zg-tf-wa') || {}).value || state.whatsapp || '').trim();
            state.nombre = curNombre;
            state.whatsapp = curWa;
            var digits = String(curWa).replace(/\D/g, '');
            if (!curNombre || digits.length < 8) {
              state.invalidNombre = !curNombre;
              state.invalidWa = digits.length < 8;
              state.validationMsg = !curNombre && digits.length < 8
                ? 'Completá tu nombre y tu WhatsApp, por favor.'
                : (!curNombre ? 'Completá tu nombre, por favor.' : 'Completá tu WhatsApp (mínimo 8 números), por favor.');
              render();
              return;
            }
            clearValidation();
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

            sendSilentLog(esCruzada ? (state.lastQuestionStep || 4) : (state.lastQuestionStep || 4), 'BUSQUEDA_REGISTRADA', true);
            fetch(CRM_BASE + '/api/interesados', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            }).then(function (r) { return r.json(); }).then(function (out) {
              if (out && out.id) state.savedLeadId = out.id;
              state.submitted = true;
              clearValidation();
              flujoCerrado = true;
              render();
            }).catch(function () {
              state.validationMsg = 'Probá guardar de nuevo en un instante, por favor.';
              render();
            });
          });
        }

        var editSavedBtn = document.getElementById('zg-edit-saved-btn');
        if (editSavedBtn) {
          editSavedBtn.addEventListener('click', function () {
            state.submitted = false;
            state.step = 1;
            state.substep = '';
            state.cruzadaSub = 'plazo';
            clearValidation();
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
            sendSilentLog(state.lastQuestionStep || 4, 'REQUISITO_EXTRA_WHATSAPP', true);
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
            state.substep = '';
            state.cruzadaSub = 'plazo';
            state.submitted = false;
            state.cruzadaRango = '';
            clearValidation();
            flujoCerrado = false;
            sendSilentLog(1, 'cruzada_iniciada', false);
            render();
          });
        }

        var backVisBtn = document.getElementById('zg-back-visita');
        if (backVisBtn) {
          backVisBtn.addEventListener('click', function () {
            resetToStep1({ newSession: false, keepContact: true });
          });
        }

        root.querySelectorAll('[data-go-cruzada]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.step = Number(el.getAttribute('data-go-cruzada')) || 1;
            state.cruzadaSub = el.getAttribute('data-go-csub') || 'plazo';
            if (state.step < 5) state.cruzadaRango = '';
            state.submitted = false;
            clearValidation();
            render();
          });
        });

        root.querySelectorAll('[data-czona]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.cruzadaZona = el.getAttribute('data-czona');
            animateAndGo(el, function () {
              state.step = 2;
              clearValidation();
              sendSilentLog(1, 'cruzada_paso1', false);
              render();
            });
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

        var comNextBtn = document.getElementById('zg-cruzada-com-next');
        if (comNextBtn) {
          comNextBtn.addEventListener('click', function () {
            animateAndGo(comNextBtn, function () {
              state.step = 3;
              state.cruzadaSub = 'plazo';
              clearValidation();
              sendSilentLog(2, 'cruzada_paso2', false);
              render();
            });
          });
        }

        root.querySelectorAll('[data-cplazo]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.cruzadaPlazo = el.getAttribute('data-cplazo');
            animateAndGo(el, function () {
              state.cruzadaSub = 'hogar';
              clearValidation();
              render();
            });
          });
        });

        root.querySelectorAll('[data-chogar]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.cruzadaHogar = el.getAttribute('data-chogar');
            animateAndGo(el, function () {
              state.cruzadaSub = 'respaldo';
              clearValidation();
              render();
            });
          });
        });

        root.querySelectorAll('[data-crespaldo]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.cruzadaRespaldo = el.getAttribute('data-crespaldo');
            animateAndGo(el, function () {
              state.step = 4;
              state.cruzadaSub = 'respaldo';
              clearValidation();
              sendSilentLog(3, 'cruzada_paso3', false);
              render();
            });
          });
        });

        root.querySelectorAll('[data-cruzada-rango]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.cruzadaRango = el.getAttribute('data-cruzada-rango');
            animateAndGo(el, function () {
              state.step = 5;
              clearValidation();
              sendSilentLog(4, 'cruzada_paso4', false);
              render();
            });
          });
        });

        var cruzWaBtn = document.getElementById('zg-cruzada-wa-btn');
        if (cruzWaBtn) {
          cruzWaBtn.addEventListener('click', function () {
            var curNombre = ((document.getElementById('zg-tf-nombre') || {}).value || state.nombre || '').trim();
            state.nombre = curNombre;
            if (!curNombre) {
              state.validationMsg = 'Completá tu nombre, por favor.';
              state.invalidNombre = true;
              render();
              return;
            }
            clearValidation();
            cruzWaBtn.textContent = 'Abriendo tu WhatsApp con la consulta lista…';
            cruzWaBtn.disabled = true;
            flujoCerrado = true;
            leftToWhatsApp = true;
            sendSilentLog(5, 'CAPTACION_CRUZADA', true);
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
            syncMobileBottomBar();
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
          var inFinal = (state.modo === 'visita' && state.step === 6) || (state.modo === 'captacion_cruzada' && state.step === 5);
          if (ev.persisted || flujoCerrado || leftToWhatsApp || inFinal || state.submitted) {
            leftToWhatsApp = false;
            flujoCerrado = false;
            hiddenAt = 0;
            resetToStep1({ newSession: true, keepContact: false });
          }
        });
      }

      render();
      sendSilentLog(0, 'ficha_abierta', false);
    }
  };
})();
