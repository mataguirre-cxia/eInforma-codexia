# CLAUDE.md — eInforma · Agente de voz (POC)

Instrucciones para Claude Code y devs en este proyecto.

POC para **eInforma (informa.es)**: un agente de voz outbound ("Nina", ElevenLabs Agents)
que llama a usuarios freemium para convertirlos a pago, con un dashboard de seguimiento.
Contexto, decisiones y trazabilidad del encargo en [`docs/`](docs/).

---

## Project Stack

**Frontend/Backend**: Next.js 15.5 App Router (TypeScript, strict)
**Base de datos**: Supabase PostgreSQL (tablas `campaigns`, `contacts`, `calls` + vista `campaign_metrics`)
**Agente de voz**: ElevenLabs Agents (Conversational AI) — modelo **Flash v2.5** (tiempo real)
**Telefonía**: Twilio (número POC) conectado dentro de ElevenLabs; producción → SIP de Orange
**Orquestación**: ElevenLabs **Batch Calling** (CSV → llamadas con variables dinámicas)
**Email**: Resend (Salida 2)
**CSV**: PapaParse (cliente)
**Styling**: Tailwind CSS 4
**Deploy**: Vercel — https://e-informa-codexia.vercel.app
**Package Manager**: `npm`

**Estructura del proyecto**:
```
eInforma-codexia/
├── app/
│   ├── page.tsx                       # Dashboard (métricas + llamadas recientes)
│   ├── llamadas/page.tsx              # Listado con grabación (<audio>) + transcripción
│   ├── cargar/page.tsx                # Subida de CSV → campaña (PapaParse)
│   ├── probar/page.tsx                # "Probar agente": un número → el agente llama
│   ├── _components/LiveRefresher.tsx  # Supabase Realtime → refresca el dashboard
│   └── api/
│       ├── campaigns/route.ts         # GET lista · POST CSV → contactos → batch calling
│       ├── test-call/route.ts         # POST → placeOutboundCall (llamada de prueba)
│       ├── tools/
│       │   ├── registrar-resultado/   # WEBHOOK del agente → guarda el desenlace
│       │   └── enviar-email/          # WEBHOOK del agente → email de oferta (Salida 2)
│       ├── webhooks/elevenlabs/       # WEBHOOK post-llamada → recording_url + transcript
│       └── seed/route.ts              # Sembrar datos demo
├── lib/
│   ├── supabase.ts        # supabase (browser anon) + supabaseAdmin() (service role, server)
│   ├── elevenlabs.ts      # submitBatchCall() · placeOutboundCall()
│   ├── email.ts           # enviarEmailOferta() vía Resend
│   ├── queries.ts         # getDashboardData / getCallsDetailed (con fallback a demo)
│   ├── demo-data.ts       # datos demo para que las pantallas siempre se vean
│   └── types.ts           # Resultado, Campaign, Contact, Call, CallDetail...
├── supabase/schema.sql    # Schema + vista de métricas
├── docs/                  # Investigación, respuestas técnicas, diseño del agente, trazabilidad
└── CLAUDE.md              # Este archivo
```

**Regla de package manager**: siempre `npm` (`npm install`, `npm install <pkg>`). Nunca `pnpm`/`yarn`. Commitear `package-lock.json` tras cambios de dependencias.

**Idioma**: documentación y este archivo en **español**; code comments y TypeScript en **inglés**; las skills (`.claude/skills/*`) en **inglés** (convención org).

**Git Workflow — NO Auto-Commit/Push**:
- ❌ NUNCA commitear/pushear/amend/force-push sin permiso explícito del usuario.
- ✅ Stagear, mostrar diff, esperar aprobación.

---

## Modelo de dominio

El POC es **mono-cliente** (eInforma); la unidad de trabajo es la **campaña**.

| Tabla | Responsabilidad |
|---|---|
| `campaigns` | Una tanda de llamadas (nombre, status, total_contacts) |
| `contacts` | Los freemium a llamar (nombre, teléfono, email, CIF, último informe, nº informes) |
| `calls` | Una llamada por contacto: resultado, contactado, duration, recording_url, transcript, elevenlabs_conversation_id |
| `campaign_metrics` (vista) | Agregados: contactados, conversiones, tasa, duración media |

**El agente "Nina"** (system prompt en [docs/03-diseno-agente.md](docs/03-diseno-agente.md)) gestiona **4 salidas**:

| Salida | Acción | Tool |
|---|---|---|
| 1 · Conversión | Da/lee la URL de oferta | `registrar_resultado(conversion)` |
| 2 · Email | Manda el enlace por email + consentimiento | `enviar_email` → Resend |
| 3 · Transferencia | Pasa a humano (call center / 900) | `transfer_to_number` (system tool) |
| 4 · No interesado | Cierra educadamente | `registrar_resultado(no_interesado)` |

