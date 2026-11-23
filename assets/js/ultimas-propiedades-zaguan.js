(() => {
  const REGISTRO = {
    alquiler: [
      {
        titulo_corto: 'Centro de Maldonado 2D Piso 4 Norte ($U 27.000 + $U 5.000 GC)',
        href: '/alquileres/maldonado-centro-piso-4-norte/',
        badge: 'Alquiler anual · Nuevo ingreso',
        precio: '$U 32.000 / mes total',
        detalle: '~50 m², piso 4 por ascensor con cámaras, doble ventanal al frente, sol de invierno, lavadero, aire y calefón · Acepta mascotas · Porto, Sura, Mapfre o Santander.',
        alquiler_uyu: 32000,
        fecha_ingreso: '2026-11-23'
      },
      {
        titulo_corto: 'La Fortuna en Maldonado ($U 30.000/mes)',
        href: '/alquileres/la-fortuna-agata/',
        badge: 'Alquiler anual · Disponible',
        precio: '$U 30.000 / mes',
        detalle: '2 dormitorios a estrenar en Av. Ágata con cochera fija, gastos comunes y Wi-Fi incluidos · Máx. 4 personas y mascota de raza pequeña · Porto, Sura, Mapfre o Santander.',
        alquiler_uyu: 30000,
        fecha_ingreso: '2026-11-22'
      },
      {
        titulo_corto: 'Maldonado Residencial 2D ($U 52.000/mes)',
        href: '/alquileres/maldonado-residencial-2d/',
        badge: 'Alquiler anual · Disponible',
        precio: '$U 52.000 / mes',
        detalle: '2 dormitorios a estrenar con losa radiante, aberturas DVH y cochera fija · Porto, Sura o Mapfre.',
        alquiler_uyu: 52000,
        fecha_ingreso: '2026-11-18'
      },
      {
        titulo_corto: 'Roosevelt y Cantegril 2D ($U 70.000/mes)',
        href: '/alquileres/roosevelt-cantegril-2d/',
        badge: 'Alquiler anual · Disponible',
        precio: '$U 70.000 / mes',
        detalle: 'Piso alto de 2 dormitorios en suite con parrillero propio y cochera en subsuelo.',
        alquiler_uyu: 70000,
        fecha_ingreso: '2026-11-15'
      }
    ],
    venta: [
      {
        titulo_corto: 'Santa Mónica frente a la Laguna (USD 160.000)',
        href: '/propiedades/santa-monica-casa-hormigon/',
        badge: 'Venta directa · Obra avanzada',
        precio: 'USD 160.000',
        detalle: 'Lote propio de 348 m² con 201 m² en hormigón armado a 7 km de José Ignacio y 250 m del mar.',
        fecha_ingreso: '2026-11-22'
      },
      {
        titulo_corto: 'Betania IV en Maldonado (desde USD 79.800)',
        href: '/proyectos/betania-iv/',
        badge: 'Pozo en cuotas · Entrega Oct 2028',
        precio: 'Desde USD 79.800',
        detalle: '1, 2 y 3 dormitorios en Maldonado con cochera en planta baja incluida y hasta 24 cuotas.',
        fecha_ingreso: '2026-11-10'
      }
    ]
  };

  window.ZAGUAN_ULTIMAS_PROPIEDADES = REGISTRO;

  function hydrate() {
    document.querySelectorAll('[data-zaguan-link-reciente]').forEach((a) => {
      const cat = a.dataset.zaguanLinkReciente === 'venta' ? 'venta' : 'alquiler';
      const item = REGISTRO[cat] && REGISTRO[cat][0];
      if (!item) return;
      a.href = item.href;
      if (!a.dataset.keepText) a.textContent = item.titulo_corto;
    });

    const grids = document.querySelectorAll('[data-zaguan-grilla-recientes]');
    if (!grids.length) return;
    const allItems = [
      ...(REGISTRO.alquiler || []).map((x) => ({ ...x, tipo: 'Alquiler' })),
      ...(REGISTRO.venta || []).map((x) => ({ ...x, tipo: 'Venta' }))
    ];
    grids.forEach((box) => {
      box.innerHTML =
        '<div style="background:#E8E4DA;border:1px solid #CDD0C9;padding:24px;margin:28px 0;">' +
          '<p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#123B4A;">Cartera activa actualizada</p>' +
          '<h3 style="margin:0 0 14px;font-family:Archivo,Arial,sans-serif;font-size:22px;color:#081521;">Últimos ingresos en alquiler anual y venta para aplicar con tu carpeta</h3>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;">' +
            allItems.map((it) => {
              const simHref = it.alquiler_uyu ? '/garantias-alquiler/?alquiler=' + it.alquiler_uyu + '&propiedad=' + encodeURIComponent(it.href.replace(/^\/alquileres\/|\/$/g, '')) : '';
              return '<div style="background:#F3F0E8;border:1px solid #CDD0C9;padding:14px;display:flex;flex-direction:column;justify-content:space-between;gap:10px;">' +
                '<div>' +
                  '<span style="display:inline-block;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#123B4A;margin-bottom:4px;">' + it.badge + '</span>' +
                  '<h4 style="margin:0 0 4px;font-family:Archivo,Arial,sans-serif;font-size:16px;color:#081521;">' + it.titulo_corto + '</h4>' +
                  '<p style="margin:0;font-size:13px;color:#123B4A;line-height:1.45;">' + it.detalle + '</p>' +
                '</div>' +
                '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
                  '<a href="' + it.href + '" style="font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;background:#081521;color:#F3F0E8;padding:8px 12px;text-decoration:none;">Ver ficha →</a>' +
                  (simHref ? '<a href="' + simHref + '" style="font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;border:1px solid #123B4A;color:#081521;padding:7px 10px;text-decoration:none;">Simular garantía</a>' : '') +
                '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrate);
  } else {
    hydrate();
  }
})();
