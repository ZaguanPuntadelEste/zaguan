# Documentación Base de Negocio y Operación Cognitiva · 1 - ZAGUÁN (`DOCUMENTACION_BASE_NEGOCIO_ZAGUAN.md`)

**Proyecto:** `1 - ZAGUÁN` (`zaguanpropiedades.com`)  
**Responsable operativa:** `Mar` (`+598 98 712 064`) · **Dirección y cierre:** Ariana Wajntraub  
**Alcance:** Base estructural de captación, calificación en 14 verticales, detección de faltantes en 2 capas, `CANDADO DE FRANJA GRIS / RESERVA DE FICHA PÚBLICA`, arquitectura Toyota Production System (Andon + 7 Poka-Yokes + Tablero granular en 2 clics), planilla master anti-amnesia y división operativa entre chats.

---

## 1. Regla #0 Anti-Ceguera entre Chats (Fuente Única de Verdad en Disco)

Ningún chat de Antigravity está aislado del ecosistema en la Mac. Antes de pedirle un solo dato a Ariana sobre una propiedad, propietario, desarrollo o campaña de Zaguán, todo agente debe consultar `/Users/arianawajntraub/.gemini/config/firewall/brand_firewall.py` para ubicar las rutas oficiales de `ZAGUAN_PROYECTO` y leer de inmediato:

1. **CRM vivo y condiciones reales pactadas:**  
   `/Users/arianawajntraub/Library/CloudStorage/GoogleDrive-ariana@starunionservicios.com.ar/Mi unidad/zaguan/zaguan-main/admin/prospeccion_viva_4zonas_zaguan.json`
2. **Planilla Master Inmutable Anti-Amnesia:**  
   `/Users/arianawajntraub/Library/CloudStorage/GoogleDrive-ariana@starunionservicios.com.ar/Mi unidad/zaguan/zaguan-main/admin/MASTER_PUBLICACIONES_Y_OKS_ZAGUAN.csv` *(espejo en `/Users/arianawajntraub/Desktop/ZAGUAN CLAUDE/MASTER_PUBLICACIONES_Y_OKS_ZAGUAN.csv` y respaldo en Google Sheets)*.
3. **Plan Maestro y reglas locales:**  
   `/Users/arianawajntraub/Library/CloudStorage/GoogleDrive-ariana@starunionservicios.com.ar/Mi unidad/zaguan/zaguan-main/admin/MASTER_PLAN_CRM_TELEGRAM.md` y `/Users/arianawajntraub/Desktop/ZAGUAN CLAUDE/GEMINI.md`.
4. **Sistema de voz, entradas y copywriting de la marca:**  
   `/Users/arianawajntraub/Library/CloudStorage/GoogleDrive-ariana@starunionservicios.com.ar/Mi unidad/zaguan/ZAGUAN MARCA . CONOCIMIENTO/ZAGUÁN ESTILO GUIA BASE COPYS/zaguan_ai_content_system_v3.md`.
5. **Puente inter-áreas y activos publicitarios:**  
   `/Users/arianawajntraub/antigravity-cm/mesa_interareas.mjs` (`1-zaguan`) y `/Users/arianawajntraub/antigravity-cm/bovedas-cuentas/1-zaguan.md`.

**Invariante operativa:** El chat de pauta/automatización, el chat de contenido y el chat comercial (`Mar`) operan sobre los mismos archivos y registros. Prohibido hacerle preguntas obvias a Ariana sobre datos que ya viven en el CRM o en la Planilla Master.

---

## 2. Los 2 Carriles de Captación y Armado de Ficha

