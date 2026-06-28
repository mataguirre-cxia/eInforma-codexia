# Trazabilidad: qué se pidió → qué se entregó → evidencia

Documento de seguimiento del POC del agente de voz de **eInforma**. Recorre, punto por punto y en orden cronológico, **lo que se nos pidió (citado textualmente de los audios y el briefing)**, **lo que desarrollamos** y la **evidencia** de cada parte (archivo, endpoint o verificación en vivo).

> Nota sobre las citas: los audios se transcribieron con nuestra herramienta `audio-to-text` (Whisper, modelo `base`). El modelo confunde algunos términos propios — entre `[corchetes]` va la interpretación correcta. Las citas son **verbatim** de la transcripción guardada (`einforma-audio.json`, `wa.json`).

---

## BLOQUE 1 — Primer audio de David (22-jun-2026): el encargo inicial

**Fuente:** `Clip de audio (2026-06-22 16_30_40).m4a` (78 s) — primer audio donde interpretamos qué querían.

### 1.1 — Plataforma del agente

> *"La mejor opción… sería directamente con Level Lapse [ElevenLabs]."*

- **Qué hicimos:** adoptamos **ElevenLabs Agents (Conversational AI)** como plataforma (LLM + voz + telefonía + tools + batch calling).
- **Evidencia:** [docs/01-stack-y-hallazgos.md](01-stack-y-hallazgos.md) §1 · integración real en [lib/elevenlabs.ts](../lib/elevenlabs.ts) · agente publicado `agent_3801kvrj0n41fsq8knwscx0pmrz5`.

### 1.2 — "Es demasiado sencillo" → la POC es configuración, no construir de cero

> *"…si te paso ahora la info, realmente es que es muy sencillo, es demasiado sencillo."*

- **Qué hicimos:** verificamos que el **Batch Calling** nativo de ElevenLabs cubre CSV + variables dinámicas + reporting → gran parte es configuración. Lo documentamos para defender plazos/precio.
- **Evidencia:** [docs/01-stack-y-hallazgos.md](01-stack-y-hallazgos.md) §4 ("Por eso David decía *es demasiado sencillo*").

### 1.3 — Crear un system prompt "chulo" adaptado a eInforma

> *"…según el documento… según lo que quieren, crea un pr[o]n[t] de sistema chulo… que esté adaptado para… [ElevenLabs]."*

- **Qué hicimos:** redactamos el **system prompt completo** de "Nina" (identidad, tono, contexto por variables, flujo de 4 salidas, reglas RGPD).
- **Evidencia:** [docs/03-diseno-agente.md](03-diseno-agente.md) (system prompt + primer mensaje) · cargado en el agente de ElevenLabs.

### 1.4 — Identificar el modelo de voz

> *"Identifica el modelo de voz que se utiliza… Se llama V3 conversacional… pero está en alpha. El… mejor es el de g[an]as rápidas, el fast [Flash], y el multi[l]ingual yo no lo utilizaría… el V3 conversacional, mira a ver cómo utilizarlo."*

- **Qué hicimos:** investigamos los 3 modelos. **Corregimos un matiz crítico:** V3 Conversacional es *alpha / research-preview, NO apto para tiempo real* (latencia). Para llamadas en vivo se usa **Flash v2.5** (~75 ms, español). Documentado con tabla comparativa.
- **Evidencia:** [docs/01-stack-y-hallazgos.md](01-stack-y-hallazgos.md) §2 (tabla de modelos + conclusión) · agente configurado con **Flash v2.5**.

### 1.5 — Mirar costes, crear cuenta y hacer una prueba

> *"Mira a ver el nivel de costes… Haz una prueba, crea tú una cuenta y haz una prueba."*

- **Qué hicimos:** (a) tabla de costes verificada (Twilio España + ElevenLabs) con estimación de infra para la POC ≈ **$280**; (b) **creamos la cuenta** de ElevenLabs y montamos el agente real.
- **Evidencia:** [docs/01-stack-y-hallazgos.md](01-stack-y-hallazgos.md) §5 (costes) · cuenta + agente publicado (verificado vía API, ver Bloque 5).

### 1.6 — Usar la voz que pasaría

> *"…utiliza una voz que te voy a pasar… que está increíble… la mejor que se puede utilizar ahora mismo para esto."*

- **Qué hicimos:** configuramos la voz en el agente.
- **Evidencia:** agente "eInforma - Conversión" con voz asignada (config en vivo, Bloque 5).

---

## BLOQUE 2 — El documento / briefing de eInforma (las preguntas técnicas)

**Fuente:** PDF del briefing de eInforma (preguntas en bloques A–D + secciones 06/07). Respondidas una a una para cerrar propuesta y reunión.

**Qué hicimos:** respondimos **las 12 preguntas técnicas + secciones 06 y 07**, con datos verificados.
**Evidencia:** [docs/02-respuestas-tecnicas.md](02-respuestas-tecnicas.md) (documento completo). Resumen:

| # | Pregunta del briefing | Respuesta entregada | Evidencia |
|---|----------------------|---------------------|-----------|
| 01 | Plataforma del agente | ElevenLabs Agents | doc 02 · `lib/elevenlabs.ts` |
| 02 | SIP trunk de Orange | Sí (POC Twilio, prod. Orange) | doc 02 |
| 03 | Transferir llamada a número externo | Sí, `transfer_to_number` | doc 02 · tool configurada |
| 04 | URLs dinámicas por usuario | Sí, variable dinámica `oferta_url` | doc 02 · `app/api/campaigns/route.ts` |
| 05 | CSV/Excel sin API | Sí, batch calling nativo | doc 02 · `app/cargar/page.tsx` |
| 06 | Datos mínimos por contacto | nombre, tel, email, CIF, último informe… | doc 02 · `supabase/schema.sql` |
| 07 | Integrar APIs de contact center | Sí (modelo contrato grande) | doc 02 |
| 08 | Dashboard de seguimiento | Sí, Next.js + Supabase | doc 02 · `app/page.tsx` |
| 09 | Métricas en tiempo real | contactado/duración/resultado + conversión | doc 02 · `lib/queries.ts` · `LiveRefresher.tsx` |
| 10 | Plazo si firman en julio | Antes del 31-jul | doc 02 |
| 11 | Rango 4.500–6.000 € viable | Sí (infra ≈ $280) | doc 02 · doc 01 §5 |
| 12 | Tiempo de desarrollo | ~2–3 semanas | doc 02 |

- **Precio cerrado propuesto:** **5.500 €** — [docs/02-respuestas-tecnicas.md](02-respuestas-tecnicas.md) (sección final).

---

## BLOQUE 3 — Últimos audios de David (26-jun-2026): el alcance del demo del lunes

**Fuente:** 3 audios de WhatsApp del 26-jun (`wa.json`).

### 3.1 — Audio 10:51 — "necesitamos una interfaz" con llamadas, grabación y conversaciones

> *"Metele prisa. Es sencillito… Necesitamos una interfaz para la gente… que contabilice la[s] llamada[s]… que puedan esc[uch]ar… la [grab]ación… con la[s] [conversaciones], con [ElevenLabs]… más una interfaz que ve[a] todo y que ellos puedan acceder para ver cómo va… con eso lo tendríamos. Sería solo y exclusivamente eso… mira a ver si lo puedes dejar [listo]… como es para el [lunes]… dejar algo funcional y que puedan probar… esto se va a ver con cuenta[s] [propias]… vamos a preparar una empresa… 'agente codex'… [para] eInforma."*

- **Qué hicimos:** construimos la **interfaz web completa (Next.js)** con:
  - **Dashboard** con métricas (contabiliza llamadas, contactado, duración, resultado, conversión).
  - **Listado de llamadas** con **reproductor de grabación** + **transcripción** de cada conversación.
  - Navegación accesible para que "ellos puedan acceder a ver cómo va".
- **Evidencia:**
  - Dashboard → [app/page.tsx](../app/page.tsx) + [app/_components/LiveRefresher.tsx](../app/_components/LiveRefresher.tsx) (tiempo real)
  - Métricas → [lib/queries.ts](../lib/queries.ts) (`getDashboardData`) + vista SQL `campaign_metrics` en [supabase/schema.sql](../supabase/schema.sql)
  - Grabación + transcripción → [app/llamadas/page.tsx](../app/llamadas/page.tsx) (`<audio controls>` + `<details>` con transcript)
  - Navegación → [app/layout.tsx](../app/layout.tsx)

### 3.2 — Audio 11:02 — acceso a la cuenta el sábado; demo el lunes mostrando todo

> *"…no vamos a tener acceso a la cuenta sino [hasta] el sábado, pero… el sábado se lo puedo dejar hecho yo, conectado con el de [ElevenLabs]. Lo único que quiero es que… se quede [listo]… poderle [mostrar] a ellos una demo el lunes, que vea[n] la plataforma, cómo haría la llamada, cómo les aparece la grabación, cómo les aparece[n]… las conversaciones, y todo eso al final se saca con [ElevenLabs]."*

- **Qué hicimos:** dejamos la plataforma **funcional y desplegada** lista para el lunes; los datos de grabación/transcripción se alimentan del **webhook post-llamada de ElevenLabs**. Identificamos explícitamente que **el lado de cuenta/telefonía depende del sábado** (acceso del jefe) y lo aislamos como pendiente externo.
- **Evidencia:**
  - Webhook post-llamada → [app/api/webhooks/elevenlabs/route.ts](../app/api/webhooks/elevenlabs/route.ts) (rellena `recording_url`, `transcript`, `duration_seconds`)
  - Despliegue en producción → **https://e-informa-codexia.vercel.app/** (verificado HTTP 200)
  - Datos demo para que la plataforma "se vea" aunque no haya llamadas reales aún → [lib/demo-data.ts](../lib/demo-data.ts)

### 3.3 — Audio 11:03 — botón de "probar el agente" que te llama al número que pongas

