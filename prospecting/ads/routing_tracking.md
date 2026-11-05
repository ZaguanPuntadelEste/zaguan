# Tracking, UTM & WhatsApp Attribution Routing · ZAGUÁN Propiedades

Nomenclatura y especificación de enrutamiento para atribución de prospectos y trazabilidad de campañas publicitarias.

---

## 1. Nomenclatura Estándar de UTMs

Todas las URL dirigidas a landing pages o páginas de proyecto en `zaguanpropiedades.com` deben incorporar los 5 parámetros estándar:

| Parámetro | Valores Permitidos | Descripción / Ejemplo |
|-----------|--------------------|-----------------------|
| `utm_source` | `meta`, `google` | Red de tráfico pagado |
| `utm_medium` | `cpc`, `social_paid` | Medio de adquisición |
| `utm_campaign` | `biv_ticket`, `eve_brava`, `gr_amenities`, `int_invest` | Objetivo y proyecto |
| `utm_content` | `REE_BIV_V1`, `IMG_EVE_01`, `TXT_GR_A1`, etc. | Identificador del anuncio creativo |
| `utm_term` | `uy_maldonado`, `uy_mvd`, `ar_amba`, `br_sp` | Segmentación o palabra clave |

### Ejemplos de URLs de Campaña:
- **Betania IV (Google Search)**:
  `https://zaguanpropiedades.com/proyectos/betania-iv/?utm_source=google&utm_medium=cpc&utm_campaign=biv_ticket&utm_term=apartamentos_pozo_maldonado`
- **EVE Tower (Meta Ads Reels)**:
  `https://zaguanpropiedades.com/proyectos/eve-tower/?utm_source=meta&utm_medium=social_paid&utm_campaign=eve_brava&utm_content=REE_EVE_V1&utm_term=ar_amba`
- **Golden Rise (Meta Ads Feed)**:
  `https://zaguanpropiedades.com/proyectos/golden-rise/?utm_source=meta&utm_medium=social_paid&utm_campaign=gr_amenities&utm_content=IMG_GR_01&utm_term=uy_maldonado`
- **Inversión Internacional**:
  `https://zaguanpropiedades.com/busqueda-personalizada/?utm_source=meta&utm_medium=social_paid&utm_campaign=int_invest&utm_content=REE_INV_01&utm_term=ar_amba`

---

## 2. Enrutamiento Directo a WhatsApp con Contexto Codificado

Conforme a la regla de `AGENTS.md` (L23-25), todo llamado a la acción comercial dirige a `https://wa.me/59898712064` incorporando el parámetro `?text=` con el proyecto, tipología y código de anuncio codificado en formato URL.

### Matriz de Mensajes Pre-Completados:

1. **Betania IV — Ángulo A (Ticket de entrada)**:
   - **Código**: `BIV-ADS-A1`
   - **Enlace**:
     `https://wa.me/59898712064?text=Hola%20ZAGU%C3%81N%2C%20consulto%20por%20Betania%20IV%20desde%20USD%2079.800%20(c%C3%B3digo%20BIV-ADS-A1).%20Mi%20nombre%20es`

2. **Betania IV — Ángulo B (Tipologías)**:
   - **Código**: `BIV-ADS-B1`
   - **Enlace**:
     `https://wa.me/59898712064?text=Hola%20ZAGU%C3%81N%2C%20consulto%20por%20tipolog%C3%ADas%20de%20Betania%20IV%20(c%C3%B3digo%20BIV-ADS-B1).%20Mi%20nombre%20es`

3. **Betania IV — Ángulo C (Avance de obra)**:
   - **Código**: `BIV-ADS-C1`
   - **Enlace**:
     `https://wa.me/59898712064?text=Hola%20ZAGU%C3%81N%2C%20consulto%20por%20avance%20de%20obra%20Betania%20IV%20(c%C3%B3digo%20BIV-ADS-C1).%20Mi%20nombre%20es`

4. **EVE Tower — Ángulo A (Ticket y financiación)**:
   - **Código**: `EVE-ADS-A1`
   - **Enlace**:
     `https://wa.me/59898712064?text=Hola%20ZAGU%C3%81N%2C%20consulto%20por%20la%20financiaci%C3%B3n%20en%20obra%20de%20EVE%20Tower%20(c%C3%B3digo%20EVE-ADS-A1).%20Mi%20nombre%20es`

5. **EVE Tower — Ángulo B (Orientaciones y plantas)**:
   - **Código**: `EVE-ADS-B1`
   - **Enlace**:
     `https://wa.me/59898712064?text=Hola%20ZAGU%C3%81N%2C%20consulto%20por%20orientaciones%20de%20EVE%20Tower%20(c%C3%B3digo%20EVE-ADS-B1).%20Mi%20nombre%20es`

6. **EVE Tower — Ángulo C (Avance de obra)**:
   - **Código**: `EVE-ADS-C1`
   - **Enlace**:
     `https://wa.me/59898712064?text=Hola%20ZAGU%C3%81N%2C%20consulto%20por%20avance%20de%20obra%20EVE%20Tower%20(c%C3%B3digo%20EVE-ADS-C1).%20Mi%20nombre%20es`

7. **Golden Rise — Ángulo A (Condiciones de pago)**:
   - **Código**: `GR-ADS-A1`
   - **Enlace**:
     `https://wa.me/59898712064?text=Hola%20ZAGU%C3%81N%2C%20consulto%20por%20Golden%20Rise%20y%20condiciones%20de%20pago%20(c%C3%B3digo%20GR-ADS-A1).%20Mi%20nombre%20es`

8. **Golden Rise — Ángulo B (Plantas y amenities)**:
   - **Código**: `GR-ADS-B1`
   - **Enlace**:
     `https://wa.me/59898712064?text=Hola%20ZAGU%C3%81N%2C%20consulto%20por%20plantas%20de%20Golden%20Rise%20(c%C3%B3digo%20GR-ADS-B1).%20Mi%20nombre%20es`

9. **Golden Rise — Ángulo C (Avance de obra)**:
   - **Código**: `GR-ADS-C1`
   - **Enlace**:
     `https://wa.me/59898712064?text=Hola%20ZAGU%C3%81N%2C%20consulto%20por%20avance%20Golden%20Rise%20(c%C3%B3digo%20GR-ADS-C1).%20Mi%20nombre%20es`

10. **Inversión Internacional (Regional / Extranjeros)**:
    - **Código**: `INV-ADS-D1`
    - **Enlace**:
      `https://wa.me/59898712064?text=Hola%20ZAGU%C3%81N%2C%20consulto%20por%20inversi%C3%B3n%20en%20pozo%20en%20Uruguay%20(c%C3%B3digo%20INV-ADS-D1).%20Mi%20nombre%20es`