### Carril A — Outbound (Scrapeo de dueños directos por `Mar`)
1. **Scrapeo y filtro:** El bot releva avisos de dueños directos que alquilan o venden (descartando inmobiliarias encubiertas y validando teléfono uruguayo `09...`).
2. **Primer contacto:** `Mar` redacta y prepara el mensaje inicial respetando el Linter (cero `%` o comisiones en el 1° contacto, cero `¿` ni `¡` de apertura, cero adverbios terminados en `-mente`, prohibida la palabra *"encajar"*).
3. **Lectura del aviso base:** Cuando el dueño responde, el sistema audita qué datos ya declaraba su publicación original.
4. **Detector de faltantes:** Cruza lo publicado contra la matriz de requisitos de su vertical y marca exactamente qué falta saber.
5. **Respuesta inteligente con faltantes:** `Mar` incluye las preguntas puntuales por esos faltantes en el mensaje de seguimiento.
6. **Consolidación y ordenamiento:** Con las respuestas del dueño (texto, audio, PDF de documentos, ubicación, fotos/videos), el sistema ordena el material multimedia y pre-arma la ficha.
7. **Bienvenida disfrazada de Backend de OKs $\rightarrow$ Publicación silenciosa:** Con el OK del dueño sobre fotos y datos, `Mar` se lo muestra a Ariana, lo asienta en la Planilla Master y se dispara la URL pública propia (bajo `CANDADO DE FRANJA GRIS`: jamás se le entrega al dueño) + Packs de Redes (`V1 / V2 / V3`) + Estados + Catálogo + Aprobalo Cloud + Kit de Pauta + Árbol de Respuestas de esa unidad.

### Carril B — El Intersticio Inbound (*"Tengo propiedad para darte, ZAGUÁN"*)
Cuando una persona entra sin aviso previo que scrapear (por el botón 3 del anuncio en WhatsApp *"Busco en otra zona o tengo propiedad para publicar"*, por formulario web o por referido directo):
1. **Clasificación instantánea en las 14 verticales:** El agente identifica qué tipo exacto de persona y operación entra (ej. dueña que vende casa a construir vs. dueño que vende local comercial vs. desarrolladora).
2. **Activación del detector de faltantes de 2 capas:** Como no existe aviso previo para leer, dispara el interrogatorio mínimo ordenado (Capa 1 estándar de la vertical + Capa 2 profunda según características constructivas/legales que vayan surgiendo).
3. **Mismo cierre sellado:** Ordena fotos/datos $\rightarrow$ Bienvenida de OKs $\rightarrow$ Registro en Planilla Master $\rightarrow$ Publicación silenciosa + Packs + Respuestas automáticas.

---

## 3. Matriz de las 14 Grandes Verticales (7 de Oferta × 7 de Demanda)

Cada persona que entra por Outbound, Inbound o Pauta pertenece a una de estas 14 categorías. Cada categoría define su **dolor real**, sus **requisitos y faltantes específicos** (prohibido mezclar garantías de alquiler en ventas o planos de padrón en alquileres), el **tono exacto de `Mar`** y su **cruce latente** (*qué otra cosa ofrecer cuando la persona dice buscar X pero en realidad necesita Y*).

### A. Las 7 Verticales de Oferta (Quien habilita activo)