**Variables dinámicas** (por contacto, vía batch calling — único dato que recibe el agente): `nombre`, `ultimo_informe`, `num_informes`, `oferta_url`, `precio_oferta`, `email`, `contact_id`.

---

## Security Skills — Cómo Cargarlos

### Skill base (SIEMPRE al inicio de sesión)
```
/codexia-secure-app
```
Obligatorio en cada sesión que toque código. Establece los principios globales no negociables.

### Skill de IA del proyecto
```
/einforma-voice-ai
```
Cárgalo siempre que toques el **agente, los webhooks de tools, el batch calling o el webhook post-llamada**. Define los límites de datos del agente de voz y la seguridad de los webhooks.

### Tabla de despacho por dominio

| Si estás tocando… | Carga este skill |
|---|---|
| Agente, tools (`/api/tools/*`), batch calling, webhook post-llamada | `/einforma-voice-ai` |
| Cualquier endpoint / Route Handler | `/codexia-secure-api` |
| Validación de input, CSV, contenido de transcripción que se renderiza | `/codexia-secure-io` |
| Datos de contacto (email, CIF, teléfono) y grabaciones/transcripciones | `/codexia-secure-pii` |
| Integraciones externas (ElevenLabs, Twilio, Resend) | `/codexia-secure-third-party` |
| Nuevas tablas Supabase / políticas RLS | `/codexia-secure-authz` |
| Cuando se añada login al dashboard | `/codexia-secure-auth` |
| Subida de ficheros (CSV de campaña) | `/codexia-secure-uploads` |
| **Diseño / UX-UI** de cualquier pantalla | `/codexia-design-directive` (+ `DESIGN.md`) |

### Skills por fase
| Fase | Cuándo | Skill |
|---|---|---|
| Threat model | Antes de una feature media/grande | `/codexia-threat-model` |
| Self-review | Antes de abrir PR | `/codexia-self-review` |
| Red team | Antes de un release / campaña real | `/codexia-red-team` |

### Receta de inicio de sesión
```
1. /codexia-secure-app          ← siempre, primero
2. /einforma-voice-ai           ← si tocas agente / webhooks / batch
3. /codexia-secure-[dominio]    ← por cada dominio adicional (ver tabla)
4. Features medianas/grandes:   /codexia-threat-model antes de codificar
```
Ante la duda de si un skill aplica: **cárgalo**. Contexto extra es barato; un default de seguridad omitido es caro.

---

## Security Gate — REGLA HARD (no negociable)

**Antes de escribir código, el primer output DEBE ser un bloque Security Gate Declaration:**
```
## Security Gate — [nombre de la tarea]
**Dominios tocados:** [agente/voz, api, io, pii, third-party, authz, uploads, auth]
**Skills cargadas:**
- codexia-secure-app (baseline — siempre)
- einforma-voice-ai — [si toca agente/webhooks/batch]
- codexia-secure-[dominio] — [razón en una línea]
**Threat model necesario:** sí / no — [justificación]
```
**Excepciones**: typos/texto estático, CSS puro sin lógica, documentación.

---

## Patrones de Código

### Webhook de tool del agente — secuencia objetivo
```typescript
// app/api/tools/*/route.ts — invocado por ElevenLabs
export async function POST(req: NextRequest) {
  try {
    // 1. Verificar firma/secreto de ElevenLabs (el endpoint es PÚBLICO) → 401 si no
    // 2. Validar body con Zod: contact_id (uuid), resultado (enum)
    // 3. Escribir SOLO la fila de ese contacto con el service-role client
    const sb = supabaseAdmin();
    // 4. Respuesta mínima
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
```
> Estado: `registrar-resultado`, `enviar-email` y `webhooks/elevenlabs` **verifican firma** (`lib/webhook-auth.ts`) y validan con **Zod**. La verificación se **exige cuando `WEBHOOK_SHARED_SECRET` está definido**; si no, no bloquea (posture POC) y lo registra. Definir el secreto + añadir la cabecera `x-webhook-secret` en cada tool de ElevenLabs antes de campañas reales.

### Clientes Supabase — cuál usar
```typescript
import { supabase } from '@/lib/supabase';        // navegador (anon) — componentes React
import { supabaseAdmin } from '@/lib/supabase';    // server (service role) — SOLO en API routes
// NUNCA usar supabaseAdmin() ni la service-role key en código accesible al cliente
```

### ElevenLabs — cliente
```typescript
import { submitBatchCall, placeOutboundCall } from '@/lib/elevenlabs';
// xi-api-key SIEMPRE desde process.env.ELEVENLABS_API_KEY (server-only)
// dynamic_variables = ÚNICO dato del contacto que llega al agente (no enviar CIF/internos)
```

