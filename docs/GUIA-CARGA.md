# Guía de carga de fichas ZAGUÁN

Código: `ZG-{V|A|I}-{0001}` (V venta, A alquiler anual, I alquiler invernal). Imágenes en `/assets/propiedades/{CODIGO}/01.webp`, 1600 px de ancho, WebP, menos de 250 KB cada una.

## Qué pedirle al propietario o colega

### Siempre
- Dirección exacta (interna; en el sitio sólo se publica la zona) y padrón.
- Tipo, superficie total y cubierta, dormitorios, baños.
- Precio y moneda, o "a consultar".
- Fotos (mínimo 8, horizontales, buena luz) y, si hay, plano.
- Autorización de publicación por escrito (WhatsApp o mail vale como registro).
- Contacto operativo para coordinar visitas.

### Venta
- Titularidad y si hay copropietarios.
- Gastos comunes y contribución inmobiliaria.
- Si está habitada, alquilada o libre.
- Apto banco: **a confirmar con escribanía**.

### Alquiler anual / invernal
- Garantía aceptada, depósito y plazo.
- Gastos comunes (incluidos o no), amoblado, mascotas.
- Fechas de disponibilidad (invernal: período exacto).

### Local, oficina, consultorio
- Habilitaciones y rubro permitido (**a confirmar**).
- Frente a calle, vidriera, baños, cochera, ascensor.
- Gastos comunes y destino actual.

## Reglas de bloqueo
| Falta | Consecuencia |
|---|---|
| Autorización de publicación | No publicar en ningún canal |
| Precio | Publicable sólo con `precio_a_consultar: true` |
| Fotos (menos de 5) | Sólo uso privado por WhatsApp |
| Superficie o tipo | No publicar |
| Contacto operativo | No coordinar visitas |
| Titularidad dudosa (venta) | Sólo privado hasta verificar |

## Campos internos (NO van al repo)
Propietario, teléfono, comisión, observaciones, origen del lead, documentación. Viven en una planilla privada; de ahí se exporta el JSON público con las columnas permitidas.
