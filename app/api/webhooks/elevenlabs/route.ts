import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/webhooks/elevenlabs
// Webhook post-llamada de ElevenLabs → actualiza la llamada en Supabase.
// Nota: el shape exacto del payload se confirma contra la API en vivo. Aquí
// leemos de forma tolerante los campos que necesitamos.
//
// `resultado` (conversion | email | transferido | no_interesado) lo fija el agente
// mediante su tool `registrar_resultado`, o se deriva del análisis post-llamada.
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => ({}));

    // Identificadores (tolerante a varias formas)
    const contactId: string | undefined =
      payload?.dynamic_variables?.contact_id ||
      payload?.conversation_initiation_client_data?.dynamic_variables?.contact_id ||
      payload?.metadata?.contact_id;
    const conversationId: string | undefined = payload?.conversation_id || payload?.id;

    const resultado: string | undefined = payload?.resultado || payload?.analysis?.resultado;
    const durationSeconds: number | undefined =
      payload?.metadata?.call_duration_secs || payload?.duration_seconds;
    const transcript: string | undefined = payload?.transcript_text || payload?.transcript;
    const status: string = payload?.status || 'completed';

    if (!contactId && !conversationId) {
      return NextResponse.json({ error: 'Falta contact_id o conversation_id' }, { status: 400 });
    }

    const sb = supabaseAdmin();
    const contactado = status === 'completed' && resultado !== 'sin_contacto';

    const update = {
      status,
      contactado,
      resultado: resultado ?? (contactado ? null : 'sin_contacto'),
      duration_seconds: durationSeconds ?? null,
      transcript: transcript ?? null,
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
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