| Cód. | Categoría de persona | Dolor principal | Faltantes y requisitos obligatorios a relevar | Tono de `Mar` | Matriz de cruce (Ads / Copys / Respuestas) |
|---|---|---|---|---|---|
| **O1** | **Persona dueña que habilita a vender casa** | Quiere vender sin quedar atada a exclusividad ni perder tiempo con curiosos sin fondos. | Ubicación/padrón, m² terreno y edificados, antigüedad, estado constructivo, contribución/primaria, situación de títulos/planos, precio en USD, si acepta banco/permuta. *(Sin garantía de alquiler).* | Cercano, resolutivo, transparente; foco en calificación de compradores y respaldo notarial. | Cruza con **D3** (busca casa hecha) y **D7** (si la casa requiere reforma/demolición para otro proyecto). |
| **O2** | **Persona dueña que habilita a vender apartamento** | Defensa del valor por m² frente a oferta repetida y filtro de expensas/gastos comunes. | Edificio/torre, piso/orientación, m² propios y terrazas, cochera/baulera, gastos comunes mensuales en \$U/USD, estado de deuda/títulos, si está con renta o vacío, precio USD. *(Sin garantía de alquiler).* | Preciso, ágil, orientado a mostrar ubicación y números claros. | Cruza con **D4** (busca apto hecho) y **D1** (si busca vender usado para entrar a pozo o viceversa). |
| **O3** | **Persona dueña que habilita a vender local / oficina comercial** | Activo inmovilizado o buscando inquilino/comprador solvente con habilitación acorde al rubro. | Metraje de salón/planta, altura, vidriera/frente, potencia eléctrica/trifásica, habilitación comercial/gastronómica/oficina, gastos comunes, situación fiscal/títulos, precio USD. | Ejecutivo, comercial, directo al rendimiento y viabilidad operativa. | Cruza con **D6** (busca local/oficina/consultorio) y **O6** (opción de alquilar si no cierra venta rápida). |
| **O4** | **Persona dueña que habilita a vender lote / terreno** | Tierra sin liquidez; compradores dudan de la edificabilidad real y los papeles. | Padrón y manzana, m² totales, frente/fondo, FOT/FOS/retiros y altura permitida, servicios en puerta (OSE, UTE, saneamiento), nivelación/tala, estado documental/títulos en PDF, precio USD. | Técnico-claro, enfocado en certidumbre jurídica y potencial constructivo. | Cruza con **D5** (busca lote), **D7** (busca lote pero acepta casa a construir o demoler) y **O7** (desarrolladoras). |
| **O5** | **Persona dueña que habilita a vender proyecto de construcción / obra** | Necesita explicar valor de estructura, materiales y etapas cuando la casa todavía no está terminada o fue hecha a medida. | Grado de avance de obra, memoria constructiva real (ej. estructura para vientos oceánicos), quién proyecta/dirige, fecha de entrega, planos/permisos BPS e Intendencia, qué falta para final de obra, precio USD y forma de pago por avance. | Técnico-cálido, detallista, traduciendo la calidad de obra en confianza para el comprador. | Cruza con **D7** (quien buscaba lote o casa y descubre proyecto llave en mano) y **D3** (quien busca casa nueva). |
| **O6** | **Persona dueña que habilita a alquilar** *(Única oferta con garantía)* | Miedo al impago, destrozos y desgaste mostrando la unidad a gente sin respaldo. | Canon en \$U/USD, qué incluye (gastos comunes, Wi-Fi, OSE/UTE), **garantías aceptadas y rechazadas** (Porto, Sura, Mapfre, Santander, ANDA, CGN, depósito), mascotas, plazo (anual/temporada), quién tiene llaves y horarios. | Protector de su tiempo y su propiedad; énfasis en filtro previo de solvencia sin exclusividad. | Cruza directo con **D2** (inquilinos filtrados con aseguradora) y **D3/D4** (eventual compra si el dueño evalúa vender luego). |
| **O7** | **Persona de desarrolladora que nos da pozo / obra nueva** | Necesita canales externos serios que registren clientes correctamente y respeten precios de lista sin quemar la torre. | Lista viva de unidades, precio `"Desde USD ..."`, cronograma de cuotas (reserva, compromiso, cuotas obra, ocupación), gastos de ocupación (`1,5%` a `5%`), beneficios Ley 18.795, fecha de entrega, reglas de registro previo y comisión. | Institucional B2B, ordenado, respetuoso de canales y precios oficiales. | Cruza con **D1** (inversores de pozo), **D4** (quien miraba usado pero le conviene financiación en pozo) y **D3**. |

---

### B. Las 7 Verticales de Demanda (Quien busca y diagnóstico de necesidad latente)

