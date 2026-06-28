import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyWebhook } from '@/lib/webhook-auth';

// Webhook post-llamada de ElevenLabs → actualiza la llamada en Supabase.
// El shape exacto del payload se confirma contra la API en vivo; leemos de forma
// tolerante los campos que necesitamos. Nunca se loguea el transcript (PII).
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifyWebhook(req, raw).ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let payload: Record<string, unknown> & {
    dynamic_variables?: { contact_id?: string };
    conversation_initiation_client_data?: { dynamic_variables?: { contact_id?: string } };
    metadata?: { contact_id?: string; call_duration_secs?: number };
    analysis?: { resultado?: string };
  };
  try {
    payload = JSON.parse(raw || '{}');
  } catch {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  const rawContactId =
    payload?.dynamic_variables?.contact_id ||
    payload?.conversation_initiation_client_data?.dynamic_variables?.contact_id ||
    payload?.metadata?.contact_id;
  const contactId = typeof rawContactId === 'string' && UUID.test(rawContactId) ? rawContactId : undefined;
  const conversationId =
    (typeof payload?.conversation_id === 'string' && payload.conversation_id) ||
    (typeof payload?.id === 'string' && payload.id) ||
    undefined;

  const VALID = ['conversion', 'email', 'transferido', 'no_interesado', 'sin_contacto'];
  const rawResultado = (payload?.resultado ?? payload?.analysis?.resultado) as string | undefined;
  const resultado = rawResultado && VALID.includes(rawResultado) ? rawResultado : undefined;

  const durationSeconds =
    (typeof payload?.metadata?.call_duration_secs === 'number' && payload.metadata.call_duration_secs) ||
    (typeof payload?.duration_seconds === 'number' && (payload.duration_seconds as number)) ||
    null;
  const transcript = (typeof payload?.transcript_text === 'string' && payload.transcript_text) ||
    (typeof payload?.transcript === 'string' && (payload.transcript as string)) || null;
  const status = (typeof payload?.status === 'string' && (payload.status as string)) || 'completed';

  if (!contactId && !conversationId) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  try {
    const sb = supabaseAdmin();
    const contactado = status === 'completed' && resultado !== 'sin_contacto';
    const update = {
      status,
      contactado,
      resultado: resultado ?? (contactado ? null : 'sin_contacto'),
      duration_seconds: durationSeconds,
      transcript,
      elevenlabs_conversation_id: conversationId ?? null,
      ended_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const q = sb.from('calls').update(update);
    const { error } = contactId
      ? await q.eq('contact_id', contactId)
      : await q.eq('elevenlabs_conversation_id', conversationId!);
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/webhooks/elevenlabs]', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
