import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyWebhook } from '@/lib/webhook-auth';

// Webhook post-llamada de ElevenLabs (evento "transcript" / post_call_transcription).
// El payload viene como { type, event_timestamp, data: { ... } }; los datos útiles
// están en `data`. El transcript es un ARRAY de turnos. El contact_id viaja en
// data.conversation_initiation_client_data.dynamic_variables.
//
// IMPORTANTE: este webhook SOLO rellena transcript/duración/conversation_id.
// NO toca `resultado` ni `contactado` — los fija la tool `registrar_resultado`
// durante la llamada; sobrescribirlos aquí los borraría.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Turn = { role?: string; message?: string };

function formatTranscript(t: unknown): string | null {
  if (typeof t === 'string') return t.trim() || null;
  if (!Array.isArray(t)) return null;
  const lines = (t as Turn[])
    .map((turn) => {
      const msg = (turn?.message || '').trim();
      if (!msg) return null;
      const who = turn?.role === 'user' ? 'Usuario' : 'Nina';
      return `${who}: ${msg}`;
    })
    .filter(Boolean);
  return lines.length ? lines.join('\n') : null;
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifyWebhook(req, raw).ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw || '{}');
  } catch {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  // Desempaquetar: el evento post-call envuelve los datos en `data`.
  const d = (body && typeof body.data === 'object' && body.data !== null
    ? (body.data as Record<string, unknown>)
    : body) as Record<string, unknown>;

  const cicd = (d.conversation_initiation_client_data as { dynamic_variables?: Record<string, unknown> } | undefined) || undefined;
  const dv = (cicd?.dynamic_variables || (d.dynamic_variables as Record<string, unknown> | undefined) || {}) as Record<string, unknown>;
  const rawContactId = (dv.contact_id ?? (d.metadata as { contact_id?: unknown } | undefined)?.contact_id) as unknown;
  const contactId = typeof rawContactId === 'string' && UUID.test(rawContactId) ? rawContactId : undefined;

  const conversationId = (typeof d.conversation_id === 'string' && d.conversation_id) || undefined;

  if (!contactId && !conversationId) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });

  const meta = (d.metadata as { call_duration_secs?: number } | undefined) || undefined;
  const duration = typeof meta?.call_duration_secs === 'number' ? meta.call_duration_secs : null;
  const transcript = formatTranscript(d.transcript);

  try {
    const sb = supabaseAdmin();
    const update = {
      transcript,
      duration_seconds: duration,
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