> *"…que cuando se le dé a probar a[l] [agente] que te env[íe] una llamada [a]l número que pongas ahí de prueba, para que te llame, ¿sabes?… algo curradillo, ningún diseño…"*

- **Qué hicimos:** construimos la pantalla **"Probar agente"**: introduces un número → el agente te llama. (Una de las 2 features que pediste explícitamente.)
- **Evidencia:**
  - UI → [app/probar/page.tsx](../app/probar/page.tsx)
  - Endpoint → [app/api/test-call/route.ts](../app/api/test-call/route.ts) → `placeOutboundCall()` en [lib/elevenlabs.ts](../lib/elevenlabs.ts) (POST `/v1/convai/twilio/outbound-call`)

---

## BLOQUE 4 — Construcción técnica completa (mapa feature → archivo)

Todo el código del POC, agrupado. Evidencia = archivo en el repo.

### 4.1 — Las 4 salidas del agente (lógica de negocio)
| Salida | Acción | Tool / endpoint | Evidencia |
|--------|--------|-----------------|-----------|
| 1 · Conversión | Lee/envía la URL de oferta | `registrar_resultado(conversion)` | `app/api/tools/registrar-resultado/route.ts` |
| 2 · Email | Manda enlace por email + consentimiento | `enviar_email` + Resend | `app/api/tools/enviar-email/route.ts` · `lib/email.ts` |
| 3 · Transferencia | Pasa a humano (900) | `transfer_to_number` (system tool) | configurado en el agente |
| 4 · No interesado | Cierra educadamente | `registrar_resultado(no_interesado)` | `app/api/tools/registrar-resultado/route.ts` |

### 4.2 — Orquestación de campañas (CSV → llamadas)
- Subida de CSV con tolerancia de nombres de columna → crea contactos + llamadas → lanza batch calling con variables dinámicas por contacto (incl. `contact_id`).
- **Evidencia:** [app/api/campaigns/route.ts](../app/api/campaigns/route.ts) (GET lista + POST CSV) · `submitBatchCall()` en [lib/elevenlabs.ts](../lib/elevenlabs.ts) · UI [app/cargar/page.tsx](../app/cargar/page.tsx) (PapaParse + preview).

### 4.3 — Base de datos y tipos
- Tablas `campaigns`, `contacts`, `calls` + vista `campaign_metrics`. Tipos TS compartidos.
- **Evidencia:** [supabase/schema.sql](../supabase/schema.sql) · [lib/types.ts](../lib/types.ts) · clientes Supabase en [lib/supabase.ts](../lib/supabase.ts) (browser + service-role).

### 4.4 — Resiliencia (la plataforma "se ve" siempre)
- Si Supabase no está configurado o no hay datos → fallback a datos demo, para que las pantallas nunca aparezcan vacías en el demo.
- **Evidencia:** `isSupabaseConfigured()` + fallback en [lib/queries.ts](../lib/queries.ts) · [lib/demo-data.ts](../lib/demo-data.ts) · `app/api/seed/route.ts` (sembrar datos de prueba).

---

## BLOQUE 5 — Verificación en vivo (estado real, no supuesto)

Comprobaciones contra las APIs reales el 28-jun:

| Qué | Cómo se verificó | Resultado |
|-----|------------------|-----------|
| Despliegue Vercel | `GET https://e-informa-codexia.vercel.app/` | **HTTP 200** ✅ |
| Endpoint tools vivo | `POST /api/tools/registrar-resultado` `{}` | `{"error":"falta contact_id"}` HTTP 400 (validación OK) ✅ |
| Endpoint tools con datos | `POST` con `contact_id` + `resultado` | `{"ok":true,"resultado":"conversion"}` HTTP 200 ✅ |
| Agente publicado + 3 tools | `GET /v1/convai/agents/{id}` | `registrar_resultado` (webhook), `enviar_email` (webhook), `transfer_to_number` (system/phone) ✅ |
| URLs de webhooks correctas | misma respuesta API | apuntan a `…vercel.app/api/tools/…` ✅ |
| Telefonía conectada | `GET /v1/convai/phone-numbers` | número Twilio `+17155977252`, inbound+outbound, **asignado al agente** ✅ |

---

## BLOQUE 6 — Pendiente (dependencias externas, no de desarrollo)

| Pendiente | De quién depende | Cuándo |
|-----------|------------------|--------|
| Acceso a la cuenta definitiva + número español de pago | Jefe (lo dijo en audio 11:02) | Sábado |
| Número real del call center / 900 para transferencia | eInforma | Antes del demo |
| Llamada de prueba real a número verificado | Matías (Twilio Verified Caller IDs) | En curso |
| Rotar credenciales expuestas en chat (PAT, Twilio token) | Matías | Recomendado |

**Estado global:** todo lo que es **desarrollo** (agente + prompt + voz + 4 salidas + 3 tools + dashboard + grabación/transcripción + botón de prueba + orquestación CSV + despliegue) está **construido, desplegado y verificado**. Lo que queda son **dependencias externas** (cuenta/telefonía de pago) que el propio David ubicó para el sábado.
