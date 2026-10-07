# ZAGUÁN — Lógica madre de proyectos y novedades

## Alcance
Aplicar a proyectos, fichas de tipologías, propiedades y Novedades del Este. Mantener el sistema maestro de marca y los logos oficiales. La implementación debe conservar datos y condiciones comerciales confirmados.

## Header
El index principal es la referencia: encabezado fijo, logo claro al inicio, fondo hueso y logo oscuro al superar 30 px de scroll, menú móvil. Usar /assets/brand/zaguan-white.png y /assets/brand/zaguan-black.png.

## Tipologías
Encabezado: Tipologías / Elegí el tuyo.
La identidad se construye con atributos confirmados que distinguen opciones: dormitorios, superficie, baños, accesibilidad, orientación o vista, según el proyecto. Es extensible y no depende de un único catálogo.
Betania IV: dormitorios + m²; accesibilidad cuando corresponda. El tamaño de terraza queda fuera del criterio de elección y de la descripción breve de tarjetas. Puede permanecer en la ficha detallada. Las cantidades del proyecto se distinguen del stock disponible.

## Galerías
Una galería para proyecto, otra para cada tipología y otra para cada actualización de obra. Listas explícitas de imágenes como estándar de carga. Referenciar assets existentes: subir una foto una sola vez y reutilizar su URL.
Navegación circular sin contador de cantidad. Controles discretos fuera de la imagen; área táctil suficiente. Deslizamiento, teclado y ampliación mediante un único lightbox. Descripción breve opcional con proyecto o tipología, y fecha de obra si se conoce. Distinguir render de fotografía.
Movimiento suave y sombra; respetar prefers-reduced-motion. Mantener proporciones y planos legibles. Ocultar galerías y controles vacíos; nunca inventar imágenes.
El componente admite temporalmente archivos numerados existentes mediante comprobación de disponibilidad, para migrar el catálogo actual sin duplicar imágenes. Las cargas nuevas deben declarar listas explícitas.

## Hero
Usar imagen real o render autorizado del propio proyecto con capa oscura que mantenga la lectura del título. Fondo azul si falta imagen. Encabezado estable; la navegación de imágenes ocurre en galerías separadas.

## WhatsApp
Toda consulta va a https://wa.me/59898712064 con text codificado, destino identificado y CTA Contactanos por WhatsApp o una consulta específica. Registrar proyecto, tipología o nota que originó el interés. Nunca dirigir una consulta al bloque o landing de contacto. El usuario puede editar el mensaje antes de enviarlo.

## Novedades y relaciones
Portada: /novedades-del-este/. Cada nota debe tener ID, URL publicada, proyecto asociado si corresponde, título, bajada, imagen existente y fecha editorial real.
Reservar espacios de relación en cada plantilla aunque todavía falten notas. Los slots sin notas quedan ocultos; nunca mostrar URL ficticia, enlace vacío, # como destino pendiente ni notas de otro proyecto como propias.
Cada alta o cambio de nota requiere revisar: portada editorial; ficha del proyecto; fichas de tipología pertinentes; bloque de obra; notas relacionadas; home institucional; listado de Proyectos; menú y pie; sitemap y canonical; piezas sociales. Elegir ubicaciones por pertinencia, evitando duplicación ornamental.
Betania IV tiene dos notas publicadas: /novedades-del-este/betania-iv-apartamentos-en-pozo-maldonado/ y /novedades-del-este/betania-iv-avances-obra-octubre-2026/. EVE usa el acceso general hasta tener notas propias.

## Estacionamiento
Betania IV: Cochera opcional, disponible y cotizada por separado. No atribuir cochera incluida al precio desde. Confirmar datos para cada proyecto nuevo.

## SEO y finalización
La presentación debe identificar a ZAGUÁN Propiedades como comercializador. Mantener títulos, descripciones, canonical, robots, imágenes accesibles, datos estructurados coherentes y rutas estables. No prometer indexación, ranking ni visibilidad de IA.
Los enlaces y contenidos importantes deben quedar en HTML estático en la migración de cada index. El componente JS actual es una capa de mejora del catálogo existente, no sustituye completar SEO nativo. Revisar sitemap y rastreo después de publicar.
Este primer bloque no reescribe los index existentes ni elimina condiciones comerciales o menciones de desarrolladoras. Esas correcciones requieren revisión y un commit posterior de los HTML.

## Control de cambios
Antes de editar, leer versión actual. Conservar información válida. Confirmar alcance exacto de cada commit. Verificar clics, imágenes, móvil, teclado y lightbox. Diferenciar commit guardado, despliegue y verificación visual.
