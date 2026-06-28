# DESIGN.md — eInforma · Agente de voz (POC)

Sistema de diseño de este proyecto. Lo carga `/codexia-design-directive` antes de
cualquier trabajo visual. Base: **design system ganador de Codexia** (el mismo de
`portal-cliente`, referencias Linear / Vercel / Stripe). Donde este archivo calle,
aplica el `<codexia_design_system>` de la skill.

> **Marca:** este POC lo construye Codexia, así que la base es el sistema Codexia
> (azul `#0658f6`, Geist, tema claro premium). Si eInforma facilita su marca oficial
> (informa.es), sus tokens **sobrescriben** los de aquí. Confirmar con David.

---

## Producto y audiencia

- **Qué es:** panel interno de seguimiento del agente de voz. El equipo de eInforma
  (y Codexia) ve campañas, llamadas, grabaciones, transcripciones y resultados; y
  lanza/prueba llamadas.
- **Audiencia:** profesional, no técnica. Quiere ver de un vistazo qué pasó en cada
  llamada y cómo va la conversión.
- **Tipo de proyecto (SOP-04):** **Dashboard interno → shadcn solamente, sin
  animación gratuita.** Densidad de datos, claridad, cero adornos.
- **Dispositivo:** **desktop-first** (herramienta de oficina). Responsive a tablet;
  el móvil no es el caso principal.

## Esencia

Herramienta de **inteligencia de negocio**: rigor, confianza, claridad. Premium y
minimalista al estilo Linear/Vercel. Nada lúdico, nada "marketing".

---

## Color — sistema Codexia (tokens)

Tema **claro** (NO el dark zinc/emerald actual — eso se migra en la pasada de UX).

| Token | Hex | Uso |
|---|---|---|
| `--color-bg` | `#FFFFFF` | Fondo de app |
| `--color-fg` | `#111111` | Texto principal (**nunca `#000`**) |
| `--color-surface` | `#F5F5F5` | Superficies / tarjetas (portal usa `#f4f4f5`) |
| `--color-muted` | `#888888` | Texto secundario / labels (portal usa `#71717a`) |
| `--color-border` | `rgba(0,0,0,0.08)` | Bordes hairline; sólido `#e4e4e7` |
| **`--color-cta`** | `#0658f6` | **Azul Codexia** — CTAs, foco, enlaces, datos clave |
| `--accent-wash` | `#EBF0FF` | Fondos suaves del azul, chips, destacados |

**Semánticos** (separados del acento; tonos sobrios, contraste AA, NO saturados):

| Estado (resultado) | Hex | Uso |
|---|---|---|
| Conversión (Salida 1) | `#0a7d3c` | Éxito |
| Email (Salida 2) | `#0658f6` | Info — reusa el azul Codexia |
| Transferido (Salida 3) | `#b25a00` | Atención |
| No interesado / sin contacto (4) | `#888888` | Neutro |

> Regla: cada resultado se muestra como **pill = color semántico + texto** (nunca
> solo color). Máximo de saturación bajo; jerarquía por encima de variedad.

---

## Tipografía — sistema Codexia

| Rol | Familia | Notas |
|---|---|---|
| Display / headings | **Geist** | Peso 600, tracking negativo (h1 ≈ `-0.035em`, h2 ≈ `-0.025em`) |
| Body / UI | **Geist** | 16px base, interlineado ≈1.6 |
| Datos / mono | **JetBrains Mono** | Métricas, IDs, teléfonos, duraciones, eyebrows, status labels → `tabular-nums` |

- Máximo **2 familias** (Geist + JetBrains Mono). Cargar con `next/font` (sin CDN).
- Eyebrows / labels de estado en mono, uppercase, `letter-spacing: 0.12em`.
- Fallback de Geist: Inter Display (solo si Geist no está disponible). Evitar
  Inter/Roboto/Arial como display.

## Forma — radius, sombra, iconos, motion

- **Radius:** `8px` estándar · `12px` contenedores grandes · `4px` inputs · `999px` pills.
- **Sombra:** ninguna o muy sutil — `0 1px 3px rgba(0,0,0,0.04)`. Sin neumorphism/glassmorphism.
- **Iconos:** **Lucide**, stroke 1.5–2, tamaño consistente.
- **Motion:** micro-interacciones sutiles. `fade-up` al cargar (~0.3s ease-out),
  `pulse` en indicadores en vivo (LiveRefresher). Nada de sparkles/confetti/parallax.

---

## Layout

- **Anchos:** contenedor `1280px`; columna de dashboard `960px`; lectura `680px`.
- **Shell:** topbar persistente (Dashboard · Llamadas · Cargar · Probar). La actual
  vale; restilar con tokens (fondo claro, borde hairline, `backdrop-blur` opcional).
- **Dashboard:** resumen antes que detalle. Tarjetas de métrica arriba (contactados,
  conversiones, tasa, duración media — números con `tabular-nums`), tabla de llamadas
  recientes debajo.
- **Llamadas:** cada llamada como fila/tarjeta con pill de resultado, reproductor de
  grabación y transcripción plegable.
- **Densidad:** panel, no landing. Espaciado generoso, sin heros gigantes. El azul se
  reserva para acción/dato clave, no para todo.

## Componentes

**shadcn/ui** como base (Button, Card, Table, Dialog, Tabs, Form), **restilado** con
estos tokens — nunca el look vanilla (sin botones azul-default ni radios estándar).
Sin Aceternity/Magic UI: es un dashboard interno.

## Copy

- Español, **tuteo** (tú), consistente. Directo y concreto.
- Sin signos de exclamación. Sin emojis. Sin jerga corporativa.
- CTAs: imperativo, máx. 3 palabras ("Lanzar campaña", "Probar agente", "Ver transcripción").
- Títulos: qué es / qué hace. Datos de relleno realistas (informes como "Telefónica",
  CIFs verosímiles). Nunca "Lorem ipsum".

## Accesibilidad

- Contraste WCAG **AA**. Foco visible en todo interactivo.
- Labels en formularios (no solo placeholder). Targets ≥ 44×44px en móvil.
- Ninguna información solo por color (pill = color + texto).

---

## Pasada de UX/UI (pendiente) — backlog

Lo funcional está; lo visual aún usa un dark genérico. Trabajo previsto:
1. **Migrar de dark (zinc/emerald) → tema claro Codexia** con estos tokens.
2. Tipografía Geist + JetBrains Mono vía `next/font`.
3. Métricas con `tabular-nums` y jerarquía resumen → detalle.
4. Pills de resultado: color semántico + texto + icono Lucide.
5. Estados que faltan: **vacío, cargando, error** en cada pantalla.
6. Restilar shadcn con los tokens (nada de look vanilla).
7. Pasar el **quality gate (SOP-07)** y el test de los 5 segundos antes de enseñar.
8. Confirmar con David si aplicamos la marca oficial de eInforma como override.