### enviar_email — destino desde el contacto, no del body
```typescript
// Leer el email del contacto en Supabase server-side y enviar con EMAIL_FROM aprobado.
// NUNCA aceptar la dirección de destino desde el body del webhook.
```

---

## Security — No Negociables

### Agente de voz / Webhooks
- ✅ `/api/tools/*` y `/api/webhooks/elevenlabs` verifican la **firma/secreto de ElevenLabs** antes de escribir en DB.
- ✅ `contact_id` del body se valida (uuid) y la escritura se acota a esa fila.
- ✅ El system prompt se nutre **solo** de las variables dinámicas; el agente no inventa informes/precios/URLs.
- ✅ El interlocutor es input no confiable: el agente se mantiene en alcance (oferta + 4 salidas + RGPD).
- ❌ NUNCA aceptar el email de destino de `enviar_email` desde el body (usar el del contacto).
- ❌ NUNCA marcar a un número tomado directamente de input anónimo.
- ❌ NUNCA shipear Eleven v3 Conversacional como modelo en vivo (alpha, no tiempo real).

### Secretos
- ✅ `ELEVENLABS_API_KEY`, `TWILIO_AUTH_TOKEN`, `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` son **server-only**.
- ❌ NUNCA como `NEXT_PUBLIC_`. NUNCA en logs, URLs ni mensajes de error.

### PII (contactos + conversaciones)
- ✅ Email, CIF, teléfono, grabaciones y transcripciones: nunca en logs.
- ❌ NUNCA log con el contenido de `transcript` ni `recording_url`.

### API / IO
- ✅ Errores genéricos (sin stack traces ni internos). Validación en el server.
- ❌ NUNCA SQL por concatenación; NUNCA `eval`/`Function()`.
- ✅ La transcripción se renderiza como **texto escapado** (nunca como HTML).

### RGPD
- ✅ Solo se llama a usuarios con consentimiento de contacto comercial.
- ✅ "No volver a llamar" se registra y se respeta (nunca re-encolar).

---

## Regla de Auditoría de Alcance

**El scope de un ticket es un mínimo, no un máximo.** Antes de cerrar un fix con patrón repetible, grep en `app/`:
```bash
grep -rn "supabaseAdmin" app/                       # service role solo en server
grep -rn "NEXT_PUBLIC_" . | grep -iE "service|twilio|resend|elevenlabs_api"  # secretos mal expuestos
grep -rn "console.log" app/api/                      # ¿se loguea PII/transcript?
grep -rn "req.json" app/api/                         # ¿validación de input presente?
```
Si aparecen más instancias del mismo bug: corregirlas en el mismo PR.

---

## Workflow
```
0. Entender la tarea y qué dominios toca
1. Cargar /codexia-secure-app (+ /einforma-voice-ai si aplica) + dominios
2. Emitir Security Gate Declaration
3. Leer supabase/schema.sql y el endpoint/lib relevante antes de tocar
4. Escribir código
5. /codexia-self-review antes de abrir PR
```

## Pre-PR Checklist
- [ ] Security Gate Declaration presente
- [ ] Webhooks (`/api/tools/*`, `/api/webhooks/*`): firma de ElevenLabs verificada
- [ ] Input validado en el server (Zod); `contact_id` como uuid; `resultado` como enum
- [ ] `enviar_email` usa el email del contacto, no el del body
- [ ] Secretos server-only (ningún `NEXT_PUBLIC_` sensible)
- [ ] Sin PII/transcript/recording en logs
- [ ] Transcripción renderizada como texto escapado
- [ ] Variables dinámicas al agente: solo lo que la conversación necesita (sin CIF/internos)
- [ ] Errores genéricos
- [ ] Red flag grep: `NEXT_PUBLIC_…(SERVICE|TWILIO|RESEND|ELEVENLABS_API)`, `eval`, `dangerouslySetInnerHTML`

## Pre-Deploy / Antes de campaña real
- [ ] `/codexia-threat-model` si hay feature sensible nueva
- [ ] `/codexia-red-team` en el diff completo
- [ ] Webhooks autenticados (no se aceptan llamadas anónimas)
- [ ] Probado: POST no autenticado a un tool/webhook es rechazado
- [ ] Probado: el agente se mantiene en alcance ante input adversario del interlocutor
- [ ] Probado: resultado "no volver a llamar" no se re-marca

---

## Backlog de hardening (estado POC → producción)

