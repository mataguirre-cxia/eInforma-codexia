# eInforma — Agente de voz IA (POC)

Proyecto para **eInforma / Informa D&B** (grupo CESCE): agente de voz con IA que llama (outbound)
a usuarios freemium para convertirlos a pago. Cliente de Codexia.

> Documento vivo. Origen: briefing técnico de Sebastián (CSO) + indicaciones de David (audio/Slack, jun 2026).

## Qué hace el agente (resumen)
Llama a un usuario que consultó informes gratis, con **contexto personalizado** (nombre + informes vistos),
le ofrece un **upgrade con URL personalizada**, y gestiona **4 salidas**:
1. ✅ Acepta y accede a la URL (conversión).
2. 📧 Acepta recibir el enlace por email.
3. 📞 Pide hablar con humano → transferencia al call center (900).
4. ❌ No interesado → registra y cierra.

## Stack recomendado (decidido tras investigación — ver [docs/01-stack-y-hallazgos.md](docs/01-stack-y-hallazgos.md))

| Capa | Tecnología | Notas |
|------|-----------|-------|
| **Plataforma del agente** | **ElevenLabs Agents** (Conversational AI) | Lo indicó David. Une LLM + voz + telefonía + tools + **batch calling**. |
| **Modelo de voz** | **Eleven Flash v2.5** (tiempo real) | ⚠️ v3 Conversational es **alpha y NO real-time** (latencia). Flash v2.5 = ~75ms, 32 idiomas, español. v3 solo para pruebas de expresividad. |
| **LLM (cerebro)** | GPT-4o / Gemini Flash (elegible en el agente) | Conversación natural ES. Se factura aparte. |
| **Telefonía POC** | ElevenLabs **Batch Calling** + **Twilio** (número ES) | Sube CSV con variables dinámicas → lanza llamadas. |
| **Telefonía producción** | **SIP trunk de Orange** (de eInforma) | ElevenLabs soporta SIP estándar. |
| **Transferencia a humano** | system tool **`transfer_to_number`** | Al 900 vía SIP REFER / Twilio. |
| **URL dinámica por usuario** | **Variables dinámicas** por contacto (en el CSV) | El agente la inyecta y la menciona. |
| **Email (salida 2)** | Tool/webhook → Resend | El agente dispara el envío. |
| **Orquestación + Dashboard** | **Next.js + Supabase** (stack de Codexia) | Importa CSV, dispara batch, recoge resultados por webhook, métricas en vivo. |

**Clave:** el "envoltorio" (orquestación + dashboard + email) es el **mismo stack que Growlix** (Next.js + Supabase),
así que Codexia ya lo domina. Solo se añade la capa de voz (ElevenLabs) + telefonía (Twilio).

## Estructura del código
```
app/
  page.tsx                       # Dashboard (datos Supabase, fallback demo) + Realtime
  cargar/page.tsx                # Subida de CSV → crea campaña + lanza batch calling
  _components/LiveRefresher.tsx  # Suscripción Realtime → refresca el dashboard
  api/
    campaigns/route.ts           # GET lista · POST crea campaña + dispara batch
    tools/registrar-resultado/   # Tool del agente: registra desenlace de la llamada
    tools/enviar-email/          # Tool del agente: Salida 2 (envía enlace por email)
    webhooks/elevenlabs/         # Webhook post-llamada → actualiza Supabase
    seed/route.ts                # POST → datos demo para el dashboard
lib/
  supabase.ts  elevenlabs.ts  email.ts  queries.ts  demo-data.ts  types.ts
supabase/schema.sql              # campaigns + contacts + calls + vista de métricas
docs/                            # 01 stack · 02 respuestas técnicas · 03 diseño agente
```

## Cómo correr
1. Copia `.env.example` → `.env.local` y rellena (Supabase obligatorio; ElevenLabs/Twilio/Resend opcionales).
2. Aplica `supabase/schema.sql` en tu proyecto Supabase.
3. `npm run dev`. Sin Supabase, el dashboard muestra **datos demo**.
4. (Opcional) `POST /api/seed` para poblar datos demo reales en Supabase.

## Endpoints para configurar las Tools del agente en ElevenLabs
- `registrar_resultado` → `POST {APP_URL}/api/tools/registrar-resultado`  body `{ contact_id, resultado }`
- `enviar_email` → `POST {APP_URL}/api/tools/enviar-email`  body `{ contact_id }`
- `transfer_to_number` → tool de sistema de ElevenLabs (al 900 de eInforma)

## Estado
- ✅ Investigación de tecnologías (Fase A) — verificada con fuentes oficiales.
- ⏳ Pendiente: prueba real de costes/voz (crear cuenta ElevenLabs + Twilio), build del proyecto.
