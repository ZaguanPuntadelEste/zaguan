(function() {
  var CRM_URL = 'https://zaguan-crm-bot.943ari.workers.dev';
  var host = document.getElementById('zaguan-pedido-abierto-box');
  if (!host) return;

  var ctx = host.getAttribute('data-contexto') || 'general';
  var opAttr = host.getAttribute('data-operacion') || 'Alquiler Anual';
  var zonaDefault = host.getAttribute('data-zona') || 'Maldonado / Punta del Este';
  var fechaFutura = host.getAttribute('data-fecha-futura') || '';
  var tituloProp = host.getAttribute('data-titulo') || '';

  function normalizeOpValue(raw) {
    if (/pozo|cuota/i.test(raw)) return 'Desarrollo en pozo';
    if (/venta|compra/i.test(raw)) return 'Compra / Venta';
    return 'Alquiler Anual';
  }

  var opInicial = normalizeOpValue(opAttr);

  function buildCuandoOptions(esCompraMode) {
    if (fechaFutura && !esCompraMode) {
      return [
        { val: fechaFutura, label: 'Para esa fecha (' + fechaFutura + ')' },
        { val: 'Más adelante / otra fecha', label: 'Para otra fecha más adelante' }
      ];
    }
    if (esCompraMode) {
      return [
        { val: 'Compra inmediata', label: 'Evaluando compra ahora' },
        { val: 'En los próximos meses', label: 'En los próximos 3 a 6 meses' },
        { val: 'Más adelante / inversión', label: 'A mediano plazo / inversión' }
      ];
    }
    return [
      { val: 'Entrar ya', label: 'Para entrar ya' },
      { val: 'Más adelante / otro mes o 2027', label: 'Para mudarme más adelante (otro mes o 2027)' }
    ];
  }

  var initEsCompra = /venta|compra|pozo/i.test(opInicial);
  var initPresuPlaceholder = initEsCompra ? 'Ej. USD 120.000' : 'Ej. $U 30.000 / mes';
  var initCuandoOpts = buildCuandoOptions(initEsCompra);

  host.innerHTML =
    '<section aria-label="Dejar búsqueda en Pedidos Abiertos" style="margin-top:24px;padding:18px 20px;border-radius:14px;background:rgba(15,29,43,0.94);border:1px solid rgba(212,175,55,0.38);color:#F1F5F9;">' +
      '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px;">' +
        '<div>' +
          '<span style="display:inline-block;font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#FCD34D;margin-bottom:2px;">Búsqueda personalizada en Zaguán</span>' +
          '<h3 style="margin:0;font-size:17px;line-height:1.28;color:#FFFFFF;">' +
            (fechaFutura ? '¿Buscás para esa fecha, otra modalidad u otro presupuesto?' : '¿Buscás otra propiedad, menos o más dormitorios, o alquilar / comprar?') +
          '</h3>' +
        '</div>' +
        '<span style="font-size:12px;color:#B7D6E0;">Solo WhatsApp · Respuesta directa con Mar</span>' +
      '</div>' +
      '<form id="zg-pa-form" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:10px;align-items:end;">' +
        '<label style="display:grid;gap:4px;font-size:12px;color:#CBD5E1;">' +
          '<span>WhatsApp *</span>' +
          '<input id="zg-pa-tel" type="tel" required placeholder="099 123 456" style="padding:9px 10px;border-radius:8px;border:1px solid rgba(148,163,184,0.35);background:#081521;color:#fff;font-size:13.5px;">' +
        '</label>' +
        '<label style="display:grid;gap:4px;font-size:12px;color:#CBD5E1;">' +
          '<span>Tu nombre (opcional)</span>' +
          '<input id="zg-pa-nombre" type="text" placeholder="Ej. Sofía" style="padding:9px 10px;border-radius:8px;border:1px solid rgba(148,163,184,0.35);background:#081521;color:#fff;font-size:13.5px;">' +
        '</label>' +
        '<label style="display:grid;gap:4px;font-size:12px;color:#CBD5E1;">' +
          '<span>¿Qué operación buscás?</span>' +
          '<select id="zg-pa-op" style="padding:9px 10px;border-radius:8px;border:1px solid rgba(148,163,184,0.35);background:#081521;color:#fff;font-size:13px;">' +
            '<option value="Alquiler Anual"' + (opInicial === 'Alquiler Anual' ? ' selected' : '') + '>Alquiler anual ($U / USD)</option>' +
            '<option value="Compra / Venta"' + (opInicial === 'Compra / Venta' ? ' selected' : '') + '>Compra: casa, apto o terreno (USD)</option>' +
            '<option value="Desarrollo en pozo"' + (opInicial === 'Desarrollo en pozo' ? ' selected' : '') + '>Desarrollo en pozo en cuotas (USD)</option>' +
          '</select>' +
        '</label>' +
        '<label style="display:grid;gap:4px;font-size:12px;color:#CBD5E1;">' +
          '<span>Zona o barrio</span>' +
          '<input id="zg-pa-zona" type="text" value="' + zonaDefault.replace(/"/g, '&quot;') + '" placeholder="Ej. Maldonado Centro, Mansa, Barra" style="padding:9px 10px;border-radius:8px;border:1px solid rgba(148,163,184,0.35);background:#081521;color:#fff;font-size:13.5px;">' +
        '</label>' +
        '<label style="display:grid;gap:4px;font-size:12px;color:#CBD5E1;">' +
          '<span>¿Para cuándo buscás?</span>' +
          '<select id="zg-pa-cuando" style="padding:9px 10px;border-radius:8px;border:1px solid rgba(148,163,184,0.35);background:#081521;color:#fff;font-size:13px;">' +
            initCuandoOpts.map(function(o) { return '<option value="' + o.val + '">' + o.label + '</option>'; }).join('') +
          '</select>' +
        '</label>' +
        '<label style="display:grid;gap:4px;font-size:12px;color:#CBD5E1;">' +
          '<span>Dormitorios / tipología</span>' +
          '<select id="zg-pa-dorms" style="padding:9px 10px;border-radius:8px;border:1px solid rgba(148,163,184,0.35);background:#081521;color:#fff;font-size:13px;">' +
            '<option value="0|Monoambiente o 1 dormitorio|Monoambiente o 1 dormitorio">Monoambiente o 1 dormitorio</option>' +
            '<option value="0|Monoambiente, 1 o 2 dormitorios|1 o 2 dormitorios">Indistinto (1 o 2 dormitorios)</option>' +
            '<option value="2|2 dormitorios|2 dormitorios">2 dormitorios</option>' +
            '<option value="3|3 o más dormitorios|3 o más dormitorios">3 o más dormitorios</option>' +
            '<option value="0|Terreno, proyecto o local comercial|Terreno, proyecto o local comercial">Terreno, proyecto o local comercial</option>' +
          '</select>' +
        '</label>' +
        '<label style="display:grid;gap:4px;font-size:12px;color:#CBD5E1;">' +
          '<span>Presupuesto aprox.</span>' +
          '<input id="zg-pa-presu" type="text" placeholder="' + initPresuPlaceholder + '" style="padding:9px 10px;border-radius:8px;border:1px solid rgba(148,163,184,0.35);background:#081521;color:#fff;font-size:13.5px;">' +
        '</label>' +
        '<button type="submit" id="zg-pa-btn" style="padding:10px 14px;border-radius:8px;border:0;background:#16A34A;color:#fff;font-weight:700;font-size:13px;cursor:pointer;">' +
          '🎯 Dejar mi búsqueda' +
        '</button>' +
      '</form>' +
      '<div id="zg-pa-result" style="display:none;margin-top:12px;padding:12px 14px;border-radius:8px;background:rgba(22,163,74,0.14);border:1px solid rgba(22,163,74,0.45);font-size:13px;"></div>' +
    '</section>';

  var form = document.getElementById('zg-pa-form');
  var opSel = document.getElementById('zg-pa-op');
  var cuandoSel = document.getElementById('zg-pa-cuando');
  var presuInput = document.getElementById('zg-pa-presu');
  var zonaInput = document.getElementById('zg-pa-zona');
  if (!form || !opSel) return;

  opSel.addEventListener('change', function() {
    var esCompraNow = /venta|compra|pozo/i.test(opSel.value);
    if (presuInput) {
      presuInput.placeholder = esCompraNow ? 'Ej. USD 120.000' : 'Ej. $U 30.000 / mes';
    }
    if (cuandoSel) {
      var optsNow = buildCuandoOptions(esCompraNow);
      cuandoSel.innerHTML = optsNow.map(function(o) {
        return '<option value="' + o.val + '">' + o.label + '</option>';
      }).join('');
    }
  });

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    var telRaw = (document.getElementById('zg-pa-tel').value || '').trim();
    var digits = telRaw.replace(/\D/g, '');
    if (digits.length < 8) {
      alert('Ingresá un número de WhatsApp válido (al menos 8 dígitos) para avisarte.');
      return;
    }
    if (/^09/.test(digits)) digits = '598' + digits.slice(1);
    else if (digits.length === 8) digits = '598' + digits;

    var nombre = (document.getElementById('zg-pa-nombre').value || '').trim() || ('Web ' + digits.slice(-4));
    var opElegida = opSel.value || opInicial;
    var esCompraElegida = /venta|compra|pozo/i.test(opElegida);
    var zonaElegida = (zonaInput && zonaInput.value ? zonaInput.value.trim() : '') || zonaDefault;
    var cuando = cuandoSel ? cuandoSel.value : 'A confirmar';
    var dormParts = (document.getElementById('zg-pa-dorms').value || '').split('|');
    var dormsMin = Number(dormParts[0] || 0);
    var dormsAbiertos = dormParts[1] || 'Monoambiente o 1 dormitorio';
    var dormsFrase = dormParts[2] || 'Monoambiente o 1 dormitorio';
    var presuRaw = (presuInput.value || '').trim();
    var presuNum = parseFloat(presuRaw.replace(/[^\d]/g, '')) || null;
    if (presuNum && presuNum < 250 && /mil/i.test(presuRaw)) presuNum *= 1000;
    var moneda = /\$u|uy|peso/i.test(presuRaw)
      ? 'UYU'
      : (/usd|u\$s|d[oó]lar/i.test(presuRaw) || esCompraElegida ? 'USD' : 'UYU');

    var btn = document.getElementById('zg-pa-btn');
    var resBox = document.getElementById('zg-pa-result');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    var presuFmtTexto = presuNum ? (' hasta ' + moneda + ' ' + presuNum.toLocaleString('es-UY')) : '';
    var textoSint = 'Busco ' + opElegida + ' en ' + zonaElegida + ' (' + dormsFrase + ') para ' + cuando + presuFmtTexto + (tituloProp ? ' · consulta enviada desde ' + tituloProp : '');
    var ctxSubmit = esCompraElegida && /santa_monica/i.test(ctx)
      ? 'santa_monica'
      : (/pozo/i.test(opElegida) ? 'pozo' : 'general');

    try {
      var resp = await fetch(CRM_URL + '/api/interesados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre,
          telefono: digits,
          tipo_operacion: opElegida,
          modalidad_contrato: /pozo/i.test(opElegida) ? 'Pozo en cuotas' : (esCompraElegida ? 'Compra / Venta' : 'Anual'),
          desde_cuando: cuando,
          zona_preferida: zonaElegida,
          dormitorios_min: dormsMin,
          dormitorios_abiertos: dormsAbiertos,
          presupuesto_max: presuNum,
          moneda: moneda,
          canal: 'web_ficha',
          propiedad_interes: tituloProp || null,
          contexto: ctxSubmit,
          texto: textoSint
        })
      });
      var data = await resp.json();
      if (!resp.ok || !data.ok) throw new Error(data.error || 'Error guardando búsqueda');

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', {
          lead_source: 'ficha_pedidos_abiertos',
          property_context: ctxSubmit,
          operation_type: opElegida,
          currency: moneda,
          value: presuNum || 0
        });
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'generate_lead',
        lead_source: 'ficha_pedidos_abiertos',
        property_context: ctxSubmit,
        operation_type: opElegida
      });

      var waHref = 'https://wa.me/59898712064?text=' + encodeURIComponent(
        'Hola Mar, acabo de dejar mi búsqueda en ZAGUÁN: ' + textoSint + '. Quedo a las órdenes para ver opciones.'
      );
      resBox.style.display = 'block';
      resBox.style.background = 'rgba(22,163,74,0.14)';
      resBox.innerHTML =
        '✅ <strong>¡Búsqueda agendada en Pedidos Abiertos!</strong> Ya le llegó el aviso al equipo de ZAGUÁN. Si querés sumar algún detalle por WhatsApp ahora: ' +
        '<a href="' + waHref + '" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:6px;padding:7px 13px;border-radius:6px;background:#16A34A;color:#fff;font-weight:700;text-decoration:none;">📲 Hablar con ZAGUÁN por WhatsApp</a>';
      form.reset();
      opSel.value = opElegida;
      if (zonaInput) zonaInput.value = zonaElegida;
    } catch (err) {
      resBox.style.display = 'block';
      resBox.style.background = 'rgba(239,68,68,0.16)';
      resBox.innerHTML = 'No pudimos guardar en este momento. Podés escribir directo por WhatsApp con los botones de arriba.';
    } finally {
      btn.disabled = false;
      btn.textContent = '🎯 Dejar mi búsqueda';
    }
  });
})();