| Cód. | Categoría de persona | Dolor principal | Requisitos / datos a descubrir en conversación | Tono de `Mar` | Matriz de cruce (*"Dice querer X, puede necesitar Y"*) |
|---|---|---|---|---|---|
| **D1** | **Persona interesada en pozo** | Temor a atrasos de obra, gastos ocultos de ocupación/conexión y dudas notariales (especialmente extranjeros). | Objetivo (renta vs. vivienda), presupuesto total y anticipo disponible, necesidad de cuotas en obra/post-ocupación, país de residencia fiscal, preferencia de zona (Maldonado/Roosevelt/Brava). | Transparente, analítico, respaldado por escribanía local y desglose real de cierre. | Cruza con **O7** (pozos públicos y cartera privada) y **O5** (proyectos de construcción en curso). |
| **D2** | **Persona interesada en alquilar** *(Única demanda con filtro de garantía)* | Falta de alquiler anual real en Maldonado/PDE y demoras en respuestas cuando aparece algo bueno. | Zona deseada, cantidad de dormitorios, tope mensual, **qué garantía posee aprobada** (Porto, Sura, Mapfre, Santander, ANDA, depósito), fecha de ingreso y si tiene mascotas. | Ágil, directo, filtrador desde el segundo mensaje para coordinar visitas reales. | Cruza con **O6** (ej. `ZAG-ALQ-05` La Fortuna) y si tiene buen capital/ahorro cruzable a futuro con **D1/D4**. |
| **D3** | **Persona interesada en comprar hecho — casa** | Miedo a vicios ocultos constructivos (humedad, techos, vientos) o papeles incompletos. | Barrio/entorno (todo el año vs. verano), dormitorios, m² de terreno, presupuesto contado o banco, tolerancia a reciclar vs. llave en mano. | Asesor cercano, claro en estado constructivo y documentación. | Cruza con **O1**, pero también con **O5** (casa a terminar) o **O4/D7** (si no hay casa hecha en su presupuesto, lote + proyecto). |
| **D4** | **Persona interesada en comprar hecho — apartamento** | Expensas/gastos comunes impagables, edificios mal mantenidos o sobreprecio frente a obra nueva. | Zona/parada, dormitorios, cochera, tope de gastos comunes, uso (vivir/renta), presupuesto USD y forma de pago. | Objetivo, comparativo, directo a metros reales y expensas. | Cruza con **O2** y con **O7** (pozo con entrega cercana y cuotas si el usado no cierra en precio). |
| **D5** | **Persona interesada en comprar lote / terreno** | Incertidumbre sobre qué se puede construir realmente, servicios disponibles y papeles limpios. | Uso pensado (casa propia, renta o desarrollo), zona, m² mínimos, presupuesto USD, horizonte de inicio de obra. | Técnico-práctico, enfocado en viabilidad urbana y jurídica. | Cruza con **O4** y **D7** (cruzarle lote con proyecto a construir o casa vieja a demoler si le da mejor ubicación/precio). |
| **D6** | **Persona interesada en categoría comercial (negocio / oficina / consultorio)** | Visibilidad, estacionamiento, habilitaciones municipales y costo fijo mensual de operación. | Rubro exacto (gastronomía, estética, consultorio, estudio, depósito), operación (compra vs. alquiler), m² y requerimientos técnicos (vidriera, trifásica, planta libre). | Pragmático, enfocado en circulación comercial y viabilidad técnica. | Cruza con **O3** (venta comercial), **O6** (alquiler comercial) y **O1** (casas con frente comercial apto consultorio/estudio). |
| **D7** | **Persona que busca lote/terreno abierta a casa a construir o construcción a tirar abajo (Necesidad latente)** | **El humano dice que busca X ("un terreno") cuando su solución real es Y** (una casa vieja bien ubicada para demoler/reciclar o una obra ya empezada que le ahorra 12 meses de trámites). | Presupuesto total (tierra + obra), urgencia de mudanza/uso, si ya tiene arquitecto/constructora o busca solución llave en mano, apertura a demoler o continuar estructura existente. | Exploratorio y consultivo: abre la mirada con casos concretos sin imponer. | **Puente maestro de Zaguán:** Conecta **D5** (lote) con **O1** (casas antiguas en buen padrón), **O4** (lotes) y **O5** (proyectos de construcción como Santa Mónica). |

