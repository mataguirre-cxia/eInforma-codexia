# Stack y hallazgos de investigación (verificado)

Investigación en vivo (jun 2026) sobre ElevenLabs Agents + Twilio, porque David avisó *"ha cambiado en muy poco, investiga mucho"*. Todo con fuentes oficiales al final.

## 1. Plataforma del agente: ElevenLabs Agents (Conversational AI)
- Es una plataforma completa de agentes de voz: LLM + voz + telefonía + tools + **batch calling**, no solo TTS.
- Permite elegir el LLM (GPT-4o, Gemini, etc.) — se factura aparte.

## 2. Modelo de voz — ⚠️ matiz importante
| Modelo | Para qué | Veredicto para llamadas en vivo |
|--------|----------|---------------------------------|
| **Eleven v3 (Conversational)** | Máxima expresividad, audio tags, pausas | **Alpha / research-preview. NO está diseñado para tiempo real** (latencia). Solo para probar expresividad. |
| **Eleven Flash v2.5** | Tiempo real, ~75 ms, 32 idiomas (incl. español) | ✅ **El recomendado para el agente telefónico.** Es el modelo de la Agents Platform. |
| Multilingual v2 | Narración multilingüe de alta fidelidad | No para tiempo real. |

**Conclusión:** David apuntaba a v3 Conversational, pero para una **llamada en vivo la latencia es crítica** → se usa **Flash v2.5** como motor de voz. v3 Conversational se puede probar para medir si su expresividad compensa la latencia, pero **no es apto para producción de llamadas todavía**. (Esto es exactamente el tipo de cambio reciente que David pedía verificar.)

## 3. Telefonía
- **SIP trunking**: ElevenLabs es compatible con Twilio, Telnyx, Vonage, **Exotel**, Plivo y cualquier SIP estándar → el **zip trunk de Orange** de eInforma encaja para producción.
- **Outbound** nativo (Twilio o SIP).
- **Transferencia a humano**: system tool `transfer_to_number` (a número o SIP URI, vía SIP REFER) → cubre la Salida 3 (transferir al 900).

## 4. Batch Calling (clave para la POC)
- Subes una **lista CSV/XLS** de destinatarios con **variables dinámicas por contacto** (nombre, informes, URL única…).
- Lanza muchas llamadas outbound, con **monitoreo y reporting en tiempo real**.
- Esto cubre de un golpe: trabajar con CSV (Q5), URLs dinámicas (Q4), personalización (Q6) y parte del dashboard (Q8/Q9).
- Por eso David decía *"es demasiado sencillo"*: gran parte de la POC es **configuración**, no desarrollo desde cero.

## 5. Costes verificados (orientativos — confirmar con prueba real)

**Twilio España:**
- Número: ~$1.15/mes.
- Saliente a **móvil**: **$0.0486/min** · a fijo: $0.0178/min · entrante: $0.004/min.

**ElevenLabs Agents:**
- Minutos incluidos por plan: Pro 1.238 · Scale 3.738 · Business 12.375.
- Excedente: ~$0.08–0.12/min ($0.096 en Scale/Business).
- **LLM aparte** (pass-through; con GPT-4o-mini/Gemini Flash es barato).

### Estimación de coste de infra para la POC (1.500 contactos)
Supuestos: ~50% contesta, llamada media ~2,5 min → ~1.875 min de conversación.

| Concepto | Cálculo | Coste aprox. |
|----------|---------|--------------|
| ElevenLabs (minutos agente) | 1.875 min × ~$0.09 | ~$170 |
| Twilio (saliente móvil) | ~750 llamadas × 2,5 min × $0.0486 | ~$91 |
| LLM | ~750 conv. × ~$0.02 | ~$15 |
| Número Twilio | 1 mes | ~$1 |
| **Total infra POC** | | **~$280** |

➡️ **La infra es una fracción mínima del precio de la POC (4.500–6.000 €).** El precio se justifica por **diseño del agente, prompt, orquestación, dashboard y entrega** — no por el coste de las llamadas. Esto hace el suelo de 4.500 € totalmente defendible.

## Fuentes
- [ElevenLabs — SIP trunking](https://elevenlabs.io/docs/eleven-agents/phone-numbers/sip-trunking)
- [ElevenLabs — Transfer to number](https://elevenlabs.io/docs/agents-platform/customization/tools/system-tools/transfer-to-human)
- [ElevenLabs — Batch calling](https://elevenlabs.io/docs/agents-platform/phone-numbers/batch-calls)
- [ElevenLabs — Dynamic variables](https://elevenlabs.io/docs/agents-platform/customization/personalization/dynamic-variables)
- [ElevenLabs — Models (v3 / Flash v2.5)](https://elevenlabs.io/docs/overview/models)
- [ElevenLabs — Agents pricing](https://elevenlabs.io/pricing/agents)
- [Twilio — Voice pricing Spain](https://www.twilio.com/en-us/voice/pricing/es)
