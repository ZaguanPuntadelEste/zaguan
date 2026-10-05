# Sistema de fichas

- `data/taxonomias.json`: valores cerrados y etiquetas ES/EN/PT. Agregar un valor lo suma al filtro.
- `data/propiedades.json`: fichas públicas (vacío al inicio). Sólo se muestran las que tienen `publicado: true`.
- `data/propiedades.ejemplo.json`: ejemplo del esquema. No se muestra en el sitio.
- `assets/css/fichas.css`: etiquetas sobre imágenes y tarjetas.
- `propiedades/`: buscador, filtros y detalle (`?id=ZG-V-0001`). Está en `noindex` hasta que haya fichas reales.
- `docs/`: guía de carga y prompt de ingesta.

Para activar: cargar fichas reales, quitar `noindex` y enlazar "Propiedades" del menú a `/propiedades/`.