---

## 4. Detección de Faltantes en 2 Capas e Ingesta Multimodal (Caso Escuela: Santa Mónica)

Las plantillas rígidas rompen la operación cuando aparece un activo real con particularidades constructivas o legales. El caso real ocurrido con la propietaria que ofreció una casa a construir/en obra en **Santa Mónica** demostró por qué el detector de faltantes de `Mar` debe trabajar en **2 capas progresivas**:

1. **Capa 1 — Faltantes Estructurales de la Categoría:**
   Se piden de entrada según la vertical (O1–O7). *Ejemplo:* Jamás preguntar por garantías de aseguradora en una venta, y jamás omitir la garantía aceptada/rechazada en un alquiler (`MP-12` Jorge: acepta aseguradoras, NO acepta ANDA).

2. **Capa 2 — Faltantes Profundos y Descubrimiento Multimodal (El Modelo Santa Mónica):**
   Muchos datos decisivos no están en un formulario inicial porque el dueño ni siquiera sabe que son un argumento de venta o un requisito previo:
   - **ADN constructivo y resistencia climática:** Al preguntar por características constructivas que no figuraban en ningún lado, surgió que **la construyó la propia dueña** con cálculo estructural reforzado para **vientos oceánicos**. *Regla:* Siempre incluir la pregunta abierta de calidad constructiva y autoría de obra en casas y proyectos costeros.
   - **Ubicación progresiva:** Si el propietario no declara dirección exacta o pin al inicio por desconfianza, `Mar` conversa primero el activo y solicita la ubicación recién cuando se establece el contexto de comprador real.
   - **Cronología real vía Audio:** Cuando el dueño responde con notas de voz (ej. antigüedad real de la construcción o historia de la obra), el sistema transcribe y extrae fecha/etapa exacta como campo estructurado en la ficha.
   - **Validación documental vía PDF:** Los papeles legales del terreno/padrón suelen llegar tarde en formato PDF o foto de escritura/plano. El sistema parsea y deja trazado en cocina (`estado_documental`) antes de salir a prometer condiciones legales en público.

**Principio de estandarización:** Todo hallazgo nuevo que salte en una conversación real se incorpora como pregunta guiada opcional en la Capa 2 de esa vertical para futuros casos.

---

## 5. `CANDADO DE FRANJA GRIS / RESERVA DE FICHA PÚBLICA` + Bienvenida de OKs + Planilla Master Anti-Amnesia

### A. `CANDADO DE FRANJA GRIS / RESERVA DE FICHA PÚBLICA` (Ni antes ni después)
- **Regla de Oro:** Hoy Zaguán opera validando en Franja Gris. **PROHIBIDO entregarle el link de la ficha pública armada (`/alquileres/<slug>`, `/ventas/<slug>`) al propietario NI ANTES NI DESPUÉS de publicarla.**
- Si el dueño la encuentra por su cuenta navegando en Google o redes y la usa, es aceptable en esta etapa de validación; pero **Zaguán jamás le entrega en mano su ficha pública lista** para evitar que la utilice para vender o alquilar por su cuenta puenteándonos.
- **📌 PENDIENTE FUTURO REGISTRADO (`CANDADO DE FRANJA GRIS`):** Cuando salgamos de la validación inicial, evaluar si corresponde cláusula temporal donde el propietario reconozca honorarios si cierra por su cuenta dentro de `X` plazo tras nuestra gestión activa.

### B. La "Bienvenida Disfrazada de Backend de OKs" (Cero Rigidez Legal)
- El dueño **ni se entera** del alta técnica de la URL pública ni recibe un contrato pesado para hacernos juicio.
- Recibe una **pantalla o mensaje cordial de bienvenida** que opera como **control de calidad interno ("Backend de OKs")**:
  1. Confirma fotos elegidas, precio, moneda, expensas/gastos comunes y condiciones reales (*"Si algo se entendió distinto, corregilo acá ahora"*). Si algún dato se entendió mal, **salta ahí mismo** antes de publicar o gastar en pauta.
  2. Formaliza de manera humana los 3 acuerdos operativos: sin exclusividad, compromiso de responder consultas filtradas de interesados y compromiso de avisar si la cierra por su cuenta.
