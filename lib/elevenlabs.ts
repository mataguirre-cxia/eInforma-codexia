// Cliente de ElevenLabs — Batch Calling (Conversational AI).
// Docs: https://elevenlabs.io/docs/agents-platform/phone-numbers/batch-calls
// Nota: confirmar shapes exactos contra la API en vivo (cambian rápido — aviso de David).

const BASE = 'https://api.elevenlabs.io/v1';

export interface BatchRecipient {
  phone_number: string;
  /** variables dinámicas inyectadas en el prompt del agente (nombre, ultimo_informe, oferta_url...) */
  dynamic_variables: Record<string, string | number>;
}

/** Lanza una campaña de llamadas outbound con el agente configurado. */
export async function submitBatchCall(opts: {
  callName: string;
  recipients: BatchRecipient[];
}): Promise<{ id: string }> {
  const res = await fetch(`${BASE}/convai/batch-calling/submit`, {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      call_name: opts.callName,
      agent_id: process.env.ELEVENLABS_AGENT_ID,
      agent_phone_number_id: process.env.ELEVENLABS_PHONE_NUMBER_ID,
      recipients: opts.recipients.map((r) => ({
        phone_number: r.phone_number,
        conversation_initiation_client_data: {
          dynamic_variables: r.dynamic_variables,
        },
      })),
    }),
  });

  if (!res.ok) {
    throw new Error(`ElevenLabs batch error ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<{ id: string }>;
}
