// Cliente de ElevenLabs — Batch Calling (Conversational AI).
// Docs: https://elevenlabs.io/docs/agents-platform/phone-numbers/batch-calls

const BASE = 'https://api.elevenlabs.io/v1';
const TIMEOUT_MS = 10_000;

export interface BatchRecipient {
  phone_number: string;
  /** variables dinámicas inyectadas en el prompt del agente (nombre, ultimo_informe, oferta_url...) */
  dynamic_variables: Record<string, string | number>;
}

// fetch con timeout; en error de red/timeout o respuesta !ok, loguea el detalle
// en servidor y lanza un error GENÉRICO (nunca propaga el cuerpo del tercero).
async function elFetch(path: string, body: unknown): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.error(`[elevenlabs] ${path} -> ${res.status}: ${(await res.text()).slice(0, 500)}`);
      throw new Error('elevenlabs_error');
    }
    return res.json();
  } catch (e) {
    if (e instanceof Error && e.message !== 'elevenlabs_error') {
      console.error(`[elevenlabs] ${path} request failed:`, e.message);
      throw new Error('elevenlabs_error');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/** Lanza una campaña de llamadas outbound con el agente configurado. */
export async function submitBatchCall(opts: { callName: string; recipients: BatchRecipient[] }): Promise<{ id: string }> {
  const data = await elFetch('/convai/batch-calling/submit', {
    call_name: opts.callName,
    agent_id: process.env.ELEVENLABS_AGENT_ID,
    agent_phone_number_id: process.env.ELEVENLABS_PHONE_NUMBER_ID,
    recipients: opts.recipients.map((r) => ({
      phone_number: r.phone_number,
      conversation_initiation_client_data: { dynamic_variables: r.dynamic_variables },
    })),
  });
  return data as { id: string };
}

/** Lanza UNA llamada outbound (prueba) vía Twilio conectado en ElevenLabs. */
export async function placeOutboundCall(opts: {
  toNumber: string;
  dynamicVariables: Record<string, string | number>;
}): Promise<unknown> {
  return elFetch('/convai/twilio/outbound-call', {
    agent_id: process.env.ELEVENLABS_AGENT_ID,
    agent_phone_number_id: process.env.ELEVENLABS_PHONE_NUMBER_ID,
    to_number: opts.toNumber,
    conversation_initiation_client_data: { dynamic_variables: opts.dynamicVariables },
  });
}