- Una vez que el dueño da el OK, `Mar` se lo muestra a Ariana, se dispara la publicación en web + redes + catálogo y se registra la evidencia.

### C. La Planilla Master Inmutable Anti-Amnesia (`MASTER_PUBLICACIONES_Y_OKS_ZAGUAN.csv` + Google Sheets)
- **Propósito:** Eliminar para siempre el riesgo de buscar meses después en WhatsApp *"quién era Santiago"* o *"qué pasó con Santa Mónica"*. Incluso si todo el software se cae, la planilla CSV/GSheet vive íntegra, viva y actualizada.
- **Columnas obligatorias:** `id_registro`, `fecha_actualizacion`, `vertical_14`, `nombre_persona`, `telefono_wa`, `operacion`, `zona_barrio`, `titulo_o_activo`, `precio_publicado`, `condiciones_y_faltantes`, `estado_crm`, `ok_bienvenida`, `ref_ficha_interna`, `url_interna_zaguan`, `reloj_o_radar`, `notas_auditoria`.

---

## 6. Arquitectura Toyota Production System: Andon + 7 Poka-Yokes + Tablero Power BI en 2 Clics

### A. Sistema Andon (Dónde frena la línea y entra Ariana)
Ariana no opera tareas repetitivas ni hace de inspectora de errores básicos. Solo se enciende la luz **Andon** (frenando el flujo para intervención humana) en 3 casos exactos:
1. **Faltante inédito de Capa 2:** Aparece una variable constructiva o documental no tipificada (como ocurrió con los vientos oceánicos en Santa Mónica) $\rightarrow$ Ariana resuelve el criterio $\rightarrow$ el sistema lo estandariza para que no vuelva a saltar.
2. **Desvío en la Bienvenida de OKs:** El propietario corrige un precio, condición o foto en el backend de OKs $\rightarrow$ Ariana valida el ajuste antes de liberar la pieza/pauta.
3. **Alarma de Pauta o Conversión:** Una campaña supera el umbral de costo por consulta, cae por debajo de la tasa mínima de visitas o se cierra una propiedad con anuncios activos.

### B. Los 7 Poka-Yokes (A prueba de errores)
1. **Poka-Yoke #1 (Cero ceguera de disco):** Ningún agente pregunta a Ariana un dato que ya existe en el CRM, Planilla Master o `GEMINI.md` local.
2. **Poka-Yoke #2 (Garantía solo en `O6 / D2`):** El validador bloquea pedir garantía aseguradora en ventas/lotes/obras y bloquea publicar un alquiler sin definir qué garantías acepta/rechaza.
3. **Poka-Yoke #3 (`CANDADO DE FRANJA GRIS`):** Bloqueo automático contra el envío de URLs públicas de ficha propia al dueño, ni antes ni después.
4. **Poka-Yoke #4 (Linter de `Mar`):** Cero `¿` ni `¡` de apertura, cero adverbios en `-mente`, cero `"encajar"`, cero `%` en 1° contacto y cero saludos genéricos de bot (*"¡Hola! ¿Cómo podemos ayudarte?"*).
5. **Poka-Yoke #5 (Invariante Pauta $\leftrightarrow$ Árbol de Respuesta):** Ningún anuncio con botones de WhatsApp puede publicarse sin tener escritos en la Ficha Dual su Plan A (unidad pautada), Plan B (misma vertical en otra zona/valor) y Plan C (cruce a las 14 verticales).
6. **Poka-Yoke #6 (Baja con Prestigio en 6 Lugares):** Al cerrarse una unidad, nunca da 404: sella `ALQUILADO / VENDIDO` (o `POR ZAGUÁN`), cambia CTA a similares, frena Aprobalo, da de baja Estados WA, marca baja en Catálogo WA, alerta pausa de Ads y agenda radar `10m / 12m`.
7. **Poka-Yoke #7 (Doble escritura en Planilla Master):** Toda alta, respuesta, cambio de estado o cierre impacta en la Planilla Master CSV/GSheet de respaldo.

