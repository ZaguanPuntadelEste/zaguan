(function(){
  var items = [
    {
        "name": "Betania IV",
        "url": "/proyectos/betania-iv/",
        "zone": "Leandro Gómez casi Tauro · Maldonado",
        "desc": "Apartamentos de 1, 2 y 3 dormitorios con terraza privada. Hasta 24 cuotas en obra.",
        "price": "Desde USD 79.800",
        "tags": [
            "Venta en pozo",
            "Hasta 24 cuotas",
            "Entrega oct. 2028"
        ],
        "image": "/assets/images/betania-iv/proyecto-1.jpg",
        "alt": "Betania IV · Maldonado"
    },
    {
        "name": "Nostrum Roosevelt",
        "url": "/proyectos/nostrum-roosevelt/",
        "zone": "Av. Roosevelt Parada 19 · Maldonado",
        "desc": "1, 2 y 3 dormitorios con exoneración de ITP, IRPF/IRAE y Patrimonio por 10 años.",
        "price": "Desde USD 107.419",
        "tags": [
            "Ley 18.795",
            "Exoneración 10 años",
            "Entrega ene. 2030"
        ],
        "image": "/assets/images/nostrum-roosevelt/proyecto-1.jpg",
        "alt": "Nostrum Roosevelt · Parada 19"
    },
    {
        "name": "More Atlántico",
        "url": "/proyectos/more-atlantico/",
        "zone": "Av. Roosevelt Parada 22 · Junto a Atlántico Shopping",
        "desc": "Monoambientes y 1, 2 y 3 dormitorios con certificación LEED, spa, piscinas y Ley 18.795.",
        "price": "Mono desde USD 120.000 · 1D USD 139.121",
        "tags": [
            "LEED + Ley 18.795",
            "Pegado al Shopping",
            "Torre 2 (2026) / T3 (2029)"
        ],
        "image": "/assets/images/more-atlantico/proyecto-1.jpg",
        "alt": "More Atlántico · Parada 22"
    },
    {
        "name": "EVE Tower",
        "url": "/proyectos/eve-tower/",
        "zone": "Avenida Roosevelt y Guanabara · Parada 8 Playa Brava",
        "desc": "Monoambientes y apartamentos de 1 y 2 dormitorios a 100 m del mar con financiación en obra.",
        "price": "Desde USD 150.000",
        "tags": [
            "Playa Brava Pda. 8",
            "En pozo",
            "Entrega dic. 2028"
        ],
        "image": "/assets/images/eve-tower/proyecto-1.jpg",
        "alt": "EVE Tower · Playa Brava"
    },
    {
        "name": "Golden Rise",
        "url": "/proyectos/golden-rise/",
        "zone": "Av. Roosevelt y Salt Lake · Parada 18",
        "desc": "Monoambientes, 1 y 2 dormitorios: 10% reserva + 20% compromiso + 30 cuotas obra + 120 cuotas saldo.",
        "price": "Desde USD 139.900 (Hasta 150 cuotas)",
        "tags": [
            "Financiación 10 años",
            "En pozo",
            "Entrega dic. 2028"
        ],
        "image": "/assets/images/golden-rise/proyecto-1.jpg",
        "alt": "Golden Rise · Parada 18"
    }
];
  var anchor = document.querySelector('.principles-section');
  if (!anchor || !items.length) return;
  function esc(s){return String(s).replace(/[&<>"']/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  var cards = items.map(function(i){
    var media = i.image
      ? '<div class="emp-media"><img src="' + esc(i.image) + '" alt="' + esc(i.alt) + '" loading="lazy" decoding="async"><div class="emp-tags">' + i.tags.map(function(t){return '<span>' + esc(t) + '</span>'}).join('') + '</div></div>'
      : '<div class="emp-media emp-media--empty"><div class="emp-tags">' + i.tags.map(function(t){return '<span>' + esc(t) + '</span>'}).join('') + '</div>' + esc(i.name) + '</div>';
    return '<a class="emp-card" href="' + esc(i.url) + '">' + media + '<div class="emp-body"><h3>' + esc(i.name) + '</h3><p>' + esc(i.zone) + '</p><p>' + esc(i.desc) + '</p><p class="emp-price">' + esc(i.price) + '</p></div></a>';
  }).join('');
  var sec = document.querySelector('.emp') || document.createElement('section');
  sec.className = 'emp';
  sec.id = 'emprendimientos';
  sec.setAttribute('aria-labelledby', 'titulo-emprendimientos');
  sec.innerHTML = '<div class="container"><div class="emp-head"><div><p class="eyebrow">Emprendimientos verificados · Atención ES / EN + Escribanía Aliada</p><h2 id="titulo-emprendimientos">5 desarrollos en pozo y obra nueva.</h2></div>' + (items.length > 1 ? '<div class="emp-nav"><button type="button" data-dir="-1" aria-label="Anterior">←</button><button type="button" data-dir="1" aria-label="Siguiente">→</button></div>' : '') + '</div><div class="emp-rule"></div><div class="emp-track" tabindex="0" aria-label="Emprendimientos">' + cards + '</div><p class="emp-note">Asesoramiento integral en español e inglés para residentes y compradores del exterior con escribanía local aliada.</p></div>';
  if (!sec.parentNode) anchor.parentNode.insertBefore(sec, anchor);
  var track = sec.querySelector('.emp-track');
  var btns = sec.querySelectorAll('.emp-nav button');
  if (!btns.length) return;
  function upd(){btns[0].disabled = track.scrollLeft <= 4; btns[1].disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4}
  btns.forEach(function(b){b.addEventListener('click', function(){track.scrollBy({left: Number(b.dataset.dir) * (track.clientWidth * 0.8), behavior: 'smooth'})})});
  track.addEventListener('scroll', upd, {passive: true});
  window.addEventListener('resize', upd);
  upd();
})();
