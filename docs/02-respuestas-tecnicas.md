# Respuestas a las preguntas técnicas del briefing eInforma

Respuestas para que Sebastián cierre la propuesta y para la reunión del miércoles.
Datos verificados en [01-stack-y-hallazgos.md](01-stack-y-hallazgos.md).

---

## Bloque A — Capacidad técnica

**01. ¿Con qué plataforma construimos el agente de voz outbound?**
**ElevenLabs Agents (Conversational AI).** Une en una sola plataforma: el LLM (cerebro), la voz, la
telefonía (Twilio/SIP), las herramientas (transferencia, webhooks) y el **batch calling** outbound.
Es la opción que indicó David y la que mejor encaja con el caso.

**02. ¿Podemos integrar la llamada saliente con un SIP trunk de Orange?**
**Sí.** ElevenLabs Agents soporta SIP estándar (Twilio, Telnyx, Exotel, Plivo, etc.).
- **POC:** usamos **nuestra infraestructura** (Twilio + número español).
- **Contrato grande:** conectamos su **zip trunk de Orange** (las llamadas salen desde su número 900). No hay que construir nada nuevo, es configuración SIP.

**03. ¿Podemos transferir una llamada en curso a un número externo?**
**Sí.** Tool de sistema `transfer_to_number` (transfiere a número o SIP URI vía SIP REFER), manteniendo el contexto. Cubre la **Salida 3** (transferir al call center / 900).

**04. ¿Podemos generar y mencionar URLs dinámicas personalizadas por usuario?**
**Sí.** Cada contacto lleva su **variable dinámica** (ej. `oferta_url`) en la lista de batch calling; el agente la inyecta y la menciona en la conversación. La URL puede venir pre-generada en el fichero o generarla un webhook al vuelo.

---

## Bloque B — Datos e integración

**05. ¿Podemos trabajar con un CSV/Excel de entrada para la POC sin API?**
**Sí, de forma nativa.** El **Batch Calling** de ElevenLabs acepta directamente CSV/XLS con columnas de variables dinámicas. Flujo POC: eInforma nos pasa el fichero → ejecutamos → devolvemos resultados en el mismo formato. Sin integrar APIs.

**06. ¿Qué datos mínimos necesitamos por contacto?**
Imprescindibles: **nombre (de pila), teléfono, email, CIF, último(s) informe(s) consultado(s)**.
Para que suene natural y no genérico, idealmente también:
- El **informe concreto** más relevante que miró (ej. "Telefónica") — para el gancho.
- **Fecha del último acceso** y **nº de informes** consultados (urgencia/contexto).
- **Sector/actividad** de su empresa (derivable del CIF) — personaliza el tono.
- La **URL de oferta** y el **precio especial** a ofrecer.

**07. ¿Podemos integrarnos con sus APIs de contact center (contrato grande)?**
**Sí, viable.** ElevenLabs Agents permite tools/webhooks. Arquitectura: nuestro orquestador (Next.js)
consume sus endpoints (coger próximo contacto → lanzar llamada → devolver resultado), y las llamadas
salen por su SIP de Orange. Es el modelo objetivo del contrato grande.

---

## Bloque C — Dashboard y reporting

**08. ¿Tenemos dashboard de seguimiento?**
Lo construimos con **Next.js + Supabase** (stack que Codexia ya domina). Para el **miércoles**: llevamos
un **mockup/demo** de las pantallas. ElevenLabs ya da reporting básico del batch; encima montamos el
dashboard a medida que pidió Juan.

**09. ¿Qué métricas en tiempo real?**
Todas las que pide: **contactado sí/no, duración, y resultado** (conversión a URL / aceptó email /
transferido a humano / no interesado), además de tasa de conversión global. Se alimenta de los
**webhooks post-llamada** de ElevenLabs → Supabase → dashboard en vivo (Supabase Realtime).

---

## Bloque D — Plazos y precio

**10. Si firmamos en julio, ¿cuándo está lista la POC?**
**Viable antes del 31 de julio.** La mayor parte es **configuración** (agente + batch calling), no
desarrollo desde cero. Lo único a medida es la orquestación CSV y el dashboard.

**11. ¿Es viable el rango 4.500–6.000 €?**
**Sí, con margen.** La infraestructura real de la POC es **~$280** (ver cálculo en 01). El precio cubre
**diseño del agente, prompt, voz, orquestación, dashboard y entrega de resultados** — trabajo de ingeniería,
no coste de llamadas. El suelo de 4.500 € es defendible.

**12. ¿Tiempo de desarrollo desde la firma?**
**~2–3 semanas:**
- **Semana 1:** cuenta ElevenLabs + Twilio, agente (prompt + voz + 4 salidas), telefonía, transferencia.
- **Semana 2:** orquestación CSV→batch→resultados, dashboard, pruebas internas.
- **Semana 3 (buffer):** llamadas reales con su fichero, ajustes, entrega.

---

## Sección 07 — ¿Tenemos demos / proyectos similares?

- **¿Agentes de voz ya construidos?** Hay una base en ElevenLabs (el agente "Appointment Setter" que circuló por Slack). *(Confirmar con el equipo qué hay mostrable.)*
- **¿Proyectos de automatización relevantes?** **Sí: Growlix** — plataforma de generación de leads B2B con scraping multi-fuente, enriquecimiento con IA y **campañas de email automatizadas** (Next.js + Supabase + colas + IA). Demuestra capacidad real en automatización de comunicaciones, IA conversacional y escala (decenas de miles de leads).
- **¿Demo básica para el miércoles?** **Sí, recomendable:** montar un agente ElevenLabs con el prompt de eInforma + la voz indicada, con un número al que **Juan pueda llamar en vivo**. Es el argumento más potente.

---

## Precio cerrado propuesto para la POC
**5.500 €** (dentro del rango, por encima del suelo defendible de 4.500 €).
Incluye: diseño del agente y prompt, configuración de voz (Flash v2.5), telefonía POC, orquestación
CSV→llamadas→resultados, dashboard de seguimiento y entrega de resultados para 1.000–2.000 contactos.

## Qué llevar a la reunión del miércoles (sección 06 del briefing)
1. ✅ Diseño del escenario (datos, formato, proceso). 2. ✅ Flujo del agente (saludo, contexto, oferta, 4 salidas).
3. ✅ Infraestructura de llamadas (ElevenLabs + Twilio POC / Orange producción). 4. ✅ Precio cerrado: **5.500 €**.
5. ✅ Pantallas del dashboard (mockup/demo).
