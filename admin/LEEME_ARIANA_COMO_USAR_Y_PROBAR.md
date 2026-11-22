# LÉEME · ZAGUÁN — Guía Práctica de Uso, Pruebas y Camino al Futuro

Esta guía te muestra exactamente dónde vive cada archivo real, qué pedirle al chat con frases de 1 línea, cómo probar que nada falle o mienta, y qué 2 pasos faltan para pasar del **HOY** al **FUTURO** (CRM vivo 24/7 en Telegram + Anexo Propietarios).

---

## 1. Mapa Real de Carpetas y Archivos (Dónde Está Todo)

| Para qué sirve | Ruta o Link exacto |
| :--- | :--- |
| **Fichas Web Públicas (HTML)** | `/Users/arianawajntraub/Library/CloudStorage/GoogleDrive-ariana@starunionservicios.com.ar/Mi unidad/zaguan/zaguan-main/alquileres/<slug>/index.html` |
| **Fotos de Propiedades (Web)** | `/Users/arianawajntraub/Library/CloudStorage/GoogleDrive-ariana@starunionservicios.com.ar/Mi unidad/zaguan/zaguan-main/assets/images/propiedades/<slug>/` |
| **Vitrina Alquiler Anual y Catálogo** | `zaguan-main/alquiloanual/index.html` y `zaguan-main/alquileres/index.html` |
| **Fábrica de Redes (`V1 / V2 / V3`)** *(Feed `4:5`, Story `9:16`, Reel 15s `.mp4` con audio oficial, `copys.txt`, `CANVA_BULK`)* | `/Users/arianawajntraub/Desktop/ZAGUAN CLAUDE/packs-redes/<slug>/` |
| **Estados de WhatsApp de Mar** *(JPG + MP4 + texto al pie)* | `/Users/arianawajntraub/Desktop/ZAGUAN CLAUDE/00_ESTADOS_WHATSAPP_LISTOS/` |
| **Catálogo WhatsApp Business** *(`1000×1000` + textos + CSV Meta Commerce)* | `/Users/arianawajntraub/Desktop/ZAGUAN CLAUDE/01_CATALOGO_WHATSAPP_BUSINESS/` |
| **Base CRM + Cabina Comercial** | `zaguan-main/admin/prospeccion_viva_4zonas_zaguan.json` y [https://zaguanpropiedades.com/admin/](https://zaguanpropiedades.com/admin/) |
| **Cabina Aprobalo Cloud (Redes)** | [https://aprobala-app.943ari.workers.dev/p/w8frJy8xjWXG4SGGbkPstV1FveXelKQX](https://aprobala-app.943ari.workers.dev/p/w8frJy8xjWXG4SGGbkPstV1FveXelKQX) |
| **Plan Maestro Completo (8 Prioridades)** | `zaguan-main/admin/MASTER_PLAN_CRM_TELEGRAM.md` |

---

## 2. Frases Exactas de 1 Línea para Pedir en el Chat Principal (Copiar y Pegar)

### A. Alta de Ficha Nueva (6 Pasos Sellados + Multi-Portada `V1 / V2 / V3`)
```text
Armá ficha nueva completa con los 6 pasos sellados y portadas V1/V2/V3: [pegar datos y teléfono dueño] + fotos en [pegar ruta o link de Drive].
```

### B. Cierre / Baja de Propiedad con Prestigio (Los 6 Lugares Inversos)
```text
Pasá la propiedad [Nombre / Ref] a [ALQUILADO / VENDIDO / ALQUILADO POR ZAGUÁN / VENDIDO POR ZAGUÁN] en los 6 lugares y agendá su radar.
```

### C. Auditoría Diaria de Relojes (72 hs + Vigencia 7/15 días + Radar 10/12 meses)
```text
Revisá el CRM: quién cumplió 72 hs, qué ficha activa cumple 7 días de vigencia y armame los links wa.me con el Linter de Mar.
```

### D. Kit de Anuncio en IG Directo para una Ficha Activa
```text
Dame el kit de anuncio IG Directo (ig-directo-real-estate) para [Propiedad / Ref].
```

---

## 3. Checklist de 10 Pruebas de Sentido Común (Para Validar Todo Vos Misma)

### Pruebas del HOY (Web, Redes y WhatsApp)
1. **Los 6 eslabones + Multi-Portada `V1 / V2 / V3`:** Abrí `packs-redes/<slug>/`, `00_ESTADOS_WHATSAPP_LISTOS/` y `01_CATALOGO_WHATSAPP_BUSINESS/` de cualquier ficha nueva y verificá que existan las **3 variantes de portada** (`V1` interior, `V2` exterior/fachada, `V3` cocina/detalle), el MP4 de 15 s con audio de Zaguán, la portada cuadrada `1000×1000` y su alta en `sitemap.xml` + `llms.txt`.
2. **Encabezado PNG + Visor móvil en celular:** Entrá a cualquier ficha desde tu teléfono; arriba debe verse el logo PNG blanco (`zaguan-white.png`), al scrollear debe cambiar a fondo Hueso cálido `#F3F0E8` con el logo PNG negro (`zaguan-black.png`), y al tocar **cualquier miniatura abajo** debe abrirse el visor en pantalla completa con flechas `<` `>`, contador y swipe lateral.
3. **Mapa en tierra firme y cero cocina en vidriera:** El pin de Google Maps debe caer sobre la calle real (nunca en el agua) y el texto público jamás debe mostrar notas internas (*"termina jardín"*, nombre de propietario, etc.).
4. **Linter de WhatsApp de Mar:** Todo mensaje armado para WhatsApp debe salir **sin `¿` ni `¡` de apertura**, **sin adverbios terminados en `-mente`**, **sin la palabra *"encajar"***, **sin mencionar `%` ni comisiones en el 1° mensaje** y **sin prometer visitas si no existe ficha previa**.
5. **Prestigio en cerradas:** Al cerrar una propiedad (como El Tesoro `Ref. ZAG-ALQ-06`), la URL **NO da 404 ni desaparece**: muestra el sello **`ALQUILADO`** (o `ALQUILADO POR ZAGUÁN` si cerró Zaguán) y cambia los botones a **"Consultar similares en la zona"**.

### Pruebas del FUTURO (Apenas Activemos la Base D1 + Bot Telegram 24/7)
6. **Consulta en 2 segundos con la Mac apagada:** Preguntale por Telegram *"¿qué quedó pendiente hoy?"* con la Mac cerrada; tiene que contestar leyendo la base viva en la nube.
7. **Reenvío de audio de WhatsApp:** Reenviale al bot un audio real de un dueño; tiene que transcribirlo y devolverte ordenados canon, gastos comunes, consumos, garantías y si acepta mascotas.
8. **Desambiguación de homónimos:** Decile *"cerrá a Anabela"* (habiendo dos: Torres y Rodríguez); el bot tiene que frenar y darte 2 botones con barrio y teléfono antes de modificar nada.
9. **Cruce Matchmaker (`Oferta x Demanda`):** Anotale un interesado (*"2D en Maldonado hasta 32 mil con Porto y perro chico"*); tiene que detectar al instante que coincide con La Fortuna (Jorge, `$U 30.000`).
10. **Cola con Acuse (`cola_ag`):** Pedile desde Telegram *"armá ficha nueva"* o *"bajá el precio de Jorge en el HTML"*; el bot tiene que darte un número de ticket `⏳ PENDIENTE_AG`, mostrarse arriba de todo apenas abrís Antigravity en la Mac y mandarte un mensaje de vuelta a Telegram cuando quede publicado de verdad.

---

## 4. Cómo Modificar Reglas o Condiciones Sin Romper Nada

- **Cambiar una regla permanente de negocio o redacción:** Se edita únicamente en `GEMINI.md` (cuidando que pese siempre menos de `20.000` bytes) y en `zaguan-main/admin/MASTER_PLAN_CRM_TELEGRAM.md`.
- **Cambiar precio o condición de una ficha activa hoy:** Se actualiza primero en `prospeccion_viva_4zonas_zaguan.json`, luego en el HTML de la ficha (`/alquileres/<slug>/index.html`), en las cards de `/alquiloanual/` y `/alquileres/`, y en `CATALOGO_WHATSAPP_BUSINESS_ZAGUAN.md` + `TEXTO_PARA_EL_ESTADO.txt`, y se sube por GitHub.
- **No editar el JSON CRM mientras corre un scraping en otra ventana:** Respetar siempre un único dueño del archivo por vez.

---

## 5. Paso a Paso Exacto para Llegar al FUTURO (Obra 2 y Obra 3)

Hoy con este plan ya estás en el **HOY MEJORADO** (las 8 Prioridades selladas en reglas, cierre real de Rosario con prestigio y relojes activos). Para pasar a operar **24/7 desde Telegram sin depender de la Mac**:

1. **Llave 1 que generás vos en 1 minuto (Telegram):**
   - Abrí `@BotFather` en Telegram $\rightarrow$ `/newbot` $\rightarrow$ poné nombre `Zaguán CRM` y usuario terminado en `bot` (ej. `zaguan_crm_bot`).
   - Copiá el **Token** que te devuelve y pasámelo junto con tu usuario/@ para poner el candado de seguridad (`chat_id`).
2. **Llave 2 que conectás vos en 1 clic (Cloudflare):**
   - Iniciá sesión en el plugin **Cloudflare** dentro de Antigravity (o conectá tu cuenta donde vive Aprobalo).
3. **Obra 2 (Lo que construyo yo apenas me des esas 2 llaves):**
   - Creo la base de datos viva D1 exclusiva de Zaguán (compatible por `cuenta_id` como futuro módulo ERP de Aprobalo) y migro los 39+ contactos sin perder ninguno.
   - Levanto el Bot de Telegram con los 4 carriles (`Propietarios`, `Interesados`, `Visitas`, `Cierres`), transcripción de audios, Linter de Mar, Matchmaker, Parte Diario 18:30 hs, relojes 7d/15d/10m/12m y `cola_ag`.
   - Conecto `/admin/` y los sellos de `/alquiloanual/` + `/alquileres/` a esa base viva.
4. **Obra 3 (Anexo Propietarios `/propietarios/?id=...`):**
   - Maqueto el link privado donde cada dueño ve las 4 cosas de su ficha, acepta en 1 clic la publicación sin exclusividad + compromiso de avisar si alquila/vende y tiene botón directo de baja.