**Ya implementado** (auditoría SOPs, jun-2026):
- ✅ **Auth**: login (email+password, Supabase Auth) + middleware que protege todas las páginas; registro cerrado (invitación). `lib/supabase/{server,client}.ts`, `middleware.ts`, `app/login`, `app/register`, `app/auth/actions.ts`.
- ✅ **Endpoints de operador** (`campaigns`, `test-call`, `seed`): exigen sesión (`getSessionUser`).
- ✅ **Webhooks** (`tools/*`, `webhooks/elevenlabs`): verifican firma (`lib/webhook-auth.ts`) si `WEBHOOK_SHARED_SECRET` está definido.
- ✅ **Zod** en todos los endpoints; `contact_id` validado como uuid; errores genéricos + log server-side.
- ✅ **`enviar_email`** envía solo al email del contacto (sin override del body).
- ✅ **secure-io en email**: escape de HTML + allowlist de esquema en la URL (`lib/email.ts`).
- ✅ **third-party**: timeouts + errores genéricos en ElevenLabs y Resend.
- ✅ **RLS**: `supabase/policies.sql` (ejecutar en el SQL Editor).
- ✅ **rate-limit** best-effort en `test-call` (`lib/rate-limit.ts`).

**Pendiente antes de campañas reales:**
1. **Activar la firma de webhooks**: definir `WEBHOOK_SHARED_SECRET` y añadir la cabecera `x-webhook-secret` en cada tool de ElevenLabs (sin esto, los webhooks no se verifican — solo se registra el aviso).
2. **Ejecutar `supabase/policies.sql`** en Supabase (RLS no se aplica solo).
3. **Rate limiting con Upstash Redis** (el actual es en memoria, por-instancia; no fiable en serverless).
4. **Auditoría**: tabla de audit log para acciones de operador y resultados.
5. **Replay protection** en webhooks (tolerancia de timestamp en la firma HMAC).
6. **Rotar credenciales** compartidas en chat durante el POC.
7. Crear los usuarios del equipo por invitación en Supabase Auth (no hay alta pública).

---

## Variables de Entorno

Ver [`.env.example`](.env.example). Requeridas (nunca commitear `.env.local`):
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-only — NUNCA NEXT_PUBLIC_
# ElevenLabs (agente + batch + telefonía)
ELEVENLABS_API_KEY=                 # server-only
ELEVENLABS_AGENT_ID=
ELEVENLABS_PHONE_NUMBER_ID=
# Twilio (telefonía POC)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=                  # server-only
TWILIO_PHONE_NUMBER=+34...
# Transferencia a humano (Salida 3)
EINFORMA_CALLCENTER_NUMBER=+34900...
# Email (Salida 2)
RESEND_API_KEY=                     # server-only
EMAIL_FROM=eInforma <noreply@informa.es>
# Seguridad de webhooks (firma de tools + post-llamada)
WEBHOOK_SHARED_SECRET=              # server-only; si se define, los webhooks exigen x-webhook-secret
```

---

## Diseño / UX-UI

- Toda pantalla nueva o rediseño: cargar `/codexia-design-directive` y respetar [`DESIGN.md`](DESIGN.md) (identidad de marca de eInforma para este POC).
- Lo funcional está; la pasada visual es un paso aparte (ver `DESIGN.md`).

---

## Quick Reference — Skills (en `.claude/skills/`)

| Skill | Cuándo |
|---|---|
| `codexia-secure-app` | **Siempre** — baseline |
| `einforma-voice-ai` | Agente, tools, batch calling, webhook post-llamada |
| `codexia-secure-api` | Cualquier Route Handler |
| `codexia-secure-io` | Input, CSV, render de transcripción |
| `codexia-secure-pii` | Datos de contacto + grabaciones/transcripciones |
| `codexia-secure-third-party` | ElevenLabs, Twilio, Resend |
| `codexia-secure-authz` | RLS, tablas, roles |
| `codexia-secure-auth` | Cuando se añada login al dashboard |
| `codexia-secure-uploads` | CSV de campaña |
| `codexia-secure-admin` | Si aparece un panel de gestión privilegiado |
| `codexia-secure-multi-tenant` | Si el POC pasa a multi-cliente |
| `codexia-secure-payments` | Si se añade billing |
| `codexia-design-directive` | Diseño / UX-UI |
| `codexia-threat-model` | Antes de features medianas/grandes |
| `codexia-self-review` | Antes de abrir PR |
| `codexia-red-team` | Antes de release / campaña real |

---

## Compliance
- **RGPD**: aplica a datos de contacto y a las grabaciones/transcripciones. Llamadas solo con consentimiento de contacto comercial; respetar "no volver a llamar"; acordar retención de grabaciones con eInforma.
- Ante dudas de compliance o de arquitectura del contrato grande (SIP Orange, APIs de contact center), escalar a David antes de implementar.

## Quién Consultar
- **David** (CEO/CTO): arquitectura, seguridad, dirección, relación con eInforma.
- **Matías**: implementación, bugs, PRs.

---

**Última actualización**: 2026-06-28
**Next.js**: 15.5 · **Deploy**: Vercel
**Maintainer**: Matías
