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
  var initPresuPlaceholder = initEsCompra ? 'Ej. USD 120.000' : 'Ej. $U 27.000 / mes';
  var initCuandoOpts = buildCuandoOptions(initEsCompra);
  var is2DormDefault = host.getAttribute('data-dormitorios') === '2' || /\b2\s*(?:d\b|dorm)/i.test(tituloProp);

  host.innerHTML =
    '<style>' +
      '#zg-pa-form{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;align-items:end}' +
      '#zg-pa-form label{display:grid;gap:5px;font-size:12px;color:#B8C5D0;min-width:0;font-weight:500}' +
      '#zg-pa-form input,#zg-pa-form select{width:100%;height:42px;box-sizing:border-box;padding:0 11px;border-radius:8px;border:1px solid rgba(243,240,232,0.24);background:#081521;color:#F3F0E8;font-size:13.5px;font-family:inherit;min-width:0}' +
      '#zg-pa-form input:focus,#zg-pa-form select:focus{outline:2px solid #B7D6E0;outline-offset:1px;border-color:#B7D6E0}' +
      '#zg-pa-btn{width:100%;height:42px;padding:0 14px;border-radius:8px;border:1px solid #F3F0E8;background:#F3F0E8;color:#081521;font-weight:700;font-size:13.5px;cursor:pointer;font-family:inherit;white-space:nowrap;transition:background .18s ease}' +
      '#zg-pa-btn:hover{background:#B7D6E0;border-color:#B7D6E0}' +
      '@media(max-width:960px){#zg-pa-form{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
      '@media(max-width:560px){#zg-pa-form{grid-template-columns:1fr}}' +
    '</style>' +
    '<section aria-label="Dejar búsqueda en Pedidos Abiertos" style="margin-top:20px;padding:22px 26px;border-radius:16px;background:#123B4A;border:1px solid rgba(243,240,232,0.18);color:#F3F0E8;">' +
      '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:14px;">' +
        '<div>' +
          '<span style="display:inline-block;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#B7D6E0;margin-bottom:4px;">Búsqueda personalizada en Zaguán</span>' +
          '<h3 style="margin:0;font-size:18px;line-height:1.25;color:#F3F0E8;font-family:Archivo,sans-serif;">' +
            (fechaFutura ? '¿Buscás para esa fecha, otra modalidad u otro presupuesto?' : '¿Buscás otra propiedad, menos o más dormitorios, o alquilar / comprar?') +
          '</h3>' +
        '</div>' +
        '<span style="font-size:12.5px;color:#B7D6E0;font-weight:600;">Solo WhatsApp · Respuesta directa con Mar</span>' +
      '</div>' +
      '<form id="zg-pa-form">' +
        '<label>' +
          '<span>WhatsApp *</span>' +
          '<input id="zg-pa-tel" type="tel" required placeholder="099 123 456">' +
        '</label>' +
        '<label>' +
          '<span>Tu nombre (opcional)</span>' +
          '<input id="zg-pa-nombre" type="text" placeholder="Ej. Sofía">' +
        '</label>' +
        '<label>' +
          '<span>¿Qué operación buscás?</span>' +
          '<select id="zg-pa-op">' +
            '<option value="Alquiler Anual"' + (opInicial === 'Alquiler Anual' ? ' selected' : '') + '>Alquiler anual ($U / USD)</option>' +
            '<option value="Compra / Venta"' + (opInicial === 'Compra / Venta' ? ' selected' : '') + '>Compra: casa, apto o terreno (USD)</option>' +
            '<option value="Desarrollo en pozo"' + (opInicial === 'Desarrollo en pozo' ? ' selected' : '') + '>Desarrollo en pozo en cuotas (USD)</option>' +
          '</select>' +
        '</label>' +
        '<label>' +
          '<span>Zona o barrio</span>' +
          '<input id="zg-pa-zona" type="text" value="' + zonaDefault.replace(/"/g, '&quot;') + '" placeholder="Ej. Maldonado Centro, Mansa, Barra">' +
        '</label>' +
        '<label>' +
          '<span>¿Para cuándo buscás?</span>' +
          '<select id="zg-pa-cuando">' +
            initCuandoOpts.map(function(o) { return '<option value="' + o.val + '">' + o.label + '</option>'; }).join('') +
          '</select>' +
        '</label>' +
        '<label>' +
          '<span>Dormitorios / tipología</span>' +
          '<select id="zg-pa-dorms">' +
            '<option value="0|Monoambiente o 1 dormitorio|Monoambiente o 1 dormitorio">Monoambiente o 1 dormitorio</option>' +
            '<option value="0|Monoambiente, 1 o 2 dormitorios|1 o 2 dormitorios"' + (is2DormDefault ? ' selected' : '') + '>Indistinto (1 o 2 dormitorios)</option>' +
            '<option value="2|2 dormitorios|2 dormitorios">2 dormitorios</option>' +
            '<option value="3|3 o más dormitorios|3 o más dormitorios">3 o más dormitorios</option>' +
            '<option value="0|Terreno, proyecto o local comercial|Terreno, proyecto o local comercial">Terreno, proyecto o local comercial</option>' +
          '</select>' +
        '</label>' +
        '<label>' +
          '<span>Presupuesto aprox.</span>' +
          '<input id="zg-pa-presu" type="text" placeholder="' + initPresuPlaceholder + '">' +
        '</label>' +
        '<button type="submit" id="zg-pa-btn">Dejar mi búsqueda →</button>' +
      '</form>' +
      '<div id="zg-pa-result" style="display:none;margin-top:14px;padding:14px 16px;border-radius:10px;background:rgba(8,21,33,0.72);border:1px solid #B7D6E0;color:#F3F0E8;font-size:13.5px;"></div>' +
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
      presuInput.placeholder = esCompraNow ? 'Ej. USD 120.000' : 'Ej. $U 27.000 / mes';
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
      resBox.style.background = 'rgba(8,21,33,0.72)';
      resBox.style.borderColor = '#B7D6E0';
      resBox.innerHTML =
        '<strong>Búsqueda agendada en Pedidos Abiertos.</strong> Ya llegó el aviso al equipo de ZAGUÁN. Si querés sumar algún detalle por WhatsApp ahora: ' +
        '<a href="' + waHref + '" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:8px;padding:8px 14px;border-radius:8px;background:#F3F0E8;color:#081521;font-weight:700;text-decoration:none;">Hablar con Mar por WhatsApp →</a>';
      form.reset();
      opSel.value = opElegida;
      if (zonaInput) zonaInput.value = zonaElegida;
    } catch (err) {
      resBox.style.display = 'block';
      resBox.style.background = 'rgba(18,59,74,0.9)';
      resBox.style.borderColor = 'rgba(243,240,232,0.45)';
      resBox.innerHTML = 'No pudimos guardar en este momento. Podés escribir directo por WhatsApp con los botones de arriba.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Dejar mi búsqueda →';
    }
  });
})();
