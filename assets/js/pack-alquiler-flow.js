/* ZAGUÁN Propiedades — Flujo móvil 4 rayitas Story (Typeform) + Captación cruzada + Log D1 */
(function () {
  var CRM_BASE = 'https://zaguan-crm-bot.943ari.workers.dev';
  var WA_PHONE = '59898712064';

  function getSessionId() {
    var k = 'zg_pack_session_id';
    try {
      var v = sessionStorage.getItem(k);
      if (v) return v;
      v = 'S-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
      sessionStorage.setItem(k, v);
      return v;
    } catch (e) {
      return 'S-' + Date.now().toString(36).toUpperCase();
    }
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
      var sessionId = getSessionId();
      var state = {
        modo: 'visita', // 'visita' | 'captacion_cruzada'
        step: 1,        // 1..4 (visita) | 1..3 (captacion_cruzada)
        plazo: 'Dentro de 30 días',
        mascota: 'Sin mascotas',
        personas: '',
        garantia: '',
        ingresos: '',
        escala2: '',
        outcome: 'WHATSAPP_CALIFICADO', // 'WHATSAPP_CALIFICADO' | 'BUSQUEDA_REGISTRADA'
        motivoDesvio: '',
        nombre: '',
        whatsapp: '',
        consent: false,
        showEscala2: false,
        showPrivacy: false,
        submitted: false,
        validationMsg: '',
        cruzadaPrioridad: '',
        cruzadaHogar: '',
        cruzadaPlazo: 'Dentro de 30 días',
        cruzadaRango: ''
      };

      function syncHiddenLegacy() {
        var gEl = document.getElementById(opts.garantiaFieldId || 'lf-garantia');
        var iEl = document.getElementById(opts.ingresosFieldId || 'lf-ingresos');
        if (gEl) {
          if (state.garantia === 'poliza') gEl.value = 'poliza';
          else if (state.garantia === 'ingresos') gEl.value = 'dependiente';
          else if (state.garantia === 'otra') gEl.value = 'otra';
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
        if (state.modo === 'visita' && state.step === 4 && state.outcome === 'WHATSAPP_CALIFICADO' && state.nombre && state.consent) {
          var waHref = buildQualifiedWaUrl();
          mobBtn.href = waHref;
          mobBtn.target = '_blank';
          mobBtn.rel = 'noopener noreferrer';
          mobLbl.textContent = 'Coordinar visita';
        } else {
          mobBtn.href = '#reservar-visita';
          mobBtn.target = '_self';
          mobBtn.removeAttribute('rel');
          mobLbl.textContent = 'Coordinar visita →';
        }
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
          respuestas: {
            plazo: state.plazo,
            mascota: state.mascota,
            personas: state.personas,
            garantia: state.garantia,
            ingresos: state.ingresos,
            escala_2: state.escala2 || undefined,
            motivo_desvio: state.motivoDesvio || undefined,
            cruzada_prioridad: state.cruzadaPrioridad || undefined,
            cruzada_hogar: state.cruzadaHogar || undefined,
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
          ? 'contamos con póliza pre-aprobada'
          : (state.escala2 === 'si'
            ? 'sumamos ingresos formales con 1 co-firmante que firma el contrato para tramitar aseguradora'
            : 'contamos con 1 o 2 ingresos formales (+$U 95.000 líquidos, sin Clearing) para tramitar aseguradora');
        var msg = 'Hola Mar' + saludoNombre + '. Vi ' + opts.tituloCorto + ' (' + opts.precioTexto + '). Somos ' +
          (state.personas || '1 persona o pareja') + ', ' + state.mascota.toLowerCase() + ', para mudarnos ' +
          state.plazo.toLowerCase() + ', y ' + garTxt + '. Me gustaría coordinar visita.';
        return 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(msg);
      }

      function buildCruzadaWaUrl() {
        var saludoNombre = state.nombre ? ', soy ' + state.nombre : '';
        var msg = 'Hola Mar' + saludoNombre + '. Vi ' + opts.tituloCorto + ' en la web y estoy buscando: ' +
          (state.cruzadaPrioridad || 'otra zona / comodidad') + ' (' + (state.cruzadaHogar || 'hogar') + ', para ' +
          state.cruzadaPlazo.toLowerCase() + ', rango cómodo ' + (state.cruzadaRango || 'a definir') + '). Qué opciones tenés para evaluar?';
        return 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(msg);
      }

      function animateAndGo(btnEl, fn) {
        if (btnEl && btnEl.classList) btnEl.classList.add('is-tapped');
        setTimeout(fn, 150);
      }

      function getPrevSummaryVisita() {
        if (state.step === 2) {
          return {
            stepTo: 1,
            text: state.personas + ' · ' + state.mascota + ' · ' + state.plazo
          };
        }
        if (state.step === 3) {
          return {
            stepTo: 2,
            text: state.garantia === 'ingresos' ? '1 o 2 ingresos formales sin Clearing' : 'Respaldo seleccionado'
          };
        }
        if (state.step === 4) {
          if (state.motivoDesvio) {
            return { stepTo: state.garantia ? 2 : 1, text: 'Condición elegida: ' + state.motivoDesvio };
          }
          if (state.garantia === 'poliza') {
            return { stepTo: 2, text: 'Póliza pre-aprobada · ' + state.personas };
          }
          if (state.escala2 === 'si') {
            return { stepTo: 3, text: '$U 65k–$U 94k + 1 co-firmante que firma contrato' };
          }
          return { stepTo: 3, text: '$U 95.000+ con 1 o 2 ingresos formales' };
        }
        return null;
      }

      function getNextHintVisita() {
        if (state.step === 1) return 'Siguiente: Modalidad de garantía aseguradora';
        if (state.step === 2) return 'Siguiente: Rango de ingresos formales';
        if (state.step === 3) return 'Siguiente: Tu nombre y enlace directo a visita';
        return '';
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

      function renderVisitaMode() {
        var prev = getPrevSummaryVisita();
        var nextHint = getNextHintVisita();
        var html = '';

        html += '<div class="zg-tf-top">';
        html += '<span class="zg-tf-kicker">Coordinar visita · 4 toques</span>';
        html += '<span class="zg-tf-step-count">Paso ' + state.step + ' de 4</span>';
        html += '</div>';
        html += renderStoryBars(4, state.step);
        html += '<div class="zg-tf-stage">';

        if (prev) {
          html += '<button type="button" class="zg-tf-prev" data-go-step="' + prev.stepTo + '">';
          html += '<span>Respondiste: <strong>' + escHtml(prev.text) + '</strong></span>';
          html += '<span class="zg-tf-prev-edit">Cambiar ↺</span>';
          html += '</button>';
        }

        html += '<div class="zg-tf-current">';

        if (state.step === 1) {
          html += '<div class="zg-tf-q">Quiénes vivirían acá y cuándo buscás mudarte?</div>';
          html += '<div class="zg-tf-sublabel">Fecha estimada de mudanza</div>';
          html += '<div class="zg-chip-row">';
          ['Dentro de 30 días', 'Más adelante (otro mes)'].forEach(function (pl) {
            html += '<button type="button" class="zg-chip' + (state.plazo === pl ? ' is-selected' : '') + '" data-plazo="' + escHtml(pl) + '">' + escHtml(pl) + '</button>';
          });
          html += '</div>';

          html += '<div class="zg-tf-sublabel">Mascotas</div>';
          html += '<div class="zg-chip-row">';
          ['Sin mascotas', '1 mascota chica', '2 mascotas o perro grande'].forEach(function (mc) {
            html += '<button type="button" class="zg-chip' + (state.mascota === mc ? ' is-selected' : '') + '" data-mascota="' + escHtml(mc) + '">' + escHtml(mc) + '</button>';
          });
          html += '</div>';

          html += '<div class="zg-tf-sublabel">Tocá cuántas personas se mudarían para avanzar</div>';
          html += '<div class="zg-opt-list">';
          html += '<button type="button" class="zg-opt-btn" data-personas="1 persona o pareja"><span>1 persona o pareja</span><span class="zg-opt-arrow">→</span></button>';
          html += '<button type="button" class="zg-opt-btn" data-personas="3 a 4 personas"><span>3 a 4 personas</span><span class="zg-opt-arrow">→</span></button>';
          html += '<button type="button" class="zg-opt-btn" data-personas="5 o más personas"><span>5 o más personas</span><span class="zg-opt-arrow">→</span></button>';
          html += '</div>';
        } else if (state.step === 2) {
          html += '<div class="zg-tf-q">Con qué respaldo pensás alquilar?</div>';
          html += '<div class="zg-tf-sub">Esta unidad trabaja con aseguradora (no necesitás tener la póliza emitida hoy; se gestiona si te gusta al visitarla).</div>';
          html += '<div class="zg-opt-list">';
          html += '<button type="button" class="zg-opt-btn" data-gar="ingresos"><span>1 o 2 ingresos formales<span class="zg-opt-sub">Recibos en BPS o unipersonal +1 año al día, sin Clearing</span></span><span class="zg-opt-arrow">→</span></button>';
          html += '<button type="button" class="zg-opt-btn" data-gar="poliza"><span>Ya cuento con póliza pre-aprobada<span class="zg-opt-sub">Porto, Sura, Mapfre, Santander o BSE</span></span><span class="zg-opt-arrow">→</span></button>';
          html += '<button type="button" class="zg-opt-btn" data-gar="otra"><span>ANDA / CGN, cobro informal o con Clearing</span><span class="zg-opt-arrow">→</span></button>';
          html += '</div>';
        } else if (state.step === 3) {
          html += '<div class="zg-tf-q">En qué rango están los ingresos formales?</div>';
          html += '<div class="zg-tf-sub">Sumando 1 o 2 titulares líquidos mensuales (se calcula aprox. el 30% sobre el valor del alquiler).</div>';
          html += '<div class="zg-opt-list">';
          html += '<button type="button" class="zg-opt-btn" data-ing="ok"><span>$U 95.000 o más líquidos por mes</span><span class="zg-opt-arrow">→</span></button>';
          html += '<button type="button" class="zg-opt-btn' + (state.showEscala2 ? ' is-tapped' : '') + '" data-ing="cerca"><span>Entre $U 65.000 y $U 94.000 por mes<span class="zg-opt-sub">Opción de sumar co-firmante</span></span><span class="zg-opt-arrow">→</span></button>';
          html += '<button type="button" class="zg-opt-btn" data-ing="bajo"><span>Menos de $U 65.000 por mes</span><span class="zg-opt-arrow">→</span></button>';
          html += '</div>';

          if (state.showEscala2) {
            html += '<div class="zg-escala2-box">';
            html += '<div class="zg-escala2-title">Escala 2 · Sumar co-firmante</div>';
            html += '<div class="zg-escala2-desc">Para llegar al requisito de la aseguradora podés sumar 1 familiar o co-firmante con recibo limpio (toda persona que aporta recibo firma el contrato). Contás con alguien para sumar?</div>';
            html += '<div class="zg-opt-list">';
            html += '<button type="button" class="zg-opt-btn" data-escala2="si"><span>Sí, sumamos 1 co-firmante que firma el contrato</span><span class="zg-opt-arrow">→</span></button>';
            html += '<button type="button" class="zg-opt-btn" data-escala2="no"><span>Por ahora contamos solo con este ingreso</span><span class="zg-opt-arrow">→</span></button>';
            html += '</div></div>';
          }
        } else if (state.step === 4) {
          if (state.outcome === 'WHATSAPP_CALIFICADO') {
            var greet = state.nombre ? ('Listo, ' + escHtml(state.nombre) + ': ') : '';
            html += '<div class="zg-tf-q">' + greet + 'cumplís los requisitos para visitar ' + escHtml(opts.tituloCorto) + '</div>';
            html += '<div class="zg-tf-sub">Escribí tu nombre de pila para personalizar tu mensaje con Mar y coordinar horario.</div>';
            html += '<div class="zg-input-stack">';
            html += '<div><label for="zg-tf-nombre">Tu nombre *</label><input type="text" id="zg-tf-nombre" placeholder="Ej. Lucía" value="' + escHtml(state.nombre) + '"></div>';
            html += '<label class="zg-consent-row"><input type="checkbox" id="zg-tf-consent"' + (state.consent ? ' checked' : '') + '><span>Acepto que Zaguán use estos datos solo para responder mi búsqueda de alquiler. <button type="button" class="zg-privacy-btn" id="zg-privacy-toggle">Ver privacidad</button></span></label>';
            if (state.showPrivacy) {
              html += '<div class="zg-privacy-drawer">Ley 18.331 (Uruguay): Zaguán Propiedades guarda estas respuestas solo para coordinar visitas y validar búsquedas de alquiler. No cedemos tus datos a terceros ajenos a tu autorización. Podés pedir la baja por WhatsApp al +598 98 712 064.</div>';
            }
            if (state.validationMsg) {
              html += '<div class="zg-alert-inline">' + escHtml(state.validationMsg) + '</div>';
            }
            html += '<button type="button" class="zg-cta-primary" id="zg-wa-go-btn">Coordinar visita por WhatsApp →</button>';
            html += '</div>';
          } else {
            html += '<div class="zg-tf-q">' + escHtml(state.motivoDesvio || 'Dejá tu búsqueda registrada') + '</div>';
            html += '<div class="zg-tf-sub">El propietario de este padrón solicita esa condición específica. Si nos dejás tu nombre y WhatsApp, te avisamos apenas ingrese una unidad acorde a tu búsqueda.</div>';
            if (state.submitted) {
              html += '<div class="zg-alert-inline">Gracias, ' + escHtml(state.nombre) + '. Registramos tu búsqueda para avisarte apenas ingrese una opción acorde.</div>';
            } else {
              html += '<div class="zg-input-stack">';
              html += '<div><label for="zg-tf-nombre">Tu nombre *</label><input type="text" id="zg-tf-nombre" placeholder="Ej. Martín" value="' + escHtml(state.nombre) + '"></div>';
              html += '<div><label for="zg-tf-wa">Tu WhatsApp *</label><input type="tel" id="zg-tf-wa" placeholder="099 123 456" value="' + escHtml(state.whatsapp) + '"></div>';
              html += '<label class="zg-consent-row"><input type="checkbox" id="zg-tf-consent"' + (state.consent ? ' checked' : '') + '><span>Acepto que Zaguán use estos datos solo para responder mi búsqueda de alquiler. <button type="button" class="zg-privacy-btn" id="zg-privacy-toggle">Ver privacidad</button></span></label>';
              if (state.showPrivacy) {
                html += '<div class="zg-privacy-drawer">Ley 18.331 (Uruguay): Zaguán Propiedades guarda tu búsqueda solo para avisarte cuando ingrese una unidad compatible. Podés pedir la baja por WhatsApp al +598 98 712 064.</div>';
              }
              if (state.validationMsg) {
                html += '<div class="zg-alert-inline">' + escHtml(state.validationMsg) + '</div>';
              }
              html += '<button type="button" class="zg-cta-primary" id="zg-save-search-btn">Registrar mi búsqueda →</button>';
              html += '</div>';
            }
          }
        }

        html += '</div>'; // .zg-tf-current

        if (nextHint) {
          html += '<div class="zg-tf-next">' + escHtml(nextHint) + '</div>';
        }

        html += '</div>'; // .zg-tf-stage

        html += '<button type="button" class="zg-cruzada-trigger" id="zg-open-cruzada">Buscás amoblado, patio u otra zona (La Barra / Punta del Este)? Contanos acá →</button>';
        return html;
      }

      function renderCruzadaMode() {
        var html = '';
        html += '<div class="zg-tf-top">';
        html += '<button type="button" class="zg-back-link" id="zg-back-visita">← Volver a esta unidad</button>';
        html += '<span class="zg-tf-step-count">Búsqueda ' + state.step + ' de 3</span>';
        html += '</div>';
        html += renderStoryBars(3, state.step);
        html += '<div class="zg-tf-stage">';

        if (state.step > 1) {
          var prevTxt = state.step === 2
            ? ('Prioridad: ' + state.cruzadaPrioridad)
            : (state.cruzadaPrioridad + ' · ' + state.cruzadaHogar + ' · ' + state.cruzadaPlazo);
          html += '<button type="button" class="zg-tf-prev" data-go-cruzada="' + (state.step - 1) + '">';
          html += '<span>Respondiste: <strong>' + escHtml(prevTxt) + '</strong></span>';
          html += '<span class="zg-tf-prev-edit">Cambiar ↺</span></button>';
        }

        html += '<div class="zg-tf-current">';
        if (state.step === 1) {
          html += '<div class="zg-tf-q">Cómo querés vivir o qué prioridad buscás?</div>';
          html += '<div class="zg-tf-sub">Contanos qué estás priorizando así te mostramos opciones acordes o salimos a buscar con red de colegas.</div>';
          html += '<div class="zg-opt-list">';
          ['Que esté amoblado', 'Casa o planta baja con patio', 'La Barra / Manantiales', 'Punta del Este', '3 o más dormitorios'].forEach(function (opt) {
            html += '<button type="button" class="zg-opt-btn" data-cruzada-prio="' + escHtml(opt) + '"><span>' + escHtml(opt) + '</span><span class="zg-opt-arrow">→</span></button>';
          });
          html += '</div>';
        } else if (state.step === 2) {
          html += '<div class="zg-tf-q">Quiénes se mudan y para qué fecha?</div>';
          html += '<div class="zg-chip-row">';
          ['Dentro de 30 días', 'Próximos 60 días', 'Más adelante'].forEach(function (pl) {
            html += '<button type="button" class="zg-chip' + (state.cruzadaPlazo === pl ? ' is-selected' : '') + '" data-cplazo="' + escHtml(pl) + '">' + escHtml(pl) + '</button>';
          });
          html += '</div>';
          html += '<div class="zg-opt-list">';
          ['1 persona o pareja', 'Adulto con hijos / familia', 'Con mascotas que requieren patio'].forEach(function (hg) {
            html += '<button type="button" class="zg-opt-btn" data-cruzada-hogar="' + escHtml(hg) + '"><span>' + escHtml(hg) + '</span><span class="zg-opt-arrow">→</span></button>';
          });
          html += '</div>';
        } else if (state.step === 3) {
          if (!state.cruzadaRango) {
            html += '<div class="zg-tf-q">Hasta qué valor mensual te queda cómodo evaluar?</div>';
            html += '<div class="zg-tf-sub">Lo usamos solo para ajustar el filtro de zona y comodidades sin hacerte perder tiempo.</div>';
            html += '<div class="zg-opt-list">';
            ['Hasta $U 45.000/mes', '$U 45.000 a $U 75.000/mes', 'USD 1.000 a USD 1.500/mes', 'Más de USD 1.500/mes'].forEach(function (rg) {
              html += '<button type="button" class="zg-opt-btn" data-cruzada-rango="' + escHtml(rg) + '"><span>' + escHtml(rg) + '</span><span class="zg-opt-arrow">→</span></button>';
            });
            html += '</div>';
          } else {
            html += '<div class="zg-tf-q">' + (state.nombre ? ('Listo, ' + escHtml(state.nombre) + ': ') : '') + 'buscamos ' + escHtml(state.cruzadaPrioridad) + '</div>';
            html += '<div class="zg-tf-sub">Rango cómodo: <strong>' + escHtml(state.cruzadaRango) + '</strong>. Dejá tu nombre para abrir WhatsApp prioritario con Mar.</div>';
            html += '<div class="zg-input-stack">';
            html += '<div><label for="zg-tf-nombre">Tu nombre *</label><input type="text" id="zg-tf-nombre" placeholder="Ej. Rodrigo" value="' + escHtml(state.nombre) + '"></div>';
            html += '<label class="zg-consent-row"><input type="checkbox" id="zg-tf-consent"' + (state.consent ? ' checked' : '') + '><span>Acepto que Zaguán use estos datos solo para responder mi búsqueda de alquiler. <button type="button" class="zg-privacy-btn" id="zg-privacy-toggle">Ver privacidad</button></span></label>';
            if (state.showPrivacy) {
              html += '<div class="zg-privacy-drawer">Ley 18.331 (Uruguay): Zaguán Propiedades guarda tu búsqueda solo para presentarte propiedades compatibles. Podés pedir la baja por WhatsApp al +598 98 712 064.</div>';
            }
            if (state.validationMsg) {
              html += '<div class="zg-alert-inline">' + escHtml(state.validationMsg) + '</div>';
            }
            html += '<button type="button" class="zg-cta-primary" id="zg-cruzada-wa-btn">Enviar búsqueda prioritaria por WhatsApp →</button>';
            html += '</div>';
          }
        }
        html += '</div>';

        if (state.step === 1) html += '<div class="zg-tf-next">Siguiente: Quiénes se mudan y fecha</div>';
        else if (state.step === 2) html += '<div class="zg-tf-next">Siguiente: Rango mensual cómodo y contacto</div>';

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
        root.querySelectorAll('[data-go-step]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.step = Number(el.getAttribute('data-go-step')) || 1;
            state.validationMsg = '';
            state.submitted = false;
            render();
          });
        });

        root.querySelectorAll('[data-plazo]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.plazo = el.getAttribute('data-plazo');
            render();
          });
        });

        root.querySelectorAll('[data-mascota]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.mascota = el.getAttribute('data-mascota');
            render();
          });
        });

        root.querySelectorAll('[data-personas]').forEach(function (el) {
          el.addEventListener('click', function () {
            var val = el.getAttribute('data-personas');
            state.personas = val;
            state.motivoDesvio = '';
            animateAndGo(el, function () {
              if (val === '5 o más personas') {
                state.outcome = 'BUSQUEDA_REGISTRADA';
                state.motivoDesvio = 'Este apartamento tiene capacidad máxima de hasta 4 personas';
                state.step = 4;
                sendSilentLog(4, 'BUSQUEDA_REGISTRADA_CUPO', false);
              } else if (state.mascota === '2 mascotas o perro grande') {
                state.outcome = 'BUSQUEDA_REGISTRADA';
                state.motivoDesvio = 'Esta unidad es en piso 1 sin patio cerrado (admite 1 mascota chica)';
                state.step = 4;
                sendSilentLog(4, 'BUSQUEDA_REGISTRADA_MASCOTA', false);
              } else if (state.plazo !== 'Dentro de 30 días') {
                state.outcome = 'BUSQUEDA_REGISTRADA';
                state.motivoDesvio = 'Esta unidad está pronta para ingresar ahora';
                state.step = 4;
                sendSilentLog(4, 'BUSQUEDA_REGISTRADA_PLAZO', false);
              } else {
                state.step = 2;
                sendSilentLog(1, 'en_curso', false);
              }
              render();
            });
          });
        });

        root.querySelectorAll('[data-gar]').forEach(function (el) {
          el.addEventListener('click', function () {
            var g = el.getAttribute('data-gar');
            state.garantia = g;
            state.motivoDesvio = '';
            state.showEscala2 = false;
            animateAndGo(el, function () {
              if (g === 'ingresos') {
                state.step = 3;
                sendSilentLog(2, 'en_curso', false);
              } else if (g === 'poliza') {
                state.ingresos = 'ok';
                state.outcome = 'WHATSAPP_CALIFICADO';
                state.step = 4;
                sendSilentLog(3, 'califico_poliza', false);
              } else {
                state.ingresos = 'bajo';
                state.outcome = 'BUSQUEDA_REGISTRADA';
                state.motivoDesvio = 'Este propietario alquila solo con póliza de aseguradora privada';
                state.step = 4;
                sendSilentLog(4, 'BUSQUEDA_REGISTRADA_GARANTIA', false);
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
            if (ing === 'cerca') {
              state.showEscala2 = true;
              sendSilentLog(3, 'escala_2_abierta', false);
              render();
              return;
            }
            animateAndGo(el, function () {
              state.showEscala2 = false;
              if (ing === 'ok') {
                state.outcome = 'WHATSAPP_CALIFICADO';
                state.step = 4;
                sendSilentLog(3, 'califico_ingresos', false);
              } else {
                state.outcome = 'BUSQUEDA_REGISTRADA';
                state.motivoDesvio = 'La aseguradora solicitada por el dueño exige ingresos desde $U 95.000 o sumar co-firmante';
                state.step = 4;
                sendSilentLog(4, 'BUSQUEDA_REGISTRADA_INGRESOS', false);
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
                state.outcome = 'WHATSAPP_CALIFICADO';
                state.step = 4;
                sendSilentLog(3, 'califico_escala_2', false);
              } else {
                state.outcome = 'BUSQUEDA_REGISTRADA';
                state.motivoDesvio = 'Para esta unidad la aseguradora requiere sumar 1 co-firmante que firme el contrato';
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

        var consEl = document.getElementById('zg-tf-consent');
        if (consEl) {
          consEl.addEventListener('change', function () {
            state.consent = Boolean(consEl.checked);
            state.validationMsg = '';
            syncMobileBottomBar();
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
            if (!state.consent) {
              state.validationMsg = 'Marcá la casilla de aceptación para abrir WhatsApp.';
              render();
              return;
            }
            state.validationMsg = '';
            sendSilentLog(4, 'WHATSAPP_CALIFICADO', true);
            var leadPayload = {
              event: 'generate_lead',
              property_id: opts.refPublica,
              property_name: opts.tituloCorto,
              garantia_tipo: state.garantia || 'poliza',
              escala_2: state.escala2 || 'no_aplica',
              lead_calificado: true,
              cta_location: 'typeform_4_rayitas',
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
            if (!state.consent) {
              state.validationMsg = 'Marcá la casilla de aceptación para guardar tu búsqueda.';
              render();
              return;
            }
            if (/^09/.test(digits)) digits = '598' + digits.slice(1);
            else if (digits.length === 8) digits = '598' + digits;
            saveBtn.disabled = true;
            saveBtn.textContent = 'Guardando...';
            sendSilentLog(4, 'BUSQUEDA_REGISTRADA', true);
            fetch(CRM_BASE + '/api/interesados', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                nombre: state.nombre,
                telefono: digits,
                tipo_operacion: 'Alquiler Anual',
                zona_preferida: 'Maldonado',
                desde_cuando: state.plazo,
                personas_cantidad: state.personas,
                tiene_mascota: state.mascota,
                garantia_disponible: state.garantia || 'A evaluar',
                canal: 'web_ficha_filtro',
                propiedad_interes: opts.tituloCorto,
                contexto: 'general',
                texto: 'Registro desde filtro en ' + opts.tituloCorto + ': ' + state.personas + ', ' + state.mascota + ', plazo ' + state.plazo + ' (' + state.motivoDesvio + ')'
              })
            }).then(function () {
              state.submitted = true;
              state.validationMsg = '';
              render();
            }).catch(function () {
              state.validationMsg = 'No pudimos guardar en este instante. Probá de nuevo en un segundo.';
              render();
            });
          });
        }

        var openCruzadaBtn = document.getElementById('zg-open-cruzada');
        if (openCruzadaBtn) {
          openCruzadaBtn.addEventListener('click', function () {
            state.modo = 'captacion_cruzada';
            state.step = 1;
            state.cruzadaRango = '';
            state.validationMsg = '';
            sendSilentLog(1, 'cruzada_iniciada', false);
            render();
          });
        }

        var backVisBtn = document.getElementById('zg-back-visita');
        if (backVisBtn) {
          backVisBtn.addEventListener('click', function () {
            state.modo = 'visita';
            state.step = 1;
            state.validationMsg = '';
            render();
          });
        }

        root.querySelectorAll('[data-go-cruzada]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.step = Number(el.getAttribute('data-go-cruzada')) || 1;
            if (state.step < 3) state.cruzadaRango = '';
            state.validationMsg = '';
            render();
          });
        });

        root.querySelectorAll('[data-cruzada-prio]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.cruzadaPrioridad = el.getAttribute('data-cruzada-prio');
            animateAndGo(el, function () {
              state.step = 2;
              sendSilentLog(1, 'cruzada_paso1', false);
              render();
            });
          });
        });

        root.querySelectorAll('[data-cplazo]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.cruzadaPlazo = el.getAttribute('data-cplazo');
            render();
          });
        });

        root.querySelectorAll('[data-cruzada-hogar]').forEach(function (el) {
          el.addEventListener('click', function () {
            state.cruzadaHogar = el.getAttribute('data-cruzada-hogar');
            animateAndGo(el, function () {
              state.step = 3;
              sendSilentLog(2, 'cruzada_paso2', false);
              render();
            });
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
            if (!state.consent) {
              state.validationMsg = 'Marcá la casilla de aceptación para continuar.';
              render();
              return;
            }
            state.validationMsg = '';
            sendSilentLog(3, 'CAPTACION_CRUZADA', true);
            fetch(CRM_BASE + '/api/interesados', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                nombre: state.nombre,
                tipo_operacion: 'Alquiler Anual',
                zona_preferida: state.cruzadaPrioridad,
                desde_cuando: state.cruzadaPlazo,
                personas_cantidad: state.cruzadaHogar,
                estado_busqueda: 'caza_activa_hoy',
                canal: 'captacion_cruzada_web',
                propiedad_interes: opts.tituloCorto,
                contexto: 'general',
                texto: 'Búsqueda prioritaria (' + state.cruzadaPrioridad + ', ' + state.cruzadaHogar + ', plazo ' + state.cruzadaPlazo + ', rango ' + state.cruzadaRango + ')'
              }),
              keepalive: true
            }).catch(function () {});
            pushDataLayer({
              event: 'generate_lead',
              lead_source: 'captacion_cruzada_atributos',
              property_id: opts.refPublica,
              prioridad: state.cruzadaPrioridad,
              rango: state.cruzadaRango,
              lead_calificado: true
            });
            window.open(buildCruzadaWaUrl(), '_blank', 'noopener,noreferrer');
          });
        }
      }

      render();
    }
  };
})();