### C. Tablero Granular Estilo Power BI en 2 Clics (`/admin/`)
- **Vista 0 (Cabina Global):** Embudo vivo por las **14 Verticales (`O1..O7` × `D1..D7`)**, Matchmaker automático Oferta $\times$ Demanda, relojes activos (`72h` prospección, `7d/15d` vigencia, `10m/12m` radar) y **Semáforo de los 7 Canales** (Web/Fichas, SEO/LLMs/Sitemap/Indexación, Blog, Google Business/Maps, IG/FB/TikTok en Aprobalo, WhatsApp Catálogo/Estados, Meta Ads `Zaguán ADS`).
- **Clic 1 (Radiografía de Vertical / Propiedad):** Muestra todas las variables explicadas en lenguaje claro (faltantes resueltos vs. pendientes, documentos PDF/audio, consultas recibidas, costo por lead, cruces posibles).
- **Clic 2 (Resolución Andon / Acción en 1 Toque):** Botón directo para aprobar ficha, copiar respuesta `wa.me` limpia, pausar pauta o activar cruce a otra vertical.

---

## 7. División de Roles y Árbol Estandarizado de Decisión

| Área | Responsable | Qué ejecuta exactamente |
|---|---|---|
| **Este Chat (Growth, Pauta, Arquitectura & Automatización)** | Orquestador de Tráfico, Datos & Sistemas | Diseña y opera `Zaguán ADS` (`act_1946619906468438`), cruza rendimiento Ads $\leftrightarrow$ Consultas, mantiene los Poka-Yokes, indexación/SEO/Schema/LLMs, tablero granular `/admin/`, Planilla Master y sincronización inter-áreas. |
| **Chat de Zaguán (`Mar` · `CUENTA_GM_COMERCIAL`)** | Comercial, Scraping & Fichas | Scrapea dueños en Marketplace/Facebook (validando perfiles particulares y `09...`), redacta mensajes de prospección con detector de faltantes de 2 capas, arma Bienvenida de OKs, consolida fotos/audios/PDFs, ejecuta el circuito de 6 pasos (Web + Packs `V1/V2/V3` + Estados + Catálogo + Aprobalo + Kit Ads) y prepara respuestas de WhatsApp. |

### Árbol Estándar de Respuesta y Cruce para Leads Entrantes
1. **Rama 1 — Califica para el activo pautado (Plan A):** Responde con datos reales de la ficha (ej. `ZAG-ALQ-05`: `$U 30.000` GC y Wi-Fi inc., aseguradoras sin ANDA) + pide confirmación de garantía/condición clave + propone horarios reales de visita.
2. **Rama 2 — No encaja por zona, precio o requisito, pero sigue en la misma vertical (Plan B):** Revisa inventario vivo en la Planilla Master dentro de esa vertical; si hay coincidencia la ofrece directo; si no hay, releva las 4 variables mínimas para cargarlo en Demanda (`D1..D7`) y disparar scraping dirigido de `Mar`.
3. **Rama 3 — Trae un activo propio (*"Tengo propiedad para publicar"* -> Oferta `O1..O7`):** Clasifica en `O1..O7`, activa detector de faltantes de 2 capas (sin pedir garantía si no es alquiler), solicita fotos/ubicación/PDF y dispara circuito de Bienvenida de OKs + Planilla Master.
4. **Rama 4 — Pide `X` cuando puede necesitar `Y` (Cruce Latente `D7` / Inversión `D1`):** Si busca terreno (`D5`) se cruza con casa a construir/demoler (`O5`/`O1`); si busca usado sin financiamiento conveniente (`D3`/`D4`) se evalúa cruce a pozos con entrega y cuotas (`O7`).
